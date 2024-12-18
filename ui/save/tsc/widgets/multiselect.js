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
exports.PopupMultiSelect = exports.MultiSelect = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const semantic_icons_1 = require("../base/semantic_icons");
const button_1 = require("./button");
const checkbox_1 = require("./checkbox");
const empty_state_1 = require("./empty_state");
const popup_1 = require("./popup");
const raf_1 = require("./raf");
const text_input_1 = require("./text_input");
// A component which shows a list of items with checkboxes, allowing the user to
// select from the list which ones they want to be selected.
// Also provides search functionality.
// This component is entirely controlled and callbacks must be supplied for when
// the selected items list changes, and when the search term changes.
// There is an optional boolean flag to enable repeating the selected items at
// the top of the list for easy access - defaults to false.
class MultiSelect {
    searchText = '';
    view({ attrs }) {
        const { options, fixedSize = true } = attrs;
        const filteredItems = options.filter(({ name }) => {
            return name.toLowerCase().includes(this.searchText.toLowerCase());
        });
        return (0, mithril_1.default)(fixedSize
            ? '.pf-multiselect-panel.pf-multi-select-fixed-size'
            : '.pf-multiselect-panel', this.renderSearchBox(), this.renderListOfItems(attrs, filteredItems));
    }
    renderListOfItems(attrs, options) {
        const { repeatCheckedItemsAtTop, onChange = () => { } } = attrs;
        const allChecked = options.every(({ checked }) => checked);
        const anyChecked = options.some(({ checked }) => checked);
        if (options.length === 0) {
            return (0, mithril_1.default)(empty_state_1.EmptyState, {
                title: `No results for '${this.searchText}'`,
            });
        }
        else {
            return [
                (0, mithril_1.default)('.pf-list', repeatCheckedItemsAtTop &&
                    anyChecked &&
                    (0, mithril_1.default)('.pf-multiselect-container', (0, mithril_1.default)('.pf-multiselect-header', (0, mithril_1.default)('span', this.searchText === '' ? 'Selected' : `Selected (Filtered)`), (0, mithril_1.default)(button_1.Button, {
                        label: this.searchText === '' ? 'Clear All' : 'Clear Filtered',
                        icon: semantic_icons_1.Icons.Deselect,
                        onclick: () => {
                            const diffs = options
                                .filter(({ checked }) => checked)
                                .map(({ id }) => ({ id, checked: false }));
                            onChange(diffs);
                            (0, raf_1.scheduleFullRedraw)();
                        },
                        disabled: !anyChecked,
                    })), this.renderOptions(attrs, options.filter(({ checked }) => checked))), (0, mithril_1.default)('.pf-multiselect-container', (0, mithril_1.default)('.pf-multiselect-header', (0, mithril_1.default)('span', this.searchText === '' ? 'Options' : `Options (Filtered)`), (0, mithril_1.default)(button_1.Button, {
                    label: this.searchText === '' ? 'Select All' : 'Select Filtered',
                    icon: semantic_icons_1.Icons.SelectAll,
                    compact: true,
                    onclick: () => {
                        const diffs = options
                            .filter(({ checked }) => !checked)
                            .map(({ id }) => ({ id, checked: true }));
                        onChange(diffs);
                        (0, raf_1.scheduleFullRedraw)();
                    },
                    disabled: allChecked,
                }), (0, mithril_1.default)(button_1.Button, {
                    label: this.searchText === '' ? 'Clear All' : 'Clear Filtered',
                    icon: semantic_icons_1.Icons.Deselect,
                    compact: true,
                    onclick: () => {
                        const diffs = options
                            .filter(({ checked }) => checked)
                            .map(({ id }) => ({ id, checked: false }));
                        onChange(diffs);
                        (0, raf_1.scheduleFullRedraw)();
                    },
                    disabled: !anyChecked,
                })), this.renderOptions(attrs, options))),
            ];
        }
    }
    renderSearchBox() {
        return (0, mithril_1.default)('.pf-search-bar', (0, mithril_1.default)(text_input_1.TextInput, {
            oninput: (event) => {
                const eventTarget = event.target;
                this.searchText = eventTarget.value;
                (0, raf_1.scheduleFullRedraw)();
            },
            value: this.searchText,
            placeholder: 'Filter options...',
            className: 'pf-search-box',
        }), this.renderClearButton());
    }
    renderClearButton() {
        if (this.searchText != '') {
            return (0, mithril_1.default)(button_1.Button, {
                onclick: () => {
                    this.searchText = '';
                    (0, raf_1.scheduleFullRedraw)();
                },
                label: '',
                icon: 'close',
            });
        }
        else {
            return null;
        }
    }
    renderOptions(attrs, options) {
        const { onChange = () => { } } = attrs;
        return options.map((item) => {
            const { checked, name, id } = item;
            return (0, mithril_1.default)(checkbox_1.Checkbox, {
                label: name,
                key: id, // Prevents transitions jumping between items when searching
                checked,
                className: 'pf-multiselect-item',
                onchange: () => {
                    onChange([{ id, checked: !checked }]);
                    (0, raf_1.scheduleFullRedraw)();
                },
            });
        });
    }
}
exports.MultiSelect = MultiSelect;
// The same multi-select component that functions as a drop-down instead of
// a list.
class PopupMultiSelect {
    view({ attrs }) {
        const { icon, popupPosition = popup_1.PopupPosition.Auto, intent, compact } = attrs;
        return (0, mithril_1.default)(popup_1.Popup, {
            trigger: (0, mithril_1.default)(button_1.Button, {
                label: this.labelText(attrs),
                icon,
                intent,
                compact,
            }),
            position: popupPosition,
        }, (0, mithril_1.default)(MultiSelect, attrs));
    }
    labelText(attrs) {
        const { options, showNumSelected, label } = attrs;
        if (showNumSelected) {
            const numSelected = options.filter(({ checked }) => checked).length;
            return `${label} (${numSelected} selected)`;
        }
        else {
            return label;
        }
    }
}
exports.PopupMultiSelect = PopupMultiSelect;
//# sourceMappingURL=multiselect.js.map