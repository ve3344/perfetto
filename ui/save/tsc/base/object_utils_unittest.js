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
const object_utils_1 = require("./object_utils");
describe('getPath', () => {
    const nested = { quux: 'qux' };
    const value = {
        foo: {
            bar: [1, 2, 3],
        },
        baz: nested,
    };
    test('happy path', () => {
        expect((0, object_utils_1.getPath)(value, ['foo', 'bar', 1])).toBe(2);
        expect((0, object_utils_1.getPath)(value, ['foo', 'bar', 2])).toBe(3);
        expect((0, object_utils_1.getPath)(value, ['foo', 'bar'])).toEqual([1, 2, 3]);
        expect((0, object_utils_1.getPath)(value, ['foo'])).toEqual({ bar: [1, 2, 3] });
        expect((0, object_utils_1.getPath)(value, [])).toBe(value);
        expect((0, object_utils_1.getPath)(value, ['baz'])).toBe(nested);
    });
    it('returns undefined when path is incomplete', () => {
        // value.quux does not exist so we expect undefined to be returned
        expect((0, object_utils_1.getPath)(value, ['quux'])).toBe(undefined);
        expect((0, object_utils_1.getPath)(value, ['quux', 'corge'])).toBe(undefined);
    });
});
describe('setPath', () => {
    const nested = { quux: 'qux' };
    const value = {
        foo: {
            bar: [1, 2, 3],
        },
        baz: nested,
    };
    test('happy path', () => {
        (0, object_utils_1.setPath)(value, ['foo', 'bar', 1], 10);
        expect(value).toEqual({
            foo: {
                bar: [1, 10, 3],
            },
            baz: nested,
        });
    });
    it('appends node when target node is missing', () => {
        (0, object_utils_1.setPath)(value, ['quux'], 'abc');
        expect(value['quux']).toBe('abc');
    });
    it('throws when path node(s) are missing', () => {
        // value.quux does not exist, so setting value.quux.corge is an error.
        expect(() => {
            (0, object_utils_1.setPath)(value, ['quux', 'corge'], 'abc');
        }).toThrowError(TypeError);
    });
    it('throws when path is empty', () => {
        expect(() => {
            (0, object_utils_1.setPath)(value, [], 'abc');
        }).toThrowError(TypeError);
    });
});
test('shallowEquals', () => {
    const one = 1;
    const foo = 'Foo!';
    const nestedFoo = {
        foo,
    };
    const nestedFooDupe = {
        foo,
    };
    expect((0, object_utils_1.shallowEquals)({}, {})).toBe(true);
    expect((0, object_utils_1.shallowEquals)({ one }, {})).toBe(false);
    expect((0, object_utils_1.shallowEquals)({}, { one })).toBe(false);
    expect((0, object_utils_1.shallowEquals)({ one }, { one })).toBe(true);
    expect((0, object_utils_1.shallowEquals)({ nestedFoo }, { nestedFoo })).toBe(true);
    expect((0, object_utils_1.shallowEquals)({ nestedFoo }, { nestedFooDupe })).toBe(false);
});
//# sourceMappingURL=object_utils_unittest.js.map