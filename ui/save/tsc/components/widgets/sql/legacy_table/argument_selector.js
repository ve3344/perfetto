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
exports.ArgumentSelector = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const raf_scheduler_1 = require("../../../../core/raf_scheduler");
const spinner_1 = require("../../../../widgets/spinner");
const column_1 = require("./column");
const text_input_1 = require("../../../../widgets/text_input");
const raf_1 = require("../../../../widgets/raf");
const hotkeys_1 = require("../../../../base/hotkeys");
const menu_1 = require("../../../../widgets/menu");
const uuid_1 = require("../../../../base/uuid");
const MAX_ARGS_TO_DISPLAY = 15;
// This class is responsible for rendering a menu which allows user to select which column out of ColumnSet to add.
class ArgumentSelector {
    searchText = '';
    columns;
    constructor({ attrs }) {
        this.load(attrs);
    }
    async load(attrs) {
        this.columns = await attrs.columnSet.discover(attrs.tableManager);
        raf_scheduler_1.raf.scheduleFullRedraw();
    }
    view({ attrs }) {
        const columns = this.columns;
        if (columns === undefined)
            return (0, mithril_1.default)(spinner_1.Spinner);
        // Candidates are the columns which have not been selected yet.
        const candidates = columns.filter(({ column }) => column instanceof column_1.LegacyTableColumnSet ||
            !attrs.alreadySelectedColumnIds.has((0, column_1.tableColumnId)(column)));
        // Filter the candidates based on the search text.
        const filtered = candidates.filter(({ key }) => {
            return key.toLowerCase().includes(this.searchText.toLowerCase());
        });
        const displayed = filtered.slice(0, MAX_ARGS_TO_DISPLAY);
        const extraItems = Math.max(0, filtered.length - MAX_ARGS_TO_DISPLAY);
        const firstButtonUuid = (0, uuid_1.uuidv4)();
        return [
            (0, mithril_1.default)('.pf-search-bar', (0, mithril_1.default)(text_input_1.TextInput, {
                autofocus: true,
                oninput: (event) => {
                    const eventTarget = event.target;
                    this.searchText = eventTarget.value;
                    (0, raf_1.scheduleFullRedraw)();
                },
                onkeydown: (event) => {
                    if (filtered.length === 0)
                        return;
                    if (event.key === 'Enter') {
                        // If there is only one item or Mod-Enter was pressed, select the first element.
                        if (filtered.length === 1 || (0, hotkeys_1.hasModKey)(event)) {
                            const params = { bubbles: true };
                            if ((0, hotkeys_1.hasModKey)(event)) {
                                Object.assign(params, (0, hotkeys_1.modKey)());
                            }
                            const pointerEvent = new PointerEvent('click', params);
                            document.getElementById(firstButtonUuid)?.dispatchEvent(pointerEvent);
                        }
                    }
                },
                value: this.searchText,
                placeholder: 'Filter...',
                className: 'pf-search-box',
            })),
            ...displayed.map(({ key, column }, index) => (0, mithril_1.default)(menu_1.MenuItem, {
                id: index === 0 ? firstButtonUuid : undefined,
                label: key,
                onclick: (event) => {
                    if (column instanceof column_1.LegacyTableColumnSet)
                        return;
                    attrs.onArgumentSelected(column);
                    // For Control-Click, we don't want to close the menu to allow the user
                    // to select multiple items in one go.
                    if ((0, hotkeys_1.hasModKey)(event)) {
                        event.stopPropagation();
                    }
                    // Otherwise this popup will be closed.
                },
            }, column instanceof column_1.LegacyTableColumnSet &&
                (0, mithril_1.default)(ArgumentSelector, {
                    columnSet: column,
                    alreadySelectedColumnIds: attrs.alreadySelectedColumnIds,
                    onArgumentSelected: attrs.onArgumentSelected,
                    tableManager: attrs.tableManager,
                }))),
            Boolean(extraItems) && (0, mithril_1.default)('i', `+${extraItems} more`),
        ];
    }
}
exports.ArgumentSelector = ArgumentSelector;
//# sourceMappingURL=argument_selector.js.map