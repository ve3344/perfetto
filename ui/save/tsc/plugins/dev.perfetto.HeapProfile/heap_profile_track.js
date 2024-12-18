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
exports.HeapProfileTrack = void 0;
const time_1 = require("../../base/time");
const base_slice_track_1 = require("../../components/tracks/base_slice_track");
const selection_1 = require("../../public/selection");
const query_result_1 = require("../../trace_processor/query_result");
const heap_profile_details_panel_1 = require("./heap_profile_details_panel");
const HEAP_PROFILE_ROW = {
    ...base_slice_track_1.BASE_ROW,
    type: query_result_1.STR,
};
class HeapProfileTrack extends base_slice_track_1.BaseSliceTrack {
    tableName;
    upid;
    heapProfileIsIncomplete;
    constructor(trace, uri, tableName, upid, heapProfileIsIncomplete) {
        super(trace, uri);
        this.tableName = tableName;
        this.upid = upid;
        this.heapProfileIsIncomplete = heapProfileIsIncomplete;
    }
    getSqlSource() {
        return this.tableName;
    }
    getRowSpec() {
        return HEAP_PROFILE_ROW;
    }
    rowToSlice(row) {
        const slice = this.rowToSliceBase(row);
        return {
            ...slice,
            type: (0, selection_1.profileType)(row.type),
        };
    }
    onSliceOver(args) {
        args.tooltip = [args.slice.type];
    }
    async getSelectionDetails(id) {
        const query = `
      SELECT
        ts,
        dur,
        type
      FROM (${this.getSqlSource()})
      WHERE id = ${id}
    `;
        const result = await this.engine.query(query);
        if (result.numRows() === 0) {
            return undefined;
        }
        const row = result.iter({
            ts: query_result_1.LONG,
            dur: query_result_1.LONG,
            type: query_result_1.STR,
        });
        return {
            ts: time_1.Time.fromRaw(row.ts),
            dur: time_1.Duration.fromRaw(row.dur),
            profileType: (0, selection_1.profileType)(row.type),
        };
    }
    detailsPanel(sel) {
        return new heap_profile_details_panel_1.HeapProfileFlamegraphDetailsPanel(this.trace, this.heapProfileIsIncomplete, this.upid, sel);
    }
}
exports.HeapProfileTrack = HeapProfileTrack;
//# sourceMappingURL=heap_profile_track.js.map