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
exports.TraceProcessorCounterTrack = void 0;
const time_1 = require("../../base/time");
const base_counter_track_1 = require("../../components/tracks/base_counter_track");
const query_result_1 = require("../../trace_processor/query_result");
const counter_details_panel_1 = require("./counter_details_panel");
class TraceProcessorCounterTrack extends base_counter_track_1.BaseCounterTrack {
    trackId;
    trackName;
    rootTable;
    constructor(trace, uri, options, trackId, trackName, rootTable = 'counter') {
        super(trace, uri, options);
        this.trackId = trackId;
        this.trackName = trackName;
        this.rootTable = rootTable;
    }
    getSqlSource() {
        return `
      select
        id,
        ts,
        value
      from ${this.rootTable}
      where track_id = ${this.trackId}
    `;
    }
    onMouseClick({ x, timescale }) {
        const time = timescale.pxToHpTime(x).toTime('floor');
        const query = `
      select
        id
      from ${this.rootTable}
      where
        track_id = ${this.trackId}
        and ts < ${time}
      order by ts DESC
      limit 1
    `;
        this.engine.query(query).then((result) => {
            const it = result.iter({
                id: query_result_1.NUM,
            });
            if (!it.valid()) {
                return;
            }
            const id = it.id;
            this.trace.selection.selectTrackEvent(this.uri, id);
        });
        return true;
    }
    // We must define this here instead of in `BaseCounterTrack` because
    // `BaseCounterTrack` does not require the query to have an id column. Here,
    // however, we make the assumption that `rootTable` has an id column, as we
    // need it ot make selections in `onMouseClick` above. Whether or not we
    // SHOULD assume `rootTable` has an id column is another matter...
    async getSelectionDetails(id) {
        const query = `
      WITH 
        CTE AS (
          SELECT
            id,
            ts as leftTs,
            LEAD(ts) OVER (ORDER BY ts) AS rightTs
          FROM ${this.rootTable}
          WHERE track_id = ${this.trackId}
        )
      SELECT * FROM CTE WHERE id = ${id}
    `;
        const counter = await this.engine.query(query);
        const row = counter.iter({
            leftTs: query_result_1.LONG,
            rightTs: query_result_1.LONG_NULL,
        });
        const leftTs = time_1.Time.fromRaw(row.leftTs);
        const rightTs = row.rightTs !== null ? time_1.Time.fromRaw(row.rightTs) : leftTs;
        const duration = rightTs - leftTs;
        return { ts: leftTs, dur: duration };
    }
    detailsPanel() {
        return new counter_details_panel_1.CounterDetailsPanel(this.trace, this.trackId, this.trackName);
    }
}
exports.TraceProcessorCounterTrack = TraceProcessorCounterTrack;
//# sourceMappingURL=trace_processor_counter_track.js.map