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
const debug_tracks_1 = require("../../components/tracks/debug_tracks");
class default_1 {
    static id = 'com.google.PixelMemory';
    async onTraceLoad(ctx) {
        ctx.commands.registerCommand({
            id: 'dev.perfetto.PixelMemory#ShowTotalMemory',
            name: 'Add tracks: show a process total memory',
            callback: async (pid) => {
                if (pid === undefined) {
                    pid = prompt('Enter a process pid', '');
                    if (pid === null)
                        return;
                }
                const RSS_ALL = `
          INCLUDE PERFETTO MODULE android.gpu.memory;
          INCLUDE PERFETTO MODULE linux.memory.process;

          DROP TABLE IF EXISTS process_mem_rss_anon_file_shmem_swap_gpu;

          CREATE VIRTUAL TABLE process_mem_rss_anon_file_shmem_swap_gpu
          USING
            SPAN_OUTER_JOIN(
              android_gpu_memory_per_process PARTITIONED upid,
              memory_rss_and_swap_per_process PARTITIONED upid
            );
        `;
                await ctx.engine.query(RSS_ALL);
                await (0, debug_tracks_1.addDebugCounterTrack)({
                    trace: ctx,
                    data: {
                        sqlSource: `
                SELECT
                  ts,
                  COALESCE(rss_and_swap, 0) + COALESCE(gpu_memory, 0) AS value
                FROM process_mem_rss_anon_file_shmem_swap_gpu
                WHERE pid = ${pid}
            `,
                        columns: ['ts', 'value'],
                    },
                    title: pid + '_rss_anon_file_swap_shmem_gpu',
                });
            },
        });
    }
}
exports.default = default_1;
//# sourceMappingURL=index.js.map