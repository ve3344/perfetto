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
exports.AndroidWebsocketTargetFactory = exports.WebsocketConnection = exports.ANDROID_WEBSOCKET_TARGET_FACTORY = void 0;
exports.parseWebsocketResponse = parseWebsocketResponse;
const recording_utils_1 = require("../recording_utils");
const android_websocket_target_1 = require("../targets/android_websocket_target");
exports.ANDROID_WEBSOCKET_TARGET_FACTORY = 'AndroidWebsocketTargetFactory';
// https://cs.android.com/android/platform/superproject/+/main:packages/
// modules/adb/SERVICES.TXT;l=135
const PREFIX_LENGTH = 4;
// We issue the command 'track-devices' which will encode the short form
// of the device:
// see go/codesearch/android/packages/modules/adb/services.cpp;l=244-245
// and go/codesearch/android/packages/modules/adb/transport.cpp;l=1417-1420
// Therefore a line will contain solely the device serial number and the
// connectionState (and no other properties).
function parseListedDevice(line) {
    const parts = line.split('\t');
    if (parts.length === 2) {
        return {
            serialNumber: parts[0],
            connectionState: parts[1],
        };
    }
    return undefined;
}
function parseWebsocketResponse(message) {
    // A response we receive on the websocket contains multiple messages:
    // "{m1.length}{m1.payload}{m2.length}{m2.payload}..."
    // where m1, m2 are messages
    // Each message has the form:
    // "{message.length}SN1\t${connectionState1}\nSN2\t${connectionState2}\n..."
    // where SN1, SN2 are device serial numbers
    // and connectionState1, connectionState2 are adb connection states, created
    // here: go/codesearch/android/packages/modules/adb/adb.cpp;l=115-139
    const latestStatusByDevice = new Map();
    while (message.length >= PREFIX_LENGTH) {
        const payloadLength = parseInt(message.substring(0, PREFIX_LENGTH), 16);
        const prefixAndPayloadLength = PREFIX_LENGTH + payloadLength;
        if (message.length < prefixAndPayloadLength) {
            break;
        }
        const payload = message.substring(PREFIX_LENGTH, prefixAndPayloadLength);
        for (const line of payload.split('\n')) {
            const listedDevice = parseListedDevice(line);
            if (listedDevice) {
                // We overwrite previous states for the same serial number.
                latestStatusByDevice.set(listedDevice.serialNumber, listedDevice.connectionState);
            }
        }
        message = message.substring(prefixAndPayloadLength);
    }
    const listedDevices = [];
    for (const [serialNumber, connectionState,] of latestStatusByDevice.entries()) {
        listedDevices.push({ serialNumber, connectionState });
    }
    return { listedDevices, messageRemainder: message };
}
class WebsocketConnection {
    websocket;
    maybeClearConnection;
    onTargetChange;
    targets = new Map();
    pendingData = '';
    constructor(websocket, maybeClearConnection, onTargetChange) {
        this.websocket = websocket;
        this.maybeClearConnection = maybeClearConnection;
        this.onTargetChange = onTargetChange;
        this.initWebsocket();
    }
    listTargets() {
        return Array.from(this.targets.values());
    }
    // Setup websocket callbacks.
    initWebsocket() {
        this.websocket.onclose = (ev) => {
            if (ev.code === recording_utils_1.WEBSOCKET_CLOSED_ABNORMALLY_CODE) {
                console.info(`It's safe to ignore the 'WebSocket connection to ${this.websocket.url} error above, if present. It occurs when ` +
                    'checking the connection to the local Websocket server.');
            }
            this.maybeClearConnection(this);
            this.close();
        };
        // once the websocket is open, we start tracking the devices
        this.websocket.onopen = () => {
            this.websocket.send((0, recording_utils_1.buildAbdWebsocketCommand)('host:track-devices'));
        };
        this.websocket.onmessage = async (evt) => {
            let resp = await evt.data.text();
            if (resp.substr(0, 4) === 'OKAY') {
                resp = resp.substr(4);
            }
            const parsingResult = parseWebsocketResponse(this.pendingData + resp);
            this.pendingData = parsingResult.messageRemainder;
            this.trackDevices(parsingResult.listedDevices);
        };
    }
    close() {
        // The websocket connection may have already been closed by the websocket
        // server.
        if (this.websocket.readyState === this.websocket.OPEN) {
            this.websocket.close();
        }
        // Disconnect all the targets, to release all the websocket connections that
        // they hold and end their tracing sessions.
        for (const target of this.targets.values()) {
            target.disconnect();
        }
        this.targets.clear();
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (this.onTargetChange) {
            this.onTargetChange();
        }
    }
    getUrl() {
        return this.websocket.url;
    }
    // Handle messages received over the websocket regarding devices connecting
    // or disconnecting.
    trackDevices(listedDevices) {
        // When a SN becomes offline, we should remove it from the list
        // of targets. Otherwise, we should check if it maps to a target. If the
        // SN does not map to a target, we should create one for it.
        let targetsUpdated = false;
        for (const listedDevice of listedDevices) {
            if (['offline', 'unknown'].includes(listedDevice.connectionState)) {
                const target = this.targets.get(listedDevice.serialNumber);
                if (target === undefined) {
                    continue;
                }
                target.disconnect();
                this.targets.delete(listedDevice.serialNumber);
                targetsUpdated = true;
            }
            else if (!this.targets.has(listedDevice.serialNumber)) {
                this.targets.set(listedDevice.serialNumber, new android_websocket_target_1.AndroidWebsocketTarget(listedDevice.serialNumber, this.websocket.url, this.onTargetChange));
                targetsUpdated = true;
            }
        }
        // Notify the calling code that the list of targets has been updated.
        if (targetsUpdated) {
            this.onTargetChange();
        }
    }
}
exports.WebsocketConnection = WebsocketConnection;
class AndroidWebsocketTargetFactory {
    kind = exports.ANDROID_WEBSOCKET_TARGET_FACTORY;
    onTargetChange = () => { };
    websocketConnection;
    getName() {
        return 'Android Websocket';
    }
    listTargets() {
        return this.websocketConnection
            ? this.websocketConnection.listTargets()
            : [];
    }
    listRecordingProblems() {
        return [];
    }
    // This interface method can not return anything because a websocket target
    // can not be created on user input. It can only be created when the websocket
    // server detects a new target.
    connectNewTarget() {
        return Promise.reject(new Error('The websocket can only automatically connect targets ' +
            'when they become available.'));
    }
    tryEstablishWebsocket(websocketUrl) {
        if (this.websocketConnection) {
            if (this.websocketConnection.getUrl() === websocketUrl) {
                return;
            }
            else {
                this.websocketConnection.close();
            }
        }
        const websocket = new WebSocket(websocketUrl);
        this.websocketConnection = new WebsocketConnection(websocket, this.maybeClearConnection, this.onTargetChange);
    }
    maybeClearConnection(connection) {
        if (this.websocketConnection === connection) {
            this.websocketConnection = undefined;
        }
    }
    setOnTargetChange(onTargetChange) {
        this.onTargetChange = onTargetChange;
    }
}
exports.AndroidWebsocketTargetFactory = AndroidWebsocketTargetFactory;
//# sourceMappingURL=android_websocket_target_factory.js.map