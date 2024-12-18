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
exports.getThreadTable = getThreadTable;
exports.getProcessTable = getProcessTable;
exports.getSliceTable = getSliceTable;
exports.getAndroidLogsTable = getAndroidLogsTable;
exports.getSchedTable = getSchedTable;
exports.getThreadStateTable = getThreadStateTable;
const well_known_columns_1 = require("./well_known_columns");
function getThreadTable() {
    return {
        name: 'thread',
        columns: [
            new well_known_columns_1.ThreadIdColumn('utid'),
            new well_known_columns_1.StandardColumn('tid', { aggregationType: 'nominal' }),
            new well_known_columns_1.StandardColumn('name'),
            new well_known_columns_1.TimestampColumn('start_ts'),
            new well_known_columns_1.TimestampColumn('end_ts'),
            new well_known_columns_1.ProcessColumnSet('upid', { title: 'upid', notNull: true }),
            new well_known_columns_1.StandardColumn('is_main_thread', {
                aggregationType: 'nominal',
            }),
        ],
    };
}
function getProcessTable() {
    return {
        name: 'process',
        columns: [
            new well_known_columns_1.ProcessIdColumn('upid'),
            new well_known_columns_1.StandardColumn('pid', { aggregationType: 'nominal' }),
            new well_known_columns_1.StandardColumn('name'),
            new well_known_columns_1.TimestampColumn('start_ts'),
            new well_known_columns_1.TimestampColumn('end_ts'),
            new well_known_columns_1.ProcessColumn('parent_upid'),
            new well_known_columns_1.StandardColumn('uid', { aggregationType: 'nominal' }),
            new well_known_columns_1.StandardColumn('android_appid', { aggregationType: 'nominal' }),
            new well_known_columns_1.StandardColumn('cmdline', { startsHidden: true }),
            new well_known_columns_1.StandardColumn('machine_id', { aggregationType: 'nominal' }),
            new well_known_columns_1.ArgSetColumnSet('arg_set_id'),
        ],
    };
}
function getSliceTable() {
    return {
        imports: ['slices.slices'],
        name: '_slice_with_thread_and_process_info',
        displayName: 'slice',
        columns: [
            new well_known_columns_1.SliceIdColumn('id', { notNull: true }),
            new well_known_columns_1.TimestampColumn('ts', { title: 'Timestamp' }),
            new well_known_columns_1.DurationColumn('dur', { title: 'Duration' }),
            new well_known_columns_1.DurationColumn('thread_dur', { title: 'Thread duration' }),
            new well_known_columns_1.StandardColumn('category', { title: 'Category' }),
            new well_known_columns_1.StandardColumn('name', { title: 'Name' }),
            new well_known_columns_1.StandardColumn('track_id', {
                title: 'Track ID',
                aggregationType: 'nominal',
                startsHidden: true,
            }),
            new well_known_columns_1.ThreadColumnSet('utid', { title: 'utid' }),
            new well_known_columns_1.ProcessColumnSet('upid', { title: 'upid' }),
            new well_known_columns_1.StandardColumn('depth', { title: 'Depth', startsHidden: true }),
            new well_known_columns_1.SliceIdColumn('parent_id', {
                startsHidden: true,
            }),
            new well_known_columns_1.ArgSetColumnSet('arg_set_id'),
        ],
    };
}
function getAndroidLogsTable() {
    return {
        name: 'android_logs',
        columns: [
            new well_known_columns_1.StandardColumn('id', { aggregationType: 'nominal' }),
            new well_known_columns_1.TimestampColumn('ts'),
            new well_known_columns_1.StandardColumn('tag'),
            new well_known_columns_1.StandardColumn('prio', { aggregationType: 'nominal' }),
            new well_known_columns_1.ThreadColumnSet('utid', { title: 'utid', notNull: true }),
            new well_known_columns_1.ProcessColumnSet({
                column: 'upid',
                source: {
                    table: 'thread',
                    joinOn: { utid: 'utid' },
                },
            }, { title: 'upid', notNull: true }),
            new well_known_columns_1.StandardColumn('msg'),
        ],
    };
}
function getSchedTable() {
    return {
        name: 'sched',
        columns: [
            new well_known_columns_1.SchedIdColumn('id'),
            new well_known_columns_1.TimestampColumn('ts'),
            new well_known_columns_1.DurationColumn('dur'),
            new well_known_columns_1.StandardColumn('cpu', { aggregationType: 'nominal' }),
            new well_known_columns_1.StandardColumn('priority', { aggregationType: 'nominal' }),
            new well_known_columns_1.ThreadColumnSet('utid', { title: 'utid', notNull: true }),
            new well_known_columns_1.ProcessColumnSet({
                column: 'upid',
                source: {
                    table: 'thread',
                    joinOn: {
                        utid: 'utid',
                    },
                    innerJoin: true,
                },
            }, { title: 'upid', notNull: true }),
            new well_known_columns_1.StandardColumn('end_state'),
            new well_known_columns_1.StandardColumn('ucpu', {
                aggregationType: 'nominal',
                startsHidden: true,
            }),
        ],
    };
}
function getThreadStateTable() {
    return {
        name: 'thread_state',
        columns: [
            new well_known_columns_1.ThreadStateIdColumn('id', { notNull: true }),
            new well_known_columns_1.TimestampColumn('ts'),
            new well_known_columns_1.DurationColumn('dur'),
            new well_known_columns_1.StandardColumn('state'),
            new well_known_columns_1.StandardColumn('cpu', { aggregationType: 'nominal' }),
            new well_known_columns_1.ThreadColumnSet('utid', { title: 'utid', notNull: true }),
            new well_known_columns_1.ProcessColumnSet({
                column: 'upid',
                source: {
                    table: 'thread',
                    joinOn: {
                        utid: 'utid',
                    },
                    innerJoin: true,
                },
            }, { title: 'upid (process)', notNull: true }),
            new well_known_columns_1.StandardColumn('io_wait', { aggregationType: 'nominal' }),
            new well_known_columns_1.StandardColumn('blocked_function'),
            new well_known_columns_1.ThreadColumn('waker_utid', { title: 'Waker thread' }),
            new well_known_columns_1.ThreadStateIdColumn('waker_id'),
            new well_known_columns_1.StandardColumn('irq_context', { aggregationType: 'nominal' }),
            new well_known_columns_1.StandardColumn('ucpu', {
                aggregationType: 'nominal',
                startsHidden: true,
            }),
        ],
    };
}
//# sourceMappingURL=tables.js.map