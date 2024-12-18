"use strict";
// Copyright (C) 2018 The Android Open Source Project
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
exports.OverviewTimelinePanel = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const drag_gesture_handler_1 = require("../../base/drag_gesture_handler");
const high_precision_time_span_1 = require("../../base/high_precision_time_span");
const logging_1 = require("../../base/logging");
const time_1 = require("../../base/time");
const time_scale_1 = require("../../base/time_scale");
const utils_1 = require("../../base/utils");
const colorizer_1 = require("../../components/colorizer");
const raf_scheduler_1 = require("../../core/raf_scheduler");
const timestamp_format_1 = require("../../core/timestamp_format");
const timeline_1 = require("../../public/timeline");
const query_result_1 = require("../../trace_processor/query_result");
const css_constants_1 = require("../css_constants");
const border_drag_strategy_1 = require("../drag/border_drag_strategy");
const inner_drag_strategy_1 = require("../drag/inner_drag_strategy");
const outer_drag_strategy_1 = require("../drag/outer_drag_strategy");
const gridline_helper_1 = require("./gridline_helper");
const tracesData = new WeakMap();
class OverviewTimelinePanel {
    trace;
    static HANDLE_SIZE_PX = 5;
    kind = 'panel';
    selectable = false;
    width = 0;
    gesture;
    timeScale;
    dragStrategy;
    boundOnMouseMove = this.onMouseMove.bind(this);
    overviewData;
    constructor(trace) {
        this.trace = trace;
        this.overviewData = (0, utils_1.getOrCreate)(tracesData, trace, () => new OverviewDataLoader(trace));
    }
    // Must explicitly type now; arguments types are no longer auto-inferred.
    // https://github.com/Microsoft/TypeScript/issues/1373
    onupdate({ dom }) {
        this.width = dom.getBoundingClientRect().width;
        const traceTime = this.trace.traceInfo;
        if (this.width > css_constants_1.TRACK_SHELL_WIDTH) {
            const pxBounds = { left: css_constants_1.TRACK_SHELL_WIDTH, right: this.width };
            const hpTraceTime = high_precision_time_span_1.HighPrecisionTimeSpan.fromTime(traceTime.start, traceTime.end);
            this.timeScale = new time_scale_1.TimeScale(hpTraceTime, pxBounds);
            if (this.gesture === undefined) {
                this.gesture = new drag_gesture_handler_1.DragGestureHandler(dom, this.onDrag.bind(this), this.onDragStart.bind(this), this.onDragEnd.bind(this));
            }
        }
        else {
            this.timeScale = undefined;
        }
    }
    oncreate(vnode) {
        this.onupdate(vnode);
        vnode.dom.addEventListener('mousemove', this.boundOnMouseMove);
    }
    onremove({ dom }) {
        if (this.gesture) {
            this.gesture[Symbol.dispose]();
            this.gesture = undefined;
        }
        dom.removeEventListener('mousemove', this.boundOnMouseMove);
    }
    render() {
        return (0, mithril_1.default)('.overview-timeline', {
            oncreate: (vnode) => this.oncreate(vnode),
            onupdate: (vnode) => this.onupdate(vnode),
            onremove: (vnode) => this.onremove(vnode),
        });
    }
    renderCanvas(ctx, size) {
        if (this.width === undefined)
            return;
        if (this.timeScale === undefined)
            return;
        const headerHeight = 20;
        const tracksHeight = size.height - headerHeight;
        const traceContext = new time_1.TimeSpan(this.trace.traceInfo.start, this.trace.traceInfo.end);
        if (size.width > css_constants_1.TRACK_SHELL_WIDTH && traceContext.duration > 0n) {
            const maxMajorTicks = (0, gridline_helper_1.getMaxMajorTicks)(this.width - css_constants_1.TRACK_SHELL_WIDTH);
            const offset = this.trace.timeline.timestampOffset();
            const tickGen = (0, gridline_helper_1.generateTicks)(traceContext, maxMajorTicks, offset);
            // Draw time labels
            ctx.font = '10px Roboto Condensed';
            ctx.fillStyle = '#999';
            for (const { type, time } of tickGen) {
                const xPos = Math.floor(this.timeScale.timeToPx(time));
                if (xPos <= 0)
                    continue;
                if (xPos > this.width)
                    break;
                if (type === gridline_helper_1.TickType.MAJOR) {
                    ctx.fillRect(xPos - 1, 0, 1, headerHeight - 5);
                    const domainTime = this.trace.timeline.toDomainTime(time);
                    renderTimestamp(ctx, domainTime, xPos + 5, 18, gridline_helper_1.MIN_PX_PER_STEP);
                }
                else if (type == gridline_helper_1.TickType.MEDIUM) {
                    ctx.fillRect(xPos - 1, 0, 1, 8);
                }
                else if (type == gridline_helper_1.TickType.MINOR) {
                    ctx.fillRect(xPos - 1, 0, 1, 5);
                }
            }
        }
        // Draw mini-tracks with quanitzed density for each process.
        const overviewData = this.overviewData.overviewData;
        if (overviewData.size > 0) {
            const numTracks = overviewData.size;
            let y = 0;
            const trackHeight = (tracksHeight - 1) / numTracks;
            for (const key of overviewData.keys()) {
                const loads = overviewData.get(key);
                for (let i = 0; i < loads.length; i++) {
                    const xStart = Math.floor(this.timeScale.timeToPx(loads[i].start));
                    const xEnd = Math.ceil(this.timeScale.timeToPx(loads[i].end));
                    const yOff = Math.floor(headerHeight + y * trackHeight);
                    const lightness = Math.ceil((1 - loads[i].load * 0.7) * 100);
                    const color = (0, colorizer_1.colorForCpu)(y).setHSL({ s: 50, l: lightness });
                    ctx.fillStyle = color.cssString;
                    ctx.fillRect(xStart, yOff, xEnd - xStart, Math.ceil(trackHeight));
                }
                y++;
            }
        }
        // Draw bottom border.
        ctx.fillStyle = '#dadada';
        ctx.fillRect(0, size.height - 1, this.width, 1);
        // Draw semi-opaque rects that occlude the non-visible time range.
        const [vizStartPx, vizEndPx] = this.extractBounds(this.timeScale);
        ctx.fillStyle = css_constants_1.OVERVIEW_TIMELINE_NON_VISIBLE_COLOR;
        ctx.fillRect(css_constants_1.TRACK_SHELL_WIDTH - 1, headerHeight, vizStartPx - css_constants_1.TRACK_SHELL_WIDTH, tracksHeight);
        ctx.fillRect(vizEndPx, headerHeight, this.width - vizEndPx, tracksHeight);
        // Draw brushes.
        ctx.fillStyle = '#999';
        ctx.fillRect(vizStartPx - 1, headerHeight, 1, tracksHeight);
        ctx.fillRect(vizEndPx, headerHeight, 1, tracksHeight);
        const hbarWidth = OverviewTimelinePanel.HANDLE_SIZE_PX;
        const hbarHeight = tracksHeight * 0.4;
        // Draw handlebar
        ctx.fillRect(vizStartPx - Math.floor(hbarWidth / 2) - 1, headerHeight, hbarWidth, hbarHeight);
        ctx.fillRect(vizEndPx - Math.floor(hbarWidth / 2), headerHeight, hbarWidth, hbarHeight);
    }
    onMouseMove(e) {
        if (this.gesture === undefined || this.gesture.isDragging) {
            return;
        }
        e.target.style.cursor = this.chooseCursor(e.offsetX);
    }
    chooseCursor(x) {
        if (this.timeScale === undefined)
            return 'default';
        const [startBound, endBound] = this.extractBounds(this.timeScale);
        if (OverviewTimelinePanel.inBorderRange(x, startBound) ||
            OverviewTimelinePanel.inBorderRange(x, endBound)) {
            return 'ew-resize';
        }
        else if (x < css_constants_1.TRACK_SHELL_WIDTH) {
            return 'default';
        }
        else if (x < startBound || endBound < x) {
            return 'crosshair';
        }
        else {
            return 'all-scroll';
        }
    }
    onDrag(x) {
        if (this.dragStrategy === undefined)
            return;
        this.dragStrategy.onDrag(x);
    }
    onDragStart(x) {
        if (this.timeScale === undefined)
            return;
        const cb = (vizTime) => {
            this.trace.timeline.updateVisibleTimeHP(vizTime);
            raf_scheduler_1.raf.scheduleCanvasRedraw();
        };
        const pixelBounds = this.extractBounds(this.timeScale);
        const timeScale = this.timeScale;
        if (OverviewTimelinePanel.inBorderRange(x, pixelBounds[0]) ||
            OverviewTimelinePanel.inBorderRange(x, pixelBounds[1])) {
            this.dragStrategy = new border_drag_strategy_1.BorderDragStrategy(timeScale, pixelBounds, cb);
        }
        else if (x < pixelBounds[0] || pixelBounds[1] < x) {
            this.dragStrategy = new outer_drag_strategy_1.OuterDragStrategy(timeScale, cb);
        }
        else {
            this.dragStrategy = new inner_drag_strategy_1.InnerDragStrategy(timeScale, pixelBounds, cb);
        }
        this.dragStrategy.onDragStart(x);
    }
    onDragEnd() {
        this.dragStrategy = undefined;
    }
    extractBounds(timeScale) {
        const vizTime = this.trace.timeline.visibleWindow;
        return [
            Math.floor(timeScale.hpTimeToPx(vizTime.start)),
            Math.ceil(timeScale.hpTimeToPx(vizTime.end)),
        ];
    }
    static inBorderRange(a, b) {
        return Math.abs(a - b) < this.HANDLE_SIZE_PX / 2;
    }
}
exports.OverviewTimelinePanel = OverviewTimelinePanel;
// Print a timestamp in the configured time format
function renderTimestamp(ctx, time, x, y, minWidth) {
    const fmt = (0, timestamp_format_1.timestampFormat)();
    switch (fmt) {
        case timeline_1.TimestampFormat.UTC:
        case timeline_1.TimestampFormat.TraceTz:
        case timeline_1.TimestampFormat.Timecode:
            renderTimecode(ctx, time, x, y, minWidth);
            break;
        case timeline_1.TimestampFormat.TraceNs:
            ctx.fillText(time.toString(), x, y, minWidth);
            break;
        case timeline_1.TimestampFormat.TraceNsLocale:
            ctx.fillText(time.toLocaleString(), x, y, minWidth);
            break;
        case timeline_1.TimestampFormat.Seconds:
            ctx.fillText(time_1.Time.formatSeconds(time), x, y, minWidth);
            break;
        case timeline_1.TimestampFormat.Milliseconds:
            ctx.fillText(time_1.Time.formatMilliseconds(time), x, y, minWidth);
            break;
        case timeline_1.TimestampFormat.Microseconds:
            ctx.fillText(time_1.Time.formatMicroseconds(time), x, y, minWidth);
            break;
        default:
            (0, logging_1.assertUnreachable)(fmt);
    }
}
// Print a timecode over 2 lines with this formatting:
// DdHH:MM:SS
// mmm uuu nnn
function renderTimecode(ctx, time, x, y, minWidth) {
    const timecode = time_1.Time.toTimecode(time);
    const { dhhmmss } = timecode;
    ctx.fillText(dhhmmss, x, y, minWidth);
}
// Kicks of a sequence of promises that load the overiew data in steps.
// Each step schedules an animation frame.
class OverviewDataLoader {
    trace;
    overviewData = new Map();
    constructor(trace) {
        this.trace = trace;
        this.beginLoad();
    }
    async beginLoad() {
        const traceSpan = new time_1.TimeSpan(this.trace.traceInfo.start, this.trace.traceInfo.end);
        const engine = this.trace.engine;
        const stepSize = time_1.Duration.max(1n, traceSpan.duration / 100n);
        const hasSchedSql = 'select ts from sched limit 1';
        const hasSchedOverview = (await engine.query(hasSchedSql)).numRows() > 0;
        if (hasSchedOverview) {
            await this.loadSchedOverview(traceSpan, stepSize);
        }
        else {
            await this.loadSliceOverview(traceSpan, stepSize);
        }
    }
    async loadSchedOverview(traceSpan, stepSize) {
        const stepPromises = [];
        for (let start = traceSpan.start; start < traceSpan.end; start = time_1.Time.add(start, stepSize)) {
            const progress = start - traceSpan.start;
            const ratio = Number(progress) / Number(traceSpan.duration);
            this.trace.omnibox.showStatusMessage('Loading overview ' + `${Math.round(ratio * 100)}%`);
            const end = time_1.Time.add(start, stepSize);
            // The (async() => {})() queues all the 100 async promises in one batch.
            // Without that, we would wait for each step to be rendered before
            // kicking off the next one. That would interleave an animation frame
            // between each step, slowing down significantly the overall process.
            stepPromises.push((async () => {
                const schedResult = await this.trace.engine.query(`select cast(sum(dur) as float)/${stepSize} as load, cpu from sched ` +
                    `where ts >= ${start} and ts < ${end} and utid != 0 ` +
                    'group by cpu order by cpu');
                const schedData = {};
                const it = schedResult.iter({ load: query_result_1.NUM, cpu: query_result_1.NUM });
                for (; it.valid(); it.next()) {
                    const load = it.load;
                    const cpu = it.cpu;
                    schedData[cpu] = { start, end, load };
                }
                this.appendData(schedData);
            })());
        } // for(start = ...)
        await Promise.all(stepPromises);
    }
    async loadSliceOverview(traceSpan, stepSize) {
        // Slices overview.
        const sliceResult = await this.trace.engine.query(`select
            bucket,
            upid,
            ifnull(sum(utid_sum) / cast(${stepSize} as float), 0) as load
          from thread
          inner join (
            select
              ifnull(cast((ts - ${traceSpan.start})/${stepSize} as int), 0) as bucket,
              sum(dur) as utid_sum,
              utid
            from slice
            inner join thread_track on slice.track_id = thread_track.id
            group by bucket, utid
          ) using(utid)
          where upid is not null
          group by bucket, upid`);
        const slicesData = {};
        const it = sliceResult.iter({ bucket: query_result_1.LONG, upid: query_result_1.NUM, load: query_result_1.NUM });
        for (; it.valid(); it.next()) {
            const bucket = it.bucket;
            const upid = it.upid;
            const load = it.load;
            const start = time_1.Time.add(traceSpan.start, stepSize * bucket);
            const end = time_1.Time.add(start, stepSize);
            const upidStr = upid.toString();
            let loadArray = slicesData[upidStr];
            if (loadArray === undefined) {
                loadArray = slicesData[upidStr] = [];
            }
            loadArray.push({ start, end, load });
        }
        this.appendData(slicesData);
    }
    appendData(data) {
        for (const [key, value] of Object.entries(data)) {
            if (!this.overviewData.has(key)) {
                this.overviewData.set(key, []);
            }
            if (value instanceof Array) {
                this.overviewData.get(key).push(...value);
            }
            else {
                this.overviewData.get(key).push(value);
            }
        }
        raf_scheduler_1.raf.scheduleCanvasRedraw();
    }
}
//# sourceMappingURL=overview_timeline_panel.js.map