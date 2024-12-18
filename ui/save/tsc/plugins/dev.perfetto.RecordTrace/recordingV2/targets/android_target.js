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
exports.AndroidTarget = void 0;
const http_utils_1 = require("../../../../base/http_utils");
const utils_1 = require("../../../../base/utils");
const perfetto_version_1 = require("../../../../gen/perfetto_version");
const recording_utils_1 = require("../recording_utils");
const traced_tracing_session_1 = require("../traced_tracing_session");
class AndroidTarget {
    adbConnection;
    onTargetChange;
    consumerSocketPath = recording_utils_1.DEFAULT_TRACED_CONSUMER_SOCKET_PATH;
    androidApiLevel;
    dataSources;
    constructor(adbConnection, onTargetChange) {
        this.adbConnection = adbConnection;
        this.onTargetChange = onTargetChange;
    }
    // This is called when a usb USBConnectionEvent of type 'disconnect' event is
    // emitted. This event is emitted when the USB connection is lost (example:
    // when the user unplugged the connecting cable).
    async disconnect(disconnectMessage) {
        await this.adbConnection.disconnect(disconnectMessage);
    }
    // Starts a tracing session in order to fetch information such as apiLevel
    // and dataSources from the device. Then, it cancels the session.
    async fetchTargetInfo(listener) {
        const tracingSession = await this.createTracingSession(listener);
        tracingSession.cancel();
    }
    // We do not support long tracing on Android.
    canCreateTracingSession(recordingMode) {
        return recordingMode !== 'LONG_TRACE';
    }
    async createTracingSession(tracingSessionListener) {
        this.adbConnection.onStatus = tracingSessionListener.onStatus;
        this.adbConnection.onDisconnect = tracingSessionListener.onDisconnect;
        if (!(0, utils_1.exists)(this.androidApiLevel)) {
            // 1. Fetch the API version from the device.
            const version = await this.adbConnection.shellAndGetOutput('getprop ro.build.version.sdk');
            this.androidApiLevel = Number(version);
            this.onTargetChange();
            // 2. For older OS versions we push the tracebox binary.
            if (this.androidApiLevel < 29) {
                await this.pushTracebox();
                this.consumerSocketPath = recording_utils_1.CUSTOM_TRACED_CONSUMER_SOCKET_PATH;
                await this.adbConnection.shellAndWaitCompletion(this.composeTraceboxCommand('traced'));
                await this.adbConnection.shellAndWaitCompletion(this.composeTraceboxCommand('traced_probes'));
            }
        }
        const adbStream = await this.adbConnection.connectSocket(this.consumerSocketPath);
        // 3. Start a tracing session.
        const tracingSession = new traced_tracing_session_1.TracedTracingSession(adbStream, tracingSessionListener);
        await tracingSession.initConnection();
        if (!this.dataSources) {
            // 4. Fetch dataSources from QueryServiceState.
            this.dataSources = await tracingSession.queryServiceState();
            this.onTargetChange();
        }
        return tracingSession;
    }
    async pushTracebox() {
        const arch = await this.fetchArchitecture();
        const shortVersion = perfetto_version_1.VERSION.split('-')[0];
        const requestUrl = `https://commondatastorage.googleapis.com/perfetto-luci-artifacts/${shortVersion}/${arch}/tracebox`;
        const fetchResponse = await (0, http_utils_1.fetchWithTimeout)(requestUrl, { method: 'get' }, recording_utils_1.TRACEBOX_FETCH_TIMEOUT);
        const traceboxBin = await fetchResponse.arrayBuffer();
        await this.adbConnection.push(new Uint8Array(traceboxBin), recording_utils_1.TRACEBOX_DEVICE_PATH);
        // We explicitly set the tracebox permissions because adb does not reliably
        // set permissions when uploading the binary.
        await this.adbConnection.shellAndWaitCompletion(`chmod 755 ${recording_utils_1.TRACEBOX_DEVICE_PATH}`);
    }
    async fetchArchitecture() {
        const abiList = await this.adbConnection.shellAndGetOutput('getprop ro.vendor.product.cpu.abilist');
        // If multiple ABIs are allowed, the 64bit ones should have higher priority.
        if (abiList.includes('arm64-v8a')) {
            return 'android-arm64';
        }
        else if (abiList.includes('x86')) {
            return 'android-x86';
        }
        else if (abiList.includes('armeabi-v7a') || abiList.includes('armeabi')) {
            return 'android-arm';
        }
        else if (abiList.includes('x86_64')) {
            return 'android-x64';
        }
        // Most devices have arm64 architectures, so we should return this if
        // nothing else is found.
        return 'android-arm64';
    }
    canConnectWithoutContention() {
        return this.adbConnection.canConnectWithoutContention();
    }
    composeTraceboxCommand(applet) {
        // 1. Set the consumer socket.
        return ('PERFETTO_CONSUMER_SOCK_NAME=@traced_consumer ' +
            // 2. Set the producer socket.
            'PERFETTO_PRODUCER_SOCK_NAME=@traced_producer ' +
            // 3. Start the applet in the background.
            `/data/local/tmp/tracebox ${applet} --background`);
    }
}
exports.AndroidTarget = AndroidTarget;
//# sourceMappingURL=android_target.js.map