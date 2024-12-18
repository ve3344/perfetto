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
const thread_1 = require("../../components/sql_utils/thread");
const debug_tracks_1 = require("../../components/tracks/debug_tracks");
const track_kinds_1 = require("../../public/track_kinds");
const core_types_1 = require("../../components/sql_utils/core_types");
const query_result_tab_1 = require("../../components/query_table/query_result_tab");
const modal_1 = require("../../widgets/modal");
const exposed_commands_1 = require("../../public/exposed_commands");
const utils_1 = require("../../public/utils");
const criticalPathSliceColumns = {
    ts: 'ts',
    dur: 'dur',
    name: 'name',
};
const criticalPathsliceColumnNames = [
    'id',
    'utid',
    'ts',
    'dur',
    'name',
    'table_name',
];
const criticalPathsliceLiteColumns = {
    ts: 'ts',
    dur: 'dur',
    name: 'thread_name',
};
const criticalPathsliceLiteColumnNames = [
    'id',
    'utid',
    'ts',
    'dur',
    'thread_name',
    'process_name',
    'table_name',
];
const sliceLiteColumns = { ts: 'ts', dur: 'dur', name: 'thread_name' };
const sliceLiteColumnNames = [
    'id',
    'utid',
    'ts',
    'dur',
    'thread_name',
    'process_name',
    'table_name',
];
const sliceColumns = { ts: 'ts', dur: 'dur', name: 'name' };
const sliceColumnNames = ['id', 'utid', 'ts', 'dur', 'name', 'table_name'];
function getFirstUtidOfSelectionOrVisibleWindow(trace) {
    const selection = trace.selection.selection;
    if (selection.kind === 'area') {
        for (const trackDesc of selection.tracks) {
            if (trackDesc?.tags?.kind === track_kinds_1.THREAD_STATE_TRACK_KIND &&
                trackDesc?.tags?.utid !== undefined) {
                return trackDesc.tags.utid;
            }
        }
    }
    return 0;
}
function showModalErrorAreaSelectionRequired() {
    (0, modal_1.showModal)({
        title: 'Error: range selection required',
        content: 'This command requires an area selection over a thread state track.',
    });
}
function showModalErrorThreadStateRequired() {
    (0, modal_1.showModal)({
        title: 'Error: thread state selection required',
        content: 'This command requires a thread state slice to be selected.',
    });
}
// If utid is undefined, returns the utid for the selected thread state track,
// if any. If it's defined, looks up the info about that specific utid.
async function getThreadInfoForUtidOrSelection(trace, utid) {
    if (utid === undefined) {
        const selection = trace.selection.selection;
        if (selection.kind === 'track_event') {
            if (selection.utid !== undefined) {
                utid = (0, core_types_1.asUtid)(selection.utid);
            }
        }
    }
    if (utid === undefined)
        return undefined;
    return (0, thread_1.getThreadInfo)(trace.engine, utid);
}
class default_1 {
    static id = 'dev.perfetto.CriticalPath';
    async onTraceLoad(ctx) {
        // The 3 commands below are used in two contextes:
        // 1. By clicking a slice and using the command palette. In this case the
        //    utid argument is undefined and we need to look at the selection.
        // 2. Invoked via runCommand(...) by thread_state_tab.ts when the user
        //    clicks on the buttons in the details panel. In this case the details
        //    panel passes the utid explicitly.
        ctx.commands.registerCommand({
            id: exposed_commands_1.CRITICAL_PATH_LITE_CMD,
            name: 'Critical path lite (selected thread state slice)',
            callback: async (utid) => {
                const thdInfo = await getThreadInfoForUtidOrSelection(ctx, utid);
                if (thdInfo === undefined) {
                    return showModalErrorThreadStateRequired();
                }
                ctx.engine
                    .query(`INCLUDE PERFETTO MODULE sched.thread_executing_span;`)
                    .then(() => (0, debug_tracks_1.addDebugSliceTrack)({
                    trace: ctx,
                    data: {
                        sqlSource: `
                SELECT
                  cr.id,
                  cr.utid,
                  cr.ts,
                  cr.dur,
                  thread.name AS thread_name,
                  process.name AS process_name,
                  'thread_state' AS table_name
                FROM
                  _thread_executing_span_critical_path(
                    ${thdInfo.utid},
                    trace_bounds.start_ts,
                    trace_bounds.end_ts - trace_bounds.start_ts) cr,
                  trace_bounds
                JOIN thread USING(utid)
                JOIN process USING(upid)
              `,
                        columns: sliceLiteColumnNames,
                    },
                    title: `${thdInfo.name}`,
                    columns: sliceLiteColumns,
                    argColumns: sliceLiteColumnNames,
                }));
            },
        });
        ctx.commands.registerCommand({
            id: exposed_commands_1.CRITICAL_PATH_CMD,
            name: 'Critical path (selected thread state slice)',
            callback: async (utid) => {
                const thdInfo = await getThreadInfoForUtidOrSelection(ctx, utid);
                if (thdInfo === undefined) {
                    return showModalErrorThreadStateRequired();
                }
                ctx.engine
                    .query(`INCLUDE PERFETTO MODULE sched.thread_executing_span_with_slice;`)
                    .then(() => (0, debug_tracks_1.addDebugSliceTrack)({
                    trace: ctx,
                    data: {
                        sqlSource: `
                SELECT cr.id, cr.utid, cr.ts, cr.dur, cr.name, cr.table_name
                  FROM
                    _thread_executing_span_critical_path_stack(
                      ${thdInfo.utid},
                      trace_bounds.start_ts,
                      trace_bounds.end_ts - trace_bounds.start_ts) cr,
                    trace_bounds WHERE name IS NOT NULL
              `,
                        columns: sliceColumnNames,
                    },
                    title: `${thdInfo.name}`,
                    columns: sliceColumns,
                    argColumns: sliceColumnNames,
                }));
            },
        });
        ctx.commands.registerCommand({
            id: 'perfetto.CriticalPathLite_AreaSelection',
            name: 'Critical path lite (over area selection)',
            callback: async () => {
                const trackUtid = getFirstUtidOfSelectionOrVisibleWindow(ctx);
                const window = await (0, utils_1.getTimeSpanOfSelectionOrVisibleWindow)(ctx);
                if (trackUtid === 0) {
                    return showModalErrorAreaSelectionRequired();
                }
                await ctx.engine.query(`INCLUDE PERFETTO MODULE sched.thread_executing_span;`);
                await (0, debug_tracks_1.addDebugSliceTrack)({
                    trace: ctx,
                    data: {
                        sqlSource: `
                SELECT
                  cr.id,
                  cr.utid,
                  cr.ts,
                  cr.dur,
                  thread.name AS thread_name,
                  process.name AS process_name,
                  'thread_state' AS table_name
                FROM
                  _thread_executing_span_critical_path(
                      ${trackUtid},
                      ${window.start},
                      ${window.end} - ${window.start}) cr
                JOIN thread USING(utid)
                JOIN process USING(upid)
                `,
                        columns: criticalPathsliceLiteColumnNames,
                    },
                    title: (await (0, thread_1.getThreadInfo)(ctx.engine, trackUtid)).name ??
                        '<thread name>',
                    columns: criticalPathsliceLiteColumns,
                    argColumns: criticalPathsliceLiteColumnNames,
                });
            },
        });
        ctx.commands.registerCommand({
            id: 'perfetto.CriticalPath_AreaSelection',
            name: 'Critical path  (over area selection)',
            callback: async () => {
                const trackUtid = getFirstUtidOfSelectionOrVisibleWindow(ctx);
                const window = await (0, utils_1.getTimeSpanOfSelectionOrVisibleWindow)(ctx);
                if (trackUtid === 0) {
                    return showModalErrorAreaSelectionRequired();
                }
                await ctx.engine.query(`INCLUDE PERFETTO MODULE sched.thread_executing_span_with_slice;`);
                await (0, debug_tracks_1.addDebugSliceTrack)({
                    trace: ctx,
                    data: {
                        sqlSource: `
                SELECT cr.id, cr.utid, cr.ts, cr.dur, cr.name, cr.table_name
                FROM
                _critical_path_stack(
                  ${trackUtid},
                  ${window.start},
                  ${window.end} - ${window.start}, 1, 1, 1, 1) cr
                WHERE name IS NOT NULL
                `,
                        columns: criticalPathsliceColumnNames,
                    },
                    title: (await (0, thread_1.getThreadInfo)(ctx.engine, trackUtid)).name ??
                        '<thread name>',
                    columns: criticalPathSliceColumns,
                    argColumns: criticalPathsliceColumnNames,
                });
            },
        });
        ctx.commands.registerCommand({
            id: 'perfetto.CriticalPathPprof_AreaSelection',
            name: 'Critical path pprof (over area selection)',
            callback: async () => {
                const trackUtid = getFirstUtidOfSelectionOrVisibleWindow(ctx);
                const window = await (0, utils_1.getTimeSpanOfSelectionOrVisibleWindow)(ctx);
                if (trackUtid === 0) {
                    return showModalErrorAreaSelectionRequired();
                }
                (0, query_result_tab_1.addQueryResultsTab)(ctx, {
                    query: `
              INCLUDE PERFETTO MODULE sched.thread_executing_span_with_slice;
              SELECT *
                FROM
                  _thread_executing_span_critical_path_graph(
                  "criical_path",
                    ${trackUtid},
                    ${window.start},
                    ${window.end} - ${window.start}) cr`,
                    title: 'Critical path',
                });
            },
        });
    }
}
exports.default = default_1;
//# sourceMappingURL=index.js.map