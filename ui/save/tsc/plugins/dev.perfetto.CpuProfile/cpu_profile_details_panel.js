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
exports.CpuProfileSampleFlamegraphDetailsPanel = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const query_flamegraph_1 = require("../../components/query_flamegraph");
const timestamp_1 = require("../../components/widgets/timestamp");
const details_shell_1 = require("../../widgets/details_shell");
const flamegraph_1 = require("../../widgets/flamegraph");
class CpuProfileSampleFlamegraphDetailsPanel {
    ts;
    flamegraph;
    serialization;
    constructor(trace, ts, utid) {
        this.ts = ts;
        const metrics = (0, query_flamegraph_1.metricsFromTableOrSubquery)(`
        (
          select
            id,
            parent_id as parentId,
            name,
            mapping_name,
            source_file,
            cast(line_number AS text) as line_number,
            self_count
          from _callstacks_for_callsites!((
            select p.callsite_id
            from cpu_profile_stack_sample p
            where p.ts = ${ts} and p.utid = ${utid}
          ))
        )
      `, [
            {
                name: 'CPU Profile Samples',
                unit: '',
                columnName: 'self_count',
            },
        ], 'include perfetto module callstacks.stack_profile', [{ name: 'mapping_name', displayName: 'Mapping' }], [
            {
                name: 'source_file',
                displayName: 'Source File',
                mergeAggregation: 'ONE_OR_NULL',
            },
            {
                name: 'line_number',
                displayName: 'Line Number',
                mergeAggregation: 'ONE_OR_NULL',
            },
        ]);
        this.serialization = {
            schema: flamegraph_1.FLAMEGRAPH_STATE_SCHEMA,
            state: flamegraph_1.Flamegraph.createDefaultState(metrics),
        };
        this.flamegraph = new query_flamegraph_1.QueryFlamegraph(trace, metrics, this.serialization);
    }
    render() {
        return (0, mithril_1.default)('.flamegraph-profile', (0, mithril_1.default)(details_shell_1.DetailsShell, {
            fillParent: true,
            title: (0, mithril_1.default)('.title', 'CPU Profile Samples'),
            description: [],
            buttons: [(0, mithril_1.default)('div.time', `Timestamp: `, (0, mithril_1.default)(timestamp_1.Timestamp, { ts: this.ts }))],
        }, this.flamegraph.render()));
    }
}
exports.CpuProfileSampleFlamegraphDetailsPanel = CpuProfileSampleFlamegraphDetailsPanel;
//# sourceMappingURL=cpu_profile_details_panel.js.map