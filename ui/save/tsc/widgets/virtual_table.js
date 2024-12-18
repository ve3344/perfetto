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
exports.VirtualTable = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const dom_utils_1 = require("../base/dom_utils");
const logging_1 = require("../base/logging");
const raf_1 = require("./raf");
const virtual_scroll_helper_1 = require("./virtual_scroll_helper");
const disposable_stack_1 = require("../base/disposable_stack");
class VirtualTable {
    CONTAINER_REF = 'CONTAINER';
    SLIDER_REF = 'SLIDER';
    trash = new disposable_stack_1.DisposableStack();
    renderBounds = { rowStart: 0, rowEnd: 0 };
    view({ attrs }) {
        const { columns, className, numRows, rowHeight, style } = attrs;
        return (0, mithril_1.default)('.pf-vtable', { className, style, ref: this.CONTAINER_REF }, (0, mithril_1.default)('.pf-vtable-content', (0, mithril_1.default)('.pf-vtable-header', columns.map((col) => (0, mithril_1.default)('.pf-vtable-data', { style: { width: col.width } }, col.header))), (0, mithril_1.default)('.pf-vtable-slider', { ref: this.SLIDER_REF, style: { height: `${rowHeight * numRows}px` } }, (0, mithril_1.default)('.pf-vtable-puck', {
            style: {
                transform: `translateY(${this.renderBounds.rowStart * rowHeight}px)`,
            },
        }, this.renderContent(attrs)))));
    }
    renderContent(attrs) {
        const rows = [];
        for (let i = this.renderBounds.rowStart; i < this.renderBounds.rowEnd; ++i) {
            rows.push(this.renderRow(attrs, i));
        }
        return rows;
    }
    renderRow(attrs, i) {
        const { rows, firstRowOffset, rowHeight, columns, onRowHover, onRowOut } = attrs;
        if (i >= firstRowOffset && i < firstRowOffset + rows.length) {
            // Render the row...
            const index = i - firstRowOffset;
            const rowData = rows[index];
            return (0, mithril_1.default)('.pf-vtable-row', {
                className: rowData.className,
                style: { height: `${rowHeight}px` },
                onmouseover: () => {
                    onRowHover?.(rowData.id);
                },
                onmouseout: () => {
                    onRowOut?.(rowData.id);
                },
            }, rowData.cells.map((data, colIndex) => (0, mithril_1.default)('.pf-vtable-data', { style: { width: columns[colIndex].width } }, data)));
        }
        else {
            // Render a placeholder div with the same height as a row but a
            // transparent background
            return (0, mithril_1.default)('', { style: { height: `${rowHeight}px` } });
        }
    }
    oncreate({ dom, attrs }) {
        const { renderOverdrawPx = 200, renderTolerancePx = 100, queryOverdrawPx = 10_000, queryTolerancePx = 5_000, } = attrs;
        const sliderEl = (0, dom_utils_1.toHTMLElement)((0, logging_1.assertExists)((0, dom_utils_1.findRef)(dom, this.SLIDER_REF)));
        const containerEl = (0, logging_1.assertExists)((0, dom_utils_1.findRef)(dom, this.CONTAINER_REF));
        const virtualScrollHelper = new virtual_scroll_helper_1.VirtualScrollHelper(sliderEl, containerEl, [
            {
                overdrawPx: renderOverdrawPx,
                tolerancePx: renderTolerancePx,
                callback: (rect) => {
                    const rowStart = Math.floor(rect.top / attrs.rowHeight / 2) * 2;
                    const rowCount = Math.ceil(rect.height / attrs.rowHeight / 2) * 2;
                    this.renderBounds = { rowStart, rowEnd: rowStart + rowCount };
                    (0, raf_1.scheduleFullRedraw)();
                },
            },
            {
                overdrawPx: queryOverdrawPx,
                tolerancePx: queryTolerancePx,
                callback: (rect) => {
                    const rowStart = Math.floor(rect.top / attrs.rowHeight / 2) * 2;
                    const rowEnd = Math.ceil(rect.bottom / attrs.rowHeight);
                    attrs.onReload?.(rowStart, rowEnd - rowStart);
                },
            },
        ]);
        this.trash.use(virtualScrollHelper);
    }
    onremove(_) {
        this.trash.dispose();
    }
}
exports.VirtualTable = VirtualTable;
//# sourceMappingURL=virtual_table.js.map