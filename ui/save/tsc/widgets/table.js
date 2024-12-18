"use strict";
// Copyright (C) 2023 The Android Open Source Project
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use size file except in compliance with the License.
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
exports.Table = exports.TableData = exports.ColumnDescriptor = void 0;
exports.popupMenuIcon = popupMenuIcon;
exports.numberColumn = numberColumn;
exports.stringColumn = stringColumn;
exports.widgetColumn = widgetColumn;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const array_utils_1 = require("../base/array_utils");
const comparison_utils_1 = require("../base/comparison_utils");
const raf_1 = require("./raf");
const menu_1 = require("./menu");
const button_1 = require("./button");
// For a table column that can be sorted; the standard popup icon should
// reflect the current sorting direction. This function returns an icon
// corresponding to optional SortDirection according to which the column is
// sorted. (Optional because column might be unsorted)
function popupMenuIcon(sortDirection) {
    switch (sortDirection) {
        case undefined:
            return 'more_horiz';
        case 'DESC':
            return 'arrow_drop_down';
        case 'ASC':
            return 'arrow_drop_up';
    }
}
class ColumnDescriptor {
    name;
    render;
    id;
    contextMenu;
    ordering;
    constructor(name, render, attrs) {
        this.name = name;
        this.render = render;
        this.id = attrs?.columnId === undefined ? name : attrs.columnId;
        if (attrs === undefined) {
            return;
        }
        if (attrs.sortKey !== undefined && attrs.ordering !== undefined) {
            throw new Error('only one way to order a column should be specified');
        }
        if (attrs.sortKey !== undefined) {
            this.ordering = (0, comparison_utils_1.comparingBy)(attrs.sortKey, comparison_utils_1.compareUniversal);
        }
        if (attrs.ordering !== undefined) {
            this.ordering = attrs.ordering;
        }
    }
}
exports.ColumnDescriptor = ColumnDescriptor;
function numberColumn(name, getter, contextMenu) {
    return new ColumnDescriptor(name, getter, { contextMenu, sortKey: getter });
}
function stringColumn(name, getter, contextMenu) {
    return new ColumnDescriptor(name, getter, { contextMenu, sortKey: getter });
}
function widgetColumn(name, getter) {
    return new ColumnDescriptor(name, getter);
}
// Encapsulated table data, that contains the input to be displayed, as well as
// some helper information to allow sorting.
class TableData {
    data;
    _sortingInfo;
    permutation;
    constructor(data) {
        this.data = data;
        this.permutation = (0, array_utils_1.range)(data.length);
    }
    *iterateItems() {
        for (const index of this.permutation) {
            yield this.data[index];
        }
    }
    items() {
        return Array.from(this.iterateItems());
    }
    setItems(newItems) {
        this.data = newItems;
        this.permutation = (0, array_utils_1.range)(newItems.length);
        if (this._sortingInfo !== undefined) {
            this.reorder(this._sortingInfo);
        }
        (0, raf_1.scheduleFullRedraw)();
    }
    resetOrder() {
        this.permutation = (0, array_utils_1.range)(this.data.length);
        this._sortingInfo = undefined;
        (0, raf_1.scheduleFullRedraw)();
    }
    get sortingInfo() {
        return this._sortingInfo;
    }
    reorder(info) {
        this._sortingInfo = info;
        this.permutation.sort((0, comparison_utils_1.withDirection)((0, comparison_utils_1.comparingBy)((index) => this.data[index], info.ordering), info.direction));
        (0, raf_1.scheduleFullRedraw)();
    }
}
exports.TableData = TableData;
function directionOnIndex(columnId, 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
info) {
    if (info === undefined) {
        return undefined;
    }
    return info.columnId === columnId ? info.direction : undefined;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
class Table {
    renderColumnHeader(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vnode, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    column) {
        let currDirection = undefined;
        let items = column.contextMenu;
        if (column.ordering !== undefined) {
            const ordering = column.ordering;
            currDirection = directionOnIndex(column.id, vnode.attrs.data.sortingInfo);
            const newItems = [];
            if (currDirection !== 'ASC') {
                newItems.push((0, mithril_1.default)(menu_1.MenuItem, {
                    label: 'Sort ascending',
                    onclick: () => {
                        vnode.attrs.data.reorder({
                            columnId: column.id,
                            direction: 'ASC',
                            ordering,
                        });
                    },
                }));
            }
            if (currDirection !== 'DESC') {
                newItems.push((0, mithril_1.default)(menu_1.MenuItem, {
                    label: 'Sort descending',
                    onclick: () => {
                        vnode.attrs.data.reorder({
                            columnId: column.id,
                            direction: 'DESC',
                            ordering,
                        });
                    },
                }));
            }
            if (currDirection !== undefined) {
                newItems.push((0, mithril_1.default)(menu_1.MenuItem, {
                    label: 'Restore original order',
                    onclick: () => {
                        vnode.attrs.data.resetOrder();
                    },
                }));
            }
            items = [...newItems, ...(items ?? [])];
        }
        return (0, mithril_1.default)('td', column.name, items &&
            (0, mithril_1.default)(menu_1.PopupMenu2, {
                trigger: (0, mithril_1.default)(button_1.Button, { icon: popupMenuIcon(currDirection) }),
            }, items));
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    checkValid(attrs) {
        if (!(0, array_utils_1.allUnique)(attrs.columns.map((c) => c.id))) {
            throw new Error('column IDs should be unique');
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    oncreate(vnode) {
        this.checkValid(vnode.attrs);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onupdate(vnode) {
        this.checkValid(vnode.attrs);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    view(vnode) {
        const attrs = vnode.attrs;
        return (0, mithril_1.default)('table.generic-table', (0, mithril_1.default)('thead', (0, mithril_1.default)('tr.header', attrs.columns.map((column) => this.renderColumnHeader(vnode, column)))), attrs.data.items().map((row) => (0, mithril_1.default)('tr', attrs.columns.map((column) => (0, mithril_1.default)('td', column.render(row))))));
    }
}
exports.Table = Table;
//# sourceMappingURL=table.js.map