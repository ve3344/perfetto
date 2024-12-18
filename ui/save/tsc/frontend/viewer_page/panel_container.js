"use strict";
// Copyright (C) 2018 The Android Open Source Project
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.PanelContainer = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const canvas_utils_1 = require("../../base/canvas_utils");
const disposable_stack_1 = require("../../base/disposable_stack");
const dom_utils_1 = require("../../base/dom_utils");
const logging_1 = require("../../base/logging");
const resize_observer_1 = require("../../base/resize_observer");
const time_scale_1 = require("../../base/time_scale");
const virtual_canvas_1 = require("../../base/virtual_canvas");
const perf_stats_1 = require("../../core/perf_stats");
const raf_scheduler_1 = require("../../core/raf_scheduler");
const css_constants_1 = require("../css_constants");
const CANVAS_OVERDRAW_PX = 300;
const CANVAS_TOLERANCE_PX = 100;
class PanelContainer {
    trace;
    attrs;
    // Updated every render cycle in the view() hook
    panelById = new Map();
    // Updated every render cycle in the oncreate/onupdate hook
    panelInfos = [];
    perfStatsEnabled = false;
    panelPerfStats = new WeakMap();
    perfStats = {
        totalPanels: 0,
        panelsOnCanvas: 0,
        renderStats: new perf_stats_1.PerfStats(10),
    };
    ctx;
    trash = new disposable_stack_1.DisposableStack();
    OVERLAY_REF = 'overlay';
    PANEL_STACK_REF = 'panel-stack';
    constructor({ attrs }) {
        this.attrs = attrs;
        this.trace = attrs.trace;
        this.trash.use(raf_scheduler_1.raf.addCanvasRedrawCallback(() => this.renderCanvas()));
        this.trash.use(attrs.trace.perfDebugging.addContainer(this));
    }
    getPanelsInRegion(startX, endX, startY, endY) {
        const minX = Math.min(startX, endX);
        const maxX = Math.max(startX, endX);
        const minY = Math.min(startY, endY);
        const maxY = Math.max(startY, endY);
        const panels = [];
        for (let i = 0; i < this.panelInfos.length; i++) {
            const pos = this.panelInfos[i];
            const realPosX = pos.clientX - css_constants_1.TRACK_SHELL_WIDTH;
            if (realPosX + pos.width >= minX &&
                realPosX <= maxX &&
                pos.absY + pos.height >= minY &&
                pos.absY <= maxY &&
                pos.panel.selectable) {
                panels.push(pos.panel);
            }
        }
        return panels;
    }
    // This finds the tracks covered by the in-progress area selection. When
    // editing areaY is not set, so this will not be used.
    handleAreaSelection() {
        const { selectedYRange } = this.attrs;
        const area = this.trace.timeline.selectedArea;
        if (area === undefined ||
            selectedYRange === undefined ||
            this.panelInfos.length === 0) {
            return;
        }
        // TODO(stevegolton): We shouldn't know anything about visible time scale
        // right now, that's a job for our parent, but we can put one together so we
        // don't have to refactor this entire bit right now...
        const visibleTimeScale = new time_scale_1.TimeScale(this.trace.timeline.visibleWindow, {
            left: 0,
            right: this.virtualCanvas.size.width - css_constants_1.TRACK_SHELL_WIDTH,
        });
        // The Y value is given from the top of the pan and zoom region, we want it
        // from the top of the panel container. The parent offset corrects that.
        const panels = this.getPanelsInRegion(visibleTimeScale.timeToPx(area.start), visibleTimeScale.timeToPx(area.end), selectedYRange.top, selectedYRange.bottom);
        // Get the track ids from the panels.
        const trackUris = [];
        for (const panel of panels) {
            if (panel.trackNode) {
                if (panel.trackNode.isSummary) {
                    const groupNode = panel.trackNode;
                    // Select a track group and all child tracks if it is collapsed
                    if (groupNode.collapsed) {
                        for (const track of groupNode.flatTracks) {
                            track.uri && trackUris.push(track.uri);
                        }
                    }
                }
                else {
                    panel.trackNode.uri && trackUris.push(panel.trackNode.uri);
                }
            }
        }
        this.trace.timeline.selectArea(area.start, area.end, trackUris);
    }
    virtualCanvas;
    oncreate(vnode) {
        const { dom, attrs } = vnode;
        const overlayElement = (0, dom_utils_1.toHTMLElement)((0, logging_1.assertExists)((0, dom_utils_1.findRef)(dom, this.OVERLAY_REF)));
        const virtualCanvas = new virtual_canvas_1.VirtualCanvas(overlayElement, dom, {
            overdrawAxes: 'y',
            overdrawPx: CANVAS_OVERDRAW_PX,
            tolerancePx: CANVAS_TOLERANCE_PX,
        });
        this.trash.use(virtualCanvas);
        this.virtualCanvas = virtualCanvas;
        const ctx = virtualCanvas.canvasElement.getContext('2d');
        if (!ctx) {
            throw Error('Cannot create canvas context');
        }
        this.ctx = ctx;
        virtualCanvas.setCanvasResizeListener((canvas, width, height) => {
            const dpr = window.devicePixelRatio;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
        });
        virtualCanvas.setLayoutShiftListener(() => {
            this.renderCanvas();
        });
        this.onupdate(vnode);
        const panelStackElement = (0, dom_utils_1.toHTMLElement)((0, logging_1.assertExists)((0, dom_utils_1.findRef)(dom, this.PANEL_STACK_REF)));
        // Listen for when the panel stack changes size
        this.trash.use(new resize_observer_1.SimpleResizeObserver(panelStackElement, () => {
            attrs.onPanelStackResize?.(panelStackElement.clientWidth, panelStackElement.clientHeight);
        }));
    }
    onremove() {
        this.trash.dispose();
    }
    renderPanel(node, panelId, htmlAttrs) {
        (0, logging_1.assertFalse)(this.panelById.has(panelId));
        this.panelById.set(panelId, node);
        return (0, mithril_1.default)(`.pf-panel`, { ...htmlAttrs, 'data-panel-id': panelId }, node.render());
    }
    // Render a tree of panels into one vnode. Argument `path` is used to build
    // `key` attribute for intermediate tree vnodes: otherwise Mithril internals
    // will complain about keyed and non-keyed vnodes mixed together.
    renderTree(node, panelId) {
        if (node.kind === 'group') {
            const style = {
                position: 'sticky',
                top: `${node.topOffsetPx}px`,
                zIndex: `${2000 - node.topOffsetPx}`,
            };
            return (0, mithril_1.default)('div.pf-panel-group', node.header &&
                this.renderPanel(node.header, `${panelId}-header`, {
                    style: !node.collapsed && node.sticky ? style : {},
                }), ...node.childPanels.map((child, index) => this.renderTree(child, `${panelId}-${index}`)));
        }
        return this.renderPanel(node, panelId);
    }
    view({ attrs }) {
        this.attrs = attrs;
        this.panelById.clear();
        const children = attrs.panels.map((panel, index) => this.renderTree(panel, `${index}`));
        return (0, mithril_1.default)('.pf-panel-container', { className: attrs.className }, (0, mithril_1.default)('.pf-panel-stack', { ref: this.PANEL_STACK_REF }, (0, mithril_1.default)('.pf-overlay', { ref: this.OVERLAY_REF }), children));
    }
    onupdate({ dom }) {
        this.readPanelRectsFromDom(dom);
    }
    readPanelRectsFromDom(dom) {
        this.panelInfos = [];
        const panel = dom.querySelectorAll('.pf-panel');
        const panels = (0, logging_1.assertExists)((0, dom_utils_1.findRef)(dom, this.PANEL_STACK_REF));
        const { top } = panels.getBoundingClientRect();
        panel.forEach((panelElement) => {
            const panelHTMLElement = (0, dom_utils_1.toHTMLElement)(panelElement);
            const panelId = (0, logging_1.assertExists)(panelHTMLElement.dataset.panelId);
            const panel = (0, logging_1.assertExists)(this.panelById.get(panelId));
            // NOTE: the id can be undefined for singletons like overview timeline.
            const rect = panelElement.getBoundingClientRect();
            this.panelInfos.push({
                trackNode: panel.trackNode,
                height: rect.height,
                width: rect.width,
                clientX: rect.x,
                clientY: rect.y,
                absY: rect.y - top,
                panel,
            });
        });
    }
    renderCanvas() {
        if (!this.ctx)
            return;
        if (!this.virtualCanvas)
            return;
        const ctx = this.ctx;
        const vc = this.virtualCanvas;
        const redrawStart = performance.now();
        ctx.resetTransform();
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        const dpr = window.devicePixelRatio;
        ctx.scale(dpr, dpr);
        ctx.translate(-vc.canvasRect.left, -vc.canvasRect.top);
        this.handleAreaSelection();
        const totalRenderedPanels = this.renderPanels(ctx, vc);
        this.drawTopLayerOnCanvas(ctx, vc);
        // Collect performance as the last thing we do.
        const redrawDur = performance.now() - redrawStart;
        this.updatePerfStats(redrawDur, this.panelInfos.length, totalRenderedPanels);
    }
    renderPanels(ctx, vc) {
        this.attrs.renderUnderlay?.(ctx, vc.size);
        let panelTop = 0;
        let totalOnCanvas = 0;
        const renderedPanels = Array();
        for (let i = 0; i < this.panelInfos.length; i++) {
            const { panel, width: panelWidth, height: panelHeight, } = this.panelInfos[i];
            const panelRect = {
                left: 0,
                top: panelTop,
                bottom: panelTop + panelHeight,
                right: panelWidth,
            };
            const panelSize = { width: panelWidth, height: panelHeight };
            if (vc.overlapsCanvas(panelRect)) {
                totalOnCanvas++;
                ctx.save();
                ctx.translate(0, panelTop);
                (0, canvas_utils_1.canvasClip)(ctx, 0, 0, panelWidth, panelHeight);
                const beforeRender = performance.now();
                panel.renderCanvas(ctx, panelSize);
                this.updatePanelStats(i, panel, performance.now() - beforeRender, ctx, panelSize);
                ctx.restore();
            }
            renderedPanels.push({
                panel,
                rect: {
                    top: panelTop,
                    bottom: panelTop + panelHeight,
                    left: 0,
                    right: panelWidth,
                },
            });
            panelTop += panelHeight;
        }
        this.attrs.renderOverlay?.(ctx, vc.size, renderedPanels);
        return totalOnCanvas;
    }
    // The panels each draw on the canvas but some details need to be drawn across
    // the whole canvas rather than per panel.
    drawTopLayerOnCanvas(ctx, vc) {
        const { selectedYRange } = this.attrs;
        const area = this.trace.timeline.selectedArea;
        if (area === undefined || selectedYRange === undefined) {
            return;
        }
        if (this.panelInfos.length === 0 || area.trackUris.length === 0) {
            return;
        }
        // Find the minY and maxY of the selected tracks in this panel container.
        let selectedTracksMinY = selectedYRange.top;
        let selectedTracksMaxY = selectedYRange.bottom;
        for (let i = 0; i < this.panelInfos.length; i++) {
            const trackUri = this.panelInfos[i].trackNode?.uri;
            if (trackUri && area.trackUris.includes(trackUri)) {
                selectedTracksMinY = Math.min(selectedTracksMinY, this.panelInfos[i].absY);
                selectedTracksMaxY = Math.max(selectedTracksMaxY, this.panelInfos[i].absY + this.panelInfos[i].height);
            }
        }
        // TODO(stevegolton): We shouldn't know anything about visible time scale
        // right now, that's a job for our parent, but we can put one together so we
        // don't have to refactor this entire bit right now...
        const visibleTimeScale = new time_scale_1.TimeScale(this.trace.timeline.visibleWindow, {
            left: 0,
            right: vc.size.width - css_constants_1.TRACK_SHELL_WIDTH,
        });
        const startX = visibleTimeScale.timeToPx(area.start);
        const endX = visibleTimeScale.timeToPx(area.end);
        ctx.save();
        ctx.strokeStyle = css_constants_1.SELECTION_STROKE_COLOR;
        ctx.lineWidth = 1;
        ctx.translate(css_constants_1.TRACK_SHELL_WIDTH, 0);
        // Clip off any drawing happening outside the bounds of the timeline area
        (0, canvas_utils_1.canvasClip)(ctx, 0, 0, vc.size.width - css_constants_1.TRACK_SHELL_WIDTH, vc.size.height);
        ctx.strokeRect(startX, selectedTracksMaxY, endX - startX, selectedTracksMinY - selectedTracksMaxY);
        ctx.restore();
    }
    updatePanelStats(panelIndex, panel, renderTime, ctx, size) {
        if (!this.perfStatsEnabled)
            return;
        let renderStats = this.panelPerfStats.get(panel);
        if (renderStats === undefined) {
            renderStats = new perf_stats_1.PerfStats();
            this.panelPerfStats.set(panel, renderStats);
        }
        renderStats.addValue(renderTime);
        // Draw a green box around the whole panel
        ctx.strokeStyle = 'rgba(69, 187, 73, 0.5)';
        const lineWidth = 1;
        ctx.lineWidth = lineWidth;
        ctx.strokeRect(lineWidth / 2, lineWidth / 2, size.width - lineWidth, size.height - lineWidth);
        const statW = 300;
        ctx.fillStyle = 'hsl(97, 100%, 96%)';
        ctx.fillRect(size.width - statW, size.height - 20, statW, 20);
        ctx.fillStyle = 'hsla(122, 77%, 22%)';
        const statStr = `Panel ${panelIndex + 1} | ` + (0, perf_stats_1.runningStatStr)(renderStats);
        ctx.fillText(statStr, size.width - statW, size.height - 10);
    }
    updatePerfStats(renderTime, totalPanels, panelsOnCanvas) {
        if (!this.perfStatsEnabled)
            return;
        this.perfStats.renderStats.addValue(renderTime);
        this.perfStats.totalPanels = totalPanels;
        this.perfStats.panelsOnCanvas = panelsOnCanvas;
    }
    setPerfStatsEnabled(enable) {
        this.perfStatsEnabled = enable;
    }
    renderPerfStats() {
        return [
            (0, mithril_1.default)('div', `${this.perfStats.totalPanels} panels, ` +
                `${this.perfStats.panelsOnCanvas} on canvas.`),
            (0, mithril_1.default)('div', (0, perf_stats_1.runningStatStr)(this.perfStats.renderStats)),
        ];
    }
}
exports.PanelContainer = PanelContainer;
//# sourceMappingURL=panel_container.js.map