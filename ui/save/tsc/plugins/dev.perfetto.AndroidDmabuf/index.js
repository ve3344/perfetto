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
const tslib_1 = require("tslib");
const query_counter_track_1 = require("../../components/tracks/query_counter_track");
const workspace_1 = require("../../public/workspace");
const query_result_1 = require("../../trace_processor/query_result");
const dev_perfetto_ProcessThreadGroups_1 = tslib_1.__importDefault(require("../dev.perfetto.ProcessThreadGroups"));
async function registerAllocsTrack(ctx, uri, dataSource) {
    const track = await (0, query_counter_track_1.createQueryCounterTrack)({
        trace: ctx,
        uri,
        data: dataSource,
    });
    ctx.tracks.registerTrack({
        uri,
        title: `dmabuf allocs`,
        track: track,
    });
}
class default_1 {
    static id = 'dev.perfetto.AndroidDmabuf';
    static dependencies = [dev_perfetto_ProcessThreadGroups_1.default];
    async onTraceLoad(ctx) {
        const e = ctx.engine;
        await e.query(`INCLUDE PERFETTO MODULE android.memory.dmabuf`);
        await e.query(`
      CREATE PERFETTO TABLE _android_memory_cumulative_dmabuf AS
      SELECT
        upid, utid, ts,
        SUM(buf_size) OVER(PARTITION BY COALESCE(upid, utid) ORDER BY ts) AS value
      FROM android_dmabuf_allocs;`);
        const pids = await e.query(`SELECT DISTINCT upid, IIF(upid IS NULL, utid, NULL) AS utid FROM _android_memory_cumulative_dmabuf`);
        const it = pids.iter({ upid: query_result_1.NUM_NULL, utid: query_result_1.NUM_NULL });
        for (; it.valid(); it.next()) {
            if (it.upid != null) {
                const uri = `/android_process_dmabuf_upid_${it.upid}`;
                const config = {
                    sqlSource: `SELECT ts, value FROM _android_memory_cumulative_dmabuf
                 WHERE upid = ${it.upid}`,
                };
                await registerAllocsTrack(ctx, uri, config);
                ctx.plugins
                    .getPlugin(dev_perfetto_ProcessThreadGroups_1.default)
                    .getGroupForProcess(it.upid)
                    ?.addChildInOrder(new workspace_1.TrackNode({ uri, title: 'dmabuf allocs' }));
            }
            else if (it.utid != null) {
                const uri = `/android_process_dmabuf_utid_${it.utid}`;
                const config = {
                    sqlSource: `SELECT ts, value FROM _android_memory_cumulative_dmabuf
                 WHERE utid = ${it.utid}`,
                };
                await registerAllocsTrack(ctx, uri, config);
                ctx.plugins
                    .getPlugin(dev_perfetto_ProcessThreadGroups_1.default)
                    .getGroupForThread(it.utid)
                    ?.addChildInOrder(new workspace_1.TrackNode({ uri, title: 'dmabuf allocs' }));
            }
        }
    }
}
exports.default = default_1;
//# sourceMappingURL=index.js.map