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
const cpu_slice_track_1 = require("./cpu_slice_track");
const workspace_1 = require("../../public/workspace");
const cpu_slice_selection_aggregator_1 = require("./cpu_slice_selection_aggregator");
const cpu_slice_by_process_selection_aggregator_1 = require("./cpu_slice_by_process_selection_aggregator");
const dev_perfetto_Thread_1 = tslib_1.__importDefault(require("../dev.perfetto.Thread"));
function uriForSchedTrack(cpu) {
    return `/sched_cpu${cpu}`;
}
class default_1 {
    static id = 'dev.perfetto.CpuSlices';
    static dependencies = [dev_perfetto_Thread_1.default];
    async onTraceLoad(ctx) {
        ctx.selection.registerAreaSelectionAggregator(new cpu_slice_selection_aggregator_1.CpuSliceSelectionAggregator());
        ctx.selection.registerAreaSelectionAggregator(new cpu_slice_by_process_selection_aggregator_1.CpuSliceByProcessSelectionAggregator());
        const cpus = ctx.traceInfo.cpus;
        const cpuToClusterType = await this.getAndroidCpuClusterTypes(ctx.engine);
        for (const cpu of cpus) {
            const size = cpuToClusterType.get(cpu);
            const uri = uriForSchedTrack(cpu);
            const threads = ctx.plugins.getPlugin(dev_perfetto_Thread_1.default).getThreadMap();
            const name = size === undefined ? `Cpu ${cpu}` : `Cpu ${cpu} (${size})`;
            ctx.tracks.registerTrack({
                uri,
                title: name,
                tags: {
                    kind: track_kinds_1.CPU_SLICE_TRACK_KIND,
                    cpu,
                },
                track: new cpu_slice_track_1.CpuSliceTrack(ctx, uri, cpu, threads),
            });
            const trackNode = new workspace_1.TrackNode({ uri, title: name, sortOrder: -50 });
            ctx.workspace.addChildInOrder(trackNode);
        }
        ctx.selection.registerSqlSelectionResolver({
            sqlTableName: 'sched_slice',
            callback: async (id) => {
                const result = await ctx.engine.query(`
          select
            cpu
          from sched_slice
          where id = ${id}
        `);
                const cpu = result.firstRow({
                    cpu: query_result_1.NUM,
                }).cpu;
                return {
                    eventId: id,
                    trackUri: uriForSchedTrack(cpu),
                };
            },
        });
    }
    async getAndroidCpuClusterTypes(engine) {
        const cpuToClusterType = new Map();
        await engine.query(`
      include perfetto module android.cpu.cluster_type;
    `);
        const result = await engine.query(`
      select cpu, cluster_type as clusterType
      from android_cpu_cluster_mapping
    `);
        const it = result.iter({
            cpu: query_result_1.NUM,
            clusterType: query_result_1.STR_NULL,
        });
        for (; it.valid(); it.next()) {
            const clusterType = it.clusterType;
            if (clusterType !== null) {
                cpuToClusterType.set(it.cpu, clusterType);
            }
        }
        return cpuToClusterType;
    }
}
exports.default = default_1;
//# sourceMappingURL=index.js.map