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
exports.ExpectedFramesTrack = void 0;
const color_1 = require("../../public/color");
const colorizer_1 = require("../../components/colorizer");
const named_slice_track_1 = require("../../components/tracks/named_slice_track");
const slice_layout_1 = require("../../components/tracks/slice_layout");
const GREEN = (0, colorizer_1.makeColorScheme)(new color_1.HSLColor('#4CAF50')); // Green 500
class ExpectedFramesTrack extends named_slice_track_1.NamedSliceTrack {
    trackIds;
    constructor(trace, maxDepth, uri, trackIds) {
        super(trace, uri);
        this.trackIds = trackIds;
        this.sliceLayout = {
            ...slice_layout_1.SLICE_LAYOUT_FIT_CONTENT_DEFAULTS,
            depthGuess: maxDepth,
        };
    }
    getSqlSource() {
        return `
      SELECT
        ts,
        dur,
        layout_depth as depth,
        name,
        id
      from experimental_slice_layout
      where
        filter_track_ids = '${this.trackIds.join(',')}'
    `;
    }
    rowToSlice(row) {
        const baseSlice = this.rowToSliceBase(row);
        return { ...baseSlice, colorScheme: GREEN };
    }
    getRowSpec() {
        return named_slice_track_1.NAMED_ROW;
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
}
exports.ExpectedFramesTrack = ExpectedFramesTrack;
//# sourceMappingURL=expected_frames_track.js.map