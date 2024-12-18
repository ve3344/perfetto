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
exports.HostOsByteStream = void 0;
const deferred_1 = require("../../../base/deferred");
// A HostOsByteStream instantiates a websocket connection to the host OS.
// It exposes an API to write commands to this websocket and read its output.
class HostOsByteStream {
    // handshakeSignal will be resolved with the stream when the websocket
    // connection becomes open.
    handshakeSignal = (0, deferred_1.defer)();
    _isConnected = false;
    websocket;
    onStreamDataCallbacks = [];
    onStreamCloseCallbacks = [];
    constructor(websocketUrl) {
        this.websocket = new WebSocket(websocketUrl);
        this.websocket.onmessage = this.onMessage.bind(this);
        this.websocket.onopen = this.onOpen.bind(this);
    }
    addOnStreamDataCallback(onStreamData) {
        this.onStreamDataCallbacks.push(onStreamData);
    }
    addOnStreamCloseCallback(onStreamClose) {
        this.onStreamCloseCallbacks.push(onStreamClose);
    }
    close() {
        this.websocket.close();
        for (const onStreamClose of this.onStreamCloseCallbacks) {
            onStreamClose();
        }
        this.onStreamDataCallbacks = [];
        this.onStreamCloseCallbacks = [];
    }
    async closeAndWaitForTeardown() {
        this.close();
    }
    isConnected() {
        return this._isConnected;
    }
    write(msg) {
        this.websocket.send(msg);
    }
    async onMessage(evt) {
        for (const onStreamData of this.onStreamDataCallbacks) {
            const arrayBufferResponse = await evt.data.arrayBuffer();
            onStreamData(new Uint8Array(arrayBufferResponse));
        }
    }
    onOpen() {
        this._isConnected = true;
        this.handshakeSignal.resolve(this);
    }
    static create(websocketUrl) {
        return new HostOsByteStream(websocketUrl).handshakeSignal;
    }
}
exports.HostOsByteStream = HostOsByteStream;
//# sourceMappingURL=host_os_byte_stream.js.map