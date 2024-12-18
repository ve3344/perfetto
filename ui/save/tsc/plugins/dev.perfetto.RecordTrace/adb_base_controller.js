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
exports.AdbBaseConsumerPort = exports.AdbConnectionState = void 0;
const utils_1 = require("../../base/utils");
const state_1 = require("./state");
const trace_config_utils_1 = require("./trace_config_utils");
const record_controller_interfaces_1 = require("./record_controller_interfaces");
var AdbConnectionState;
(function (AdbConnectionState) {
    AdbConnectionState[AdbConnectionState["READY_TO_CONNECT"] = 0] = "READY_TO_CONNECT";
    AdbConnectionState[AdbConnectionState["AUTH_IN_PROGRESS"] = 1] = "AUTH_IN_PROGRESS";
    AdbConnectionState[AdbConnectionState["CONNECTED"] = 2] = "CONNECTED";
    AdbConnectionState[AdbConnectionState["CLOSED"] = 3] = "CLOSED";
})(AdbConnectionState || (exports.AdbConnectionState = AdbConnectionState = {}));
class AdbBaseConsumerPort extends record_controller_interfaces_1.RpcConsumerPort {
    // Contains the commands sent while the authentication is in progress. They
    // will all be executed afterwards. If the device disconnects, they are
    // removed.
    commandQueue = [];
    adb;
    state = AdbConnectionState.READY_TO_CONNECT;
    device;
    recState;
    constructor(adb, consumer, recState) {
        super(consumer);
        this.adb = adb;
        this.recState = recState;
    }
    async handleCommand(method, params) {
        try {
            if (method === 'FreeBuffers') {
                // When we finish tracing, we disconnect the adb device interface.
                // Otherwise, we will keep holding the device interface and won't allow
                // adb to access it. https://wicg.github.io/webusb/#abusing-a-device
                // "Lastly, since USB devices are unable to distinguish requests from
                // multiple sources, operating systems only allow a USB interface to
                // have a single owning user-space or kernel-space driver."
                this.state = AdbConnectionState.CLOSED;
                await this.adb.disconnect();
            }
            else if (method === 'EnableTracing') {
                this.state = AdbConnectionState.READY_TO_CONNECT;
            }
            if (this.state === AdbConnectionState.CLOSED)
                return;
            this.commandQueue.push({ method, params });
            if (this.state === AdbConnectionState.READY_TO_CONNECT ||
                this.deviceDisconnected()) {
                this.state = AdbConnectionState.AUTH_IN_PROGRESS;
                this.device = await this.findDevice(this.recState.recordingTarget);
                if (!this.device) {
                    this.state = AdbConnectionState.READY_TO_CONNECT;
                    const target = this.recState.recordingTarget;
                    throw Error(`Device with serial ${(0, state_1.isAdbTarget)(target) ? target.serial : 'n/a'} not found.`);
                }
                this.sendStatus(`Please allow USB debugging on device.
          If you press cancel, reload the page.`);
                await this.adb.connect(this.device);
                // During the authentication the device may have been disconnected.
                if (!this.recState.recordingInProgress || this.deviceDisconnected()) {
                    throw Error('Recording not in progress after adb authorization.');
                }
                this.state = AdbConnectionState.CONNECTED;
                this.sendStatus('Device connected.');
            }
            if (this.state === AdbConnectionState.AUTH_IN_PROGRESS)
                return;
            console.assert(this.state === AdbConnectionState.CONNECTED);
            for (const cmd of this.commandQueue)
                this.invoke(cmd.method, cmd.params);
            this.commandQueue = [];
        }
        catch (e) {
            this.commandQueue = [];
            this.state = AdbConnectionState.READY_TO_CONNECT;
            this.sendErrorMessage(e.message);
        }
    }
    deviceDisconnected() {
        return !this.device || !this.device.opened;
    }
    setDurationStatus(enableTracingProto) {
        const traceConfigProto = (0, trace_config_utils_1.extractTraceConfig)(enableTracingProto);
        if (!traceConfigProto)
            return;
        const duration = (0, trace_config_utils_1.extractDurationFromTraceConfig)(traceConfigProto);
        this.sendStatus(`Recording in progress${(0, utils_1.exists)(duration) ? ' for ' + duration.toString() + ' ms' : ''}...`);
    }
    generateChunkReadResponse(data, last = false) {
        return {
            type: 'ReadBuffersResponse',
            slices: [{ data, lastSliceForPacket: last }],
        };
    }
    async findDevice(connectedDevice) {
        if (!('usb' in navigator))
            return undefined;
        if (!(0, state_1.isAdbTarget)(connectedDevice))
            return undefined;
        const devices = await navigator.usb.getDevices();
        return devices.find((d) => d.serialNumber === connectedDevice.serial);
    }
}
exports.AdbBaseConsumerPort = AdbBaseConsumerPort;
//# sourceMappingURL=adb_base_controller.js.map