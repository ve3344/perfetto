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
exports.ArgSetColumnSet = exports.ProcessColumnSet = exports.ProcessIdColumn = exports.ProcessColumn = exports.ThreadColumnSet = exports.ThreadIdColumn = exports.ThreadColumn = exports.ThreadStateIdColumn = exports.SchedIdColumn = exports.SliceColumnSet = exports.SliceIdColumn = exports.DurationColumn = exports.TimestampColumn = exports.StandardColumn = void 0;
exports.argSqlColumn = argSqlColumn;
exports.argTableColumn = argTableColumn;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const semantic_icons_1 = require("../../base/semantic_icons");
const string_utils_1 = require("../../base/string_utils");
const time_1 = require("../../base/time");
const query_result_1 = require("../../trace_processor/query_result");
const core_types_1 = require("../../components/sql_utils/core_types");
const process_1 = require("../../components/sql_utils/process");
const thread_1 = require("../../components/sql_utils/thread");
const anchor_1 = require("../../widgets/anchor");
const error_1 = require("../../widgets/error");
const menu_1 = require("../../widgets/menu");
const duration_1 = require("../../components/widgets/duration");
const process_2 = require("../../components/widgets/process");
const sched_1 = require("../../components/widgets/sched");
const slice_1 = require("../../components/widgets/slice");
const thread_2 = require("../../components/widgets/thread");
const thread_state_1 = require("../../components/widgets/thread_state");
const timestamp_1 = require("../../components/widgets/timestamp");
const column_1 = require("../../components/widgets/sql/legacy_table/column");
const render_cell_utils_1 = require("../../components/widgets/sql/legacy_table/render_cell_utils");
function wrongTypeError(type, name, value) {
    return (0, error_1.renderError)(`Wrong type for ${type} column ${(0, column_1.sqlColumnId)(name)}: bigint expected, ${typeof value} found`);
}
class StandardColumn extends column_1.LegacyTableColumn {
    column;
    params;
    constructor(column, params) {
        super(params);
        this.column = column;
        this.params = params;
    }
    primaryColumn() {
        return this.column;
    }
    aggregation() {
        return { dataType: this.params?.aggregationType };
    }
    getTitle() {
        return this.params?.title;
    }
    renderCell(value, tableManager) {
        return (0, render_cell_utils_1.renderStandardCell)(value, this.column, tableManager);
    }
}
exports.StandardColumn = StandardColumn;
class TimestampColumn extends column_1.LegacyTableColumn {
    column;
    params;
    constructor(column, params) {
        super(params);
        this.column = column;
        this.params = params;
    }
    primaryColumn() {
        return this.column;
    }
    getTitle() {
        return this.params?.title;
    }
    renderCell(value, tableManager) {
        if (typeof value !== 'bigint') {
            return (0, render_cell_utils_1.renderStandardCell)(value, this.column, tableManager);
        }
        return (0, mithril_1.default)(timestamp_1.Timestamp, {
            ts: time_1.Time.fromRaw(value),
            extraMenuItems: (0, render_cell_utils_1.getStandardContextMenuItems)(value, this.column, tableManager),
        });
    }
}
exports.TimestampColumn = TimestampColumn;
class DurationColumn extends column_1.LegacyTableColumn {
    column;
    params;
    constructor(column, params) {
        super(params);
        this.column = column;
        this.params = params;
    }
    primaryColumn() {
        return this.column;
    }
    getTitle() {
        return this.params?.title;
    }
    renderCell(value, tableManager) {
        if (typeof value !== 'bigint') {
            return (0, render_cell_utils_1.renderStandardCell)(value, this.column, tableManager);
        }
        return (0, mithril_1.default)(duration_1.DurationWidget, {
            dur: time_1.Duration.fromRaw(value),
            extraMenuItems: (0, render_cell_utils_1.getStandardContextMenuItems)(value, this.column, tableManager),
        });
    }
}
exports.DurationColumn = DurationColumn;
class SliceIdColumn extends column_1.LegacyTableColumn {
    id;
    params;
    columns;
    constructor(id, params) {
        super(params);
        this.id = id;
        this.params = params;
        const sliceTable = {
            table: 'slice',
            joinOn: { id: this.id },
            // If the column is guaranteed not to have null values, we can use an INNER JOIN.
            innerJoin: this.params?.notNull === true,
        };
        this.columns = {
            ts: {
                column: 'ts',
                source: sliceTable,
            },
            dur: {
                column: 'dur',
                source: sliceTable,
            },
            trackId: {
                column: 'track_id',
                source: sliceTable,
            },
        };
    }
    primaryColumn() {
        return this.id;
    }
    getTitle() {
        return this.params?.title;
    }
    dependentColumns() {
        return this.columns;
    }
    renderCell(value, manager, data) {
        const id = value;
        const ts = data['ts'];
        const dur = data['dur'] === null ? -1n : data['dur'];
        const trackId = data['trackId'];
        if (id === null) {
            return (0, render_cell_utils_1.renderStandardCell)(id, this.id, manager);
        }
        if (ts === null || trackId === null) {
            return (0, error_1.renderError)(`Slice with id ${id} not found`);
        }
        if (typeof id !== 'bigint')
            return wrongTypeError('id', this.id, id);
        if (typeof ts !== 'bigint') {
            return wrongTypeError('timestamp', this.columns.ts, ts);
        }
        if (typeof dur !== 'bigint') {
            return wrongTypeError('duration', this.columns.dur, dur);
        }
        if (typeof trackId !== 'bigint') {
            return wrongTypeError('track id', this.columns.trackId, trackId);
        }
        return (0, mithril_1.default)(slice_1.SliceRef, {
            id: (0, core_types_1.asSliceSqlId)(Number(id)),
            name: `${id}`,
            switchToCurrentSelectionTab: false,
        });
    }
}
exports.SliceIdColumn = SliceIdColumn;
class SliceColumnSet extends column_1.LegacyTableColumnSet {
    id;
    params;
    constructor(id, params) {
        super();
        this.id = id;
        this.params = params;
    }
    getTitle() {
        return this.params?.title ?? `${(0, column_1.sqlColumnId)(this.id)} (slice)`;
    }
    async discover() {
        const column = (name) => {
            return {
                column: name,
                source: {
                    table: 'slice',
                    joinOn: { id: this.id },
                },
            };
        };
        return [
            {
                key: 'id',
                column: new SliceIdColumn(this.id),
            },
            {
                key: 'ts',
                column: new TimestampColumn(column('ts')),
            },
            {
                key: 'dur',
                column: new DurationColumn(column('dur')),
            },
            {
                key: 'name',
                column: new StandardColumn(column('name')),
            },
            {
                key: 'thread_dur',
                column: new StandardColumn(column('thread_dur')),
            },
            {
                key: 'parent_id',
                column: new SliceColumnSet(column('parent_id')),
            },
        ];
    }
    initialColumns() {
        if (this.params?.startsHidden)
            return [];
        return [new SliceIdColumn(this.id)];
    }
}
exports.SliceColumnSet = SliceColumnSet;
class SchedIdColumn extends column_1.LegacyTableColumn {
    id;
    params;
    columns;
    constructor(id, params) {
        super(params);
        this.id = id;
        this.params = params;
        const schedTable = {
            table: 'sched',
            joinOn: { id: this.id },
            // If the column is guaranteed not to have null values, we can use an INNER JOIN.
            innerJoin: this.params?.notNull === true,
        };
        this.columns = {
            ts: {
                column: 'ts',
                source: schedTable,
            },
            dur: {
                column: 'dur',
                source: schedTable,
            },
            cpu: {
                column: 'cpu',
                source: schedTable,
            },
        };
    }
    primaryColumn() {
        return this.id;
    }
    getTitle() {
        return this.params?.title;
    }
    dependentColumns() {
        return {
            ts: this.columns.ts,
            dur: this.columns.dur,
            cpu: this.columns.cpu,
        };
    }
    renderCell(value, manager, data) {
        const id = value;
        const ts = data['ts'];
        const dur = data['dur'] === null ? -1n : data['dur'];
        const cpu = data['cpu'];
        if (id === null) {
            return (0, render_cell_utils_1.renderStandardCell)(id, this.id, manager);
        }
        if (ts === null || cpu === null) {
            return (0, error_1.renderError)(`Sched with id ${id} not found`);
        }
        if (typeof id !== 'bigint')
            return wrongTypeError('id', this.id, id);
        if (typeof ts !== 'bigint') {
            return wrongTypeError('timestamp', this.columns.ts, ts);
        }
        if (typeof dur !== 'bigint') {
            return wrongTypeError('duration', this.columns.dur, dur);
        }
        if (typeof cpu !== 'bigint') {
            return wrongTypeError('track id', this.columns.cpu, cpu);
        }
        return (0, mithril_1.default)(sched_1.SchedRef, {
            id: (0, core_types_1.asSchedSqlId)(Number(id)),
            name: `${id}`,
            switchToCurrentSelectionTab: false,
        });
    }
}
exports.SchedIdColumn = SchedIdColumn;
class ThreadStateIdColumn extends column_1.LegacyTableColumn {
    id;
    params;
    columns;
    constructor(id, params) {
        super(params);
        this.id = id;
        this.params = params;
        const threadStateTable = {
            table: 'thread_state',
            joinOn: { id: this.id },
            // If the column is guaranteed not to have null values, we can use an INNER JOIN.
            innerJoin: this.params?.notNull === true,
        };
        this.columns = {
            ts: {
                column: 'ts',
                source: threadStateTable,
            },
            dur: {
                column: 'dur',
                source: threadStateTable,
            },
            utid: {
                column: 'utid',
                source: threadStateTable,
            },
        };
    }
    primaryColumn() {
        return this.id;
    }
    getTitle() {
        return this.params?.title;
    }
    dependentColumns() {
        return {
            ts: this.columns.ts,
            dur: this.columns.dur,
            utid: this.columns.utid,
        };
    }
    renderCell(value, manager, data) {
        const id = value;
        const ts = data['ts'];
        const dur = data['dur'] === null ? -1n : data['dur'];
        const utid = data['utid'];
        if (id === null) {
            return (0, render_cell_utils_1.renderStandardCell)(id, this.id, manager);
        }
        if (ts === null || utid === null) {
            return (0, error_1.renderError)(`Thread state with id ${id} not found`);
        }
        if (typeof id !== 'bigint')
            return wrongTypeError('id', this.id, id);
        if (typeof ts !== 'bigint') {
            return wrongTypeError('timestamp', this.columns.ts, ts);
        }
        if (typeof dur !== 'bigint') {
            return wrongTypeError('duration', this.columns.dur, dur);
        }
        if (typeof utid !== 'bigint') {
            return wrongTypeError('track id', this.columns.utid, utid);
        }
        return (0, mithril_1.default)(thread_state_1.ThreadStateRef, {
            id: (0, core_types_1.asThreadStateSqlId)(Number(id)),
            name: `${id}`,
            switchToCurrentSelectionTab: false,
        });
    }
}
exports.ThreadStateIdColumn = ThreadStateIdColumn;
class ThreadColumn extends column_1.LegacyTableColumn {
    utid;
    params;
    columns;
    constructor(utid, params) {
        // Both ThreadColumn and ThreadIdColumn are referencing the same underlying SQL column as primary,
        // so we have to use tag to distinguish them.
        super({ tag: 'thread', ...params });
        this.utid = utid;
        this.params = params;
        const threadTable = {
            table: 'thread',
            joinOn: { id: this.utid },
            // If the column is guaranteed not to have null values, we can use an INNER JOIN.
            innerJoin: this.params?.notNull === true,
        };
        this.columns = {
            name: {
                column: 'name',
                source: threadTable,
            },
            tid: {
                column: 'tid',
                source: threadTable,
            },
        };
    }
    primaryColumn() {
        return this.utid;
    }
    getTitle() {
        if (this.params?.title !== undefined)
            return this.params.title;
        return `${(0, column_1.sqlColumnId)(this.utid)} (thread)`;
    }
    dependentColumns() {
        return {
            tid: this.columns.tid,
            name: this.columns.name,
        };
    }
    renderCell(value, manager, data) {
        const utid = value;
        const rawTid = data['tid'];
        const rawName = data['name'];
        if (utid === null) {
            return (0, render_cell_utils_1.renderStandardCell)(utid, this.utid, manager);
        }
        if (typeof utid !== 'bigint') {
            return wrongTypeError('utid', this.utid, utid);
        }
        if (rawTid !== null && typeof rawTid !== 'bigint') {
            return wrongTypeError('tid', this.columns.tid, rawTid);
        }
        if (rawName !== null && typeof rawName !== 'string') {
            return wrongTypeError('name', this.columns.name, rawName);
        }
        const name = rawName ?? undefined;
        const tid = rawTid !== null ? Number(rawTid) : undefined;
        return (0, mithril_1.default)(menu_1.PopupMenu2, {
            trigger: (0, mithril_1.default)(anchor_1.Anchor, (0, thread_1.getThreadName)({
                name: name ?? undefined,
                tid: tid !== null ? Number(tid) : undefined,
            })),
        }, (0, thread_2.threadRefMenuItems)({ utid: (0, core_types_1.asUtid)(Number(utid)), name, tid }), (0, mithril_1.default)(menu_1.MenuDivider), (0, mithril_1.default)(menu_1.MenuItem, {
            label: 'Add filter',
            icon: semantic_icons_1.Icons.Filter,
        }, (0, mithril_1.default)(menu_1.MenuItem, {
            label: 'utid',
        }, (0, render_cell_utils_1.getStandardFilters)(utid, this.utid, manager)), (0, mithril_1.default)(menu_1.MenuItem, {
            label: 'thread name',
        }, (0, render_cell_utils_1.getStandardFilters)(rawName, this.columns.name, manager)), (0, mithril_1.default)(menu_1.MenuItem, {
            label: 'tid',
        }, (0, render_cell_utils_1.getStandardFilters)(rawTid, this.columns.tid, manager))));
    }
    aggregation() {
        return {
            dataType: 'nominal',
        };
    }
}
exports.ThreadColumn = ThreadColumn;
// ThreadIdColumn is a column type for displaying primary key of the `thread` table.
// All other references (foreign keys) should use `ThreadColumn` instead.
class ThreadIdColumn extends column_1.LegacyTableColumn {
    utid;
    columns;
    constructor(utid) {
        super({});
        this.utid = utid;
        const threadTable = {
            table: 'thread',
            joinOn: { id: this.utid },
            innerJoin: true,
        };
        this.columns = {
            tid: {
                column: 'tid',
                source: threadTable,
            },
        };
    }
    primaryColumn() {
        return this.utid;
    }
    getTitle() {
        return 'utid';
    }
    dependentColumns() {
        return {
            tid: this.columns.tid,
        };
    }
    renderCell(value, manager, data) {
        const utid = value;
        const rawTid = data['tid'];
        if (utid === null) {
            return (0, render_cell_utils_1.renderStandardCell)(utid, this.utid, manager);
        }
        if (typeof utid !== 'bigint') {
            throw new Error(`thread.utid is expected to be bigint, got ${typeof utid}`);
        }
        return (0, mithril_1.default)(menu_1.PopupMenu2, {
            trigger: (0, mithril_1.default)(anchor_1.Anchor, `${utid}`),
        }, (0, thread_2.showThreadDetailsMenuItem)((0, core_types_1.asUtid)(Number(utid)), rawTid === null ? undefined : Number(rawTid)), (0, render_cell_utils_1.getStandardContextMenuItems)(utid, this.utid, manager));
    }
    aggregation() {
        return { dataType: 'nominal' };
    }
}
exports.ThreadIdColumn = ThreadIdColumn;
class ThreadColumnSet extends column_1.LegacyTableColumnSet {
    id;
    params;
    constructor(id, params) {
        super();
        this.id = id;
        this.params = params;
    }
    getTitle() {
        return `${this.params.title} (thread)`;
    }
    initialColumns() {
        if (this.params.startsHidden === true)
            return [];
        return [new ThreadColumn(this.id)];
    }
    async discover() {
        const column = (name) => ({
            column: name,
            source: {
                table: 'thread',
                joinOn: { id: this.id },
            },
            innerJoin: this.params.notNull === true,
        });
        return [
            {
                key: 'thread',
                column: new ThreadColumn(this.id),
            },
            {
                key: 'utid',
                column: new ThreadIdColumn(this.id),
            },
            {
                key: 'tid',
                column: new StandardColumn(column('tid'), { aggregationType: 'nominal' }),
            },
            {
                key: 'name',
                column: new StandardColumn(column('name')),
            },
            {
                key: 'start_ts',
                column: new TimestampColumn(column('start_ts')),
            },
            {
                key: 'end_ts',
                column: new TimestampColumn(column('end_ts')),
            },
            {
                key: 'upid',
                column: new ProcessColumnSet(column('upid'), { title: 'upid' }),
            },
            {
                key: 'is_main_thread',
                column: new StandardColumn(column('is_main_thread'), {
                    aggregationType: 'nominal',
                }),
            },
        ];
    }
}
exports.ThreadColumnSet = ThreadColumnSet;
class ProcessColumn extends column_1.LegacyTableColumn {
    upid;
    params;
    columns;
    constructor(upid, params) {
        // Both ProcessColumn and ProcessIdColumn are referencing the same underlying SQL column as primary,
        // so we have to use tag to distinguish them.
        super({ tag: 'process', ...params });
        this.upid = upid;
        this.params = params;
        const processTable = {
            table: 'process',
            joinOn: { id: this.upid },
            // If the column is guaranteed not to have null values, we can use an INNER JOIN.
            innerJoin: this.params?.notNull === true,
        };
        this.columns = {
            name: {
                column: 'name',
                source: processTable,
            },
            pid: {
                column: 'pid',
                source: processTable,
            },
        };
    }
    primaryColumn() {
        return this.upid;
    }
    getTitle() {
        if (this.params?.title !== undefined)
            return this.params.title;
        return `${(0, column_1.sqlColumnId)(this.upid)} (process)`;
    }
    dependentColumns() {
        return this.columns;
    }
    renderCell(value, manager, data) {
        const upid = value;
        const rawPid = data['pid'];
        const rawName = data['name'];
        if (upid === null) {
            return (0, render_cell_utils_1.renderStandardCell)(upid, this.upid, manager);
        }
        if (typeof upid !== 'bigint') {
            return wrongTypeError('upid', this.upid, upid);
        }
        if (rawPid !== null && typeof rawPid !== 'bigint') {
            return wrongTypeError('pid', this.columns.pid, rawPid);
        }
        if (rawName !== null && typeof rawName !== 'string') {
            return wrongTypeError('name', this.columns.name, rawName);
        }
        const name = rawName ?? undefined;
        const pid = rawPid !== null ? Number(rawPid) : undefined;
        return (0, mithril_1.default)(menu_1.PopupMenu2, {
            trigger: (0, mithril_1.default)(anchor_1.Anchor, (0, process_1.getProcessName)({
                name: name ?? undefined,
                pid: pid !== null ? Number(pid) : undefined,
            })),
        }, (0, process_2.processRefMenuItems)({ upid: (0, core_types_1.asUpid)(Number(upid)), name, pid }), (0, mithril_1.default)(menu_1.MenuDivider), (0, mithril_1.default)(menu_1.MenuItem, {
            label: 'Add filter',
            icon: semantic_icons_1.Icons.Filter,
        }, (0, mithril_1.default)(menu_1.MenuItem, {
            label: 'upid',
        }, (0, render_cell_utils_1.getStandardFilters)(upid, this.upid, manager)), (0, mithril_1.default)(menu_1.MenuItem, {
            label: 'process name',
        }, (0, render_cell_utils_1.getStandardFilters)(rawName, this.columns.name, manager)), (0, mithril_1.default)(menu_1.MenuItem, {
            label: 'tid',
        }, (0, render_cell_utils_1.getStandardFilters)(rawPid, this.columns.pid, manager))));
    }
    aggregation() {
        return {
            dataType: 'nominal',
        };
    }
}
exports.ProcessColumn = ProcessColumn;
// ProcessIdColumn is a column type for displaying primary key of the `process` table.
// All other references (foreign keys) should use `ProcessColumn` instead.
class ProcessIdColumn extends column_1.LegacyTableColumn {
    upid;
    columns;
    constructor(upid) {
        super({});
        this.upid = upid;
        const processTable = {
            table: 'process',
            joinOn: { id: this.upid },
            innerJoin: true,
        };
        this.columns = {
            pid: {
                column: 'pid',
                source: processTable,
            },
        };
    }
    primaryColumn() {
        return this.upid;
    }
    getTitle() {
        return 'upid';
    }
    dependentColumns() {
        return {
            pid: this.columns.pid,
        };
    }
    renderCell(value, manager, data) {
        const upid = value;
        const rawPid = data['pid'];
        if (upid === null) {
            return (0, render_cell_utils_1.renderStandardCell)(upid, this.upid, manager);
        }
        if (typeof upid !== 'bigint') {
            throw new Error(`process.upid is expected to be bigint, got ${typeof upid}`);
        }
        return (0, mithril_1.default)(menu_1.PopupMenu2, {
            trigger: (0, mithril_1.default)(anchor_1.Anchor, `${upid}`),
        }, (0, process_2.showProcessDetailsMenuItem)((0, core_types_1.asUpid)(Number(upid)), rawPid === null ? undefined : Number(rawPid)), (0, render_cell_utils_1.getStandardContextMenuItems)(upid, this.upid, manager));
    }
    aggregation() {
        return { dataType: 'nominal' };
    }
}
exports.ProcessIdColumn = ProcessIdColumn;
class ProcessColumnSet extends column_1.LegacyTableColumnSet {
    id;
    params;
    constructor(id, params) {
        super();
        this.id = id;
        this.params = params;
    }
    getTitle() {
        return `${this.params.title} (process)`;
    }
    initialColumns() {
        if (this.params.startsHidden === true)
            return [];
        return [new ProcessColumn(this.id)];
    }
    async discover() {
        const column = (name) => ({
            column: name,
            source: {
                table: 'process',
                joinOn: { id: this.id },
            },
            innerJoin: this.params.notNull === true,
        });
        return [
            {
                key: 'process',
                column: new ProcessColumn(this.id),
            },
            {
                key: 'upid',
                column: new ProcessIdColumn(this.id),
            },
            {
                key: 'pid',
                column: new StandardColumn(column('pid'), { aggregationType: 'nominal' }),
            },
            {
                key: 'name',
                column: new StandardColumn(column('name')),
            },
            {
                key: 'start_ts',
                column: new TimestampColumn(column('start_ts')),
            },
            {
                key: 'end_ts',
                column: new TimestampColumn(column('end_ts')),
            },
            {
                key: 'parent_upid',
                column: new ProcessColumnSet(column('parent_upid'), {
                    title: 'parent_upid',
                }),
            },
            {
                key: 'uid',
                column: new StandardColumn(column('uid'), { aggregationType: 'nominal' }),
            },
            {
                key: 'android_appid',
                column: new StandardColumn(column('android_appid'), {
                    aggregationType: 'nominal',
                }),
            },
            {
                key: 'cmdline',
                column: new StandardColumn(column('cmdline')),
            },
            {
                key: 'arg_set_id (args)',
                column: new ArgSetColumnSet(column('arg_set_id')),
            },
        ];
    }
}
exports.ProcessColumnSet = ProcessColumnSet;
class ArgColumn extends column_1.LegacyTableColumn {
    argSetId;
    key;
    displayValue;
    stringValue;
    intValue;
    realValue;
    constructor(argSetId, key) {
        super();
        this.argSetId = argSetId;
        this.key = key;
        const argTable = {
            table: 'args',
            joinOn: {
                arg_set_id: argSetId,
                key: (0, string_utils_1.sqliteString)(key),
            },
        };
        this.displayValue = {
            column: 'display_value',
            source: argTable,
        };
        this.stringValue = {
            column: 'string_value',
            source: argTable,
        };
        this.intValue = {
            column: 'int_value',
            source: argTable,
        };
        this.realValue = {
            column: 'real_value',
            source: argTable,
        };
    }
    primaryColumn() {
        return this.displayValue;
    }
    sortColumns() {
        return [this.stringValue, this.intValue, this.realValue];
    }
    dependentColumns() {
        return {
            stringValue: this.stringValue,
            intValue: this.intValue,
            realValue: this.realValue,
        };
    }
    getTitle() {
        return `${(0, column_1.sqlColumnId)(this.argSetId)}[${this.key}]`;
    }
    renderCell(value, tableManager, dependentColumns) {
        const strValue = dependentColumns['stringValue'];
        const intValue = dependentColumns['intValue'];
        const realValue = dependentColumns['realValue'];
        let contextMenuItems = [];
        if (strValue !== null) {
            contextMenuItems = (0, render_cell_utils_1.getStandardContextMenuItems)(strValue, this.stringValue, tableManager);
        }
        else if (intValue !== null) {
            contextMenuItems = (0, render_cell_utils_1.getStandardContextMenuItems)(intValue, this.intValue, tableManager);
        }
        else if (realValue !== null) {
            contextMenuItems = (0, render_cell_utils_1.getStandardContextMenuItems)(realValue, this.realValue, tableManager);
        }
        else {
            contextMenuItems = (0, render_cell_utils_1.getStandardContextMenuItems)(value, this.displayValue, tableManager);
        }
        return (0, mithril_1.default)(menu_1.PopupMenu2, {
            trigger: (0, mithril_1.default)(anchor_1.Anchor, (0, render_cell_utils_1.displayValue)(value)),
        }, ...contextMenuItems);
    }
}
class ArgSetColumnSet extends column_1.LegacyTableColumnSet {
    column;
    title;
    constructor(column, title) {
        super();
        this.column = column;
        this.title = title;
    }
    getTitle() {
        return this.title ?? (0, column_1.sqlColumnId)(this.column);
    }
    async discover(manager) {
        const queryResult = await manager.trace.engine.query(`
      -- Encapsulate the query in a CTE to avoid clashes between filters
      -- and columns of the 'args' table.
      SELECT
        DISTINCT args.key
      FROM (${manager.getSqlQuery({ arg_set_id: this.column })}) data
      JOIN args USING (arg_set_id)
    `);
        const result = [];
        const it = queryResult.iter({ key: query_result_1.STR });
        for (; it.valid(); it.next()) {
            result.push({
                key: it.key,
                column: argTableColumn(this.column, it.key),
            });
        }
        return result;
    }
}
exports.ArgSetColumnSet = ArgSetColumnSet;
function argSqlColumn(argSetId, key) {
    return {
        column: 'display_value',
        source: {
            table: 'args',
            joinOn: {
                arg_set_id: argSetId,
                key: (0, string_utils_1.sqliteString)(key),
            },
        },
    };
}
function argTableColumn(argSetId, key) {
    return new ArgColumn(argSetId, key);
}
//# sourceMappingURL=well_known_columns.js.map