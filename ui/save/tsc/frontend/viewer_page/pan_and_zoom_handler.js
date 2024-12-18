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
exports.PanAndZoomHandler = exports.KeyMapping = void 0;
const disposable_stack_1 = require("../../base/disposable_stack");
const dom_utils_1 = require("../../base/dom_utils");
const drag_gesture_handler_1 = require("../../base/drag_gesture_handler");
const raf_scheduler_1 = require("../../core/raf_scheduler");
const animation_1 = require("../animation");
// When first starting to pan or zoom, move at least this many units.
const INITIAL_PAN_STEP_PX = 50;
const INITIAL_ZOOM_STEP = 0.1;
// The snappiness (spring constant) of pan and zoom animations [0..1].
const SNAP_FACTOR = 0.4;
// How much the velocity of a pan or zoom animation increases per millisecond.
const ACCELERATION_PER_MS = 1 / 50;
// The default duration of a pan or zoom animation. The animation may run longer
// if the user keeps holding the respective button down or shorter if the button
// is released. This value so chosen so that it is longer than the typical key
// repeat timeout to avoid breaks in the animation.
const DEFAULT_ANIMATION_DURATION = 700;
// The minimum number of units to pan or zoom per frame (before the
// ACCELERATION_PER_MS multiplier is applied).
const ZOOM_RATIO_PER_FRAME = 0.008;
const KEYBOARD_PAN_PX_PER_FRAME = 8;
// Scroll wheel animation steps.
const HORIZONTAL_WHEEL_PAN_SPEED = 1;
const WHEEL_ZOOM_SPEED = -0.02;
const EDITING_RANGE_CURSOR = 'ew-resize';
const DRAG_CURSOR = 'default';
const PAN_CURSOR = 'move';
// Use key mapping based on the 'KeyboardEvent.code' property vs the
// 'KeyboardEvent.key', because the former corresponds to the physical key
// position rather than the glyph printed on top of it, and is unaffected by
// the user's keyboard layout.
// For example, 'KeyW' always corresponds to the key at the physical location of
// the 'w' key on an English QWERTY keyboard, regardless of the user's keyboard
// layout, or at least the layout they have configured in their OS.
// Seeing as most users use the keys in the English QWERTY "WASD" position for
// controlling kb+mouse applications like games, it's a good bet that these are
// the keys most poeple are going to find natural for navigating the UI.
// See https://www.w3.org/TR/uievents-code/#key-alphanumeric-writing-system
var KeyMapping;
(function (KeyMapping) {
    KeyMapping["KEY_PAN_LEFT"] = "KeyA";
    KeyMapping["KEY_PAN_RIGHT"] = "KeyD";
    KeyMapping["KEY_ZOOM_IN"] = "KeyW";
    KeyMapping["KEY_ZOOM_OUT"] = "KeyS";
})(KeyMapping || (exports.KeyMapping = KeyMapping = {}));
var Pan;
(function (Pan) {
    Pan[Pan["None"] = 0] = "None";
    Pan[Pan["Left"] = -1] = "Left";
    Pan[Pan["Right"] = 1] = "Right";
})(Pan || (Pan = {}));
function keyToPan(e) {
    if (e.code === KeyMapping.KEY_PAN_LEFT)
        return Pan.Left;
    if (e.code === KeyMapping.KEY_PAN_RIGHT)
        return Pan.Right;
    return Pan.None;
}
var Zoom;
(function (Zoom) {
    Zoom[Zoom["None"] = 0] = "None";
    Zoom[Zoom["In"] = 1] = "In";
    Zoom[Zoom["Out"] = -1] = "Out";
})(Zoom || (Zoom = {}));
function keyToZoom(e) {
    if (e.code === KeyMapping.KEY_ZOOM_IN)
        return Zoom.In;
    if (e.code === KeyMapping.KEY_ZOOM_OUT)
        return Zoom.Out;
    return Zoom.None;
}
/**
 * Enables horizontal pan and zoom with mouse-based drag and WASD navigation.
 */
class PanAndZoomHandler {
    mousePositionX = null;
    boundOnMouseMove = this.onMouseMove.bind(this);
    boundOnWheel = this.onWheel.bind(this);
    boundOnKeyDown = this.onKeyDown.bind(this);
    boundOnKeyUp = this.onKeyUp.bind(this);
    shiftDown = false;
    panning = Pan.None;
    panOffsetPx = 0;
    targetPanOffsetPx = 0;
    zooming = Zoom.None;
    zoomRatio = 0;
    targetZoomRatio = 0;
    panAnimation = new animation_1.Animation(this.onPanAnimationStep.bind(this));
    zoomAnimation = new animation_1.Animation(this.onZoomAnimationStep.bind(this));
    element;
    onPanned;
    onZoomed;
    editSelection;
    onSelection;
    endSelection;
    trash;
    constructor({ element, onPanned, onZoomed, editSelection, onSelection, endSelection, }) {
        this.element = element;
        this.onPanned = onPanned;
        this.onZoomed = onZoomed;
        this.editSelection = editSelection;
        this.onSelection = onSelection;
        this.endSelection = endSelection;
        this.trash = new disposable_stack_1.DisposableStack();
        document.body.addEventListener('keydown', this.boundOnKeyDown);
        document.body.addEventListener('keyup', this.boundOnKeyUp);
        this.element.addEventListener('mousemove', this.boundOnMouseMove);
        this.element.addEventListener('wheel', this.boundOnWheel, { passive: true });
        this.trash.defer(() => {
            this.element.removeEventListener('wheel', this.boundOnWheel);
            this.element.removeEventListener('mousemove', this.boundOnMouseMove);
            document.body.removeEventListener('keyup', this.boundOnKeyUp);
            document.body.removeEventListener('keydown', this.boundOnKeyDown);
        });
        let prevX = -1;
        let dragStartX = -1;
        let dragStartY = -1;
        let edit = false;
        this.trash.use(new drag_gesture_handler_1.DragGestureHandler(this.element, 
        /* onDrag */ (x, y) => {
            if (this.shiftDown) {
                this.onPanned(prevX - x);
            }
            else {
                this.onSelection(dragStartX, dragStartY, prevX, x, y, edit);
            }
            prevX = x;
        }, 
        /* onDragStarted */ (x, y) => {
            prevX = x;
            dragStartX = x;
            dragStartY = y;
            edit = this.editSelection(x);
            // Set the cursor style based on where the cursor is when the drag
            // starts.
            if (edit) {
                this.element.style.cursor = EDITING_RANGE_CURSOR;
            }
            else if (!this.shiftDown) {
                this.element.style.cursor = DRAG_CURSOR;
            }
        }, 
        /* onDragFinished */ () => {
            // Reset the cursor now the drag has ended.
            this.element.style.cursor = this.shiftDown ? PAN_CURSOR : DRAG_CURSOR;
            dragStartX = -1;
            dragStartY = -1;
            this.endSelection(edit);
        }));
    }
    [Symbol.dispose]() {
        this.trash.dispose();
    }
    onPanAnimationStep(msSinceStartOfAnimation) {
        const step = (this.targetPanOffsetPx - this.panOffsetPx) * SNAP_FACTOR;
        if (this.panning !== Pan.None) {
            const velocity = 1 + msSinceStartOfAnimation * ACCELERATION_PER_MS;
            // Pan at least as fast as the snapping animation to avoid a
            // discontinuity.
            const targetStep = Math.max(KEYBOARD_PAN_PX_PER_FRAME * velocity, step);
            this.targetPanOffsetPx += this.panning * targetStep;
        }
        this.panOffsetPx += step;
        if (Math.abs(step) > 1e-1) {
            this.onPanned(step);
        }
        else {
            this.panAnimation.stop();
        }
    }
    onZoomAnimationStep(msSinceStartOfAnimation) {
        if (this.mousePositionX === null)
            return;
        const step = (this.targetZoomRatio - this.zoomRatio) * SNAP_FACTOR;
        if (this.zooming !== Zoom.None) {
            const velocity = 1 + msSinceStartOfAnimation * ACCELERATION_PER_MS;
            // Zoom at least as fast as the snapping animation to avoid a
            // discontinuity.
            const targetStep = Math.max(ZOOM_RATIO_PER_FRAME * velocity, step);
            this.targetZoomRatio += this.zooming * targetStep;
        }
        this.zoomRatio += step;
        if (Math.abs(step) > 1e-6) {
            this.onZoomed(this.mousePositionX, step);
        }
        else {
            this.zoomAnimation.stop();
        }
    }
    onMouseMove(e) {
        this.mousePositionX = (0, dom_utils_1.currentTargetOffset)(e).x;
        // Only change the cursor when hovering, the DragGestureHandler handles
        // changing the cursor during drag events. This avoids the problem of
        // the cursor flickering between styles if you drag fast and get too
        // far from the current time range.
        if (e.buttons === 0) {
            if (this.editSelection(this.mousePositionX)) {
                this.element.style.cursor = EDITING_RANGE_CURSOR;
            }
            else {
                this.element.style.cursor = this.shiftDown ? PAN_CURSOR : DRAG_CURSOR;
            }
        }
    }
    onWheel(e) {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
            this.onPanned(e.deltaX * HORIZONTAL_WHEEL_PAN_SPEED);
            raf_scheduler_1.raf.scheduleCanvasRedraw();
        }
        else if (e.ctrlKey && this.mousePositionX !== null) {
            const sign = e.deltaY < 0 ? -1 : 1;
            const deltaY = sign * Math.log2(1 + Math.abs(e.deltaY));
            this.onZoomed(this.mousePositionX, deltaY * WHEEL_ZOOM_SPEED);
            raf_scheduler_1.raf.scheduleCanvasRedraw();
        }
    }
    // Due to a bug in chrome, we get onKeyDown events fired where the payload is
    // not a KeyboardEvent when selecting an item from an autocomplete suggestion.
    // See https://issues.chromium.org/issues/41425904
    // Thus, we can't assume we get an KeyboardEvent and must check manually.
    onKeyDown(e) {
        if (e instanceof KeyboardEvent) {
            if ((0, dom_utils_1.elementIsEditable)(e.target))
                return;
            this.updateShift(e.shiftKey);
            if (e.ctrlKey || e.metaKey)
                return;
            if (keyToPan(e) !== Pan.None) {
                if (this.panning !== keyToPan(e)) {
                    this.panAnimation.stop();
                    this.panOffsetPx = 0;
                    this.targetPanOffsetPx = keyToPan(e) * INITIAL_PAN_STEP_PX;
                }
                this.panning = keyToPan(e);
                this.panAnimation.start(DEFAULT_ANIMATION_DURATION);
            }
            if (keyToZoom(e) !== Zoom.None) {
                if (this.zooming !== keyToZoom(e)) {
                    this.zoomAnimation.stop();
                    this.zoomRatio = 0;
                    this.targetZoomRatio = keyToZoom(e) * INITIAL_ZOOM_STEP;
                }
                this.zooming = keyToZoom(e);
                this.zoomAnimation.start(DEFAULT_ANIMATION_DURATION);
            }
        }
    }
    onKeyUp(e) {
        if (e instanceof KeyboardEvent) {
            this.updateShift(e.shiftKey);
            if (e.ctrlKey || e.metaKey)
                return;
            if (keyToPan(e) === this.panning) {
                this.panning = Pan.None;
            }
            if (keyToZoom(e) === this.zooming) {
                this.zooming = Zoom.None;
            }
        }
    }
    // TODO(hjd): Move this shift handling into the viewer page.
    updateShift(down) {
        if (down === this.shiftDown)
            return;
        this.shiftDown = down;
        if (this.shiftDown) {
            this.element.style.cursor = PAN_CURSOR;
        }
        else if (this.mousePositionX !== null) {
            this.element.style.cursor = DRAG_CURSOR;
        }
    }
}
exports.PanAndZoomHandler = PanAndZoomHandler;
//# sourceMappingURL=pan_and_zoom_handler.js.map