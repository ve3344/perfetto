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
exports.base64Encode = base64Encode;
exports.base64Decode = base64Decode;
exports.hexEncode = hexEncode;
exports.utf8Encode = utf8Encode;
exports.utf8Decode = utf8Decode;
exports.binaryEncode = binaryEncode;
exports.binaryDecode = binaryDecode;
exports.sqliteString = sqliteString;
exports.sqlNameSafe = sqlNameSafe;
exports.undoCommonChatAppReplacements = undoCommonChatAppReplacements;
exports.cropText = cropText;
const base64_1 = require("@protobufjs/base64");
const logging_1 = require("./logging");
// Lazy initialize at first use.
let textDecoder = undefined;
let textEncoder = undefined;
function base64Encode(buffer) {
    return (0, base64_1.encode)(buffer, 0, buffer.length);
}
function base64Decode(str) {
    // if the string is in base64url format, convert to base64
    const b64 = str.replaceAll('-', '+').replaceAll('_', '/');
    const arr = new Uint8Array((0, base64_1.length)(b64));
    const written = (0, base64_1.decode)(b64, arr, 0);
    (0, logging_1.assertTrue)(written === arr.length);
    return arr;
}
// encode binary array to hex string
function hexEncode(bytes) {
    return bytes.reduce((prev, cur) => prev + ('0' + cur.toString(16)).slice(-2), '');
}
function utf8Encode(str) {
    textEncoder = textEncoder ?? new TextEncoder();
    return textEncoder.encode(str);
}
// Note: not all byte sequences can be converted to<>from UTF8. This can be
// used only with valid unicode strings, not arbitrary byte buffers.
function utf8Decode(buffer) {
    textDecoder = textDecoder ?? new TextDecoder();
    return textDecoder.decode(buffer);
}
// The binaryEncode/Decode functions below allow to encode an arbitrary binary
// buffer into a string that can be JSON-encoded. binaryEncode() applies
// UTF-16 encoding to each byte individually.
// Unlike utf8Encode/Decode, any arbitrary byte sequence can be converted into a
// valid string, and viceversa.
// This should be only used when a byte array needs to be transmitted over an
// interface that supports only JSON serialization (e.g., postmessage to a
// chrome extension).
function binaryEncode(buf) {
    let str = '';
    for (let i = 0; i < buf.length; i++) {
        str += String.fromCharCode(buf[i]);
    }
    return str;
}
function binaryDecode(str) {
    const buf = new Uint8Array(str.length);
    const strLen = str.length;
    for (let i = 0; i < strLen; i++) {
        buf[i] = str.charCodeAt(i);
    }
    return buf;
}
// A function used to interpolate strings into SQL query. The only replacement
// is done is that single quote replaced with two single quotes, according to
// SQLite documentation:
// https://www.sqlite.org/lang_expr.html#literal_values_constants_
//
// The purpose of this function is to use in simple comparisons, to escape
// strings used in GLOB clauses see escapeQuery function.
function sqliteString(str) {
    return `'${str.replaceAll("'", "''")}'`;
}
// Makes a string safe to be used as a SQL table/view/function name.
function sqlNameSafe(str) {
    return str.replace(/[^a-zA-Z0-9_]+/g, '_');
}
// Chat apps (including G Chat) sometimes replace ASCII characters with similar
// looking unicode characters that break code snippets.
// This function attempts to undo these replacements.
function undoCommonChatAppReplacements(str) {
    // Replace non-breaking spaces with normal spaces.
    return str.replaceAll('\u00A0', ' ');
}
function cropText(str, charWidth, rectWidth) {
    let displayText = '';
    const maxLength = Math.floor(rectWidth / charWidth) - 1;
    if (str.length <= maxLength) {
        displayText = str;
    }
    else {
        let limit = maxLength;
        let maybeTripleDot = '';
        if (maxLength > 1) {
            limit = maxLength - 1;
            maybeTripleDot = '\u2026';
        }
        // Javascript strings are UTF-16. |limit| could point in the middle of a
        // 32-bit double-wchar codepoint (e.g., an emoji). Here we detect if the
        // |limit|-th wchar is a leading surrogate and attach the trailing one.
        const lastCharCode = str.charCodeAt(limit - 1);
        limit += lastCharCode >= 55296 && lastCharCode < 56320 ? 1 : 0;
        displayText = str.substring(0, limit) + maybeTripleDot;
    }
    return displayText;
}
//# sourceMappingURL=string_utils.js.map