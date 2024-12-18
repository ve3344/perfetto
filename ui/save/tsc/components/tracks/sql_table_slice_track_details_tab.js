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
exports.SqlTableSliceTrackDetailsPanel = exports.ARG_PREFIX = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const time_1 = require("../../base/time");
const slice_args_1 = require("../details/slice_args");
const slice_1 = require("../sql_utils/slice");
const core_types_1 = require("../sql_utils/core_types");
const thread_state_1 = require("../sql_utils/thread_state");
const duration_1 = require("../widgets/duration");
const timestamp_1 = require("../widgets/timestamp");
const query_result_1 = require("../../trace_processor/query_result");
const sql_utils_1 = require("../../trace_processor/sql_utils");
const details_shell_1 = require("../../widgets/details_shell");
const grid_layout_1 = require("../../widgets/grid_layout");
const section_1 = require("../../widgets/section");
const tree_1 = require("../../widgets/tree");
const thread_state_2 = require("../widgets/thread_state");
const thread_1 = require("../sql_utils/thread");
const process_1 = require("../sql_utils/process");
const slice_2 = require("../widgets/slice");
exports.ARG_PREFIX = 'arg_';
function sqlValueToNumber(value) {
    if (typeof value === 'bigint')
        return Number(value);
    if (typeof value !== 'number')
        return undefined;
    return value;
}
function sqlValueToUtid(value) {
    if (typeof value === 'bigint')
        return Number(value);
    if (typeof value !== 'number')
        return undefined;
    return value;
}
function renderTreeContents(dict) {
    const children = [];
    for (const key of Object.keys(dict)) {
        if (dict[key] === null || dict[key] === undefined)
            continue;
        children.push((0, mithril_1.default)(tree_1.TreeNode, {
            left: key,
            right: dict[key],
        }));
    }
    return children;
}
class SqlTableSliceTrackDetailsPanel {
    trace;
    tableName;
    eventId;
    data;
    // We will try to interpret the arguments as references into well-known
    // tables. These values will be set if the relevant columns exist and
    // are consistent (e.g. 'ts' and 'dur' for this slice correspond to values
    // in these well-known tables).
    threadState;
    slice;
    constructor(trace, tableName, eventId) {
        this.trace = trace;
        this.tableName = tableName;
        this.eventId = eventId;
    }
    async maybeLoadThreadState(id, ts, dur, table, utid) {
        if (id === undefined)
            return undefined;
        if (utid === undefined)
            return undefined;
        const threadState = await (0, thread_state_1.getThreadState)(this.trace.engine, id);
        if (threadState === undefined)
            return undefined;
        if (table === 'thread_state' ||
            (threadState.ts === ts &&
                threadState.dur === dur &&
                threadState.thread?.utid === utid)) {
            return threadState;
        }
        else {
            return undefined;
        }
    }
    renderThreadStateInfo() {
        if (this.threadState === undefined)
            return null;
        return (0, mithril_1.default)(tree_1.TreeNode, {
            left: (0, thread_state_2.threadStateRef)(this.threadState),
            right: '',
        }, renderTreeContents({
            Thread: (0, thread_1.getThreadName)(this.threadState.thread),
            Process: (0, process_1.getProcessName)(this.threadState.thread?.process),
            State: this.threadState.state,
        }));
    }
    async maybeLoadSlice(id, ts, dur, table, trackId) {
        if (id === undefined)
            return undefined;
        if (table !== 'slice' && trackId === undefined)
            return undefined;
        const slice = await (0, slice_1.getSlice)(this.trace.engine, (0, core_types_1.asSliceSqlId)(id));
        if (slice === undefined)
            return undefined;
        if (table === 'slice' ||
            (slice.ts === ts && slice.dur === dur && slice.trackId === trackId)) {
            return slice;
        }
        else {
            return undefined;
        }
    }
    renderSliceInfo() {
        if (this.slice === undefined)
            return null;
        return (0, mithril_1.default)(tree_1.TreeNode, {
            left: (0, slice_2.sliceRef)(this.slice, 'Slice'),
            right: '',
        }, (0, mithril_1.default)(tree_1.TreeNode, {
            left: 'Name',
            right: this.slice.name,
        }), (0, mithril_1.default)(tree_1.TreeNode, {
            left: 'Thread',
            right: (0, thread_1.getThreadName)(this.slice.thread),
        }), (0, mithril_1.default)(tree_1.TreeNode, {
            left: 'Process',
            right: (0, process_1.getProcessName)(this.slice.process),
        }), (0, slice_args_1.hasArgs)(this.slice.args) &&
            (0, mithril_1.default)(tree_1.TreeNode, {
                left: 'Args',
            }, (0, slice_args_1.renderArguments)(this.trace, this.slice.args)));
    }
    async load() {
        const queryResult = await this.trace.engine.query(`select * from ${this.tableName} where id = ${this.eventId}`);
        const row = queryResult.firstRow({
            ts: query_result_1.LONG,
            dur: query_result_1.LONG,
            name: query_result_1.STR,
        });
        this.data = {
            name: row.name,
            ts: time_1.Time.fromRaw(row.ts),
            dur: row.dur,
            args: {},
        };
        for (const key of Object.keys(row)) {
            if (key.startsWith(exports.ARG_PREFIX)) {
                this.data.args[key.substr(exports.ARG_PREFIX.length)] = row[key];
            }
        }
        this.threadState = await this.maybeLoadThreadState(sqlValueToNumber(this.data.args['id']), this.data.ts, this.data.dur, (0, sql_utils_1.sqlValueToReadableString)(this.data.args['table_name']), sqlValueToUtid(this.data.args['utid']));
        this.slice = await this.maybeLoadSlice(sqlValueToNumber(this.data.args['id']) ??
            sqlValueToNumber(this.data.args['slice_id']), this.data.ts, this.data.dur, (0, sql_utils_1.sqlValueToReadableString)(this.data.args['table_name']), sqlValueToNumber(this.data.args['track_id']));
        this.trace.scheduleFullRedraw();
    }
    render() {
        if (this.data === undefined) {
            return (0, mithril_1.default)('h2', 'Loading');
        }
        const details = (0, tree_1.dictToTreeNodes)({
            'Name': this.data['name'],
            'Start time': (0, mithril_1.default)(timestamp_1.Timestamp, { ts: (0, query_result_1.timeFromSql)(this.data['ts']) }),
            'Duration': (0, mithril_1.default)(duration_1.DurationWidget, { dur: (0, query_result_1.durationFromSql)(this.data['dur']) }),
            'Slice id': `${this.tableName}[${this.eventId}]`,
        });
        details.push(this.renderThreadStateInfo());
        details.push(this.renderSliceInfo());
        const args = {};
        for (const key of Object.keys(this.data.args)) {
            args[key] = (0, sql_utils_1.sqlValueToReadableString)(this.data.args[key]);
        }
        return (0, mithril_1.default)(details_shell_1.DetailsShell, {
            title: 'Slice',
        }, (0, mithril_1.default)(grid_layout_1.GridLayout, (0, mithril_1.default)(section_1.Section, { title: 'Details' }, (0, mithril_1.default)(tree_1.Tree, details)), (0, mithril_1.default)(section_1.Section, { title: 'Arguments' }, (0, tree_1.dictToTree)(args))));
    }
    getTitle() {
        return `Current Selection`;
    }
    isLoading() {
        return this.data === undefined;
    }
}
exports.SqlTableSliceTrackDetailsPanel = SqlTableSliceTrackDetailsPanel;
//# sourceMappingURL=sql_table_slice_track_details_tab.js.map