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
exports.union = union;
exports.intersect = intersect;
exports.isSetEqual = isSetEqual;
function union(xs, ys) {
    if (xs.size === 0) {
        return ys;
    }
    if (ys.size === 0) {
        return xs;
    }
    const result = new Set();
    for (const x of xs) {
        result.add(x);
    }
    for (const y of ys) {
        result.add(y);
    }
    return result;
}
function intersect(xs, ys) {
    if (xs.size === 0) {
        return xs;
    }
    if (ys.size === 0) {
        return ys;
    }
    const result = new Set();
    for (const x of xs) {
        if (ys.has(x)) {
            result.add(x);
        }
    }
    return result;
}
function isSetEqual(xs, ys) {
    if (xs === ys) {
        return true;
    }
    if (xs.size !== ys.size) {
        return false;
    }
    for (const x of xs) {
        if (!ys.has(x)) {
            return false;
        }
    }
    return true;
}
//# sourceMappingURL=set_utils.js.map