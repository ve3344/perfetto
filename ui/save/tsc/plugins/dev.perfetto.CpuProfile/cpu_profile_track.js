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
exports.CpuProfileTrack = void 0;
const logging_1 = require("../../base/logging");
const colorizer_1 = require("../../components/colorizer");
const base_slice_track_1 = require("../../components/tracks/base_slice_track");
const named_slice_track_1 = require("../../components/tracks/named_slice_track");
const query_result_1 = require("../../trace_processor/query_result");
const cpu_profile_details_panel_1 = require("./cpu_profile_details_panel");
class CpuProfileTrack extends base_slice_track_1.BaseSliceTrack {
    utid;
    constructor(trace, uri, utid) {
        super(trace, uri);
        this.utid = utid;
    }
    getRowSpec() {
        return { ...named_slice_track_1.NAMED_ROW, callsiteId: query_result_1.NUM };
    }
    rowToSlice(row) {
        const baseSlice = super.rowToSliceBase(row);
        const name = (0, logging_1.assertExists)(row.name);
        const colorScheme = (0, colorizer_1.getColorForSample)(row.callsiteId);
        return { ...baseSlice, title: name, colorScheme };
    }
    onUpdatedSlices(slices) {
        for (const slice of slices) {
            slice.isHighlighted = slice === this.hoveredSlice;
        }
    }
    getSqlSource() {
        return `
      select
        p.id,
        ts,
        0 as dur,
        0 as depth,
        'CPU Sample' as name,
        callsite_id as callsiteId
      from cpu_profile_stack_sample p
      where utid = ${this.utid}
      order by ts
    `;
    }
    async getSelectionDetails(id) {
        const baseDetails = await super.getSelectionDetails(id);
        if (baseDetails === undefined)
            return undefined;
        return { ...baseDetails, utid: this.utid };
    }
    detailsPanel(selection) {
        const { ts, utid } = selection;
        return new cpu_profile_details_panel_1.CpuProfileSampleFlamegraphDetailsPanel(this.trace, ts, (0, logging_1.assertExists)(utid));
    }
}
exports.CpuProfileTrack = CpuProfileTrack;
//# sourceMappingURL=cpu_profile_track.js.map