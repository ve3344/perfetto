"use strict";
// Copyright (C) 2021 The Android Open Source Project
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
const tslib_1 = require("tslib");
const track_kinds_1 = require("../../public/track_kinds");
const query_result_1 = require("../../trace_processor/query_result");
const heap_profile_track_1 = require("./heap_profile_track");
const workspace_1 = require("../../public/workspace");
const sql_utils_1 = require("../../trace_processor/sql_utils");
const dev_perfetto_ProcessThreadGroups_1 = tslib_1.__importDefault(require("../dev.perfetto.ProcessThreadGroups"));
function getUriForTrack(upid) {
    return `/process_${upid}/heap_profile`;
}
class default_1 {
    static id = 'dev.perfetto.HeapProfile';
    static dependencies = [dev_perfetto_ProcessThreadGroups_1.default];
    async onTraceLoad(ctx) {
        const it = await ctx.engine.query(`
      select value from stats
      where name = 'heap_graph_non_finalized_graph'
    `);
        const incomplete = it.firstRow({ value: query_result_1.NUM }).value > 0;
        const result = await ctx.engine.query(`
      select distinct upid from heap_profile_allocation
      union
      select distinct upid from heap_graph_object
    `);
        for (const it = result.iter({ upid: query_result_1.NUM }); it.valid(); it.next()) {
            const upid = it.upid;
            const uri = getUriForTrack(upid);
            const title = 'Heap Profile';
            const tableName = `_heap_profile_${upid}`;
            (0, sql_utils_1.createPerfettoTable)(ctx.engine, tableName, `
          with
            heaps as (select group_concat(distinct heap_name) h from heap_profile_allocation where upid = ${upid}),
            allocation_tses as (select distinct ts from heap_profile_allocation where upid = ${upid}),
            graph_tses as (select distinct graph_sample_ts from heap_graph_object where upid = ${upid})
          select
            *,
            0 AS dur,
            0 AS depth
          from (
            select
              (
                select a.id
                from heap_profile_allocation a
                where a.ts = t.ts
                order by a.id
                limit 1
              ) as id,
              ts,
              'heap_profile:' || (select h from heaps) AS type
            from allocation_tses t
            union all
            select
              (
                select o.id
                from heap_graph_object o
                where o.graph_sample_ts = g.graph_sample_ts
                order by o.id
                limit 1
              ) as id,
              graph_sample_ts AS ts,
              'graph' AS type
            from graph_tses g
          )
        `);
            ctx.tracks.registerTrack({
                uri,
                title,
                tags: {
                    kind: track_kinds_1.HEAP_PROFILE_TRACK_KIND,
                    upid,
                },
                track: new heap_profile_track_1.HeapProfileTrack(ctx, uri, tableName, upid, incomplete),
            });
            const group = ctx.plugins
                .getPlugin(dev_perfetto_ProcessThreadGroups_1.default)
                .getGroupForProcess(upid);
            const track = new workspace_1.TrackNode({ uri, title, sortOrder: -30 });
            group?.addChildInOrder(track);
        }
        ctx.onTraceReady.addListener(async () => {
            await selectFirstHeapProfile(ctx);
        });
    }
}
exports.default = default_1;
async function selectFirstHeapProfile(ctx) {
    const query = `
    select * from (
      select
        min(ts) AS ts,
        'heap_profile:' || group_concat(distinct heap_name) AS type,
        upid
      from heap_profile_allocation
      group by upid
      union
      select distinct graph_sample_ts as ts, 'graph' as type, upid
      from heap_graph_object
    )
    order by ts
    limit 1
  `;
    const profile = await ctx.engine.query(query);
    if (profile.numRows() !== 1)
        return;
    const row = profile.firstRow({ ts: query_result_1.LONG, type: query_result_1.STR, upid: query_result_1.NUM });
    const upid = row.upid;
    ctx.selection.selectTrackEvent(getUriForTrack(upid), 0);
}
//# sourceMappingURL=index.js.map