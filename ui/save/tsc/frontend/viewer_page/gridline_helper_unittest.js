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
const time_1 = require("../../base/time");
const gridline_helper_1 = require("./gridline_helper");
test('gridline helper to have sensible step sizes', () => {
    expect((0, gridline_helper_1.getPattern)(1n)).toEqual([1n, '|']);
    expect((0, gridline_helper_1.getPattern)(2n)).toEqual([2n, '|:']);
    expect((0, gridline_helper_1.getPattern)(3n)).toEqual([5n, '|....']);
    expect((0, gridline_helper_1.getPattern)(4n)).toEqual([5n, '|....']);
    expect((0, gridline_helper_1.getPattern)(5n)).toEqual([5n, '|....']);
    expect((0, gridline_helper_1.getPattern)(7n)).toEqual([10n, '|....:....']);
    expect((0, gridline_helper_1.getPattern)(10n)).toEqual([10n, '|....:....']);
    expect((0, gridline_helper_1.getPattern)(20n)).toEqual([20n, '|.:.']);
    expect((0, gridline_helper_1.getPattern)(50n)).toEqual([50n, '|....']);
    expect((0, gridline_helper_1.getPattern)(100n)).toEqual([100n, '|....:....']);
});
describe('generateTicks', () => {
    it('can generate ticks with span starting at origin', () => {
        const tickGen = (0, gridline_helper_1.generateTicks)(new time_1.TimeSpan(time_1.Time.fromRaw(0n), time_1.Time.fromRaw(10n)), 1);
        const expected = [
            { type: gridline_helper_1.TickType.MAJOR, time: 0n },
            { type: gridline_helper_1.TickType.MINOR, time: 1n },
            { type: gridline_helper_1.TickType.MINOR, time: 2n },
            { type: gridline_helper_1.TickType.MINOR, time: 3n },
            { type: gridline_helper_1.TickType.MINOR, time: 4n },
            { type: gridline_helper_1.TickType.MEDIUM, time: 5n },
            { type: gridline_helper_1.TickType.MINOR, time: 6n },
            { type: gridline_helper_1.TickType.MINOR, time: 7n },
            { type: gridline_helper_1.TickType.MINOR, time: 8n },
            { type: gridline_helper_1.TickType.MINOR, time: 9n },
        ];
        const actual = Array.from(tickGen);
        expect(actual).toStrictEqual(expected);
    });
    it('can generate ticks when span has an offset', () => {
        const tickGen = (0, gridline_helper_1.generateTicks)(new time_1.TimeSpan(time_1.Time.fromRaw(10n), time_1.Time.fromRaw(20n)), 1);
        const expected = [
            { type: gridline_helper_1.TickType.MAJOR, time: 10n },
            { type: gridline_helper_1.TickType.MINOR, time: 11n },
            { type: gridline_helper_1.TickType.MINOR, time: 12n },
            { type: gridline_helper_1.TickType.MINOR, time: 13n },
            { type: gridline_helper_1.TickType.MINOR, time: 14n },
            { type: gridline_helper_1.TickType.MEDIUM, time: 15n },
            { type: gridline_helper_1.TickType.MINOR, time: 16n },
            { type: gridline_helper_1.TickType.MINOR, time: 17n },
            { type: gridline_helper_1.TickType.MINOR, time: 18n },
            { type: gridline_helper_1.TickType.MINOR, time: 19n },
        ];
        const actual = Array.from(tickGen);
        expect(actual).toStrictEqual(expected);
    });
    it('can generate ticks when span is large', () => {
        const tickGen = (0, gridline_helper_1.generateTicks)(new time_1.TimeSpan(time_1.Time.fromRaw(1000000000n), time_1.Time.fromRaw(2000000000n)), 1);
        const expected = [
            { type: gridline_helper_1.TickType.MAJOR, time: 1000000000n },
            { type: gridline_helper_1.TickType.MINOR, time: 1100000000n },
            { type: gridline_helper_1.TickType.MINOR, time: 1200000000n },
            { type: gridline_helper_1.TickType.MINOR, time: 1300000000n },
            { type: gridline_helper_1.TickType.MINOR, time: 1400000000n },
            { type: gridline_helper_1.TickType.MEDIUM, time: 1500000000n },
            { type: gridline_helper_1.TickType.MINOR, time: 1600000000n },
            { type: gridline_helper_1.TickType.MINOR, time: 1700000000n },
            { type: gridline_helper_1.TickType.MINOR, time: 1800000000n },
            { type: gridline_helper_1.TickType.MINOR, time: 1900000000n },
        ];
        const actual = Array.from(tickGen);
        expect(actual).toStrictEqual(expected);
    });
    it('throws an error when timespan duration is 0', () => {
        expect(() => {
            Array.from((0, gridline_helper_1.generateTicks)(time_1.TimeSpan.ZERO, 1));
        }).toThrow(Error);
    });
    it('throws an error when max ticks is 0', () => {
        const nonZeroTimeSpan = new time_1.TimeSpan(time_1.Time.fromRaw(0n), time_1.Time.fromRaw(1n));
        expect(() => {
            Array.from((0, gridline_helper_1.generateTicks)(nonZeroTimeSpan, 0));
        }).toThrow(Error);
    });
});
//# sourceMappingURL=gridline_helper_unittest.js.map