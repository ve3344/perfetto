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
exports.AsyncSliceTrack = exports.THREAD_SLICE_ROW = void 0;
const bigint_math_1 = require("../../base/bigint_math");
const math_utils_1 = require("../../base/math_utils");
const named_slice_track_1 = require("../../components/tracks/named_slice_track");
const slice_layout_1 = require("../../components/tracks/slice_layout");
const dataset_1 = require("../../trace_processor/dataset");
const query_result_1 = require("../../trace_processor/query_result");
exports.THREAD_SLICE_ROW = {
    // Base columns (tsq, ts, dur, id, depth).
    ...named_slice_track_1.NAMED_ROW,
    // Thread-specific columns.
    threadDur: query_result_1.LONG_NULL,
};
class AsyncSliceTrack extends named_slice_track_1.NamedSliceTrack {
    trackIds;
    constructor(trace, uri, maxDepth, trackIds) {
        super(trace, uri);
        this.trackIds = trackIds;
        this.sliceLayout = {
            ...slice_layout_1.SLICE_LAYOUT_FIT_CONTENT_DEFAULTS,
            depthGuess: maxDepth,
        };
    }
    getRowSpec() {
        return exports.THREAD_SLICE_ROW;
    }
    rowToSlice(row) {
        const namedSlice = this.rowToSliceBase(row);
        if (row.dur > 0n && row.threadDur !== null) {
            const fillRatio = (0, math_utils_1.clamp)(bigint_math_1.BigintMath.ratio(row.threadDur, row.dur), 0, 1);
            return { ...namedSlice, fillRatio };
        }
        else {
            return namedSlice;
        }
    }
    getSqlSource() {
        // If we only have one track ID we can avoid the overhead of
        // experimental_slice_layout, and just go straight to the slice table.
        if (this.trackIds.length === 1) {
            return `
        select
          ts,
          dur,
          id,
          depth,
          ifnull(name, '[null]') as name,
          thread_dur as threadDur
        from slice
        where track_id = ${this.trackIds[0]}
      `;
        }
        else {
            return `
        select
          id,
          ts,
          dur,
          layout_depth as depth,
          ifnull(name, '[null]') as name,
          thread_dur as threadDur
        from experimental_slice_layout
        where filter_track_ids = '${this.trackIds.join(',')}'
      `;
        }
    }
    onUpdatedSlices(slices) {
        for (const slice of slices) {
            slice.isHighlighted = slice === this.hoveredSlice;
        }
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
    getDataset() {
        return new dataset_1.SourceDataset({
            src: `slice`,
            filter: {
                col: 'track_id',
                in: this.trackIds,
            },
            schema: {
                id: query_result_1.NUM,
                name: query_result_1.STR,
                ts: query_result_1.LONG,
                dur: query_result_1.LONG,
                parent_id: query_result_1.NUM_NULL,
            },
        });
    }
}
exports.AsyncSliceTrack = AsyncSliceTrack;
//# sourceMappingURL=async_slice_track.js.map