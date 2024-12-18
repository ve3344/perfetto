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
exports.LegacyTableColumnSet = exports.FromSimpleColumn = exports.LegacyTableColumn = void 0;
exports.sqlColumnId = sqlColumnId;
exports.isSqlColumnEqual = isSqlColumnEqual;
exports.tableColumnId = tableColumnId;
exports.tableColumnAlias = tableColumnAlias;
exports.formatFilter = formatFilter;
exports.filterTitle = filterTitle;
const array_utils_1 = require("../../../../base/array_utils");
// List of columns of args, corresponding to arg values, which cause a short-form of the ID to be generated.
// (e.g. arg_set_id[foo].int instead of args[arg_set_id,key=foo].int_value).
const ARG_COLUMN_TO_SUFFIX = {
    display_value: '',
    int_value: '.int',
    string_value: '.str',
    real_value: '.real',
};
// A unique identifier for the SQL column.
function sqlColumnId(column) {
    if (typeof column === 'string') {
        return column;
    }
    // Special case: If the join is performed on a single column `id`, we can use a simpler representation (i.e. `table[id].column`).
    if ((0, array_utils_1.arrayEquals)(Object.keys(column.source.joinOn), ['id'])) {
        return `${column.source.table}[${sqlColumnId(Object.values(column.source.joinOn)[0])}].${column.column}`;
    }
    // Special case: args lookup. For it, we can use a simpler representation (i.e. `arg_set_id[key]`).
    if (column.column in ARG_COLUMN_TO_SUFFIX &&
        column.source.table === 'args' &&
        (0, array_utils_1.arrayEquals)(Object.keys(column.source.joinOn).sort(), ['arg_set_id', 'key'])) {
        const key = column.source.joinOn['key'];
        const argSetId = column.source.joinOn['arg_set_id'];
        return `${sqlColumnId(argSetId)}[${sqlColumnId(key)}]${ARG_COLUMN_TO_SUFFIX[column.column]}`;
    }
    // Otherwise, we need to list all the join constraints.
    const lookup = Object.entries(column.source.joinOn)
        .map(([key, value]) => {
        const valueStr = sqlColumnId(value);
        if (key === valueStr)
            return key;
        return `${key}=${sqlColumnId(value)}`;
    })
        .join(', ');
    return `${column.source.table}[${lookup}].${column.column}`;
}
function isSqlColumnEqual(a, b) {
    return sqlColumnId(a) === sqlColumnId(b);
}
function sqlColumnName(column) {
    if (typeof column === 'string') {
        return column;
    }
    return column.column;
}
// Class which represents a column in a table, which can be displayed to the user.
// It is based on the primary SQL column, but also contains additional information needed for displaying it as a part of a table.
class LegacyTableColumn {
    constructor(params) {
        this.tag = params?.tag;
        this.alias = params?.alias;
        this.startsHidden = params?.startsHidden ?? false;
    }
    // Some SQL columns can map to multiple table columns. For example, a "utid" can be displayed as an integer column, or as a "thread" column, which displays "$thread_name [$tid]".
    // Each column should have a unique id, so in these cases `tag` is appended to the primary column id to guarantee uniqueness.
    tag;
    // Preferred alias to be used in the SQL query. If omitted, column name will be used instead, including postfixing it with an integer if necessary.
    // However, e.g. explicit aliases like `process_name` and `thread_name` are typically preferred to `name_1`, `name_2`, hence the need for explicit aliasing.
    alias;
    // Whether the column should be hidden by default.
    startsHidden;
}
exports.LegacyTableColumn = LegacyTableColumn;
class FromSimpleColumn extends LegacyTableColumn {
    simpleCol;
    primaryColumn() {
        return this.simpleCol.name;
    }
    renderCell(value, tableManager, _dependentColumns) {
        return this.simpleCol.renderCell(value, tableManager);
    }
    constructor(simpleCol, params) {
        super(params);
        this.simpleCol = simpleCol;
    }
}
exports.FromSimpleColumn = FromSimpleColumn;
// Returns a unique identifier for the table column.
function tableColumnId(column) {
    const primaryColumnName = sqlColumnId(column.primaryColumn());
    if (column.tag) {
        return `${primaryColumnName}#${column.tag}`;
    }
    return primaryColumnName;
}
function tableColumnAlias(column) {
    return column.alias ?? sqlColumnName(column.primaryColumn());
}
// This class represents a set of columns, from which the user can choose which columns to display. It is typically impossible or impractical to list all possible columns, so this class allows to discover them dynamically.
// Two examples of canonical TableColumnSet usage are:
// - Argument sets, where the set of arguments can be arbitrary large (and can change when the user changes filters on the table).
// - Dependent columns, where the id.
class LegacyTableColumnSet {
}
exports.LegacyTableColumnSet = LegacyTableColumnSet;
// Returns a default string representation of the filter.
function formatFilter(filter) {
    return filter.op(filter.columns.map((c) => sqlColumnId(c)));
}
// Returns a human-readable title for the filter.
function filterTitle(filter) {
    if (filter.getTitle !== undefined) {
        return filter.getTitle();
    }
    return formatFilter(filter);
}
//# sourceMappingURL=column.js.map