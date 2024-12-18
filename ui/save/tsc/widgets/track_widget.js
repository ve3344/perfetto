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
exports.TrackWidget = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const classnames_1 = require("../base/classnames");
const disposable_stack_1 = require("../base/disposable_stack");
const dom_utils_1 = require("../base/dom_utils");
const math_utils_1 = require("../base/math_utils");
const semantic_icons_1 = require("../base/semantic_icons");
const button_1 = require("./button");
const chip_1 = require("./chip");
const icon_1 = require("./icon");
const middle_ellipsis_1 = require("./middle_ellipsis");
const TRACK_HEIGHT_MIN_PX = 18;
const INDENTATION_LEVEL_MAX = 16;
class TrackWidget {
    trash = new disposable_stack_1.DisposableStack();
    view({ attrs }) {
        const { indentationLevel = 0, collapsible, collapsed, highlight, heightPx, id, isSummary, } = attrs;
        const trackHeight = Math.max(heightPx, TRACK_HEIGHT_MIN_PX);
        const expanded = collapsible && !collapsed;
        return (0, mithril_1.default)('.pf-track', {
            id,
            className: (0, classnames_1.classNames)(expanded && 'pf-expanded', highlight && 'pf-highlight', isSummary && 'pf-is-summary'),
            style: {
                // Note: Sub-pixel track heights can mess with sticky elements.
                // Round up to the nearest integer number of pixels.
                '--indent': (0, math_utils_1.clamp)(indentationLevel, 0, INDENTATION_LEVEL_MAX),
                'height': `${Math.ceil(trackHeight)}px`,
            },
        }, this.renderShell(attrs), this.renderContent(attrs));
    }
    oncreate(vnode) {
        if (vnode.attrs.revealOnCreate) {
            vnode.dom.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        const popupTitleElement = vnode.dom.querySelector('.pf-track-title-popup');
        const truncatedTitleElement = vnode.dom.querySelector('.pf-middle-ellipsis');
        const resizeObserver = new ResizeObserver(() => {
            // Work out whether to display a title popup on hover, based on whether
            // the current title is ellipsized.
            if (popupTitleElement.clientWidth > truncatedTitleElement.clientWidth) {
                popupTitleElement.classList.add('pf-visible');
            }
            else {
                popupTitleElement.classList.remove('pf-visible');
            }
        });
        resizeObserver.observe(truncatedTitleElement);
        resizeObserver.observe(popupTitleElement);
        this.trash.defer(() => resizeObserver.disconnect());
    }
    onremove() {
        this.trash.dispose();
    }
    renderShell(attrs) {
        const chips = attrs.chips &&
            (0, mithril_1.default)(chip_1.ChipBar, attrs.chips.map((chip) => (0, mithril_1.default)(chip_1.Chip, { label: chip, compact: true, rounded: true })));
        const { id, topOffsetPx = 0, collapsible, collapsed, reorderable = false, onMoveAfter = () => { }, onMoveBefore = () => { }, } = attrs;
        return (0, mithril_1.default)(`.pf-track-shell[data-track-node-id=${id}]`, {
            className: (0, classnames_1.classNames)(collapsible && 'pf-clickable'),
            onclick: (e) => {
                // Block all clicks on the shell from propagating through to the
                // canvas
                e.stopPropagation();
                if (collapsible) {
                    attrs.onToggleCollapsed?.();
                }
            },
            draggable: reorderable,
            ondragstart: (e) => {
                e.dataTransfer?.setData('text/plain', id);
            },
            ondragover: (e) => {
                if (!reorderable) {
                    return;
                }
                const target = e.currentTarget;
                const threshold = target.offsetHeight / 2;
                if (e.offsetY > threshold) {
                    target.classList.remove('pf-drag-before');
                    target.classList.add('pf-drag-after');
                }
                else {
                    target.classList.remove('pf-drag-after');
                    target.classList.add('pf-drag-before');
                }
            },
            ondragleave: (e) => {
                if (!reorderable) {
                    return;
                }
                const target = e.currentTarget;
                const related = e.relatedTarget;
                if (related && !target.contains(related)) {
                    target.classList.remove('pf-drag-after');
                    target.classList.remove('pf-drag-before');
                }
            },
            ondrop: (e) => {
                if (!reorderable) {
                    return;
                }
                const id = e.dataTransfer?.getData('text/plain');
                const target = e.currentTarget;
                const threshold = target.offsetHeight / 2;
                if (id !== undefined) {
                    if (e.offsetY > threshold) {
                        onMoveAfter(id);
                    }
                    else {
                        onMoveBefore(id);
                    }
                }
                target.classList.remove('pf-drag-after');
                target.classList.remove('pf-drag-before');
            },
        }, (0, mithril_1.default)('.pf-track-menubar', {
            style: {
                position: 'sticky',
                top: `${topOffsetPx}px`,
            },
        }, (0, mithril_1.default)('h1.pf-track-title', {
            ref: attrs.path, // TODO(stevegolton): Replace with aria tags?
        }, collapsible &&
            (0, mithril_1.default)(icon_1.Icon, { icon: collapsed ? semantic_icons_1.Icons.ExpandDown : semantic_icons_1.Icons.ExpandUp }), (0, mithril_1.default)(middle_ellipsis_1.MiddleEllipsis, { text: attrs.title }, (0, mithril_1.default)('.pf-track-title-popup', attrs.title)), chips), (0, mithril_1.default)(button_1.ButtonBar, {
            className: 'pf-track-buttons',
            // Block button clicks from hitting the shell's on click event
            onclick: (e) => e.stopPropagation(),
        }, attrs.buttons)));
    }
    mouseDownPos;
    selectionOccurred = false;
    renderContent(attrs) {
        const { heightPx, onTrackContentMouseMove, onTrackContentMouseOut, onTrackContentClick, } = attrs;
        const trackHeight = Math.max(heightPx, TRACK_HEIGHT_MIN_PX);
        return (0, mithril_1.default)('.pf-track-content', {
            style: {
                height: `${trackHeight}px`,
            },
            className: (0, classnames_1.classNames)(attrs.error && 'pf-track-content-error'),
            onmousemove: (e) => {
                onTrackContentMouseMove?.((0, dom_utils_1.currentTargetOffset)(e), getTargetContainerSize(e));
            },
            onmouseout: () => {
                onTrackContentMouseOut?.();
            },
            onmousedown: (e) => {
                this.mouseDownPos = (0, dom_utils_1.currentTargetOffset)(e);
            },
            onmouseup: (e) => {
                if (!this.mouseDownPos)
                    return;
                if (this.mouseDownPos.sub((0, dom_utils_1.currentTargetOffset)(e)).manhattanDistance > 1) {
                    this.selectionOccurred = true;
                }
                this.mouseDownPos = undefined;
            },
            onclick: (e) => {
                // This click event occurs after any selection mouse up/drag events
                // so we have to look if the mouse moved during this click to know
                // if a selection occurred.
                if (this.selectionOccurred) {
                    this.selectionOccurred = false;
                    return;
                }
                // Returns true if something was selected, so stop propagation.
                if (onTrackContentClick?.((0, dom_utils_1.currentTargetOffset)(e), getTargetContainerSize(e))) {
                    e.stopPropagation();
                }
            },
        });
    }
}
exports.TrackWidget = TrackWidget;
function getTargetContainerSize(event) {
    const target = event.target;
    return target.getBoundingClientRect();
}
//# sourceMappingURL=track_widget.js.map