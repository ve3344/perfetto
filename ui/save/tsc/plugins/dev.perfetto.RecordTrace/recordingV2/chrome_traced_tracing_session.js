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
exports.ChromeTracedTracingSession = void 0;
const deferred_1 = require("../../../base/deferred");
const logging_1 = require("../../../base/logging");
const string_utils_1 = require("../../../base/string_utils");
const chrome_proxy_record_controller_1 = require("../chrome_proxy_record_controller");
const consumer_port_types_1 = require("../consumer_port_types");
const protos_1 = require("../protos");
const recording_error_handling_1 = require("./recording_error_handling");
const recording_utils_1 = require("./recording_utils");
// This class implements the protocol described in
// https://perfetto.dev/docs/design-docs/api-and-abi#tracing-protocol-abi
// However, with the Chrome extension we communicate using JSON messages.
class ChromeTracedTracingSession {
    tracingSessionListener;
    // Needed for ReadBufferResponse: all the trace packets are split into
    // several slices. |partialPacket| is the buffer for them. Once we receive a
    // slice with the flag |lastSliceForPacket|, a new packet is created.
    partialPacket = [];
    // For concurrent calls to 'GetCategories', we return the same value.
    pendingGetCategoriesMessage;
    pendingStatsMessages = new Array();
    // Port through which we communicate with the extension.
    chromePort;
    // True when Perfetto is connected via the port to the tracing session.
    isPortConnected;
    constructor(tracingSessionListener) {
        this.tracingSessionListener = tracingSessionListener;
        this.chromePort = chrome.runtime.connect(recording_utils_1.EXTENSION_ID);
        this.isPortConnected = true;
    }
    start(config) {
        if (!this.isPortConnected)
            return;
        const duration = config.durationMs;
        this.tracingSessionListener.onStatus(`Recording in progress${duration ? ' for ' + duration.toString() + ' ms' : ''}...`);
        const enableTracingRequest = new protos_1.EnableTracingRequest();
        enableTracingRequest.traceConfig = config;
        const enableTracingRequestProto = (0, string_utils_1.binaryEncode)(protos_1.EnableTracingRequest.encode(enableTracingRequest).finish());
        this.chromePort.postMessage({
            method: 'EnableTracing',
            requestData: enableTracingRequestProto,
        });
    }
    // The 'cancel' method will end the tracing session and will NOT return the
    // trace. Therefore, we do not need to keep the connection open.
    cancel() {
        if (!this.isPortConnected)
            return;
        this.terminateConnection();
    }
    // The 'stop' method will end the tracing session and cause the trace to be
    // returned via a callback. We maintain the connection to the target so we can
    // extract the trace.
    // See 'DisableTracing' in:
    // https://perfetto.dev/docs/design-docs/life-of-a-tracing-session
    stop() {
        if (!this.isPortConnected)
            return;
        this.chromePort.postMessage({ method: 'DisableTracing' });
    }
    getCategories() {
        if (!this.isPortConnected) {
            throw new recording_error_handling_1.RecordingError('Attempting to get categories from a ' +
                'disconnected tracing session.');
        }
        if (this.pendingGetCategoriesMessage) {
            return this.pendingGetCategoriesMessage;
        }
        this.chromePort.postMessage({ method: 'GetCategories' });
        return (this.pendingGetCategoriesMessage = (0, deferred_1.defer)());
    }
    async getTraceBufferUsage() {
        if (!this.isPortConnected)
            return 0;
        const bufferStats = await this.getBufferStats();
        let percentageUsed = -1;
        for (const buffer of bufferStats) {
            const used = (0, logging_1.assertExists)(buffer.bytesWritten);
            const total = (0, logging_1.assertExists)(buffer.bufferSize);
            if (total >= 0) {
                percentageUsed = Math.max(percentageUsed, used / total);
            }
        }
        if (percentageUsed === -1) {
            throw new recording_error_handling_1.RecordingError(recording_utils_1.BUFFER_USAGE_INCORRECT_FORMAT);
        }
        return percentageUsed;
    }
    initConnection() {
        this.chromePort.onMessage.addListener((message) => {
            this.handleExtensionMessage(message);
        });
    }
    getBufferStats() {
        this.chromePort.postMessage({ method: 'GetTraceStats' });
        const statsMessage = (0, deferred_1.defer)();
        this.pendingStatsMessages.push(statsMessage);
        return statsMessage;
    }
    terminateConnection() {
        this.chromePort.postMessage({ method: 'FreeBuffers' });
        this.clearState();
    }
    clearState() {
        this.chromePort.disconnect();
        this.isPortConnected = false;
        for (const statsMessage of this.pendingStatsMessages) {
            statsMessage.reject(new recording_error_handling_1.RecordingError(recording_utils_1.BUFFER_USAGE_NOT_ACCESSIBLE));
        }
        this.pendingStatsMessages = [];
        this.pendingGetCategoriesMessage = undefined;
    }
    handleExtensionMessage(message) {
        if ((0, chrome_proxy_record_controller_1.isChromeExtensionError)(message)) {
            this.terminateConnection();
            this.tracingSessionListener.onError(message.error);
        }
        else if ((0, chrome_proxy_record_controller_1.isChromeExtensionStatus)(message)) {
            this.tracingSessionListener.onStatus(message.status);
        }
        else if ((0, consumer_port_types_1.isReadBuffersResponse)(message)) {
            if (!message.slices) {
                return;
            }
            for (const messageSlice of message.slices) {
                // The extension sends the binary data as a string.
                // see http://shortn/_oPmO2GT6Vb
                if (typeof messageSlice.data !== 'string') {
                    throw new recording_error_handling_1.RecordingError(recording_utils_1.MALFORMED_EXTENSION_MESSAGE);
                }
                const decodedSlice = {
                    data: (0, string_utils_1.binaryDecode)(messageSlice.data),
                };
                this.partialPacket.push(decodedSlice);
                if (messageSlice.lastSliceForPacket) {
                    let bufferSize = 0;
                    for (const slice of this.partialPacket) {
                        bufferSize += slice.data.length;
                    }
                    const completeTrace = new Uint8Array(bufferSize);
                    let written = 0;
                    for (const slice of this.partialPacket) {
                        const data = slice.data;
                        completeTrace.set(data, written);
                        written += data.length;
                    }
                    // The trace already comes encoded as a proto.
                    this.tracingSessionListener.onTraceData(completeTrace);
                    this.terminateConnection();
                }
            }
        }
        else if ((0, chrome_proxy_record_controller_1.isGetCategoriesResponse)(message)) {
            (0, logging_1.assertExists)(this.pendingGetCategoriesMessage).resolve(message.categories);
            this.pendingGetCategoriesMessage = undefined;
        }
        else if ((0, consumer_port_types_1.isEnableTracingResponse)(message)) {
            // Once the service notifies us that a tracing session is enabled,
            // we can start streaming the response using 'ReadBuffers'.
            this.chromePort.postMessage({ method: 'ReadBuffers' });
        }
        else if ((0, consumer_port_types_1.isGetTraceStatsResponse)(message)) {
            const maybePendingStatsMessage = this.pendingStatsMessages.shift();
            if (maybePendingStatsMessage) {
                maybePendingStatsMessage.resolve(message?.traceStats?.bufferStats || []);
            }
        }
        else if ((0, consumer_port_types_1.isFreeBuffersResponse)(message)) {
            // No action required. If we successfully read a whole trace,
            // we close the connection. Alternatively, if the tracing finishes
            // with an exception or if the user cancels it, we also close the
            // connection.
        }
        else {
            (0, logging_1.assertTrue)((0, consumer_port_types_1.isDisableTracingResponse)(message));
            // No action required. Same reasoning as for FreeBuffers.
        }
    }
}
exports.ChromeTracedTracingSession = ChromeTracedTracingSession;
//# sourceMappingURL=chrome_traced_tracing_session.js.map