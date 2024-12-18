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
const query_result_1 = require("../../trace_processor/query_result");
const async_slice_track_1 = require("../dev.perfetto.AsyncSlices/async_slice_track");
const workspace_1 = require("../../public/workspace");
const track_kinds_1 = require("../../public/track_kinds");
const suspend_resume_details_1 = require("./suspend_resume_details");
const dev_perfetto_Thread_1 = tslib_1.__importDefault(require("../dev.perfetto.Thread"));
const dev_perfetto_AsyncSlices_1 = tslib_1.__importDefault(require("../dev.perfetto.AsyncSlices"));
// SuspendResumeSliceTrack exists so as to override the `onSliceClick` function
// in AsyncSliceTrack.
// TODO(stevegolton): Remove this?
class SuspendResumeSliceTrack extends async_slice_track_1.AsyncSliceTrack {
    threads;
    constructor(trace, uri, maxDepth, trackIds, threads) {
        super(trace, uri, maxDepth, trackIds);
        this.threads = threads;
    }
    detailsPanel() {
        return new suspend_resume_details_1.SuspendResumeDetailsPanel(this.trace, this.threads);
    }
}
class default_1 {
    static id = 'org.kernel.SuspendResumeLatency';
    static dependencies = [dev_perfetto_Thread_1.default, dev_perfetto_AsyncSlices_1.default];
    async onTraceLoad(ctx) {
        const threads = ctx.plugins.getPlugin(dev_perfetto_Thread_1.default).getThreadMap();
        const { engine } = ctx;
        const rawGlobalAsyncTracks = await engine.query(`
      with global_tracks_grouped as (
        select
          name,
          group_concat(distinct t.id) as trackIds,
          count() as trackCount
        from track t
        where t.name = "Suspend/Resume Latency"
      )
      select
        t.trackIds as trackIds,
        case
          when
            t.trackCount > 0
          then
            __max_layout_depth(t.trackCount, t.trackIds)
          else 0
        end as maxDepth
      from global_tracks_grouped t
    `);
        const it = rawGlobalAsyncTracks.iter({
            trackIds: query_result_1.STR_NULL,
            maxDepth: query_result_1.NUM,
        });
        // If no Suspend/Resume tracks exist, then nothing to do.
        if (it.trackIds == null) {
            return;
        }
        const rawTrackIds = it.trackIds;
        const trackIds = rawTrackIds.split(',').map((v) => Number(v));
        const maxDepth = it.maxDepth;
        const uri = `/suspend_resume_latency`;
        const displayName = `Suspend/Resume Latency`;
        ctx.tracks.registerTrack({
            uri,
            title: displayName,
            tags: {
                trackIds,
                kind: track_kinds_1.SLICE_TRACK_KIND,
            },
            track: new SuspendResumeSliceTrack(ctx, uri, maxDepth, trackIds, threads),
        });
        // Display the track in the UI.
        const track = new workspace_1.TrackNode({ uri, title: displayName });
        ctx.workspace.addChildInOrder(track);
    }
}
exports.default = default_1;
//# sourceMappingURL=index.js.map