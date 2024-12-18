"use strict";
// Copyright (C) 2019 The Android Open Source Project
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
const time_1 = require("../base/time");
const t = time_1.Time.fromRaw;
test('Duration.format', () => {
    expect(time_1.Duration.format(0n)).toEqual('0s');
    expect(time_1.Duration.format(3000000000n)).toEqual('3s');
    expect(time_1.Duration.format(60000000000n)).toEqual('1m');
    expect(time_1.Duration.format(63000000000n)).toEqual('1m 3s');
    expect(time_1.Duration.format(63200000000n)).toEqual('1m 3s 200ms');
    expect(time_1.Duration.format(63222100000n)).toEqual('1m 3s 222ms 100us');
    expect(time_1.Duration.format(63222111100n)).toEqual('1m 3s 222ms 111us 100ns');
    expect(time_1.Duration.format(222111100n)).toEqual('222ms 111us 100ns');
    expect(time_1.Duration.format(1000n)).toEqual('1us');
    expect(time_1.Duration.format(3000n)).toEqual('3us');
    expect(time_1.Duration.format(1000001000n)).toEqual('1s 1us');
    expect(time_1.Duration.format(200000000030n)).toEqual('3m 20s 30ns');
    expect(time_1.Duration.format(3600000000000n)).toEqual('1h');
    expect(time_1.Duration.format(3600000000001n)).toEqual('1h 1ns');
    expect(time_1.Duration.format(86400000000000n)).toEqual('24h');
    expect(time_1.Duration.format(86400000000001n)).toEqual('24h 1ns');
    expect(time_1.Duration.format(31536000000000000n)).toEqual('8,760h');
    expect(time_1.Duration.format(31536000000000001n)).toEqual('8,760h 1ns');
});
test('Duration.humanise', () => {
    expect(time_1.Duration.humanise(0n)).toEqual('0s');
    expect(time_1.Duration.humanise(123n)).toEqual('123ns');
    expect(time_1.Duration.humanise(1234n)).toEqual('1.2us');
    expect(time_1.Duration.humanise(12345n)).toEqual('12.3us');
    expect(time_1.Duration.humanise(3000000000n)).toEqual('3s');
    expect(time_1.Duration.humanise(60000000000n)).toEqual('60s');
    expect(time_1.Duration.humanise(63000000000n)).toEqual('63s');
    expect(time_1.Duration.humanise(63200000000n)).toEqual('63.2s');
    expect(time_1.Duration.humanise(63222100000n)).toEqual('63.2s');
    expect(time_1.Duration.humanise(63222111100n)).toEqual('63.2s');
    expect(time_1.Duration.humanise(222111100n)).toEqual('222.1ms');
    expect(time_1.Duration.humanise(1000n)).toEqual('1us');
    expect(time_1.Duration.humanise(3000n)).toEqual('3us');
    expect(time_1.Duration.humanise(1000001000n)).toEqual('1s');
    expect(time_1.Duration.humanise(200000000030n)).toEqual('200s');
    expect(time_1.Duration.humanise(3600000000000n)).toEqual('3600s');
    expect(time_1.Duration.humanise(86400000000000n)).toEqual('86400s');
    expect(time_1.Duration.humanise(31536000000000000n)).toEqual('31536000s');
});
test('Duration.fromMillis', () => {
    expect(time_1.Duration.fromMillis(123.456789)).toEqual(123456789n);
    expect(time_1.Duration.fromMillis(123.4567895)).toEqual(123456789n);
    expect(time_1.Duration.fromMillis(0.0000001)).toEqual(0n);
});
test('timecode', () => {
    expect(new time_1.Timecode(t(0n)).toString(' ')).toEqual('00:00:00.000 000 000');
    expect(new time_1.Timecode(t(123n)).toString(' ')).toEqual('00:00:00.000 000 123');
    expect(new time_1.Timecode(t(60000000000n)).toString(' ')).toEqual('00:01:00.000 000 000');
    expect(new time_1.Timecode(t(12345678910n)).toString(' ')).toEqual('00:00:12.345 678 910');
    expect(new time_1.Timecode(t(86400000000000n)).toString(' ')).toEqual('1d00:00:00.000 000 000');
    expect(new time_1.Timecode(t(31536000000000000n)).toString(' ')).toEqual('365d00:00:00.000 000 000');
    expect(new time_1.Timecode(t(-123n)).toString(' ')).toEqual('-00:00:00.000 000 123');
});
function mkSpan(start, end) {
    return new time_1.TimeSpan(t(start), t(end));
}
describe('TimeSpan', () => {
    it('throws when start is later than end', () => {
        expect(() => mkSpan(1n, 0n)).toThrow();
    });
    it('can calc duration', () => {
        expect(mkSpan(10n, 20n).duration).toBe(10n);
    });
    it('can calc midpoint', () => {
        expect(mkSpan(10n, 20n).midpoint).toBe(15n);
        expect(mkSpan(10n, 19n).midpoint).toBe(14n);
        expect(mkSpan(10n, 10n).midpoint).toBe(10n);
    });
    it('can be compared', () => {
        const x = mkSpan(10n, 20n);
        expect(x.equals(mkSpan(10n, 20n))).toBeTruthy();
        expect(x.equals(mkSpan(11n, 20n))).toBeFalsy();
        expect(x.equals(mkSpan(10n, 19n))).toBeFalsy();
    });
    it('checks containment', () => {
        const x = mkSpan(10n, 20n);
        expect(x.contains(t(9n))).toBeFalsy();
        expect(x.contains(t(10n))).toBeTruthy();
        expect(x.contains(t(15n))).toBeTruthy();
        expect(x.contains(t(20n))).toBeFalsy();
        expect(x.contains(t(21n))).toBeFalsy();
    });
    it('checks containment of another span', () => {
        const x = mkSpan(10n, 20n);
        expect(x.containsSpan(t(12n), t(18n))).toBeTruthy();
        expect(x.containsSpan(t(5n), t(25n))).toBeFalsy();
        expect(x.containsSpan(t(5n), t(15n))).toBeFalsy();
        expect(x.containsSpan(t(15n), t(25n))).toBeFalsy();
        expect(x.containsSpan(t(0n), t(10n))).toBeFalsy();
        expect(x.containsSpan(t(20n), t(30n))).toBeFalsy();
    });
    it('checks overlap', () => {
        const x = mkSpan(10n, 20n);
        expect(x.overlaps(t(0n), t(10n))).toBeFalsy();
        expect(x.overlaps(t(5n), t(15n))).toBeTruthy();
        expect(x.overlaps(t(12n), t(18n))).toBeTruthy();
        expect(x.overlaps(t(15n), t(25n))).toBeTruthy();
        expect(x.overlaps(t(20n), t(30n))).toBeFalsy();
        expect(x.overlaps(t(5n), t(25n))).toBeTruthy();
    });
    it('can add', () => {
        const x = mkSpan(10n, 20n);
        expect(x.translate(5n)).toEqual(mkSpan(15n, 25n));
    });
    it('can pad', () => {
        const x = mkSpan(10n, 20n);
        expect(x.pad(5n)).toEqual(mkSpan(5n, 25n));
    });
});
//# sourceMappingURL=time_unittest.js.map