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
const workspace_1 = require("../../public/workspace");
const query_result_1 = require("../../trace_processor/query_result");
const actual_frames_track_1 = require("./actual_frames_track");
const expected_frames_track_1 = require("./expected_frames_track");
const frame_selection_aggregator_1 = require("./frame_selection_aggregator");
const dev_perfetto_ProcessThreadGroups_1 = tslib_1.__importDefault(require("../dev.perfetto.ProcessThreadGroups"));
class default_1 {
    static id = 'dev.perfetto.Frames';
    static dependencies = [dev_perfetto_ProcessThreadGroups_1.default];
    async onTraceLoad(ctx) {
        this.addExpectedFrames(ctx);
        this.addActualFrames(ctx);
        ctx.selection.registerAreaSelectionAggregator(new frame_selection_aggregator_1.FrameSelectionAggregator());
    }
    async addExpectedFrames(ctx) {
        const { engine } = ctx;
        const result = await engine.query(`
      select
        upid,
        t.name as trackName,
        t.track_ids as trackIds,
        process.name as processName,
        process.pid as pid,
        __max_layout_depth(t.track_count, t.track_ids) as maxDepth
      from _process_track_summary_by_upid_and_parent_id_and_name t
      join process using(upid)
      where t.name = "Expected Timeline"
    `);
        const it = result.iter({
            upid: query_result_1.NUM,
            trackName: query_result_1.STR_NULL,
            trackIds: query_result_1.STR,
            processName: query_result_1.STR_NULL,
            pid: query_result_1.NUM_NULL,
            maxDepth: query_result_1.NUM,
        });
        for (; it.valid(); it.next()) {
            const upid = it.upid;
            const trackName = it.trackName;
            const rawTrackIds = it.trackIds;
            const trackIds = rawTrackIds.split(',').map((v) => Number(v));
            const processName = it.processName;
            const pid = it.pid;
            const maxDepth = it.maxDepth;
            const title = (0, utils_1.getTrackName)({
                name: trackName,
                upid,
                pid,
                processName,
                kind: 'ExpectedFrames',
            });
            const uri = `/process_${upid}/expected_frames`;
            ctx.tracks.registerTrack({
                uri,
                title,
                track: new expected_frames_track_1.ExpectedFramesTrack(ctx, maxDepth, uri, trackIds),
                tags: {
                    trackIds,
                    upid,
                    kind: track_kinds_1.EXPECTED_FRAMES_SLICE_TRACK_KIND,
                },
            });
            const group = ctx.plugins
                .getPlugin(dev_perfetto_ProcessThreadGroups_1.default)
                .getGroupForProcess(upid);
            const track = new workspace_1.TrackNode({ uri, title, sortOrder: -50 });
            group?.addChildInOrder(track);
        }
    }
    async addActualFrames(ctx) {
        const { engine } = ctx;
        const result = await engine.query(`
      select
        upid,
        t.name as trackName,
        t.track_ids as trackIds,
        process.name as processName,
        process.pid as pid,
        __max_layout_depth(t.track_count, t.track_ids) as maxDepth
      from _process_track_summary_by_upid_and_parent_id_and_name t
      join process using(upid)
      where t.name = "Actual Timeline"
    `);
        const it = result.iter({
            upid: query_result_1.NUM,
            trackName: query_result_1.STR_NULL,
            trackIds: query_result_1.STR,
            processName: query_result_1.STR_NULL,
            pid: query_result_1.NUM_NULL,
            maxDepth: query_result_1.NUM_NULL,
        });
        for (; it.valid(); it.next()) {
            const upid = it.upid;
            const trackName = it.trackName;
            const rawTrackIds = it.trackIds;
            const trackIds = rawTrackIds.split(',').map((v) => Number(v));
            const processName = it.processName;
            const pid = it.pid;
            const maxDepth = it.maxDepth;
            if (maxDepth === null) {
                // If there are no slices in this track, skip it.
                continue;
            }
            const kind = 'ActualFrames';
            const title = (0, utils_1.getTrackName)({
                name: trackName,
                upid,
                pid,
                processName,
                kind,
            });
            const uri = `/process_${upid}/actual_frames`;
            ctx.tracks.registerTrack({
                uri,
                title,
                track: new actual_frames_track_1.ActualFramesTrack(ctx, maxDepth, uri, trackIds),
                tags: {
                    upid,
                    trackIds,
                    kind: track_kinds_1.ACTUAL_FRAMES_SLICE_TRACK_KIND,
                },
            });
            const group = ctx.plugins
                .getPlugin(dev_perfetto_ProcessThreadGroups_1.default)
                .getGroupForProcess(upid);
            const track = new workspace_1.TrackNode({ uri, title, sortOrder: -50 });
            group?.addChildInOrder(track);
        }
    }
}
exports.default = default_1;
//# sourceMappingURL=index.js.map