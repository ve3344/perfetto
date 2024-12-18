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
exports.SqlTable = void 0;
exports.columnTitle = columnTitle;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const column_1 = require("./column");
const button_1 = require("../../../../widgets/button");
const menu_1 = require("../../../../widgets/menu");
const query_builder_1 = require("./query_builder");
const semantic_icons_1 = require("../../../../base/semantic_icons");
const string_utils_1 = require("../../../../base/string_utils");
const anchor_1 = require("../../../../widgets/anchor");
const basic_table_1 = require("../../../../widgets/basic_table");
const spinner_1 = require("../../../../widgets/spinner");
const argument_selector_1 = require("./argument_selector");
const render_cell_utils_1 = require("./render_cell_utils");
const common_1 = require("../../../../widgets/common");
const form_1 = require("../../../../widgets/form");
const text_input_1 = require("../../../../widgets/text_input");
function renderCell(column, row, state) {
    const { columns } = state.getCurrentRequest();
    const sqlValue = row[columns[(0, column_1.sqlColumnId)(column.primaryColumn())]];
    const additionalValues = {};
    const dependentColumns = column.dependentColumns?.() ?? {};
    for (const [key, col] of Object.entries(dependentColumns)) {
        additionalValues[key] = row[columns[(0, column_1.sqlColumnId)(col)]];
    }
    return column.renderCell(sqlValue, getTableManager(state), additionalValues);
}
function columnTitle(column) {
    if (column.getTitle !== undefined) {
        const title = column.getTitle();
        if (title !== undefined)
            return title;
    }
    return (0, column_1.sqlColumnId)(column.primaryColumn());
}
// This is separated into a separate class to store the index of the column to be
// added and increment it when multiple columns are added from the same popup menu.
class AddColumnMenuItem {
    // Index where the new column should be inserted.
    // In the regular case, a click would close the popup (destroying this class) and
    // the `index` would not change during its lifetime.
    // However, for mod-click, we want to keep adding columns to the right of the recently
    // added column, so to achieve that we keep track of the index and increment it for
    // each new column added.
    index;
    constructor({ attrs }) {
        this.index = attrs.index;
    }
    view({ attrs }) {
        return (0, mithril_1.default)(menu_1.MenuItem, { label: 'Add column', icon: semantic_icons_1.Icons.AddColumn }, attrs.table.renderAddColumnOptions((column) => {
            attrs.state.addColumn(column, this.index++);
        }));
    }
}
// Separating out an individual column filter into a class
// so that we can store the raw input value.
class ColumnFilter {
    // Holds the raw string value from the filter text input element
    inputValue;
    constructor() {
        this.inputValue = '';
    }
    view({ attrs }) {
        const { filterOption, columns, state } = attrs;
        const { op, requiresParam } = render_cell_utils_1.FILTER_OPTION_TO_OP[filterOption];
        return (0, mithril_1.default)(menu_1.MenuItem, {
            label: filterOption,
            // Filter options that do not need an input value will filter the
            // table directly when clicking on the menu item
            // (ex: IS NULL or IS NOT NULL)
            onclick: !requiresParam
                ? () => {
                    state.addFilter({
                        op: (cols) => `${cols[0]} ${op}`,
                        columns,
                    });
                }
                : undefined,
        }, 
        // All non-null filter options will have a submenu that allows
        // the user to enter a value into textfield and filter using
        // the Filter button.
        requiresParam &&
            (0, mithril_1.default)(form_1.Form, {
                onSubmit: () => {
                    // Convert the string extracted from
                    // the input text field into the correct data type for
                    // filtering. The order in which each data type is
                    // checked matters: string, number (floating), and bigint.
                    if (this.inputValue === '')
                        return;
                    let filterValue;
                    if (Number.isNaN(Number.parseFloat(this.inputValue))) {
                        filterValue = (0, string_utils_1.sqliteString)(this.inputValue);
                    }
                    else if (!Number.isInteger(Number.parseFloat(this.inputValue))) {
                        filterValue = Number(this.inputValue);
                    }
                    else {
                        filterValue = BigInt(this.inputValue);
                    }
                    state.addFilter({
                        op: (cols) => `${cols[0]} ${op} ${filterValue}`,
                        columns,
                    });
                },
                submitLabel: 'Filter',
            }, (0, mithril_1.default)(text_input_1.TextInput, {
                id: 'column_filter_value',
                ref: 'COLUMN_FILTER_VALUE',
                autofocus: true,
                oninput: (e) => {
                    if (!e.target)
                        return;
                    this.inputValue = e.target.value;
                },
            })));
    }
}
class SqlTable {
    table;
    state;
    constructor(vnode) {
        this.state = vnode.attrs.state;
        this.table = this.state.config;
    }
    renderFilters() {
        const filters = [];
        for (const filter of this.state.getFilters()) {
            const label = (0, column_1.filterTitle)(filter);
            filters.push((0, mithril_1.default)(button_1.Button, {
                label,
                icon: 'close',
                intent: common_1.Intent.Primary,
                onclick: () => {
                    this.state.removeFilter(filter);
                },
            }));
        }
        return filters;
    }
    renderAddColumnOptions(addColumn) {
        // We do not want to add columns which already exist, so we track the
        // columns which we are already showing here.
        // TODO(altimin): Theoretically a single table can have two different
        // arg_set_ids, so we should track (arg_set_id_column, arg_name) pairs here.
        const existingColumnIds = new Set();
        for (const column of this.state.getSelectedColumns()) {
            existingColumnIds.add((0, column_1.tableColumnId)(column));
        }
        const result = [];
        for (const column of this.table.columns) {
            if (column instanceof column_1.LegacyTableColumn) {
                if (existingColumnIds.has((0, column_1.tableColumnId)(column)))
                    continue;
                result.push((0, mithril_1.default)(menu_1.MenuItem, {
                    label: columnTitle(column),
                    onclick: () => addColumn(column),
                }));
            }
            else {
                result.push((0, mithril_1.default)(menu_1.MenuItem, {
                    label: column.getTitle(),
                }, (0, mithril_1.default)(argument_selector_1.ArgumentSelector, {
                    alreadySelectedColumnIds: existingColumnIds,
                    tableManager: getTableManager(this.state),
                    columnSet: column,
                    onArgumentSelected: (column) => {
                        addColumn(column);
                    },
                })));
                continue;
            }
        }
        return result;
    }
    renderColumnFilterOptions(c) {
        return Object.values(render_cell_utils_1.FilterOption).map((filterOption) => (0, mithril_1.default)(ColumnFilter, {
            filterOption,
            columns: [c.primaryColumn()],
            state: this.state,
        }));
    }
    renderColumnHeader(column, index, additionalColumnHeaderMenuItems) {
        const sorted = this.state.isSortedBy(column);
        const icon = sorted === 'ASC'
            ? semantic_icons_1.Icons.SortedAsc
            : sorted === 'DESC'
                ? semantic_icons_1.Icons.SortedDesc
                : semantic_icons_1.Icons.ContextMenu;
        return (0, mithril_1.default)(menu_1.PopupMenu2, {
            trigger: (0, mithril_1.default)(anchor_1.Anchor, { icon }, columnTitle(column)),
        }, sorted !== 'DESC' &&
            (0, mithril_1.default)(menu_1.MenuItem, {
                label: 'Sort: highest first',
                icon: semantic_icons_1.Icons.SortedDesc,
                onclick: () => {
                    this.state.sortBy({
                        column: column,
                        direction: 'DESC',
                    });
                },
            }), sorted !== 'ASC' &&
            (0, mithril_1.default)(menu_1.MenuItem, {
                label: 'Sort: lowest first',
                icon: semantic_icons_1.Icons.SortedAsc,
                onclick: () => {
                    this.state.sortBy({
                        column: column,
                        direction: 'ASC',
                    });
                },
            }), sorted !== undefined &&
            (0, mithril_1.default)(menu_1.MenuItem, {
                label: 'Unsort',
                icon: semantic_icons_1.Icons.Close,
                onclick: () => this.state.unsort(),
            }), this.state.getSelectedColumns().length > 1 &&
            (0, mithril_1.default)(menu_1.MenuItem, {
                label: 'Hide',
                icon: semantic_icons_1.Icons.Hide,
                onclick: () => this.state.hideColumnAtIndex(index),
            }), (0, mithril_1.default)(menu_1.MenuItem, { label: 'Add filter', icon: semantic_icons_1.Icons.Filter }, this.renderColumnFilterOptions(column)), additionalColumnHeaderMenuItems, 
        // Menu items before divider apply to selected column
        (0, mithril_1.default)(menu_1.MenuDivider), 
        // Menu items after divider apply to entire table
        (0, mithril_1.default)(AddColumnMenuItem, { table: this, state: this.state, index }));
    }
    getAdditionalColumnMenuItems(addColumnMenuItems) {
        if (addColumnMenuItems === undefined)
            return;
        const additionalColumnMenuItems = {};
        this.state.getSelectedColumns().forEach((column) => {
            const columnAlias = this.state.getCurrentRequest().columns[(0, column_1.sqlColumnId)(column.primaryColumn())];
            additionalColumnMenuItems[columnAlias] = addColumnMenuItems(column, columnAlias);
        });
        return additionalColumnMenuItems;
    }
    view({ attrs }) {
        const rows = this.state.getDisplayedRows();
        const additionalColumnMenuItems = this.getAdditionalColumnMenuItems(attrs.addColumnMenuItems);
        const columns = this.state.getSelectedColumns();
        const columnDescriptors = columns.map((column, i) => {
            return {
                title: this.renderColumnHeader(column, i, additionalColumnMenuItems &&
                    additionalColumnMenuItems[this.state.getCurrentRequest().columns[(0, column_1.sqlColumnId)(column.primaryColumn())]]),
                render: (row) => renderCell(column, row, this.state),
            };
        });
        return [
            (0, mithril_1.default)('div', this.renderFilters()),
            (0, mithril_1.default)((basic_table_1.BasicTable), {
                data: rows,
                columns: [
                    new basic_table_1.ReorderableColumns(columnDescriptors, (from, to) => this.state.moveColumn(from, to)),
                ],
            }, this.state.isLoading() && (0, mithril_1.default)(spinner_1.Spinner), this.state.getQueryError() !== undefined &&
                (0, mithril_1.default)('.query-error', this.state.getQueryError())),
        ];
    }
}
exports.SqlTable = SqlTable;
function getTableManager(state) {
    return {
        addFilter: (filter) => {
            state.addFilter(filter);
        },
        trace: state.trace,
        getSqlQuery: (columns) => (0, query_builder_1.buildSqlQuery)({
            table: state.config.name,
            columns,
            filters: state.getFilters(),
            orderBy: state.getOrderedBy(),
        }),
    };
}
//# sourceMappingURL=table.js.map