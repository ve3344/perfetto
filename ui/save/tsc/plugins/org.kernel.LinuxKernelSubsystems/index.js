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
const track_kinds_1 = require("../../public/track_kinds");
const workspace_1 = require("../../public/workspace");
const dev_perfetto_AsyncSlices_1 = tslib_1.__importDefault(require("../dev.perfetto.AsyncSlices"));
// This plugin renders visualizations of subsystems of the Linux kernel.
class default_1 {
    static id = 'org.kernel.LinuxKernelSubsystems';
    static dependencies = [dev_perfetto_AsyncSlices_1.default];
    async onTraceLoad(ctx) {
        const kernel = new workspace_1.TrackNode({
            title: 'Linux Kernel',
            isSummary: true,
        });
        const rpm = await this.addRpmTracks(ctx);
        if (rpm.hasChildren) {
            ctx.workspace.addChildInOrder(kernel);
            kernel.addChildInOrder(rpm);
        }
    }
    // Add tracks to visualize the runtime power state transitions for Linux
    // kernel devices (devices managed by Linux drivers).
    async addRpmTracks(ctx) {
        const result = await ctx.engine.query(`
      select
        t.id as trackId,
        extract_arg(t.dimension_arg_set_id, 'linux_device') as deviceName
      from track t
      join _slice_track_summary using (id)
      where classification = 'linux_rpm'
      order by deviceName;
    `);
        const it = result.iter({
            deviceName: query_result_1.STR_NULL,
            trackId: query_result_1.NUM,
        });
        const rpm = new workspace_1.TrackNode({
            title: 'Runtime Power Management',
            isSummary: true,
        });
        for (; it.valid(); it.next()) {
            const trackId = it.trackId;
            const title = it.deviceName ?? `${trackId}`;
            const uri = `/linux/rpm/${title}`;
            ctx.tracks.registerTrack({
                uri,
                title,
                track: new async_slice_track_1.AsyncSliceTrack(ctx, uri, 0, [trackId]),
                tags: {
                    kind: track_kinds_1.SLICE_TRACK_KIND,
                    trackIds: [trackId],
                    groupName: `Linux Kernel Devices`,
                },
            });
            const track = new workspace_1.TrackNode({ uri, title });
            rpm.addChildInOrder(track);
        }
        return rpm;
    }
}
exports.default = default_1;
//# sourceMappingURL=index.js.map