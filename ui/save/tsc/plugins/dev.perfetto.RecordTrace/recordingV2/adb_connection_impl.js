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
exports.AdbConnectionImpl = void 0;
const deferred_1 = require("../../../base/deferred");
const array_buffer_builder_1 = require("../../../base/array_buffer_builder");
const adb_file_handler_1 = require("./adb_file_handler");
const string_utils_1 = require("../../../base/string_utils");
class AdbConnectionImpl {
    // onStatus and onDisconnect are set to callbacks passed from the caller.
    // This happens for instance in the AndroidWebusbTarget, which instantiates
    // them with callbacks passed from the UI.
    onStatus = () => { };
    onDisconnect = (_) => { };
    // Starts a shell command, and returns a promise resolved when the command
    // completes.
    async shellAndWaitCompletion(cmd) {
        const adbStream = await this.shell(cmd);
        const onStreamingEnded = (0, deferred_1.defer)();
        // We wait for the stream to be closed by the device, which happens
        // after the shell command is successfully received.
        adbStream.addOnStreamCloseCallback(() => {
            onStreamingEnded.resolve();
        });
        return onStreamingEnded;
    }
    // Starts a shell command, then gathers all its output and returns it as
    // a string.
    async shellAndGetOutput(cmd) {
        const adbStream = await this.shell(cmd);
        const commandOutput = new array_buffer_builder_1.ArrayBufferBuilder();
        const onStreamingEnded = (0, deferred_1.defer)();
        adbStream.addOnStreamDataCallback((data) => {
            commandOutput.append(data);
        });
        adbStream.addOnStreamCloseCallback(() => {
            onStreamingEnded.resolve((0, string_utils_1.utf8Decode)(commandOutput.toArrayBuffer()));
        });
        return onStreamingEnded;
    }
    async push(binary, path) {
        const byteStream = await this.openStream('sync:');
        await new adb_file_handler_1.AdbFileHandler(byteStream).pushBinary(binary, path);
        // We need to wait until the bytestream is closed. Otherwise, we can have a
        // race condition:
        // If this is the last stream, it will try to disconnect the device. In the
        // meantime, the caller might create another stream which will try to open
        // the device.
        await byteStream.closeAndWaitForTeardown();
    }
}
exports.AdbConnectionImpl = AdbConnectionImpl;
//# sourceMappingURL=adb_connection_impl.js.map