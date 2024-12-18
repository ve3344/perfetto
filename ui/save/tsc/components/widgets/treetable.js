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
exports.TreeTable = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const classnames_1 = require("../../base/classnames");
const raf_scheduler_1 = require("../../core/raf_scheduler");
class TreeTable {
    collapsedPaths = new Set();
    view({ attrs }) {
        const { columns, rows } = attrs;
        const headers = columns.map(({ name }) => (0, mithril_1.default)('th', name));
        const renderedRows = this.renderRows(rows, 0, attrs, []);
        return (0, mithril_1.default)('table.pf-treetable', (0, mithril_1.default)('thead', (0, mithril_1.default)('tr', headers)), (0, mithril_1.default)('tbody', renderedRows));
    }
    renderRows(rows, indentLevel, attrs, path) {
        const { columns, getChildren } = attrs;
        const renderedRows = [];
        for (const row of rows) {
            const childRows = getChildren(row);
            const key = this.keyForRow(row, attrs);
            const thisPath = path.concat([key]);
            const hasChildren = childRows && childRows.length > 0;
            const cols = columns.map(({ getData }, index) => {
                const classes = (0, classnames_1.classNames)(hasChildren && 'pf-treetable-node', this.isCollapsed(thisPath) && 'pf-collapsed');
                if (index === 0) {
                    const style = {
                        '--indentation-level': indentLevel,
                    };
                    return (0, mithril_1.default)('td', { style, class: (0, classnames_1.classNames)(classes, 'pf-treetable-maincol') }, (0, mithril_1.default)('.pf-treetable-gutter', {
                        onclick: () => {
                            if (this.isCollapsed(thisPath)) {
                                this.expandPath(thisPath);
                            }
                            else {
                                this.collapsePath(thisPath);
                            }
                            raf_scheduler_1.raf.scheduleFullRedraw();
                        },
                    }), getData(row));
                }
                else {
                    const style = {
                        '--indentation-level': 0,
                    };
                    return (0, mithril_1.default)('td', { style }, getData(row));
                }
            });
            renderedRows.push((0, mithril_1.default)('tr', cols));
            if (childRows && !this.isCollapsed(thisPath)) {
                renderedRows.push(this.renderRows(childRows, indentLevel + 1, attrs, thisPath));
            }
        }
        return renderedRows;
    }
    collapsePath(path) {
        const pathStr = path.join('/');
        this.collapsedPaths.add(pathStr);
    }
    expandPath(path) {
        const pathStr = path.join('/');
        this.collapsedPaths.delete(pathStr);
    }
    isCollapsed(path) {
        const pathStr = path.join('/');
        return this.collapsedPaths.has(pathStr);
    }
    keyForRow(row, attrs) {
        const { columns } = attrs;
        return columns[0].getData(row);
    }
}
exports.TreeTable = TreeTable;
//# sourceMappingURL=treetable.js.map