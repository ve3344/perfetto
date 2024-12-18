"use strict";
// Copyright (C) 2023 The Android Open Source Project
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
exports.isOrContains = isOrContains;
exports.findRef = findRef;
exports.toHTMLElement = toHTMLElement;
exports.elementIsEditable = elementIsEditable;
exports.currentTargetOffset = currentTargetOffset;
exports.bindEventListener = bindEventListener;
const geom_1 = require("./geom");
// Check whether a DOM element contains another, or whether they're the same
function isOrContains(container, target) {
    return container === target || container.contains(target);
}
// Find a DOM element with a given "ref" attribute
function findRef(root, ref) {
    const query = `[ref=${ref}]`;
    if (root.matches(query)) {
        return root;
    }
    else {
        return root.querySelector(query);
    }
}
// Safely cast an Element to an HTMLElement.
// Throws if the element is not an HTMLElement.
function toHTMLElement(el) {
    if (!(el instanceof HTMLElement)) {
        throw new Error('Element is not an HTMLElement');
    }
    return el;
}
// Return true if EventTarget is or is inside an editable element.
// Editable elements incluce: <input type="text">, <textarea>, or elements with
// the |contenteditable| attribute set.
function elementIsEditable(target) {
    if (target === null) {
        return false;
    }
    if (!(target instanceof Element)) {
        return false;
    }
    const editable = target.closest('input, textarea, [contenteditable=true]');
    if (editable === null) {
        return false;
    }
    if (editable instanceof HTMLInputElement) {
        if (['radio', 'checkbox', 'button'].includes(editable.type)) {
            return false;
        }
    }
    return true;
}
// Returns the mouse pointer's position relative to |e.currentTarget| for a
// given |MouseEvent|.
// Similar to |offsetX|, |offsetY| but for |currentTarget| rather than |target|.
// If the event has no currentTarget or it is not an element, offsetX & offsetY
// are returned instead.
function currentTargetOffset(e) {
    if (e.currentTarget === e.target) {
        return new geom_1.Vector2D({ x: e.offsetX, y: e.offsetY });
    }
    if (e.currentTarget && e.currentTarget instanceof Element) {
        const rect = e.currentTarget.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;
        return new geom_1.Vector2D({ x: offsetX, y: offsetY });
    }
    return new geom_1.Vector2D({ x: e.offsetX, y: e.offsetY });
}
// Adds an event listener to a DOM element, returning a disposable to remove it.
function bindEventListener(element, event, handler) {
    element.addEventListener(event, handler);
    return {
        [Symbol.dispose]() {
            element.removeEventListener(event, handler);
        },
    };
}
//# sourceMappingURL=dom_utils.js.map