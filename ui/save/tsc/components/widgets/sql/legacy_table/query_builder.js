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
exports.buildSqlQuery = buildSqlQuery;
// Checks whether two join constraints are equal.
function areJoinConstraintsEqual(a, b) {
    if (Object.keys(a).length !== Object.keys(b).length) {
        return false;
    }
    for (const key of Object.keys(a)) {
        if (typeof a[key] !== typeof b[key]) {
            return false;
        }
        if (typeof a[key] === 'string') {
            return a[key] === b[key];
        }
        const aValue = a[key];
        const bValue = b[key];
        if (aValue.column !== bValue.column ||
            aValue.sourceTableId !== bValue.sourceTableId) {
            return false;
        }
    }
    return true;
}
// Class responsible for building a query and maintaing a list of normalised join tables.
class QueryBuilder {
    tables = [];
    tableAlias;
    constructor(tableName) {
        this.tableAlias = `${tableName}_0`;
    }
    // Normalises a column, including adding if necessary the joins to the list of tables.
    normalise(column) {
        if (typeof column === 'string') {
            return {
                column: column,
            };
        }
        const normalisedJoinOn = Object.fromEntries(Object.entries(column.source.joinOn).map(([key, value]) => [
            key,
            this.normalise(value),
        ]));
        // Check if this join is already present.
        for (let i = 0; i < this.tables.length; ++i) {
            const table = this.tables[i];
            if (table.table === column.source.table &&
                table.innerJoin === (column.source.innerJoin ?? false) &&
                areJoinConstraintsEqual(table.joinOn, normalisedJoinOn)) {
                return {
                    column: column.column,
                    sourceTableId: i,
                };
            }
        }
        // Otherwise, add a new join.
        this.tables.push({
            table: column.source.table,
            joinOn: normalisedJoinOn,
            innerJoin: column.source.innerJoin ?? false,
        });
        return {
            column: column.column,
            sourceTableId: this.tables.length - 1,
        };
    }
    // Prints a reference to a column, including properly disambiguated table alias.
    printColumn(column) {
        if (column.sourceTableId === undefined) {
            if (!/^[A-Za-z0-9_]*$/.test(column.column)) {
                // If this is an expression, don't prefix it with the table name.
                return column.column;
            }
            return `${this.tableAlias}.${column.column}`;
        }
        const table = this.tables[column.sourceTableId];
        // Dependent tables are 0-indexed, but we want to display them as 1-indexed to reserve 0 for the primary table.
        return `${table.table}_${column.sourceTableId + 1}.${column.column}`;
    }
    printJoin(joinIndex) {
        const join = this.tables[joinIndex];
        const alias = `${join.table}_${joinIndex + 1}`;
        const clauses = Object.entries(join.joinOn).map(([key, value]) => `${alias}.${key} = ${this.printColumn(value)}`);
        // Join IDs are 0-indexed, but we want to display them as 1-indexed to reserve 0 for the primary table.
        return `${join.innerJoin ? '' : 'LEFT '}JOIN ${join.table} AS ${alias} ON ${clauses.join(' AND ')}`;
    }
}
// Returns a query fetching the columns from the table, with the specified filters and order by clauses.
// keys of the `columns` object are the names of the columns in the result set.
function buildSqlQuery(args) {
    const builder = new QueryBuilder(args.table);
    const normalisedColumns = Object.fromEntries(Object.entries(args.columns).map(([key, value]) => [
        key,
        builder.normalise(value),
    ]));
    const normalisedFilters = (args.filters || []).map((filter) => ({
        op: filter.op,
        columns: filter.columns.map((column) => builder.normalise(column)),
    }));
    const normalisedOrderBy = (args.orderBy || []).map((orderBy) => ({
        order: orderBy.direction,
        column: builder.normalise(orderBy.column),
    }));
    const formatFilter = (filter) => {
        return filter.op(filter.columns.map((column) => builder.printColumn(column)));
    };
    const filterClause = normalisedFilters.length === 0
        ? ''
        : `WHERE\n ${normalisedFilters.map(formatFilter).join('\n  AND ')}`;
    const joinClause = builder.tables
        .map((_, index) => builder.printJoin(index))
        .join('\n');
    const orderByClause = normalisedOrderBy.length === 0
        ? ''
        : `ORDER BY\n  ${normalisedOrderBy.map((orderBy) => `${builder.printColumn(orderBy.column)} ${orderBy.order}`).join(',  ')}`;
    return `
    SELECT
      ${Object.entries(normalisedColumns)
        .map(([key, value]) => `${builder.printColumn(value)} AS ${key}`)
        .join(',\n  ')}
    FROM ${args.table} AS ${builder.tableAlias}
    ${joinClause}
    ${filterClause}
    ${orderByClause}
  `;
}
//# sourceMappingURL=query_builder.js.map