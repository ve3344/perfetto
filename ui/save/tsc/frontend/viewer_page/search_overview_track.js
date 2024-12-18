"use strict";
// Copyright (C) 2024 The Android Open Source Project
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use size file except in compliance with the License.
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
exports.SearchOverviewTrack = void 0;
const async_limiter_1 = require("../../base/async_limiter");
const disposable_stack_1 = require("../../base/disposable_stack");
const time_1 = require("../../base/time");
const time_scale_1 = require("../../base/time_scale");
const query_result_1 = require("../../trace_processor/query_result");
const query_utils_1 = require("../../trace_processor/query_utils");
const sql_utils_1 = require("../../trace_processor/sql_utils");
const resolution_1 = require("./resolution");
/**
 * This component is drawn on top of the timeline and creates small yellow
 * rectangles that highlight the time span of search results (similarly to what
 * Chrome does on the scrollbar when you Ctrl+F and type a search term).
 * It reacts to changes in SearchManager and queries the quantized ranges of the
 * search results.
 */
class SearchOverviewTrack {
    trash = new disposable_stack_1.AsyncDisposableStack();
    trace;
    limiter = new async_limiter_1.AsyncLimiter();
    initialized = false;
    previousResolution;
    previousSpan;
    previousSearchGeneration = 0;
    searchSummary;
    constructor(trace) {
        this.trace = trace;
    }
    render(ctx, size) {
        this.maybeUpdate(size);
        this.renderSearchOverview(ctx, size);
    }
    async initialize() {
        const engine = this.trace.engine;
        this.trash.use(await (0, sql_utils_1.createVirtualTable)(engine, 'search_summary_window', 'window'));
        this.trash.use(await (0, sql_utils_1.createVirtualTable)(engine, 'search_summary_sched_span', 'span_join(sched PARTITIONED cpu, search_summary_window)'));
        this.trash.use(await (0, sql_utils_1.createVirtualTable)(engine, 'search_summary_slice_span', 'span_join(slice PARTITIONED track_id, search_summary_window)'));
    }
    async update(search, start, end, resolution) {
        if (!this.initialized) {
            this.initialized = true;
            await this.initialize();
        }
        const searchLiteral = (0, query_utils_1.escapeSearchQuery)(search);
        const resolutionScalingFactor = 10n;
        const quantum = resolution * resolutionScalingFactor;
        start = time_1.Time.quantFloor(start, quantum);
        const windowDur = time_1.Duration.max(time_1.Time.diff(end, start), 1n);
        const engine = this.trace.engine;
        await engine.query(`update search_summary_window set
      window_start=${start},
      window_dur=${windowDur},
      quantum=${quantum}
      where rowid = 0;`);
        const utidRes = await engine.query(`select utid from thread join process
      using(upid) where thread.name glob ${searchLiteral}
      or process.name glob ${searchLiteral}`);
        const utids = [];
        for (const it = utidRes.iter({ utid: query_result_1.NUM }); it.valid(); it.next()) {
            utids.push(it.utid);
        }
        const res = await engine.query(`
        select
          (quantum_ts * ${quantum} + ${start}) as tsStart,
          ((quantum_ts+1) * ${quantum} + ${start}) as tsEnd,
          min(count(*), 255) as count
          from (
              select
              quantum_ts
              from search_summary_sched_span
              where utid in (${utids.join(',')})
            union all
              select
              quantum_ts
              from search_summary_slice_span
              where name glob ${searchLiteral}
          )
          group by quantum_ts
          order by quantum_ts;`);
        const numRows = res.numRows();
        const summary = {
            tsStarts: new BigInt64Array(numRows),
            tsEnds: new BigInt64Array(numRows),
            count: new Uint8Array(numRows),
        };
        const it = res.iter({ tsStart: query_result_1.LONG, tsEnd: query_result_1.LONG, count: query_result_1.NUM });
        for (let row = 0; it.valid(); it.next(), ++row) {
            summary.tsStarts[row] = it.tsStart;
            summary.tsEnds[row] = it.tsEnd;
            summary.count[row] = it.count;
        }
        return summary;
    }
    maybeUpdate(size) {
        const searchManager = this.trace.search;
        const timeline = this.trace.timeline;
        if (!searchManager.hasResults) {
            return;
        }
        const newSpan = timeline.visibleWindow;
        const newSearchGeneration = searchManager.searchGeneration;
        const newResolution = (0, resolution_1.calculateResolution)(newSpan, size.width);
        const newTimeSpan = newSpan.toTimeSpan();
        if (this.previousSpan?.containsSpan(newTimeSpan.start, newTimeSpan.end) &&
            this.previousResolution === newResolution &&
            this.previousSearchGeneration === newSearchGeneration) {
            return;
        }
        // TODO(hjd): We should restrict this to the start of the trace but
        // that is not easily available here.
        // N.B. Timestamps can be negative.
        const { start, end } = newTimeSpan.pad(newTimeSpan.duration);
        this.previousSpan = new time_1.TimeSpan(start, end);
        this.previousResolution = newResolution;
        this.previousSearchGeneration = newSearchGeneration;
        const search = searchManager.searchText;
        if (search === '') {
            this.searchSummary = {
                tsStarts: new BigInt64Array(0),
                tsEnds: new BigInt64Array(0),
                count: new Uint8Array(0),
            };
            return;
        }
        this.limiter.schedule(async () => {
            const summary = await this.update(searchManager.searchText, start, end, newResolution);
            this.searchSummary = summary;
        });
    }
    renderSearchOverview(ctx, size) {
        const visibleWindow = this.trace.timeline.visibleWindow;
        const timescale = new time_scale_1.TimeScale(visibleWindow, {
            left: 0,
            right: size.width,
        });
        if (!this.searchSummary)
            return;
        for (let i = 0; i < this.searchSummary.tsStarts.length; i++) {
            const tStart = time_1.Time.fromRaw(this.searchSummary.tsStarts[i]);
            const tEnd = time_1.Time.fromRaw(this.searchSummary.tsEnds[i]);
            if (!visibleWindow.overlaps(tStart, tEnd)) {
                continue;
            }
            const rectStart = Math.max(timescale.timeToPx(tStart), 0);
            const rectEnd = timescale.timeToPx(tEnd);
            ctx.fillStyle = '#ffe263';
            ctx.fillRect(Math.floor(rectStart), 0, Math.ceil(rectEnd - rectStart), size.height);
        }
        const results = this.trace.search.searchResults;
        if (results === undefined) {
            return;
        }
        const index = this.trace.search.resultIndex;
        if (index !== -1 && index < results.tses.length) {
            const start = results.tses[index];
            if (start !== -1n) {
                const triangleStart = Math.max(timescale.timeToPx(time_1.Time.fromRaw(start)), 0);
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.moveTo(triangleStart, size.height);
                ctx.lineTo(triangleStart - 3, 0);
                ctx.lineTo(triangleStart + 3, 0);
                ctx.lineTo(triangleStart, size.height);
                ctx.fill();
                ctx.closePath();
            }
        }
        ctx.restore();
    }
    async [Symbol.asyncDispose]() {
        return await this.trash.asyncDispose();
    }
}
exports.SearchOverviewTrack = SearchOverviewTrack;
//# sourceMappingURL=search_overview_track.js.map