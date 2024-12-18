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
exports.Popup = exports.PopupPosition = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@popperjs/core");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const portal_1 = require("./portal");
const classnames_1 = require("../base/classnames");
const dom_utils_1 = require("../base/dom_utils");
const logging_1 = require("../base/logging");
const raf_1 = require("./raf");
// Note: We could just use the Placement type from popper.js instead, which is a
// union of string literals corresponding to the values in this enum, but having
// the emun makes it possible to enumerate the possible options, which is a
// feature used in the widgets page.
var PopupPosition;
(function (PopupPosition) {
    PopupPosition["Auto"] = "auto";
    PopupPosition["AutoStart"] = "auto-start";
    PopupPosition["AutoEnd"] = "auto-end";
    PopupPosition["Top"] = "top";
    PopupPosition["TopStart"] = "top-start";
    PopupPosition["TopEnd"] = "top-end";
    PopupPosition["Bottom"] = "bottom";
    PopupPosition["BottomStart"] = "bottom-start";
    PopupPosition["BottomEnd"] = "bottom-end";
    PopupPosition["Right"] = "right";
    PopupPosition["RightStart"] = "right-start";
    PopupPosition["RightEnd"] = "right-end";
    PopupPosition["Left"] = "left";
    PopupPosition["LeftStart"] = "left-start";
    PopupPosition["LeftEnd"] = "left-end";
})(PopupPosition || (exports.PopupPosition = PopupPosition = {}));
// A popup is a portal whose position is dynamically updated so that it floats
// next to a trigger element. It is also styled with a nice backdrop, and
// a little arrow pointing at the trigger element.
// Useful for displaying things like popup menus.
class Popup {
    isOpen = false;
    triggerElement;
    popupElement;
    popper;
    onChange = () => { };
    closeOnEscape;
    closeOnOutsideClick;
    static TRIGGER_REF = 'trigger';
    static POPUP_REF = 'popup';
    static POPUP_GROUP_CLASS = 'pf-popup-group';
    // Any element with this class will close its containing popup group on click
    static DISMISS_POPUP_GROUP_CLASS = 'pf-dismiss-popup-group';
    view({ attrs, children }) {
        const { trigger, isOpen = this.isOpen, onChange = () => { }, closeOnEscape = true, closeOnOutsideClick = true, } = attrs;
        this.isOpen = isOpen;
        this.onChange = onChange;
        this.closeOnEscape = closeOnEscape;
        this.closeOnOutsideClick = closeOnOutsideClick;
        return [
            this.renderTrigger(trigger),
            isOpen && this.renderPopup(attrs, children),
        ];
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    renderTrigger(trigger) {
        trigger.attrs = {
            ...trigger.attrs,
            ref: Popup.TRIGGER_REF,
            onclick: (e) => {
                this.togglePopup();
                e.preventDefault();
            },
            active: this.isOpen,
        };
        return trigger;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    renderPopup(attrs, children) {
        const { className, showArrow = true, createNewGroup = true, onPopupMount = () => { }, onPopupUnMount = () => { }, } = attrs;
        const portalAttrs = {
            className: 'pf-popup-portal',
            onBeforeContentMount: (dom) => {
                // Check to see if dom is a descendant of a popup
                // If so, get the popup's "container" and put it in there instead
                // This handles the case where popups are placed inside the other popups
                // we nest outselves in their containers instead of document body which
                // means we become part of their hitbox for mouse events.
                const closestPopup = dom.closest(`[ref=${Popup.POPUP_REF}]`);
                return { container: closestPopup ?? undefined };
            },
            onContentMount: (dom) => {
                const popupElement = (0, dom_utils_1.toHTMLElement)((0, logging_1.assertExists)((0, dom_utils_1.findRef)(dom, Popup.POPUP_REF)));
                this.popupElement = popupElement;
                this.createOrUpdatePopper(attrs);
                document.addEventListener('mousedown', this.handleDocMouseDown);
                document.addEventListener('keydown', this.handleDocKeyPress);
                dom.addEventListener('click', this.handleContentClick);
                onPopupMount(popupElement);
            },
            onContentUpdate: () => {
                // The content inside the portal has updated, so we call popper to
                // recompute the popup's position, in case it has changed size.
                this.popper && this.popper.update();
            },
            onContentUnmount: (dom) => {
                if (this.popupElement) {
                    onPopupUnMount(this.popupElement);
                }
                dom.removeEventListener('click', this.handleContentClick);
                document.removeEventListener('keydown', this.handleDocKeyPress);
                document.removeEventListener('mousedown', this.handleDocMouseDown);
                this.popper && this.popper.destroy();
                this.popper = undefined;
                this.popupElement = undefined;
            },
        };
        return (0, mithril_1.default)(portal_1.Portal, portalAttrs, (0, mithril_1.default)('.pf-popup', {
            class: (0, classnames_1.classNames)(className, createNewGroup && Popup.POPUP_GROUP_CLASS),
            ref: Popup.POPUP_REF,
        }, showArrow && (0, mithril_1.default)('.pf-popup-arrow[data-popper-arrow]'), (0, mithril_1.default)('.pf-popup-content', children)));
    }
    oncreate({ dom }) {
        this.triggerElement = (0, logging_1.assertExists)((0, dom_utils_1.findRef)(dom, Popup.TRIGGER_REF));
    }
    onupdate({ attrs }) {
        // We might have some new popper options, or the trigger might have changed
        // size, so we call popper to recompute the popup's position.
        this.createOrUpdatePopper(attrs);
    }
    onremove(_) {
        this.triggerElement = undefined;
    }
    createOrUpdatePopper(attrs) {
        const { position = PopupPosition.Auto, showArrow = true, matchWidth = false, offset = 0, edgeOffset = 0, } = attrs;
        let matchWidthModifier;
        if (matchWidth) {
            matchWidthModifier = [
                {
                    name: 'sameWidth',
                    enabled: true,
                    phase: 'beforeWrite',
                    requires: ['computeStyles'],
                    fn: ({ state }) => {
                        state.styles.popper.width = `${state.rects.reference.width}px`;
                    },
                    effect: ({ state }) => {
                        const trigger = state.elements.reference;
                        state.elements.popper.style.width = `${trigger.offsetWidth}px`;
                    },
                },
            ];
        }
        else {
            matchWidthModifier = [];
        }
        const options = {
            placement: position,
            modifiers: [
                // Move the popup away from the target allowing room for the arrow
                {
                    name: 'offset',
                    options: {
                        offset: ({ placement }) => {
                            let skid = 0;
                            if (placement.includes('-end')) {
                                skid = edgeOffset;
                            }
                            else if (placement.includes('-start')) {
                                skid = -edgeOffset;
                            }
                            return [skid, showArrow ? offset + 8 : offset];
                        },
                    },
                },
                // Don't let the popup touch the edge of the viewport
                { name: 'preventOverflow', options: { padding: 8 } },
                // Don't let the arrow reach the end of the popup, which looks odd when
                // the popup has rounded corners
                { name: 'arrow', options: { padding: 2 } },
                ...matchWidthModifier,
            ],
        };
        if (this.popper) {
            this.popper.setOptions(options);
        }
        else {
            if (this.popupElement && this.triggerElement) {
                this.popper = (0, core_1.createPopper)(this.triggerElement, this.popupElement, options);
            }
        }
    }
    eventInPopupOrTrigger(e) {
        const target = e.target;
        const onTrigger = (0, dom_utils_1.isOrContains)((0, logging_1.assertExists)(this.triggerElement), target);
        const onPopup = (0, dom_utils_1.isOrContains)((0, logging_1.assertExists)(this.popupElement), target);
        return onTrigger || onPopup;
    }
    handleDocMouseDown = (e) => {
        if (this.closeOnOutsideClick && !this.eventInPopupOrTrigger(e)) {
            this.closePopup();
        }
    };
    handleDocKeyPress = (e) => {
        // Close on escape keypress if we are in the toplevel group
        const nextGroupElement = this.popupElement?.querySelector(`.${Popup.POPUP_GROUP_CLASS}`);
        if (!nextGroupElement) {
            if (this.closeOnEscape && e.key === 'Escape') {
                this.closePopup();
            }
        }
    };
    handleContentClick = (e) => {
        // Close the popup if the clicked element:
        // - Is in the same group as this class
        // - Has the magic class
        const target = e.target;
        const childPopup = this.popupElement?.querySelector(`.${Popup.POPUP_GROUP_CLASS}`);
        if (childPopup) {
            if (childPopup.contains(target)) {
                return;
            }
        }
        if (target.closest(`.${Popup.DISMISS_POPUP_GROUP_CLASS}`)) {
            this.closePopup();
        }
    };
    closePopup() {
        if (this.isOpen) {
            this.isOpen = false;
            this.onChange(this.isOpen);
            (0, raf_1.scheduleFullRedraw)('force');
        }
    }
    togglePopup() {
        this.isOpen = !this.isOpen;
        this.onChange(this.isOpen);
        (0, raf_1.scheduleFullRedraw)('force');
    }
}
exports.Popup = Popup;
//# sourceMappingURL=popup.js.map