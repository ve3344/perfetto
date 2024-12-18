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
exports.SchedSliceDetailsPanel = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const anchor_1 = require("../../widgets/anchor");
const details_shell_1 = require("../../widgets/details_shell");
const grid_layout_1 = require("../../widgets/grid_layout");
const section_1 = require("../../widgets/section");
const sql_ref_1 = require("../../widgets/sql_ref");
const tree_1 = require("../../widgets/tree");
const duration_1 = require("../../components/widgets/duration");
const timestamp_1 = require("../../components/widgets/timestamp");
const core_types_1 = require("../../components/sql_utils/core_types");
const sched_1 = require("../../components/sql_utils/sched");
const utils_1 = require("../../base/utils");
const thread_state_1 = require("../../components/sql_utils/thread_state");
const assets_1 = require("../../base/assets");
const MIN_NORMAL_SCHED_PRIORITY = 100;
function getDisplayName(name, id) {
    if (name === undefined) {
        return id === undefined ? undefined : `${id}`;
    }
    else {
        return id === undefined ? name : `${name} ${id}`;
    }
}
class SchedSliceDetailsPanel {
    trace;
    threads;
    details;
    constructor(trace, threads) {
        this.trace = trace;
        this.threads = threads;
    }
    async load({ eventId }) {
        const sched = await (0, sched_1.getSched)(this.trace.engine, (0, core_types_1.asSchedSqlId)(eventId));
        if (sched === undefined) {
            return;
        }
        const wakeup = await (0, sched_1.getSchedWakeupInfo)(this.trace.engine, sched);
        this.details = { sched, wakeup };
        this.trace.scheduleFullRedraw();
    }
    render() {
        if (this.details === undefined) {
            return (0, mithril_1.default)(details_shell_1.DetailsShell, { title: 'Sched', description: 'Loading...' });
        }
        const threadInfo = this.threads.get(this.details.sched.thread.utid);
        return (0, mithril_1.default)(details_shell_1.DetailsShell, {
            title: 'CPU Sched Slice',
            description: this.renderTitle(this.details),
        }, (0, mithril_1.default)(grid_layout_1.GridLayout, this.renderDetails(this.details, threadInfo), this.renderSchedLatencyInfo(this.details)));
    }
    renderTitle(data) {
        const threadInfo = this.threads.get(data.sched.thread.utid);
        if (!threadInfo) {
            return null;
        }
        return `${threadInfo.procName} [${threadInfo.pid}]`;
    }
    renderSchedLatencyInfo(data) {
        if (data.wakeup?.wakeupTs === undefined ||
            data.wakeup?.wakerUtid === undefined) {
            return null;
        }
        return (0, mithril_1.default)(section_1.Section, { title: 'Scheduling Latency' }, (0, mithril_1.default)('.slice-details-latency-panel', (0, mithril_1.default)('img.slice-details-image', {
            src: (0, assets_1.assetSrc)('assets/scheduling_latency.png'),
        }), this.renderWakeupText(data), this.renderDisplayLatencyText(data)));
    }
    renderWakeupText(data) {
        if (data.wakeup?.wakerUtid === undefined ||
            data.wakeup?.wakeupTs === undefined ||
            data.wakeup?.wakerCpu === undefined) {
            return null;
        }
        const threadInfo = this.threads.get(data.wakeup.wakerUtid);
        if (!threadInfo) {
            return null;
        }
        return (0, mithril_1.default)('.slice-details-wakeup-text', (0, mithril_1.default)('', `Wakeup @ `, (0, mithril_1.default)(timestamp_1.Timestamp, { ts: data.wakeup?.wakeupTs }), ` on CPU ${data.wakeup.wakerCpu} by`), (0, mithril_1.default)('', `P: ${threadInfo.procName} [${threadInfo.pid}]`), (0, mithril_1.default)('', `T: ${threadInfo.threadName} [${threadInfo.tid}]`));
    }
    renderDisplayLatencyText(data) {
        if (data.wakeup?.wakeupTs === undefined) {
            return null;
        }
        const latency = data.sched.ts - data.wakeup?.wakeupTs;
        return (0, mithril_1.default)('.slice-details-latency-text', (0, mithril_1.default)('', `Scheduling latency: `, (0, mithril_1.default)(duration_1.DurationWidget, { dur: latency })), (0, mithril_1.default)('.text-detail', `This is the interval from when the task became eligible to run
        (e.g. because of notifying a wait queue it was suspended on) to
        when it started running.`));
    }
    renderPriorityText(priority) {
        if (priority === undefined) {
            return undefined;
        }
        return priority < MIN_NORMAL_SCHED_PRIORITY
            ? `${priority} (real-time)`
            : `${priority}`;
    }
    getProcessThreadDetails(data) {
        const process = data.sched.thread.process;
        return new Map([
            ['Thread', getDisplayName(data.sched.thread.name, data.sched.thread.tid)],
            ['Process', getDisplayName(process?.name, process?.pid)],
            ['User ID', (0, utils_1.exists)(process?.uid) ? String(process?.uid) : undefined],
            ['Package name', process?.packageName],
            [
                'Version code',
                process?.versionCode !== undefined
                    ? String(process?.versionCode)
                    : undefined,
            ],
        ]);
    }
    renderDetails(data, threadInfo) {
        if (!threadInfo) {
            return null;
        }
        const extras = [];
        for (const [key, value] of this.getProcessThreadDetails(data)) {
            if (value !== undefined) {
                extras.push((0, mithril_1.default)(tree_1.TreeNode, { left: key, right: value }));
            }
        }
        const treeNodes = [
            (0, mithril_1.default)(tree_1.TreeNode, {
                left: 'Process',
                right: `${threadInfo.procName} [${threadInfo.pid}]`,
            }),
            (0, mithril_1.default)(tree_1.TreeNode, {
                left: 'Thread',
                right: (0, mithril_1.default)(anchor_1.Anchor, {
                    icon: 'call_made',
                    onclick: () => {
                        this.goToThread(data);
                    },
                }, `${threadInfo.threadName} [${threadInfo.tid}]`),
            }),
            (0, mithril_1.default)(tree_1.TreeNode, {
                left: 'Cmdline',
                right: threadInfo.cmdline,
            }),
            (0, mithril_1.default)(tree_1.TreeNode, {
                left: 'Start time',
                right: (0, mithril_1.default)(timestamp_1.Timestamp, { ts: data.sched.ts }),
            }),
            (0, mithril_1.default)(tree_1.TreeNode, {
                left: 'Duration',
                right: (0, mithril_1.default)(duration_1.DurationWidget, { dur: data.sched.dur }),
            }),
            (0, mithril_1.default)(tree_1.TreeNode, {
                left: 'Priority',
                right: this.renderPriorityText(data.sched.priority),
            }),
            (0, mithril_1.default)(tree_1.TreeNode, {
                left: 'End State',
                right: (0, thread_state_1.translateState)(data.sched.endState),
            }),
            (0, mithril_1.default)(tree_1.TreeNode, {
                left: 'SQL ID',
                right: (0, mithril_1.default)(sql_ref_1.SqlRef, { table: 'sched', id: data.sched.id }),
            }),
            ...extras,
        ];
        return (0, mithril_1.default)(section_1.Section, { title: 'Details' }, (0, mithril_1.default)(tree_1.Tree, treeNodes));
    }
    goToThread(data) {
        if (data.sched.threadStateId) {
            this.trace.selection.selectSqlEvent('thread_state', data.sched.threadStateId, { scrollToSelection: true });
        }
    }
    renderCanvas() { }
}
exports.SchedSliceDetailsPanel = SchedSliceDetailsPanel;
//# sourceMappingURL=sched_details_tab.js.map