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
exports.WebContentInteractionPanel = void 0;
const tslib_1 = require("tslib");
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
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const time_1 = require("../../base/time");
const core_types_1 = require("../../components/sql_utils/core_types");
const duration_1 = require("../../components/widgets/duration");
const timestamp_1 = require("../../components/widgets/timestamp");
const query_result_1 = require("../../trace_processor/query_result");
const details_shell_1 = require("../../widgets/details_shell");
const grid_layout_1 = require("../../widgets/grid_layout");
const section_1 = require("../../widgets/section");
const sql_ref_1 = require("../../widgets/sql_ref");
const tree_1 = require("../../widgets/tree");
class WebContentInteractionPanel {
    trace;
    id;
    data;
    constructor(trace, id) {
        this.trace = trace;
        this.id = id;
    }
    async load() {
        const queryResult = await this.trace.engine.query(`
      SELECT
        ts,
        dur,
        interaction_type AS interactionType,
        total_duration_ms AS totalDurationMs,
        renderer_upid AS upid
      FROM chrome_web_content_interactions
      WHERE id = ${this.id};
    `);
        const iter = queryResult.firstRow({
            ts: query_result_1.LONG,
            dur: query_result_1.LONG,
            interactionType: query_result_1.STR,
            totalDurationMs: query_result_1.LONG,
            upid: query_result_1.NUM,
        });
        this.data = {
            ts: time_1.Time.fromRaw(iter.ts),
            dur: iter.ts,
            interactionType: iter.interactionType,
            totalDurationMs: iter.totalDurationMs,
            upid: (0, core_types_1.asUpid)(iter.upid),
        };
    }
    getDetailsDictionary() {
        const details = {};
        if (this.data === undefined)
            return details;
        details['Interaction'] = this.data.interactionType;
        details['Timestamp'] = (0, mithril_1.default)(timestamp_1.Timestamp, { ts: this.data.ts });
        details['Duration'] = (0, mithril_1.default)(duration_1.DurationWidget, { dur: this.data.dur });
        details['Renderer Upid'] = this.data.upid;
        details['Total duration of all events'] = (0, mithril_1.default)(duration_1.DurationWidget, {
            dur: this.data.totalDurationMs,
        });
        details['SQL ID'] = (0, mithril_1.default)(sql_ref_1.SqlRef, {
            table: 'chrome_web_content_interactions',
            id: this.id,
        });
        return details;
    }
    render() {
        if (!this.data) {
            return (0, mithril_1.default)('h2', 'Loading');
        }
        return (0, mithril_1.default)(details_shell_1.DetailsShell, {
            title: 'Chrome Web Content Interaction',
        }, (0, mithril_1.default)(grid_layout_1.GridLayout, (0, mithril_1.default)(grid_layout_1.GridLayoutColumn, (0, mithril_1.default)(section_1.Section, { title: 'Details' }, (0, mithril_1.default)(tree_1.Tree, (0, tree_1.dictToTreeNodes)(this.getDetailsDictionary()))))));
    }
}
exports.WebContentInteractionPanel = WebContentInteractionPanel;
//# sourceMappingURL=web_content_interaction_details_panel.js.map