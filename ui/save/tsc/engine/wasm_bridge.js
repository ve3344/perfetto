"use strict";
// Copyright (C) 2018 The Android Open Source Project
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
exports.WasmBridge = void 0;
const tslib_1 = require("tslib");
const deferred_1 = require("../base/deferred");
const logging_1 = require("../base/logging");
const trace_processor_1 = tslib_1.__importDefault(require("../gen/trace_processor"));
// The Initialize() call will allocate a buffer of REQ_BUF_SIZE bytes which
// will be used to copy the input request data. This is to avoid passing the
// input data on the stack, which has a limited (~1MB) size.
// The buffer will be allocated by the C++ side and reachable at
// HEAPU8[reqBufferAddr, +REQ_BUFFER_SIZE].
const REQ_BUF_SIZE = 32 * 1024 * 1024;
// The end-to-end interaction between JS and Wasm is as follows:
// - [JS] Inbound data received by the worker (onmessage() in engine/index.ts).
//   - [JS] onRpcDataReceived() (this file)
//     - [C++] trace_processor_on_rpc_request (wasm_bridge.cc)
//       - [C++] some TraceProcessor::method()
//         for (batch in result_rows)
//           - [C++] RpcResponseFunction(bytes) (wasm_bridge.cc)
//             - [JS] onReply() (this file)
//               - [JS] postMessage() (this file)
class WasmBridge {
    // When this promise has resolved it is safe to call callWasm.
    whenInitialized;
    aborted;
    connection;
    reqBufferAddr = 0;
    lastStderr = [];
    messagePort;
    constructor() {
        this.aborted = false;
        const deferredRuntimeInitialized = (0, deferred_1.defer)();
        this.connection = (0, trace_processor_1.default)({
            locateFile: (s) => s,
            print: (line) => console.log(line),
            printErr: (line) => this.appendAndLogErr(line),
            onRuntimeInitialized: () => deferredRuntimeInitialized.resolve(),
        });
        this.whenInitialized = deferredRuntimeInitialized.then(() => {
            const fn = this.connection.addFunction(this.onReply.bind(this), 'vii');
            this.reqBufferAddr =
                this.connection.ccall('trace_processor_rpc_init', 
                /* return=*/ 'number', 
                /* args=*/ ['number', 'number'], [fn, REQ_BUF_SIZE]) >>> 0; // >>> 0 = static_cast<uint32_t> (see comment in onReply()).
        });
    }
    initialize(port) {
        // Ensure that initialize() is called only once.
        (0, logging_1.assertTrue)(this.messagePort === undefined);
        this.messagePort = port;
        // Note: setting .onmessage implicitly calls port.start() and dispatches the
        // queued messages. addEventListener('message') doesn't.
        this.messagePort.onmessage = this.onMessage.bind(this);
    }
    onMessage(msg) {
        if (this.aborted) {
            throw new Error('Wasm module crashed');
        }
        (0, logging_1.assertTrue)(msg.data instanceof Uint8Array);
        const data = msg.data;
        let wrSize = 0;
        // If the request data is larger than our JS<>Wasm interop buffer, split it
        // into multiple writes. The RPC channel is byte-oriented and is designed to
        // deal with arbitrary fragmentations.
        while (wrSize < data.length) {
            const sliceLen = Math.min(data.length - wrSize, REQ_BUF_SIZE);
            const dataSlice = data.subarray(wrSize, wrSize + sliceLen);
            this.connection.HEAPU8.set(dataSlice, this.reqBufferAddr);
            wrSize += sliceLen;
            try {
                this.connection.ccall('trace_processor_on_rpc_request', // C function name.
                'void', // Return type.
                ['number'], // Arg types.
                [sliceLen]);
            }
            catch (err) {
                this.aborted = true;
                let abortReason = `${err}`;
                if (err instanceof Error) {
                    abortReason = `${err.name}: ${err.message}\n${err.stack}`;
                }
                abortReason += '\n\nstderr: \n' + this.lastStderr.join('\n');
                throw new Error(abortReason);
            }
        } // while(wrSize < data.length)
    }
    // This function is bound and passed to Initialize and is called by the C++
    // code while in the ccall(trace_processor_on_rpc_request).
    onReply(heapPtr, size) {
        // Force heapPtr to be a positive using an unsigned right shift.
        // The issue here is the following: the matching code in wasm_bridge.cc
        // invokes this function passing  arguments as uint32_t. However, in the
        // wasm<>JS interop bindings, the uint32 args become Js numbers. If the
        // pointer is > 2GB, this number will be negative, which causes the wrong
        // behaviour on slice().
        heapPtr = heapPtr >>> 0; // This is static_cast<uint32_t>(heapPtr).
        size = size >>> 0;
        const data = this.connection.HEAPU8.slice(heapPtr, heapPtr + size);
        (0, logging_1.assertExists)(this.messagePort).postMessage(data, [data.buffer]);
    }
    appendAndLogErr(line) {
        console.warn(line);
        // Keep the last N lines in the |lastStderr| buffer.
        this.lastStderr.push(line);
        if (this.lastStderr.length > 512) {
            this.lastStderr.shift();
        }
    }
}
exports.WasmBridge = WasmBridge;
//# sourceMappingURL=wasm_bridge.js.map