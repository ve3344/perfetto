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
const base_counter_track_1 = require("../../components/tracks/base_counter_track");
const track_kinds_1 = require("../../public/track_kinds");
const workspace_1 = require("../../public/workspace");
const estimate_aggregator_1 = require("./estimate_aggregator");
const package_aggregator_1 = require("./package_aggregator");
const process_aggregator_1 = require("./process_aggregator");
const thread_aggregator_1 = require("./thread_aggregator");
const query_result_1 = require("../../trace_processor/query_result");
class default_1 {
    static id = `org.kernel.Wattson`;
    async onTraceLoad(ctx) {
        // Short circuit if Wattson is not supported for this Perfetto trace
        if (!(await hasWattsonSupport(ctx.engine)))
            return;
        const group = new workspace_1.TrackNode({ title: 'Wattson', isSummary: true });
        ctx.workspace.addChildInOrder(group);
        // CPUs estimate as part of CPU subsystem
        const cpus = ctx.traceInfo.cpus;
        for (const cpu of cpus) {
            const queryKey = `cpu${cpu}_mw`;
            const uri = `/wattson/cpu_subsystem_estimate_cpu${cpu}`;
            const title = `Cpu${cpu} Estimate`;
            ctx.tracks.registerTrack({
                uri,
                title,
                track: new CpuSubsystemEstimateTrack(ctx, uri, queryKey),
                tags: {
                    kind: track_kinds_1.CPUSS_ESTIMATE_TRACK_KIND,
                    wattson: `CPU${cpu}`,
                    groupName: `Wattson`,
                },
            });
            group.addChildInOrder(new workspace_1.TrackNode({ uri, title }));
        }
        const uri = `/wattson/cpu_subsystem_estimate_dsu_scu`;
        const title = `DSU/SCU Estimate`;
        ctx.tracks.registerTrack({
            uri,
            title,
            track: new CpuSubsystemEstimateTrack(ctx, uri, `dsu_scu_mw`),
            tags: {
                kind: track_kinds_1.CPUSS_ESTIMATE_TRACK_KIND,
                wattson: 'Dsu_Scu',
                groupName: `Wattson`,
            },
        });
        group.addChildInOrder(new workspace_1.TrackNode({ uri, title }));
        // Register selection aggregators.
        // NOTE: the registration order matters because the laste two aggregators
        // depend on views created by the first two.
        ctx.selection.registerAreaSelectionAggregator(new estimate_aggregator_1.WattsonEstimateSelectionAggregator());
        ctx.selection.registerAreaSelectionAggregator(new thread_aggregator_1.WattsonThreadSelectionAggregator());
        ctx.selection.registerAreaSelectionAggregator(new process_aggregator_1.WattsonProcessSelectionAggregator());
        ctx.selection.registerAreaSelectionAggregator(new package_aggregator_1.WattsonPackageSelectionAggregator());
    }
}
exports.default = default_1;
class CpuSubsystemEstimateTrack extends base_counter_track_1.BaseCounterTrack {
    queryKey;
    constructor(trace, uri, queryKey) {
        super(trace, uri);
        this.queryKey = queryKey;
    }
    async onInit() {
        await this.engine.query(`INCLUDE PERFETTO MODULE wattson.curves.estimates;`);
    }
    getDefaultCounterOptions() {
        const options = super.getDefaultCounterOptions();
        options.yRangeSharingKey = `CpuSubsystem`;
        options.unit = `mW`;
        return options;
    }
    getSqlSource() {
        return `select ts, ${this.queryKey} as value from _system_state_mw`;
    }
}
async function hasWattsonSupport(engine) {
    // These tables are hard requirements and are the bare minimum needed for
    // Wattson to run, so check that these tables are populated
    const queryChecks = [
        `
    INCLUDE PERFETTO MODULE wattson.device_infos;
    SELECT COUNT(*) as numRows FROM _wattson_device
    `,
        `
    INCLUDE PERFETTO MODULE linux.cpu.frequency;
    SELECT COUNT(*) as numRows FROM cpu_frequency_counters
    `,
        `
    INCLUDE PERFETTO MODULE linux.cpu.idle;
    SELECT COUNT(*) as numRows FROM cpu_idle_counters
    `,
    ];
    for (const queryCheck of queryChecks) {
        const checkValue = await engine.query(queryCheck);
        if (checkValue.firstRow({ numRows: query_result_1.NUM }).numRows === 0)
            return false;
    }
    return true;
}
//# sourceMappingURL=index.js.map