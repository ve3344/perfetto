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
exports.CriticalUserInteractionTrack = exports.CRITICAL_USER_INTERACTIONS_ROW = exports.CRITICAL_USER_INTERACTIONS_KIND = void 0;
const named_slice_track_1 = require("../../components/tracks/named_slice_track");
const query_result_1 = require("../../trace_processor/query_result");
const custom_sql_table_slice_track_1 = require("../../components/tracks/custom_sql_table_slice_track");
const time_1 = require("../../base/time");
const page_load_details_panel_1 = require("./page_load_details_panel");
const startup_details_panel_1 = require("./startup_details_panel");
const web_content_interaction_details_panel_1 = require("./web_content_interaction_details_panel");
const generic_slice_details_tab_1 = require("./generic_slice_details_tab");
exports.CRITICAL_USER_INTERACTIONS_KIND = 'org.chromium.CriticalUserInteraction.track';
exports.CRITICAL_USER_INTERACTIONS_ROW = {
    ...named_slice_track_1.NAMED_ROW,
    scopedId: query_result_1.NUM,
    type: query_result_1.STR,
};
class CriticalUserInteractionTrack extends custom_sql_table_slice_track_1.CustomSqlTableSliceTrack {
    static kind = `/critical_user_interactions`;
    getSqlDataSource() {
        return {
            columns: [
                // The scoped_id is not a unique identifier within the table; generate
                // a unique id from type and scoped_id on the fly to use for slice
                // selection.
                'hash(type, scoped_id) AS id',
                'scoped_id AS scopedId',
                'name',
                'ts',
                'dur',
                'type',
            ],
            sqlTableName: 'chrome_interactions',
        };
    }
    async getSelectionDetails(id) {
        const query = `
      SELECT
        ts,
        dur,
        type
      FROM (${this.getSqlSource()})
      WHERE id = ${id}
    `;
        const result = await this.engine.query(query);
        if (result.numRows() === 0) {
            return undefined;
        }
        const row = result.iter({
            ts: query_result_1.LONG,
            dur: query_result_1.LONG,
            type: query_result_1.STR,
        });
        return {
            ts: time_1.Time.fromRaw(row.ts),
            dur: time_1.Duration.fromRaw(row.dur),
            interactionType: row.type,
        };
    }
    getRowSpec() {
        return exports.CRITICAL_USER_INTERACTIONS_ROW;
    }
    rowToSlice(row) {
        const baseSlice = super.rowToSlice(row);
        const scopedId = row.scopedId;
        const type = row.type;
        return { ...baseSlice, scopedId, type };
    }
    detailsPanel(sel) {
        switch (sel.interactionType) {
            case 'chrome_page_loads':
                return new page_load_details_panel_1.PageLoadDetailsPanel(this.trace, sel.eventId);
            case 'chrome_startups':
                return new startup_details_panel_1.StartupDetailsPanel(this.trace, sel.eventId);
            case 'chrome_web_content_interactions':
                return new web_content_interaction_details_panel_1.WebContentInteractionPanel(this.trace, sel.eventId);
            default:
                return new generic_slice_details_tab_1.GenericSliceDetailsTab(this.trace, 'chrome_interactions', sel.eventId, 'Chrome Interaction');
        }
    }
}
exports.CriticalUserInteractionTrack = CriticalUserInteractionTrack;
//# sourceMappingURL=critical_user_interaction_track.js.map