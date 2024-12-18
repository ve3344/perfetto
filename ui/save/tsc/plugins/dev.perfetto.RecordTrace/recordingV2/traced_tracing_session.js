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
exports.TracedTracingSession = void 0;
const tslib_1 = require("tslib");
const minimal_1 = tslib_1.__importDefault(require("protobufjs/minimal"));
const deferred_1 = require("../../../base/deferred");
const logging_1 = require("../../../base/logging");
const protos_1 = require("../protos");
const recording_error_handling_1 = require("./recording_error_handling");
const recording_utils_1 = require("./recording_utils");
const utils_1 = require("../../../base/utils");
// See wire_protocol.proto for more details.
const WIRE_PROTOCOL_HEADER_SIZE = 4;
// See basic_types.h (kIPCBufferSize) for more details.
const MAX_IPC_BUFFER_SIZE = 128 * 1024;
const PROTO_LEN_DELIMITED_WIRE_TYPE = 2;
const TRACE_PACKET_PROTO_ID = 1;
const TRACE_PACKET_PROTO_TAG = (TRACE_PACKET_PROTO_ID << 3) | PROTO_LEN_DELIMITED_WIRE_TYPE;
function parseMessageSize(buffer) {
    const dv = new DataView(buffer.buffer, buffer.byteOffset, buffer.length);
    return dv.getUint32(0, true);
}
// This class implements the protocol described in
// https://perfetto.dev/docs/design-docs/api-and-abi#tracing-protocol-abi
class TracedTracingSession {
    byteStream;
    tracingSessionListener;
    // Buffers received wire protocol data.
    incomingBuffer = new Uint8Array(MAX_IPC_BUFFER_SIZE);
    bufferedPartLength = 0;
    currentFrameLength;
    availableMethods = [];
    serviceId = -1;
    resolveBindingPromise;
    requestMethods = new Map();
    // Needed for ReadBufferResponse: all the trace packets are split into
    // several slices. |partialPacket| is the buffer for them. Once we receive a
    // slice with the flag |lastSliceForPacket|, a new packet is created.
    partialPacket = [];
    // Accumulates trace packets into a proto trace file..
    traceProtoWriter = minimal_1.default.Writer.create();
    // Accumulates DataSource objects from QueryServiceStateResponse,
    // which can have >1 replies for each query
    // go/codesearch/android/external/perfetto/protos/
    // perfetto/ipc/consumer_port.proto;l=243-246
    pendingDataSources = [];
    // For concurrent calls to 'QueryServiceState', we return the same value.
    pendingQssMessage;
    // Wire protocol request ID. After each request it is increased. It is needed
    // to keep track of the type of request, and parse the response correctly.
    requestId = 1;
    pendingStatsMessages = new Array();
    // The bytestream is obtained when creating a connection with a target.
    // For instance, the AdbStream is obtained from a connection with an Adb
    // device.
    constructor(byteStream, tracingSessionListener) {
        this.byteStream = byteStream;
        this.tracingSessionListener = tracingSessionListener;
        this.byteStream.addOnStreamDataCallback((data) => this.handleReceivedData(data));
        this.byteStream.addOnStreamCloseCallback(() => this.clearState());
    }
    queryServiceState() {
        if (this.pendingQssMessage) {
            return this.pendingQssMessage;
        }
        const requestProto = protos_1.QueryServiceStateRequest.encode(new protos_1.QueryServiceStateRequest()).finish();
        this.rpcInvoke('QueryServiceState', requestProto);
        return (this.pendingQssMessage = (0, deferred_1.defer)());
    }
    start(config) {
        const duration = config.durationMs;
        this.tracingSessionListener.onStatus(`${recording_utils_1.RECORDING_IN_PROGRESS}${duration ? ' for ' + duration.toString() + ' ms' : ''}...`);
        const enableTracingRequest = new protos_1.EnableTracingRequest();
        enableTracingRequest.traceConfig = config;
        const enableTracingRequestProto = protos_1.EnableTracingRequest.encode(enableTracingRequest).finish();
        this.rpcInvoke('EnableTracing', enableTracingRequestProto);
    }
    cancel() {
        this.terminateConnection();
    }
    stop() {
        const requestProto = protos_1.DisableTracingRequest.encode(new protos_1.DisableTracingRequest()).finish();
        this.rpcInvoke('DisableTracing', requestProto);
    }
    async getTraceBufferUsage() {
        if (!this.byteStream.isConnected()) {
            // TODO(octaviant): make this more in line with the other trace buffer
            //  error cases.
            return 0;
        }
        const bufferStats = await this.getBufferStats();
        let percentageUsed = -1;
        for (const buffer of bufferStats) {
            if (!Number.isFinite(buffer.bytesWritten) ||
                !Number.isFinite(buffer.bufferSize)) {
                continue;
            }
            const used = (0, logging_1.assertExists)(buffer.bytesWritten);
            const total = (0, logging_1.assertExists)(buffer.bufferSize);
            if (total >= 0) {
                percentageUsed = Math.max(percentageUsed, used / total);
            }
        }
        if (percentageUsed === -1) {
            return Promise.reject(new recording_error_handling_1.RecordingError(recording_utils_1.BUFFER_USAGE_INCORRECT_FORMAT));
        }
        return percentageUsed;
    }
    initConnection() {
        // bind IPC methods
        const requestId = this.requestId++;
        const frame = new protos_1.IPCFrame({
            requestId,
            msgBindService: new protos_1.IPCFrame.BindService({ serviceName: 'ConsumerPort' }),
        });
        this.writeFrame(frame);
        // We shouldn't bind multiple times to the service in the same tracing
        // session.
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        (0, logging_1.assertFalse)(!!this.resolveBindingPromise);
        this.resolveBindingPromise = (0, deferred_1.defer)();
        return this.resolveBindingPromise;
    }
    getBufferStats() {
        const getTraceStatsRequestProto = protos_1.GetTraceStatsRequest.encode(new protos_1.GetTraceStatsRequest()).finish();
        try {
            this.rpcInvoke('GetTraceStats', getTraceStatsRequestProto);
        }
        catch (e) {
            // GetTraceStats was introduced only on Android 10.
            this.raiseError(e);
        }
        const statsMessage = (0, deferred_1.defer)();
        this.pendingStatsMessages.push(statsMessage);
        return statsMessage;
    }
    terminateConnection() {
        this.clearState();
        const requestProto = protos_1.FreeBuffersRequest.encode(new protos_1.FreeBuffersRequest()).finish();
        this.rpcInvoke('FreeBuffers', requestProto);
        this.byteStream.close();
    }
    clearState() {
        for (const statsMessage of this.pendingStatsMessages) {
            statsMessage.reject(new recording_error_handling_1.RecordingError(recording_utils_1.BUFFER_USAGE_NOT_ACCESSIBLE));
        }
        this.pendingStatsMessages = [];
        this.pendingDataSources = [];
        this.pendingQssMessage = undefined;
    }
    rpcInvoke(methodName, argsProto) {
        if (!this.byteStream.isConnected()) {
            return;
        }
        const method = this.availableMethods.find((m) => m.name === methodName);
        if (!(0, utils_1.exists)(method) || !(0, utils_1.exists)(method.id)) {
            throw new recording_error_handling_1.RecordingError(`Method ${methodName} not supported by the target`);
        }
        const requestId = this.requestId++;
        const frame = new protos_1.IPCFrame({
            requestId,
            msgInvokeMethod: new protos_1.IPCFrame.InvokeMethod({
                serviceId: this.serviceId,
                methodId: method.id,
                argsProto,
            }),
        });
        this.requestMethods.set(requestId, methodName);
        this.writeFrame(frame);
    }
    writeFrame(frame) {
        const frameProto = protos_1.IPCFrame.encode(frame).finish();
        const frameLen = frameProto.length;
        const buf = new Uint8Array(WIRE_PROTOCOL_HEADER_SIZE + frameLen);
        const dv = new DataView(buf.buffer);
        dv.setUint32(0, frameProto.length, /* littleEndian */ true);
        for (let i = 0; i < frameLen; i++) {
            dv.setUint8(WIRE_PROTOCOL_HEADER_SIZE + i, frameProto[i]);
        }
        this.byteStream.write(buf);
    }
    handleReceivedData(rawData) {
        // we parse the length of the next frame if it's available
        if (this.currentFrameLength === undefined &&
            this.canCompleteLengthHeader(rawData)) {
            const remainingFrameBytes = WIRE_PROTOCOL_HEADER_SIZE - this.bufferedPartLength;
            this.appendToIncomingBuffer(rawData.subarray(0, remainingFrameBytes));
            rawData = rawData.subarray(remainingFrameBytes);
            this.currentFrameLength = parseMessageSize(this.incomingBuffer);
            this.bufferedPartLength = 0;
        }
        // Parse all complete frames.
        while (this.currentFrameLength !== undefined &&
            this.bufferedPartLength + rawData.length >= this.currentFrameLength) {
            // Read the remaining part of this message.
            const bytesToCompleteMessage = this.currentFrameLength - this.bufferedPartLength;
            this.appendToIncomingBuffer(rawData.subarray(0, bytesToCompleteMessage));
            this.parseFrame(this.incomingBuffer.subarray(0, this.currentFrameLength));
            this.bufferedPartLength = 0;
            // Remove the data just parsed.
            rawData = rawData.subarray(bytesToCompleteMessage);
            if (!this.canCompleteLengthHeader(rawData)) {
                this.currentFrameLength = undefined;
                break;
            }
            this.currentFrameLength = parseMessageSize(rawData);
            rawData = rawData.subarray(WIRE_PROTOCOL_HEADER_SIZE);
        }
        // Buffer the remaining data (part of the next message).
        this.appendToIncomingBuffer(rawData);
    }
    canCompleteLengthHeader(newData) {
        return newData.length + this.bufferedPartLength > WIRE_PROTOCOL_HEADER_SIZE;
    }
    appendToIncomingBuffer(array) {
        this.incomingBuffer.set(array, this.bufferedPartLength);
        this.bufferedPartLength += array.length;
    }
    parseFrame(frameBuffer) {
        // Get a copy of the ArrayBuffer to avoid the original being overriden.
        // See 170256902#comment21
        const frame = protos_1.IPCFrame.decode(frameBuffer.slice());
        if (frame.msg === 'msgBindServiceReply') {
            const msgBindServiceReply = frame.msgBindServiceReply;
            if ((0, utils_1.exists)(msgBindServiceReply) &&
                (0, utils_1.exists)(msgBindServiceReply.methods) &&
                (0, utils_1.exists)(msgBindServiceReply.serviceId)) {
                (0, logging_1.assertTrue)(msgBindServiceReply.success === true);
                this.availableMethods = msgBindServiceReply.methods;
                this.serviceId = msgBindServiceReply.serviceId;
                this.resolveBindingPromise.resolve();
            }
        }
        else if (frame.msg === 'msgInvokeMethodReply') {
            const msgInvokeMethodReply = frame.msgInvokeMethodReply;
            // We process messages without a `replyProto` field (for instance
            // `FreeBuffers` does not have `replyProto`). However, we ignore messages
            // without a valid 'success' field.
            if (msgInvokeMethodReply?.success !== true) {
                return;
            }
            const method = this.requestMethods.get(frame.requestId);
            if (!method) {
                this.raiseError(`${recording_utils_1.PARSING_UNKNWON_REQUEST_ID}: ${frame.requestId}`);
                return;
            }
            const decoder = decoders.get(method);
            if (decoder === undefined) {
                this.raiseError(`${recording_utils_1.PARSING_UNABLE_TO_DECODE_METHOD}: ${method}`);
                return;
            }
            const data = { ...decoder(msgInvokeMethodReply.replyProto) };
            if (method === 'ReadBuffers') {
                for (const slice of data.slices ?? []) {
                    this.partialPacket.push(slice);
                    if (slice.lastSliceForPacket === true) {
                        let bufferSize = 0;
                        for (const slice of this.partialPacket) {
                            bufferSize += slice.data.length;
                        }
                        const tracePacket = new Uint8Array(bufferSize);
                        let written = 0;
                        for (const slice of this.partialPacket) {
                            const data = slice.data;
                            tracePacket.set(data, written);
                            written += data.length;
                        }
                        this.traceProtoWriter.uint32(TRACE_PACKET_PROTO_TAG);
                        this.traceProtoWriter.bytes(tracePacket);
                        this.partialPacket = [];
                    }
                }
                if (msgInvokeMethodReply.hasMore === false) {
                    this.tracingSessionListener.onTraceData(this.traceProtoWriter.finish());
                    this.terminateConnection();
                }
            }
            else if (method === 'EnableTracing') {
                const readBuffersRequestProto = protos_1.ReadBuffersRequest.encode(new protos_1.ReadBuffersRequest()).finish();
                this.rpcInvoke('ReadBuffers', readBuffersRequestProto);
            }
            else if (method === 'GetTraceStats') {
                const maybePendingStatsMessage = this.pendingStatsMessages.shift();
                if (maybePendingStatsMessage) {
                    maybePendingStatsMessage.resolve(data?.traceStats?.bufferStats ?? []);
                }
            }
            else if (method === 'FreeBuffers') {
                // No action required. If we successfully read a whole trace,
                // we close the connection. Alternatively, if the tracing finishes
                // with an exception or if the user cancels it, we also close the
                // connection.
            }
            else if (method === 'DisableTracing') {
                // No action required. Same reasoning as for FreeBuffers.
            }
            else if (method === 'QueryServiceState') {
                const dataSources = data?.serviceState?.dataSources || [];
                for (const dataSource of dataSources) {
                    const name = dataSource?.dsDescriptor?.name;
                    if (name) {
                        this.pendingDataSources.push({
                            name,
                            descriptor: dataSource.dsDescriptor,
                        });
                    }
                }
                if (msgInvokeMethodReply.hasMore === false) {
                    (0, logging_1.assertExists)(this.pendingQssMessage).resolve(this.pendingDataSources);
                    this.pendingDataSources = [];
                    this.pendingQssMessage = undefined;
                }
            }
            else {
                this.raiseError(`${recording_utils_1.PARSING_UNRECOGNIZED_PORT}: ${method}`);
            }
        }
        else {
            this.raiseError(`${recording_utils_1.PARSING_UNRECOGNIZED_MESSAGE}: ${frame.msg}`);
        }
    }
    raiseError(message) {
        this.terminateConnection();
        this.tracingSessionListener.onError(message);
    }
}
exports.TracedTracingSession = TracedTracingSession;
const decoders = new Map()
    .set('EnableTracing', protos_1.EnableTracingResponse.decode)
    .set('FreeBuffers', protos_1.FreeBuffersResponse.decode)
    .set('ReadBuffers', protos_1.ReadBuffersResponse.decode)
    .set('DisableTracing', protos_1.DisableTracingResponse.decode)
    .set('GetTraceStats', protos_1.GetTraceStatsResponse.decode)
    .set('QueryServiceState', protos_1.QueryServiceStateResponse.decode);
//# sourceMappingURL=traced_tracing_session.js.map