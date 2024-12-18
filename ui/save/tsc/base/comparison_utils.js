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
exports.comparingBy = comparingBy;
exports.withDirection = withDirection;
exports.compareUniversal = compareUniversal;
const object_utils_1 = require("./object_utils");
// Having a comparison function of type S and a getter that returns value of
// type S from value of type T, values of type T can be compared.
function comparingBy(getter, comparison) {
    return (x, y) => {
        return comparison(getter(x), getter(y));
    };
}
function withDirection(comparison, sortDirection) {
    if (sortDirection !== 'DESC') {
        return comparison;
    }
    return (x, y) => {
        return comparison(y, x);
    };
}
function columnTypeKind(a) {
    if (a === undefined) {
        return 0;
    }
    if (a === null) {
        return 1;
    }
    if (typeof a === 'number') {
        return 2;
    }
    if ((0, object_utils_1.isString)(a)) {
        return 3;
    }
    // a instanceof Uint8Array
    return 4;
}
function compareUniversal(a, b) {
    if (a === undefined && b === undefined) {
        return 0;
    }
    if (a === null && b === null) {
        return 0;
    }
    if (typeof a === 'number' && typeof b === 'number') {
        return a - b;
    }
    if ((0, object_utils_1.isString)(a) && (0, object_utils_1.isString)(b)) {
        return a.localeCompare(b);
    }
    if (a instanceof Uint8Array && b instanceof Uint8Array) {
        // Do the lexicographical comparison
        for (let i = 0; i < a.length && i < b.length; i++) {
            if (a[i] < b[i]) {
                return -1;
            }
            if (a[i] > b[i]) {
                return 1;
            }
        }
        // No discrepancies found in the common prefix, compare lengths of arrays.
        return a.length - b.length;
    }
    // Values are of different kinds, compare the kinds
    return columnTypeKind(a) - columnTypeKind(b);
}
//# sourceMappingURL=comparison_utils.js.map