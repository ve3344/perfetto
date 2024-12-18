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
exports.ThreadPerfSamplesProfileTrack = exports.ProcessPerfSamplesProfileTrack = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const query_result_1 = require("../../trace_processor/query_result");
const base_slice_track_1 = require("../../components/tracks/base_slice_track");
const named_slice_track_1 = require("../../components/tracks/named_slice_track");
const colorizer_1 = require("../../components/colorizer");
const selection_1 = require("../../public/selection");
const logging_1 = require("../../base/logging");
const query_flamegraph_1 = require("../../components/query_flamegraph");
const details_shell_1 = require("../../widgets/details_shell");
const timestamp_1 = require("../../components/widgets/timestamp");
const flamegraph_1 = require("../../widgets/flamegraph");
class BasePerfSamplesProfileTrack extends base_slice_track_1.BaseSliceTrack {
    constructor(trace, uri) {
        super(trace, uri);
    }
    getRowSpec() {
        return { ...named_slice_track_1.NAMED_ROW, callsiteId: query_result_1.NUM };
    }
    rowToSlice(row) {
        const baseSlice = super.rowToSliceBase(row);
        const name = (0, logging_1.assertExists)(row.name);
        const colorScheme = (0, colorizer_1.getColorForSample)(row.callsiteId);
        return { ...baseSlice, title: name, colorScheme };
    }
    onUpdatedSlices(slices) {
        for (const slice of slices) {
            slice.isHighlighted = slice === this.hoveredSlice;
        }
    }
}
class ProcessPerfSamplesProfileTrack extends BasePerfSamplesProfileTrack {
    upid;
    constructor(trace, uri, upid) {
        super(trace, uri);
        this.upid = upid;
    }
    getSqlSource() {
        return `
      select
        p.id,
        ts,
        0 as dur,
        0 as depth,
        'Perf Sample' as name,
        callsite_id as callsiteId
      from perf_sample p
      join thread using (utid)
      where upid = ${this.upid} and callsite_id is not null
      order by ts
    `;
    }
    async getSelectionDetails(id) {
        const details = await super.getSelectionDetails(id);
        if (details === undefined)
            return undefined;
        return {
            ...details,
            upid: this.upid,
            profileType: selection_1.ProfileType.PERF_SAMPLE,
        };
    }
    detailsPanel(sel) {
        const upid = (0, logging_1.assertExists)(sel.upid);
        const ts = sel.ts;
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
            from perf_sample p
            join thread t using (utid)
            where p.ts >= ${ts}
              and p.ts <= ${ts}
              and t.upid = ${upid}
          ))
        )
      `, [
            {
                name: 'Perf Samples',
                unit: '',
                columnName: 'self_count',
            },
        ], 'include perfetto module linux.perf.samples', [{ name: 'mapping_name', displayName: 'Mapping' }], [
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
        const serialization = {
            schema: flamegraph_1.FLAMEGRAPH_STATE_SCHEMA,
            state: flamegraph_1.Flamegraph.createDefaultState(metrics),
        };
        const flamegraph = new query_flamegraph_1.QueryFlamegraph(this.trace, metrics, serialization);
        return {
            render: () => renderDetailsPanel(flamegraph, ts),
            serialization,
        };
    }
}
exports.ProcessPerfSamplesProfileTrack = ProcessPerfSamplesProfileTrack;
class ThreadPerfSamplesProfileTrack extends BasePerfSamplesProfileTrack {
    utid;
    constructor(trace, uri, utid) {
        super(trace, uri);
        this.utid = utid;
    }
    getSqlSource() {
        return `
      select
        p.id,
        ts,
        0 as dur,
        0 as depth,
        'Perf Sample' as name,
        callsite_id as callsiteId
      from perf_sample p
      where utid = ${this.utid} and callsite_id is not null
      order by ts
    `;
    }
    async getSelectionDetails(id) {
        const details = await super.getSelectionDetails(id);
        if (details === undefined)
            return undefined;
        return {
            ...details,
            utid: this.utid,
            profileType: selection_1.ProfileType.PERF_SAMPLE,
        };
    }
    detailsPanel(sel) {
        const utid = (0, logging_1.assertExists)(sel.utid);
        const ts = sel.ts;
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
            from perf_sample p
            where p.ts >= ${ts}
              and p.ts <= ${ts}
              and p.utid = ${utid}
          ))
        )
      `, [
            {
                name: 'Perf Samples',
                unit: '',
                columnName: 'self_count',
            },
        ], 'include perfetto module linux.perf.samples', [{ name: 'mapping_name', displayName: 'Mapping' }], [
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
        const serialization = {
            schema: flamegraph_1.FLAMEGRAPH_STATE_SCHEMA,
            state: flamegraph_1.Flamegraph.createDefaultState(metrics),
        };
        const flamegraph = new query_flamegraph_1.QueryFlamegraph(this.trace, metrics, serialization);
        return {
            render: () => renderDetailsPanel(flamegraph, ts),
            serialization,
        };
    }
}
exports.ThreadPerfSamplesProfileTrack = ThreadPerfSamplesProfileTrack;
function renderDetailsPanel(flamegraph, ts) {
    return (0, mithril_1.default)('.flamegraph-profile', (0, mithril_1.default)(details_shell_1.DetailsShell, {
        fillParent: true,
        title: (0, mithril_1.default)('.title', 'Perf Samples'),
        description: [],
        buttons: [
            (0, mithril_1.default)('div.time', `First timestamp: `, (0, mithril_1.default)(timestamp_1.Timestamp, {
                ts,
            })),
            (0, mithril_1.default)('div.time', `Last timestamp: `, (0, mithril_1.default)(timestamp_1.Timestamp, {
                ts,
            })),
        ],
    }, flamegraph.render()));
}
//# sourceMappingURL=perf_samples_profile_track.js.map