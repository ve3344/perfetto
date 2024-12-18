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
const query_result_1 = require("../../trace_processor/query_result");
const named_slice_track_1 = require("../../components/tracks/named_slice_track");
const workspace_1 = require("../../public/workspace");
class GpuPidTrack extends named_slice_track_1.NamedSliceTrack {
    upid;
    constructor(trace, uri, upid) {
        super(trace, uri);
        this.upid = upid;
        this.upid = upid;
    }
    getRowSpec() {
        return named_slice_track_1.NAMED_ROW;
    }
    rowToSlice(row) {
        return this.rowToSliceBase(row);
    }
    getSqlSource() {
        return `
      SELECT *
      FROM gpu_slice
      WHERE upid = ${this.upid}
    `;
    }
}
class default_1 {
    static id = 'dev.perfetto.GpuByProcess';
    async onTraceLoad(ctx) {
        // Find all unique upid values in gpu_slices and join with process table.
        const results = await ctx.engine.query(`
      WITH slice_upids AS (
        SELECT DISTINCT upid FROM gpu_slice
      )
      SELECT upid, pid, name FROM slice_upids JOIN process USING (upid)
    `);
        const it = results.iter({
            upid: query_result_1.NUM_NULL,
            pid: query_result_1.NUM_NULL,
            name: query_result_1.STR_NULL,
        });
        // For each upid, create a GpuPidTrack.
        for (; it.valid(); it.next()) {
            if (it.upid == null) {
                continue;
            }
            const upid = it.upid;
            let processName = 'Unknown';
            if (it.name != null) {
                processName = it.name;
            }
            else if (it.pid != null) {
                processName = `${it.pid}`;
            }
            const uri = `dev.perfetto.GpuByProcess#${upid}`;
            const title = `GPU ${processName}`;
            ctx.tracks.registerTrack({
                uri,
                title,
                track: new GpuPidTrack(ctx, uri, upid),
            });
            const track = new workspace_1.TrackNode({ uri, title });
            ctx.workspace.addChildInOrder(track);
        }
    }
}
exports.default = default_1;
//# sourceMappingURL=index.js.map