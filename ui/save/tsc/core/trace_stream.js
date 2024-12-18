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
exports.TraceHttpStream = exports.TraceBufferStream = exports.TraceFileStream = void 0;
const deferred_1 = require("../base/deferred");
const logging_1 = require("../base/logging");
const utils_1 = require("../base/utils");
const SLICE_SIZE = 32 * 1024 * 1024;
// Loads a trace from a File object. For the "open file" use case.
class TraceFileStream {
    traceFile;
    reader;
    pendingRead;
    bytesRead = 0;
    constructor(traceFile) {
        this.traceFile = traceFile;
        this.reader = new FileReader();
        this.reader.onloadend = () => this.onLoad();
    }
    onLoad() {
        const pendingRead = (0, logging_1.assertExists)(this.pendingRead);
        this.pendingRead = undefined;
        if (this.reader.error) {
            pendingRead.reject(this.reader.error);
            return;
        }
        const res = (0, logging_1.assertExists)(this.reader.result);
        this.bytesRead += res.byteLength;
        pendingRead.resolve({
            data: new Uint8Array(res),
            eof: this.bytesRead >= this.traceFile.size,
            bytesRead: this.bytesRead,
            bytesTotal: this.traceFile.size,
        });
    }
    readChunk() {
        const sliceEnd = Math.min(this.bytesRead + SLICE_SIZE, this.traceFile.size);
        const slice = this.traceFile.slice(this.bytesRead, sliceEnd);
        this.pendingRead = (0, deferred_1.defer)();
        this.reader.readAsArrayBuffer(slice);
        return this.pendingRead;
    }
}
exports.TraceFileStream = TraceFileStream;
// Loads a trace from an ArrayBuffer. For the window.open() + postMessage
// use-case, used by other dashboards (see post_message_handler.ts).
class TraceBufferStream {
    traceBuf;
    bytesRead = 0;
    constructor(traceBuf) {
        this.traceBuf = traceBuf;
    }
    readChunk() {
        (0, logging_1.assertTrue)(this.bytesRead <= this.traceBuf.byteLength);
        const len = Math.min(SLICE_SIZE, this.traceBuf.byteLength - this.bytesRead);
        const data = new Uint8Array(this.traceBuf, this.bytesRead, len);
        this.bytesRead += len;
        return Promise.resolve({
            data,
            eof: this.bytesRead >= this.traceBuf.byteLength,
            bytesRead: this.bytesRead,
            bytesTotal: this.traceBuf.byteLength,
        });
    }
}
exports.TraceBufferStream = TraceBufferStream;
// Loads a stream from a URL via fetch(). For the permalink (?s=UUID) and
// open url (?url=http://...) cases.
class TraceHttpStream {
    bytesRead = 0;
    bytesTotal = 0;
    uri;
    httpStream;
    constructor(uri) {
        (0, logging_1.assertTrue)(uri.startsWith('http://') || uri.startsWith('https://'));
        this.uri = uri;
    }
    async readChunk() {
        // Initialize the fetch() job on the first read request.
        if (this.httpStream === undefined) {
            const response = await fetch(this.uri);
            if (response.status !== 200) {
                throw new Error(`HTTP ${response.status} - ${response.statusText}`);
            }
            const len = response.headers.get('Content-Length');
            this.bytesTotal = (0, utils_1.exists)(len) ? Number.parseInt(len, 10) : 0;
            this.httpStream = response.body.getReader();
        }
        let eof = false;
        let bytesRead = 0;
        const chunks = [];
        // httpStream can return very small chunks which can slow down
        // TraceProcessor. Here we accumulate chunks until we get at least 32mb
        // or hit EOF.
        while (!eof && bytesRead < 32 * 1024 * 1024) {
            const res = await this.httpStream.read();
            if (res.value) {
                chunks.push(res.value);
                bytesRead += res.value.length;
            }
            eof = res.done;
        }
        let data;
        if (chunks.length === 1) {
            data = chunks[0];
        }
        else {
            // Stitch all the chunks into one big array:
            data = new Uint8Array(bytesRead);
            let offset = 0;
            for (const chunk of chunks) {
                data.set(chunk, offset);
                offset += chunk.length;
            }
        }
        this.bytesRead += data.length;
        return {
            data,
            eof,
            bytesRead: this.bytesRead,
            bytesTotal: this.bytesTotal,
        };
    }
}
exports.TraceHttpStream = TraceHttpStream;
//# sourceMappingURL=trace_stream.js.map