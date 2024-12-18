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
exports.getSliceFromConstraints = getSliceFromConstraints;
exports.getSlice = getSlice;
exports.getDescendantSliceTree = getDescendantSliceTree;
const time_1 = require("../../base/time");
const utils_1 = require("../../base/utils");
const query_result_1 = require("../../trace_processor/query_result");
const sql_utils_1 = require("../../trace_processor/sql_utils");
const core_types_1 = require("./core_types");
const args_1 = require("./args");
const thread_1 = require("./thread");
const process_1 = require("./process");
async function getUtidAndUpid(engine, sqlTrackId) {
    const { upid, utid } = (await engine.query(`
      SELECT
        extract_arg(dimension_arg_set_id, 'upid') as upid,
        extract_arg(dimension_arg_set_id, 'utid') as utid
      FROM track
      WHERE id = ${sqlTrackId}
    `)).firstRow({ upid: query_result_1.NUM_NULL, utid: query_result_1.NUM_NULL });
    return { upid: (0, core_types_1.asUpid)(upid ?? undefined), utid: (0, core_types_1.asUtid)(utid ?? undefined) };
}
async function getSliceFromConstraints(engine, constraints) {
    const query = await engine.query(`
    SELECT
      id,
      name,
      ts,
      dur,
      track_id as trackId,
      depth,
      parent_id as parentId,
      thread_dur as threadDur,
      thread_ts as threadTs,
      category,
      arg_set_id as argSetId,
      ABS_TIME_STR(ts) as absTime
    FROM slice
    ${(0, sql_utils_1.constraintsToQuerySuffix)(constraints)}`);
    const it = query.iter({
        id: query_result_1.NUM,
        name: query_result_1.STR,
        ts: query_result_1.LONG,
        dur: query_result_1.LONG,
        trackId: query_result_1.NUM,
        depth: query_result_1.NUM,
        parentId: query_result_1.NUM_NULL,
        threadDur: query_result_1.LONG_NULL,
        threadTs: query_result_1.LONG_NULL,
        category: query_result_1.STR_NULL,
        argSetId: query_result_1.NUM,
        absTime: query_result_1.STR_NULL,
    });
    const result = [];
    for (; it.valid(); it.next()) {
        const { utid, upid } = await getUtidAndUpid(engine, it.trackId);
        const thread = utid === undefined ? undefined : await (0, thread_1.getThreadInfo)(engine, utid);
        const process = thread !== undefined
            ? thread.process
            : upid === undefined
                ? undefined
                : await (0, process_1.getProcessInfo)(engine, upid);
        result.push({
            id: (0, core_types_1.asSliceSqlId)(it.id),
            name: it.name,
            ts: time_1.Time.fromRaw(it.ts),
            dur: it.dur,
            trackId: it.trackId,
            depth: it.depth,
            parentId: (0, core_types_1.asSliceSqlId)(it.parentId ?? undefined),
            thread,
            process,
            threadDur: it.threadDur ?? undefined,
            threadTs: (0, utils_1.exists)(it.threadTs) ? time_1.Time.fromRaw(it.threadTs) : undefined,
            category: it.category ?? undefined,
            args: await (0, args_1.getArgs)(engine, (0, core_types_1.asArgSetId)(it.argSetId)),
            absTime: it.absTime ?? undefined,
        });
    }
    return result;
}
async function getSlice(engine, id) {
    const result = await getSliceFromConstraints(engine, {
        filters: [`id=${id}`],
    });
    if (result.length > 1) {
        throw new Error(`slice table has more than one row with id ${id}`);
    }
    if (result.length === 0) {
        return undefined;
    }
    return result[0];
}
// Get all descendants for a given slice in a tree form.
async function getDescendantSliceTree(engine, id) {
    const slice = await getSlice(engine, id);
    if (slice === undefined) {
        return undefined;
    }
    const descendants = await getSliceFromConstraints(engine, {
        filters: [
            `track_id=${slice.trackId}`,
            `depth >= ${slice.depth}`,
            `ts >= ${slice.ts}`,
            // TODO(altimin): consider making `dur` undefined here instead of -1.
            slice.dur >= 0 ? `ts <= (${slice.ts} + ${slice.dur})` : undefined,
        ],
        orderBy: ['ts', 'depth'],
    });
    const slices = Object.fromEntries(descendants.map((slice) => [
        slice.id,
        {
            children: [],
            ...slice,
        },
    ]));
    for (const [_, slice] of Object.entries(slices)) {
        if (slice.parentId !== undefined) {
            const parent = slices[slice.parentId];
            slice.parent = parent;
            parent.children.push(slice);
        }
    }
    return slices[id];
}
//# sourceMappingURL=slice.js.map