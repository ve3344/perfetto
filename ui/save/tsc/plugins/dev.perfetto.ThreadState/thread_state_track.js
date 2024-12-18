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
exports.ThreadStateTrack = exports.THREAD_STATE_ROW = void 0;
const colorizer_1 = require("../../components/colorizer");
const base_slice_track_1 = require("../../components/tracks/base_slice_track");
const slice_layout_1 = require("../../components/tracks/slice_layout");
const query_result_1 = require("../../trace_processor/query_result");
const thread_state_1 = require("../../components/sql_utils/thread_state");
const thread_state_details_panel_1 = require("./thread_state_details_panel");
const dataset_1 = require("../../trace_processor/dataset");
exports.THREAD_STATE_ROW = {
    ...base_slice_track_1.BASE_ROW,
    state: query_result_1.STR,
    ioWait: query_result_1.NUM_NULL,
};
class ThreadStateTrack extends base_slice_track_1.BaseSliceTrack {
    utid;
    sliceLayout = { ...slice_layout_1.SLICE_LAYOUT_FLAT_DEFAULTS };
    constructor(trace, uri, utid) {
        super(trace, uri);
        this.utid = utid;
    }
    // This is used by the base class to call iter().
    getRowSpec() {
        return exports.THREAD_STATE_ROW;
    }
    getSqlSource() {
        // Do not display states: 'S' (sleeping), 'I' (idle kernel thread).
        return `
      select
        id,
        ts,
        dur,
        cpu,
        state,
        io_wait as ioWait,
        0 as depth
      from thread_state
      where
        utid = ${this.utid} and
        state not in ('S', 'I')
    `;
    }
    getDataset() {
        return new dataset_1.SourceDataset({
            src: 'thread_state',
            schema: {
                id: query_result_1.NUM,
                ts: query_result_1.LONG,
                dur: query_result_1.LONG,
                cpu: query_result_1.NUM,
                state: query_result_1.STR,
                io_wait: query_result_1.NUM_NULL,
                utid: query_result_1.NUM,
            },
            filter: {
                col: 'utid',
                eq: this.utid,
            },
        });
    }
    rowToSlice(row) {
        const baseSlice = this.rowToSliceBase(row);
        const ioWait = row.ioWait === null ? undefined : !!row.ioWait;
        const title = (0, thread_state_1.translateState)(row.state, ioWait);
        const color = (0, colorizer_1.colorForState)(title);
        return { ...baseSlice, title, colorScheme: color };
    }
    onUpdatedSlices(slices) {
        for (const slice of slices) {
            slice.isHighlighted = slice === this.hoveredSlice;
        }
    }
    // Add utid to selection details
    async getSelectionDetails(id) {
        const details = await super.getSelectionDetails(id);
        return details && { ...details, utid: this.utid };
    }
    detailsPanel({ eventId }) {
        return new thread_state_details_panel_1.ThreadStateDetailsPanel(this.trace, eventId);
    }
}
exports.ThreadStateTrack = ThreadStateTrack;
//# sourceMappingURL=thread_state_track.js.map