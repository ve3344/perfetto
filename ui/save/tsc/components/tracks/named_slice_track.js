"use strict";
// Copyright (C) 2021 The Android Open Source Project
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
exports.NamedSliceTrack = exports.NAMED_ROW = void 0;
const colorizer_1 = require("../colorizer");
const query_result_1 = require("../../trace_processor/query_result");
const base_slice_track_1 = require("./base_slice_track");
const thread_slice_details_tab_1 = require("../details/thread_slice_details_tab");
const trace_impl_1 = require("../../core/trace_impl");
const logging_1 = require("../../base/logging");
const dataset_1 = require("../../trace_processor/dataset");
const time_utils_1 = require("../time_utils");
exports.NAMED_ROW = {
    // Base columns (tsq, ts, dur, id, depth).
    ...base_slice_track_1.BASE_ROW,
    // Impl-specific columns.
    name: query_result_1.STR_NULL,
};
class NamedSliceTrack extends base_slice_track_1.BaseSliceTrack {
    constructor(trace, uri) {
        super(trace, uri);
    }
    // Converts a SQL result row to an "Impl" Slice.
    rowToSliceBase(row) {
        const baseSlice = super.rowToSliceBase(row);
        // Ignore PIDs or numeric arguments when hashing.
        const name = row.name ?? '';
        const colorScheme = (0, colorizer_1.getColorForSlice)(name);
        return { ...baseSlice, title: name, colorScheme };
    }
    onSliceOver(args) {
        const { title, dur, flags } = args.slice;
        let duration;
        if (flags & base_slice_track_1.SLICE_FLAGS_INCOMPLETE) {
            duration = 'Incomplete';
        }
        else if (flags & base_slice_track_1.SLICE_FLAGS_INSTANT) {
            duration = 'Instant';
        }
        else {
            duration = (0, time_utils_1.formatDuration)(this.trace, dur);
        }
        args.tooltip = [`${title} - [${duration}]`];
    }
    detailsPanel(_sel) {
        // Rationale for the assertIsInstance: ThreadSliceDetailsPanel requires a
        // TraceImpl (because of flows) but here we must take a Trace interface,
        // because this class is exposed to plugins (which see only Trace).
        return new thread_slice_details_tab_1.ThreadSliceDetailsPanel((0, logging_1.assertIsInstance)(this.trace, trace_impl_1.TraceImpl));
    }
    getDataset() {
        return new dataset_1.SourceDataset({
            src: this.getSqlSource(),
            schema: {
                id: query_result_1.NUM,
                name: query_result_1.STR,
                ts: query_result_1.LONG,
                dur: query_result_1.LONG,
            },
        });
    }
}
exports.NamedSliceTrack = NamedSliceTrack;
//# sourceMappingURL=named_slice_track.js.map