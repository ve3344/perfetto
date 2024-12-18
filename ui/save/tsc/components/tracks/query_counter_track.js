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
exports.createQueryCounterTrack = createQueryCounterTrack;
const sql_utils_1 = require("../../trace_processor/sql_utils");
const string_utils_1 = require("../../base/string_utils");
const base_counter_track_1 = require("./base_counter_track");
/**
 * Creates a counter track based on a query.
 *
 * The query must provide the following columns:
 * - ts: INTEGER - The timestamp of each sample.
 * - value: REAL | INTEGER - The value of each sample.
 *
 * The column names don't have to be 'ts' and 'value', and can be remapped if
 * convenient using the config.columns parameter.
 */
async function createQueryCounterTrack(args) {
    const tableName = `__query_counter_track_${(0, string_utils_1.sqlNameSafe)(args.uri)}`;
    await createPerfettoTableForTrack(args.trace.engine, tableName, args.data, args.columns);
    return new SqlTableCounterTrack(args.trace, args.uri, tableName, args.options);
}
async function createPerfettoTableForTrack(engine, tableName, data, columnMapping = {}) {
    const { ts = 'ts', value = 'value' } = columnMapping;
    const query = `
    with data as (
      ${data.sqlSource}
    )
    select
      ${ts} as ts,
      ${value} as value
    from data
    order by ts
  `;
    return await (0, sql_utils_1.createPerfettoTable)(engine, tableName, query);
}
class SqlTableCounterTrack extends base_counter_track_1.BaseCounterTrack {
    sqlTableName;
    constructor(trace, uri, sqlTableName, options) {
        super(trace, uri, options);
        this.sqlTableName = sqlTableName;
    }
    getSqlSource() {
        return `select * from ${this.sqlTableName}`;
    }
}
//# sourceMappingURL=query_counter_track.js.map