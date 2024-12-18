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
exports.ViewerPage = void 0;
exports.drawGridLines = drawGridLines;
exports.renderHoveredCursorVertical = renderHoveredCursorVertical;
exports.renderHoveredNoteVertical = renderHoveredNoteVertical;
exports.renderWakeupVertical = renderWakeupVertical;
exports.renderNoteVerticals = renderNoteVerticals;
const tslib_1 = require("tslib");
const color_convert_1 = require("color-convert");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const array_utils_1 = require("../../base/array_utils");
const canvas_utils_1 = require("../../base/canvas_utils");
const dom_utils_1 = require("../../base/dom_utils");
const logging_1 = require("../../base/logging");
const math_utils_1 = require("../../base/math_utils");
const time_1 = require("../../base/time");
const time_scale_1 = require("../../base/time_scale");
const app_impl_1 = require("../../core/app_impl");
const feature_flags_1 = require("../../core/feature_flags");
const raf_scheduler_1 = require("../../core/raf_scheduler");
const css_constants_1 = require("../css_constants");
const flow_events_renderer_1 = require("./flow_events_renderer");
const gridline_helper_1 = require("./gridline_helper");
const notes_panel_1 = require("./notes_panel");
const overview_timeline_panel_1 = require("./overview_timeline_panel");
const pan_and_zoom_handler_1 = require("./pan_and_zoom_handler");
const panel_container_1 = require("./panel_container");
const tab_panel_1 = require("./tab_panel");
const tickmark_panel_1 = require("./tickmark_panel");
const time_axis_panel_1 = require("./time_axis_panel");
const time_selection_panel_1 = require("./time_selection_panel");
const track_panel_1 = require("./track_panel");
const vertical_line_helper_1 = require("./vertical_line_helper");
const OVERVIEW_PANEL_FLAG = feature_flags_1.featureFlags.register({
    id: 'overviewVisible',
    name: 'Overview Panel',
    description: 'Show the panel providing an overview of the trace',
    defaultValue: true,
});
// Checks if the mousePos is within 3px of the start or end of the
// current selected time range.
function onTimeRangeBoundary(trace, timescale, mousePos) {
    const selection = trace.selection.selection;
    if (selection.kind === 'area') {
        // If frontend selectedArea exists then we are in the process of editing the
        // time range and need to use that value instead.
        const area = trace.timeline.selectedArea
            ? trace.timeline.selectedArea
            : selection;
        const start = timescale.timeToPx(area.start);
        const end = timescale.timeToPx(area.end);
        const startDrag = mousePos - css_constants_1.TRACK_SHELL_WIDTH;
        const startDistance = Math.abs(start - startDrag);
        const endDistance = Math.abs(end - startDrag);
        const range = 3 * window.devicePixelRatio;
        // We might be within 3px of both boundaries but we should choose
        // the closest one.
        if (startDistance < range && startDistance <= endDistance)
            return 'START';
        if (endDistance < range && endDistance <= startDistance)
            return 'END';
    }
    return null;
}
/**
 * Top-most level component for the viewer page. Holds tracks, brush timeline,
 * panels, and everything else that's part of the main trace viewer page.
 */
class ViewerPage {
    zoomContent;
    // Used to prevent global deselection if a pan/drag select occurred.
    keepCurrentSelection = false;
    overviewTimelinePanel;
    timeAxisPanel;
    timeSelectionPanel;
    notesPanel;
    tickmarkPanel;
    timelineWidthPx;
    selectedContainer;
    showPanningHint = false;
    PAN_ZOOM_CONTENT_REF = 'pan-and-zoom-content';
    constructor(vnode) {
        this.notesPanel = new notes_panel_1.NotesPanel(vnode.attrs.trace);
        this.timeAxisPanel = new time_axis_panel_1.TimeAxisPanel(vnode.attrs.trace);
        this.timeSelectionPanel = new time_selection_panel_1.TimeSelectionPanel(vnode.attrs.trace);
        this.tickmarkPanel = new tickmark_panel_1.TickmarkPanel(vnode.attrs.trace);
        this.overviewTimelinePanel = new overview_timeline_panel_1.OverviewTimelinePanel(vnode.attrs.trace);
        this.notesPanel = new notes_panel_1.NotesPanel(vnode.attrs.trace);
        this.timeSelectionPanel = new time_selection_panel_1.TimeSelectionPanel(vnode.attrs.trace);
    }
    oncreate({ dom, attrs }) {
        const panZoomElRaw = (0, dom_utils_1.findRef)(dom, this.PAN_ZOOM_CONTENT_REF);
        const panZoomEl = (0, dom_utils_1.toHTMLElement)((0, logging_1.assertExists)(panZoomElRaw));
        const { top: panTop } = panZoomEl.getBoundingClientRect();
        this.zoomContent = new pan_and_zoom_handler_1.PanAndZoomHandler({
            element: panZoomEl,
            onPanned: (pannedPx) => {
                const timeline = attrs.trace.timeline;
                if (this.timelineWidthPx === undefined)
                    return;
                this.keepCurrentSelection = true;
                const timescale = new time_scale_1.TimeScale(timeline.visibleWindow, {
                    left: 0,
                    right: this.timelineWidthPx,
                });
                const tDelta = timescale.pxToDuration(pannedPx);
                timeline.panVisibleWindow(tDelta);
            },
            onZoomed: (zoomedPositionPx, zoomRatio) => {
                const timeline = attrs.trace.timeline;
                // TODO(hjd): Avoid hardcoding TRACK_SHELL_WIDTH.
                // TODO(hjd): Improve support for zooming in overview timeline.
                const zoomPx = zoomedPositionPx - css_constants_1.TRACK_SHELL_WIDTH;
                const rect = dom.getBoundingClientRect();
                const centerPoint = zoomPx / (rect.width - css_constants_1.TRACK_SHELL_WIDTH);
                timeline.zoomVisibleWindow(1 - zoomRatio, centerPoint);
                raf_scheduler_1.raf.scheduleCanvasRedraw();
            },
            editSelection: (currentPx) => {
                if (this.timelineWidthPx === undefined)
                    return false;
                const timescale = new time_scale_1.TimeScale(attrs.trace.timeline.visibleWindow, {
                    left: 0,
                    right: this.timelineWidthPx,
                });
                return onTimeRangeBoundary(attrs.trace, timescale, currentPx) !== null;
            },
            onSelection: (dragStartX, dragStartY, prevX, currentX, currentY, editing) => {
                const traceTime = attrs.trace.traceInfo;
                const timeline = attrs.trace.timeline;
                if (this.timelineWidthPx === undefined)
                    return;
                // TODO(stevegolton): Don't get the windowSpan from globals, get it from
                // here!
                const { visibleWindow } = timeline;
                const timespan = visibleWindow.toTimeSpan();
                this.keepCurrentSelection = true;
                const timescale = new time_scale_1.TimeScale(timeline.visibleWindow, {
                    left: 0,
                    right: this.timelineWidthPx,
                });
                if (editing) {
                    const selection = attrs.trace.selection.selection;
                    if (selection.kind === 'area') {
                        const area = attrs.trace.timeline.selectedArea
                            ? attrs.trace.timeline.selectedArea
                            : selection;
                        let newTime = timescale
                            .pxToHpTime(currentX - css_constants_1.TRACK_SHELL_WIDTH)
                            .toTime();
                        // Have to check again for when one boundary crosses over the other.
                        const curBoundary = onTimeRangeBoundary(attrs.trace, timescale, prevX);
                        if (curBoundary == null)
                            return;
                        const keepTime = curBoundary === 'START' ? area.end : area.start;
                        // Don't drag selection outside of current screen.
                        if (newTime < keepTime) {
                            newTime = time_1.Time.max(newTime, timespan.start);
                        }
                        else {
                            newTime = time_1.Time.min(newTime, timespan.end);
                        }
                        // When editing the time range we always use the saved tracks,
                        // since these will not change.
                        timeline.selectArea(time_1.Time.max(time_1.Time.min(keepTime, newTime), traceTime.start), time_1.Time.min(time_1.Time.max(keepTime, newTime), traceTime.end), selection.trackUris);
                    }
                }
                else {
                    let startPx = Math.min(dragStartX, currentX) - css_constants_1.TRACK_SHELL_WIDTH;
                    let endPx = Math.max(dragStartX, currentX) - css_constants_1.TRACK_SHELL_WIDTH;
                    if (startPx < 0 && endPx < 0)
                        return;
                    startPx = (0, math_utils_1.clamp)(startPx, 0, this.timelineWidthPx);
                    endPx = (0, math_utils_1.clamp)(endPx, 0, this.timelineWidthPx);
                    timeline.selectArea(timescale.pxToHpTime(startPx).toTime('floor'), timescale.pxToHpTime(endPx).toTime('ceil'));
                    const absStartY = dragStartY + panTop;
                    const absCurrentY = currentY + panTop;
                    if (this.selectedContainer === undefined) {
                        for (const c of dom.querySelectorAll('.pf-panel-container')) {
                            const { top, bottom } = c.getBoundingClientRect();
                            if (top <= absStartY && absCurrentY <= bottom) {
                                const stack = (0, logging_1.assertExists)(c.querySelector('.pf-panel-stack'));
                                const stackTop = stack.getBoundingClientRect().top;
                                this.selectedContainer = {
                                    containerClass: Array.from(c.classList).filter((x) => x !== 'pf-panel-container')[0],
                                    dragStartAbsY: -stackTop + absStartY,
                                    dragEndAbsY: -stackTop + absCurrentY,
                                };
                                break;
                            }
                        }
                    }
                    else {
                        const c = (0, logging_1.assertExists)(dom.querySelector(`.${this.selectedContainer.containerClass}`));
                        const { top, bottom } = c.getBoundingClientRect();
                        const boundedCurrentY = Math.min(Math.max(top, absCurrentY), bottom);
                        const stack = (0, logging_1.assertExists)(c.querySelector('.pf-panel-stack'));
                        const stackTop = stack.getBoundingClientRect().top;
                        this.selectedContainer = {
                            ...this.selectedContainer,
                            dragEndAbsY: -stackTop + boundedCurrentY,
                        };
                    }
                    this.showPanningHint = true;
                }
                raf_scheduler_1.raf.scheduleCanvasRedraw();
            },
            endSelection: (edit) => {
                this.selectedContainer = undefined;
                const area = attrs.trace.timeline.selectedArea;
                // If we are editing we need to pass the current id through to ensure
                // the marked area with that id is also updated.
                if (edit) {
                    const selection = attrs.trace.selection.selection;
                    if (selection.kind === 'area' && area) {
                        attrs.trace.selection.selectArea({ ...area });
                    }
                }
                else if (area) {
                    attrs.trace.selection.selectArea({ ...area });
                }
                // Now the selection has ended we stored the final selected area in the
                // global state and can remove the in progress selection from the
                // timeline.
                attrs.trace.timeline.deselectArea();
                // Full redraw to color track shell.
                raf_scheduler_1.raf.scheduleFullRedraw();
            },
        });
    }
    onremove() {
        if (this.zoomContent)
            this.zoomContent[Symbol.dispose]();
    }
    view({ attrs }) {
        const scrollingPanels = renderToplevelPanels(attrs.trace);
        const result = (0, mithril_1.default)('.page.viewer-page', (0, mithril_1.default)(tab_panel_1.TabPanel, {
            trace: attrs.trace,
        }, (0, mithril_1.default)('.pan-and-zoom-content', {
            ref: this.PAN_ZOOM_CONTENT_REF,
            onclick: () => {
                // We don't want to deselect when panning/drag selecting.
                if (this.keepCurrentSelection) {
                    this.keepCurrentSelection = false;
                    return;
                }
                attrs.trace.selection.clear();
            },
        }, (0, mithril_1.default)('.pf-timeline-header', (0, mithril_1.default)(panel_container_1.PanelContainer, {
            trace: attrs.trace,
            className: 'header-panel-container',
            panels: (0, array_utils_1.removeFalsyValues)([
                OVERVIEW_PANEL_FLAG.get() && this.overviewTimelinePanel,
                this.timeAxisPanel,
                this.timeSelectionPanel,
                this.notesPanel,
                this.tickmarkPanel,
            ]),
            selectedYRange: this.getYRange('header-panel-container'),
        }), (0, mithril_1.default)('.scrollbar-spacer-vertical')), (0, mithril_1.default)(panel_container_1.PanelContainer, {
            trace: attrs.trace,
            className: 'pinned-panel-container',
            panels: app_impl_1.AppImpl.instance.isLoadingTrace
                ? []
                : attrs.trace.workspace.pinnedTracks.map((trackNode) => {
                    if (trackNode.uri) {
                        const tr = attrs.trace.tracks.getTrackRenderer(trackNode.uri);
                        return new track_panel_1.TrackPanel({
                            trace: attrs.trace,
                            reorderable: true,
                            node: trackNode,
                            trackRenderer: tr,
                            revealOnCreate: true,
                            indentationLevel: 0,
                            topOffsetPx: 0,
                        });
                    }
                    else {
                        return new track_panel_1.TrackPanel({
                            trace: attrs.trace,
                            node: trackNode,
                            revealOnCreate: true,
                            indentationLevel: 0,
                            topOffsetPx: 0,
                        });
                    }
                }),
            renderUnderlay: (ctx, size) => renderUnderlay(attrs.trace, ctx, size),
            renderOverlay: (ctx, size, panels) => renderOverlay(attrs.trace, ctx, size, panels, attrs.trace.workspace.pinnedTracksNode),
            selectedYRange: this.getYRange('pinned-panel-container'),
        }), (0, mithril_1.default)(panel_container_1.PanelContainer, {
            trace: attrs.trace,
            className: 'scrolling-panel-container',
            panels: app_impl_1.AppImpl.instance.isLoadingTrace ? [] : scrollingPanels,
            onPanelStackResize: (width) => {
                const timelineWidth = width - css_constants_1.TRACK_SHELL_WIDTH;
                this.timelineWidthPx = timelineWidth;
            },
            renderUnderlay: (ctx, size) => renderUnderlay(attrs.trace, ctx, size),
            renderOverlay: (ctx, size, panels) => renderOverlay(attrs.trace, ctx, size, panels, attrs.trace.workspace.tracks),
            selectedYRange: this.getYRange('scrolling-panel-container'),
        }))), this.showPanningHint && (0, mithril_1.default)(HelpPanningNotification));
        attrs.trace.tracks.flushOldTracks();
        return result;
    }
    getYRange(cls) {
        if (this.selectedContainer?.containerClass !== cls) {
            return undefined;
        }
        const { dragStartAbsY, dragEndAbsY } = this.selectedContainer;
        return {
            top: Math.min(dragStartAbsY, dragEndAbsY),
            bottom: Math.max(dragStartAbsY, dragEndAbsY),
        };
    }
}
exports.ViewerPage = ViewerPage;
function renderUnderlay(trace, ctx, canvasSize) {
    const env_1 = { stack: [], error: void 0, hasError: false };
    try {
        const size = {
            width: canvasSize.width - css_constants_1.TRACK_SHELL_WIDTH,
            height: canvasSize.height,
        };
        const _ = tslib_1.__addDisposableResource(env_1, (0, canvas_utils_1.canvasSave)(ctx), false);
        ctx.translate(css_constants_1.TRACK_SHELL_WIDTH, 0);
        const timewindow = trace.timeline.visibleWindow;
        const timescale = new time_scale_1.TimeScale(timewindow, { left: 0, right: size.width });
        // Just render the gridlines - these should appear underneath all tracks
        drawGridLines(trace, ctx, timewindow.toTimeSpan(), timescale, size);
    }
    catch (e_1) {
        env_1.error = e_1;
        env_1.hasError = true;
    }
    finally {
        tslib_1.__disposeResources(env_1);
    }
}
function renderOverlay(trace, ctx, canvasSize, panels, trackContainer) {
    const env_2 = { stack: [], error: void 0, hasError: false };
    try {
        const size = {
            width: canvasSize.width - css_constants_1.TRACK_SHELL_WIDTH,
            height: canvasSize.height,
        };
        const _ = tslib_1.__addDisposableResource(env_2, (0, canvas_utils_1.canvasSave)(ctx), false);
        ctx.translate(css_constants_1.TRACK_SHELL_WIDTH, 0);
        (0, canvas_utils_1.canvasClip)(ctx, 0, 0, size.width, size.height);
        // TODO(primiano): plumb the TraceImpl obj throughout the viwer page.
        (0, flow_events_renderer_1.renderFlows)(trace, ctx, size, panels, trackContainer);
        const timewindow = trace.timeline.visibleWindow;
        const timescale = new time_scale_1.TimeScale(timewindow, { left: 0, right: size.width });
        renderHoveredNoteVertical(trace, ctx, timescale, size);
        renderHoveredCursorVertical(trace, ctx, timescale, size);
        renderWakeupVertical(trace, ctx, timescale, size);
        renderNoteVerticals(trace, ctx, timescale, size);
    }
    catch (e_2) {
        env_2.error = e_2;
        env_2.hasError = true;
    }
    finally {
        tslib_1.__disposeResources(env_2);
    }
}
// Render the toplevel "scrolling" tracks and track groups
function renderToplevelPanels(trace) {
    return renderNodes(trace, trace.workspace.children, 0, 0);
}
// Given a list of tracks and a filter term, return a list pf panels filtered by
// the filter term
function renderNodes(trace, nodes, indent, topOffsetPx) {
    return nodes.flatMap((node) => {
        if (node.headless) {
            // Render children as if this node doesn't exist
            return renderNodes(trace, node.children, indent, topOffsetPx);
        }
        else if (node.children.length === 0) {
            return renderTrackPanel(trace, node, indent, topOffsetPx);
        }
        else {
            const headerPanel = renderTrackPanel(trace, node, indent, topOffsetPx);
            const isSticky = node.isSummary;
            const nextTopOffsetPx = isSticky
                ? topOffsetPx + headerPanel.heightPx
                : topOffsetPx;
            return {
                kind: 'group',
                collapsed: node.collapsed,
                header: headerPanel,
                sticky: isSticky, // && node.collapsed??
                topOffsetPx,
                childPanels: node.collapsed
                    ? []
                    : renderNodes(trace, node.children, indent + 1, nextTopOffsetPx),
            };
        }
    });
}
function renderTrackPanel(trace, trackNode, indent, topOffsetPx) {
    let tr = undefined;
    if (trackNode.uri) {
        tr = trace.tracks.getTrackRenderer(trackNode.uri);
    }
    return new track_panel_1.TrackPanel({
        trace,
        node: trackNode,
        trackRenderer: tr,
        indentationLevel: indent,
        topOffsetPx,
    });
}
function drawGridLines(trace, ctx, timespan, timescale, size) {
    ctx.strokeStyle = css_constants_1.TRACK_BORDER_COLOR;
    ctx.lineWidth = 1;
    if (size.width > 0 && timespan.duration > 0n) {
        const maxMajorTicks = (0, gridline_helper_1.getMaxMajorTicks)(size.width);
        const offset = trace.timeline.timestampOffset();
        for (const { type, time } of (0, gridline_helper_1.generateTicks)(timespan, maxMajorTicks, offset)) {
            const px = Math.floor(timescale.timeToPx(time));
            if (type === gridline_helper_1.TickType.MAJOR) {
                ctx.beginPath();
                ctx.moveTo(px + 0.5, 0);
                ctx.lineTo(px + 0.5, size.height);
                ctx.stroke();
            }
        }
    }
}
function renderHoveredCursorVertical(trace, ctx, timescale, size) {
    if (trace.timeline.hoverCursorTimestamp !== undefined) {
        (0, vertical_line_helper_1.drawVerticalLineAtTime)(ctx, timescale, trace.timeline.hoverCursorTimestamp, size.height, `#344596`);
    }
}
function renderHoveredNoteVertical(trace, ctx, timescale, size) {
    if (trace.timeline.hoveredNoteTimestamp !== undefined) {
        (0, vertical_line_helper_1.drawVerticalLineAtTime)(ctx, timescale, trace.timeline.hoveredNoteTimestamp, size.height, `#aaa`);
    }
}
function renderWakeupVertical(trace, ctx, timescale, size) {
    const selection = trace.selection.selection;
    if (selection.kind === 'track_event' && selection.wakeupTs) {
        (0, vertical_line_helper_1.drawVerticalLineAtTime)(ctx, timescale, selection.wakeupTs, size.height, `black`);
    }
}
function renderNoteVerticals(trace, ctx, timescale, size) {
    // All marked areas should have semi-transparent vertical lines
    // marking the start and end.
    for (const note of trace.notes.notes.values()) {
        if (note.noteType === 'SPAN') {
            const transparentNoteColor = 'rgba(' + color_convert_1.hex.rgb(note.color.substr(1)).toString() + ', 0.65)';
            (0, vertical_line_helper_1.drawVerticalLineAtTime)(ctx, timescale, note.start, size.height, transparentNoteColor, 1);
            (0, vertical_line_helper_1.drawVerticalLineAtTime)(ctx, timescale, note.end, size.height, transparentNoteColor, 1);
        }
        else if (note.noteType === 'DEFAULT') {
            (0, vertical_line_helper_1.drawVerticalLineAtTime)(ctx, timescale, note.timestamp, size.height, note.color);
        }
    }
}
class HelpPanningNotification {
    PANNING_HINT_KEY = 'dismissedPanningHint';
    dismissed = localStorage.getItem(this.PANNING_HINT_KEY) === 'true';
    view() {
        // Do not show the help notification in embedded mode because local storage
        // does not persist for iFrames. The host is responsible for communicating
        // to users that they can press '?' for help.
        if (app_impl_1.AppImpl.instance.embeddedMode || this.dismissed) {
            return;
        }
        return (0, mithril_1.default)('.helpful-hint', (0, mithril_1.default)('.hint-text', 'Are you trying to pan? Use the WASD keys or hold shift to click ' +
            "and drag. Press '?' for more help."), (0, mithril_1.default)('button.hint-dismiss-button', {
            onclick: () => {
                this.dismissed = true;
                localStorage.setItem(this.PANNING_HINT_KEY, 'true');
                raf_scheduler_1.raf.scheduleFullRedraw();
            },
        }, 'Dismiss'));
    }
}
//# sourceMappingURL=viewer_page.js.map