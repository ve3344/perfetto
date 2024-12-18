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
const time_1 = require("../../base/time");
const utils_1 = require("../../base/utils");
const legacy_trace_viewer_1 = require("../../frontend/legacy_trace_viewer");
const legacy_trace_viewer_2 = require("../../frontend/legacy_trace_viewer");
const app_impl_1 = require("../../core/app_impl");
const query_result_tab_1 = require("../../components/query_table/query_result_tab");
const feature_flags_1 = require("../../core/feature_flags");
const SQL_STATS = `
with first as (select started as ts from sqlstats limit 1)
select
    round((max(ended - started, 0))/1e6) as runtime_ms,
    round((started - first.ts)/1e6) as t_start_ms,
    query
from sqlstats, first
order by started desc`;
const ALL_PROCESSES_QUERY = 'select name, pid from process order by name;';
const CPU_TIME_FOR_PROCESSES = `
select
  process.name,
  sum(dur)/1e9 as cpu_sec
from sched
join thread using(utid)
join process using(upid)
group by upid
order by cpu_sec desc
limit 100;`;
const CYCLES_PER_P_STATE_PER_CPU = `
select
  cpu,
  freq,
  dur,
  sum(dur * freq)/1e6 as mcycles
from (
  select
    cpu,
    value as freq,
    lead(ts) over (partition by cpu order by ts) - ts as dur
  from counter
  inner join cpu_counter_track on counter.track_id = cpu_counter_track.id
  where name = 'cpufreq'
) group by cpu, freq
order by mcycles desc limit 32;`;
const CPU_TIME_BY_CPU_BY_PROCESS = `
select
  process.name as process,
  thread.name as thread,
  cpu,
  sum(dur) / 1e9 as cpu_sec
from sched
inner join thread using(utid)
inner join process using(upid)
group by utid, cpu
order by cpu_sec desc
limit 30;`;
const HEAP_GRAPH_BYTES_PER_TYPE = `
select
  o.upid,
  o.graph_sample_ts,
  c.name,
  sum(o.self_size) as total_self_size
from heap_graph_object o join heap_graph_class c on o.type_id = c.id
group by
 o.upid,
 o.graph_sample_ts,
 c.name
order by total_self_size desc
limit 100;`;
const SHOW_OPEN_WITH_LEGACY_UI_BUTTON = feature_flags_1.featureFlags.register({
    id: 'showOpenWithLegacyUiButton',
    name: 'Show "Open with legacy UI" button',
    description: 'Show "Open with legacy UI" button in the sidebar',
    defaultValue: false,
});
class default_1 {
    static id = 'perfetto.CoreCommands';
    static onActivate(ctx) {
        if (ctx.sidebar.enabled) {
            ctx.commands.registerCommand({
                id: 'perfetto.CoreCommands#ToggleLeftSidebar',
                name: 'Toggle left sidebar',
                callback: () => {
                    ctx.sidebar.toggleVisibility();
                },
                defaultHotkey: '!Mod+B',
            });
        }
        const input = document.createElement('input');
        input.classList.add('trace_file');
        input.setAttribute('type', 'file');
        input.style.display = 'none';
        input.addEventListener('change', onInputElementFileSelectionChanged);
        document.body.appendChild(input);
        const OPEN_TRACE_COMMAND_ID = 'perfetto.CoreCommands#openTrace';
        ctx.commands.registerCommand({
            id: OPEN_TRACE_COMMAND_ID,
            name: 'Open trace file',
            callback: () => {
                delete input.dataset['useCatapultLegacyUi'];
                input.click();
            },
            defaultHotkey: '!Mod+O',
        });
        ctx.sidebar.addMenuItem({
            commandId: OPEN_TRACE_COMMAND_ID,
            section: 'navigation',
            icon: 'folder_open',
        });
        const OPEN_LEGACY_COMMAND_ID = 'perfetto.CoreCommands#openTraceInLegacyUi';
        ctx.commands.registerCommand({
            id: OPEN_LEGACY_COMMAND_ID,
            name: 'Open with legacy UI',
            callback: () => {
                input.dataset['useCatapultLegacyUi'] = '1';
                input.click();
            },
        });
        if (SHOW_OPEN_WITH_LEGACY_UI_BUTTON.get()) {
            ctx.sidebar.addMenuItem({
                commandId: OPEN_LEGACY_COMMAND_ID,
                section: 'navigation',
                icon: 'filter_none',
            });
        }
    }
    async onTraceLoad(ctx) {
        ctx.commands.registerCommand({
            id: 'perfetto.CoreCommands#RunQueryAllProcesses',
            name: 'Run query: All processes',
            callback: () => {
                (0, query_result_tab_1.addQueryResultsTab)(ctx, {
                    query: ALL_PROCESSES_QUERY,
                    title: 'All Processes',
                });
            },
        });
        ctx.commands.registerCommand({
            id: 'perfetto.CoreCommands#RunQueryCpuTimeByProcess',
            name: 'Run query: CPU time by process',
            callback: () => {
                (0, query_result_tab_1.addQueryResultsTab)(ctx, {
                    query: CPU_TIME_FOR_PROCESSES,
                    title: 'CPU time by process',
                });
            },
        });
        ctx.commands.registerCommand({
            id: 'perfetto.CoreCommands#RunQueryCyclesByStateByCpu',
            name: 'Run query: cycles by p-state by CPU',
            callback: () => {
                (0, query_result_tab_1.addQueryResultsTab)(ctx, {
                    query: CYCLES_PER_P_STATE_PER_CPU,
                    title: 'Cycles by p-state by CPU',
                });
            },
        });
        ctx.commands.registerCommand({
            id: 'perfetto.CoreCommands#RunQueryCyclesByCpuByProcess',
            name: 'Run query: CPU Time by CPU by process',
            callback: () => {
                (0, query_result_tab_1.addQueryResultsTab)(ctx, {
                    query: CPU_TIME_BY_CPU_BY_PROCESS,
                    title: 'CPU time by CPU by process',
                });
            },
        });
        ctx.commands.registerCommand({
            id: 'perfetto.CoreCommands#RunQueryHeapGraphBytesPerType',
            name: 'Run query: heap graph bytes per type',
            callback: () => {
                (0, query_result_tab_1.addQueryResultsTab)(ctx, {
                    query: HEAP_GRAPH_BYTES_PER_TYPE,
                    title: 'Heap graph bytes per type',
                });
            },
        });
        ctx.commands.registerCommand({
            id: 'perfetto.CoreCommands#DebugSqlPerformance',
            name: 'Debug SQL performance',
            callback: () => {
                (0, query_result_tab_1.addQueryResultsTab)(ctx, {
                    query: SQL_STATS,
                    title: 'Recent SQL queries',
                });
            },
        });
        ctx.commands.registerCommand({
            id: 'perfetto.CoreCommands#UnpinAllTracks',
            name: 'Unpin all pinned tracks',
            callback: () => {
                const workspace = ctx.workspace;
                workspace.pinnedTracks.forEach((t) => workspace.unpinTrack(t));
            },
        });
        ctx.commands.registerCommand({
            id: 'perfetto.CoreCommands#ExpandAllGroups',
            name: 'Expand all track groups',
            callback: () => {
                ctx.workspace.flatTracks.forEach((track) => track.expand());
            },
        });
        ctx.commands.registerCommand({
            id: 'perfetto.CoreCommands#CollapseAllGroups',
            name: 'Collapse all track groups',
            callback: () => {
                ctx.workspace.flatTracks.forEach((track) => track.collapse());
            },
        });
        ctx.commands.registerCommand({
            id: 'perfetto.CoreCommands#PanToTimestamp',
            name: 'Pan to timestamp',
            callback: (tsRaw) => {
                if ((0, utils_1.exists)(tsRaw)) {
                    if (typeof tsRaw !== 'bigint') {
                        throw Error(`${tsRaw} is not a bigint`);
                    }
                    ctx.timeline.panToTimestamp(time_1.Time.fromRaw(tsRaw));
                }
                else {
                    // No args passed, probably run from the command palette.
                    const ts = promptForTimestamp('Enter a timestamp');
                    if ((0, utils_1.exists)(ts)) {
                        ctx.timeline.panToTimestamp(time_1.Time.fromRaw(ts));
                    }
                }
            },
        });
        ctx.commands.registerCommand({
            id: 'perfetto.CoreCommands#ShowCurrentSelectionTab',
            name: 'Show current selection tab',
            callback: () => {
                ctx.tabs.showTab('current_selection');
            },
        });
        ctx.commands.registerCommand({
            id: 'createNewEmptyWorkspace',
            name: 'Create new empty workspace',
            callback: async () => {
                const workspaces = app_impl_1.AppImpl.instance.trace?.workspaces;
                if (workspaces === undefined)
                    return; // No trace loaded.
                const name = await ctx.omnibox.prompt('Give it a name...');
                if (name === undefined || name === '')
                    return;
                workspaces.switchWorkspace(workspaces.createEmptyWorkspace(name));
            },
        });
        ctx.commands.registerCommand({
            id: 'switchWorkspace',
            name: 'Switch workspace',
            callback: async () => {
                const workspaces = app_impl_1.AppImpl.instance.trace?.workspaces;
                if (workspaces === undefined)
                    return; // No trace loaded.
                const workspace = await ctx.omnibox.prompt('Choose a workspace...', {
                    values: workspaces.all,
                    getName: (ws) => ws.title,
                });
                if (workspace) {
                    workspaces.switchWorkspace(workspace);
                }
            },
        });
    }
}
exports.default = default_1;
function promptForTimestamp(message) {
    const tsStr = window.prompt(message);
    if (tsStr !== null) {
        try {
            return time_1.Time.fromRaw(BigInt(tsStr));
        }
        catch {
            window.alert(`${tsStr} is not an integer`);
        }
    }
    return undefined;
}
function onInputElementFileSelectionChanged(e) {
    if (!(e.target instanceof HTMLInputElement)) {
        throw new Error('Not an input element');
    }
    if (!e.target.files)
        return;
    const file = e.target.files[0];
    // Reset the value so onchange will be fired with the same file.
    e.target.value = '';
    if (e.target.dataset['useCatapultLegacyUi'] === '1') {
        openWithLegacyUi(file);
        return;
    }
    app_impl_1.AppImpl.instance.analytics.logEvent('Trace Actions', 'Open trace from file');
    app_impl_1.AppImpl.instance.openTraceFromFile(file);
}
async function openWithLegacyUi(file) {
    // Switch back to the old catapult UI.
    app_impl_1.AppImpl.instance.analytics.logEvent('Trace Actions', 'Open trace in Legacy UI');
    if (await (0, legacy_trace_viewer_2.isLegacyTrace)(file)) {
        return await (0, legacy_trace_viewer_2.openFileWithLegacyTraceViewer)(file);
    }
    return await (0, legacy_trace_viewer_1.openInOldUIWithSizeCheck)(file);
}
//# sourceMappingURL=index.js.map