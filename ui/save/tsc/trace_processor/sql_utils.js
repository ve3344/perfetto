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
exports.constraintsToQueryPrefix = constraintsToQueryPrefix;
exports.constraintsToQuerySuffix = constraintsToQuerySuffix;
exports.fromNumNull = fromNumNull;
exports.sqlValueToReadableString = sqlValueToReadableString;
exports.sqlValueToSqliteString = sqlValueToSqliteString;
exports.matchesSqlValue = matchesSqlValue;
exports.getTableRowCount = getTableRowCount;
exports.createPerfettoTable = createPerfettoTable;
exports.createView = createView;
exports.createVirtualTable = createVirtualTable;
exports.createPerfettoIndex = createPerfettoIndex;
const object_utils_1 = require("../base/object_utils");
const string_utils_1 = require("../base/string_utils");
const query_result_1 = require("./query_result");
function isDefined(t) {
    return t !== undefined;
}
function constraintsToQueryPrefix(c) {
    const ctes = Object.entries(c.commonTableExpressions ?? {}).filter(([_, value]) => isDefined(value));
    if (ctes.length === 0)
        return '';
    const cteStatements = ctes.map(([name, query]) => `${name} AS (${query})`);
    return `WITH ${cteStatements.join(',\n')}`;
}
// Formatting given constraints into a string which can be injected into
// SQL query.
function constraintsToQuerySuffix(c) {
    const result = [];
    const joins = (c.joins ?? []).filter(isDefined);
    if (joins.length > 0) {
        result.push(...joins);
    }
    const filters = (c.filters ?? []).filter(isDefined);
    if (filters.length > 0) {
        result.push(`WHERE ${filters.join(' and ')}`);
    }
    const groupBy = (c.groupBy ?? []).filter(isDefined);
    if (groupBy.length > 0) {
        const groups = groupBy.join(', ');
        result.push(`GROUP BY ${groups}`);
    }
    const orderBy = (c.orderBy ?? []).filter(isDefined);
    if (orderBy.length > 0) {
        const orderBys = orderBy.map((clause) => {
            if ((0, object_utils_1.isString)(clause)) {
                return clause;
            }
            else {
                const direction = clause.direction ? ` ${clause.direction}` : '';
                return `${clause.fieldName}${direction}`;
            }
        });
        result.push(`ORDER BY ${orderBys.join(', ')}`);
    }
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (c.limit) {
        result.push(`LIMIT ${c.limit}`);
    }
    return result.join('\n');
}
// Trace Processor returns number | null for NUM_NULL, while most of the UI
// code uses number | undefined. This functions provides a short-hand
// conversion.
// TODO(altimin): Support NUM_UNDEFINED as a first-class citizen.
function fromNumNull(n) {
    if (n === null) {
        return undefined;
    }
    return n;
}
function sqlValueToReadableString(val) {
    if (val === undefined)
        return undefined;
    if (val instanceof Uint8Array) {
        return `<blob length=${val.length}>`;
    }
    if (val === null) {
        return 'NULL';
    }
    return val.toString();
}
// Given a SqlValue, return a string representation (properly escaped, if
// necessary) of it to be used in a SQL query.
function sqlValueToSqliteString(val) {
    if (val instanceof Uint8Array) {
        throw new Error("Can't pass blob back to trace processor as value");
    }
    if (val === null) {
        return 'NULL';
    }
    if (typeof val === 'string') {
        return (0, string_utils_1.sqliteString)(val);
    }
    return `${val}`;
}
// Return a SQL predicate that can be used to compare with the given `value`,
// correctly handling NULLs.
function matchesSqlValue(value) {
    if (value === null) {
        return 'IS NULL';
    }
    return `= ${sqlValueToSqliteString(value)}`;
}
async function getTableRowCount(engine, tableName) {
    const result = await engine.query(`SELECT COUNT() as count FROM ${tableName}`);
    if (result.numRows() === 0) {
        return undefined;
    }
    return result.firstRow({
        count: query_result_1.NUM,
    }).count;
}
/**
 * Asynchronously creates a 'perfetto' table using the given engine and returns
 * an disposable object to handle its cleanup.
 *
 * @param engine - The database engine to execute the query.
 * @param tableName - The name of the table to be created.
 * @param expression - The SQL expression to define the table.
 * @returns An AsyncDisposable which drops the created table when disposed.
 *
 * @example
 * const engine = new Engine();
 * const tableName = 'my_perfetto_table';
 * const expression = 'SELECT * FROM source_table';
 *
 * const table = await createPerfettoTable(engine, tableName, expression);
 *
 * // Use the table...
 *
 * // Cleanup the table when done
 * await table[Symbol.asyncDispose]();
 */
async function createPerfettoTable(engine, tableName, expression) {
    await engine.query(`CREATE PERFETTO TABLE ${tableName} AS ${expression}`);
    return {
        [Symbol.asyncDispose]: async () => {
            await engine.tryQuery(`DROP TABLE IF EXISTS ${tableName}`);
        },
    };
}
/**
 * Asynchronously creates a SQL view using the given engine and returns an
 * disposable object to handle its cleanup.
 *
 * @param engine - The database engine to execute the query.
 * @param viewName - The name of the view to be created.
 * @param as - The SQL expression to define the table.
 * @returns An AsyncDisposable which drops the created table when disposed.
 *
 * @example
 * const engine = new Engine();
 * const viewName = 'my_view';
 * const expression = 'SELECT * FROM source_table';
 *
 * const view = await createView(engine, viewName, expression);
 *
 * // Use the view...
 *
 * // Cleanup the view when done
 * await view[Symbol.asyncDispose]();
 */
async function createView(engine, viewName, as) {
    await engine.query(`CREATE VIEW ${viewName} AS ${as}`);
    return {
        [Symbol.asyncDispose]: async () => {
            await engine.tryQuery(`DROP VIEW IF EXISTS ${viewName}`);
        },
    };
}
async function createVirtualTable(engine, tableName, using) {
    await engine.query(`CREATE VIRTUAL TABLE ${tableName} USING ${using}`);
    return {
        [Symbol.asyncDispose]: async () => {
            await engine.tryQuery(`DROP TABLE IF EXISTS ${tableName}`);
        },
    };
}
/**
 * Asynchronously creates a 'perfetto' index using the given engine and returns
 * an disposable object to handle its cleanup.
 *
 * @param engine - The database engine to execute the query.
 * @param indexName - The name of the index to be created.
 * @param expression - The SQL expression containing the table and columns.
 * @returns An AsyncDisposable which drops the created table when disposed.
 *
 * @example
 * const engine = new Engine();
 * const indexName = 'my_perfetto_index';
 * const expression = 'my_perfetto_table(foo)';
 *
 * const index = await createPerfettoIndex(engine, indexName, expression);
 *
 * // Use the index...
 *
 * // Cleanup the index when done
 * await index[Symbol.asyncDispose]();
 */
async function createPerfettoIndex(engine, indexName, expression) {
    await engine.query(`create perfetto index ${indexName} on ${expression}`);
    return {
        [Symbol.asyncDispose]: async () => {
            await engine.tryQuery(`drop perfetto index ${indexName}`);
        },
    };
}
//# sourceMappingURL=sql_utils.js.map