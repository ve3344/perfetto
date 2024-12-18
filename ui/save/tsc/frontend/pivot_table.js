"use strict";
// Copyright (C) 2022 The Android Open Source Project
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
exports.PivotTable = void 0;
exports.markFirst = markFirst;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const string_utils_1 = require("../base/string_utils");
const pivot_table_types_1 = require("../core/pivot_table_types");
const raf_scheduler_1 = require("../core/raf_scheduler");
const pivot_table_query_generator_1 = require("../core/pivot_table_query_generator");
const reorderable_cells_1 = require("./reorderable_cells");
const attribute_modal_holder_1 = require("./tables/attribute_modal_holder");
const duration_1 = require("../components/widgets/duration");
const sql_table_registry_1 = require("../components/widgets/sql/legacy_table/sql_table_registry");
const logging_1 = require("../base/logging");
const extensions_1 = require("../components/extensions");
const menu_1 = require("../widgets/menu");
const button_1 = require("../widgets/button");
const table_1 = require("../widgets/table");
function drillFilterColumnName(column) {
    switch (column.kind) {
        case 'argument':
            return {
                column: 'display_value',
                source: {
                    table: 'args',
                    joinOn: {
                        arg_set_id: 'arg_set_id',
                        key: (0, string_utils_1.sqliteString)(column.argument),
                    },
                },
            };
        case 'regular':
            return `${column.column}`;
    }
}
// Convert DrillFilter to SQL condition to be used in WHERE clause.
function renderDrillFilter(filter) {
    const column = drillFilterColumnName(filter.column);
    const value = filter.value;
    if (value === null) {
        return { op: (cols) => `${cols[0]} IS NULL`, columns: [column] };
    }
    else if (typeof value === 'number' || typeof value === 'bigint') {
        return { op: (cols) => `${cols[0]} = ${filter.value}`, columns: [column] };
    }
    else if (value instanceof Uint8Array) {
        throw new Error(`BLOB as DrillFilter not implemented`);
    }
    return {
        op: (cols) => `${cols[0]} = ${(0, string_utils_1.sqliteString)(value)}`,
        columns: [column],
    };
}
function readableColumnName(column) {
    switch (column.kind) {
        case 'argument':
            return `Argument ${column.argument}`;
        case 'regular':
            return `${column.column}`;
    }
}
function markFirst(index) {
    if (index === 0) {
        return '.first';
    }
    return '';
}
class PivotTable {
    pivotMgr;
    constructor({ attrs }) {
        this.pivotMgr = attrs.trace.pivotTable;
        this.attributeModalHolder = new attribute_modal_holder_1.AttributeModalHolder((arg) => this.pivotMgr.setPivotSelected({
            column: { kind: 'argument', argument: arg },
            selected: true,
        }));
    }
    get pivotState() {
        return this.pivotMgr.state;
    }
    renderDrillDownCell(attrs, filters) {
        return (0, mithril_1.default)('td', (0, mithril_1.default)('button', {
            title: 'All corresponding slices',
            onclick: () => {
                const queryFilters = filters.map(renderDrillFilter);
                if (this.pivotState.constrainToArea) {
                    queryFilters.push(...(0, pivot_table_query_generator_1.areaFilters)(attrs.selectionArea));
                }
                extensions_1.extensions.addLegacySqlTableTab(attrs.trace, {
                    table: (0, logging_1.assertExists)((0, sql_table_registry_1.getSqlTableDescription)('slice')),
                    // TODO(altimin): this should properly reference the required columns, but it works for now (until the pivot table is going to be rewritten to be more flexible).
                    filters: queryFilters,
                });
            },
        }, (0, mithril_1.default)('i.material-icons', 'arrow_right')));
    }
    renderSectionRow(attrs, path, tree, result) {
        const renderedCells = [];
        for (let j = 0; j + 1 < path.length; j++) {
            renderedCells.push((0, mithril_1.default)('td', (0, mithril_1.default)('span.indent', ' '), `${path[j].nextKey}`));
        }
        const treeDepth = result.metadata.pivotColumns.length;
        const colspan = treeDepth - path.length + 1;
        const button = (0, mithril_1.default)('button', {
            onclick: () => {
                tree.isCollapsed = !tree.isCollapsed;
                raf_scheduler_1.raf.scheduleFullRedraw();
            },
        }, (0, mithril_1.default)('i.material-icons', tree.isCollapsed ? 'expand_more' : 'expand_less'));
        renderedCells.push((0, mithril_1.default)('td', { colspan }, button, `${path[path.length - 1].nextKey}`));
        for (let i = 0; i < result.metadata.aggregationColumns.length; i++) {
            const renderedValue = this.renderCell(result.metadata.aggregationColumns[i].column, tree.aggregates[i]);
            renderedCells.push((0, mithril_1.default)('td' + markFirst(i), renderedValue));
        }
        const drillFilters = [];
        for (let i = 0; i < path.length; i++) {
            drillFilters.push({
                value: `${path[i].nextKey}`,
                column: result.metadata.pivotColumns[i],
            });
        }
        renderedCells.push(this.renderDrillDownCell(attrs, drillFilters));
        return (0, mithril_1.default)('tr', renderedCells);
    }
    renderCell(column, value) {
        if (column.kind === 'regular' &&
            (column.column === 'dur' || column.column === 'thread_dur')) {
            if (typeof value === 'bigint') {
                return (0, mithril_1.default)(duration_1.DurationWidget, { dur: value });
            }
            else if (typeof value === 'number') {
                return (0, mithril_1.default)(duration_1.DurationWidget, { dur: BigInt(Math.round(value)) });
            }
        }
        return `${value}`;
    }
    renderTree(attrs, path, tree, result, sink) {
        if (tree.isCollapsed) {
            sink.push(this.renderSectionRow(attrs, path, tree, result));
            return;
        }
        if (tree.children.size > 0) {
            // Avoid rendering the intermediate results row for the root of tree
            // and in case there's only one child subtree.
            if (!tree.isCollapsed && path.length > 0 && tree.children.size !== 1) {
                sink.push(this.renderSectionRow(attrs, path, tree, result));
            }
            for (const [key, childTree] of tree.children.entries()) {
                path.push({ tree: childTree, nextKey: key });
                this.renderTree(attrs, path, childTree, result, sink);
                path.pop();
            }
            return;
        }
        // Avoid rendering the intermediate results row if it has only one leaf
        // row.
        if (!tree.isCollapsed && path.length > 0 && tree.rows.length > 1) {
            sink.push(this.renderSectionRow(attrs, path, tree, result));
        }
        for (const row of tree.rows) {
            const renderedCells = [];
            const drillFilters = [];
            const treeDepth = result.metadata.pivotColumns.length;
            for (let j = 0; j < treeDepth; j++) {
                const value = this.renderCell(result.metadata.pivotColumns[j], row[j]);
                if (j < path.length) {
                    renderedCells.push((0, mithril_1.default)('td', (0, mithril_1.default)('span.indent', ' '), value));
                }
                else {
                    renderedCells.push((0, mithril_1.default)(`td`, value));
                }
                drillFilters.push({
                    column: result.metadata.pivotColumns[j],
                    value: row[j],
                });
            }
            for (let j = 0; j < result.metadata.aggregationColumns.length; j++) {
                const value = row[(0, pivot_table_query_generator_1.aggregationIndex)(treeDepth, j)];
                const renderedValue = this.renderCell(result.metadata.aggregationColumns[j].column, value);
                renderedCells.push((0, mithril_1.default)('td.aggregation' + markFirst(j), renderedValue));
            }
            renderedCells.push(this.renderDrillDownCell(attrs, drillFilters));
            sink.push((0, mithril_1.default)('tr', renderedCells));
        }
    }
    renderTotalsRow(queryResult) {
        const overallValuesRow = [
            (0, mithril_1.default)('td.total-values', { colspan: queryResult.metadata.pivotColumns.length }, (0, mithril_1.default)('strong', 'Total values:')),
        ];
        for (let i = 0; i < queryResult.metadata.aggregationColumns.length; i++) {
            overallValuesRow.push((0, mithril_1.default)('td' + markFirst(i), this.renderCell(queryResult.metadata.aggregationColumns[i].column, queryResult.tree.aggregates[i])));
        }
        overallValuesRow.push((0, mithril_1.default)('td'));
        return (0, mithril_1.default)('tr', overallValuesRow);
    }
    sortingItem(aggregationIndex, order) {
        const pivotMgr = this.pivotMgr;
        return (0, mithril_1.default)(menu_1.MenuItem, {
            label: order === 'DESC' ? 'Highest first' : 'Lowest first',
            onclick: () => {
                pivotMgr.setSortColumn(aggregationIndex, order);
            },
        });
    }
    readableAggregationName(aggregation) {
        if (aggregation.aggregationFunction === 'COUNT') {
            return 'Count';
        }
        return `${aggregation.aggregationFunction}(${readableColumnName(aggregation.column)})`;
    }
    aggregationPopupItem(aggregation, index, nameOverride) {
        return (0, mithril_1.default)(menu_1.MenuItem, {
            label: nameOverride ?? readableColumnName(aggregation.column),
            onclick: () => {
                this.pivotMgr.addAggregation(aggregation, index);
            },
        });
    }
    aggregationPopupTableGroup(table, columns, index) {
        const items = [];
        for (const column of columns) {
            const tableColumn = { kind: 'regular', table, column };
            items.push(this.aggregationPopupItem({ aggregationFunction: 'SUM', column: tableColumn }, index));
        }
        if (items.length === 0) {
            return undefined;
        }
        return (0, mithril_1.default)(menu_1.MenuItem, { label: `Add ${table} aggregation` }, items);
    }
    renderAggregationHeaderCell(aggregation, index, removeItem) {
        const popupItems = [];
        if (aggregation.sortDirection === undefined) {
            popupItems.push(this.sortingItem(index, 'DESC'), this.sortingItem(index, 'ASC'));
        }
        else {
            // Table is already sorted by the same column, return one item with
            // opposite direction.
            popupItems.push(this.sortingItem(index, aggregation.sortDirection === 'DESC' ? 'ASC' : 'DESC'));
        }
        const otherAggs = ['SUM', 'MAX', 'MIN', 'AVG'];
        if (aggregation.aggregationFunction !== 'COUNT') {
            for (const otherAgg of otherAggs) {
                if (aggregation.aggregationFunction === otherAgg) {
                    continue;
                }
                const pivotMgr = this.pivotMgr;
                popupItems.push((0, mithril_1.default)(menu_1.MenuItem, {
                    label: otherAgg,
                    onclick: () => {
                        pivotMgr.setAggregationFunction(index, otherAgg);
                    },
                }));
            }
        }
        if (removeItem) {
            popupItems.push((0, mithril_1.default)(menu_1.MenuItem, {
                label: 'Remove',
                onclick: () => {
                    this.pivotMgr.removeAggregation(index);
                },
            }));
        }
        let hasCount = false;
        for (const agg of this.pivotState.selectedAggregations.values()) {
            if (agg.aggregationFunction === 'COUNT') {
                hasCount = true;
            }
        }
        if (!hasCount) {
            popupItems.push(this.aggregationPopupItem(pivot_table_types_1.COUNT_AGGREGATION, index, 'Add count aggregation'));
        }
        const sliceAggregationsItem = this.aggregationPopupTableGroup((0, logging_1.assertExists)((0, sql_table_registry_1.getSqlTableDescription)('slice')).name, pivot_table_query_generator_1.sliceAggregationColumns, index);
        if (sliceAggregationsItem !== undefined) {
            popupItems.push(sliceAggregationsItem);
        }
        return {
            extraClass: '.aggregation' + markFirst(index),
            content: [
                this.readableAggregationName(aggregation),
                (0, mithril_1.default)(menu_1.PopupMenu2, {
                    trigger: (0, mithril_1.default)(button_1.Button, {
                        icon: (0, table_1.popupMenuIcon)(aggregation.sortDirection),
                    }),
                }, popupItems),
            ],
        };
    }
    attributeModalHolder;
    renderPivotColumnHeader(queryResult, pivot, selectedPivots) {
        const pivotMgr = this.pivotMgr;
        const items = [
            (0, mithril_1.default)(menu_1.MenuItem, {
                label: 'Add argument pivot',
                onclick: () => {
                    this.attributeModalHolder.start();
                },
            }),
        ];
        if (queryResult.metadata.pivotColumns.length > 1) {
            items.push((0, mithril_1.default)(menu_1.MenuItem, {
                label: 'Remove',
                onclick: () => {
                    pivotMgr.setPivotSelected({ column: pivot, selected: false });
                },
            }));
        }
        for (const table of pivot_table_query_generator_1.tables) {
            const group = [];
            for (const columnName of table.columns) {
                const column = {
                    kind: 'regular',
                    table: table.name,
                    column: columnName,
                };
                if (selectedPivots.has((0, pivot_table_types_1.columnKey)(column))) {
                    continue;
                }
                group.push((0, mithril_1.default)(menu_1.MenuItem, {
                    label: columnName,
                    onclick: () => {
                        pivotMgr.setPivotSelected({ column, selected: true });
                    },
                }));
            }
            items.push((0, mithril_1.default)(menu_1.MenuItem, {
                label: `Add ${table.displayName} pivot`,
            }, group));
        }
        return {
            content: [
                readableColumnName(pivot),
                (0, mithril_1.default)(menu_1.PopupMenu2, { trigger: (0, mithril_1.default)(button_1.Button, { icon: 'more_horiz' }) }, items),
            ],
        };
    }
    renderResultsTable(attrs) {
        const state = this.pivotState;
        const queryResult = state.queryResult;
        if (queryResult === undefined) {
            return (0, mithril_1.default)('div', 'Loading...');
        }
        const renderedRows = [];
        // We should not even be showing the tab if there's no results.
        const tree = queryResult.tree;
        (0, logging_1.assertFalse)(tree.children.size === 0 && tree.rows.length === 0);
        this.renderTree(attrs, [], tree, queryResult, renderedRows);
        const selectedPivots = new Set(this.pivotState.selectedPivots.map(pivot_table_types_1.columnKey));
        const pivotTableHeaders = state.selectedPivots.map((pivot) => this.renderPivotColumnHeader(queryResult, pivot, selectedPivots));
        const removeItem = queryResult.metadata.aggregationColumns.length > 1;
        const aggregationTableHeaders = queryResult.metadata.aggregationColumns.map((aggregation, index) => this.renderAggregationHeaderCell(aggregation, index, removeItem));
        return (0, mithril_1.default)('table.pivot-table', (0, mithril_1.default)('thead', 
        // First row of the table, containing names of pivot and aggregation
        // columns, as well as popup menus to modify the columns. Last cell
        // is empty because of an extra column with "drill down" button for
        // each pivot table row.
        (0, mithril_1.default)('tr.header', (0, mithril_1.default)(reorderable_cells_1.ReorderableCellGroup, {
            cells: pivotTableHeaders,
            onReorder: (from, to, direction) => {
                this.pivotMgr.setOrder(from, to, direction);
            },
        }), (0, mithril_1.default)(reorderable_cells_1.ReorderableCellGroup, {
            cells: aggregationTableHeaders,
            onReorder: (from, to, direction) => {
                this.pivotMgr.setAggregationOrder(from, to, direction);
            },
        }), (0, mithril_1.default)('td.menu', (0, mithril_1.default)(menu_1.PopupMenu2, {
            trigger: (0, mithril_1.default)(button_1.Button, { icon: 'menu' }),
        }, (0, mithril_1.default)(menu_1.MenuItem, {
            label: state.constrainToArea
                ? 'Query data for the whole timeline'
                : 'Constrain to selected area',
            onclick: () => {
                this.pivotMgr.setConstrainedToArea(!state.constrainToArea);
            },
        }))))), (0, mithril_1.default)('tbody', this.renderTotalsRow(queryResult), renderedRows));
    }
    view({ attrs }) {
        return (0, mithril_1.default)('.pivot-table', this.renderResultsTable(attrs));
    }
}
exports.PivotTable = PivotTable;
//# sourceMappingURL=pivot_table.js.map