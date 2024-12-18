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
exports.ChromeTasksThreadTrack = void 0;
const custom_sql_table_slice_track_1 = require("../../components/tracks/custom_sql_table_slice_track");
const details_1 = require("./details");
class ChromeTasksThreadTrack extends custom_sql_table_slice_track_1.CustomSqlTableSliceTrack {
    utid;
    constructor(trace, uri, utid) {
        super(trace, uri);
        this.utid = utid;
    }
    getSqlDataSource() {
        return {
            columns: ['name', 'id', 'ts', 'dur'],
            sqlTableName: 'chrome_tasks',
            whereClause: `utid = ${this.utid}`,
        };
    }
    detailsPanel(sel) {
        return new details_1.ChromeTasksDetailsPanel(this.trace, sel.eventId);
    }
}
exports.ChromeTasksThreadTrack = ChromeTasksThreadTrack;
//# sourceMappingURL=track.js.map