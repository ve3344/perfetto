"use strict";
// Copyright (C) 2018 The Android Open Source Project
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
exports.TimeAxisPanel = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const canvas_utils_1 = require("../../base/canvas_utils");
const logging_1 = require("../../base/logging");
const time_1 = require("../../base/time");
const time_scale_1 = require("../../base/time_scale");
const timestamp_format_1 = require("../../core/timestamp_format");
const timeline_1 = require("../../public/timeline");
const css_constants_1 = require("../css_constants");
const gridline_helper_1 = require("./gridline_helper");
class TimeAxisPanel {
    trace;
    kind = 'panel';
    selectable = false;
    id = 'time-axis-panel';
    constructor(trace) {
        this.trace = trace;
    }
    render() {
        return (0, mithril_1.default)('.time-axis-panel');
    }
    renderCanvas(ctx, size) {
        ctx.fillStyle = '#999';
        ctx.textAlign = 'left';
        ctx.font = '11px Roboto Condensed';
        this.renderOffsetTimestamp(ctx);
        const trackSize = { ...size, width: size.width - css_constants_1.TRACK_SHELL_WIDTH };
        ctx.save();
        ctx.translate(css_constants_1.TRACK_SHELL_WIDTH, 0);
        (0, canvas_utils_1.canvasClip)(ctx, 0, 0, trackSize.width, trackSize.height);
        this.renderPanel(ctx, trackSize);
        ctx.restore();
        ctx.fillRect(css_constants_1.TRACK_SHELL_WIDTH - 2, 0, 2, size.height);
    }
    renderOffsetTimestamp(ctx) {
        const offset = this.trace.timeline.timestampOffset();
        const timestampFormat = this.trace.timeline.timestampFormat;
        switch (timestampFormat) {
            case timeline_1.TimestampFormat.TraceNs:
            case timeline_1.TimestampFormat.TraceNsLocale:
                break;
            case timeline_1.TimestampFormat.Seconds:
            case timeline_1.TimestampFormat.Milliseconds:
            case timeline_1.TimestampFormat.Microseconds:
            case timeline_1.TimestampFormat.Timecode:
                const width = renderTimestamp(ctx, offset, 6, 10, gridline_helper_1.MIN_PX_PER_STEP);
                ctx.fillText('+', 6 + width + 2, 10, 6);
                break;
            case timeline_1.TimestampFormat.UTC:
                const offsetDate = time_1.Time.toDate(this.trace.traceInfo.utcOffset, this.trace.traceInfo.realtimeOffset);
                const dateStr = (0, time_1.toISODateOnly)(offsetDate);
                ctx.fillText(`UTC ${dateStr}`, 6, 10);
                break;
            case timeline_1.TimestampFormat.TraceTz:
                const offsetTzDate = time_1.Time.toDate(this.trace.traceInfo.traceTzOffset, this.trace.traceInfo.realtimeOffset);
                const dateTzStr = (0, time_1.toISODateOnly)(offsetTzDate);
                ctx.fillText(dateTzStr, 6, 10);
                break;
            default:
                (0, logging_1.assertUnreachable)(timestampFormat);
        }
    }
    renderPanel(ctx, size) {
        const visibleWindow = this.trace.timeline.visibleWindow;
        const timescale = new time_scale_1.TimeScale(visibleWindow, {
            left: 0,
            right: size.width,
        });
        const timespan = visibleWindow.toTimeSpan();
        const offset = this.trace.timeline.timestampOffset();
        // Draw time axis.
        if (size.width > 0 && timespan.duration > 0n) {
            const maxMajorTicks = (0, gridline_helper_1.getMaxMajorTicks)(size.width);
            const tickGen = (0, gridline_helper_1.generateTicks)(timespan, maxMajorTicks, offset);
            for (const { type, time } of tickGen) {
                if (type === gridline_helper_1.TickType.MAJOR) {
                    const position = Math.floor(timescale.timeToPx(time));
                    ctx.fillRect(position, 0, 1, size.height);
                    const domainTime = this.trace.timeline.toDomainTime(time);
                    renderTimestamp(ctx, domainTime, position + 5, 10, gridline_helper_1.MIN_PX_PER_STEP);
                }
            }
        }
    }
}
exports.TimeAxisPanel = TimeAxisPanel;
function renderTimestamp(ctx, time, x, y, minWidth) {
    const fmt = (0, timestamp_format_1.timestampFormat)();
    switch (fmt) {
        case timeline_1.TimestampFormat.UTC:
        case timeline_1.TimestampFormat.TraceTz:
        case timeline_1.TimestampFormat.Timecode:
            return renderTimecode(ctx, time, x, y, minWidth);
        case timeline_1.TimestampFormat.TraceNs:
            return renderRawTimestamp(ctx, time.toString(), x, y, minWidth);
        case timeline_1.TimestampFormat.TraceNsLocale:
            return renderRawTimestamp(ctx, time.toLocaleString(), x, y, minWidth);
        case timeline_1.TimestampFormat.Seconds:
            return renderRawTimestamp(ctx, time_1.Time.formatSeconds(time), x, y, minWidth);
        case timeline_1.TimestampFormat.Milliseconds:
            return renderRawTimestamp(ctx, time_1.Time.formatMilliseconds(time), x, y, minWidth);
        case timeline_1.TimestampFormat.Microseconds:
            return renderRawTimestamp(ctx, time_1.Time.formatMicroseconds(time), x, y, minWidth);
        default:
            const z = fmt;
            throw new Error(`Invalid timestamp ${z}`);
    }
}
// Print a time on the canvas in raw format.
function renderRawTimestamp(ctx, time, x, y, minWidth) {
    ctx.font = '11px Roboto Condensed';
    ctx.fillText(time, x, y, minWidth);
    return ctx.measureText(time).width;
}
// Print a timecode over 2 lines with this formatting:
// DdHH:MM:SS
// mmm uuu nnn
// Returns the resultant width of the timecode.
function renderTimecode(ctx, time, x, y, minWidth) {
    const timecode = time_1.Time.toTimecode(time);
    ctx.font = '11px Roboto Condensed';
    const { dhhmmss } = timecode;
    const thinSpace = '\u2009';
    const subsec = timecode.subsec(thinSpace);
    ctx.fillText(dhhmmss, x, y, minWidth);
    const { width: firstRowWidth } = ctx.measureText(subsec);
    ctx.font = '10.5px Roboto Condensed';
    ctx.fillText(subsec, x, y + 10, minWidth);
    const { width: secondRowWidth } = ctx.measureText(subsec);
    return Math.max(firstRowWidth, secondRowWidth);
}
//# sourceMappingURL=time_axis_panel.js.map