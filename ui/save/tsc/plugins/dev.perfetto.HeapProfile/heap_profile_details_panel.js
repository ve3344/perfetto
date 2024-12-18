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
exports.HeapProfileFlamegraphDetailsPanel = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const logging_1 = require("../../base/logging");
const query_flamegraph_1 = require("../../components/query_flamegraph");
const trace_converter_1 = require("../../frontend/trace_converter");
const timestamp_1 = require("../../components/widgets/timestamp");
const selection_1 = require("../../public/selection");
const query_result_1 = require("../../trace_processor/query_result");
const button_1 = require("../../widgets/button");
const common_1 = require("../../widgets/common");
const details_shell_1 = require("../../widgets/details_shell");
const icon_1 = require("../../widgets/icon");
const modal_1 = require("../../widgets/modal");
const popup_1 = require("../../widgets/popup");
const flamegraph_1 = require("../../widgets/flamegraph");
class HeapProfileFlamegraphDetailsPanel {
    trace;
    heapGraphIncomplete;
    upid;
    flamegraph;
    props;
    flamegraphModalDismissed = false;
    serialization;
    constructor(trace, heapGraphIncomplete, upid, sel) {
        this.trace = trace;
        this.heapGraphIncomplete = heapGraphIncomplete;
        this.upid = upid;
        const { profileType, ts } = sel;
        const metrics = flamegraphMetrics((0, logging_1.assertExists)(profileType), ts, upid);
        this.serialization = {
            schema: flamegraph_1.FLAMEGRAPH_STATE_SCHEMA,
            state: flamegraph_1.Flamegraph.createDefaultState(metrics),
        };
        this.flamegraph = new query_flamegraph_1.QueryFlamegraph(trace, metrics, this.serialization);
        this.props = { ts, type: (0, logging_1.assertExists)(profileType) };
    }
    render() {
        const { type, ts } = this.props;
        return (0, mithril_1.default)('.flamegraph-profile', this.maybeShowModal(this.trace, type, this.heapGraphIncomplete), (0, mithril_1.default)(details_shell_1.DetailsShell, {
            fillParent: true,
            title: (0, mithril_1.default)('.title', getFlamegraphTitle(type), type === selection_1.ProfileType.MIXED_HEAP_PROFILE &&
                (0, mithril_1.default)(popup_1.Popup, {
                    trigger: (0, mithril_1.default)(icon_1.Icon, { icon: 'warning' }),
                }, (0, mithril_1.default)('', { style: { width: '300px' } }, 'This is a mixed java/native heap profile, free()s are not visualized. To visualize free()s, remove "all_heaps: true" from the config.'))),
            description: [],
            buttons: [
                (0, mithril_1.default)('.time', `Snapshot time: `, (0, mithril_1.default)(timestamp_1.Timestamp, { ts })),
                (type === selection_1.ProfileType.NATIVE_HEAP_PROFILE ||
                    type === selection_1.ProfileType.JAVA_HEAP_SAMPLES) &&
                    (0, mithril_1.default)(button_1.Button, {
                        icon: 'file_download',
                        intent: common_1.Intent.Primary,
                        onclick: () => {
                            downloadPprof(this.trace, this.upid, ts);
                            this.trace.scheduleFullRedraw();
                        },
                    }),
            ],
        }, (0, logging_1.assertExists)(this.flamegraph).render()));
    }
    maybeShowModal(trace, type, heapGraphIncomplete) {
        if (type !== selection_1.ProfileType.JAVA_HEAP_GRAPH || !heapGraphIncomplete) {
            return undefined;
        }
        if (this.flamegraphModalDismissed) {
            return undefined;
        }
        return (0, mithril_1.default)(modal_1.Modal, {
            title: 'The flamegraph is incomplete',
            vAlign: 'TOP',
            content: (0, mithril_1.default)('div', 'The current trace does not have a fully formed flamegraph'),
            buttons: [
                {
                    text: 'Show the errors',
                    primary: true,
                    action: () => trace.navigate('#!/info'),
                },
                {
                    text: 'Skip',
                    action: () => {
                        this.flamegraphModalDismissed = true;
                        trace.scheduleFullRedraw();
                    },
                },
            ],
        });
    }
}
exports.HeapProfileFlamegraphDetailsPanel = HeapProfileFlamegraphDetailsPanel;
function flamegraphMetrics(type, ts, upid) {
    switch (type) {
        case selection_1.ProfileType.NATIVE_HEAP_PROFILE:
            return flamegraphMetricsForHeapProfile(ts, upid, [
                {
                    name: 'Unreleased Malloc Size',
                    unit: 'B',
                    columnName: 'self_size',
                },
                {
                    name: 'Unreleased Malloc Count',
                    unit: '',
                    columnName: 'self_count',
                },
                {
                    name: 'Total Malloc Size',
                    unit: 'B',
                    columnName: 'self_alloc_size',
                },
                {
                    name: 'Total Malloc Count',
                    unit: '',
                    columnName: 'self_alloc_count',
                },
            ]);
        case selection_1.ProfileType.HEAP_PROFILE:
            return flamegraphMetricsForHeapProfile(ts, upid, [
                {
                    name: 'Unreleased Size',
                    unit: 'B',
                    columnName: 'self_size',
                },
                {
                    name: 'Unreleased Count',
                    unit: '',
                    columnName: 'self_count',
                },
                {
                    name: 'Total Size',
                    unit: 'B',
                    columnName: 'self_alloc_size',
                },
                {
                    name: 'Total Count',
                    unit: '',
                    columnName: 'self_alloc_count',
                },
            ]);
        case selection_1.ProfileType.JAVA_HEAP_SAMPLES:
            return flamegraphMetricsForHeapProfile(ts, upid, [
                {
                    name: 'Unreleased Allocation Size',
                    unit: 'B',
                    columnName: 'self_size',
                },
                {
                    name: 'Unreleased Allocation Count',
                    unit: '',
                    columnName: 'self_count',
                },
            ]);
        case selection_1.ProfileType.MIXED_HEAP_PROFILE:
            return flamegraphMetricsForHeapProfile(ts, upid, [
                {
                    name: 'Unreleased Allocation Size (malloc + java)',
                    unit: 'B',
                    columnName: 'self_size',
                },
                {
                    name: 'Unreleased Allocation Count (malloc + java)',
                    unit: '',
                    columnName: 'self_count',
                },
            ]);
        case selection_1.ProfileType.JAVA_HEAP_GRAPH:
            return [
                {
                    name: 'Object Size',
                    unit: 'B',
                    dependencySql: 'include perfetto module android.memory.heap_graph.class_tree;',
                    statement: `
            select
              id,
              parent_id as parentId,
              ifnull(name, '[Unknown]') as name,
              root_type,
              self_size as value,
              self_count
            from _heap_graph_class_tree
            where graph_sample_ts = ${ts} and upid = ${upid}
          `,
                    unaggregatableProperties: [
                        { name: 'root_type', displayName: 'Root Type' },
                    ],
                    aggregatableProperties: [
                        {
                            name: 'self_count',
                            displayName: 'Self Count',
                            mergeAggregation: 'SUM',
                        },
                    ],
                },
                {
                    name: 'Object Count',
                    unit: '',
                    dependencySql: 'include perfetto module android.memory.heap_graph.class_tree;',
                    statement: `
            select
              id,
              parent_id as parentId,
              ifnull(name, '[Unknown]') as name,
              root_type,
              self_size,
              self_count as value
            from _heap_graph_class_tree
            where graph_sample_ts = ${ts} and upid = ${upid}
          `,
                    unaggregatableProperties: [
                        { name: 'root_type', displayName: 'Root Type' },
                    ],
                },
                {
                    name: 'Dominated Object Size',
                    unit: 'B',
                    dependencySql: 'include perfetto module android.memory.heap_graph.dominator_class_tree;',
                    statement: `
            select
              id,
              parent_id as parentId,
              ifnull(name, '[Unknown]') as name,
              root_type,
              self_size as value,
              self_count
            from _heap_graph_dominator_class_tree
            where graph_sample_ts = ${ts} and upid = ${upid}
          `,
                    unaggregatableProperties: [
                        { name: 'root_type', displayName: 'Root Type' },
                    ],
                    aggregatableProperties: [
                        {
                            name: 'self_count',
                            displayName: 'Self Count',
                            mergeAggregation: 'SUM',
                        },
                    ],
                },
                {
                    name: 'Dominated Object Count',
                    unit: '',
                    dependencySql: 'include perfetto module android.memory.heap_graph.dominator_class_tree;',
                    statement: `
            select
              id,
              parent_id as parentId,
              ifnull(name, '[Unknown]') as name,
              root_type,
              self_size,
              self_count as value
            from _heap_graph_class_tree
            where graph_sample_ts = ${ts} and upid = ${upid}
          `,
                    unaggregatableProperties: [
                        { name: 'root_type', displayName: 'Root Type' },
                    ],
                },
            ];
        case selection_1.ProfileType.PERF_SAMPLE:
            throw new Error('Perf sample not supported');
    }
}
function flamegraphMetricsForHeapProfile(ts, upid, metrics) {
    return (0, query_flamegraph_1.metricsFromTableOrSubquery)(`
      (
        select
          id,
          parent_id as parentId,
          name,
          mapping_name,
          source_file,
          cast(line_number AS text) as line_number,
          self_size,
          self_count,
          self_alloc_size,
          self_alloc_count
        from _android_heap_profile_callstacks_for_allocations!((
          select
            callsite_id,
            size,
            count,
            max(size, 0) as alloc_size,
            max(count, 0) as alloc_count
          from heap_profile_allocation a
          where a.ts <= ${ts} and a.upid = ${upid}
        ))
      )
    `, metrics, 'include perfetto module android.memory.heap_profile.callstacks', [{ name: 'mapping_name', displayName: 'Mapping' }], [
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
}
function getFlamegraphTitle(type) {
    switch (type) {
        case selection_1.ProfileType.HEAP_PROFILE:
            return 'Heap profile';
        case selection_1.ProfileType.JAVA_HEAP_GRAPH:
            return 'Java heap graph';
        case selection_1.ProfileType.JAVA_HEAP_SAMPLES:
            return 'Java heap samples';
        case selection_1.ProfileType.MIXED_HEAP_PROFILE:
            return 'Mixed heap profile';
        case selection_1.ProfileType.NATIVE_HEAP_PROFILE:
            return 'Native heap profile';
        case selection_1.ProfileType.PERF_SAMPLE:
            (0, logging_1.assertFalse)(false, 'Perf sample not supported');
            return 'Impossible';
    }
}
async function downloadPprof(trace, upid, ts) {
    const pid = await trace.engine.query(`select pid from process where upid = ${upid}`);
    if (!trace.traceInfo.downloadable) {
        (0, modal_1.showModal)({
            title: 'Download not supported',
            content: (0, mithril_1.default)('div', 'This trace file does not support downloads'),
        });
    }
    const blob = await trace.getTraceFile();
    (0, trace_converter_1.convertTraceToPprofAndDownload)(blob, pid.firstRow({ pid: query_result_1.NUM }).pid, ts);
}
//# sourceMappingURL=heap_profile_details_panel.js.map