"use strict";
// Copyright (C) 2024 The Android Open Source Project
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
exports.VirtualOverlayCanvas = void 0;
const tslib_1 = require("tslib");
/**
 * VirtualCanvas - A Mithril Component for Virtual Canvas Rendering
 *
 * This module provides a Mithril component that acts as a scrolling container
 * for tall and/or wide content. It overlays a floating canvas on top of its
 * content rendered inside it, which stays in the viewport of scrolling
 * container element as the user scrolls, allowing for rendering of large-scale
 * visualizations which would be too large for a normal HTML canvas element.
 *
 * Key Features:
 * - Supports horizontal, vertical, or both axes scrolling, moving the canvas
 *   while the user scrolls to keep it in the viewport.
 * - Automatically handles canvas resizing using resize observers, including
 *   scaling for high DPI displays.
 * - Calls a callback whenever the canvas needs to be redrawn.
 */
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const disposable_stack_1 = require("../base/disposable_stack");
const dom_utils_1 = require("../base/dom_utils");
const logging_1 = require("../base/logging");
const virtual_canvas_1 = require("../base/virtual_canvas");
const CANVAS_CONTAINER_REF = 'canvas-container';
const CANVAS_OVERDRAW_PX = 300;
const CANVAS_TOLERANCE_PX = 100;
// This mithril component acts as scrolling container for tall and/or wide
// content. Adds a virtually scrolling canvas over the top of any child elements
// rendered inside it.
class VirtualOverlayCanvas {
    trash = new disposable_stack_1.DisposableStack();
    ctx;
    virtualCanvas;
    attrs;
    view({ attrs, children }) {
        this.attrs = attrs;
        return (0, mithril_1.default)('.pf-virtual-overlay-canvas', // The scrolling container
        {
            className: attrs.className,
            style: {
                overflowY: attrs.scrollAxes === 'both' || attrs.scrollAxes === 'y'
                    ? 'auto'
                    : 'visible',
                overflowX: attrs.scrollAxes === 'both' || attrs.scrollAxes === 'x'
                    ? 'auto'
                    : 'visible',
            },
        }, (0, mithril_1.default)('.pf-virtual-overlay-canvas__content', // Container for scrolling element, used for sizing the canvas
        children, 
        // Put canvas container after content so it appears on top. An actual
        // canvas element will be created inside here by the
        // VirtualCanvasHelper.
        (0, mithril_1.default)('.pf-virtual-overlay-canvas__canvas-container', {
            ref: CANVAS_CONTAINER_REF,
        })));
    }
    oncreate({ attrs, dom }) {
        const canvasContainerElement = (0, dom_utils_1.toHTMLElement)((0, logging_1.assertExists)((0, dom_utils_1.findRef)(dom, CANVAS_CONTAINER_REF)));
        // Create the virtual canvas inside the canvas container element. We assume
        // the scrolling container is the root level element of this component so we
        // can just use `dom`.
        const virtualCanvas = new virtual_canvas_1.VirtualCanvas(canvasContainerElement, dom, {
            overdrawPx: CANVAS_OVERDRAW_PX,
            tolerancePx: CANVAS_TOLERANCE_PX,
            overdrawAxes: attrs.scrollAxes,
        });
        this.trash.use(virtualCanvas);
        this.virtualCanvas = virtualCanvas;
        // Create the canvas rendering context
        this.ctx = (0, logging_1.assertExists)(virtualCanvas.canvasElement.getContext('2d'));
        // When the container resizes, we might need to resize the canvas. This can
        // be slow so we don't want to do it every render cycle. VirtualCanvas will
        // tell us when we need to do this.
        virtualCanvas.setCanvasResizeListener((canvas, width, height) => {
            const dpr = window.devicePixelRatio;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            (0, logging_1.assertExists)(this.attrs).onCanvasResized?.(virtualCanvas.size);
        });
        // Whenever the canvas changes size or moves around (e.g. when scrolling),
        // we'll need to trigger a re-render to keep canvas content aligned with the
        // DOM elements underneath.
        virtualCanvas.setLayoutShiftListener(() => {
            this.redrawCanvas();
        });
    }
    onremove() {
        this.trash.dispose();
    }
    redrawCanvas() {
        const ctx = (0, logging_1.assertExists)(this.ctx);
        const virtualCanvas = (0, logging_1.assertExists)(this.virtualCanvas);
        // Reset & clear canvas
        ctx.resetTransform();
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        // Adjust scaling according pixel ratio. This makes sure the canvas remains
        // sharp on high DPI screens.
        const dpr = window.devicePixelRatio;
        ctx.scale(dpr, dpr);
        // Align canvas rendering offset with the canvas container, not the actual
        // canvas. This means we can ignore the fact that we are using a virtual
        // canvas and just render assuming (0, 0) is at the top left of the canvas
        // container.
        ctx.translate(-virtualCanvas.canvasRect.left, -virtualCanvas.canvasRect.top);
        (0, logging_1.assertExists)(this.attrs).onCanvasRedraw?.({
            ctx,
            virtualCanvasSize: virtualCanvas.size,
            canvasRect: virtualCanvas.canvasRect,
        });
    }
}
exports.VirtualOverlayCanvas = VirtualOverlayCanvas;
//# sourceMappingURL=virtual_overlay_canvas.js.map