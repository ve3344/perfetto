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
exports.CustomSqlTableSliceTrack = void 0;
const layout_1 = require("../sql_utils/layout");
const named_slice_track_1 = require("./named_slice_track");
const sql_utils_1 = require("../../trace_processor/sql_utils");
const disposable_stack_1 = require("../../base/disposable_stack");
const string_utils_1 = require("../../base/string_utils");
const dataset_1 = require("../../trace_processor/dataset");
const query_result_1 = require("../../trace_processor/query_result");
class CustomSqlTableSliceTrack extends named_slice_track_1.NamedSliceTrack {
    tableName;
    constructor(trace, uri) {
        super(trace, uri);
        this.tableName = `customsqltableslicetrack_${(0, string_utils_1.sqlNameSafe)(uri)}`;
    }
    getRowSpec() {
        return named_slice_track_1.NAMED_ROW;
    }
    rowToSlice(row) {
        return this.rowToSliceBase(row);
    }
    async onInit() {
        const config = this.getSqlDataSource();
        let columns = ['*'];
        if (config.columns !== undefined) {
            columns = config.columns;
        }
        const trash = new disposable_stack_1.AsyncDisposableStack();
        trash.use(await (0, sql_utils_1.createView)(this.engine, this.tableName, (0, layout_1.generateSqlWithInternalLayout)({
            columns: columns,
            sourceTable: config.sqlTableName,
            ts: 'ts',
            dur: 'dur',
            whereClause: config.whereClause,
        })));
        return trash;
    }
    getSqlSource() {
        return `SELECT * FROM ${this.tableName}`;
    }
    getDataset() {
        return new dataset_1.SourceDataset({
            src: this.makeSqlSelectStatement(),
            schema: {
                id: query_result_1.NUM,
                name: query_result_1.STR,
                ts: query_result_1.LONG,
                dur: query_result_1.LONG,
            },
        });
    }
    makeSqlSelectStatement() {
        const config = this.getSqlDataSource();
        let columns = ['*'];
        if (config.columns !== undefined) {
            columns = config.columns;
        }
        let query = `SELECT ${columns.join(',')} FROM ${config.sqlTableName}`;
        if (config.whereClause) {
            query += ` WHERE ${config.whereClause}`;
        }
        return query;
    }
}
exports.CustomSqlTableSliceTrack = CustomSqlTableSliceTrack;
//# sourceMappingURL=custom_sql_table_slice_track.js.map