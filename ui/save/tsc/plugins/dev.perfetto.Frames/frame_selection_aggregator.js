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
exports.FrameSelectionAggregator = void 0;
const track_kinds_1 = require("../../public/track_kinds");
class FrameSelectionAggregator {
    id = 'frame_aggregation';
    async createAggregateView(engine, area) {
        const selectedSqlTrackIds = [];
        for (const trackInfo of area.tracks) {
            if (trackInfo?.tags?.kind === track_kinds_1.ACTUAL_FRAMES_SLICE_TRACK_KIND) {
                trackInfo.tags.trackIds &&
                    selectedSqlTrackIds.push(...trackInfo.tags.trackIds);
            }
        }
        if (selectedSqlTrackIds.length === 0)
            return false;
        await engine.query(`
      create or replace perfetto table ${this.id} as
      select
        jank_type,
        count(1) as occurrences,
        min(dur) as minDur,
        avg(dur) as meanDur,
        max(dur) as maxDur
      from actual_frame_timeline_slice
      where track_id in (${selectedSqlTrackIds})
        AND ts + dur > ${area.start}
        AND ts < ${area.end}
      group by jank_type
    `);
        return true;
    }
    getTabName() {
        return 'Frames';
    }
    async getExtra() { }
    getDefaultSorting() {
        return { column: 'occurrences', direction: 'DESC' };
    }
    getColumnDefinitions() {
        return [
            {
                title: 'Jank Type',
                kind: 'STRING',
                columnConstructor: Uint16Array,
                columnId: 'jank_type',
            },
            {
                title: 'Min duration',
                kind: 'NUMBER',
                columnConstructor: Uint16Array,
                columnId: 'minDur',
            },
            {
                title: 'Max duration',
                kind: 'NUMBER',
                columnConstructor: Uint16Array,
                columnId: 'maxDur',
            },
            {
                title: 'Mean duration',
                kind: 'NUMBER',
                columnConstructor: Uint16Array,
                columnId: 'meanDur',
            },
            {
                title: 'Occurrences',
                kind: 'NUMBER',
                columnConstructor: Uint16Array,
                columnId: 'occurrences',
                sum: true,
            },
        ];
    }
}
exports.FrameSelectionAggregator = FrameSelectionAggregator;
//# sourceMappingURL=frame_selection_aggregator.js.map