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
exports.getProcessInfo = getProcessInfo;
exports.getProcessName = getProcessName;
const query_result_1 = require("../../trace_processor/query_result");
const sql_utils_1 = require("../../trace_processor/sql_utils");
async function getProcessInfo(engine, upid) {
    const res = await engine.query(`
    include perfetto module android.process_metadata;
    select
      p.upid,
      p.pid,
      p.name,
      p.uid,
      m.package_name as packageName,
      m.version_code as versionCode
    from process p
    left join android_process_metadata m using (upid)
    where upid = ${upid};
  `);
    const row = res.firstRow({
        upid: query_result_1.NUM,
        pid: query_result_1.NUM,
        name: query_result_1.STR_NULL,
        uid: query_result_1.NUM_NULL,
        packageName: query_result_1.STR_NULL,
        versionCode: query_result_1.NUM_NULL,
    });
    return {
        upid,
        pid: row.pid,
        name: row.name ?? undefined,
        uid: (0, sql_utils_1.fromNumNull)(row.uid),
        packageName: row.packageName ?? undefined,
        versionCode: (0, sql_utils_1.fromNumNull)(row.versionCode),
    };
}
function getDisplayName(name, id) {
    if (name === undefined) {
        return id === undefined ? undefined : `${id}`;
    }
    return id === undefined ? name : `${name} [${id}]`;
}
function getProcessName(info) {
    return getDisplayName(info?.name, info?.pid);
}
//# sourceMappingURL=process.js.map