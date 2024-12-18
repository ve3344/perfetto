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
exports.MIN_PX_PER_STEP = exports.TickType = void 0;
exports.getPattern = getPattern;
exports.getMaxMajorTicks = getMaxMajorTicks;
exports.generateTicks = generateTicks;
const logging_1 = require("../../base/logging");
const time_1 = require("../../base/time");
const micros = 1000n;
const millis = 1000n * micros;
const seconds = 1000n * millis;
const minutes = 60n * seconds;
const hours = 60n * minutes;
const days = 24n * hours;
// These patterns cover the entire range of 0 - 2^63-1 nanoseconds
const patterns = [
    [1n, '|'],
    [2n, '|:'],
    [5n, '|....'],
    [10n, '|....:....'],
    [20n, '|.:.'],
    [50n, '|....'],
    [100n, '|....:....'],
    [200n, '|.:.'],
    [500n, '|....'],
    [1n * micros, '|....:....'],
    [2n * micros, '|.:.'],
    [5n * micros, '|....'],
    [10n * micros, '|....:....'],
    [20n * micros, '|.:.'],
    [50n * micros, '|....'],
    [100n * micros, '|....:....'],
    [200n * micros, '|.:.'],
    [500n * micros, '|....'],
    [1n * millis, '|....:....'],
    [2n * millis, '|.:.'],
    [5n * millis, '|....'],
    [10n * millis, '|....:....'],
    [20n * millis, '|.:.'],
    [50n * millis, '|....'],
    [100n * millis, '|....:....'],
    [200n * millis, '|.:.'],
    [500n * millis, '|....'],
    [1n * seconds, '|....:....'],
    [2n * seconds, '|.:.'],
    [5n * seconds, '|....'],
    [10n * seconds, '|....:....'],
    [30n * seconds, '|.:.:.'],
    [1n * minutes, '|.....'],
    [2n * minutes, '|.:.'],
    [5n * minutes, '|.....'],
    [10n * minutes, '|....:....'],
    [30n * minutes, '|.:.:.'],
    [1n * hours, '|.....'],
    [2n * hours, '|.:.'],
    [6n * hours, '|.....'],
    [12n * hours, '|.....:.....'],
    [1n * days, '|.:.'],
    [2n * days, '|.:.'],
    [5n * days, '|....'],
    [10n * days, '|....:....'],
    [20n * days, '|.:.'],
    [50n * days, '|....'],
    [100n * days, '|....:....'],
    [200n * days, '|.:.'],
    [500n * days, '|....'],
    [1000n * days, '|....:....'],
    [2000n * days, '|.:.'],
    [5000n * days, '|....'],
    [10000n * days, '|....:....'],
    [20000n * days, '|.:.'],
    [50000n * days, '|....'],
    [100000n * days, '|....:....'],
    [200000n * days, '|.:.'],
];
// Returns the optimal step size and pattern of ticks within the step.
function getPattern(minPatternSize) {
    for (const [size, pattern] of patterns) {
        if (size >= minPatternSize) {
            return [size, pattern];
        }
    }
    throw new Error('Pattern not defined for this minsize');
}
function tickPatternToArray(pattern) {
    const array = Array.from(pattern);
    return array.map((char) => {
        switch (char) {
            case '|':
                return TickType.MAJOR;
            case ':':
                return TickType.MEDIUM;
            case '.':
                return TickType.MINOR;
            default:
                // This is almost certainly a developer/fat-finger error
                throw Error(`Invalid char "${char}" in pattern "${pattern}"`);
        }
    });
}
var TickType;
(function (TickType) {
    TickType[TickType["MAJOR"] = 0] = "MAJOR";
    TickType[TickType["MEDIUM"] = 1] = "MEDIUM";
    TickType[TickType["MINOR"] = 2] = "MINOR";
})(TickType || (exports.TickType = TickType = {}));
exports.MIN_PX_PER_STEP = 120;
function getMaxMajorTicks(width) {
    return Math.max(1, Math.floor(width / exports.MIN_PX_PER_STEP));
}
function* generateTicks(timeSpan, maxMajorTicks, offset = time_1.Time.ZERO) {
    (0, logging_1.assertTrue)(timeSpan.duration > 0n, 'timeSpan.duration cannot be lte 0');
    (0, logging_1.assertTrue)(maxMajorTicks > 0, 'maxMajorTicks cannot be lte 0');
    timeSpan = timeSpan.translate(-offset);
    const minStepSize = BigInt(Math.floor(Number(timeSpan.duration) / maxMajorTicks));
    const [patternSize, pattern] = getPattern(minStepSize);
    const tickPattern = tickPatternToArray(pattern);
    const stepSize = patternSize / BigInt(tickPattern.length);
    const start = time_1.Time.quantFloor(timeSpan.start, patternSize);
    const end = timeSpan.end;
    let patternIndex = 0;
    for (let time = start; time < end; time = time_1.Time.add(time, stepSize), patternIndex++) {
        if (time >= timeSpan.start) {
            patternIndex = patternIndex % tickPattern.length;
            const type = tickPattern[patternIndex];
            yield { type, time: time_1.Time.add(time, offset) };
        }
    }
}
//# sourceMappingURL=gridline_helper.js.map