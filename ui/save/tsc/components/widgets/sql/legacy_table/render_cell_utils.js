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
exports.NULL_FILTER_OPTIONS = exports.STRING_FILTER_OPTIONS = exports.NUMERIC_FILTER_OPTIONS = exports.FILTER_OPTION_TO_OP = exports.FilterOption = void 0;
exports.getStandardFilters = getStandardFilters;
exports.getStandardContextMenuItems = getStandardContextMenuItems;
exports.displayValue = displayValue;
exports.renderStandardCell = renderStandardCell;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const menu_1 = require("../../../../widgets/menu");
const object_utils_1 = require("../../../../base/object_utils");
const string_utils_1 = require("../../../../base/string_utils");
const semantic_icons_1 = require("../../../../base/semantic_icons");
const clipboard_1 = require("../../../../base/clipboard");
const sql_utils_1 = require("../../../../trace_processor/sql_utils");
const anchor_1 = require("../../../../widgets/anchor");
var FilterOption;
(function (FilterOption) {
    FilterOption["GLOB"] = "glob";
    FilterOption["EQUALS_TO"] = "equals to";
    FilterOption["NOT_EQUALS_TO"] = "not equals to";
    FilterOption["GREATER_THAN"] = "greater than";
    FilterOption["GREATER_OR_EQUALS_THAN"] = "greater or equals than";
    FilterOption["LESS_THAN"] = "less than";
    FilterOption["LESS_OR_EQUALS_THAN"] = "less or equals than";
    FilterOption["IS_NULL"] = "is null";
    FilterOption["IS_NOT_NULL"] = "is not null";
})(FilterOption || (exports.FilterOption = FilterOption = {}));
exports.FILTER_OPTION_TO_OP = {
    [FilterOption.GLOB]: { op: 'glob', requiresParam: true },
    [FilterOption.EQUALS_TO]: { op: '=', requiresParam: true },
    [FilterOption.NOT_EQUALS_TO]: { op: '!=', requiresParam: true },
    [FilterOption.GREATER_THAN]: { op: '>', requiresParam: true },
    [FilterOption.GREATER_OR_EQUALS_THAN]: { op: '>=', requiresParam: true },
    [FilterOption.LESS_THAN]: { op: '<', requiresParam: true },
    [FilterOption.LESS_OR_EQUALS_THAN]: { op: '<=', requiresParam: true },
    [FilterOption.IS_NULL]: { op: 'IS NULL', requiresParam: false },
    [FilterOption.IS_NOT_NULL]: { op: 'IS NOT NULL', requiresParam: false },
};
exports.NUMERIC_FILTER_OPTIONS = [
    FilterOption.EQUALS_TO,
    FilterOption.NOT_EQUALS_TO,
    FilterOption.GREATER_THAN,
    FilterOption.GREATER_OR_EQUALS_THAN,
    FilterOption.LESS_THAN,
    FilterOption.LESS_OR_EQUALS_THAN,
];
exports.STRING_FILTER_OPTIONS = [
    FilterOption.EQUALS_TO,
    FilterOption.NOT_EQUALS_TO,
];
exports.NULL_FILTER_OPTIONS = [
    FilterOption.IS_NULL,
    FilterOption.IS_NOT_NULL,
];
function filterOptionMenuItem(label, column, filterOp, tableManager) {
    return (0, mithril_1.default)(menu_1.MenuItem, {
        label,
        onclick: () => {
            tableManager.addFilter({ op: filterOp, columns: [column] });
        },
    });
}
// Return a list of "standard" menu items, adding corresponding filters to the given cell.
function getStandardFilters(value, c, tableManager) {
    if (value === null) {
        return exports.NULL_FILTER_OPTIONS.map((option) => filterOptionMenuItem(option, c, (cols) => `${cols[0]} ${exports.FILTER_OPTION_TO_OP[option].op}`, tableManager));
    }
    if ((0, object_utils_1.isString)(value)) {
        return exports.STRING_FILTER_OPTIONS.map((option) => filterOptionMenuItem(option, c, (cols) => `${cols[0]} ${exports.FILTER_OPTION_TO_OP[option].op} ${(0, string_utils_1.sqliteString)(value)}`, tableManager));
    }
    if (typeof value === 'bigint' || typeof value === 'number') {
        return exports.NUMERIC_FILTER_OPTIONS.map((option) => filterOptionMenuItem(option, c, (cols) => `${cols[0]} ${exports.FILTER_OPTION_TO_OP[option].op} ${value}`, tableManager));
    }
    return [];
}
function copyMenuItem(label, value) {
    return (0, mithril_1.default)(menu_1.MenuItem, {
        icon: semantic_icons_1.Icons.Copy,
        label,
        onclick: () => {
            (0, clipboard_1.copyToClipboard)(value);
        },
    });
}
// Return a list of "standard" menu items for the given cell.
function getStandardContextMenuItems(value, column, tableManager) {
    const result = [];
    if ((0, object_utils_1.isString)(value)) {
        result.push(copyMenuItem('Copy', value));
    }
    const filters = getStandardFilters(value, column, tableManager);
    if (filters.length > 0) {
        result.push((0, mithril_1.default)(menu_1.MenuItem, { label: 'Add filter', icon: semantic_icons_1.Icons.Filter }, ...filters));
    }
    return result;
}
function displayValue(value) {
    if (value === null) {
        return (0, mithril_1.default)('i', 'NULL');
    }
    return (0, sql_utils_1.sqlValueToReadableString)(value);
}
function renderStandardCell(value, column, tableManager) {
    const contextMenuItems = getStandardContextMenuItems(value, column, tableManager);
    return (0, mithril_1.default)(menu_1.PopupMenu2, {
        trigger: (0, mithril_1.default)(anchor_1.Anchor, displayValue(value)),
    }, ...contextMenuItems);
}
//# sourceMappingURL=render_cell_utils.js.map