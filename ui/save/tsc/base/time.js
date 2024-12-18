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
exports.TimeSpan = exports.Timecode = exports.Duration = exports.Time = void 0;
exports.currentDateHourAndMinute = currentDateHourAndMinute;
exports.toISODateOnly = toISODateOnly;
const bigint_math_1 = require("./bigint_math");
const logging_1 = require("./logging");
// The conversion factor for converting between different time units.
const TIME_UNITS_PER_SEC = 1e9;
const TIME_UNITS_PER_MILLISEC = 1e6;
const TIME_UNITS_PER_MICROSEC = 1e3;
class Time {
    // Negative time is never found in a trace - so -1 is commonly used as a flag
    // to represent a value is undefined or unset, without having to use a
    // nullable or union type.
    static INVALID = Time.fromRaw(-1n);
    // The min and max possible values, considering times cannot be negative.
    static MIN = Time.fromRaw(0n);
    static MAX = Time.fromRaw(bigint_math_1.BigintMath.INT64_MAX);
    static ZERO = Time.fromRaw(0n);
    static fromRaw(v) {
        return v;
    }
    // Convert seconds (number) to a time value.
    // Note: number -> BigInt conversion is relatively slow.
    static fromSeconds(seconds) {
        return Time.fromRaw(BigInt(Math.floor(seconds * TIME_UNITS_PER_SEC)));
    }
    // Convert time value to seconds and return as a number (i.e. float).
    // Warning: This function is lossy, i.e. precision is lost when converting
    // BigInt -> number.
    // Note: BigInt -> number conversion is relatively slow.
    static toSeconds(t) {
        return Number(t) / TIME_UNITS_PER_SEC;
    }
    // Convert milliseconds (number) to a time value.
    // Note: number -> BigInt conversion is relatively slow.
    static fromMillis(millis) {
        return Time.fromRaw(BigInt(Math.floor(millis * TIME_UNITS_PER_MILLISEC)));
    }
    // Convert time value to milliseconds and return as a number (i.e. float).
    // Warning: This function is lossy, i.e. precision is lost when converting
    // BigInt -> number.
    // Note: BigInt -> number conversion is relatively slow.
    static toMillis(t) {
        return Number(t) / TIME_UNITS_PER_MILLISEC;
    }
    // Convert microseconds (number) to a time value.
    // Note: number -> BigInt conversion is relatively slow.
    static fromMicros(millis) {
        return Time.fromRaw(BigInt(Math.floor(millis * TIME_UNITS_PER_MICROSEC)));
    }
    // Convert time value to microseconds and return as a number (i.e. float).
    // Warning: This function is lossy, i.e. precision is lost when converting
    // BigInt -> number.
    // Note: BigInt -> number conversion is relatively slow.
    static toMicros(t) {
        return Number(t) / TIME_UNITS_PER_MICROSEC;
    }
    // Convert a Date object to a time value, given an offset from the unix epoch.
    // Note: number -> BigInt conversion is relatively slow.
    static fromDate(d, offset) {
        const millis = d.getTime();
        const t = Time.fromMillis(millis);
        return Time.add(t, offset);
    }
    // Convert time value to a Date object, given an offset from the unix epoch.
    // Warning: This function is lossy, i.e. precision is lost when converting
    // BigInt -> number.
    // Note: BigInt -> number conversion is relatively slow.
    static toDate(t, offset) {
        const timeSinceEpoch = Time.sub(t, offset);
        const millis = Time.toMillis(timeSinceEpoch);
        return new Date(millis);
    }
    // Find the closest previous midnight for a given time value.
    static getLatestMidnight(time, offset) {
        const date = Time.toDate(time, offset);
        const floorDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
        return Time.fromDate(floorDay, offset);
    }
    static add(t, d) {
        return Time.fromRaw(t + d);
    }
    static sub(t, d) {
        return Time.fromRaw(t - d);
    }
    static diff(a, b) {
        return a - b;
    }
    static min(a, b) {
        return Time.fromRaw(bigint_math_1.BigintMath.min(a, b));
    }
    static max(a, b) {
        return Time.fromRaw(bigint_math_1.BigintMath.max(a, b));
    }
    static quantFloor(a, b) {
        return Time.fromRaw(bigint_math_1.BigintMath.quantFloor(a, b));
    }
    static quantCeil(a, b) {
        return Time.fromRaw(bigint_math_1.BigintMath.quantCeil(a, b));
    }
    static quant(a, b) {
        return Time.fromRaw(bigint_math_1.BigintMath.quant(a, b));
    }
    static formatSeconds(time) {
        return Time.toSeconds(time).toString() + ' s';
    }
    static formatMilliseconds(time) {
        return Time.toMillis(time).toString() + ' ms';
    }
    static formatMicroseconds(time) {
        return Time.toMicros(time).toString() + ' us';
    }
    static toTimecode(time) {
        return new Timecode(time);
    }
}
exports.Time = Time;
class Duration {
    // The min and max possible duration values - durations can be negative.
    static MIN = bigint_math_1.BigintMath.INT64_MIN;
    static MAX = bigint_math_1.BigintMath.INT64_MAX;
    static ZERO = 0n;
    static fromRaw(v) {
        return v;
    }
    static min(a, b) {
        return bigint_math_1.BigintMath.min(a, b);
    }
    static max(a, b) {
        return bigint_math_1.BigintMath.max(a, b);
    }
    static fromMillis(millis) {
        return BigInt(Math.floor((millis / 1e3) * TIME_UNITS_PER_SEC));
    }
    // Convert time to seconds as a number.
    // Use this function with caution. It loses precision and is slow.
    static toSeconds(d) {
        return Number(d) / TIME_UNITS_PER_SEC;
    }
    // Convert time to seconds as a number.
    // Use this function with caution. It loses precision and is slow.
    static toMilliseconds(d) {
        return Number(d) / TIME_UNITS_PER_MILLISEC;
    }
    // Convert time to seconds as a number.
    // Use this function with caution. It loses precision and is slow.
    static toMicroSeconds(d) {
        return Number(d) / TIME_UNITS_PER_MICROSEC;
    }
    // Print duration as as human readable string - i.e. to only a handful of
    // significant figues.
    // Use this when readability is more desireable than precision.
    // Examples: 1234 -> 1.23ns
    //           123456789 -> 123ms
    //           123,123,123,123,123 -> 34h 12m
    //           1,000,000,023 -> 1 s
    //           1,230,000,023 -> 1.2 s
    static humanise(dur) {
        const sec = Duration.toSeconds(dur);
        const units = ['s', 'ms', 'us', 'ns'];
        const sign = Math.sign(sec);
        let n = Math.abs(sec);
        let u = 0;
        while (n < 1 && n !== 0 && u < units.length - 1) {
            n *= 1000;
            u++;
        }
        return `${sign < 0 ? '-' : ''}${Math.round(n * 10) / 10}${units[u]}`;
    }
    // Print duration with absolute precision.
    static format(duration) {
        let result = '';
        if (duration < 1)
            return '0s';
        const unitAndValue = [
            ['h', 3600000000000n],
            ['m', 60000000000n],
            ['s', 1000000000n],
            ['ms', 1000000n],
            ['us', 1000n],
            ['ns', 1n],
        ];
        unitAndValue.forEach(([unit, unitSize]) => {
            if (duration >= unitSize) {
                const unitCount = duration / unitSize;
                result += unitCount.toLocaleString() + unit + ' ';
                duration = duration % unitSize;
            }
        });
        return result.slice(0, -1);
    }
    static formatSeconds(dur) {
        return Duration.toSeconds(dur).toString() + ' s';
    }
    static formatMilliseconds(dur) {
        return Duration.toMilliseconds(dur).toString() + ' ms';
    }
    static formatMicroseconds(dur) {
        return Duration.toMicroSeconds(dur).toString() + ' us';
    }
}
exports.Duration = Duration;
// This class takes a time and converts it to a set of strings representing a
// time code where each string represents a group of time units formatted with
// an appropriate number of leading zeros.
class Timecode {
    sign;
    days;
    hours;
    minutes;
    seconds;
    millis;
    micros;
    nanos;
    constructor(time) {
        this.sign = time < 0 ? '-' : '';
        const absTime = bigint_math_1.BigintMath.abs(time);
        const days = absTime / 86400000000000n;
        const hours = (absTime / 3600000000000n) % 24n;
        const minutes = (absTime / 60000000000n) % 60n;
        const seconds = (absTime / 1000000000n) % 60n;
        const millis = (absTime / 1000000n) % 1000n;
        const micros = (absTime / 1000n) % 1000n;
        const nanos = absTime % 1000n;
        this.days = days.toString();
        this.hours = hours.toString().padStart(2, '0');
        this.minutes = minutes.toString().padStart(2, '0');
        this.seconds = seconds.toString().padStart(2, '0');
        this.millis = millis.toString().padStart(3, '0');
        this.micros = micros.toString().padStart(3, '0');
        this.nanos = nanos.toString().padStart(3, '0');
    }
    // Get the upper part of the timecode formatted as: [-]DdHH:MM:SS.
    get dhhmmss() {
        const days = this.days === '0' ? '' : `${this.days}d`;
        return `${this.sign}${days}${this.hours}:${this.minutes}:${this.seconds}`;
    }
    // Get the subsecond part of the timecode formatted as: mmm uuu nnn.
    // The "space" char is configurable but defaults to a normal space.
    subsec(spaceChar = ' ') {
        return `${this.millis}${spaceChar}${this.micros}${spaceChar}${this.nanos}`;
    }
    // Formats the entire timecode to a string.
    toString(spaceChar = ' ') {
        return `${this.dhhmmss}.${this.subsec(spaceChar)}`;
    }
}
exports.Timecode = Timecode;
function currentDateHourAndMinute() {
    const date = new Date();
    return `${date
        .toISOString()
        .substr(0, 10)}-${date.getHours()}-${date.getMinutes()}`;
}
class TimeSpan {
    static ZERO = new TimeSpan(Time.ZERO, Time.ZERO);
    start;
    end;
    constructor(start, end) {
        (0, logging_1.assertTrue)(start <= end, `Span start [${start}] cannot be greater than end [${end}]`);
        this.start = start;
        this.end = end;
    }
    static fromTimeAndDuration(start, duration) {
        return new TimeSpan(start, Time.add(start, duration));
    }
    get duration() {
        return this.end - this.start;
    }
    get midpoint() {
        return Time.fromRaw((this.start + this.end) / 2n);
    }
    contains(t) {
        return this.start <= t && t < this.end;
    }
    containsSpan(start, end) {
        return this.start <= start && end <= this.end;
    }
    overlaps(start, end) {
        return !(end <= this.start || start >= this.end);
    }
    equals(span) {
        return this.start === span.start && this.end === span.end;
    }
    translate(x) {
        return new TimeSpan(Time.add(this.start, x), Time.add(this.end, x));
    }
    pad(padding) {
        return new TimeSpan(Time.sub(this.start, padding), Time.add(this.end, padding));
    }
}
exports.TimeSpan = TimeSpan;
// Print the date only for a given date in ISO format.
function toISODateOnly(date) {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
//# sourceMappingURL=time.js.map