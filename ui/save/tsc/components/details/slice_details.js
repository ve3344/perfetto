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
exports.renderDetails = renderDetails;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const bigint_math_1 = require("../../base/bigint_math");
const string_utils_1 = require("../../base/string_utils");
const utils_1 = require("../../base/utils");
const anchor_1 = require("../../widgets/anchor");
const menu_1 = require("../../widgets/menu");
const section_1 = require("../../widgets/section");
const sql_ref_1 = require("../../widgets/sql_ref");
const tree_1 = require("../../widgets/tree");
const thread_state_1 = require("./thread_state");
const duration_1 = require("../widgets/duration");
const process_1 = require("../widgets/process");
const thread_1 = require("../widgets/thread");
const timestamp_1 = require("../widgets/timestamp");
const sql_table_registry_1 = require("../widgets/sql/legacy_table/sql_table_registry");
const logging_1 = require("../../base/logging");
const extensions_1 = require("../extensions");
// Renders a widget storing all of the generic details for a slice from the
// slice table.
function renderDetails(trace, slice, durationBreakdown) {
    return (0, mithril_1.default)(section_1.Section, { title: 'Details' }, (0, mithril_1.default)(tree_1.Tree, (0, mithril_1.default)(tree_1.TreeNode, {
        left: 'Name',
        right: (0, mithril_1.default)(menu_1.PopupMenu2, {
            trigger: (0, mithril_1.default)(anchor_1.Anchor, slice.name),
        }, (0, mithril_1.default)(menu_1.MenuItem, {
            label: 'Slices with the same name',
            onclick: () => {
                extensions_1.extensions.addLegacySqlTableTab(trace, {
                    table: (0, logging_1.assertExists)((0, sql_table_registry_1.getSqlTableDescription)('slice')),
                    filters: [
                        {
                            op: (cols) => `${cols[0]} = ${(0, string_utils_1.sqliteString)(slice.name)}`,
                            columns: ['name'],
                        },
                    ],
                });
            },
        })),
    }), (0, mithril_1.default)(tree_1.TreeNode, {
        left: 'Category',
        right: !slice.category || slice.category === '[NULL]'
            ? 'N/A'
            : slice.category,
    }), (0, mithril_1.default)(tree_1.TreeNode, {
        left: 'Start time',
        right: (0, mithril_1.default)(timestamp_1.Timestamp, { ts: slice.ts }),
    }), (0, utils_1.exists)(slice.absTime) &&
        (0, mithril_1.default)(tree_1.TreeNode, { left: 'Absolute Time', right: slice.absTime }), (0, mithril_1.default)(tree_1.TreeNode, {
        left: 'Duration',
        right: (0, mithril_1.default)(duration_1.DurationWidget, { dur: slice.dur }),
    }, (0, utils_1.exists)(durationBreakdown) &&
        slice.dur > 0 &&
        (0, mithril_1.default)(thread_state_1.BreakdownByThreadStateTreeNode, {
            data: durationBreakdown,
            dur: slice.dur,
        })), renderThreadDuration(slice), slice.thread &&
        (0, mithril_1.default)(tree_1.TreeNode, {
            left: 'Thread',
            right: (0, thread_1.renderThreadRef)(slice.thread),
        }), slice.process &&
        (0, mithril_1.default)(tree_1.TreeNode, {
            left: 'Process',
            right: (0, process_1.renderProcessRef)(slice.process),
        }), slice.process &&
        (0, utils_1.exists)(slice.process.uid) &&
        (0, mithril_1.default)(tree_1.TreeNode, {
            left: 'User ID',
            right: slice.process.uid,
        }), slice.process &&
        slice.process.packageName &&
        (0, mithril_1.default)(tree_1.TreeNode, {
            left: 'Package name',
            right: slice.process.packageName,
        }), slice.process &&
        (0, utils_1.exists)(slice.process.versionCode) &&
        (0, mithril_1.default)(tree_1.TreeNode, {
            left: 'Version code',
            right: slice.process.versionCode,
        }), (0, mithril_1.default)(tree_1.TreeNode, {
        left: 'SQL ID',
        right: (0, mithril_1.default)(sql_ref_1.SqlRef, { table: 'slice', id: slice.id }),
    })));
}
function renderThreadDuration(sliceInfo) {
    if ((0, utils_1.exists)(sliceInfo.threadTs) && (0, utils_1.exists)(sliceInfo.threadDur)) {
        // If we have valid thread duration, also display a percentage of
        // |threadDur| compared to |dur|.
        const ratio = bigint_math_1.BigintMath.ratio(sliceInfo.threadDur, sliceInfo.dur);
        const threadDurFractionSuffix = sliceInfo.threadDur === -1n ? '' : ` (${(ratio * 100).toFixed(2)}%)`;
        return (0, mithril_1.default)(tree_1.TreeNode, {
            left: 'Thread duration',
            right: [
                (0, mithril_1.default)(duration_1.DurationWidget, { dur: sliceInfo.threadDur }),
                threadDurFractionSuffix,
            ],
        });
    }
    else {
        return undefined;
    }
}
//# sourceMappingURL=slice_details.js.map