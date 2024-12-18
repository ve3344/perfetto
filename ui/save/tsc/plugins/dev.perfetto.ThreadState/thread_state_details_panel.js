"use strict";
// Copyright (C) 2023 The Android Open Source Project
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
exports.ThreadStateDetailsPanel = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const anchor_1 = require("../../widgets/anchor");
const button_1 = require("../../widgets/button");
const details_shell_1 = require("../../widgets/details_shell");
const grid_layout_1 = require("../../widgets/grid_layout");
const section_1 = require("../../widgets/section");
const sql_ref_1 = require("../../widgets/sql_ref");
const tree_1 = require("../../widgets/tree");
const common_1 = require("../../widgets/common");
const thread_state_1 = require("../../components/sql_utils/thread_state");
const duration_1 = require("../../components/widgets/duration");
const timestamp_1 = require("../../components/widgets/timestamp");
const process_1 = require("../../components/sql_utils/process");
const thread_1 = require("../../components/sql_utils/thread");
const thread_state_2 = require("../../components/widgets/thread_state");
const exposed_commands_1 = require("../../public/exposed_commands");
const sched_1 = require("../../components/widgets/sched");
const time_utils_1 = require("../../components/time_utils");
class ThreadStateDetailsPanel {
    trace;
    id;
    threadState;
    relatedStates;
    constructor(trace, id) {
        this.trace = trace;
        this.id = id;
    }
    async load() {
        const id = this.id;
        this.threadState = await (0, thread_state_1.getThreadState)(this.trace.engine, id);
        if (!this.threadState) {
            return;
        }
        const relatedStates = {};
        relatedStates.prev = (await (0, thread_state_1.getThreadStateFromConstraints)(this.trace.engine, {
            filters: [
                `ts + dur = ${this.threadState.ts}`,
                `utid = ${this.threadState.thread?.utid}`,
            ],
            limit: 1,
        }))[0];
        relatedStates.next = (await (0, thread_state_1.getThreadStateFromConstraints)(this.trace.engine, {
            filters: [
                `ts = ${this.threadState.ts + this.threadState.dur}`,
                `utid = ${this.threadState.thread?.utid}`,
            ],
            limit: 1,
        }))[0];
        // note: this might be valid even if there is no |waker| slice, in the case
        // of an interrupt wakeup while in the idle process (which is omitted from
        // the thread_state table).
        relatedStates.wakerInterruptCtx = this.threadState.wakerInterruptCtx;
        if (this.threadState.wakerId !== undefined) {
            relatedStates.waker = await (0, thread_state_1.getThreadState)(this.trace.engine, this.threadState.wakerId);
        }
        else if (this.threadState.state == 'Running' &&
            relatedStates.prev.wakerId != undefined) {
            // For running slices, extract waker info from the preceding runnable.
            relatedStates.waker = await (0, thread_state_1.getThreadState)(this.trace.engine, relatedStates.prev.wakerId);
            relatedStates.wakerInterruptCtx = relatedStates.prev.wakerInterruptCtx;
        }
        relatedStates.wakee = await (0, thread_state_1.getThreadStateFromConstraints)(this.trace.engine, {
            filters: [
                `waker_id = ${id}`,
                `(irq_context is null or irq_context = 0)`,
            ],
        });
        this.relatedStates = relatedStates;
    }
    render() {
        // TODO(altimin/stevegolton): Differentiate between "Current Selection" and
        // "Pinned" views in DetailsShell.
        return (0, mithril_1.default)(details_shell_1.DetailsShell, { title: 'Thread State', description: this.renderLoadingText() }, (0, mithril_1.default)(grid_layout_1.GridLayout, (0, mithril_1.default)(section_1.Section, { title: 'Details' }, this.threadState && this.renderTree(this.threadState)), (0, mithril_1.default)(section_1.Section, { title: 'Related thread states' }, this.renderRelatedThreadStates())));
    }
    renderLoadingText() {
        if (!this.threadState) {
            return 'Loading';
        }
        return this.id;
    }
    renderTree(threadState) {
        const thread = threadState.thread;
        const process = threadState.thread?.process;
        return (0, mithril_1.default)(tree_1.Tree, (0, mithril_1.default)(tree_1.TreeNode, {
            left: 'Start time',
            right: (0, mithril_1.default)(timestamp_1.Timestamp, { ts: threadState.ts }),
        }), (0, mithril_1.default)(tree_1.TreeNode, {
            left: 'Duration',
            right: (0, mithril_1.default)(duration_1.DurationWidget, { dur: threadState.dur }),
        }), (0, mithril_1.default)(tree_1.TreeNode, {
            left: 'State',
            right: this.renderState(threadState.state, threadState.cpu, threadState.schedSqlId),
        }), threadState.blockedFunction &&
            (0, mithril_1.default)(tree_1.TreeNode, {
                left: 'Blocked function',
                right: threadState.blockedFunction,
            }), process &&
            (0, mithril_1.default)(tree_1.TreeNode, {
                left: 'Process',
                right: (0, process_1.getProcessName)(process),
            }), thread && (0, mithril_1.default)(tree_1.TreeNode, { left: 'Thread', right: (0, thread_1.getThreadName)(thread) }), threadState.priority !== undefined &&
            (0, mithril_1.default)(tree_1.TreeNode, {
                left: 'Priority',
                right: threadState.priority,
            }), (0, mithril_1.default)(tree_1.TreeNode, {
            left: 'SQL ID',
            right: (0, mithril_1.default)(sql_ref_1.SqlRef, { table: 'thread_state', id: threadState.id }),
        }));
    }
    renderState(state, cpu, id) {
        if (!state) {
            return null;
        }
        if (id === undefined || cpu === undefined) {
            return state;
        }
        return (0, mithril_1.default)(anchor_1.Anchor, {
            title: 'Go to CPU slice',
            icon: 'call_made',
            onclick: () => (0, sched_1.goToSchedSlice)(id),
        }, `${state} on CPU ${cpu}`);
    }
    renderRelatedThreadStates() {
        if (this.threadState === undefined || this.relatedStates === undefined) {
            return 'Loading';
        }
        const startTs = this.threadState.ts;
        const renderRef = (state, name) => (0, mithril_1.default)(thread_state_2.ThreadStateRef, {
            id: state.id,
            name,
        });
        const nameForNextOrPrev = (threadState) => `${threadState.state} for ${(0, time_utils_1.formatDuration)(this.trace, threadState.dur)}`;
        const renderWaker = (related) => {
            // Could be absent if:
            // * this thread state wasn't woken up (e.g. it is a running slice).
            // * the wakeup is from an interrupt during the idle process (which
            //   isn't populated in thread_state).
            // * at the start of the trace, before all per-cpu scheduling is known.
            const hasWakerId = related.waker !== undefined;
            // Interrupt context for the wakeups is absent from older traces.
            const hasInterruptCtx = related.wakerInterruptCtx !== undefined;
            if (!hasWakerId && !hasInterruptCtx) {
                return null;
            }
            if (related.wakerInterruptCtx) {
                return (0, mithril_1.default)(tree_1.TreeNode, {
                    left: 'Woken by',
                    right: `Interrupt`,
                });
            }
            return (related.waker &&
                (0, mithril_1.default)(tree_1.TreeNode, {
                    left: hasInterruptCtx ? 'Woken by' : 'Woken by (maybe interrupt)',
                    right: renderRef(related.waker, (0, thread_1.getFullThreadName)(related.waker.thread)),
                }));
        };
        const renderWakees = (related) => {
            if (related.wakee === undefined || related.wakee.length == 0) {
                return null;
            }
            const hasInterruptCtx = related.wakee[0].wakerInterruptCtx !== undefined;
            return (0, mithril_1.default)(tree_1.TreeNode, {
                left: hasInterruptCtx
                    ? 'Woken threads'
                    : 'Woken threads (maybe interrupt)',
            }, related.wakee.map((state) => (0, mithril_1.default)(tree_1.TreeNode, {
                left: (0, mithril_1.default)(timestamp_1.Timestamp, {
                    ts: state.ts,
                    display: `+${(0, time_utils_1.formatDuration)(this.trace, state.ts - startTs)}`,
                }),
                right: renderRef(state, (0, thread_1.getFullThreadName)(state.thread)),
            })));
        };
        return [
            (0, mithril_1.default)(tree_1.Tree, this.relatedStates.prev &&
                (0, mithril_1.default)(tree_1.TreeNode, {
                    left: 'Previous state',
                    right: renderRef(this.relatedStates.prev, nameForNextOrPrev(this.relatedStates.prev)),
                }), this.relatedStates.next &&
                (0, mithril_1.default)(tree_1.TreeNode, {
                    left: 'Next state',
                    right: renderRef(this.relatedStates.next, nameForNextOrPrev(this.relatedStates.next)),
                }), renderWaker(this.relatedStates), renderWakees(this.relatedStates)),
            this.trace.commands.hasCommand(exposed_commands_1.CRITICAL_PATH_LITE_CMD) &&
                (0, mithril_1.default)(button_1.Button, {
                    label: 'Critical path lite',
                    intent: common_1.Intent.Primary,
                    onclick: () => {
                        this.trace.commands.runCommand(exposed_commands_1.CRITICAL_PATH_LITE_CMD, this.threadState?.thread?.utid);
                    },
                }),
            this.trace.commands.hasCommand(exposed_commands_1.CRITICAL_PATH_CMD) &&
                (0, mithril_1.default)(button_1.Button, {
                    label: 'Critical path',
                    intent: common_1.Intent.Primary,
                    onclick: () => {
                        this.trace.commands.runCommand(exposed_commands_1.CRITICAL_PATH_CMD, this.threadState?.thread?.utid);
                    },
                }),
        ];
    }
    isLoading() {
        return this.threadState === undefined || this.relatedStates === undefined;
    }
}
exports.ThreadStateDetailsPanel = ThreadStateDetailsPanel;
//# sourceMappingURL=thread_state_details_panel.js.map