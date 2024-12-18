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
exports.AdbOverWebsocketStream = exports.AdbConnectionOverWebsocket = void 0;
const deferred_1 = require("../../../base/deferred");
const string_utils_1 = require("../../../base/string_utils");
const adb_connection_impl_1 = require("./adb_connection_impl");
const recording_error_handling_1 = require("./recording_error_handling");
const recording_utils_1 = require("./recording_utils");
class AdbConnectionOverWebsocket extends adb_connection_impl_1.AdbConnectionImpl {
    deviceSerialNumber;
    websocketUrl;
    streams = new Set();
    onDisconnect = (_) => { };
    constructor(deviceSerialNumber, websocketUrl) {
        super();
        this.deviceSerialNumber = deviceSerialNumber;
        this.websocketUrl = websocketUrl;
    }
    shell(cmd) {
        return this.openStream('shell:' + cmd);
    }
    connectSocket(path) {
        return this.openStream(path);
    }
    async openStream(destination) {
        return AdbOverWebsocketStream.create(this.websocketUrl, destination, this.deviceSerialNumber, this.closeStream.bind(this));
    }
    // The disconnection for AdbConnectionOverWebsocket is synchronous, but this
    // method is async to have a common interface with other types of connections
    // which are async.
    async disconnect(disconnectMessage) {
        for (const stream of this.streams) {
            stream.close();
        }
        this.onDisconnect(disconnectMessage);
    }
    closeStream(stream) {
        if (this.streams.has(stream)) {
            this.streams.delete(stream);
        }
    }
    // There will be no contention for the websocket connection, because it will
    // communicate with the 'adb server' running on the computer which opened
    // Perfetto.
    canConnectWithoutContention() {
        return Promise.resolve(true);
    }
}
exports.AdbConnectionOverWebsocket = AdbConnectionOverWebsocket;
// An AdbOverWebsocketStream instantiates a websocket connection to the device.
// It exposes an API to write commands to this websocket and read its output.
class AdbOverWebsocketStream {
    removeFromConnection;
    websocket;
    // commandSentSignal gets resolved if we successfully connect to the device
    // and send the command this socket wraps. commandSentSignal gets rejected if
    // we fail to connect to the device.
    commandSentSignal = (0, deferred_1.defer)();
    // We store a promise for each messge while the message is processed.
    // This way, if the websocket server closes the connection, we first process
    // all previously received messages and only afterwards disconnect.
    // An application is when the stream wraps a shell command. The websocket
    // server will reply and then immediately disconnect.
    messageProcessedSignals = new Set();
    _isConnected = false;
    onStreamDataCallbacks = [];
    onStreamCloseCallbacks = [];
    constructor(websocketUrl, destination, deviceSerialNumber, removeFromConnection) {
        this.removeFromConnection = removeFromConnection;
        this.websocket = new WebSocket(websocketUrl);
        this.websocket.onopen = this.onOpen.bind(this, deviceSerialNumber);
        this.websocket.onmessage = this.onMessage.bind(this, destination);
        // The websocket may be closed by the websocket server. This happens
        // for instance when we get the full result of a shell command.
        this.websocket.onclose = this.onClose.bind(this);
    }
    addOnStreamDataCallback(onStreamData) {
        this.onStreamDataCallbacks.push(onStreamData);
    }
    addOnStreamCloseCallback(onStreamClose) {
        this.onStreamCloseCallbacks.push(onStreamClose);
    }
    // Used by the connection object to signal newly received data, not exposed
    // in the interface.
    signalStreamData(data) {
        for (const onStreamData of this.onStreamDataCallbacks) {
            onStreamData(data);
        }
    }
    // Used by the connection object to signal the stream is closed, not exposed
    // in the interface.
    signalStreamClosed() {
        for (const onStreamClose of this.onStreamCloseCallbacks) {
            onStreamClose();
        }
        this.onStreamDataCallbacks = [];
        this.onStreamCloseCallbacks = [];
    }
    // We close the websocket and notify the AdbConnection to remove this stream.
    close() {
        // If the websocket connection is still open (ie. the close did not
        // originate from the server), we close the websocket connection.
        if (this.websocket.readyState === this.websocket.OPEN) {
            this.websocket.close();
            // We remove the 'onclose' callback so the 'close' method doesn't get
            // executed twice.
            this.websocket.onclose = null;
        }
        this._isConnected = false;
        this.removeFromConnection(this);
        this.signalStreamClosed();
    }
    // For websocket, the teardown happens synchronously.
    async closeAndWaitForTeardown() {
        this.close();
    }
    write(msg) {
        this.websocket.send(msg);
    }
    isConnected() {
        return this._isConnected;
    }
    async onOpen(deviceSerialNumber) {
        this.websocket.send((0, recording_utils_1.buildAbdWebsocketCommand)(`host:transport:${deviceSerialNumber}`));
    }
    async onMessage(destination, evt) {
        const messageProcessed = (0, deferred_1.defer)();
        this.messageProcessedSignals.add(messageProcessed);
        try {
            if (!this._isConnected) {
                const txt = (await evt.data.text());
                const prefix = txt.substring(0, 4);
                if (prefix === 'OKAY') {
                    this._isConnected = true;
                    this.websocket.send((0, recording_utils_1.buildAbdWebsocketCommand)(destination));
                    this.commandSentSignal.resolve(this);
                }
                else if (prefix === 'FAIL' && txt.includes('device unauthorized')) {
                    this.commandSentSignal.reject(new recording_error_handling_1.RecordingError(recording_utils_1.ALLOW_USB_DEBUGGING));
                    this.close();
                }
                else {
                    this.commandSentSignal.reject(new recording_error_handling_1.RecordingError(recording_utils_1.WEBSOCKET_UNABLE_TO_CONNECT));
                    this.close();
                }
            }
            else {
                // Upon a successful connection we first receive an 'OKAY' message.
                // After that, we receive messages with traced binary payloads.
                const arrayBufferResponse = await evt.data.arrayBuffer();
                if ((0, string_utils_1.utf8Decode)(arrayBufferResponse) !== 'OKAY') {
                    this.signalStreamData(new Uint8Array(arrayBufferResponse));
                }
            }
            messageProcessed.resolve();
        }
        finally {
            this.messageProcessedSignals.delete(messageProcessed);
        }
    }
    async onClose() {
        // Wait for all messages to be processed before closing the connection.
        await Promise.allSettled(this.messageProcessedSignals);
        this.close();
    }
    static create(websocketUrl, destination, deviceSerialNumber, removeFromConnection) {
        return new AdbOverWebsocketStream(websocketUrl, destination, deviceSerialNumber, removeFromConnection).commandSentSignal;
    }
}
exports.AdbOverWebsocketStream = AdbOverWebsocketStream;
//# sourceMappingURL=adb_connection_over_websocket.js.map