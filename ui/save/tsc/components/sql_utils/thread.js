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
exports.getThreadInfo = getThreadInfo;
exports.getThreadName = getThreadName;
exports.getFullThreadName = getFullThreadName;
const query_result_1 = require("../../trace_processor/query_result");
const sql_utils_1 = require("../../trace_processor/sql_utils");
const process_1 = require("./process");
async function getThreadInfo(engine, utid) {
    const it = (await engine.query(`
        SELECT tid, name, upid
        FROM thread
        WHERE utid = ${utid};
    `)).iter({ tid: query_result_1.NUM, name: query_result_1.STR_NULL, upid: query_result_1.NUM_NULL });
    if (!it.valid()) {
        return {
            utid,
        };
    }
    const upid = (0, sql_utils_1.fromNumNull)(it.upid);
    return {
        utid,
        tid: it.tid,
        name: it.name ?? undefined,
        process: upid ? await (0, process_1.getProcessInfo)(engine, upid) : undefined,
    };
}
function getDisplayName(name, id) {
    if (name === undefined) {
        return id === undefined ? undefined : `${id}`;
    }
    return id === undefined ? name : `${name} [${id}]`;
}
function getThreadName(info) {
    return getDisplayName(info?.name, info?.tid);
}
// Return the full thread name, including the process name.
function getFullThreadName(info) {
    if (info?.process === undefined) {
        return getThreadName(info);
    }
    return `${getThreadName(info)} ${(0, process_1.getProcessName)(info.process)}`;
}
//# sourceMappingURL=thread.js.map