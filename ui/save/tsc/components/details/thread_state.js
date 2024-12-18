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
exports.BreakdownByThreadStateTreeNode = void 0;
exports.breakDownIntervalByThreadState = breakDownIntervalByThreadState;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const query_result_1 = require("../../trace_processor/query_result");
const tree_1 = require("../../widgets/tree");
const duration_1 = require("../widgets/duration");
// An individual node of the thread state breakdown tree.
class Node {
    parent;
    children;
    dur;
    startsCollapsed = true;
    constructor(parent) {
        this.parent = parent;
        this.children = new Map();
        this.dur = 0n;
    }
    getOrCreateChild(name) {
        let child = this.children.get(name);
        if (!child) {
            child = new Node(this);
            this.children.set(name, child);
        }
        return child;
    }
    addDuration(dur) {
        let node = this;
        while (node !== undefined) {
            node.dur += dur;
            node = node.parent;
        }
    }
}
// Compute a breakdown of thread states for a given thread for a given time
// interval.
async function breakDownIntervalByThreadState(engine, range, utid) {
    // TODO(altimin): this probably should share some code with pivot tables when
    // we actually get some pivot tables we like.
    const query = await engine.query(`
    INCLUDE PERFETTO MODULE sched.time_in_state;
    INCLUDE PERFETTO MODULE sched.states;
    INCLUDE PERFETTO MODULE android.cpu.cluster_type;

    SELECT
      sched_state_io_to_human_readable_string(state, io_wait) as state,
      state AS rawState,
      cluster_type AS clusterType,
      cpu,
      blocked_function AS blockedFunction,
      dur
    FROM sched_time_in_state_and_cpu_for_thread_in_interval(${range.start}, ${range.duration}, ${utid})
    LEFT JOIN android_cpu_cluster_mapping USING(cpu);
  `);
    const it = query.iter({
        state: query_result_1.STR,
        rawState: query_result_1.STR,
        clusterType: query_result_1.STR_NULL,
        cpu: query_result_1.NUM_NULL,
        blockedFunction: query_result_1.STR_NULL,
        dur: query_result_1.LONG,
    });
    const root = new Node();
    for (; it.valid(); it.next()) {
        let currentNode = root;
        currentNode = currentNode.getOrCreateChild(it.state);
        // If the CPU time is not null, add it to the breakdown.
        if (it.clusterType !== null) {
            currentNode = currentNode.getOrCreateChild(it.clusterType);
        }
        if (it.cpu !== null) {
            currentNode = currentNode.getOrCreateChild(`CPU ${it.cpu}`);
        }
        if (it.blockedFunction !== null) {
            currentNode = currentNode.getOrCreateChild(`${it.blockedFunction}`);
        }
        currentNode.addDuration(it.dur);
    }
    return {
        root,
    };
}
function renderChildren(node, totalDur) {
    const res = Array.from(node.children.entries()).map(([name, child]) => renderNode(child, name, totalDur));
    return res;
}
function renderNode(node, name, totalDur) {
    const durPercent = (100 * Number(node.dur)) / Number(totalDur);
    return (0, mithril_1.default)(tree_1.TreeNode, {
        left: name,
        right: [
            (0, mithril_1.default)(duration_1.DurationWidget, { dur: node.dur }),
            ` (${durPercent.toFixed(2)}%)`,
        ],
        startsCollapsed: node.startsCollapsed,
    }, renderChildren(node, totalDur));
}
// A tree node that displays a nested breakdown a time interval by thread state.
class BreakdownByThreadStateTreeNode {
    view({ attrs }) {
        return renderChildren(attrs.data.root, attrs.dur);
    }
}
exports.BreakdownByThreadStateTreeNode = BreakdownByThreadStateTreeNode;
//# sourceMappingURL=thread_state.js.map