"use strict";
// Copyright (C) 2022 The Android Open Source Project
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
exports.ArrayBufferBuilder = void 0;
const utf8_1 = require("@protobufjs/utf8");
const logging_1 = require("../base/logging");
const object_utils_1 = require("../base/object_utils");
// Return the length, in bytes, of a token to be inserted.
function tokenLength(token) {
    if ((0, object_utils_1.isString)(token)) {
        return (0, utf8_1.length)(token);
    }
    else if (token instanceof Uint8Array) {
        return token.byteLength;
    }
    else {
        (0, logging_1.assertTrue)(token >= 0 && token <= 0xffffffff);
        // 32-bit integers take 4 bytes
        return 4;
    }
}
// Insert a token into the buffer, at position `byteOffset`.
//
// @param dataView A DataView into the buffer to write into.
// @param typedArray A Uint8Array view into the buffer to write into.
// @param byteOffset Position to write at, in the buffer.
// @param token Token to insert into the buffer.
function insertToken(dataView, typedArray, byteOffset, token) {
    if ((0, object_utils_1.isString)(token)) {
        // Encode the string in UTF-8
        const written = (0, utf8_1.write)(token, typedArray, byteOffset);
        (0, logging_1.assertTrue)(written === (0, utf8_1.length)(token));
    }
    else if (token instanceof Uint8Array) {
        // Copy the bytes from the other array
        typedArray.set(token, byteOffset);
    }
    else {
        (0, logging_1.assertTrue)(token >= 0 && token <= 0xffffffff);
        // 32-bit little-endian value
        dataView.setUint32(byteOffset, token, true);
    }
}
// Like a string builder, but for an ArrayBuffer instead of a string. This
// allows us to assemble messages to send/receive over the wire. Data can be
// appended to the buffer using `append()`. The data we append can be of the
// following types:
//
// - string: the ASCII string is appended. Throws an error if there are
//           non-ASCII characters.
// - number: the number is appended as a 32-bit little-endian integer.
// - Uint8Array: the bytes are appended as-is to the buffer.
class ArrayBufferBuilder {
    tokens = [];
    // Return an `ArrayBuffer` that is the concatenation of all the tokens.
    toArrayBuffer() {
        // Calculate the size of the buffer we need.
        let byteLength = 0;
        for (const token of this.tokens) {
            byteLength += tokenLength(token);
        }
        // Allocate the buffer.
        const buffer = new ArrayBuffer(byteLength);
        const dataView = new DataView(buffer);
        const typedArray = new Uint8Array(buffer);
        // Fill the buffer with the tokens.
        let byteOffset = 0;
        for (const token of this.tokens) {
            insertToken(dataView, typedArray, byteOffset, token);
            byteOffset += tokenLength(token);
        }
        (0, logging_1.assertTrue)(byteOffset === byteLength);
        // Return the values.
        return buffer;
    }
    // Add one or more tokens to the value of this object.
    append(token) {
        this.tokens.push(token);
    }
}
exports.ArrayBufferBuilder = ArrayBufferBuilder;
//# sourceMappingURL=array_buffer_builder.js.map