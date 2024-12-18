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
exports.getPath = getPath;
exports.setPath = setPath;
exports.shallowEquals = shallowEquals;
exports.isString = isString;
exports.isEnumValue = isEnumValue;
const logging_1 = require("./logging");
const utils_1 = require("./utils");
/**
 * Gets the |value| at a |path| of |object|. If a portion of the path doesn't
 * exist, |undefined| is returned.
 *
 * Example:
 * const obj = {
 *   a: [
 *     {b: 'c'},
 *     {d: 'e', f: 123},
 *   ],
 * };
 * getPath(obj, ['a']) -> [{b: 'c'}, {d: 'e', f: 123}]
 * getPath(obj, ['a', 1]) -> {d: 'e', f: 123}
 * getPath(obj, ['a', 1, 'd']) -> 'e'
 * getPath(obj, ['g']) -> undefined
 * getPath(obj, ['g', 'h']) -> undefined
 *
 * Note: This is an appropriate use of `any`, as we are knowingly getting fast
 * and loose with the type system in this function: it's basically JavaScript.
 * Attempting to pretend it's anything else would result in superfluous type
 * assertions which would serve no benefit.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getPath(obj, path) {
    let x = obj;
    for (const node of path) {
        if (x === undefined)
            return undefined;
        x = x[node];
    }
    return x;
}
/**
 * Sets the |value| at |path| of |object|. If the final node of the path doesn't
 * exist, the value will be created. Otherwise, TypeError is thrown.
 *
 * Example:
 * const obj = {
 *   a: [
 *     {b: 'c'},
 *     {d: 'e', f: 123},
 *   ],
 * };
 * setPath(obj, ['a'], 'foo') -> {a: 'foo'}
 * setPath(obj, ['a', 1], 'foo') -> {a: [{b: 'c'}, 'foo']}
 * setPath(obj, ['g'], 'foo') -> {a: [...], g: 'foo'}
 * setPath(obj, ['g', 'h'], 'foo') -> TypeError!
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setPath(obj, path, value) {
    const pathClone = [...path];
    let o = obj;
    while (pathClone.length > 1) {
        const p = (0, logging_1.assertExists)(pathClone.shift());
        o = o[p];
    }
    const p = pathClone.shift();
    if (!(0, utils_1.exists)(p)) {
        throw TypeError('Path array is empty');
    }
    o[p] = value;
}
function shallowEquals(a, b) {
    if (a === b) {
        return true;
    }
    if (a === undefined || b === undefined) {
        return false;
    }
    if (a === null || b === null) {
        return false;
    }
    const objA = a;
    const objB = b;
    for (const key of Object.keys(objA)) {
        if (objA[key] !== objB[key]) {
            return false;
        }
    }
    for (const key of Object.keys(objB)) {
        if (objA[key] !== objB[key]) {
            return false;
        }
    }
    return true;
}
function isString(s) {
    return typeof s === 'string' || s instanceof String;
}
// Given a string enum |enum|, check that |value| is a valid member of |enum|.
function isEnumValue(enm, value) {
    return Object.values(enm).includes(value);
}
//# sourceMappingURL=object_utils.js.map