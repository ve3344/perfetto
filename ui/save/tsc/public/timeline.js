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
exports.DurationPrecision = exports.TimestampFormat = void 0;
var TimestampFormat;
(function (TimestampFormat) {
    TimestampFormat["Timecode"] = "timecode";
    TimestampFormat["TraceNs"] = "traceNs";
    TimestampFormat["TraceNsLocale"] = "traceNsLocale";
    TimestampFormat["Seconds"] = "seconds";
    TimestampFormat["Milliseconds"] = "milliseconds";
    TimestampFormat["Microseconds"] = "microseconds";
    TimestampFormat["UTC"] = "utc";
    TimestampFormat["TraceTz"] = "traceTz";
})(TimestampFormat || (exports.TimestampFormat = TimestampFormat = {}));
var DurationPrecision;
(function (DurationPrecision) {
    DurationPrecision["Full"] = "full";
    DurationPrecision["HumanReadable"] = "human_readable";
})(DurationPrecision || (exports.DurationPrecision = DurationPrecision = {}));
//# sourceMappingURL=timeline.js.map