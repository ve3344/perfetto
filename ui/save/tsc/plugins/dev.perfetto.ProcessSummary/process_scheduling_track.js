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
exports.ProcessSchedulingTrack = exports.PROCESS_SCHEDULING_TRACK_KIND = void 0;
const bigint_math_1 = require("../../base/bigint_math");
const binary_search_1 = require("../../base/binary_search");
const logging_1 = require("../../base/logging");
const time_1 = require("../../base/time");
const canvas_utils_1 = require("../../base/canvas_utils");
const colorizer_1 = require("../../components/colorizer");
const track_helper_1 = require("../../components/tracks/track_helper");
const checkerboard_1 = require("../../components/checkerboard");
const query_result_1 = require("../../trace_processor/query_result");
const uuid_1 = require("../../base/uuid");
exports.PROCESS_SCHEDULING_TRACK_KIND = 'ProcessSchedulingTrack';
const MARGIN_TOP = 5;
const RECT_HEIGHT = 30;
const TRACK_HEIGHT = MARGIN_TOP * 2 + RECT_HEIGHT;
class ProcessSchedulingTrack {
    trace;
    config;
    cpuCount;
    threads;
    mousePos;
    utidHoveredInThisTrack = -1;
    fetcher = new track_helper_1.TimelineFetcher(this.onBoundsChange.bind(this));
    trackUuid = (0, uuid_1.uuidv4Sql)();
    constructor(trace, config, cpuCount, threads) {
        this.trace = trace;
        this.config = config;
        this.cpuCount = cpuCount;
        this.threads = threads;
    }
    async onCreate() {
        if (this.config.upid !== null) {
            await this.trace.engine.query(`
        create virtual table process_scheduling_${this.trackUuid}
        using __intrinsic_slice_mipmap((
          select
            id,
            ts,
            iif(
              dur = -1,
              lead(ts, 1, trace_end()) over (partition by cpu order by ts) - ts,
              dur
            ) as dur,
            cpu as depth
          from experimental_sched_upid
          where
            utid != 0 and
            upid = ${this.config.upid}
        ));
      `);
        }
        else {
            (0, logging_1.assertExists)(this.config.utid);
            await this.trace.engine.query(`
        create virtual table process_scheduling_${this.trackUuid}
        using __intrinsic_slice_mipmap((
          select
            id,
            ts,
            iif(
              dur = -1,
              lead(ts, 1, trace_end()) over (partition by cpu order by ts) - ts,
              dur
            ) as dur,
            cpu as depth
          from sched
          where utid = ${this.config.utid}
        ));
      `);
        }
    }
    async onUpdate({ visibleWindow, resolution, }) {
        await this.fetcher.requestData(visibleWindow.toTimeSpan(), resolution);
    }
    async onDestroy() {
        this.fetcher[Symbol.dispose]();
        await this.trace.engine.tryQuery(`
      drop table process_scheduling_${this.trackUuid}
    `);
    }
    async onBoundsChange(start, end, resolution) {
        // Resolution must always be a power of 2 for this logic to work
        (0, logging_1.assertTrue)(bigint_math_1.BigintMath.popcount(resolution) === 1, `${resolution} not pow of 2`);
        const queryRes = await this.queryData(start, end, resolution);
        const numRows = queryRes.numRows();
        const slices = {
            kind: 'slice',
            start,
            end,
            resolution,
            length: numRows,
            maxCpu: this.cpuCount,
            starts: new BigInt64Array(numRows),
            ends: new BigInt64Array(numRows),
            cpus: new Uint32Array(numRows),
            utids: new Uint32Array(numRows),
        };
        const it = queryRes.iter({
            ts: query_result_1.LONG,
            dur: query_result_1.LONG,
            cpu: query_result_1.NUM,
            utid: query_result_1.NUM,
        });
        for (let row = 0; it.valid(); it.next(), row++) {
            const start = time_1.Time.fromRaw(it.ts);
            const dur = it.dur;
            const end = time_1.Time.add(start, dur);
            slices.starts[row] = start;
            slices.ends[row] = end;
            slices.cpus[row] = it.cpu;
            slices.utids[row] = it.utid;
            slices.end = time_1.Time.max(end, slices.end);
        }
        return slices;
    }
    async queryData(start, end, bucketSize) {
        return this.trace.engine.query(`
      select
        (z.ts / ${bucketSize}) * ${bucketSize} as ts,
        iif(s.dur = -1, s.dur, max(z.dur, ${bucketSize})) as dur,
        s.id,
        z.depth as cpu,
        utid
      from process_scheduling_${this.trackUuid}(
        ${start}, ${end}, ${bucketSize}
      ) z
      cross join sched s using (id)
    `);
    }
    getHeight() {
        return TRACK_HEIGHT;
    }
    render({ ctx, size, timescale, visibleWindow }) {
        // TODO: fonts and colors should come from the CSS and not hardcoded here.
        const data = this.fetcher.data;
        if (data === undefined)
            return; // Can't possibly draw anything.
        // If the cached trace slices don't fully cover the visible time range,
        // show a gray rectangle with a "Loading..." label.
        (0, checkerboard_1.checkerboardExcept)(ctx, this.getHeight(), 0, size.width, timescale.timeToPx(data.start), timescale.timeToPx(data.end));
        (0, logging_1.assertTrue)(data.starts.length === data.ends.length);
        (0, logging_1.assertTrue)(data.starts.length === data.utids.length);
        const cpuTrackHeight = Math.floor(RECT_HEIGHT / data.maxCpu);
        for (let i = 0; i < data.ends.length; i++) {
            const tStart = time_1.Time.fromRaw(data.starts[i]);
            const tEnd = time_1.Time.fromRaw(data.ends[i]);
            // Cull slices that lie completely outside the visible window
            if (!visibleWindow.overlaps(tStart, tEnd))
                continue;
            const utid = data.utids[i];
            const cpu = data.cpus[i];
            const rectStart = Math.floor(timescale.timeToPx(tStart));
            const rectEnd = Math.floor(timescale.timeToPx(tEnd));
            const rectWidth = Math.max(1, rectEnd - rectStart);
            const threadInfo = this.threads.get(utid);
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            const pid = (threadInfo ? threadInfo.pid : -1) || -1;
            const isHovering = this.trace.timeline.hoveredUtid !== undefined;
            const isThreadHovered = this.trace.timeline.hoveredUtid === utid;
            const isProcessHovered = this.trace.timeline.hoveredPid === pid;
            const colorScheme = (0, colorizer_1.colorForThread)(threadInfo);
            let color;
            if (isHovering && !isThreadHovered) {
                if (!isProcessHovered) {
                    color = colorScheme.disabled;
                }
                else {
                    color = colorScheme.variant;
                }
            }
            else {
                color = colorScheme.base;
            }
            ctx.fillStyle = color.cssString;
            const y = MARGIN_TOP + cpuTrackHeight * cpu + cpu;
            ctx.fillRect(rectStart, y, rectWidth, cpuTrackHeight);
        }
        const hoveredThread = this.threads.get(this.utidHoveredInThisTrack);
        if (hoveredThread !== undefined && this.mousePos !== undefined) {
            const tidText = `T: ${hoveredThread.threadName} [${hoveredThread.tid}]`;
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            if (hoveredThread.pid) {
                const pidText = `P: ${hoveredThread.procName} [${hoveredThread.pid}]`;
                (0, canvas_utils_1.drawTrackHoverTooltip)(ctx, this.mousePos, size, pidText, tidText);
            }
            else {
                (0, canvas_utils_1.drawTrackHoverTooltip)(ctx, this.mousePos, size, tidText);
            }
        }
    }
    onMouseMove({ x, y, timescale }) {
        const data = this.fetcher.data;
        this.mousePos = { x, y };
        if (data === undefined)
            return;
        if (y < MARGIN_TOP || y > MARGIN_TOP + RECT_HEIGHT) {
            this.utidHoveredInThisTrack = -1;
            this.trace.timeline.hoveredUtid = undefined;
            this.trace.timeline.hoveredPid = undefined;
            return;
        }
        const cpuTrackHeight = Math.floor(RECT_HEIGHT / data.maxCpu);
        const cpu = Math.floor((y - MARGIN_TOP) / (cpuTrackHeight + 1));
        const t = timescale.pxToHpTime(x).toTime('floor');
        const [i, j] = (0, binary_search_1.searchRange)(data.starts, t, (0, binary_search_1.searchEq)(data.cpus, cpu));
        if (i === j || i >= data.starts.length || t > data.ends[i]) {
            this.utidHoveredInThisTrack = -1;
            this.trace.timeline.hoveredUtid = undefined;
            this.trace.timeline.hoveredPid = undefined;
            return;
        }
        const utid = data.utids[i];
        this.utidHoveredInThisTrack = utid;
        const threadInfo = this.threads.get(utid);
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        const pid = threadInfo ? (threadInfo.pid ? threadInfo.pid : -1) : -1;
        this.trace.timeline.hoveredUtid = utid;
        this.trace.timeline.hoveredPid = pid;
    }
    onMouseOut() {
        this.utidHoveredInThisTrack = -1;
        this.trace.timeline.hoveredUtid = undefined;
        this.trace.timeline.hoveredPid = undefined;
        this.mousePos = undefined;
    }
}
exports.ProcessSchedulingTrack = ProcessSchedulingTrack;
//# sourceMappingURL=process_scheduling_track.js.map