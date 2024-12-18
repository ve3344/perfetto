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
exports.HighPrecisionTime = void 0;
const logging_1 = require("./logging");
const time_1 = require("./time");
/**
 * Represents a time value in trace processor's time units, which is capable of
 * representing a time with at least 64 bit integer precision and 53 bits of
 * fractional precision.
 *
 * This class is immutable - any methods that modify this time will return a new
 * copy containing instead.
 */
class HighPrecisionTime {
    // This is the high precision time representing 0
    static ZERO = new HighPrecisionTime(time_1.Time.fromRaw(0n));
    // time value == |integral| + |fractional|
    // |fractional| is kept in the range 0 <= x < 1 to avoid losing precision
    integral;
    fractional;
    /**
     * Constructs a HighPrecisionTime object.
     *
     * @param integral The integer part of the time value.
     * @param fractional The fractional part of the time value.
     */
    constructor(integral, fractional = 0) {
        // Normalize |fractional| to the range 0.0 <= x < 1.0
        const fractionalFloor = Math.floor(fractional);
        this.integral = (integral + BigInt(fractionalFloor));
        this.fractional = fractional - fractionalFloor;
    }
    /**
     * Converts to an integer time value.
     *
     * @param round How to round ('round', 'floor', or 'ceil').
     */
    toTime(round = 'floor') {
        switch (round) {
            case 'round':
                return time_1.Time.fromRaw(this.integral + BigInt(Math.round(this.fractional)));
            case 'floor':
                return time_1.Time.fromRaw(this.integral);
            case 'ceil':
                return time_1.Time.fromRaw(this.integral + BigInt(Math.ceil(this.fractional)));
            default:
                (0, logging_1.assertUnreachable)(round);
        }
    }
    /**
     * Converts to a JavaScript number. Precision loss should be expected when
     * integral values are large.
     */
    toNumber() {
        return Number(this.integral) + this.fractional;
    }
    /**
     * Adds another HighPrecisionTime to this one and returns the result.
     *
     * @param time A HighPrecisionTime object to add.
     */
    add(time) {
        return new HighPrecisionTime(time_1.Time.add(this.integral, time.integral), this.fractional + time.fractional);
    }
    /**
     * Adds an integer time value to this HighPrecisionTime and returns the result.
     *
     * @param t A time value to add.
     */
    addTime(t) {
        return new HighPrecisionTime(time_1.Time.add(this.integral, t), this.fractional);
    }
    /**
     * Adds a floating point time value to this one and returns the result.
     *
     * @param n A floating point value to add.
     */
    addNumber(n) {
        return new HighPrecisionTime(this.integral, this.fractional + n);
    }
    /**
     * Subtracts another HighPrecisionTime from this one and returns the result.
     *
     * @param time A HighPrecisionTime object to subtract.
     */
    sub(time) {
        return new HighPrecisionTime(time_1.Time.sub(this.integral, time.integral), this.fractional - time.fractional);
    }
    /**
     * Subtract an integer time value from this HighPrecisionTime and returns the
     * result.
     *
     * @param t A time value to subtract.
     */
    subTime(t) {
        return new HighPrecisionTime(time_1.Time.sub(this.integral, t), this.fractional);
    }
    /**
     * Subtracts a floating point time value from this one and returns the result.
     *
     * @param n A floating point value to subtract.
     */
    subNumber(n) {
        return new HighPrecisionTime(this.integral, this.fractional - n);
    }
    /**
     * Checks if this HighPrecisionTime is approximately equal to another, within
     * a given epsilon.
     *
     * @param other A HighPrecisionTime object to compare.
     * @param epsilon The tolerance for equality check.
     */
    equals(other, epsilon = 1e-6) {
        return Math.abs(this.sub(other).toNumber()) < epsilon;
    }
    /**
     * Checks if this time value is within the range defined by [start, end).
     *
     * @param start The start of the time range (inclusive).
     * @param end The end of the time range (exclusive).
     */
    containedWithin(start, end) {
        return this.integral >= start && this.integral < end;
    }
    /**
     * Checks if this HighPrecisionTime is less than a given time.
     *
     * @param t A time value.
     */
    lt(t) {
        return this.integral < t;
    }
    /**
     * Checks if this HighPrecisionTime is less than or equal to a given time.
     *
     * @param t A time value.
     */
    lte(t) {
        return (this.integral < t ||
            (this.integral === t && Math.abs(this.fractional - 0.0) < Number.EPSILON));
    }
    /**
     * Checks if this HighPrecisionTime is greater than a given time.
     *
     * @param t A time value.
     */
    gt(t) {
        return (this.integral > t ||
            (this.integral === t && Math.abs(this.fractional - 0.0) > Number.EPSILON));
    }
    /**
     * Checks if this HighPrecisionTime is greater than or equal to a given time.
     *
     * @param t A time value.
     */
    gte(t) {
        return this.integral >= t;
    }
    /**
     * Clamps this HighPrecisionTime to be within the specified range.
     *
     * @param lower The lower bound of the range.
     * @param upper The upper bound of the range.
     */
    clamp(lower, upper) {
        if (this.integral < lower) {
            return new HighPrecisionTime(lower);
        }
        else if (this.integral >= upper) {
            return new HighPrecisionTime(upper);
        }
        else {
            return this;
        }
    }
    /**
     * Returns the absolute value of this HighPrecisionTime.
     */
    abs() {
        if (this.integral >= 0n) {
            return this;
        }
        const newIntegral = time_1.Time.fromRaw(-this.integral);
        const newFractional = -this.fractional;
        return new HighPrecisionTime(newIntegral, newFractional);
    }
    /**
     * Converts this HighPrecisionTime to a string representation.
     */
    toString() {
        const fractionalAsString = this.fractional.toString();
        if (fractionalAsString === '0') {
            return this.integral.toString();
        }
        else {
            return `${this.integral}${fractionalAsString.substring(1)}`;
        }
    }
}
exports.HighPrecisionTime = HighPrecisionTime;
//# sourceMappingURL=high_precision_time.js.map