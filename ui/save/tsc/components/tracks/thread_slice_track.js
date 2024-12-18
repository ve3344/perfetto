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
exports.ThreadSliceTrack = exports.THREAD_SLICE_ROW = void 0;
const bigint_math_1 = require("../../base/bigint_math");
const math_utils_1 = require("../../base/math_utils");
const named_slice_track_1 = require("./named_slice_track");
const slice_layout_1 = require("./slice_layout");
const query_result_1 = require("../../trace_processor/query_result");
const thread_slice_details_tab_1 = require("../details/thread_slice_details_tab");
const trace_impl_1 = require("../../core/trace_impl");
const logging_1 = require("../../base/logging");
exports.THREAD_SLICE_ROW = {
    // Base columns (tsq, ts, dur, id, depth).
    ...named_slice_track_1.NAMED_ROW,
    // Thread-specific columns.
    threadDur: query_result_1.LONG_NULL,
};
class ThreadSliceTrack extends named_slice_track_1.NamedSliceTrack {
    trackId;
    tableName;
    constructor(trace, uri, trackId, maxDepth, tableName = 'slice') {
        super(trace, uri);
        this.trackId = trackId;
        this.tableName = tableName;
        this.sliceLayout = {
            ...slice_layout_1.SLICE_LAYOUT_FIT_CONTENT_DEFAULTS,
            depthGuess: maxDepth,
        };
    }
    // This is used by the base class to call iter().
    getRowSpec() {
        return exports.THREAD_SLICE_ROW;
    }
    getSqlSource() {
        return `
      select
        ts,
        dur,
        id,
        depth,
        ifnull(name, '') as name,
        thread_dur as threadDur
      from ${this.tableName}
      where track_id = ${this.trackId}
    `;
    }
    // Converts a SQL result row to an "Impl" Slice.
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
            tableName: this.tableName,
        };
    }
    detailsPanel() {
        // Rationale for the assertIsInstance: ThreadSliceDetailsPanel requires a
        // TraceImpl (because of flows) but here we must take a Trace interface,
        // because this class is exposed to plugins (which see only Trace).
        return new thread_slice_details_tab_1.ThreadSliceDetailsPanel((0, logging_1.assertIsInstance)(this.trace, trace_impl_1.TraceImpl));
    }
}
exports.ThreadSliceTrack = ThreadSliceTrack;
//# sourceMappingURL=thread_slice_track.js.map