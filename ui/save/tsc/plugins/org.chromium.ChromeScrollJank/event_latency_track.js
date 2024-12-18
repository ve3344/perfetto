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
exports.EventLatencyTrack = exports.JANKY_LATENCY_NAME = void 0;
const custom_sql_table_slice_track_1 = require("../../components/tracks/custom_sql_table_slice_track");
const jank_colors_1 = require("./jank_colors");
const event_latency_details_panel_1 = require("./event_latency_details_panel");
exports.JANKY_LATENCY_NAME = 'Janky EventLatency';
class EventLatencyTrack extends custom_sql_table_slice_track_1.CustomSqlTableSliceTrack {
    baseTable;
    constructor(trace, uri, baseTable) {
        super(trace, uri);
        this.baseTable = baseTable;
    }
    getSqlDataSource() {
        return {
            sqlTableName: this.baseTable,
        };
    }
    rowToSlice(row) {
        const baseSlice = super.rowToSlice(row);
        if (baseSlice.title === exports.JANKY_LATENCY_NAME) {
            return { ...baseSlice, colorScheme: jank_colors_1.JANK_COLOR };
        }
        else {
            return baseSlice;
        }
    }
    detailsPanel(sel) {
        return new event_latency_details_panel_1.EventLatencySliceDetailsPanel(this.trace, sel.eventId);
    }
}
exports.EventLatencyTrack = EventLatencyTrack;
//# sourceMappingURL=event_latency_track.js.map