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
exports.CounterDetailsPanel = void 0;
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
const slice_args_1 = require("../../components/details/slice_args");
const core_types_1 = require("../../components/sql_utils/core_types");
const args_1 = require("../../components/sql_utils/args");
class CounterDetailsPanel {
    trace;
    engine;
    trackId;
    rootTable;
    trackName;
    counterDetails;
    constructor(trace, trackId, trackName, rootTable = 'counter') {
        this.trace = trace;
        this.engine = trace.engine;
        this.trackId = trackId;
        this.trackName = trackName;
        this.rootTable = rootTable;
    }
    async load({ eventId }) {
        this.counterDetails = await loadCounterDetails(this.engine, this.trackId, eventId, this.rootTable);
    }
    render() {
        const counterInfo = this.counterDetails;
        if (counterInfo) {
            const args = (0, slice_args_1.hasArgs)(counterInfo.args) &&
                (0, mithril_1.default)(section_1.Section, { title: 'Arguments' }, (0, mithril_1.default)(tree_1.Tree, (0, slice_args_1.renderArguments)(this.trace, counterInfo.args)));
            return (0, mithril_1.default)(details_shell_1.DetailsShell, { title: 'Counter', description: `${this.trackName}` }, (0, mithril_1.default)(grid_layout_1.GridLayout, (0, mithril_1.default)(section_1.Section, { title: 'Properties' }, (0, mithril_1.default)(tree_1.Tree, (0, mithril_1.default)(tree_1.TreeNode, { left: 'Name', right: `${this.trackName}` }), (0, mithril_1.default)(tree_1.TreeNode, {
                left: 'Start time',
                right: (0, mithril_1.default)(timestamp_1.Timestamp, { ts: counterInfo.ts }),
            }), (0, mithril_1.default)(tree_1.TreeNode, {
                left: 'Value',
                right: `${counterInfo.value.toLocaleString()}`,
            }), (0, mithril_1.default)(tree_1.TreeNode, {
                left: 'Delta',
                right: `${counterInfo.delta.toLocaleString()}`,
            }), (0, mithril_1.default)(tree_1.TreeNode, {
                left: 'Duration',
                right: (0, mithril_1.default)(duration_1.DurationWidget, { dur: counterInfo.duration }),
            }))), args));
        }
        else {
            return (0, mithril_1.default)(details_shell_1.DetailsShell, { title: 'Counter', description: 'Loading...' });
        }
    }
    isLoading() {
        return this.counterDetails === undefined;
    }
}
exports.CounterDetailsPanel = CounterDetailsPanel;
async function loadCounterDetails(engine, trackId, id, rootTable) {
    const query = `
    WITH CTE AS (
      SELECT
        id,
        ts as leftTs,
        value,
        LAG(value) OVER (ORDER BY ts) AS prevValue,
        LEAD(ts) OVER (ORDER BY ts) AS rightTs,
        arg_set_id AS argSetId
      FROM ${rootTable}
      WHERE track_id = ${trackId}
    )
    SELECT * FROM CTE WHERE id = ${id}
  `;
    const counter = await engine.query(query);
    const row = counter.iter({
        value: query_result_1.NUM,
        prevValue: query_result_1.NUM_NULL,
        leftTs: query_result_1.LONG,
        rightTs: query_result_1.LONG_NULL,
        argSetId: query_result_1.NUM_NULL,
    });
    const value = row.value;
    const leftTs = time_1.Time.fromRaw(row.leftTs);
    const rightTs = row.rightTs !== null ? time_1.Time.fromRaw(row.rightTs) : leftTs;
    const prevValue = row.prevValue !== null ? row.prevValue : value;
    const delta = value - prevValue;
    const duration = rightTs - leftTs;
    const argSetId = row.argSetId;
    const args = argSetId == null ? undefined : await (0, args_1.getArgs)(engine, (0, core_types_1.asArgSetId)(argSetId));
    return { ts: leftTs, value, delta, duration, args };
}
//# sourceMappingURL=counter_details_panel.js.map