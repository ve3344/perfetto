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
const query_result_1 = require("../../trace_processor/query_result");
const query_slice_track_1 = require("../../components/tracks/query_slice_track");
const workspace_1 = require("../../public/workspace");
class default_1 {
    static id = 'dev.perfetto.TraceMetadata';
    async onTraceLoad(ctx) {
        const res = await ctx.engine.query(`
      select count() as cnt from (select 1 from clock_snapshot limit 1)
    `);
        const row = res.firstRow({ cnt: query_result_1.NUM });
        if (row.cnt === 0) {
            return;
        }
        const uri = `/clock_snapshots`;
        const title = 'Clock Snapshots';
        const track = await (0, query_slice_track_1.createQuerySliceTrack)({
            trace: ctx,
            uri,
            data: {
                sqlSource: `
          select ts, 0 as dur, 'Snapshot' as name
          from clock_snapshot
          `,
            },
        });
        ctx.tracks.registerTrack({
            uri,
            title,
            track,
        });
        const trackNode = new workspace_1.TrackNode({ uri, title });
        ctx.workspace.addChildInOrder(trackNode);
    }
}
exports.default = default_1;
//# sourceMappingURL=index.js.map