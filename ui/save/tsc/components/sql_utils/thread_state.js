"use strict";
// Copyright (C) 2023 The Android Open Source Project
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
exports.translateState = translateState;
exports.getThreadStateFromConstraints = getThreadStateFromConstraints;
exports.getThreadState = getThreadState;
const time_1 = require("../../base/time");
const query_result_1 = require("../../trace_processor/query_result");
const sql_utils_1 = require("../../trace_processor/sql_utils");
const core_types_1 = require("./core_types");
const thread_1 = require("./thread");
const states = {
    'R': 'Runnable',
    'S': 'Sleeping',
    'D': 'Uninterruptible Sleep',
    'T': 'Stopped',
    't': 'Traced',
    'X': 'Exit (Dead)',
    'Z': 'Exit (Zombie)',
    'x': 'Task Dead',
    'I': 'Idle',
    'K': 'Wake Kill',
    'W': 'Waking',
    'P': 'Parked',
    'N': 'No Load',
    '+': '(Preempted)',
};
function translateState(state, ioWait = undefined) {
    if (state === undefined)
        return '';
    // Self describing states
    switch (state) {
        case 'Running':
        case 'Initialized':
        case 'Deferred Ready':
        case 'Transition':
        case 'Stand By':
        case 'Waiting':
            return state;
    }
    if (state === null) {
        return 'Unknown';
    }
    let result = states[state[0]];
    if (ioWait === true) {
        result += ' (IO)';
    }
    else if (ioWait === false) {
        result += ' (non-IO)';
    }
    for (let i = 1; i < state.length; i++) {
        result += state[i] === '+' ? ' ' : ' + ';
        result += states[state[i]];
    }
    // state is some string we don't know how to translate.
    if (result === undefined)
        return state;
    return result;
}
// Gets a list of thread state objects from Trace Processor with given
// constraints.
async function getThreadStateFromConstraints(engine, constraints) {
    const query = await engine.query(`
    WITH raw AS (
      SELECT
      ts.id,
      sched.id AS sched_id,
      ts.ts,
      ts.dur,
      ts.cpu,
      ts.state,
      ts.blocked_function,
      ts.io_wait,
      ts.utid,
      ts.waker_utid,
      ts.waker_id,
      ts.irq_context,
      sched.priority
    FROM thread_state ts
    LEFT JOIN sched USING (utid, ts)
    )
    SELECT * FROM raw

    ${(0, sql_utils_1.constraintsToQuerySuffix)(constraints)}`);
    const it = query.iter({
        id: query_result_1.NUM,
        sched_id: query_result_1.NUM_NULL,
        ts: query_result_1.LONG,
        dur: query_result_1.LONG,
        cpu: query_result_1.NUM_NULL,
        state: query_result_1.STR_NULL,
        blocked_function: query_result_1.STR_NULL,
        io_wait: query_result_1.NUM_NULL,
        utid: query_result_1.NUM,
        waker_utid: query_result_1.NUM_NULL,
        waker_id: query_result_1.NUM_NULL,
        irq_context: query_result_1.NUM_NULL,
        priority: query_result_1.NUM_NULL,
    });
    const result = [];
    for (; it.valid(); it.next()) {
        const ioWait = it.io_wait === null ? undefined : it.io_wait > 0;
        // TODO(altimin): Consider fetching thread / process info using a single
        // query instead of one per row.
        result.push({
            id: it.id,
            schedSqlId: (0, sql_utils_1.fromNumNull)(it.sched_id),
            ts: time_1.Time.fromRaw(it.ts),
            dur: it.dur,
            cpu: (0, sql_utils_1.fromNumNull)(it.cpu),
            state: translateState(it.state ?? undefined, ioWait),
            blockedFunction: it.blocked_function ?? undefined,
            thread: await (0, thread_1.getThreadInfo)(engine, (0, core_types_1.asUtid)(it.utid)),
            wakerUtid: (0, core_types_1.asUtid)(it.waker_utid ?? undefined),
            wakerId: (0, core_types_1.asThreadStateSqlId)(it.waker_id ?? undefined),
            wakerInterruptCtx: (0, sql_utils_1.fromNumNull)(it.irq_context),
            priority: (0, sql_utils_1.fromNumNull)(it.priority),
        });
    }
    return result;
}
async function getThreadState(engine, id) {
    const result = await getThreadStateFromConstraints(engine, {
        filters: [`id=${id}`],
    });
    if (result.length > 1) {
        throw new Error(`thread_state table has more than one row with id ${id}`);
    }
    if (result.length === 0) {
        return undefined;
    }
    return result[0];
}
//# sourceMappingURL=thread_state.js.map