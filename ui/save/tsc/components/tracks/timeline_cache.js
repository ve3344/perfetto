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
exports.CacheKey = exports.BUCKETS_PER_PIXEL = void 0;
const bigint_math_1 = require("../../base/bigint_math");
const time_1 = require("../../base/time");
exports.BUCKETS_PER_PIXEL = 2;
// CacheKey is a specific region of the timeline defined by the
// following four properties:
// - startNs
// - endNs
// - bucketNs
// - windowSizePx
// startNs is the beginning of the region in ns
// endNs is the end of the region in ns
// bucketNs is the size of a single bucket within the region which is
//          used for quantizing the timeline.
// windowSizePx is the size of the whole window in pixels.
//
// In the nominal case bucketNs is
// set so that 1px of the screen corresponds to N bucketNs worth of
// time where 1 < N < 10. This ensures that we show the maximum
// amount of data given the available screen real estate.
// We shouldn't rely on this property when rendering however since in
// some situations (i.e. after zooming before new data has loaded) it
// may not be the case.
//
// CacheKey's can be 'normalized' - rounding the interval up and the
// bucket size down. For a given CacheKey key ('foo') the normalized
// version ('normal') has the properties:
//   normal.startNs <= foo.startNs
//   normal.endNs => foo.endNs
//   normal.bucketNs <= foo.bucketNs
//   normal.windowSizePx ~= windowSizePx (we round to the nearest 100px)
//   foo.isCoveredBy(foo) == true
//   foo.isCoveredBy(normal) == true
//   normal.isCoveredBy(normal) == true
//   normal.isCoveredBy(foo) == false unless normal == foo
//   normalize(normal) == normal
//
// In other words the normal window is a superset of the data of the
// non-normal window at a higher resolution. Normalization is used to
// avoid re-fetching data on tiny zooms/moves/resizes.
class CacheKey {
    start;
    end;
    bucketSize;
    windowSizePx;
    static create(startNs, endNs, windowSizePx) {
        const bucketNs = (endNs - startNs) / BigInt(Math.round(windowSizePx * exports.BUCKETS_PER_PIXEL));
        return new CacheKey(startNs, endNs, bigint_math_1.BigintMath.max(1n, bucketNs), windowSizePx);
    }
    constructor(startNs, endNs, bucketNs, windowSizePx) {
        this.start = startNs;
        this.end = endNs;
        this.bucketSize = bucketNs;
        this.windowSizePx = windowSizePx;
    }
    static zero() {
        return new CacheKey(time_1.Time.ZERO, time_1.Time.ZERO, 0n, 100);
    }
    get normalizedBucketNs() {
        // Round bucketNs down to the nearest smaller power of 2 (minimum 1):
        return bigint_math_1.BigintMath.max(1n, bigint_math_1.BigintMath.bitFloor(this.bucketSize));
    }
    get normalizedWindowSizePx() {
        return Math.max(100, Math.round(this.windowSizePx / 100) * 100);
    }
    normalize() {
        const windowSizePx = this.normalizedWindowSizePx;
        const bucketNs = this.normalizedBucketNs;
        const windowNs = BigInt(windowSizePx * exports.BUCKETS_PER_PIXEL) * bucketNs;
        const startNs = time_1.Time.quantFloor(this.start, windowNs);
        const endNs = time_1.Time.quantCeil(this.end, windowNs);
        return new CacheKey(startNs, endNs, bucketNs, windowSizePx);
    }
    isNormalized() {
        return this.toString() === this.normalize().toString();
    }
    isCoveredBy(other) {
        let r = true;
        r = r && other.start <= this.start;
        r = r && other.end >= this.end;
        r = r && other.normalizedBucketNs === this.normalizedBucketNs;
        r = r && other.normalizedWindowSizePx === this.normalizedWindowSizePx;
        return r;
    }
    // toString is 'load bearing' in that it's used to key e.g. caches
    // with CacheKey's.
    toString() {
        const start = this.start;
        const end = this.end;
        const bucket = this.bucketSize;
        const size = this.windowSizePx;
        return `CacheKey<${start}, ${end}, ${bucket}, ${size}>`;
    }
}
exports.CacheKey = CacheKey;
//# sourceMappingURL=timeline_cache.js.map