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
exports.TimelineImpl = void 0;
const logging_1 = require("../base/logging");
const time_1 = require("../base/time");
const high_precision_time_span_1 = require("../base/high_precision_time_span");
const raf_scheduler_1 = require("./raf_scheduler");
const high_precision_time_1 = require("../base/high_precision_time");
const timeline_1 = require("../public/timeline");
const timestamp_format_1 = require("./timestamp_format");
const MIN_DURATION = 10;
/**
 * State that is shared between several frontend components, but not the
 * controller. This state is updated at 60fps.
 */
class TimelineImpl {
    traceInfo;
    _visibleWindow;
    _hoverCursorTimestamp;
    _highlightedSliceId;
    _hoveredNoteTimestamp;
    // TODO(stevegolton): These are currently only referenced by the cpu slice
    // tracks and the process summary tracks. We should just make this a local
    // property of the cpu slice tracks and ignore them in the process tracks.
    _hoveredUtid;
    _hoveredPid;
    get highlightedSliceId() {
        return this._highlightedSliceId;
    }
    set highlightedSliceId(x) {
        this._highlightedSliceId = x;
        raf_scheduler_1.raf.scheduleCanvasRedraw();
    }
    get hoveredNoteTimestamp() {
        return this._hoveredNoteTimestamp;
    }
    set hoveredNoteTimestamp(x) {
        this._hoveredNoteTimestamp = x;
        raf_scheduler_1.raf.scheduleCanvasRedraw();
    }
    get hoveredUtid() {
        return this._hoveredUtid;
    }
    set hoveredUtid(x) {
        this._hoveredUtid = x;
        raf_scheduler_1.raf.scheduleCanvasRedraw();
    }
    get hoveredPid() {
        return this._hoveredPid;
    }
    set hoveredPid(x) {
        this._hoveredPid = x;
        raf_scheduler_1.raf.scheduleCanvasRedraw();
    }
    // This is used to calculate the tracks within a Y range for area selection.
    _selectedArea;
    constructor(traceInfo) {
        this.traceInfo = traceInfo;
        this._visibleWindow = high_precision_time_span_1.HighPrecisionTimeSpan.fromTime(traceInfo.start, traceInfo.end);
    }
    // TODO: there is some redundancy in the fact that both |visibleWindowTime|
    // and a |timeScale| have a notion of time range. That should live in one
    // place only.
    zoomVisibleWindow(ratio, centerPoint) {
        this._visibleWindow = this._visibleWindow
            .scale(ratio, centerPoint, MIN_DURATION)
            .fitWithin(this.traceInfo.start, this.traceInfo.end);
        raf_scheduler_1.raf.scheduleCanvasRedraw();
    }
    panVisibleWindow(delta) {
        this._visibleWindow = this._visibleWindow
            .translate(delta)
            .fitWithin(this.traceInfo.start, this.traceInfo.end);
        raf_scheduler_1.raf.scheduleCanvasRedraw();
    }
    // Given a timestamp, if |ts| is not currently in view move the view to
    // center |ts|, keeping the same zoom level.
    panToTimestamp(ts) {
        if (this._visibleWindow.contains(ts))
            return;
        // TODO(hjd): This is an ugly jump, we should do a smooth pan instead.
        const halfDuration = this.visibleWindow.duration / 2;
        const newStart = new high_precision_time_1.HighPrecisionTime(ts).subNumber(halfDuration);
        const newWindow = new high_precision_time_span_1.HighPrecisionTimeSpan(newStart, this._visibleWindow.duration);
        this.updateVisibleTimeHP(newWindow);
    }
    // Set the highlight box to draw
    selectArea(start, end, tracks = this._selectedArea ? this._selectedArea.trackUris : []) {
        (0, logging_1.assertTrue)(end >= start, `Impossible select area: start [${start}] >= end [${end}]`);
        this._selectedArea = { start, end, trackUris: tracks };
        raf_scheduler_1.raf.scheduleFullRedraw();
    }
    deselectArea() {
        this._selectedArea = undefined;
        raf_scheduler_1.raf.scheduleCanvasRedraw();
    }
    get selectedArea() {
        return this._selectedArea;
    }
    // Set visible window using an integer time span
    updateVisibleTime(ts) {
        this.updateVisibleTimeHP(high_precision_time_span_1.HighPrecisionTimeSpan.fromTime(ts.start, ts.end));
    }
    // TODO(primiano): we ended up with two entry-points for the same function,
    // unify them.
    setViewportTime(start, end) {
        this.updateVisibleTime(new time_1.TimeSpan(start, end));
    }
    // Set visible window using a high precision time span
    updateVisibleTimeHP(ts) {
        this._visibleWindow = ts
            .clampDuration(MIN_DURATION)
            .fitWithin(this.traceInfo.start, this.traceInfo.end);
        raf_scheduler_1.raf.scheduleCanvasRedraw();
    }
    // Get the bounds of the visible window as a high-precision time span
    get visibleWindow() {
        return this._visibleWindow;
    }
    get hoverCursorTimestamp() {
        return this._hoverCursorTimestamp;
    }
    set hoverCursorTimestamp(t) {
        this._hoverCursorTimestamp = t;
        raf_scheduler_1.raf.scheduleCanvasRedraw();
    }
    // Offset between t=0 and the configured time domain.
    timestampOffset() {
        const fmt = (0, timestamp_format_1.timestampFormat)();
        switch (fmt) {
            case timeline_1.TimestampFormat.Timecode:
            case timeline_1.TimestampFormat.Seconds:
            case timeline_1.TimestampFormat.Milliseconds:
            case timeline_1.TimestampFormat.Microseconds:
                return this.traceInfo.start;
            case timeline_1.TimestampFormat.TraceNs:
            case timeline_1.TimestampFormat.TraceNsLocale:
                return time_1.Time.ZERO;
            case timeline_1.TimestampFormat.UTC:
                return this.traceInfo.utcOffset;
            case timeline_1.TimestampFormat.TraceTz:
                return this.traceInfo.traceTzOffset;
            default:
                (0, logging_1.assertUnreachable)(fmt);
        }
    }
    // Convert absolute time to domain time.
    toDomainTime(ts) {
        return time_1.Time.sub(ts, this.timestampOffset());
    }
    get timestampFormat() {
        return (0, timestamp_format_1.timestampFormat)();
    }
    set timestampFormat(format) {
        (0, timestamp_format_1.setTimestampFormat)(format);
    }
    get durationPrecision() {
        return (0, timestamp_format_1.durationPrecision)();
    }
    set durationPrecision(precision) {
        (0, timestamp_format_1.setDurationPrecision)(precision);
    }
}
exports.TimelineImpl = TimelineImpl;
//# sourceMappingURL=timeline.js.map