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
exports.ProcessSummaryTrack = exports.PROCESS_SUMMARY_TRACK = void 0;
const bigint_math_1 = require("../../base/bigint_math");
const logging_1 = require("../../base/logging");
const time_1 = require("../../base/time");
const colorizer_1 = require("../../components/colorizer");
const track_helper_1 = require("../../components/tracks/track_helper");
const checkerboard_1 = require("../../components/checkerboard");
const query_result_1 = require("../../trace_processor/query_result");
const uuid_1 = require("../../base/uuid");
exports.PROCESS_SUMMARY_TRACK = 'ProcessSummaryTrack';
const MARGIN_TOP = 5;
const RECT_HEIGHT = 30;
const TRACK_HEIGHT = MARGIN_TOP * 2 + RECT_HEIGHT;
const SUMMARY_HEIGHT = TRACK_HEIGHT - MARGIN_TOP;
class ProcessSummaryTrack {
    fetcher = new track_helper_1.TimelineFetcher(this.onBoundsChange.bind(this));
    engine;
    config;
    uuid = (0, uuid_1.uuidv4Sql)();
    constructor(engine, config) {
        this.engine = engine;
        this.config = config;
    }
    async onCreate() {
        let trackIdQuery;
        if (this.config.upid !== null) {
            trackIdQuery = `
        select tt.id as track_id
        from thread_track as tt
        join _thread_available_info_summary using (utid)
        join thread using (utid)
        where thread.upid = ${this.config.upid}
        order by slice_count desc
      `;
        }
        else {
            trackIdQuery = `
        select tt.id as track_id
        from thread_track as tt
        join _thread_available_info_summary using (utid)
        where tt.utid = ${(0, logging_1.assertExists)(this.config.utid)}
        order by slice_count desc
      `;
        }
        await this.engine.query(`
      create virtual table process_summary_${this.uuid}
      using __intrinsic_counter_mipmap((
        with
          tt as materialized (
            ${trackIdQuery}
          ),
          ss as (
            select ts, 1.0 as value
            from slice
            join tt using (track_id)
            where slice.depth = 0
            union all
            select ts + dur as ts, -1.0 as value
            from slice
            join tt using (track_id)
            where slice.depth = 0
          )
        select
          ts,
          sum(value) over (order by ts) / (select count() from tt) as value
        from ss
        order by ts
      ));
    `);
    }
    async onUpdate({ visibleWindow, resolution, }) {
        await this.fetcher.requestData(visibleWindow.toTimeSpan(), resolution);
    }
    async onBoundsChange(start, end, resolution) {
        // Resolution must always be a power of 2 for this logic to work
        (0, logging_1.assertTrue)(bigint_math_1.BigintMath.popcount(resolution) === 1, `${resolution} not pow of 2`);
        const queryRes = await this.engine.query(`
      select last_ts as ts, last_value as utilization
      from process_summary_${this.uuid}(${start}, ${end}, ${resolution});
    `);
        const numRows = queryRes.numRows();
        const slices = {
            start,
            end,
            resolution,
            length: numRows,
            starts: new BigInt64Array(numRows),
            utilizations: new Float64Array(numRows),
        };
        const it = queryRes.iter({
            ts: query_result_1.LONG,
            utilization: query_result_1.NUM,
        });
        for (let row = 0; it.valid(); it.next(), row++) {
            slices.starts[row] = it.ts;
            slices.utilizations[row] = it.utilization;
        }
        return slices;
    }
    async onDestroy() {
        await this.engine.tryQuery(`drop table if exists process_summary_${this.uuid};`);
        this.fetcher[Symbol.dispose]();
    }
    getHeight() {
        return TRACK_HEIGHT;
    }
    render(trackCtx) {
        const { ctx, size, timescale } = trackCtx;
        const data = this.fetcher.data;
        if (data === undefined) {
            return;
        }
        // If the cached trace slices don't fully cover the visible time range,
        // show a gray rectangle with a "Loading..." label.
        (0, checkerboard_1.checkerboardExcept)(ctx, this.getHeight(), 0, size.width, timescale.timeToPx(data.start), timescale.timeToPx(data.end));
        this.renderSummary(trackCtx, data);
    }
    renderSummary({ ctx, timescale }, data) {
        const startPx = 0;
        const bottomY = TRACK_HEIGHT;
        let lastX = startPx;
        let lastY = bottomY;
        const color = (0, colorizer_1.colorForTid)(this.config.pidForColor);
        ctx.fillStyle = color.base.cssString;
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        for (let i = 0; i < data.utilizations.length; i++) {
            const startTime = time_1.Time.fromRaw(data.starts[i]);
            const utilization = data.utilizations[i];
            lastX = Math.floor(timescale.timeToPx(startTime));
            ctx.lineTo(lastX, lastY);
            lastY = MARGIN_TOP + Math.round(SUMMARY_HEIGHT * (1 - utilization));
            ctx.lineTo(lastX, lastY);
        }
        ctx.lineTo(lastX, bottomY);
        ctx.closePath();
        ctx.fill();
    }
}
exports.ProcessSummaryTrack = ProcessSummaryTrack;
//# sourceMappingURL=process_summary_track.js.map