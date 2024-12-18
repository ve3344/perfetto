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
const utils_1 = require("../../public/utils");
const query_result_1 = require("../../trace_processor/query_result");
const thread_state_track_1 = require("./thread_state_track");
const array_utils_1 = require("../../base/array_utils");
const workspace_1 = require("../../public/workspace");
const thread_state_selection_aggregator_1 = require("./thread_state_selection_aggregator");
const dev_perfetto_ProcessThreadGroups_1 = tslib_1.__importDefault(require("../dev.perfetto.ProcessThreadGroups"));
function uriForThreadStateTrack(upid, utid) {
    return `${(0, utils_1.getThreadUriPrefix)(upid, utid)}_state`;
}
class default_1 {
    static id = 'dev.perfetto.ThreadState';
    static dependencies = [dev_perfetto_ProcessThreadGroups_1.default];
    async onTraceLoad(ctx) {
        const { engine } = ctx;
        ctx.selection.registerAreaSelectionAggregator(new thread_state_selection_aggregator_1.ThreadStateSelectionAggregator());
        const result = await engine.query(`
      include perfetto module viz.threads;
      include perfetto module viz.summary.threads;

      select
        utid,
        t.upid,
        tid,
        t.name as threadName,
        is_main_thread as isMainThread,
        is_kernel_thread as isKernelThread
      from _threads_with_kernel_flag t
      join _sched_summary using (utid)
    `);
        const it = result.iter({
            utid: query_result_1.NUM,
            upid: query_result_1.NUM_NULL,
            tid: query_result_1.NUM_NULL,
            threadName: query_result_1.STR_NULL,
            isMainThread: query_result_1.NUM_NULL,
            isKernelThread: query_result_1.NUM,
        });
        for (; it.valid(); it.next()) {
            const { utid, upid, tid, threadName, isMainThread, isKernelThread } = it;
            const title = (0, utils_1.getTrackName)({
                utid,
                tid,
                threadName,
                kind: track_kinds_1.THREAD_STATE_TRACK_KIND,
            });
            const uri = uriForThreadStateTrack(upid, utid);
            ctx.tracks.registerTrack({
                uri,
                title,
                tags: {
                    kind: track_kinds_1.THREAD_STATE_TRACK_KIND,
                    utid,
                    upid: upid ?? undefined,
                    ...(isKernelThread === 1 && { kernelThread: true }),
                },
                chips: (0, array_utils_1.removeFalsyValues)([
                    isKernelThread === 0 && isMainThread === 1 && 'main thread',
                ]),
                track: new thread_state_track_1.ThreadStateTrack(ctx, uri, utid),
            });
            const group = ctx.plugins
                .getPlugin(dev_perfetto_ProcessThreadGroups_1.default)
                .getGroupForThread(utid);
            const track = new workspace_1.TrackNode({ uri, title, sortOrder: 10 });
            group?.addChildInOrder(track);
        }
        ctx.selection.registerSqlSelectionResolver({
            sqlTableName: 'thread_state',
            callback: async (id) => {
                const result = await ctx.engine.query(`
          select
            thread_state.utid,
            thread.upid
          from
            thread_state
            join thread on thread_state.utid = thread.id
          where thread_state.id = ${id}
        `);
                const { upid, utid } = result.firstRow({
                    upid: query_result_1.NUM_NULL,
                    utid: query_result_1.NUM,
                });
                return {
                    eventId: id,
                    trackUri: uriForThreadStateTrack(upid, utid),
                };
            },
        });
    }
}
exports.default = default_1;
//# sourceMappingURL=index.js.map