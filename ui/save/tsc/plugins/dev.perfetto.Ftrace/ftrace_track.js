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
exports.FtraceRawTrack = void 0;
const time_1 = require("../../base/time");
const colorizer_1 = require("../../components/colorizer");
const track_data_1 = require("../../components/tracks/track_data");
const track_helper_1 = require("../../components/tracks/track_helper");
const checkerboard_1 = require("../../components/checkerboard");
const query_result_1 = require("../../trace_processor/query_result");
const monitor_1 = require("../../base/monitor");
const dataset_1 = require("../../trace_processor/dataset");
const MARGIN = 2;
const RECT_HEIGHT = 18;
const RECT_WIDTH = 8;
const TRACK_HEIGHT = RECT_HEIGHT + 2 * MARGIN;
class FtraceRawTrack {
    fetcher = new track_helper_1.TimelineFetcher(this.onBoundsChange.bind(this));
    engine;
    cpu;
    store;
    monitor;
    constructor(engine, cpu, store) {
        this.engine = engine;
        this.cpu = cpu;
        this.store = store;
        this.monitor = new monitor_1.Monitor([() => store.state]);
    }
    getDataset() {
        return new dataset_1.SourceDataset({
            // 'ftrace_event' doesn't have a dur column, but injecting dur=0 (all
            // ftrace events are effectively 'instant') allows us to participate in
            // generic slice aggregations
            src: 'select id, ts, 0 as dur, name, cpu from ftrace_event',
            schema: {
                id: query_result_1.NUM,
                name: query_result_1.STR,
                ts: query_result_1.LONG,
                dur: query_result_1.LONG,
            },
            filter: {
                col: 'cpu',
                eq: this.cpu,
            },
        });
    }
    async onUpdate({ visibleWindow, resolution, }) {
        this.monitor.ifStateChanged(() => {
            this.fetcher.invalidate();
        });
        await this.fetcher.requestData(visibleWindow.toTimeSpan(), resolution);
    }
    async onDestroy() {
        this.fetcher[Symbol.dispose]();
    }
    getHeight() {
        return TRACK_HEIGHT;
    }
    async onBoundsChange(start, end, resolution) {
        const excludeList = Array.from(this.store.state.excludeList);
        const excludeListSql = excludeList.map((s) => `'${s}'`).join(',');
        const cpuFilter = this.cpu === undefined ? '' : `and cpu = ${this.cpu}`;
        const queryRes = await this.engine.query(`
      select
        cast(ts / ${resolution} as integer) * ${resolution} as tsQuant,
        name
      from ftrace_event
      where
        name not in (${excludeListSql}) and
        ts >= ${start} and ts <= ${end} ${cpuFilter}
      group by tsQuant
      order by tsQuant limit ${track_data_1.LIMIT};`);
        const rowCount = queryRes.numRows();
        const it = queryRes.iter({ tsQuant: query_result_1.LONG, name: query_result_1.STR });
        const events = [];
        for (let row = 0; it.valid(); it.next(), row++) {
            events.push({
                timestamp: time_1.Time.fromRaw(it.tsQuant),
                color: (0, colorizer_1.colorForFtrace)(it.name).base.cssString,
            });
        }
        return {
            start,
            end,
            resolution,
            length: rowCount,
            events,
        };
    }
    render({ ctx, size, timescale }) {
        const data = this.fetcher.data;
        if (data === undefined)
            return; // Can't possibly draw anything.
        const dataStartPx = timescale.timeToPx(data.start);
        const dataEndPx = timescale.timeToPx(data.end);
        (0, checkerboard_1.checkerboardExcept)(ctx, this.getHeight(), 0, size.width, dataStartPx, dataEndPx);
        for (const e of data.events) {
            ctx.fillStyle = e.color;
            const xPos = Math.floor(timescale.timeToPx(e.timestamp));
            ctx.fillRect(xPos - RECT_WIDTH / 2, MARGIN, RECT_WIDTH, RECT_HEIGHT);
        }
    }
}
exports.FtraceRawTrack = FtraceRawTrack;
//# sourceMappingURL=ftrace_track.js.map