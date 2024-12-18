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
exports.getSchedFromConstraints = getSchedFromConstraints;
exports.getSched = getSched;
exports.getSchedWakeupInfo = getSchedWakeupInfo;
const logging_1 = require("../../base/logging");
const time_1 = require("../../base/time");
const query_result_1 = require("../../trace_processor/query_result");
const sql_utils_1 = require("../../trace_processor/sql_utils");
const core_types_1 = require("./core_types");
const thread_1 = require("./thread");
const thread_state_1 = require("./thread_state");
// Gets a list of sched objects from Trace Processor with given
// constraints.
async function getSchedFromConstraints(engine, constraints) {
    const query = await engine.query(`
    SELECT
      sched.id as schedSqlId,
      (
        SELECT id
        FROM thread_state
        WHERE
          thread_state.ts = sched.ts
          AND thread_state.utid = sched.utid
      ) as threadStateSqlId,
      sched.ts,
      sched.dur,
      sched.cpu,
      sched.priority as priority,
      sched.end_state as endState,
      sched.utid
    FROM sched
    ${(0, sql_utils_1.constraintsToQuerySuffix)(constraints)}`);
    const it = query.iter({
        schedSqlId: query_result_1.NUM,
        threadStateSqlId: query_result_1.NUM_NULL,
        ts: query_result_1.LONG,
        dur: query_result_1.LONG,
        cpu: query_result_1.NUM,
        priority: query_result_1.NUM,
        endState: query_result_1.STR_NULL,
        utid: query_result_1.NUM,
    });
    const result = [];
    for (; it.valid(); it.next()) {
        result.push({
            id: (0, core_types_1.asSchedSqlId)(it.schedSqlId),
            threadStateId: (0, core_types_1.asThreadStateSqlId)(it.threadStateSqlId ?? undefined),
            ts: time_1.Time.fromRaw(it.ts),
            dur: it.dur,
            priority: it.priority,
            endState: it.endState ?? undefined,
            cpu: it.cpu ?? undefined,
            thread: await (0, thread_1.getThreadInfo)(engine, (0, core_types_1.asUtid)(it.utid)),
        });
    }
    return result;
}
async function getSched(engine, id) {
    const result = await getSchedFromConstraints(engine, {
        filters: [`sched.id=${id}`],
    });
    (0, logging_1.assertTrue)(result.length <= 1);
    if (result.length === 0) {
        return undefined;
    }
    return result[0];
}
// Returns the thread and time of the wakeup that resulted in this running
// sched slice. Omits wakeups that are known to be from interrupt context,
// since we cannot always recover the correct waker cpu with the current
// table layout.
async function getSchedWakeupInfo(engine, sched) {
    const prevRunnable = await (0, thread_state_1.getThreadStateFromConstraints)(engine, {
        filters: [
            'state = "R"',
            `ts + dur = ${sched.ts}`,
            `utid = ${sched.thread.utid}`,
            `(irq_context is null or irq_context = 0)`,
        ],
    });
    if (prevRunnable.length === 0 || prevRunnable[0].wakerId === undefined) {
        return undefined;
    }
    const waker = await (0, thread_state_1.getThreadState)(engine, prevRunnable[0].wakerId);
    if (waker === undefined) {
        return undefined;
    }
    return {
        wakerCpu: waker?.cpu,
        wakerUtid: prevRunnable[0].wakerUtid,
        wakeupTs: prevRunnable[0].ts,
    };
}
//# sourceMappingURL=sched.js.map