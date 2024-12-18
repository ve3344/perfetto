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
exports.timestampFormat = timestampFormat;
exports.setTimestampFormat = setTimestampFormat;
exports.durationPrecision = durationPrecision;
exports.setDurationPrecision = setDurationPrecision;
const object_utils_1 = require("../base/object_utils");
const timeline_1 = require("../public/timeline");
let timestampFormatCached;
const TIMESTAMP_FORMAT_KEY = 'timestampFormat';
const DEFAULT_TIMESTAMP_FORMAT = timeline_1.TimestampFormat.Timecode;
function timestampFormat() {
    if (timestampFormatCached !== undefined) {
        return timestampFormatCached;
    }
    else {
        const storedFormat = localStorage.getItem(TIMESTAMP_FORMAT_KEY);
        if (storedFormat && (0, object_utils_1.isEnumValue)(timeline_1.TimestampFormat, storedFormat)) {
            timestampFormatCached = storedFormat;
        }
        else {
            timestampFormatCached = DEFAULT_TIMESTAMP_FORMAT;
        }
        return timestampFormatCached;
    }
}
function setTimestampFormat(format) {
    timestampFormatCached = format;
    localStorage.setItem(TIMESTAMP_FORMAT_KEY, format);
}
let durationFormatCached;
const DURATION_FORMAT_KEY = 'durationFormat';
const DEFAULT_DURATION_FORMAT = timeline_1.DurationPrecision.Full;
function durationPrecision() {
    if (durationFormatCached !== undefined) {
        return durationFormatCached;
    }
    else {
        const storedFormat = localStorage.getItem(DURATION_FORMAT_KEY);
        if (storedFormat && (0, object_utils_1.isEnumValue)(timeline_1.DurationPrecision, storedFormat)) {
            durationFormatCached = storedFormat;
        }
        else {
            durationFormatCached = DEFAULT_DURATION_FORMAT;
        }
        return durationFormatCached;
    }
}
function setDurationPrecision(format) {
    durationFormatCached = format;
    localStorage.setItem(DURATION_FORMAT_KEY, format);
}
//# sourceMappingURL=timestamp_format.js.map