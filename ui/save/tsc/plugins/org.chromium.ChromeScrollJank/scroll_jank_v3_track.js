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
exports.ScrollJankV3Track = void 0;
const custom_sql_table_slice_track_1 = require("../../components/tracks/custom_sql_table_slice_track");
const jank_colors_1 = require("./jank_colors");
const colorizer_1 = require("../../components/colorizer");
const scroll_jank_v3_details_panel_1 = require("./scroll_jank_v3_details_panel");
const UNKNOWN_SLICE_NAME = 'Unknown';
const JANK_SLICE_NAME = ' Jank';
class ScrollJankV3Track extends custom_sql_table_slice_track_1.CustomSqlTableSliceTrack {
    getSqlDataSource() {
        return {
            columns: [
                `IIF(
          cause_of_jank IS NOT NULL,
          cause_of_jank || IIF(
            sub_cause_of_jank IS NOT NULL, "::" || sub_cause_of_jank, ""
            ), "${UNKNOWN_SLICE_NAME}") || "${JANK_SLICE_NAME}" AS name`,
                'id',
                'ts',
                'dur',
                'event_latency_id',
            ],
            sqlTableName: 'chrome_janky_frame_presentation_intervals',
        };
    }
    rowToSlice(row) {
        const slice = super.rowToSlice(row);
        let stage = slice.title.substring(0, slice.title.indexOf(JANK_SLICE_NAME));
        // Stage may include substage, in which case we use the substage for
        // color selection.
        const separator = '::';
        if (stage.indexOf(separator) != -1) {
            stage = stage.substring(stage.indexOf(separator) + separator.length);
        }
        if (stage == UNKNOWN_SLICE_NAME) {
            return { ...slice, colorScheme: jank_colors_1.JANK_COLOR };
        }
        else {
            return { ...slice, colorScheme: (0, colorizer_1.getColorForSlice)(stage) };
        }
    }
    detailsPanel(sel) {
        return new scroll_jank_v3_details_panel_1.ScrollJankV3DetailsPanel(this.trace, sel.eventId);
    }
}
exports.ScrollJankV3Track = ScrollJankV3Track;
//# sourceMappingURL=scroll_jank_v3_track.js.map