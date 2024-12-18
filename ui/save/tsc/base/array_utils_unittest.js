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
const array_utils_1 = require("./array_utils");
describe('range', () => {
    it('returns array of elements in range [0; n)', () => {
        expect((0, array_utils_1.range)(3)).toEqual([0, 1, 2]);
        expect((0, array_utils_1.range)(5)).toEqual([0, 1, 2, 3, 4]);
    });
    it('returns empty array on n = 0', () => {
        expect((0, array_utils_1.range)(0)).toEqual([]);
    });
    it('throws an error on negative input', () => {
        expect(() => {
            (0, array_utils_1.range)(-10);
        }).toThrowError();
    });
});
describe('allUnique', () => {
    it('returns true on array with unique elements', () => {
        expect((0, array_utils_1.allUnique)(['a', 'b', 'c'])).toBeTruthy();
    });
    it('returns false on array with repeated elements', () => {
        expect((0, array_utils_1.allUnique)(['a', 'a', 'b'])).toBeFalsy();
    });
    // Couple of corner cases
    it('returns true on an empty array', () => {
        expect((0, array_utils_1.allUnique)([])).toBeTruthy();
    });
    it('returns true on an array with one element', () => {
        expect((0, array_utils_1.allUnique)(['test'])).toBeTruthy();
    });
});
describe('arrayEquals', () => {
    it('returns true when two arrays are the same', () => {
        expect((0, array_utils_1.arrayEquals)(['a', 'b', 'c'], ['a', 'b', 'c'])).toBeTruthy();
    });
    it('returns false when two arrays differ', () => {
        expect((0, array_utils_1.arrayEquals)(['a', 'b', 'c'], ['a', 'c', 'b'])).toBeFalsy();
    });
    it('returns false when arrays have differing lengths', () => {
        expect((0, array_utils_1.arrayEquals)(['a', 'b', 'c'], ['a'])).toBeFalsy();
    });
});
test('removeFalsyValues', () => {
    const input = [
        'a',
        false,
        undefined,
        null,
        '',
        123,
        123n,
        true,
        { foo: 'bar' },
    ];
    const expected = ['a', 123, 123n, true, { foo: 'bar' }];
    expect((0, array_utils_1.removeFalsyValues)(input)).toEqual(expected);
});
//# sourceMappingURL=array_utils_unittest.js.map