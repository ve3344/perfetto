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
exports.SplitPanel = exports.SplitPanelDrawerVisibility = void 0;
exports.toggleVisibility = toggleVisibility;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const disposable_stack_1 = require("../base/disposable_stack");
const dom_utils_1 = require("../base/dom_utils");
const drag_gesture_handler_1 = require("../base/drag_gesture_handler");
const logging_1 = require("../base/logging");
const button_1 = require("./button");
var SplitPanelDrawerVisibility;
(function (SplitPanelDrawerVisibility) {
    SplitPanelDrawerVisibility[SplitPanelDrawerVisibility["VISIBLE"] = 0] = "VISIBLE";
    SplitPanelDrawerVisibility[SplitPanelDrawerVisibility["FULLSCREEN"] = 1] = "FULLSCREEN";
    SplitPanelDrawerVisibility[SplitPanelDrawerVisibility["COLLAPSED"] = 2] = "COLLAPSED";
})(SplitPanelDrawerVisibility || (exports.SplitPanelDrawerVisibility = SplitPanelDrawerVisibility = {}));
/**
 * A container that fills its parent container, splitting into two adjustable
 * horizontal sections. The upper half is reserved for the main content and any
 * children are placed here, and the lower half should be considered a drawer,
 * the `drawerContent` attribute can be used to define what goes here.
 *
 * The drawer features a handle that can be dragged to adjust the height of the
 * drawer, and also features buttons to maximize and minimise the drawer.
 *
 * Content can also optionally be displayed on the handle itself to the left of
 * the buttons.
 *
 * The layout looks like this:
 *
 * ┌──────────────────────────────────────────────────────────────────┐
 * │pf-split-panel                                                    │
 * │┌────────────────────────────────────────────────────────────────┐|
 * ││pf-split-panel__main                                            ││
 * |└────────────────────────────────────────────────────────────────┘|
 * │┌────────────────────────────────────────────────────────────────┐|
 * ││pf-split-panel__handle                                          ││
 * │|┌─────────────────────────────────┐┌───────────────────────────┐||
 * |||pf-split-panel__handle-content   ||pf-button-bar              |||
 * ||└─────────────────────────────────┘└───────────────────────────┘||
 * |└────────────────────────────────────────────────────────────────┘|
 * │┌────────────────────────────────────────────────────────────────┐|
 * ││pf-split-panel__drawer                                          ││
 * |└────────────────────────────────────────────────────────────────┘|
 * └──────────────────────────────────────────────────────────────────┘
 */
class SplitPanel {
    trash = new disposable_stack_1.DisposableStack();
    // The actual height of the vdom node. It matches resizableHeight if VISIBLE,
    // 0 if COLLAPSED, fullscreenHeight if FULLSCREEN.
    height = 0;
    // The height when the panel is 'VISIBLE'.
    resizableHeight;
    // The height when the panel is 'FULLSCREEN'.
    fullscreenHeight = 0;
    // Current visibility state (if not controlled).
    visibility = SplitPanelDrawerVisibility.VISIBLE;
    constructor({ attrs }) {
        this.resizableHeight = attrs.startingHeight ?? 100;
    }
    view({ attrs, children }) {
        const { visibility = this.visibility, className, handleContent, onVisibilityChange, drawerContent, } = attrs;
        switch (visibility) {
            case SplitPanelDrawerVisibility.VISIBLE:
                this.height = Math.min(Math.max(this.resizableHeight, 0), this.fullscreenHeight);
                break;
            case SplitPanelDrawerVisibility.FULLSCREEN:
                this.height = this.fullscreenHeight;
                break;
            case SplitPanelDrawerVisibility.COLLAPSED:
                this.height = 0;
                break;
        }
        return (0, mithril_1.default)('.pf-split-panel', {
            className,
        }, 
        // Note: Using BEM class naming conventions: See https://getbem.com/
        (0, mithril_1.default)('.pf-split-panel__main', children), (0, mithril_1.default)('.pf-split-panel__handle', (0, mithril_1.default)('.pf-split-panel__handle-content', handleContent), this.renderTabResizeButtons(visibility, onVisibilityChange)), (0, mithril_1.default)('.pf-split-panel__drawer', {
            style: { height: `${this.height}px` },
        }, drawerContent));
    }
    oncreate(vnode) {
        let dragStartY = 0;
        let heightWhenDragStarted = 0;
        const handle = (0, dom_utils_1.toHTMLElement)((0, logging_1.assertExists)(vnode.dom.querySelector('.pf-split-panel__handle')));
        this.trash.use(new drag_gesture_handler_1.DragGestureHandler(handle, 
        /* onDrag */ (_x, y) => {
            const deltaYSinceDragStart = dragStartY - y;
            this.resizableHeight = heightWhenDragStarted + deltaYSinceDragStart;
            mithril_1.default.redraw();
        }, 
        /* onDragStarted */ (_x, y) => {
            this.resizableHeight = this.height;
            heightWhenDragStarted = this.height;
            dragStartY = y;
            this.updatePanelVisibility(SplitPanelDrawerVisibility.VISIBLE, vnode.attrs.onVisibilityChange);
        }, 
        /* onDragFinished */ () => { }));
        const parent = (0, logging_1.assertExists)(vnode.dom.parentElement);
        this.fullscreenHeight = parent.clientHeight;
        const resizeObs = new ResizeObserver(() => {
            this.fullscreenHeight = parent.clientHeight;
            mithril_1.default.redraw();
        });
        resizeObs.observe(parent);
        this.trash.defer(() => resizeObs.disconnect());
    }
    onremove() {
        this.trash.dispose();
    }
    renderTabResizeButtons(visibility, setVisibility) {
        const isClosed = visibility === SplitPanelDrawerVisibility.COLLAPSED;
        return (0, mithril_1.default)(button_1.ButtonBar, (0, mithril_1.default)(button_1.Button, {
            title: 'Open fullscreen',
            disabled: visibility === SplitPanelDrawerVisibility.FULLSCREEN,
            icon: 'vertical_align_top',
            compact: true,
            onclick: () => {
                this.updatePanelVisibility(SplitPanelDrawerVisibility.FULLSCREEN, setVisibility);
            },
        }), (0, mithril_1.default)(button_1.Button, {
            onclick: () => {
                this.updatePanelVisibility(toggleVisibility(visibility), setVisibility);
            },
            title: isClosed ? 'Show panel' : 'Hide panel',
            icon: isClosed ? 'keyboard_arrow_up' : 'keyboard_arrow_down',
            compact: true,
        }));
    }
    updatePanelVisibility(visibility, setVisibility) {
        this.visibility = visibility;
        setVisibility?.(visibility);
    }
}
exports.SplitPanel = SplitPanel;
function toggleVisibility(visibility) {
    switch (visibility) {
        case SplitPanelDrawerVisibility.COLLAPSED:
        case SplitPanelDrawerVisibility.FULLSCREEN:
            return SplitPanelDrawerVisibility.VISIBLE;
        case SplitPanelDrawerVisibility.VISIBLE:
            return SplitPanelDrawerVisibility.COLLAPSED;
        default:
            (0, logging_1.assertUnreachable)(visibility);
    }
}
//# sourceMappingURL=split_panel.js.map