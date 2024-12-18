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
exports.COUNT_AGGREGATION = void 0;
exports.tableColumnEquals = tableColumnEquals;
exports.toggleEnabled = toggleEnabled;
exports.aggregationEquals = aggregationEquals;
exports.columnKey = columnKey;
exports.aggregationKey = aggregationKey;
function tableColumnEquals(t1, t2) {
    switch (t1.kind) {
        case 'argument': {
            return t2.kind === 'argument' && t1.argument === t2.argument;
        }
        case 'regular': {
            return (t2.kind === 'regular' &&
                t1.table === t2.table &&
                t1.column === t2.column);
        }
    }
}
function toggleEnabled(compare, arr, column, enabled) {
    if (enabled && arr.find((value) => compare(column, value)) === undefined) {
        arr.push(column);
    }
    if (!enabled) {
        const index = arr.findIndex((value) => compare(column, value));
        if (index !== -1) {
            arr.splice(index, 1);
        }
    }
}
function aggregationEquals(agg1, agg2) {
    return new EqualsBuilder(agg1, agg2)
        .comparePrimitive((agg) => agg.aggregationFunction)
        .compare(tableColumnEquals, (agg) => agg.column)
        .equals();
}
// Used to convert TableColumn to a string in order to store it in a Map, as
// ES6 does not support compound Set/Map keys. This function should only be used
// for interning keys, and does not have any requirements beyond different
// TableColumn objects mapping to different strings.
function columnKey(tableColumn) {
    switch (tableColumn.kind) {
        case 'argument': {
            return `argument:${tableColumn.argument}`;
        }
        case 'regular': {
            return `${tableColumn.table}.${tableColumn.column}`;
        }
    }
}
function aggregationKey(aggregation) {
    return `${aggregation.aggregationFunction}:${columnKey(aggregation.column)}`;
}
exports.COUNT_AGGREGATION = {
    aggregationFunction: 'COUNT',
    // Exact column is ignored for count aggregation because it does not matter
    // what to count, use empty strings.
    column: { kind: 'regular', table: '', column: '' },
};
// Simple builder-style class to implement object equality more succinctly.
class EqualsBuilder {
    result = true;
    first;
    second;
    constructor(first, second) {
        this.first = first;
        this.second = second;
    }
    comparePrimitive(getter) {
        if (this.result) {
            this.result = getter(this.first) === getter(this.second);
        }
        return this;
    }
    compare(comparator, getter) {
        if (this.result) {
            this.result = comparator(getter(this.first), getter(this.second));
        }
        return this;
    }
    equals() {
        return this.result;
    }
}
//# sourceMappingURL=pivot_table_types.js.map