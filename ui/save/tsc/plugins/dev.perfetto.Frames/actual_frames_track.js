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
exports.ActualFramesTrack = exports.ACTUAL_FRAME_ROW = void 0;
const color_1 = require("../../public/color");
const colorizer_1 = require("../../components/colorizer");
const named_slice_track_1 = require("../../components/tracks/named_slice_track");
const slice_layout_1 = require("../../components/tracks/slice_layout");
const query_result_1 = require("../../trace_processor/query_result");
// color named and defined based on Material Design color palettes
// 500 colors indicate a timeline slice is not a partial jank (not a jank or
// full jank)
const BLUE_500 = (0, colorizer_1.makeColorScheme)(new color_1.HSLColor('#03A9F4'));
const BLUE_200 = (0, colorizer_1.makeColorScheme)(new color_1.HSLColor('#90CAF9'));
const GREEN_500 = (0, colorizer_1.makeColorScheme)(new color_1.HSLColor('#4CAF50'));
const GREEN_200 = (0, colorizer_1.makeColorScheme)(new color_1.HSLColor('#A5D6A7'));
const YELLOW_500 = (0, colorizer_1.makeColorScheme)(new color_1.HSLColor('#FFEB3B'));
const YELLOW_100 = (0, colorizer_1.makeColorScheme)(new color_1.HSLColor('#FFF9C4'));
const RED_500 = (0, colorizer_1.makeColorScheme)(new color_1.HSLColor('#FF5722'));
const RED_200 = (0, colorizer_1.makeColorScheme)(new color_1.HSLColor('#EF9A9A'));
const LIGHT_GREEN_500 = (0, colorizer_1.makeColorScheme)(new color_1.HSLColor('#C0D588'));
const LIGHT_GREEN_100 = (0, colorizer_1.makeColorScheme)(new color_1.HSLColor('#DCEDC8'));
const PINK_500 = (0, colorizer_1.makeColorScheme)(new color_1.HSLColor('#F515E0'));
const PINK_200 = (0, colorizer_1.makeColorScheme)(new color_1.HSLColor('#F48FB1'));
exports.ACTUAL_FRAME_ROW = {
    // Base columns (tsq, ts, dur, id, depth).
    ...named_slice_track_1.NAMED_ROW,
    // Jank-specific columns.
    jankTag: query_result_1.STR_NULL,
    jankSeverityType: query_result_1.STR_NULL,
};
class ActualFramesTrack extends named_slice_track_1.NamedSliceTrack {
    trackIds;
    constructor(trace, maxDepth, uri, trackIds) {
        super(trace, uri);
        this.trackIds = trackIds;
        this.sliceLayout = {
            ...slice_layout_1.SLICE_LAYOUT_FIT_CONTENT_DEFAULTS,
            depthGuess: maxDepth,
        };
    }
    // This is used by the base class to call iter().
    getRowSpec() {
        return exports.ACTUAL_FRAME_ROW;
    }
    getSqlSource() {
        return `
      SELECT
        s.ts as ts,
        s.dur as dur,
        s.layout_depth as depth,
        s.name as name,
        s.id as id,
        afs.jank_tag as jankTag,
        afs.jank_severity_type as jankSeverityType
      from experimental_slice_layout s
      join actual_frame_timeline_slice afs using(id)
      where
        filter_track_ids = '${this.trackIds.join(',')}'
    `;
    }
    rowToSlice(row) {
        const baseSlice = this.rowToSliceBase(row);
        return {
            ...baseSlice,
            colorScheme: getColorSchemeForJank(row.jankTag, row.jankSeverityType),
        };
    }
    async getSelectionDetails(id) {
        const baseDetails = await super.getSelectionDetails(id);
        if (!baseDetails)
            return undefined;
        return {
            ...baseDetails,
            tableName: 'slice',
        };
    }
    // Override dataset from base class NamedSliceTrack as we don't want these
    // tracks to participate in generic area selection aggregation (frames tracks
    // have their own dedicated aggregation panel).
    // TODO(stevegolton): In future CLs this will be handled with aggregation keys
    // instead, as this track will have to expose a dataset anyway.
    getDataset() {
        return undefined;
    }
}
exports.ActualFramesTrack = ActualFramesTrack;
function getColorSchemeForJank(jankTag, jankSeverityType) {
    if (jankSeverityType === 'Partial') {
        switch (jankTag) {
            case 'Self Jank':
                return RED_200;
            case 'Other Jank':
                return YELLOW_100;
            case 'Dropped Frame':
                return BLUE_200;
            case 'Buffer Stuffing':
            case 'SurfaceFlinger Stuffing':
                return LIGHT_GREEN_100;
            case 'No Jank': // should not happen
                return GREEN_200;
            default:
                return PINK_200;
        }
    }
    else {
        switch (jankTag) {
            case 'Self Jank':
                return RED_500;
            case 'Other Jank':
                return YELLOW_500;
            case 'Dropped Frame':
                return BLUE_500;
            case 'Buffer Stuffing':
            case 'SurfaceFlinger Stuffing':
                return LIGHT_GREEN_500;
            case 'No Jank':
                return GREEN_500;
            default:
                return PINK_500;
        }
    }
}
//# sourceMappingURL=actual_frames_track.js.map