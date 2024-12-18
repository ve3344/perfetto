"use strict";
// Copyright (C) 2019 The Android Open Source Project
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
const string_utils_1 = require("./string_utils");
test('string_utils.stringToBase64', () => {
    const bytes = [...'Hello, world'].map((c) => c.charCodeAt(0));
    const buffer = new Uint8Array(bytes);
    const b64Encoded = (0, string_utils_1.base64Encode)(buffer);
    expect(b64Encoded).toEqual('SGVsbG8sIHdvcmxk');
    expect((0, string_utils_1.base64Decode)(b64Encoded)).toEqual(buffer);
});
test('string_utils.bufferToBase64', () => {
    const buffer = new Uint8Array([0xff, 0, 0, 0x81, 0x2a, 0xfe]);
    const b64Encoded = (0, string_utils_1.base64Encode)(buffer);
    expect(b64Encoded).toEqual('/wAAgSr+');
    expect((0, string_utils_1.base64Decode)(b64Encoded)).toEqual(buffer);
});
test('string_utils.utf8EncodeAndDecode', () => {
    const testString = '¡HéllØ wörld!';
    const buffer = (0, string_utils_1.utf8Encode)(testString);
    const expectedUtf8 = [
        194, 161, 72, 195, 169, 108, 108, 195, 152, 32, 119, 195, 182, 114, 108,
        100, 33,
    ];
    expect((0, array_utils_1.arrayEquals)(buffer, expectedUtf8)).toBe(true);
    expect((0, string_utils_1.utf8Decode)(buffer)).toEqual(testString);
});
test('string_utils.binaryEncodeAndDecode', () => {
    const buf = new Uint8Array(256 + 4);
    for (let i = 0; i < 256; i++) {
        buf[i] = i;
    }
    buf.set([0xf0, 0x28, 0x8c, 0xbc], 256);
    const encodedStr = (0, string_utils_1.binaryEncode)(buf);
    expect(encodedStr.length).toEqual(buf.length);
    const encodedThroughJson = JSON.parse(JSON.stringify(encodedStr));
    expect((0, string_utils_1.binaryDecode)(encodedStr)).toEqual(buf);
    expect((0, string_utils_1.binaryDecode)(encodedThroughJson)).toEqual(buf);
});
test('string_utils.sqliteString', () => {
    expect((0, string_utils_1.sqliteString)("that's it")).toEqual("'that''s it'");
    expect((0, string_utils_1.sqliteString)('no quotes')).toEqual("'no quotes'");
    expect((0, string_utils_1.sqliteString)(`foo ' bar '`)).toEqual(`'foo '' bar '''`);
});
test('cropHelper regular text', () => {
    const tripleDot = '\u2026';
    const emoji = '\uD83D\uDE00';
    expect((0, string_utils_1.cropText)('com.android.camera [4096]', 
    /* charWidth=*/ 5, 
    /* rectWidth=*/ 2 * 5)).toBe('c');
    expect((0, string_utils_1.cropText)('com.android.camera [4096]', 5, 4 * 5 + 2)).toBe('co' + tripleDot);
    expect((0, string_utils_1.cropText)('com.android.camera [4096]', 5, 5 * 5 + 2)).toBe('com' + tripleDot);
    expect((0, string_utils_1.cropText)('com.android.camera [4096]', 5, 13 * 5 + 2)).toBe('com.android' + tripleDot);
    expect((0, string_utils_1.cropText)('com.android.camera [4096]', 5, 26 * 5 + 2)).toBe('com.android.camera [4096]');
    expect((0, string_utils_1.cropText)(emoji + 'abc', 5, 2 * 5)).toBe(emoji);
    expect((0, string_utils_1.cropText)(emoji + 'abc', 5, 5 * 5)).toBe(emoji + 'a' + tripleDot);
});
//# sourceMappingURL=string_utils_unittest.js.map