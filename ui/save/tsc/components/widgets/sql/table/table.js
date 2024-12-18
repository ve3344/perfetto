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
exports.createStandardColumn = createStandardColumn;
exports.createTimestampColumn = createTimestampColumn;
exports.createDurationColumn = createDurationColumn;
exports.createSliceIdColumn = createSliceIdColumn;
exports.createThreadIdColumn = createThreadIdColumn;
exports.createProcessIdColumn = createProcessIdColumn;
exports.createSchedIdColumn = createSchedIdColumn;
exports.createThreadStateIdColumn = createThreadStateIdColumn;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const timestamp_1 = require("../../timestamp");
const time_1 = require("../../../../base/time");
const render_cell_utils_1 = require("../legacy_table/render_cell_utils");
const duration_1 = require("../../duration");
const slice_1 = require("../../slice");
const core_types_1 = require("../../../sql_utils/core_types");
const sched_1 = require("../../sched");
const thread_state_1 = require("../../thread_state");
const menu_1 = require("../../../../widgets/menu");
const anchor_1 = require("../../../../widgets/anchor");
const thread_1 = require("../../thread");
const process_1 = require("../../process");
function renderNumericCell(name, value, tableManager, renderBigint) {
    if (value === null || typeof value !== 'bigint') {
        return (0, render_cell_utils_1.renderStandardCell)(value, name, tableManager);
    }
    return renderBigint(value);
}
function createStandardColumn(name) {
    return {
        name: name,
        renderCell: (value, tableManager) => (0, render_cell_utils_1.renderStandardCell)(value, name, tableManager),
    };
}
function createTimestampColumn(name) {
    const col = createStandardColumn(name);
    col.renderCell = (value, tableManager) => renderNumericCell(name, value, tableManager, (value) => {
        return (0, mithril_1.default)(timestamp_1.Timestamp, {
            ts: time_1.Time.fromRaw(value),
            extraMenuItems: (0, render_cell_utils_1.getStandardContextMenuItems)(value, name, tableManager),
        });
    });
    return col;
}
function createDurationColumn(name) {
    const col = createStandardColumn(name);
    col.renderCell = (value, tableManager) => renderNumericCell(name, value, tableManager, (value) => {
        return (0, mithril_1.default)(duration_1.DurationWidget, {
            dur: time_1.Duration.fromRaw(value),
            extraMenuItems: (0, render_cell_utils_1.getStandardContextMenuItems)(value, name, tableManager),
        });
    });
    return col;
}
function createSliceIdColumn(name) {
    const col = createStandardColumn(name);
    col.renderCell = (value, tableManager) => renderNumericCell(name, value, tableManager, (value) => {
        return (0, mithril_1.default)(slice_1.SliceRef, {
            id: (0, core_types_1.asSliceSqlId)(Number(value)),
            name: `${value}`,
            switchToCurrentSelectionTab: false,
        });
    });
    return col;
}
function createThreadIdColumn(name) {
    const col = createStandardColumn(name);
    col.renderCell = (value, tableManager) => renderNumericCell(name, value, tableManager, (utid) => {
        return (0, mithril_1.default)(menu_1.PopupMenu2, {
            trigger: (0, mithril_1.default)(anchor_1.Anchor, `${utid}`),
        }, (0, thread_1.showThreadDetailsMenuItem)((0, core_types_1.asUtid)(Number(utid))), (0, render_cell_utils_1.getStandardContextMenuItems)(utid, name, tableManager));
    });
    return col;
}
function createProcessIdColumn(name) {
    const col = createStandardColumn(name);
    col.renderCell = (value, tableManager) => renderNumericCell(name, value, tableManager, (upid) => {
        return (0, mithril_1.default)(menu_1.PopupMenu2, {
            trigger: (0, mithril_1.default)(anchor_1.Anchor, `${upid}`),
        }, (0, process_1.showProcessDetailsMenuItem)((0, core_types_1.asUpid)(Number(upid))), (0, render_cell_utils_1.getStandardContextMenuItems)(upid, name, tableManager));
    });
    return col;
}
function createSchedIdColumn(name) {
    const col = createStandardColumn(name);
    col.renderCell = (value, tableManager) => renderNumericCell(name, value, tableManager, (value) => {
        return (0, mithril_1.default)(sched_1.SchedRef, {
            id: (0, core_types_1.asSchedSqlId)(Number(value)),
            name: `${value}`,
            switchToCurrentSelectionTab: false,
        });
    });
    return col;
}
function createThreadStateIdColumn(name) {
    const col = createStandardColumn(name);
    col.renderCell = (value, tableManager) => renderNumericCell(name, value, tableManager, (value) => {
        return (0, mithril_1.default)(thread_state_1.ThreadStateRef, {
            id: (0, core_types_1.asThreadStateSqlId)(Number(value)),
            name: `${value}`,
            switchToCurrentSelectionTab: false,
        });
    });
    return col;
}
//# sourceMappingURL=table.js.map