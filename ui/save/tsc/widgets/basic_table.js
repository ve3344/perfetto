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
exports.BasicTable = exports.ReorderableColumns = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const raf_1 = require("./raf");
// This is a class to be able to perform runtime checks on `columns` below.
class ReorderableColumns {
    columns;
    reorder;
    constructor(columns, reorder) {
        this.columns = columns;
        this.reorder = reorder;
    }
}
exports.ReorderableColumns = ReorderableColumns;
class BasicTable {
    view(vnode) {
        const attrs = vnode.attrs;
        const columnBlocks = getColumns(attrs);
        const columns = [];
        const headers = [];
        for (const [blockIndex, block] of columnBlocks.entries()) {
            const currentColumns = block.columns.map((column, columnIndex) => ({
                column,
                extraClasses: columnIndex === 0 && blockIndex !== 0 ? '.has-left-border' : '',
            }));
            if (block.reorder === undefined) {
                for (const { column, extraClasses } of currentColumns) {
                    headers.push((0, mithril_1.default)(`td${extraClasses}`, column.title));
                }
            }
            else {
                headers.push((0, mithril_1.default)(ReorderableCellGroup, {
                    cells: currentColumns.map(({ column, extraClasses }) => ({
                        content: column.title,
                        extraClasses,
                    })),
                    onReorder: block.reorder,
                }));
            }
            columns.push(...currentColumns);
        }
        return (0, mithril_1.default)('table.generic-table', {
            // TODO(altimin, stevegolton): this should be the default for
            // generic-table, but currently it is overriden by
            // .pf-details-shell .pf-content table, so specify this here for now.
            style: {
                'table-layout': 'auto',
            },
        }, (0, mithril_1.default)('thead', (0, mithril_1.default)('tr.header', headers)), attrs.data.map((row) => (0, mithril_1.default)('tr', columns.map(({ column, extraClasses }) => (0, mithril_1.default)(`td${extraClasses}`, column.render(row))))));
    }
}
exports.BasicTable = BasicTable;
function getColumns(attrs) {
    const result = [];
    let current = { columns: [] };
    for (const col of attrs.columns) {
        if (col instanceof ReorderableColumns) {
            if (current.columns.length > 0) {
                result.push(current);
                current = { columns: [] };
            }
            result.push(col);
        }
        else {
            current.columns.push(col);
        }
    }
    if (current.columns.length > 0) {
        result.push(current);
    }
    return result;
}
const placeholderElement = document.createElement('span');
// A component that renders a group of cells on the same row that can be
// reordered between each other by using drag'n'drop.
//
// On completed reorder, a callback is fired.
class ReorderableCellGroup {
    drag;
    getClassForIndex(index) {
        if (this.drag?.from === index) {
            return 'dragged';
        }
        if (this.drag?.to === index) {
            return 'highlight-left';
        }
        if (this.drag?.to === index + 1) {
            return 'highlight-right';
        }
        return '';
    }
    view(vnode) {
        return vnode.attrs.cells.map((cell, index) => (0, mithril_1.default)(`td.reorderable-cell${cell.extraClasses}`, {
            draggable: 'draggable',
            class: this.getClassForIndex(index),
            ondragstart: (e) => {
                this.drag = {
                    from: index,
                };
                if (e.dataTransfer !== null) {
                    e.dataTransfer.setDragImage(placeholderElement, 0, 0);
                }
                (0, raf_1.scheduleFullRedraw)();
            },
            ondragover: (e) => {
                let target = e.target;
                if (this.drag === undefined || this.drag?.from === index) {
                    // Don't do anything when hovering on the same cell that's
                    // been dragged, or when dragging something other than the
                    // cell from the same group.
                    return;
                }
                while (target.tagName.toLowerCase() !== 'td' &&
                    target.parentElement !== null) {
                    target = target.parentElement;
                }
                // When hovering over cell on the right half, the cell will be
                // moved to the right of it, vice versa for the left side. This
                // is done such that it's possible to put dragged cell to every
                // possible position.
                const offset = e.clientX - target.getBoundingClientRect().x;
                const direction = offset > target.clientWidth / 2 ? 'right' : 'left';
                const dest = direction === 'left' ? index : index + 1;
                const adjustedDest = dest === this.drag.from || dest === this.drag.from + 1
                    ? undefined
                    : dest;
                if (adjustedDest !== this.drag.to) {
                    this.drag.to = adjustedDest;
                    (0, raf_1.scheduleFullRedraw)();
                }
            },
            ondragleave: (e) => {
                if (this.drag?.to !== index)
                    return;
                this.drag.to = undefined;
                (0, raf_1.scheduleFullRedraw)();
                if (e.dataTransfer !== null) {
                    e.dataTransfer.dropEffect = 'none';
                }
            },
            ondragend: () => {
                if (this.drag !== undefined &&
                    this.drag.to !== undefined &&
                    this.drag.from !== this.drag.to) {
                    vnode.attrs.onReorder(this.drag.from, this.drag.to);
                }
                this.drag = undefined;
                (0, raf_1.scheduleFullRedraw)();
            },
        }, cell.content));
    }
}
//# sourceMappingURL=basic_table.js.map