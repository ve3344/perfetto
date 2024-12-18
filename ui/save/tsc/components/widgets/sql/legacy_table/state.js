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
exports.SqlTableState = void 0;
const query_result_1 = require("../../../../trace_processor/query_result");
const column_1 = require("./column");
const query_builder_1 = require("./query_builder");
const raf_scheduler_1 = require("../../../../core/raf_scheduler");
const logging_1 = require("../../../../base/logging");
const ROW_LIMIT = 100;
function isFilterEqual(a, b) {
    return (a.op === b.op &&
        a.columns.length === b.columns.length &&
        a.columns.every((c, i) => (0, column_1.isSqlColumnEqual)(c, b.columns[i])));
}
function areFiltersEqual(a, b) {
    if (a.length !== b.length)
        return false;
    return a.every((f, i) => isFilterEqual(f, b[i]));
}
class SqlTableState {
    trace;
    config;
    args;
    additionalImports;
    // Columns currently displayed to the user. All potential columns can be found `this.table.columns`.
    columns;
    filters;
    orderBy;
    offset = 0;
    request;
    data;
    rowCount;
    constructor(trace, config, args) {
        this.trace = trace;
        this.config = config;
        this.args = args;
        this.additionalImports = args?.imports || [];
        this.filters = args?.filters || [];
        this.columns = [];
        if (args?.initialColumns !== undefined) {
            (0, logging_1.assertTrue)(args?.additionalColumns === undefined, 'Only one of `initialColumns` and `additionalColumns` can be set');
            this.columns.push(...args.initialColumns);
        }
        else {
            for (const column of this.config.columns) {
                if (column instanceof column_1.LegacyTableColumn) {
                    if (column.startsHidden !== true) {
                        this.columns.push(column);
                    }
                }
                else {
                    const cols = column.initialColumns?.();
                    for (const col of cols ?? []) {
                        this.columns.push(col);
                    }
                }
            }
            if (args?.additionalColumns !== undefined) {
                this.columns.push(...args.additionalColumns);
            }
        }
        this.orderBy = args?.orderBy ?? [];
        this.request = this.buildRequest();
        this.reload();
    }
    clone() {
        return new SqlTableState(this.trace, this.config, {
            initialColumns: this.columns,
            imports: this.args?.imports,
            filters: this.filters,
            orderBy: this.orderBy,
        });
    }
    getSQLImports() {
        const tableImports = this.config.imports || [];
        return [...tableImports, ...this.additionalImports]
            .map((i) => `INCLUDE PERFETTO MODULE ${i};`)
            .join('\n');
    }
    getCountRowsSQLQuery() {
        return `
      ${this.getSQLImports()}

      ${this.getSqlQuery({ count: 'COUNT()' })}
    `;
    }
    // Return a query which selects the given columns, applying the filters and ordering currently in effect.
    getSqlQuery(columns) {
        return (0, query_builder_1.buildSqlQuery)({
            table: this.config.name,
            columns,
            filters: this.filters,
            orderBy: this.getOrderedBy(),
        });
    }
    // We need column names to pass to the debug track creation logic.
    buildSqlSelectStatement() {
        const columns = {};
        // A set of columnIds for quick lookup.
        const sqlColumnIds = new Set();
        // We want to use the shortest posible name for each column, but we also need to mindful of potential collisions.
        // To avoid collisions, we append a number to the column name if there are multiple columns with the same name.
        const columnNameCount = {};
        const tableColumns = [];
        for (const column of this.columns) {
            // If TableColumn has an alias, use it. Otherwise, use the column name.
            const name = (0, column_1.tableColumnAlias)(column);
            if (!(name in columnNameCount)) {
                columnNameCount[name] = 0;
            }
            // Note: this can break if the user specifies a column which ends with `__<number>`.
            // We intentionally use two underscores to avoid collisions and will fix it down the line if it turns out to be a problem.
            const alias = `${name}__${++columnNameCount[name]}`;
            tableColumns.push({ column, name, alias });
        }
        for (const column of tableColumns) {
            const sqlColumn = column.column.primaryColumn();
            // If we have only one column with this name, we don't need to disambiguate it.
            if (columnNameCount[column.name] === 1) {
                columns[column.name] = sqlColumn;
            }
            else {
                columns[column.alias] = sqlColumn;
            }
            sqlColumnIds.add((0, column_1.sqlColumnId)(sqlColumn));
        }
        // We are going to be less fancy for the dependendent columns can just always suffix them with a unique integer.
        let dependentColumnCount = 0;
        for (const column of tableColumns) {
            const dependentColumns = column.column.dependentColumns !== undefined
                ? column.column.dependentColumns()
                : {};
            for (const col of Object.values(dependentColumns)) {
                if (sqlColumnIds.has((0, column_1.sqlColumnId)(col)))
                    continue;
                const name = typeof col === 'string' ? col : col.column;
                const alias = `__${name}_${dependentColumnCount++}`;
                columns[alias] = col;
                sqlColumnIds.add((0, column_1.sqlColumnId)(col));
            }
        }
        return {
            selectStatement: this.getSqlQuery(columns),
            columns: Object.fromEntries(Object.entries(columns).map(([key, value]) => [
                (0, column_1.sqlColumnId)(value),
                key,
            ])),
        };
    }
    getNonPaginatedSQLQuery() {
        return `
      ${this.getSQLImports()}

      ${this.buildSqlSelectStatement().selectStatement}
    `;
    }
    getPaginatedSQLQuery() {
        return this.request;
    }
    canGoForward() {
        if (this.data === undefined)
            return false;
        return this.data.rows.length > ROW_LIMIT;
    }
    canGoBack() {
        if (this.data === undefined)
            return false;
        return this.offset > 0;
    }
    goForward() {
        if (!this.canGoForward())
            return;
        this.offset += ROW_LIMIT;
        this.reload({ offset: 'keep' });
    }
    goBack() {
        if (!this.canGoBack())
            return;
        this.offset -= ROW_LIMIT;
        this.reload({ offset: 'keep' });
    }
    getDisplayedRange() {
        if (this.data === undefined)
            return undefined;
        return {
            from: this.offset + 1,
            to: this.offset + Math.min(this.data.rows.length, ROW_LIMIT),
        };
    }
    async loadRowCount() {
        const filters = Array.from(this.filters);
        const res = await this.trace.engine.query(this.getCountRowsSQLQuery());
        if (res.error() !== undefined)
            return undefined;
        return {
            count: res.firstRow({ count: query_result_1.NUM }).count,
            filters: filters,
        };
    }
    buildRequest() {
        const { selectStatement, columns } = this.buildSqlSelectStatement();
        // We fetch one more row to determine if we can go forward.
        const query = `
      ${this.getSQLImports()}
      ${selectStatement}
      LIMIT ${ROW_LIMIT + 1}
      OFFSET ${this.offset}
    `;
        return { selectStatement, query, columns };
    }
    async loadData() {
        const queryRes = await this.trace.engine.query(this.request.query);
        const rows = [];
        for (const it = queryRes.iter({}); it.valid(); it.next()) {
            const row = {};
            for (const column of queryRes.columns()) {
                row[column] = it.get(column);
            }
            rows.push(row);
        }
        return {
            rows,
            error: queryRes.error(),
        };
    }
    async reload(params) {
        if ((params?.offset ?? 'reset') === 'reset') {
            this.offset = 0;
        }
        const newFilters = this.rowCount?.filters;
        const filtersMatch = newFilters && areFiltersEqual(newFilters, this.filters);
        this.data = undefined;
        const request = this.buildRequest();
        this.request = request;
        if (!filtersMatch) {
            this.rowCount = undefined;
        }
        // Schedule a full redraw to happen after a short delay (50 ms).
        // This is done to prevent flickering / visual noise and allow the UI to fetch
        // the initial data from the Trace Processor.
        // There is a chance that someone else schedules a full redraw in the
        // meantime, forcing the flicker, but in practice it works quite well and
        // avoids a lot of complexity for the callers.
        // 50ms is half of the responsiveness threshold (100ms):
        // https://web.dev/rail/#response-process-events-in-under-50ms
        setTimeout(() => raf_scheduler_1.raf.scheduleFullRedraw(), 50);
        if (!filtersMatch) {
            this.rowCount = await this.loadRowCount();
        }
        const data = await this.loadData();
        // If the request has changed since we started loading the data, do not update the state.
        if (this.request !== request)
            return;
        this.data = data;
        raf_scheduler_1.raf.scheduleFullRedraw();
    }
    getTotalRowCount() {
        return this.rowCount?.count;
    }
    getCurrentRequest() {
        return this.request;
    }
    getDisplayedRows() {
        return this.data?.rows || [];
    }
    getQueryError() {
        return this.data?.error;
    }
    isLoading() {
        return this.data === undefined;
    }
    addFilter(filter) {
        this.filters.push(filter);
        this.reload();
    }
    removeFilter(filter) {
        this.filters = this.filters.filter((f) => !isFilterEqual(f, filter));
        this.reload();
    }
    getFilters() {
        return this.filters;
    }
    sortBy(clause) {
        // Remove previous sort by the same column.
        this.orderBy = this.orderBy.filter((c) => (0, column_1.tableColumnId)(c.column) != (0, column_1.tableColumnId)(clause.column));
        // Add the new sort clause to the front, so we effectively stable-sort the
        // data currently displayed to the user.
        this.orderBy.unshift(clause);
        this.reload();
    }
    unsort() {
        this.orderBy = [];
        this.reload();
    }
    isSortedBy(column) {
        if (this.orderBy.length === 0)
            return undefined;
        if ((0, column_1.tableColumnId)(this.orderBy[0].column) !== (0, column_1.tableColumnId)(column)) {
            return undefined;
        }
        return this.orderBy[0].direction;
    }
    getOrderedBy() {
        const result = [];
        for (const orderBy of this.orderBy) {
            const sortColumns = orderBy.column.sortColumns?.() ?? [
                orderBy.column.primaryColumn(),
            ];
            for (const column of sortColumns) {
                result.push({ column, direction: orderBy.direction });
            }
        }
        return result;
    }
    addColumn(column, index) {
        this.columns.splice(index + 1, 0, column);
        this.reload({ offset: 'keep' });
    }
    hideColumnAtIndex(index) {
        const column = this.columns[index];
        this.columns.splice(index, 1);
        // We can only filter by the visibile columns to avoid confusing the user,
        // so we remove order by clauses that refer to the hidden column.
        this.orderBy = this.orderBy.filter((c) => (0, column_1.tableColumnId)(c.column) !== (0, column_1.tableColumnId)(column));
        // TODO(altimin): we can avoid the fetch here if the orderBy hasn't changed.
        this.reload({ offset: 'keep' });
    }
    moveColumn(fromIndex, toIndex) {
        if (fromIndex === toIndex)
            return;
        const column = this.columns[fromIndex];
        this.columns.splice(fromIndex, 1);
        if (fromIndex < toIndex) {
            // We have deleted a column, therefore we need to adjust the target index.
            --toIndex;
        }
        this.columns.splice(toIndex, 0, column);
        raf_scheduler_1.raf.scheduleFullRedraw();
    }
    getSelectedColumns() {
        return this.columns;
    }
}
exports.SqlTableState = SqlTableState;
//# sourceMappingURL=state.js.map