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
exports.renderTimecode = renderTimecode;
exports.formatDuration = formatDuration;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const time_1 = require("../base/time");
const timeline_1 = require("../public/timeline");
function renderTimecode(time) {
    const { dhhmmss, millis, micros, nanos } = time_1.Time.toTimecode(time);
    return (0, mithril_1.default)('span.pf-timecode', (0, mithril_1.default)('span.pf-timecode-hms', dhhmmss), '.', (0, mithril_1.default)('span.pf-timecode-millis', millis), (0, mithril_1.default)('span.pf-timecode-micros', micros), (0, mithril_1.default)('span.pf-timecode-nanos', nanos));
}
function formatDuration(trace, dur) {
    const fmt = trace.timeline.timestampFormat;
    switch (fmt) {
        case timeline_1.TimestampFormat.UTC:
        case timeline_1.TimestampFormat.TraceTz:
        case timeline_1.TimestampFormat.Timecode:
            return renderFormattedDuration(trace, dur);
        case timeline_1.TimestampFormat.TraceNs:
            return dur.toString();
        case timeline_1.TimestampFormat.TraceNsLocale:
            return dur.toLocaleString();
        case timeline_1.TimestampFormat.Seconds:
            return time_1.Duration.formatSeconds(dur);
        case timeline_1.TimestampFormat.Milliseconds:
            return time_1.Duration.formatMilliseconds(dur);
        case timeline_1.TimestampFormat.Microseconds:
            return time_1.Duration.formatMicroseconds(dur);
        default:
            const x = fmt;
            throw new Error(`Invalid format ${x}`);
    }
}
function renderFormattedDuration(trace, dur) {
    const fmt = trace.timeline.durationPrecision;
    switch (fmt) {
        case timeline_1.DurationPrecision.HumanReadable:
            return time_1.Duration.humanise(dur);
        case timeline_1.DurationPrecision.Full:
            return time_1.Duration.format(dur);
        default:
            const x = fmt;
            throw new Error(`Invalid format ${x}`);
    }
}
//# sourceMappingURL=time_utils.js.map