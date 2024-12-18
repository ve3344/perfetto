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
exports.PivotTableManager = exports.PivotTableTreeBuilder = exports.PIVOT_TABLE_REDUX_FLAG = void 0;
exports.computeIntervals = computeIntervals;
exports.performReordering = performReordering;
const pivot_table_types_1 = require("./pivot_table_types");
const pivot_table_query_generator_1 = require("./pivot_table_query_generator");
const logging_1 = require("../base/logging");
const feature_flags_1 = require("./feature_flags");
exports.PIVOT_TABLE_REDUX_FLAG = feature_flags_1.featureFlags.register({
    id: 'pivotTable',
    name: 'Pivot tables V2',
    description: 'Second version of pivot table',
    defaultValue: true,
});
function expectNumber(value) {
    if (typeof value === 'number') {
        return value;
    }
    else if (typeof value === 'bigint') {
        return Number(value);
    }
    throw new Error(`number or bigint was expected, got ${typeof value}`);
}
// Auxiliary class to build the tree from query response.
class PivotTableTreeBuilder {
    root;
    queryMetadata;
    get pivotColumnsCount() {
        return this.queryMetadata.pivotColumns.length;
    }
    get aggregateColumns() {
        return this.queryMetadata.aggregationColumns;
    }
    constructor(queryMetadata, firstRow) {
        this.queryMetadata = queryMetadata;
        this.root = this.createNode(firstRow);
        let tree = this.root;
        for (let i = 0; i + 1 < this.pivotColumnsCount; i++) {
            const value = firstRow[i];
            tree = this.insertChild(tree, value, this.createNode(firstRow));
        }
        tree.rows.push(firstRow);
    }
    // Add incoming row to the tree being built.
    ingestRow(row) {
        let tree = this.root;
        this.updateAggregates(tree, row);
        for (let i = 0; i + 1 < this.pivotColumnsCount; i++) {
            const nextTree = tree.children.get(row[i]);
            if (nextTree === undefined) {
                // Insert the new node into the tree, and make variable `tree` point
                // to the newly created node.
                tree = this.insertChild(tree, row[i], this.createNode(row));
            }
            else {
                this.updateAggregates(nextTree, row);
                tree = nextTree;
            }
        }
        tree.rows.push(row);
    }
    build() {
        return this.root;
    }
    updateAggregates(tree, row) {
        const countIndex = this.queryMetadata.countIndex;
        const treeCount = countIndex >= 0 ? expectNumber(tree.aggregates[countIndex]) : 0;
        const rowCount = countIndex >= 0
            ? expectNumber(row[(0, pivot_table_query_generator_1.aggregationIndex)(this.pivotColumnsCount, countIndex)])
            : 0;
        for (let i = 0; i < this.aggregateColumns.length; i++) {
            const agg = this.aggregateColumns[i];
            const currAgg = tree.aggregates[i];
            const childAgg = row[(0, pivot_table_query_generator_1.aggregationIndex)(this.pivotColumnsCount, i)];
            if (typeof currAgg === 'number' && typeof childAgg === 'number') {
                switch (agg.aggregationFunction) {
                    case 'SUM':
                    case 'COUNT':
                        tree.aggregates[i] = currAgg + childAgg;
                        break;
                    case 'MAX':
                        tree.aggregates[i] = Math.max(currAgg, childAgg);
                        break;
                    case 'MIN':
                        tree.aggregates[i] = Math.min(currAgg, childAgg);
                        break;
                    case 'AVG': {
                        const currSum = currAgg * treeCount;
                        const addSum = childAgg * rowCount;
                        tree.aggregates[i] = (currSum + addSum) / (treeCount + rowCount);
                        break;
                    }
                }
            }
        }
        tree.aggregates[this.aggregateColumns.length] = treeCount + rowCount;
    }
    // Helper method that inserts child node into the tree and returns it, used
    // for more concise modification of local variable pointing to the current
    // node being built.
    insertChild(tree, key, child) {
        tree.children.set(key, child);
        return child;
    }
    // Initialize PivotTree from a row.
    createNode(row) {
        const aggregates = [];
        for (let j = 0; j < this.aggregateColumns.length; j++) {
            aggregates.push(row[(0, pivot_table_query_generator_1.aggregationIndex)(this.pivotColumnsCount, j)]);
        }
        aggregates.push(row[(0, pivot_table_query_generator_1.aggregationIndex)(this.pivotColumnsCount, this.aggregateColumns.length)]);
        return {
            isCollapsed: false,
            children: new Map(),
            aggregates,
            rows: [],
        };
    }
}
exports.PivotTableTreeBuilder = PivotTableTreeBuilder;
function createEmptyQueryResult(metadata) {
    return {
        tree: {
            aggregates: [],
            isCollapsed: false,
            children: new Map(),
            rows: [],
        },
        metadata,
    };
}
// Controller responsible for showing the panel with pivot table, as well as
// executing its queries and post-processing query results.
class PivotTableManager {
    engine;
    state = createEmptyPivotTableState();
    constructor(engine) {
        this.engine = engine;
    }
    setSelectionArea(area) {
        if (!exports.PIVOT_TABLE_REDUX_FLAG.get()) {
            return;
        }
        this.state.selectionArea = area;
        this.refresh();
    }
    addAggregation(aggregation, after) {
        this.state.selectedAggregations.splice(after, 0, aggregation);
        this.refresh();
    }
    removeAggregation(index) {
        this.state.selectedAggregations.splice(index, 1);
        this.refresh();
    }
    setPivotSelected(args) {
        (0, pivot_table_types_1.toggleEnabled)(pivot_table_types_1.tableColumnEquals, this.state.selectedPivots, args.column, args.selected);
        this.refresh();
    }
    setAggregationFunction(index, fn) {
        this.state.selectedAggregations[index].aggregationFunction = fn;
        this.refresh();
    }
    setSortColumn(aggregationIndex, order) {
        this.state.selectedAggregations = this.state.selectedAggregations.map((agg, index) => ({
            column: agg.column,
            aggregationFunction: agg.aggregationFunction,
            sortDirection: index === aggregationIndex ? order : undefined,
        }));
        this.refresh();
    }
    setOrder(from, to, direction) {
        const pivots = this.state.selectedPivots;
        this.state.selectedPivots = performReordering(computeIntervals(pivots.length, from, to, direction), pivots);
        this.refresh();
    }
    setAggregationOrder(from, to, direction) {
        const aggregations = this.state.selectedAggregations;
        this.state.selectedAggregations = performReordering(computeIntervals(aggregations.length, from, to, direction), aggregations);
        this.refresh();
    }
    setConstrainedToArea(constrain) {
        this.state.constrainToArea = constrain;
        this.refresh();
    }
    refresh() {
        this.state.queryResult = undefined;
        if (!exports.PIVOT_TABLE_REDUX_FLAG.get()) {
            return;
        }
        this.processQuery((0, pivot_table_query_generator_1.generateQueryFromState)(this.state));
    }
    async processQuery(query) {
        const result = await this.engine.query(query.text);
        try {
            await result.waitAllRows();
        }
        catch {
            // waitAllRows() frequently throws an exception, which is ignored in
            // its other calls, so it's ignored here as well.
        }
        const columns = result.columns();
        const it = result.iter({});
        function nextRow() {
            const row = [];
            for (const column of columns) {
                row.push(it.get(column));
            }
            it.next();
            return row;
        }
        if (!it.valid()) {
            // Iterator is invalid after creation; means that there are no rows
            // satisfying filtering criteria. Return an empty tree.
            this.state.queryResult = createEmptyQueryResult(query.metadata);
            return;
        }
        const treeBuilder = new PivotTableTreeBuilder(query.metadata, nextRow());
        while (it.valid()) {
            treeBuilder.ingestRow(nextRow());
        }
        this.state.queryResult = {
            tree: treeBuilder.build(),
            metadata: query.metadata,
        };
    }
}
exports.PivotTableManager = PivotTableManager;
function createEmptyPivotTableState() {
    return {
        queryResult: undefined,
        selectedPivots: [
            {
                kind: 'regular',
                table: '_slice_with_thread_and_process_info',
                column: 'name',
            },
        ],
        selectedAggregations: [
            {
                aggregationFunction: 'SUM',
                column: {
                    kind: 'regular',
                    table: '_slice_with_thread_and_process_info',
                    column: 'dur',
                },
                sortDirection: 'DESC',
            },
            {
                aggregationFunction: 'SUM',
                column: {
                    kind: 'regular',
                    table: '_slice_with_thread_and_process_info',
                    column: 'thread_dur',
                },
            },
            pivot_table_types_1.COUNT_AGGREGATION,
        ],
        constrainToArea: true,
    };
}
/*
 * When a drag'n'drop is performed in a linear sequence, the resulting reordered
 * array will consist of several contiguous subarrays of the original glued
 * together.
 *
 * This function implements the computation of these intervals.
 *
 * The drag'n'drop operation performed is as follows: in the sequence with given
 * length, the element with index `dragFrom` is dropped on the `direction` to
 * the element `dragTo`.
 */
function computeIntervals(length, dragFrom, dragTo, direction) {
    (0, logging_1.assertTrue)(dragFrom !== dragTo);
    if (dragTo < dragFrom) {
        const prefixLen = direction == 'left' ? dragTo : dragTo + 1;
        return [
            // First goes unchanged prefix.
            { from: 0, to: prefixLen },
            // Then goes dragged element.
            { from: dragFrom, to: dragFrom + 1 },
            // Then goes suffix up to dragged element (which has already been moved).
            { from: prefixLen, to: dragFrom },
            // Then the rest of an array.
            { from: dragFrom + 1, to: length },
        ];
    }
    // Other case: dragTo > dragFrom
    const prefixLen = direction == 'left' ? dragTo : dragTo + 1;
    return [
        { from: 0, to: dragFrom },
        { from: dragFrom + 1, to: prefixLen },
        { from: dragFrom, to: dragFrom + 1 },
        { from: prefixLen, to: length },
    ];
}
function performReordering(intervals, arr) {
    const result = [];
    for (const interval of intervals) {
        result.push(...arr.slice(interval.from, interval.to));
    }
    return result;
}
//# sourceMappingURL=pivot_table_manager.js.map