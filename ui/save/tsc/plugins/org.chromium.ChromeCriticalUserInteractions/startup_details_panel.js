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
exports.StartupDetailsPanel = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const time_1 = require("../../base/time");
const duration_1 = require("../../components/widgets/duration");
const timestamp_1 = require("../../components/widgets/timestamp");
const query_result_1 = require("../../trace_processor/query_result");
const details_shell_1 = require("../../widgets/details_shell");
const grid_layout_1 = require("../../widgets/grid_layout");
const section_1 = require("../../widgets/section");
const sql_ref_1 = require("../../widgets/sql_ref");
const tree_1 = require("../../widgets/tree");
const core_types_1 = require("../../components/sql_utils/core_types");
class StartupDetailsPanel {
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
        activity_id AS startupId,
        name,
        startup_begin_ts AS startupBeginTs,
        CASE
          WHEN first_visible_content_ts IS NULL THEN 0
          ELSE first_visible_content_ts - startup_begin_ts
        END AS durTofirstVisibleContent,
        launch_cause AS launchCause,
        browser_upid AS upid
      FROM chrome_startups
      WHERE id = ${this.id};
    `);
        const iter = queryResult.firstRow({
            startupId: query_result_1.NUM,
            name: query_result_1.STR,
            startupBeginTs: query_result_1.LONG,
            durTofirstVisibleContent: query_result_1.LONG,
            launchCause: query_result_1.STR_NULL,
            upid: query_result_1.NUM,
        });
        this.data = {
            startupId: iter.startupId,
            eventName: iter.name,
            startupBeginTs: time_1.Time.fromRaw(iter.startupBeginTs),
            durToFirstVisibleContent: iter.durTofirstVisibleContent,
            upid: (0, core_types_1.asUpid)(iter.upid),
        };
        if (iter.launchCause) {
            this.data.launchCause = iter.launchCause;
        }
    }
    getDetailsDictionary() {
        const details = {};
        if (this.data === undefined)
            return details;
        details['Activity ID'] = this.data.startupId;
        details['Browser Upid'] = this.data.upid;
        details['Startup Event'] = this.data.eventName;
        details['Startup Timestamp'] = (0, mithril_1.default)(timestamp_1.Timestamp, { ts: this.data.startupBeginTs });
        details['Duration to First Visible Content'] = (0, mithril_1.default)(duration_1.DurationWidget, {
            dur: this.data.durToFirstVisibleContent,
        });
        if (this.data.launchCause) {
            details['Launch Cause'] = this.data.launchCause;
        }
        details['SQL ID'] = (0, mithril_1.default)(sql_ref_1.SqlRef, {
            table: 'chrome_startups',
            id: this.id,
        });
        return details;
    }
    render() {
        if (!this.data) {
            return (0, mithril_1.default)('h2', 'Loading');
        }
        return (0, mithril_1.default)(details_shell_1.DetailsShell, {
            title: 'Chrome Startup',
        }, (0, mithril_1.default)(grid_layout_1.GridLayout, (0, mithril_1.default)(grid_layout_1.GridLayoutColumn, (0, mithril_1.default)(section_1.Section, { title: 'Details' }, (0, mithril_1.default)(tree_1.Tree, (0, tree_1.dictToTreeNodes)(this.getDetailsDictionary()))))));
    }
}
exports.StartupDetailsPanel = StartupDetailsPanel;
//# sourceMappingURL=startup_details_panel.js.map