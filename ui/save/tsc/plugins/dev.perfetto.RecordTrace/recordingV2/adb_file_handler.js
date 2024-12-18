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
exports.AdbFileHandler = void 0;
const deferred_1 = require("../../../base/deferred");
const logging_1 = require("../../../base/logging");
const array_buffer_builder_1 = require("../../../base/array_buffer_builder");
const recording_error_handling_1 = require("./recording_error_handling");
const recording_utils_1 = require("./recording_utils");
const string_utils_1 = require("../../../base/string_utils");
// https://cs.android.com/android/platform/superproject/+/main:packages/
// modules/adb/file_sync_protocol.h;l=144
const MAX_SYNC_SEND_CHUNK_SIZE = 64 * 1024;
// Adb does not accurately send some file permissions. If you need a special set
// of permissions, do not rely on this value. Rather, send a shell command which
// explicitly sets permissions, such as:
// 'shell:chmod ${permissions} ${path}'
const FILE_PERMISSIONS = 2 ** 15 + 0o644;
// For details about the protocol, see:
// https://cs.android.com/android/platform/superproject/+/main:packages/modules/adb/SYNC.TXT
class AdbFileHandler {
    byteStream;
    sentByteCount = 0;
    isPushOngoing = false;
    constructor(byteStream) {
        this.byteStream = byteStream;
    }
    async pushBinary(binary, path) {
        // For a given byteStream, we only support pushing one binary at a time.
        (0, logging_1.assertFalse)(this.isPushOngoing);
        this.isPushOngoing = true;
        const transferFinished = (0, deferred_1.defer)();
        this.byteStream.addOnStreamDataCallback((data) => this.onStreamData(data, transferFinished));
        this.byteStream.addOnStreamCloseCallback(() => (this.isPushOngoing = false));
        const sendMessage = new array_buffer_builder_1.ArrayBufferBuilder();
        // 'SEND' is the API method used to send a file to device.
        sendMessage.append('SEND');
        // The remote file name is split into two parts separated by the last
        // comma (","). The first part is the actual path, while the second is a
        // decimal encoded file mode containing the permissions of the file on
        // device.
        sendMessage.append(path.length + 6);
        sendMessage.append(path);
        sendMessage.append(',');
        sendMessage.append(FILE_PERMISSIONS.toString());
        this.byteStream.write(new Uint8Array(sendMessage.toArrayBuffer()));
        while (!(await this.sendNextDataChunk(binary)))
            ;
        return transferFinished;
    }
    onStreamData(data, transferFinished) {
        this.sentByteCount = 0;
        const response = (0, string_utils_1.utf8Decode)(data);
        if (response.split('\n')[0].includes('FAIL')) {
            // Sample failure response (when the file is transferred successfully
            // but the date is not formatted correctly):
            // 'OKAYFAIL\npath too long'
            transferFinished.reject(new recording_error_handling_1.RecordingError(`${recording_utils_1.BINARY_PUSH_FAILURE}: ${response}`));
        }
        else if ((0, string_utils_1.utf8Decode)(data).substring(0, 4) === 'OKAY') {
            // In case of success, the server responds to the last request with
            // 'OKAY'.
            transferFinished.resolve();
        }
        else {
            throw new recording_error_handling_1.RecordingError(`${recording_utils_1.BINARY_PUSH_UNKNOWN_RESPONSE}: ${response}`);
        }
    }
    async sendNextDataChunk(binary) {
        const endPosition = Math.min(this.sentByteCount + MAX_SYNC_SEND_CHUNK_SIZE, binary.byteLength);
        const chunk = await binary.slice(this.sentByteCount, endPosition);
        // The file is sent in chunks. Each chunk is prefixed with "DATA" and the
        // chunk length. This is repeated until the entire file is transferred. Each
        // chunk must not be larger than 64k.
        const chunkLength = chunk.byteLength;
        const dataMessage = new array_buffer_builder_1.ArrayBufferBuilder();
        dataMessage.append('DATA');
        dataMessage.append(chunkLength);
        dataMessage.append(new Uint8Array(chunk.buffer, chunk.byteOffset, chunkLength));
        this.sentByteCount += chunkLength;
        const isDone = this.sentByteCount === binary.byteLength;
        if (isDone) {
            // When the file is transferred a sync request "DONE" is sent, together
            // with a timestamp, representing the last modified time for the file. The
            // server responds to this last request.
            dataMessage.append('DONE');
            // We send the date in seconds.
            dataMessage.append(Math.floor(Date.now() / 1000));
        }
        this.byteStream.write(new Uint8Array(dataMessage.toArrayBuffer()));
        return isDone;
    }
}
exports.AdbFileHandler = AdbFileHandler;
//# sourceMappingURL=adb_file_handler.js.map