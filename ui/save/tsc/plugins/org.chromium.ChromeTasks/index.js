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
const core_types_1 = require("../../components/sql_utils/core_types");
const query_result_1 = require("../../trace_processor/query_result");
const track_1 = require("./track");
const workspace_1 = require("../../public/workspace");
class default_1 {
    static id = 'org.chromium.ChromeTasks';
    async onTraceLoad(ctx) {
        await this.createTracks(ctx);
    }
    async createTracks(ctx) {
        const it = (await ctx.engine.query(`
      INCLUDE PERFETTO MODULE chrome.tasks;

      with relevant_threads as (
        select distinct utid from chrome_tasks
      )
      select
        (CASE process.name
          WHEN 'Browser' THEN 1
          WHEN 'Gpu' THEN 2
          WHEN 'Renderer' THEN 4
          ELSE 3
        END) as processRank,
        process.name as processName,
        process.pid,
        process.upid,
        (CASE thread.name
          WHEN 'CrBrowserMain' THEN 1
          WHEN 'CrRendererMain' THEN 1
          WHEN 'CrGpuMain' THEN 1
          WHEN 'Chrome_IOThread' THEN 2
          WHEN 'Chrome_ChildIOThread' THEN 2
          WHEN 'VizCompositorThread' THEN 3
          WHEN 'NetworkService' THEN 3
          WHEN 'Compositor' THEN 3
          WHEN 'CompositorGpuThread' THEN 4
          WHEN 'CompositorTileWorker&' THEN 5
          WHEN 'ThreadPoolService' THEN 6
          WHEN 'ThreadPoolSingleThreadForegroundBlocking&' THEN 6
          WHEN 'ThreadPoolForegroundWorker' THEN 6
          ELSE 7
         END) as threadRank,
         thread.name as threadName,
         thread.tid,
         thread.utid
      from relevant_threads
      join thread using (utid)
      join process using (upid)
      order by processRank, upid, threadRank, utid
    `)).iter({
            processRank: query_result_1.NUM,
            processName: query_result_1.STR_NULL,
            pid: query_result_1.NUM_NULL,
            upid: query_result_1.NUM,
            threadRank: query_result_1.NUM,
            threadName: query_result_1.STR_NULL,
            tid: query_result_1.NUM_NULL,
            utid: query_result_1.NUM,
        });
        const group = new workspace_1.TrackNode({ title: 'Chrome Tasks', isSummary: true });
        for (; it.valid(); it.next()) {
            const utid = it.utid;
            const uri = `org.chromium.ChromeTasks#thread.${utid}`;
            const title = `${it.threadName} ${it.tid}`;
            ctx.tracks.registerTrack({
                uri,
                track: new track_1.ChromeTasksThreadTrack(ctx, uri, (0, core_types_1.asUtid)(utid)),
                title,
            });
            const track = new workspace_1.TrackNode({ uri, title });
            group.addChildInOrder(track);
            ctx.workspace.addChildInOrder(group);
        }
    }
}
exports.default = default_1;
//# sourceMappingURL=index.js.map