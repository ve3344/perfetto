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
exports.PerfStats = void 0;
exports.runningStatStr = runningStatStr;
// Stores statistics about samples, and keeps a fixed size buffer of most recent
// samples.
class PerfStats {
    _maxBufferSize;
    _count = 0;
    _mean = 0;
    _lastValue = 0;
    _ptr = 0;
    buffer = [];
    constructor(_maxBufferSize = 10) {
        this._maxBufferSize = _maxBufferSize;
    }
    addValue(value) {
        this._lastValue = value;
        if (this.buffer.length >= this._maxBufferSize) {
            this.buffer[this._ptr++] = value;
            if (this._ptr >= this.buffer.length) {
                this._ptr -= this.buffer.length;
            }
        }
        else {
            this.buffer.push(value);
        }
        this._mean = (this._mean * this._count + value) / (this._count + 1);
        this._count++;
    }
    get mean() {
        return this._mean;
    }
    get count() {
        return this._count;
    }
    get bufferMean() {
        return this.buffer.reduce((sum, v) => sum + v, 0) / this.buffer.length;
    }
    get bufferSize() {
        return this.buffer.length;
    }
    get maxBufferSize() {
        return this._maxBufferSize;
    }
    get last() {
        return this._lastValue;
    }
}
exports.PerfStats = PerfStats;
// Returns a summary string representation of a RunningStatistics object.
function runningStatStr(stat) {
    return (`Last: ${stat.last.toFixed(2)}ms | ` +
        `Avg: ${stat.mean.toFixed(2)}ms | ` +
        `Avg${stat.maxBufferSize}: ${stat.bufferMean.toFixed(2)}ms`);
}
//# sourceMappingURL=perf_stats.js.map