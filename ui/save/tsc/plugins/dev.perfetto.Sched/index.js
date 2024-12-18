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
const workspace_1 = require("../../public/workspace");
const active_cpu_count_1 = require("./active_cpu_count");
const thread_count_1 = require("./thread_count");
class default_1 {
    static id = 'dev.perfetto.Sched';
    async onTraceLoad(ctx) {
        const runnableThreadCountUri = `/runnable_thread_count`;
        ctx.tracks.registerTrack({
            uri: runnableThreadCountUri,
            title: 'Runnable thread count',
            track: new thread_count_1.RunnableThreadCountTrack(ctx, runnableThreadCountUri),
        });
        ctx.commands.registerCommand({
            id: 'dev.perfetto.Sched.AddRunnableThreadCountTrackCommand',
            name: 'Add track: runnable thread count',
            callback: () => addPinnedTrack(ctx, runnableThreadCountUri, 'Runnable thread count'),
        });
        const uninterruptibleSleepThreadCountUri = `/uninterruptible_sleep_thread_count`;
        ctx.tracks.registerTrack({
            uri: uninterruptibleSleepThreadCountUri,
            title: 'Uninterruptible Sleep thread count',
            track: new thread_count_1.UninterruptibleSleepThreadCountTrack(ctx, uninterruptibleSleepThreadCountUri),
        });
        ctx.commands.registerCommand({
            id: 'dev.perfetto.Sched.AddUninterruptibleSleepThreadCountTrackCommand',
            name: 'Add track: uninterruptible sleep thread count',
            callback: () => addPinnedTrack(ctx, uninterruptibleSleepThreadCountUri, 'Uninterruptible Sleep thread count'),
        });
        const uri = uriForActiveCPUCountTrack();
        const title = 'Active CPU count';
        ctx.tracks.registerTrack({
            uri,
            title: title,
            track: new active_cpu_count_1.ActiveCPUCountTrack({ trackUri: uri }, ctx),
        });
        ctx.commands.registerCommand({
            id: 'dev.perfetto.Sched.AddActiveCPUCountTrackCommand',
            name: 'Add track: active CPU count',
            callback: () => addPinnedTrack(ctx, uri, title),
        });
        for (const cpuType of Object.values(active_cpu_count_1.CPUType)) {
            const uri = uriForActiveCPUCountTrack(cpuType);
            const title = `Active ${cpuType} CPU count`;
            ctx.tracks.registerTrack({
                uri,
                title: title,
                track: new active_cpu_count_1.ActiveCPUCountTrack({ trackUri: uri }, ctx, cpuType),
            });
            ctx.commands.registerCommand({
                id: `dev.perfetto.Sched.AddActiveCPUCountTrackCommand.${cpuType}`,
                name: `Add track: active ${cpuType} CPU count`,
                callback: () => addPinnedTrack(ctx, uri, title),
            });
        }
    }
}
exports.default = default_1;
function uriForActiveCPUCountTrack(cpuType) {
    const prefix = `/active_cpus`;
    if (cpuType !== undefined) {
        return `${prefix}_${cpuType}`;
    }
    else {
        return prefix;
    }
}
function addPinnedTrack(ctx, uri, title) {
    const track = new workspace_1.TrackNode({ uri, title });
    // Add track to the top of the stack
    ctx.workspace.addChildFirst(track);
    track.pin();
}
//# sourceMappingURL=index.js.map