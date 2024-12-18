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
exports.createQuerySliceTrack = createQuerySliceTrack;
const custom_sql_table_slice_track_1 = require("./custom_sql_table_slice_track");
const sql_table_slice_track_details_tab_1 = require("./sql_table_slice_track_details_tab");
const sql_utils_1 = require("../../trace_processor/sql_utils");
const string_utils_1 = require("../../base/string_utils");
/**
 * Creates a slice track based on a query with automatic slice layout.
 *
 * The query must provide the following columns:
 * - ts: INTEGER - The timestamp of the start of each slice.
 * - dur: INTEGER - The length of each slice.
 * - name: TEXT - A name to show on each slice, which is also used to derive the
 *   color.
 *
 * The column names don't have to be 'ts', 'dur', and 'name' and can be remapped
 * if convenient using the config.columns parameter.
 *
 * An optional set of columns can be provided which will be displayed in the
 * details panel when a slice is selected.
 *
 * The layout (vertical depth) of each slice will be determined automatically to
 * avoid overlapping slices.
 */
async function createQuerySliceTrack(args) {
    const tableName = `__query_slice_track_${(0, string_utils_1.sqlNameSafe)(args.uri)}`;
    await createPerfettoTableForTrack(args.trace.engine, tableName, args.data, args.columns, args.argColumns);
    return new SqlTableSliceTrack(args.trace, args.uri, tableName);
}
async function createPerfettoTableForTrack(engine, tableName, data, columns = {}, argColumns = []) {
    const { ts = 'ts', dur = 'dur', name = 'name' } = columns;
    // If the view has clashing names (e.g. "name" coming from joining two
    // different tables, we will see names like "name_1", "name_2", but they
    // won't be addressable from the SQL. So we explicitly name them through a
    // list of columns passed to CTE.
    const dataColumns = data.columns !== undefined ? `(${data.columns.join(', ')})` : '';
    const query = `
    with data${dataColumns} as (
      ${data.sqlSource}
    ),
    prepared_data as (
      select
        ${ts} as ts,
        ifnull(cast(${dur} as int), -1) as dur,
        printf('%s', ${name}) as name
        ${argColumns.length > 0 ? ',' : ''}
        ${argColumns.map((c) => `${c} as ${sql_table_slice_track_details_tab_1.ARG_PREFIX}${c}`).join(',\n')}
      from data
    )
    select
      row_number() over (order by ts) as id,
      *
    from prepared_data
    order by ts
  `;
    return await (0, sql_utils_1.createPerfettoTable)(engine, tableName, query);
}
class SqlTableSliceTrack extends custom_sql_table_slice_track_1.CustomSqlTableSliceTrack {
    sqlTableName;
    constructor(trace, uri, sqlTableName) {
        super(trace, uri);
        this.sqlTableName = sqlTableName;
    }
    getSqlDataSource() {
        return {
            sqlTableName: this.sqlTableName,
        };
    }
    detailsPanel({ eventId }) {
        return new sql_table_slice_track_details_tab_1.SqlTableSliceTrackDetailsPanel(this.trace, this.sqlTableName, eventId);
    }
}
//# sourceMappingURL=query_slice_track.js.map