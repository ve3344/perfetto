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
const query_result_1 = require("../../trace_processor/query_result");
const logging_1 = require("../../base/logging");
async function listThreads(trace) {
    const query = `select
        utid,
        tid,
        pid,
        ifnull(thread.name, '') as threadName,
        ifnull(
          case when length(process.name) > 0 then process.name else null end,
          thread.name) as procName,
        process.cmdline as cmdline
        from (select * from thread order by upid) as thread
        left join (select * from process order by upid) as process
        using(upid)`;
    const result = await trace.engine.query(query);
    const threads = new Map();
    const it = result.iter({
        utid: query_result_1.NUM,
        tid: query_result_1.NUM,
        pid: query_result_1.NUM_NULL,
        threadName: query_result_1.STR,
        procName: query_result_1.STR_NULL,
        cmdline: query_result_1.STR_NULL,
    });
    for (; it.valid(); it.next()) {
        const utid = it.utid;
        const tid = it.tid;
        const pid = it.pid === null ? undefined : it.pid;
        const threadName = it.threadName;
        const procName = it.procName === null ? undefined : it.procName;
        const cmdline = it.cmdline === null ? undefined : it.cmdline;
        threads.set(utid, { utid, tid, threadName, pid, procName, cmdline });
    }
    return threads;
}
class default_1 {
    static id = 'dev.perfetto.Thread';
    threads;
    async onTraceLoad(ctx) {
        this.threads = await listThreads(ctx);
    }
    getThreadMap() {
        return (0, logging_1.assertExists)(this.threads);
    }
}
exports.default = default_1;
//# sourceMappingURL=index.js.map