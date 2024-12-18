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
exports.SuspendResumeDetailsPanel = void 0;
const tslib_1 = require("tslib");
const time_1 = require("../../base/time");
const query_result_1 = require("../../trace_processor/query_result");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const details_shell_1 = require("../../widgets/details_shell");
const grid_layout_1 = require("../../widgets/grid_layout");
const section_1 = require("../../widgets/section");
const tree_1 = require("../../widgets/tree");
const timestamp_1 = require("../../components/widgets/timestamp");
const duration_1 = require("../../components/widgets/duration");
const anchor_1 = require("../../widgets/anchor");
class SuspendResumeDetailsPanel {
    trace;
    threads;
    suspendResumeEventDetails;
    constructor(trace, threads) {
        this.trace = trace;
        this.threads = threads;
    }
    async load({ eventId }) {
        this.suspendResumeEventDetails = await loadSuspendResumeEventDetails(this.trace.engine, eventId);
    }
    render() {
        const eventDetails = this.suspendResumeEventDetails;
        if (eventDetails) {
            const threadInfo = this.threads.get(eventDetails.utid);
            if (!threadInfo) {
                return null;
            }
            return (0, mithril_1.default)(details_shell_1.DetailsShell, { title: 'Suspend / Resume Event' }, (0, mithril_1.default)(grid_layout_1.GridLayout, (0, mithril_1.default)(section_1.Section, { title: 'Properties' }, (0, mithril_1.default)(tree_1.Tree, (0, mithril_1.default)(tree_1.TreeNode, {
                left: 'Device Name',
                right: eventDetails.device_name,
            }), (0, mithril_1.default)(tree_1.TreeNode, {
                left: 'Start time',
                right: (0, mithril_1.default)(timestamp_1.Timestamp, { ts: eventDetails.ts }),
            }), (0, mithril_1.default)(tree_1.TreeNode, {
                left: 'Duration',
                right: (0, mithril_1.default)(duration_1.DurationWidget, { dur: eventDetails.dur }),
            }), (0, mithril_1.default)(tree_1.TreeNode, {
                left: 'Driver Name',
                right: eventDetails.driver_name,
            }), (0, mithril_1.default)(tree_1.TreeNode, {
                left: 'Callback Phase',
                right: eventDetails.callback_phase,
            }), (0, mithril_1.default)(tree_1.TreeNode, {
                left: 'Thread',
                right: (0, mithril_1.default)(anchor_1.Anchor, {
                    icon: 'call_made',
                    onclick: () => {
                        this.goToThread(eventDetails.thread_state_id);
                    },
                }, `${threadInfo.threadName} [${threadInfo.tid}]`),
            }), (0, mithril_1.default)(tree_1.TreeNode, { left: 'CPU', right: eventDetails.cpu }), (0, mithril_1.default)(tree_1.TreeNode, { left: 'Event Type', right: eventDetails.event_type })))));
        }
        else {
            return (0, mithril_1.default)(details_shell_1.DetailsShell, {
                title: 'Suspend / Resume Event',
                description: 'Loading...',
            });
        }
    }
    isLoading() {
        return this.suspendResumeEventDetails === undefined;
    }
    goToThread(threadStateId) {
        this.trace.selection.selectSqlEvent('thread_state', threadStateId, {
            scrollToSelection: true,
        });
    }
}
exports.SuspendResumeDetailsPanel = SuspendResumeDetailsPanel;
async function loadSuspendResumeEventDetails(engine, id) {
    const suspendResumeDetailsQuery = `
    SELECT
      ts,
      dur,
      EXTRACT_ARG(arg_set_id, 'utid') as utid,
      EXTRACT_ARG(arg_set_id, 'cpu') as cpu,
      EXTRACT_ARG(arg_set_id, 'event_type') as event_type,
      EXTRACT_ARG(arg_set_id, 'device_name') as device_name,
      EXTRACT_ARG(arg_set_id, 'driver_name') as driver_name,
      EXTRACT_ARG(arg_set_id, 'callback_phase') as callback_phase
    FROM slice
    WHERE slice_id = ${id};
  `;
    const suspendResumeDetailsResult = await engine.query(suspendResumeDetailsQuery);
    const suspendResumeEventRow = suspendResumeDetailsResult.iter({
        ts: query_result_1.LONG,
        dur: query_result_1.LONG,
        utid: query_result_1.NUM,
        cpu: query_result_1.NUM,
        event_type: query_result_1.STR_NULL,
        device_name: query_result_1.STR_NULL,
        driver_name: query_result_1.STR_NULL,
        callback_phase: query_result_1.STR_NULL,
    });
    if (!suspendResumeEventRow.valid()) {
        return {
            ts: time_1.Time.fromRaw(0n),
            dur: time_1.Duration.fromRaw(0n),
            utid: 0,
            cpu: 0,
            event_type: 'Error',
            device_name: 'Error',
            driver_name: 'Error',
            callback_phase: 'Error',
            thread_state_id: 0,
        };
    }
    const threadStateQuery = `
    SELECT t.id as threadStateId
    FROM thread_state t
    WHERE
      t.utid = ${suspendResumeEventRow.utid}
      AND t.ts <= ${suspendResumeEventRow.ts}
      AND t.ts + t.dur > ${suspendResumeEventRow.ts};
  `;
    const threadStateResult = await engine.query(threadStateQuery);
    let threadStateId = 0;
    if (threadStateResult.numRows() > 0) {
        const threadStateRow = threadStateResult.firstRow({
            threadStateId: query_result_1.NUM,
        });
        threadStateId = threadStateRow.threadStateId;
    }
    return {
        ts: time_1.Time.fromRaw(suspendResumeEventRow.ts),
        dur: time_1.Duration.fromRaw(suspendResumeEventRow.dur),
        utid: suspendResumeEventRow.utid,
        cpu: suspendResumeEventRow.cpu,
        event_type: suspendResumeEventRow.event_type !== null
            ? suspendResumeEventRow.event_type
            : 'N/A',
        device_name: suspendResumeEventRow.device_name !== null
            ? suspendResumeEventRow.device_name
            : 'N/A',
        driver_name: suspendResumeEventRow.driver_name !== null
            ? suspendResumeEventRow.driver_name
            : 'N/A',
        callback_phase: suspendResumeEventRow.callback_phase !== null
            ? suspendResumeEventRow.callback_phase
            : 'N/A',
        thread_state_id: threadStateId,
    };
}
//# sourceMappingURL=suspend_resume_details.js.map