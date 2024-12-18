"use strict";
// Copyright (C) 2019 The Android Open Source Project
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
exports.ThreadSliceDetailsPanel = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const semantic_icons_1 = require("../../base/semantic_icons");
const time_1 = require("../../base/time");
const utils_1 = require("../../base/utils");
const button_1 = require("../../widgets/button");
const details_shell_1 = require("../../widgets/details_shell");
const grid_layout_1 = require("../../widgets/grid_layout");
const menu_1 = require("../../widgets/menu");
const section_1 = require("../../widgets/section");
const tree_1 = require("../../widgets/tree");
const slice_args_1 = require("./slice_args");
const slice_details_1 = require("./slice_details");
const slice_1 = require("../sql_utils/slice");
const thread_state_1 = require("./thread_state");
const core_types_1 = require("../sql_utils/core_types");
const duration_1 = require("../widgets/duration");
const slice_2 = require("../widgets/slice");
const basic_table_1 = require("../../widgets/basic_table");
const sql_table_registry_1 = require("../widgets/sql/legacy_table/sql_table_registry");
const logging_1 = require("../../base/logging");
const extensions_1 = require("../extensions");
function getTidFromSlice(slice) {
    return slice.thread?.tid;
}
function getPidFromSlice(slice) {
    return slice.process?.pid;
}
function getProcessNameFromSlice(slice) {
    return slice.process?.name;
}
function getThreadNameFromSlice(slice) {
    return slice.thread?.name;
}
function hasName(slice) {
    return slice.name !== undefined;
}
function hasTid(slice) {
    return getTidFromSlice(slice) !== undefined;
}
function hasPid(slice) {
    return getPidFromSlice(slice) !== undefined;
}
function hasProcessName(slice) {
    return getProcessNameFromSlice(slice) !== undefined;
}
function hasThreadName(slice) {
    return getThreadNameFromSlice(slice) !== undefined;
}
const ITEMS = [
    {
        name: 'Ancestor slices',
        shouldDisplay: (slice) => slice.parentId !== undefined,
        run: (slice, trace) => extensions_1.extensions.addLegacySqlTableTab(trace, {
            table: (0, logging_1.assertExists)((0, sql_table_registry_1.getSqlTableDescription)('slice')),
            filters: [
                {
                    op: (cols) => `${cols[0]} IN (SELECT id FROM _slice_ancestor_and_self(${slice.id}))`,
                    columns: ['id'],
                },
            ],
            imports: ['slices.hierarchy'],
        }),
    },
    {
        name: 'Descendant slices',
        shouldDisplay: () => true,
        run: (slice, trace) => extensions_1.extensions.addLegacySqlTableTab(trace, {
            table: (0, logging_1.assertExists)((0, sql_table_registry_1.getSqlTableDescription)('slice')),
            filters: [
                {
                    op: (cols) => `${cols[0]} IN (SELECT id FROM _slice_descendant_and_self(${slice.id}))`,
                    columns: ['id'],
                },
            ],
            imports: ['slices.hierarchy'],
        }),
    },
    {
        name: 'Average duration of slice name',
        shouldDisplay: (slice) => hasName(slice),
        run: (slice, trace) => extensions_1.extensions.addQueryResultsTab(trace, {
            query: `SELECT AVG(dur) / 1e9 FROM slice WHERE name = '${slice.name}'`,
            title: `${slice.name} average dur`,
        }),
    },
    {
        name: 'Binder txn names + monitor contention on thread',
        shouldDisplay: (slice) => hasProcessName(slice) &&
            hasThreadName(slice) &&
            hasTid(slice) &&
            hasPid(slice),
        run: (slice, trace) => {
            trace.engine
                .query(`INCLUDE PERFETTO MODULE android.binder;
           INCLUDE PERFETTO MODULE android.monitor_contention;`)
                .then(() => extensions_1.extensions.addDebugSliceTrack({
                trace,
                data: {
                    sqlSource: `
                                WITH merged AS (
                                  SELECT s.ts, s.dur, tx.aidl_name AS name, 0 AS depth
                                  FROM android_binder_txns tx
                                  JOIN slice s
                                    ON tx.binder_txn_id = s.id
                                  JOIN thread_track
                                    ON s.track_id = thread_track.id
                                  JOIN thread
                                    USING (utid)
                                  JOIN process
                                    USING (upid)
                                  WHERE pid = ${getPidFromSlice(slice)}
                                        AND tid = ${getTidFromSlice(slice)}
                                        AND aidl_name IS NOT NULL
                                  UNION ALL
                                  SELECT
                                    s.ts,
                                    s.dur,
                                    short_blocked_method || ' -> ' || blocking_thread_name || ':' || short_blocking_method AS name,
                                    1 AS depth
                                  FROM android_binder_txns tx
                                  JOIN android_monitor_contention m
                                    ON m.binder_reply_tid = tx.server_tid AND m.binder_reply_ts = tx.server_ts
                                  JOIN slice s
                                    ON tx.binder_txn_id = s.id
                                  JOIN thread_track
                                    ON s.track_id = thread_track.id
                                  JOIN thread ON thread.utid = thread_track.utid
                                  JOIN process ON process.upid = thread.upid
                                  WHERE process.pid = ${getPidFromSlice(slice)}
                                        AND thread.tid = ${getTidFromSlice(slice)}
                                        AND short_blocked_method IS NOT NULL
                                  ORDER BY depth
                                ) SELECT ts, dur, name FROM merged`,
                },
                title: `Binder names (${getProcessNameFromSlice(slice)}:${getThreadNameFromSlice(slice)})`,
            }));
        },
    },
];
function getSliceContextMenuItems(slice) {
    return ITEMS.filter((item) => item.shouldDisplay(slice));
}
async function getSliceDetails(engine, id) {
    return (0, slice_1.getSlice)(engine, (0, core_types_1.asSliceSqlId)(id));
}
class ThreadSliceDetailsPanel {
    trace;
    sliceDetails;
    breakdownByThreadState;
    constructor(trace) {
        this.trace = trace;
    }
    async load({ eventId }) {
        const { trace } = this;
        const details = await getSliceDetails(trace.engine, eventId);
        if (details !== undefined &&
            details.thread !== undefined &&
            details.dur > 0) {
            this.breakdownByThreadState = await (0, thread_state_1.breakDownIntervalByThreadState)(trace.engine, time_1.TimeSpan.fromTimeAndDuration(details.ts, details.dur), details.thread.utid);
        }
        this.sliceDetails = details;
    }
    render() {
        if (!(0, utils_1.exists)(this.sliceDetails)) {
            return (0, mithril_1.default)(details_shell_1.DetailsShell, { title: 'Slice', description: 'Loading...' });
        }
        const slice = this.sliceDetails;
        return (0, mithril_1.default)(details_shell_1.DetailsShell, {
            title: 'Slice',
            description: slice.name,
            buttons: this.renderContextButton(slice),
        }, (0, mithril_1.default)(grid_layout_1.GridLayout, (0, slice_details_1.renderDetails)(this.trace, slice, this.breakdownByThreadState), this.renderRhs(this.trace, slice)));
    }
    renderRhs(trace, slice) {
        const precFlows = this.renderPrecedingFlows(slice);
        const followingFlows = this.renderFollowingFlows(slice);
        const args = (0, slice_args_1.hasArgs)(slice.args) &&
            (0, mithril_1.default)(section_1.Section, { title: 'Arguments' }, (0, mithril_1.default)(tree_1.Tree, (0, slice_args_1.renderArguments)(trace, slice.args)));
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (precFlows ?? followingFlows ?? args) {
            return (0, mithril_1.default)(grid_layout_1.GridLayoutColumn, precFlows, followingFlows, args);
        }
        else {
            return undefined;
        }
    }
    renderPrecedingFlows(slice) {
        const flows = this.trace.flows.connectedFlows;
        const inFlows = flows.filter(({ end }) => end.sliceId === slice.id);
        if (inFlows.length > 0) {
            const isRunTask = slice.name === 'ThreadControllerImpl::RunTask' ||
                slice.name === 'ThreadPool_RunTask';
            return (0, mithril_1.default)(section_1.Section, { title: 'Preceding Flows' }, (0, mithril_1.default)((basic_table_1.BasicTable), {
                columns: [
                    {
                        title: 'Slice',
                        render: (flow) => (0, mithril_1.default)(slice_2.SliceRef, {
                            id: (0, core_types_1.asSliceSqlId)(flow.begin.sliceId),
                            name: flow.begin.sliceChromeCustomName ?? flow.begin.sliceName,
                        }),
                    },
                    {
                        title: 'Delay',
                        render: (flow) => (0, mithril_1.default)(duration_1.DurationWidget, {
                            dur: flow.end.sliceStartTs - flow.begin.sliceEndTs,
                        }),
                    },
                    {
                        title: 'Thread',
                        render: (flow) => this.getThreadNameForFlow(flow.begin, !isRunTask),
                    },
                ],
                data: inFlows,
            }));
        }
        else {
            return null;
        }
    }
    renderFollowingFlows(slice) {
        const flows = this.trace.flows.connectedFlows;
        const outFlows = flows.filter(({ begin }) => begin.sliceId === slice.id);
        if (outFlows.length > 0) {
            const isPostTask = slice.name === 'ThreadPool_PostTask' ||
                slice.name === 'SequenceManager PostTask';
            return (0, mithril_1.default)(section_1.Section, { title: 'Following Flows' }, (0, mithril_1.default)((basic_table_1.BasicTable), {
                columns: [
                    {
                        title: 'Slice',
                        render: (flow) => (0, mithril_1.default)(slice_2.SliceRef, {
                            id: (0, core_types_1.asSliceSqlId)(flow.end.sliceId),
                            name: flow.end.sliceChromeCustomName ?? flow.end.sliceName,
                        }),
                    },
                    {
                        title: 'Delay',
                        render: (flow) => (0, mithril_1.default)(duration_1.DurationWidget, {
                            dur: flow.end.sliceStartTs - flow.begin.sliceEndTs,
                        }),
                    },
                    {
                        title: 'Thread',
                        render: (flow) => this.getThreadNameForFlow(flow.end, !isPostTask),
                    },
                ],
                data: outFlows,
            }));
        }
        else {
            return null;
        }
    }
    getThreadNameForFlow(flow, includeProcessName) {
        return includeProcessName
            ? `${flow.threadName} (${flow.processName})`
            : flow.threadName;
    }
    renderContextButton(sliceInfo) {
        const contextMenuItems = getSliceContextMenuItems(sliceInfo);
        if (contextMenuItems.length > 0) {
            const trigger = (0, mithril_1.default)(button_1.Button, {
                compact: true,
                label: 'Contextual Options',
                rightIcon: semantic_icons_1.Icons.ContextMenu,
            });
            return (0, mithril_1.default)(menu_1.PopupMenu2, { trigger }, contextMenuItems.map(({ name, run }) => (0, mithril_1.default)(menu_1.MenuItem, { label: name, onclick: () => run(sliceInfo, this.trace) })));
        }
        else {
            return undefined;
        }
    }
}
exports.ThreadSliceDetailsPanel = ThreadSliceDetailsPanel;
//# sourceMappingURL=thread_slice_details_tab.js.map