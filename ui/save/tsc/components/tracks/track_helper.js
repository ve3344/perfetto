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
exports.TimelineFetcher = void 0;
const bigint_math_1 = require("../../base/bigint_math");
const time_1 = require("../../base/time");
const raf_scheduler_1 = require("../../core/raf_scheduler");
// This helper provides the logic to call |doFetch()| only when more
// data is needed as the visible window is panned and zoomed about, and
// includes an FSM to ensure doFetch is not re-entered.
class TimelineFetcher {
    doFetch;
    data_;
    // Timespan and resolution of the latest *request*. data_ may cover
    // a different time window.
    latestTimespan;
    latestResolution;
    constructor(doFetch) {
        this.doFetch = doFetch;
        this.latestTimespan = time_1.TimeSpan.ZERO;
        this.latestResolution = 0n;
    }
    async requestData(timespan, resolution) {
        if (this.shouldLoadNewData(timespan, resolution)) {
            // Over request data, one page worth to the left and right.
            const padded = timespan.pad(timespan.duration);
            const start = padded.start;
            const end = padded.end;
            // Quantize up and down to the bounds of |resolution|.
            const startQ = time_1.Time.fromRaw(bigint_math_1.BigintMath.quantFloor(start, resolution));
            const endQ = time_1.Time.fromRaw(bigint_math_1.BigintMath.quantCeil(end, resolution));
            this.latestTimespan = new time_1.TimeSpan(startQ, endQ);
            this.latestResolution = resolution;
            await this.loadData();
        }
    }
    get data() {
        return this.data_;
    }
    invalidate() {
        this.data_ = undefined;
    }
    [Symbol.dispose]() {
        this.data_ = undefined;
    }
    shouldLoadNewData(timespan, resolution) {
        if (this.data_ === undefined) {
            return true;
        }
        if (timespan.start < this.latestTimespan.start) {
            return true;
        }
        if (timespan.end > this.latestTimespan.end) {
            return true;
        }
        if (resolution !== this.latestResolution) {
            return true;
        }
        return false;
    }
    async loadData() {
        const { start, end } = this.latestTimespan;
        const resolution = this.latestResolution;
        this.data_ = await this.doFetch(start, end, resolution);
        raf_scheduler_1.raf.scheduleCanvasRedraw();
    }
}
exports.TimelineFetcher = TimelineFetcher;
//# sourceMappingURL=track_helper.js.map