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
const time_1 = require("./time");
const high_precision_time_1 = require("./high_precision_time");
const high_precision_time_span_1 = require("./high_precision_time_span");
const time_scale_1 = require("./time_scale");
const t = time_1.Time.fromRaw;
describe('TimeScale', () => {
    const ts = new time_scale_1.TimeScale(new high_precision_time_span_1.HighPrecisionTimeSpan(new high_precision_time_1.HighPrecisionTime(t(40n)), 100), { left: 200, right: 1000 });
    it('converts timescales to pixels', () => {
        expect(ts.timeToPx(time_1.Time.fromRaw(40n))).toEqual(200);
        expect(ts.timeToPx(time_1.Time.fromRaw(140n))).toEqual(1000);
        expect(ts.timeToPx(time_1.Time.fromRaw(90n))).toEqual(600);
        expect(ts.timeToPx(time_1.Time.fromRaw(240n))).toEqual(1800);
        expect(ts.timeToPx(time_1.Time.fromRaw(-60n))).toEqual(-600);
    });
    it('converts pixels to HPTime objects', () => {
        let result = ts.pxToHpTime(200);
        expect(result.integral).toEqual(40n);
        expect(result.fractional).toBeCloseTo(0);
        result = ts.pxToHpTime(1000);
        expect(result.integral).toEqual(140n);
        expect(result.fractional).toBeCloseTo(0);
        result = ts.pxToHpTime(600);
        expect(result.integral).toEqual(90n);
        expect(result.fractional).toBeCloseTo(0);
        result = ts.pxToHpTime(1800);
        expect(result.integral).toEqual(240n);
        expect(result.fractional).toBeCloseTo(0);
        result = ts.pxToHpTime(-600);
        expect(result.integral).toEqual(-60n);
        expect(result.fractional).toBeCloseTo(0);
    });
    it('converts durations to pixels', () => {
        expect(ts.durationToPx(0n)).toEqual(0);
        expect(ts.durationToPx(1n)).toEqual(8);
        expect(ts.durationToPx(1000n)).toEqual(8000);
    });
    it('converts pxDeltaToDurations to HPTime durations', () => {
        let result = ts.pxToDuration(0);
        expect(result).toBeCloseTo(0);
        result = ts.pxToDuration(1);
        expect(result).toBeCloseTo(0.125);
        result = ts.pxToDuration(100);
        expect(result).toBeCloseTo(12.5);
    });
});
//# sourceMappingURL=time_scale_unittest.js.map