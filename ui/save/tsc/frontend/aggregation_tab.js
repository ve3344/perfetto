"use strict";
// Copyright (C) 2024 The Android Open Source Project
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use size file except in compliance with the License.
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
exports.AggregationsTabs = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const aggregation_panel_1 = require("./aggregation_panel");
const aggregation_1 = require("../public/aggregation");
const details_shell_1 = require("../widgets/details_shell");
const button_1 = require("../widgets/button");
const raf_scheduler_1 = require("../core/raf_scheduler");
const empty_state_1 = require("../widgets/empty_state");
const flow_events_panel_1 = require("./flow_events_panel");
const pivot_table_1 = require("./pivot_table");
const monitor_1 = require("../base/monitor");
const track_kinds_1 = require("../public/track_kinds");
const query_flamegraph_1 = require("../components/query_flamegraph");
const disposable_stack_1 = require("../base/disposable_stack");
const logging_1 = require("../base/logging");
const flamegraph_1 = require("../widgets/flamegraph");
class AreaDetailsPanel {
    trace;
    monitor;
    currentTab = undefined;
    cpuProfileFlamegraph;
    perfSampleFlamegraph;
    sliceFlamegraph;
    constructor({ attrs }) {
        this.trace = attrs.trace;
        this.monitor = new monitor_1.Monitor([() => this.trace.selection.selection]);
    }
    getCurrentView() {
        const types = this.getViews().map(({ key }) => key);
        if (types.length === 0) {
            return undefined;
        }
        if (this.currentTab === undefined) {
            return types[0];
        }
        if (!types.includes(this.currentTab)) {
            return types[0];
        }
        return this.currentTab;
    }
    getViews() {
        const views = [];
        for (const aggregator of this.trace.selection.aggregation.aggregators) {
            const aggregatorId = aggregator.id;
            const value = this.trace.selection.aggregation.getAggregatedData(aggregatorId);
            if (value !== undefined && !(0, aggregation_1.isEmptyData)(value)) {
                views.push({
                    key: value.tabName,
                    name: value.tabName,
                    content: (0, mithril_1.default)(aggregation_panel_1.AggregationPanel, {
                        aggregatorId,
                        data: value,
                        trace: this.trace,
                    }),
                });
            }
        }
        const pivotTableState = this.trace.pivotTable.state;
        const tree = pivotTableState.queryResult?.tree;
        if (pivotTableState.selectionArea != undefined &&
            (tree === undefined || tree.children.size > 0 || tree?.rows.length > 0)) {
            views.push({
                key: 'pivot_table',
                name: 'Pivot Table',
                content: (0, mithril_1.default)(pivot_table_1.PivotTable, {
                    trace: this.trace,
                    selectionArea: pivotTableState.selectionArea,
                }),
            });
        }
        this.addFlamegraphView(this.trace, this.monitor.ifStateChanged(), views);
        // Add this after all aggregation panels, to make it appear after 'Slices'
        if (this.trace.flows.selectedFlows.length > 0) {
            views.push({
                key: 'selected_flows',
                name: 'Flow Events',
                content: (0, mithril_1.default)(flow_events_panel_1.FlowEventsAreaSelectedPanel, { trace: this.trace }),
            });
        }
        return views;
    }
    view() {
        const views = this.getViews();
        const currentViewKey = this.getCurrentView();
        const aggregationButtons = views.map(({ key, name }) => {
            return (0, mithril_1.default)(button_1.Button, {
                onclick: () => {
                    this.currentTab = key;
                    raf_scheduler_1.raf.scheduleFullRedraw();
                },
                key,
                label: name,
                active: currentViewKey === key,
            });
        });
        if (currentViewKey === undefined) {
            return this.renderEmptyState();
        }
        const content = views.find(({ key }) => key === currentViewKey)?.content;
        if (content === undefined) {
            return this.renderEmptyState();
        }
        return (0, mithril_1.default)(details_shell_1.DetailsShell, {
            title: 'Area Selection',
            description: (0, mithril_1.default)(button_1.ButtonBar, aggregationButtons),
        }, content);
    }
    renderEmptyState() {
        return (0, mithril_1.default)(empty_state_1.EmptyState, {
            className: 'pf-noselection',
            title: 'Unsupported area selection',
        }, 'No details available for this area selection');
    }
    addFlamegraphView(trace, isChanged, views) {
        this.cpuProfileFlamegraph = this.computeCpuProfileFlamegraph(trace, isChanged);
        if (this.cpuProfileFlamegraph !== undefined) {
            views.push({
                key: 'cpu_profile_flamegraph_selection',
                name: 'CPU Profile Sample Flamegraph',
                content: this.cpuProfileFlamegraph.render(),
            });
        }
        this.perfSampleFlamegraph = this.computePerfSampleFlamegraph(trace, isChanged);
        if (this.perfSampleFlamegraph !== undefined) {
            views.push({
                key: 'perf_sample_flamegraph_selection',
                name: 'Perf Sample Flamegraph',
                content: this.perfSampleFlamegraph.render(),
            });
        }
        this.sliceFlamegraph = this.computeSliceFlamegraph(trace, isChanged);
        if (this.sliceFlamegraph !== undefined) {
            views.push({
                key: 'slice_flamegraph_selection',
                name: 'Slice Flamegraph',
                content: this.sliceFlamegraph.render(),
            });
        }
    }
    computeCpuProfileFlamegraph(trace, isChanged) {
        const currentSelection = trace.selection.selection;
        if (currentSelection.kind !== 'area') {
            return undefined;
        }
        if (!isChanged) {
            // If the selection has not changed, just return a copy of the last seen
            // attrs.
            return this.cpuProfileFlamegraph;
        }
        const utids = [];
        for (const trackInfo of currentSelection.tracks) {
            if (trackInfo?.tags?.kind === track_kinds_1.CPU_PROFILE_TRACK_KIND) {
                utids.push(trackInfo.tags?.utid);
            }
        }
        if (utids.length === 0) {
            return undefined;
        }
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
            where p.ts >= ${currentSelection.start}
              and p.ts <= ${currentSelection.end}
              and p.utid in (${utids.join(',')})
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
        return new query_flamegraph_1.QueryFlamegraph(trace, metrics, {
            state: flamegraph_1.Flamegraph.createDefaultState(metrics),
        });
    }
    computePerfSampleFlamegraph(trace, isChanged) {
        const currentSelection = trace.selection.selection;
        if (currentSelection.kind !== 'area') {
            return undefined;
        }
        if (!isChanged) {
            // If the selection has not changed, just return a copy of the last seen
            // attrs.
            return this.perfSampleFlamegraph;
        }
        const upids = getUpidsFromPerfSampleAreaSelection(currentSelection);
        const utids = getUtidsFromPerfSampleAreaSelection(currentSelection);
        if (utids.length === 0 && upids.length === 0) {
            return undefined;
        }
        const metrics = (0, query_flamegraph_1.metricsFromTableOrSubquery)(`
        (
          select id, parent_id as parentId, name, self_count
          from _callstacks_for_callsites!((
            select p.callsite_id
            from perf_sample p
            join thread t using (utid)
            where p.ts >= ${currentSelection.start}
              and p.ts <= ${currentSelection.end}
              and (
                p.utid in (${utids.join(',')})
                or t.upid in (${upids.join(',')})
              )
          ))
        )
      `, [
            {
                name: 'Perf Samples',
                unit: '',
                columnName: 'self_count',
            },
        ], 'include perfetto module linux.perf.samples');
        return new query_flamegraph_1.QueryFlamegraph(trace, metrics, {
            state: flamegraph_1.Flamegraph.createDefaultState(metrics),
        });
    }
    computeSliceFlamegraph(trace, isChanged) {
        const currentSelection = trace.selection.selection;
        if (currentSelection.kind !== 'area') {
            return undefined;
        }
        if (!isChanged) {
            // If the selection has not changed, just return a copy of the last seen
            // attrs.
            return this.sliceFlamegraph;
        }
        const trackIds = [];
        for (const trackInfo of currentSelection.tracks) {
            if (trackInfo?.tags?.kind !== track_kinds_1.SLICE_TRACK_KIND) {
                continue;
            }
            if (trackInfo.tags?.trackIds === undefined) {
                continue;
            }
            trackIds.push(...trackInfo.tags.trackIds);
        }
        if (trackIds.length === 0) {
            return undefined;
        }
        const metrics = (0, query_flamegraph_1.metricsFromTableOrSubquery)(`
        (
          select *
          from _viz_slice_ancestor_agg!((
            select s.id, s.dur
            from slice s
            left join slice t on t.parent_id = s.id
            where s.ts >= ${currentSelection.start}
              and s.ts <= ${currentSelection.end}
              and s.track_id in (${trackIds.join(',')})
              and t.id is null
          ))
        )
      `, [
            {
                name: 'Duration',
                unit: 'ns',
                columnName: 'self_dur',
            },
            {
                name: 'Samples',
                unit: '',
                columnName: 'self_count',
            },
        ], 'include perfetto module viz.slices;');
        return new query_flamegraph_1.QueryFlamegraph(trace, metrics, {
            state: flamegraph_1.Flamegraph.createDefaultState(metrics),
        });
    }
}
class AggregationsTabs {
    trash = new disposable_stack_1.DisposableStack();
    constructor(trace) {
        const unregister = trace.tabs.registerDetailsPanel({
            render(selection) {
                if (selection.kind === 'area') {
                    return (0, mithril_1.default)(AreaDetailsPanel, { trace });
                }
                else {
                    return undefined;
                }
            },
        });
        this.trash.use(unregister);
    }
    [Symbol.dispose]() {
        this.trash.dispose();
    }
}
exports.AggregationsTabs = AggregationsTabs;
function getUpidsFromPerfSampleAreaSelection(currentSelection) {
    const upids = [];
    for (const trackInfo of currentSelection.tracks) {
        if (trackInfo?.tags?.kind === track_kinds_1.PERF_SAMPLES_PROFILE_TRACK_KIND &&
            trackInfo.tags?.utid === undefined) {
            upids.push((0, logging_1.assertExists)(trackInfo.tags?.upid));
        }
    }
    return upids;
}
function getUtidsFromPerfSampleAreaSelection(currentSelection) {
    const utids = [];
    for (const trackInfo of currentSelection.tracks) {
        if (trackInfo?.tags?.kind === track_kinds_1.PERF_SAMPLES_PROFILE_TRACK_KIND &&
            trackInfo.tags?.utid !== undefined) {
            utids.push(trackInfo.tags?.utid);
        }
    }
    return utids;
}
//# sourceMappingURL=aggregation_tab.js.map