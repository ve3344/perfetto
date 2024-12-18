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
exports.Omnibox = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const classnames_1 = require("../base/classnames");
const object_utils_1 = require("../base/object_utils");
const utils_1 = require("../base/utils");
const raf_scheduler_1 = require("../core/raf_scheduler");
const empty_state_1 = require("../widgets/empty_state");
const hotkey_glyphs_1 = require("../widgets/hotkey_glyphs");
const popup_1 = require("../widgets/popup");
class OmniboxOptionRow {
    highlightedBefore = false;
    view({ attrs }) {
        const { displayName, highlighted, rightContent, label, ...htmlAttrs } = attrs;
        return (0, mithril_1.default)('li', {
            class: (0, classnames_1.classNames)(highlighted && 'pf-highlighted'),
            ...htmlAttrs,
        }, (0, mithril_1.default)('span.pf-title', this.renderTitle(displayName)), label && (0, mithril_1.default)('span.pf-tag', label), rightContent);
    }
    renderTitle(title) {
        if ((0, object_utils_1.isString)(title)) {
            return title;
        }
        else {
            return title.map(({ matching, value }) => {
                return matching ? (0, mithril_1.default)('b', value) : value;
            });
        }
    }
    onupdate({ attrs, dom }) {
        if (this.highlightedBefore !== attrs.highlighted) {
            if (attrs.highlighted) {
                dom.scrollIntoView({ block: 'nearest' });
            }
            this.highlightedBefore = attrs.highlighted;
        }
    }
}
class Omnibox {
    popupElement;
    dom;
    attrs;
    view({ attrs }) {
        const { value, placeholder, extraClasses, onInput = () => { }, onSubmit = () => { }, onGoBack = () => { }, inputRef = 'omnibox', options, closeOnSubmit = false, rightContent, selectedOptionIndex = 0, } = attrs;
        return (0, mithril_1.default)(popup_1.Popup, {
            onPopupMount: (dom) => (this.popupElement = dom),
            onPopupUnMount: (_dom) => (this.popupElement = undefined),
            isOpen: (0, utils_1.exists)(options),
            showArrow: false,
            matchWidth: true,
            offset: 2,
            trigger: (0, mithril_1.default)('.omnibox', {
                class: extraClasses,
            }, (0, mithril_1.default)('input', {
                ref: inputRef,
                value,
                placeholder,
                oninput: (e) => {
                    onInput(e.target.value, value);
                },
                onkeydown: (e) => {
                    if (e.key === 'Backspace' && value === '') {
                        onGoBack();
                    }
                    else if (e.key === 'Escape') {
                        e.preventDefault();
                        this.close(attrs);
                    }
                    if (options) {
                        if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            this.highlightPreviousOption(attrs);
                        }
                        else if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            this.highlightNextOption(attrs);
                        }
                        else if (e.key === 'Enter') {
                            e.preventDefault();
                            const option = options[selectedOptionIndex];
                            // Return values from indexing arrays can be undefined.
                            // We should enable noUncheckedIndexedAccess in
                            // tsconfig.json.
                            /* eslint-disable
                                @typescript-eslint/strict-boolean-expressions */
                            if (option) {
                                /* eslint-enable */
                                closeOnSubmit && this.close(attrs);
                                const mod = e.metaKey || e.ctrlKey;
                                const shift = e.shiftKey;
                                onSubmit(option.key, mod, shift);
                            }
                        }
                    }
                    else {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            closeOnSubmit && this.close(attrs);
                            const mod = e.metaKey || e.ctrlKey;
                            const shift = e.shiftKey;
                            onSubmit(value, mod, shift);
                        }
                    }
                },
            }), rightContent),
        }, options && this.renderDropdown(attrs));
    }
    renderDropdown(attrs) {
        const { options } = attrs;
        if (!options)
            return null;
        if (options.length === 0) {
            return (0, mithril_1.default)(empty_state_1.EmptyState, { title: 'No matching options...' });
        }
        else {
            return (0, mithril_1.default)('.pf-omnibox-dropdown', this.renderOptionsContainer(attrs, options), this.renderFooter());
        }
    }
    renderFooter() {
        return (0, mithril_1.default)('.pf-omnibox-dropdown-footer', (0, mithril_1.default)('section', (0, mithril_1.default)(hotkey_glyphs_1.KeycapGlyph, { keyValue: 'ArrowUp' }), (0, mithril_1.default)(hotkey_glyphs_1.KeycapGlyph, { keyValue: 'ArrowDown' }), 'to navigate'), (0, mithril_1.default)('section', (0, mithril_1.default)(hotkey_glyphs_1.KeycapGlyph, { keyValue: 'Enter' }), 'to use'), (0, mithril_1.default)('section', (0, mithril_1.default)(hotkey_glyphs_1.KeycapGlyph, { keyValue: 'Escape' }), 'to dismiss'));
    }
    renderOptionsContainer(attrs, options) {
        const { onClose = () => { }, onSubmit = () => { }, closeOnSubmit = false, selectedOptionIndex, } = attrs;
        const opts = options.map(({ displayName, key, rightContent, tag }, index) => {
            return (0, mithril_1.default)(OmniboxOptionRow, {
                key,
                label: tag,
                displayName: displayName,
                highlighted: index === selectedOptionIndex,
                onclick: () => {
                    closeOnSubmit && onClose();
                    onSubmit(key, false, false);
                },
                rightContent,
            });
        });
        return (0, mithril_1.default)('ul.pf-omnibox-options-container', opts);
    }
    oncreate({ attrs, dom }) {
        this.attrs = attrs;
        this.dom = dom;
        const { closeOnOutsideClick } = attrs;
        if (closeOnOutsideClick) {
            document.addEventListener('mousedown', this.onMouseDown);
        }
    }
    onupdate({ attrs, dom }) {
        this.attrs = attrs;
        this.dom = dom;
        const { closeOnOutsideClick } = attrs;
        if (closeOnOutsideClick) {
            document.addEventListener('mousedown', this.onMouseDown);
        }
        else {
            document.removeEventListener('mousedown', this.onMouseDown);
        }
    }
    onremove(_) {
        this.attrs = undefined;
        this.dom = undefined;
        document.removeEventListener('mousedown', this.onMouseDown);
    }
    // This is defined as an arrow function to have a single handler that can be
    // added/remove while keeping `this` bound.
    onMouseDown = (e) => {
        // We need to schedule a redraw manually as this event handler was added
        // manually to the DOM and doesn't use Mithril's auto-redraw system.
        raf_scheduler_1.raf.scheduleFullRedraw('force');
        // Don't close if the click was within ourselves or our popup.
        if (e.target instanceof Node) {
            if (this.popupElement && this.popupElement.contains(e.target)) {
                return;
            }
            if (this.dom && this.dom.contains(e.target))
                return;
        }
        if (this.attrs) {
            this.close(this.attrs);
        }
    };
    close(attrs) {
        const { onClose = () => { } } = attrs;
        raf_scheduler_1.raf.scheduleFullRedraw();
        onClose();
    }
    highlightPreviousOption(attrs) {
        const { selectedOptionIndex = 0, onSelectedOptionChanged = () => { } } = attrs;
        onSelectedOptionChanged(Math.max(0, selectedOptionIndex - 1));
    }
    highlightNextOption(attrs) {
        const { selectedOptionIndex = 0, onSelectedOptionChanged = () => { }, options = [], } = attrs;
        const max = options.length - 1;
        onSelectedOptionChanged(Math.min(max, selectedOptionIndex + 1));
    }
}
exports.Omnibox = Omnibox;
//# sourceMappingURL=omnibox.js.map