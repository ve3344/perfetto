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
const query_result_tab_1 = require("../../components/query_table/query_result_tab");
const time_1 = require("../../base/time");
const utils_1 = require("../../base/utils");
const query_result_1 = require("../../trace_processor/query_result");
let routeArgsForFirstTrace;
/**
 * Uses URL args (table, ts, dur) to select events on trace load.
 *
 * E.g. ?table=thread_state&ts=39978672284068&dur=18995809
 *
 * Note: `ts` and `dur` are used rather than id as id is not stable over TP
 * versions.
 *
 * The table passed must have `ts`, `dur` (if a dur value is supplied) and `id`
 * columns, and SQL resolvers must be available for those tables (usually from
 * plugins).
 */
class default_1 {
    static id = 'dev.perfetto.DeeplinkQuerystring';
    static onActivate(app) {
        routeArgsForFirstTrace = app.initialRouteArgs;
    }
    async onTraceLoad(trace) {
        trace.onTraceReady.addListener(async () => {
            const initialRouteArgs = routeArgsForFirstTrace;
            routeArgsForFirstTrace = undefined;
            if (initialRouteArgs === undefined)
                return;
            await selectInitialRouteArgs(trace, initialRouteArgs);
            if (initialRouteArgs.visStart !== undefined &&
                initialRouteArgs.visEnd !== undefined) {
                zoomPendingDeeplink(trace, initialRouteArgs.visStart, initialRouteArgs.visEnd);
            }
            if (initialRouteArgs.query !== undefined) {
                (0, query_result_tab_1.addQueryResultsTab)(trace, {
                    query: initialRouteArgs.query,
                    title: 'Deeplink Query',
                });
            }
        });
    }
}
exports.default = default_1;
function zoomPendingDeeplink(trace, visStart, visEnd) {
    const visualStart = time_1.Time.fromRaw(BigInt(visStart));
    const visualEnd = time_1.Time.fromRaw(BigInt(visEnd));
    if (!(visualStart < visualEnd &&
        trace.traceInfo.start <= visualStart &&
        visualEnd <= trace.traceInfo.end)) {
        return;
    }
    trace.timeline.setViewportTime(visualStart, visualEnd);
}
async function selectInitialRouteArgs(trace, args) {
    const { table = 'slice', ts, dur } = args;
    // We need at least a ts
    if (!(0, utils_1.exists)(ts)) {
        return;
    }
    const conditions = [];
    conditions.push(`ts = ${ts}`);
    (0, utils_1.exists)(dur) && conditions.push(`dur = ${dur}`);
    // Find the id of the slice with this ts & dur in the given table
    const result = await trace.engine.query(`
    select
      id
    from
      ${table}
    where ${conditions.join(' AND ')}
  `);
    if (result.numRows() === 0) {
        return;
    }
    const { id } = result.firstRow({
        id: query_result_1.NUM,
    });
    trace.selection.selectSqlEvent(table, id, {
        scrollToSelection: true,
        switchToCurrentSelectionTab: false,
    });
}
//# sourceMappingURL=index.js.map