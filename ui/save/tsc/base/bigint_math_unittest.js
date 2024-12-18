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
const bigint_math_1 = require("./bigint_math");
describe('BigIntMath', () => {
    describe('bitCeil', () => {
        it('rounds powers of 2 to themselves', () => {
            expect(bigint_math_1.BigintMath.bitCeil(1n)).toBe(1n);
            expect(bigint_math_1.BigintMath.bitCeil(2n)).toBe(2n);
            expect(bigint_math_1.BigintMath.bitCeil(4n)).toBe(4n);
            expect(bigint_math_1.BigintMath.bitCeil(4294967296n)).toBe(4294967296n);
            expect(bigint_math_1.BigintMath.bitCeil(2305843009213693952n)).toBe(2305843009213693952n);
        });
        it('rounds non powers of 2 up to nearest power of 2', () => {
            expect(bigint_math_1.BigintMath.bitCeil(3n)).toBe(4n);
            expect(bigint_math_1.BigintMath.bitCeil(11n)).toBe(16n);
            expect(bigint_math_1.BigintMath.bitCeil(33n)).toBe(64n);
            expect(bigint_math_1.BigintMath.bitCeil(63n)).toBe(64n);
            expect(bigint_math_1.BigintMath.bitCeil(1234567890123456789n)).toBe(2305843009213693952n);
        });
        it('rounds 0 or negative values up to 1', () => {
            expect(bigint_math_1.BigintMath.bitCeil(0n)).toBe(1n);
            expect(bigint_math_1.BigintMath.bitCeil(-123n)).toBe(1n);
        });
    });
    describe('bitFloor', () => {
        it('rounds powers of 2 to themselves', () => {
            expect(bigint_math_1.BigintMath.bitFloor(1n)).toBe(1n);
            expect(bigint_math_1.BigintMath.bitFloor(2n)).toBe(2n);
            expect(bigint_math_1.BigintMath.bitFloor(4n)).toBe(4n);
            expect(bigint_math_1.BigintMath.bitFloor(4294967296n)).toBe(4294967296n);
            expect(bigint_math_1.BigintMath.bitFloor(2305843009213693952n)).toBe(2305843009213693952n);
        });
        it('rounds non powers of 2 down to nearest power of 2', () => {
            expect(bigint_math_1.BigintMath.bitFloor(3n)).toBe(2n);
            expect(bigint_math_1.BigintMath.bitFloor(11n)).toBe(8n);
            expect(bigint_math_1.BigintMath.bitFloor(33n)).toBe(32n);
            expect(bigint_math_1.BigintMath.bitFloor(63n)).toBe(32n);
            expect(bigint_math_1.BigintMath.bitFloor(1234567890123456789n)).toBe(1152921504606846976n);
        });
        it('rounds 0 or negative values up to 1', () => {
            expect(bigint_math_1.BigintMath.bitFloor(0n)).toBe(1n);
            expect(bigint_math_1.BigintMath.bitFloor(-123n)).toBe(1n);
        });
    });
    describe('log2', () => {
        it('calcs exact powers of 2', () => {
            expect(bigint_math_1.BigintMath.log2(1n)).toBe(0);
            expect(bigint_math_1.BigintMath.log2(2n)).toBe(1);
            expect(bigint_math_1.BigintMath.log2(4n)).toBe(2);
            expect(bigint_math_1.BigintMath.log2(4294967296n)).toBe(32);
            expect(bigint_math_1.BigintMath.log2(2305843009213693952n)).toBe(61);
        });
        it('rounds non powers of 2 down to nearest power of 2', () => {
            expect(bigint_math_1.BigintMath.log2(3n)).toBe(1);
            expect(bigint_math_1.BigintMath.log2(11n)).toBe(3);
            expect(bigint_math_1.BigintMath.log2(33n)).toBe(5);
            expect(bigint_math_1.BigintMath.log2(63n)).toBe(5);
            expect(bigint_math_1.BigintMath.log2(1234567890123456789n)).toBe(60);
        });
        it('returns 0 for 0n negative numbers', () => {
            expect(bigint_math_1.BigintMath.log2(0n)).toBe(0);
            expect(bigint_math_1.BigintMath.log2(-123n)).toBe(0);
        });
    });
    describe('quant', () => {
        it('should round an int to the nearest multiple of a stepsize', () => {
            expect(bigint_math_1.BigintMath.quant(0n, 2n)).toEqual(0n);
            expect(bigint_math_1.BigintMath.quant(1n, 2n)).toEqual(2n);
            expect(bigint_math_1.BigintMath.quant(2n, 2n)).toEqual(2n);
            expect(bigint_math_1.BigintMath.quant(3n, 2n)).toEqual(4n);
            expect(bigint_math_1.BigintMath.quant(4n, 2n)).toEqual(4n);
            expect(bigint_math_1.BigintMath.quant(0n, 3n)).toEqual(0n);
            expect(bigint_math_1.BigintMath.quant(1n, 3n)).toEqual(0n);
            expect(bigint_math_1.BigintMath.quant(2n, 3n)).toEqual(3n);
            expect(bigint_math_1.BigintMath.quant(3n, 3n)).toEqual(3n);
            expect(bigint_math_1.BigintMath.quant(4n, 3n)).toEqual(3n);
            expect(bigint_math_1.BigintMath.quant(5n, 3n)).toEqual(6n);
            expect(bigint_math_1.BigintMath.quant(6n, 3n)).toEqual(6n);
        });
        it('should return value if stepsize is smaller than 1', () => {
            expect(bigint_math_1.BigintMath.quant(123n, 0n)).toEqual(123n);
            expect(bigint_math_1.BigintMath.quant(123n, -10n)).toEqual(123n);
        });
    });
    describe('quantFloor', () => {
        it('should quantize a number to the nearest multiple of a stepsize', () => {
            expect(bigint_math_1.BigintMath.quantFloor(10n, 2n)).toEqual(10n);
            expect(bigint_math_1.BigintMath.quantFloor(11n, 2n)).toEqual(10n);
            expect(bigint_math_1.BigintMath.quantFloor(12n, 2n)).toEqual(12n);
            expect(bigint_math_1.BigintMath.quantFloor(13n, 2n)).toEqual(12n);
            expect(bigint_math_1.BigintMath.quantFloor(9n, 4n)).toEqual(8n);
            expect(bigint_math_1.BigintMath.quantFloor(10n, 4n)).toEqual(8n);
            expect(bigint_math_1.BigintMath.quantFloor(11n, 4n)).toEqual(8n);
            expect(bigint_math_1.BigintMath.quantFloor(12n, 4n)).toEqual(12n);
            expect(bigint_math_1.BigintMath.quantFloor(13n, 4n)).toEqual(12n);
        });
        it('should handle negative numbers', () => {
            expect(bigint_math_1.BigintMath.quantFloor(-4n, 10n)).toEqual(-10n);
            expect(bigint_math_1.BigintMath.quantFloor(-10n, 10n)).toEqual(-10n);
            expect(bigint_math_1.BigintMath.quantFloor(-11n, 10n)).toEqual(-20n);
        });
        it('should return value if stepsize is smaller than 1', () => {
            expect(bigint_math_1.BigintMath.quantFloor(123n, 0n)).toEqual(123n);
            expect(bigint_math_1.BigintMath.quantFloor(123n, -10n)).toEqual(123n);
        });
    });
    describe('quantCeil', () => {
        it('should round an int up to the nearest multiple of a stepsize', () => {
            expect(bigint_math_1.BigintMath.quantCeil(10n, 2n)).toEqual(10n);
            expect(bigint_math_1.BigintMath.quantCeil(11n, 2n)).toEqual(12n);
            expect(bigint_math_1.BigintMath.quantCeil(12n, 2n)).toEqual(12n);
            expect(bigint_math_1.BigintMath.quantCeil(13n, 2n)).toEqual(14n);
            expect(bigint_math_1.BigintMath.quantCeil(9n, 4n)).toEqual(12n);
            expect(bigint_math_1.BigintMath.quantCeil(10n, 4n)).toEqual(12n);
            expect(bigint_math_1.BigintMath.quantCeil(11n, 4n)).toEqual(12n);
            expect(bigint_math_1.BigintMath.quantCeil(12n, 4n)).toEqual(12n);
            expect(bigint_math_1.BigintMath.quantCeil(13n, 4n)).toEqual(16n);
        });
        it('should handle negative numbers', () => {
            expect(bigint_math_1.BigintMath.quantCeil(-4n, 10n)).toEqual(0n);
            expect(bigint_math_1.BigintMath.quantCeil(-10n, 10n)).toEqual(-10n);
            expect(bigint_math_1.BigintMath.quantCeil(-11n, 10n)).toEqual(-10n);
        });
        it('should return value if stepsize is smaller than 1', () => {
            expect(bigint_math_1.BigintMath.quantCeil(123n, 0n)).toEqual(123n);
            expect(bigint_math_1.BigintMath.quantCeil(123n, -10n)).toEqual(123n);
        });
    });
    describe('quantRound', () => {
        it('should quantize a number to the nearest multiple of a stepsize', () => {
            expect(bigint_math_1.BigintMath.quant(0n, 2n)).toEqual(0n);
            expect(bigint_math_1.BigintMath.quant(1n, 2n)).toEqual(2n);
            expect(bigint_math_1.BigintMath.quant(2n, 2n)).toEqual(2n);
            expect(bigint_math_1.BigintMath.quant(3n, 2n)).toEqual(4n);
            expect(bigint_math_1.BigintMath.quant(4n, 2n)).toEqual(4n);
            expect(bigint_math_1.BigintMath.quant(0n, 3n)).toEqual(0n);
            expect(bigint_math_1.BigintMath.quant(1n, 3n)).toEqual(0n);
            expect(bigint_math_1.BigintMath.quant(2n, 3n)).toEqual(3n);
            expect(bigint_math_1.BigintMath.quant(3n, 3n)).toEqual(3n);
            expect(bigint_math_1.BigintMath.quant(4n, 3n)).toEqual(3n);
            expect(bigint_math_1.BigintMath.quant(5n, 3n)).toEqual(6n);
            expect(bigint_math_1.BigintMath.quant(6n, 3n)).toEqual(6n);
        });
        it('should return value if stepsize is smaller than 1', () => {
            expect(bigint_math_1.BigintMath.quant(123n, 0n)).toEqual(123n);
            expect(bigint_math_1.BigintMath.quant(123n, -10n)).toEqual(123n);
        });
    });
    describe('max', () => {
        it('should return the greater of two numbers', () => {
            expect(bigint_math_1.BigintMath.max(5n, 8n)).toEqual(8n);
            expect(bigint_math_1.BigintMath.max(3n, 7n)).toEqual(7n);
            expect(bigint_math_1.BigintMath.max(6n, 6n)).toEqual(6n);
            expect(bigint_math_1.BigintMath.max(-7n, -12n)).toEqual(-7n);
        });
    });
    describe('min', () => {
        it('should return the smaller of two numbers', () => {
            expect(bigint_math_1.BigintMath.min(5n, 8n)).toEqual(5n);
            expect(bigint_math_1.BigintMath.min(3n, 7n)).toEqual(3n);
            expect(bigint_math_1.BigintMath.min(6n, 6n)).toEqual(6n);
            expect(bigint_math_1.BigintMath.min(-7n, -12n)).toEqual(-12n);
        });
    });
    describe('popcount', () => {
        it('should return the number of set bits in an integer', () => {
            expect(bigint_math_1.BigintMath.popcount(0n)).toBe(0);
            expect(bigint_math_1.BigintMath.popcount(1n)).toBe(1);
            expect(bigint_math_1.BigintMath.popcount(2n)).toBe(1);
            expect(bigint_math_1.BigintMath.popcount(3n)).toBe(2);
            expect(bigint_math_1.BigintMath.popcount(4n)).toBe(1);
            expect(bigint_math_1.BigintMath.popcount(5n)).toBe(2);
            expect(bigint_math_1.BigintMath.popcount(3462151285050974216n)).toBe(10);
        });
        it('should throw when presented with a negative integer', () => {
            expect(() => bigint_math_1.BigintMath.popcount(-1n)).toThrowError("Can't get popcount of negative number -1");
        });
    });
    describe('ratio', () => {
        it('should return ratio as number', () => {
            expect(bigint_math_1.BigintMath.ratio(0n, 1n)).toBeCloseTo(0);
            expect(bigint_math_1.BigintMath.ratio(1n, 1n)).toBeCloseTo(1);
            expect(bigint_math_1.BigintMath.ratio(1n, 2n)).toBeCloseTo(0.5);
            expect(bigint_math_1.BigintMath.ratio(1n, 100n)).toBeCloseTo(0.01);
            expect(bigint_math_1.BigintMath.ratio(987654321098765432109876543210n, 123456789012345678901234567890n)).toBeCloseTo(8);
            expect(bigint_math_1.BigintMath.ratio(123456789012345678901234567890n, 987654321098765432109876543210n)).toBeCloseTo(0.125, 3);
        });
    });
    describe('abs', () => {
        test('should return the absolute value of a positive BigInt', () => {
            const result = bigint_math_1.BigintMath.abs(12345678901234567890n);
            expect(result).toEqual(12345678901234567890n);
        });
        test('should return the absolute value of a negative BigInt', () => {
            const result = bigint_math_1.BigintMath.abs(-12345678901234567890n);
            expect(result).toEqual(12345678901234567890n);
        });
        test('should return the absolute value of zero', () => {
            const result = bigint_math_1.BigintMath.abs(0n);
            expect(result).toEqual(0n);
        });
    });
});
//# sourceMappingURL=bigint_math_unittest.js.map