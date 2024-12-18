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
exports.ZonedInteractionHandler = void 0;
/**
 * This module provides an extensible, declarative interaction manager for
 * handling high level mouse and keyboard interactions within an HTML element,
 * using zones to define areas with different configurations.
 *
 * This is typically used on canvas, where we want to create draggable handles,
 * or area selections, but there are no fine-grained DOM elements we can attach
 * to.
 *
 * It supports:
 * - Specifying a list of zones, which can specify their own mouse event
 *   handlers.
 * - Changing the cursor when hovering over a zone.
 * - High level drag event handlers with customizable drag thresholds, 'while
 *   dragging' cursors and keyboard modifiers.
 * - Click event handlers, which integrate nicely with drag events (i.e. failed
 *   drag events turn into clicks).
 * - Mouse wheel events.
 *
 * How it works:
 *
 * For events that fire on the given target element, the list of zones is
 * searched from top to bottom until a zone that handles that event is found.
 *
 * The list of zones is declarative, and is designed to be updated frequently
 * i.e. every frame. This means that long running events such as drags can be
 * can outlive the a single update cycle. Each zone must specify an id which is
 * a unique string used to link up the new zones with ongoing drag events, and
 * thus use the new callbacks. This is important as new callbacks might capture
 * different data.
 */
const array_utils_1 = require("./array_utils");
const disposable_stack_1 = require("./disposable_stack");
const dom_utils_1 = require("./dom_utils");
const geom_1 = require("./geom");
class ZonedInteractionHandler {
    target;
    trash = new disposable_stack_1.DisposableStack();
    currentMousePosition;
    zones = [];
    currentDrag;
    shiftHeld = false;
    constructor(target) {
        this.target = target;
        this.bindEvent(this.target, 'mousedown', this.onMouseDown.bind(this));
        this.bindEvent(document, 'mousemove', this.onMouseMove.bind(this));
        this.bindEvent(document, 'mouseup', this.onMouseUp.bind(this));
        this.bindEvent(document, 'keydown', this.onKeyDown.bind(this));
        this.bindEvent(document, 'keyup', this.onKeyUp.bind(this));
        this.bindEvent(this.target, 'wheel', this.handleWheel.bind(this));
    }
    [Symbol.dispose]() {
        this.trash.dispose();
    }
    /**
     * Update the list of zones and their configurations. Each zone is processed
     * from the start to the end of the list, so zones which appear earlier in the
     * list will be chosen before those later in the list.
     *
     * Zones can be falsy, which allows the simple conditional zones to be defined
     * using short circuits, similar to mithril. Falsy zones are simply ignored.
     *
     * @param zones - The list of zones to configure interactions areas and their
     * configurations.
     */
    update(zones) {
        this.zones = (0, array_utils_1.removeFalsyValues)(zones);
        this.updateCursor();
    }
    // Utility function to bind an event listener to a DOM element and add it to
    // the trash.
    bindEvent(element, event, handler) {
        this.trash.use((0, dom_utils_1.bindEventListener)(element, event, handler));
    }
    onMouseDown(e) {
        const mousePositionClient = new geom_1.Vector2D({ x: e.clientX, y: e.clientY });
        const mouse = mousePositionClient.sub(this.target.getBoundingClientRect());
        const zone = this.findZone((z) => z.drag && this.hitTestZone(z, mouse));
        if (zone) {
            this.currentDrag = {
                zoneId: zone.id,
                startingMousePosition: mouse,
                currentMousePosition: mouse,
                previouslyNotifiedPosition: mouse,
            };
            this.updateCursor();
        }
    }
    onMouseMove(e) {
        const mousePositionClient = new geom_1.Vector2D({ x: e.clientX, y: e.clientY });
        const mousePosition = mousePositionClient.sub(this.target.getBoundingClientRect());
        this.currentMousePosition = mousePosition;
        this.updateCursor();
        const currentDrag = this.currentDrag;
        if (currentDrag) {
            currentDrag.currentMousePosition = mousePosition;
            const delta = currentDrag.startingMousePosition.sub(mousePosition);
            const dragConfig = this.findZoneById(currentDrag.zoneId)?.drag;
            if (dragConfig &&
                delta.manhattanDistance >= (dragConfig?.minDistance ?? 0)) {
                dragConfig.onDrag?.({
                    dragCurrent: mousePosition,
                    dragStart: currentDrag.startingMousePosition,
                    dragDelta: delta,
                    deltaSinceLastEvent: mousePosition.sub(currentDrag.previouslyNotifiedPosition),
                }, this.target);
                currentDrag.previouslyNotifiedPosition = mousePosition;
            }
        }
    }
    onMouseUp(e) {
        const mousePositionClient = new geom_1.Vector2D({ x: e.clientX, y: e.clientY });
        const mousePosition = mousePositionClient.sub(this.target.getBoundingClientRect());
        const currentDrag = this.currentDrag;
        if (currentDrag) {
            const delta = currentDrag.startingMousePosition.sub(mousePosition);
            const dragConfig = this.findZoneById(currentDrag.zoneId)?.drag;
            if (dragConfig &&
                delta.manhattanDistance >= (dragConfig?.minDistance ?? 0)) {
                this.handleDrag(this.target, currentDrag, mousePosition, e, dragConfig);
            }
            else {
                this.handleClick(this.target, e);
            }
            this.currentDrag = undefined;
            this.updateCursor();
        }
        else {
            this.handleClick(this.target, e);
        }
    }
    onKeyDown(e) {
        this.shiftHeld = e.shiftKey;
        this.updateCursor();
    }
    onKeyUp(e) {
        this.shiftHeld = e.shiftKey;
        this.updateCursor();
    }
    handleWheel(e) {
        const mousePositionClient = new geom_1.Vector2D({ x: e.clientX, y: e.clientY });
        const mouse = mousePositionClient.sub(this.target.getBoundingClientRect());
        const zone = this.findZone((z) => z.onWheel && this.hitTestZone(z, mouse));
        zone?.onWheel?.({
            position: mouse,
            deltaX: e.deltaX,
            deltaY: e.deltaY,
        });
    }
    handleDrag(element, currentDrag, x, e, dragConfig) {
        // Update the current position
        currentDrag.currentMousePosition = x;
        const dragEvent = {
            dragStart: currentDrag.startingMousePosition,
            dragCurrent: x,
            dragDelta: new geom_1.Vector2D({ x: e.movementX, y: e.movementY }),
            deltaSinceLastEvent: new geom_1.Vector2D({ x: e.movementX, y: e.movementY }),
        };
        dragConfig.onDragEnd?.(dragEvent, element);
    }
    handleClick(element, e) {
        const mousePositionClient = new geom_1.Vector2D({ x: e.clientX, y: e.clientY });
        const mouse = mousePositionClient.sub(element.getBoundingClientRect());
        const zone = this.findZone((z) => z.onClick && this.hitTestZone(z, mouse));
        zone?.onClick?.({ position: mouse });
    }
    updateCursor() {
        // If a drag is ongoing, use the drag cursor if available
        const drag = this.currentDrag;
        if (drag) {
            const dragDelta = drag.currentMousePosition.sub(drag.startingMousePosition);
            const dragConfig = this.findZoneById(drag.zoneId)?.drag;
            if (dragConfig &&
                dragConfig.cursorWhileDragging &&
                dragDelta.manhattanDistance >= (dragConfig.minDistance ?? 0)) {
                this.target.style.cursor = dragConfig.cursorWhileDragging;
                return;
            }
        }
        // Otherwise, find the hovered zone and set the cursor
        const mouse = this.currentMousePosition;
        const zone = mouse && this.findZone((z) => z.cursor && this.hitTestZone(z, mouse));
        this.target.style.cursor = zone?.cursor ?? 'default';
    }
    // Find a zone that matches a predicate.
    findZone(pred) {
        for (const zone of this.zones) {
            if (pred(zone))
                return zone;
        }
        return undefined;
    }
    // Find a zone by id.
    findZoneById(id) {
        for (const zone of this.zones) {
            if (zone.id === id)
                return zone;
        }
        return undefined;
    }
    // Test whether a point hits a zone.
    hitTestZone(zone, x) {
        const rect = geom_1.Rect2D.fromPointAndSize(zone.area);
        return rect.containsPoint(x) && (!zone.keyModifier || this.shiftHeld);
    }
}
exports.ZonedInteractionHandler = ZonedInteractionHandler;
//# sourceMappingURL=zoned_interaction_handler.js.map