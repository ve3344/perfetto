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
exports.AdbSocketConsumerPort = void 0;
const tslib_1 = require("tslib");
const minimal_1 = tslib_1.__importDefault(require("protobufjs/minimal"));
const protos_1 = require("./protos");
const adb_base_controller_1 = require("./adb_base_controller");
const consumer_port_types_1 = require("./consumer_port_types");
const utils_1 = require("../../base/utils");
const logging_1 = require("../../base/logging");
var SocketState;
(function (SocketState) {
    SocketState[SocketState["DISCONNECTED"] = 0] = "DISCONNECTED";
    SocketState[SocketState["BINDING_IN_PROGRESS"] = 1] = "BINDING_IN_PROGRESS";
    SocketState[SocketState["BOUND"] = 2] = "BOUND";
})(SocketState || (SocketState = {}));
// See wire_protocol.proto for more details.
const WIRE_PROTOCOL_HEADER_SIZE = 4;
const MAX_IPC_BUFFER_SIZE = 128 * 1024;
const PROTO_LEN_DELIMITED_WIRE_TYPE = 2;
const TRACE_PACKET_PROTO_ID = 1;
const TRACE_PACKET_PROTO_TAG = (TRACE_PACKET_PROTO_ID << 3) | PROTO_LEN_DELIMITED_WIRE_TYPE;
const TRACED_SOCKET = '/dev/socket/traced_consumer';
class AdbSocketConsumerPort extends adb_base_controller_1.AdbBaseConsumerPort {
    socketState = SocketState.DISCONNECTED;
    socket;
    // Wire protocol request ID. After each request it is increased. It is needed
    // to keep track of the type of request, and parse the response correctly.
    requestId = 1;
    // Buffers received wire protocol data.
    incomingBuffer = new Uint8Array(MAX_IPC_BUFFER_SIZE);
    incomingBufferLen = 0;
    frameToParseLen = 0;
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
    socketCommandQueue = [];
    constructor(adb, consumer, recState) {
        super(adb, consumer, recState);
    }
    async invoke(method, params) {
        // ADB connection & authentication is handled by the superclass.
        console.assert(this.state === adb_base_controller_1.AdbConnectionState.CONNECTED);
        this.socketCommandQueue.push({ method, params });
        if (this.socketState === SocketState.BINDING_IN_PROGRESS)
            return;
        if (this.socketState === SocketState.DISCONNECTED) {
            this.socketState = SocketState.BINDING_IN_PROGRESS;
            await this.listenForMessages();
            await this.bind();
            this.traceProtoWriter = minimal_1.default.Writer.create();
            this.socketState = SocketState.BOUND;
        }
        console.assert(this.socketState === SocketState.BOUND);
        for (const cmd of this.socketCommandQueue) {
            this.invokeInternal(cmd.method, cmd.params);
        }
        this.socketCommandQueue = [];
    }
    invokeInternal(method, argsProto) {
        // Socket is bound in invoke().
        console.assert(this.socketState === SocketState.BOUND);
        const requestId = this.requestId++;
        const methodId = this.findMethodId(method);
        if (methodId === undefined) {
            // This can happen with 'GetTraceStats': it seems that not all the Android
            // <= 9 devices support it.
            console.error(`Method ${method} not supported by the target`);
            return;
        }
        const frame = new protos_1.IPCFrame({
            requestId,
            msgInvokeMethod: new protos_1.IPCFrame.InvokeMethod({
                serviceId: this.serviceId,
                methodId,
                argsProto,
            }),
        });
        this.requestMethods.set(requestId, method);
        this.sendFrame(frame);
        if (method === 'EnableTracing')
            this.setDurationStatus(argsProto);
    }
    static generateFrameBufferToSend(frame) {
        const frameProto = protos_1.IPCFrame.encode(frame).finish();
        const frameLen = frameProto.length;
        const buf = new Uint8Array(WIRE_PROTOCOL_HEADER_SIZE + frameLen);
        const dv = new DataView(buf.buffer);
        dv.setUint32(0, frameProto.length, /* littleEndian */ true);
        for (let i = 0; i < frameLen; i++) {
            dv.setUint8(WIRE_PROTOCOL_HEADER_SIZE + i, frameProto[i]);
        }
        return buf;
    }
    async sendFrame(frame) {
        console.assert(this.socket !== undefined);
        if (!this.socket)
            return;
        const buf = AdbSocketConsumerPort.generateFrameBufferToSend(frame);
        await this.socket.write(buf);
    }
    async listenForMessages() {
        this.socket = await this.adb.socket(TRACED_SOCKET);
        this.socket.onData = (raw) => this.handleReceivedData(raw);
        this.socket.onClose = () => {
            this.socketState = SocketState.DISCONNECTED;
            this.socketCommandQueue = [];
        };
    }
    parseMessageSize(buffer) {
        const dv = new DataView(buffer.buffer, buffer.byteOffset, buffer.length);
        return dv.getUint32(0, true);
    }
    parseMessage(frameBuffer) {
        // Copy message to new array:
        const buf = new ArrayBuffer(frameBuffer.byteLength);
        const arr = new Uint8Array(buf);
        arr.set(frameBuffer);
        const frame = protos_1.IPCFrame.decode(arr);
        this.handleIncomingFrame(frame);
    }
    incompleteSizeHeader() {
        if (!this.frameToParseLen) {
            console.assert(this.incomingBufferLen < WIRE_PROTOCOL_HEADER_SIZE);
            return true;
        }
        return false;
    }
    canCompleteSizeHeader(newData) {
        return newData.length + this.incomingBufferLen > WIRE_PROTOCOL_HEADER_SIZE;
    }
    canParseFullMessage(newData) {
        return (this.frameToParseLen &&
            this.incomingBufferLen + newData.length >= this.frameToParseLen);
    }
    appendToIncomingBuffer(array) {
        this.incomingBuffer.set(array, this.incomingBufferLen);
        this.incomingBufferLen += array.length;
    }
    handleReceivedData(newData) {
        if (this.incompleteSizeHeader() && this.canCompleteSizeHeader(newData)) {
            const newDataBytesToRead = WIRE_PROTOCOL_HEADER_SIZE - this.incomingBufferLen;
            // Add to the incoming buffer the remaining bytes to arrive at
            // WIRE_PROTOCOL_HEADER_SIZE
            this.appendToIncomingBuffer(newData.subarray(0, newDataBytesToRead));
            newData = newData.subarray(newDataBytesToRead);
            this.frameToParseLen = this.parseMessageSize(this.incomingBuffer);
            this.incomingBufferLen = 0;
        }
        // Parse all complete messages in incomingBuffer and newData.
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        while (this.canParseFullMessage(newData)) {
            // All the message is in the newData buffer.
            if (this.incomingBufferLen === 0) {
                this.parseMessage(newData.subarray(0, this.frameToParseLen));
                newData = newData.subarray(this.frameToParseLen);
            }
            else {
                // We need to complete the local buffer.
                // Read the remaining part of this message.
                const bytesToCompleteMessage = this.frameToParseLen - this.incomingBufferLen;
                this.appendToIncomingBuffer(newData.subarray(0, bytesToCompleteMessage));
                this.parseMessage(this.incomingBuffer.subarray(0, this.frameToParseLen));
                this.incomingBufferLen = 0;
                // Remove the data just parsed.
                newData = newData.subarray(bytesToCompleteMessage);
            }
            this.frameToParseLen = 0;
            if (!this.canCompleteSizeHeader(newData))
                break;
            this.frameToParseLen = this.parseMessageSize(newData.subarray(0, WIRE_PROTOCOL_HEADER_SIZE));
            newData = newData.subarray(WIRE_PROTOCOL_HEADER_SIZE);
        }
        // Buffer the remaining data (part of the next header + message).
        this.appendToIncomingBuffer(newData);
    }
    decodeResponse(requestId, responseProto, hasMore = false) {
        const method = this.requestMethods.get(requestId);
        if (!method) {
            console.error(`Unknown request id: ${requestId}`);
            this.sendErrorMessage(`Wire protocol error.`);
            return;
        }
        const decoder = decoders.get(method);
        if (decoder === undefined) {
            console.error(`Unable to decode method: ${method}`);
            return;
        }
        const decodedResponse = decoder(responseProto);
        const response = { type: `${method}Response`, ...decodedResponse };
        // TODO(nicomazz): Fix this.
        // We assemble all the trace and then send it back to the main controller.
        // This is a temporary solution, that will be changed in a following CL,
        // because now both the chrome consumer port and the other adb consumer port
        // send back the entire trace, while the correct behavior should be to send
        // back the slices, that are assembled by the main record controller.
        if ((0, consumer_port_types_1.isReadBuffersResponse)(response)) {
            if (response.slices)
                this.handleSlices(response.slices);
            if (!hasMore)
                this.sendReadBufferResponse();
            return;
        }
        this.sendMessage(response);
    }
    handleSlices(slices) {
        for (const slice of slices) {
            this.partialPacket.push(slice);
            if (slice.lastSliceForPacket) {
                const tracePacket = this.generateTracePacket(this.partialPacket);
                this.traceProtoWriter.uint32(TRACE_PACKET_PROTO_TAG);
                this.traceProtoWriter.bytes(tracePacket);
                this.partialPacket = [];
            }
        }
    }
    generateTracePacket(slices) {
        let bufferSize = 0;
        for (const slice of slices)
            bufferSize += slice.data.length;
        const fullBuffer = new Uint8Array(bufferSize);
        let written = 0;
        for (const slice of slices) {
            const data = slice.data;
            fullBuffer.set(data, written);
            written += data.length;
        }
        return fullBuffer;
    }
    sendReadBufferResponse() {
        this.sendMessage(this.generateChunkReadResponse(this.traceProtoWriter.finish(), 
        /* last */ true));
        this.traceProtoWriter = minimal_1.default.Writer.create();
    }
    bind() {
        console.assert(this.socket !== undefined);
        const requestId = this.requestId++;
        const frame = new protos_1.IPCFrame({
            requestId,
            msgBindService: new protos_1.IPCFrame.BindService({ serviceName: 'ConsumerPort' }),
        });
        return new Promise((resolve, _) => {
            this.resolveBindingPromise = resolve;
            this.sendFrame(frame);
        });
    }
    findMethodId(method) {
        const methodObject = this.availableMethods.find((m) => m.name === method);
        return methodObject?.id ?? undefined;
    }
    static async hasSocketAccess(device, adb) {
        await adb.connect(device);
        try {
            const socket = await adb.socket(TRACED_SOCKET);
            socket.close();
            return true;
        }
        catch (e) {
            return false;
        }
    }
    handleIncomingFrame(frame) {
        const requestId = frame.requestId;
        switch (frame.msg) {
            case 'msgBindServiceReply': {
                const msgBindServiceReply = frame.msgBindServiceReply;
                if ((0, utils_1.exists)(msgBindServiceReply) &&
                    (0, utils_1.exists)(msgBindServiceReply.methods) &&
                    (0, utils_1.exists)(msgBindServiceReply.serviceId)) {
                    (0, logging_1.assertTrue)(msgBindServiceReply.success === true);
                    this.availableMethods = msgBindServiceReply.methods;
                    this.serviceId = msgBindServiceReply.serviceId;
                    this.resolveBindingPromise();
                    this.resolveBindingPromise = () => { };
                }
                return;
            }
            case 'msgInvokeMethodReply': {
                const msgInvokeMethodReply = frame.msgInvokeMethodReply;
                if (msgInvokeMethodReply && msgInvokeMethodReply.replyProto) {
                    if (!msgInvokeMethodReply.success) {
                        console.error('Unsuccessful method invocation: ', msgInvokeMethodReply);
                        return;
                    }
                    this.decodeResponse(requestId, msgInvokeMethodReply.replyProto, msgInvokeMethodReply.hasMore === true);
                }
                return;
            }
            default:
                console.error(`not recognized frame message: ${frame.msg}`);
        }
    }
}
exports.AdbSocketConsumerPort = AdbSocketConsumerPort;
const decoders = new Map()
    .set('EnableTracing', protos_1.EnableTracingResponse.decode)
    .set('FreeBuffers', protos_1.FreeBuffersResponse.decode)
    .set('ReadBuffers', protos_1.ReadBuffersResponse.decode)
    .set('DisableTracing', protos_1.DisableTracingResponse.decode)
    .set('GetTraceStats', protos_1.GetTraceStatsResponse.decode);
//# sourceMappingURL=adb_socket_controller.js.map