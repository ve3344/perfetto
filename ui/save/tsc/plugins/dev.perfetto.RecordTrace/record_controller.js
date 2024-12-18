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
exports.RecordController = void 0;
exports.genConfigProto = genConfigProto;
exports.toPbtxt = toPbtxt;
const object_utils_1 = require("../../base/object_utils");
const string_utils_1 = require("../../base/string_utils");
const trace_1 = require("../../public/trace");
const recording_config_utils_1 = require("./recordingV2/recording_config_utils");
const state_1 = require("./state");
const protos_1 = require("./protos");
const adb_1 = require("./adb");
const adb_shell_controller_1 = require("./adb_shell_controller");
const adb_socket_controller_1 = require("./adb_socket_controller");
const chrome_proxy_record_controller_1 = require("./chrome_proxy_record_controller");
const consumer_port_types_1 = require("./consumer_port_types");
const raf_1 = require("../../widgets/raf");
function genConfigProto(uiCfg, target) {
    return protos_1.TraceConfig.encode(convertToRecordingV2Input(uiCfg, target)).finish();
}
// This method converts the 'RecordingTarget' to the 'TargetInfo' used by V2 of
// the recording code. It is used so the logic is not duplicated and does not
// diverge.
// TODO(octaviant) delete this once we switch to RecordingV2.
function convertToRecordingV2Input(uiCfg, target) {
    let targetType;
    let androidApiLevel;
    switch (target.os) {
        case 'L':
            targetType = 'LINUX';
            break;
        case 'C':
            targetType = 'CHROME';
            break;
        case 'CrOS':
            targetType = 'CHROME_OS';
            break;
        case 'Win':
            targetType = 'WINDOWS';
            break;
        case 'S':
            androidApiLevel = 31;
            targetType = 'ANDROID';
            break;
        case 'R':
            androidApiLevel = 30;
            targetType = 'ANDROID';
            break;
        case 'Q':
            androidApiLevel = 29;
            targetType = 'ANDROID';
            break;
        case 'P':
            androidApiLevel = 28;
            targetType = 'ANDROID';
            break;
        default:
            androidApiLevel = 26;
            targetType = 'ANDROID';
    }
    let targetInfo;
    if (targetType === 'ANDROID') {
        targetInfo = {
            targetType,
            androidApiLevel,
            dataSources: [],
            name: '',
        };
    }
    else {
        targetInfo = {
            targetType,
            dataSources: [],
            name: '',
        };
    }
    return (0, recording_config_utils_1.genTraceConfig)(uiCfg, targetInfo);
}
function toPbtxt(configBuffer) {
    const msg = protos_1.TraceConfig.decode(configBuffer);
    const json = msg.toJSON();
    function snakeCase(s) {
        return s.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());
    }
    // With the ahead of time compiled protos we can't seem to tell which
    // fields are enums.
    function isEnum(value) {
        return (value.startsWith('MEMINFO_') ||
            value.startsWith('VMSTAT_') ||
            value.startsWith('STAT_') ||
            value.startsWith('LID_') ||
            value.startsWith('BATTERY_COUNTER_') ||
            value.startsWith('ATOM_') ||
            value === 'DISCARD' ||
            value === 'RING_BUFFER' ||
            value === 'BACKGROUND' ||
            value === 'USER_INITIATED' ||
            value.startsWith('PERF_CLOCK_'));
    }
    // Since javascript doesn't have 64 bit numbers when converting protos to
    // json the proto library encodes them as strings. This is lossy since
    // we can't tell which strings that look like numbers are actually strings
    // and which are actually numbers. Ideally we would reflect on the proto
    // definition somehow but for now we just hard code keys which have this
    // problem in the config.
    function is64BitNumber(key) {
        return [
            'maxFileSizeBytes',
            'pid',
            'samplingIntervalBytes',
            'shmemSizeBytes',
            'timestampUnitMultiplier',
            'frequency',
        ].includes(key);
    }
    function* message(msg, indent) {
        for (const [key, value] of Object.entries(msg)) {
            const isRepeated = Array.isArray(value);
            const isNested = typeof value === 'object' && !isRepeated;
            for (const entry of isRepeated ? value : [value]) {
                yield ' '.repeat(indent) + `${snakeCase(key)}${isNested ? '' : ':'} `;
                if ((0, object_utils_1.isString)(entry)) {
                    if (isEnum(entry) || is64BitNumber(key)) {
                        yield entry;
                    }
                    else {
                        yield `"${entry.replace(new RegExp('"', 'g'), '\\"')}"`;
                    }
                }
                else if (typeof entry === 'number') {
                    yield entry.toString();
                }
                else if (typeof entry === 'boolean') {
                    yield entry.toString();
                }
                else if (typeof entry === 'object' && entry !== null) {
                    yield '{\n';
                    yield* message(entry, indent + 4);
                    yield ' '.repeat(indent) + '}';
                }
                else {
                    throw new Error(`Record proto entry "${entry}" with unexpected type ${typeof entry}`);
                }
                yield '\n';
            }
        }
    }
    return [...message(json, 0)].join('');
}
class RecordController {
    app;
    recMgr;
    config = null;
    extensionPort;
    recordingInProgress = false;
    consumerPort;
    traceBuffer = [];
    bufferUpdateInterval;
    adb = new adb_1.AdbOverWebUsb();
    recordedTraceSuffix = trace_1.TRACE_SUFFIX;
    fetchedCategories = false;
    // We have a different controller for each targetOS. The correct one will be
    // created when needed, and stored here. When the key is a string, it is the
    // serial of the target (used for android devices). When the key is a single
    // char, it is the 'targetOS'
    controllerPromises = new Map();
    constructor(app, recMgr, extensionPort) {
        this.app = app;
        this.recMgr = recMgr;
        this.consumerPort = protos_1.ConsumerPort.create(this.rpcImpl.bind(this));
        this.extensionPort = extensionPort;
    }
    get state() {
        return this.recMgr.state;
    }
    refreshOnStateChange() {
        // TODO(eseckler): Use ConsumerPort's QueryServiceState instead
        // of posting a custom extension message to retrieve the category list.
        (0, raf_1.scheduleFullRedraw)();
        if (this.state.fetchChromeCategories && !this.fetchedCategories) {
            this.fetchedCategories = true;
            if (this.state.extensionInstalled) {
                this.extensionPort.postMessage({ method: 'GetCategories' });
            }
            this.recMgr.setFetchChromeCategories(false);
        }
        this.config = this.state.recordConfig;
        const configProto = genConfigProto(this.config, this.state.recordingTarget);
        const configProtoText = toPbtxt(configProto);
        const configProtoBase64 = (0, string_utils_1.base64Encode)(configProto);
        const commandline = `
      echo '${configProtoBase64}' |
      base64 --decode |
      adb shell "perfetto -c - -o /data/misc/perfetto-traces/trace" &&
      adb pull /data/misc/perfetto-traces/trace /tmp/trace
    `;
        const traceConfig = convertToRecordingV2Input(this.config, this.state.recordingTarget);
        this.state.recordCmd = {
            commandline,
            pbBase64: configProtoBase64,
            pbtxt: configProtoText,
        };
        // If the recordingInProgress boolean state is different, it means that we
        // have to start or stop recording a trace.
        if (this.state.recordingInProgress === this.recordingInProgress)
            return;
        this.recordingInProgress = this.state.recordingInProgress;
        if (this.recordingInProgress) {
            this.startRecordTrace(traceConfig);
        }
        else {
            this.stopRecordTrace();
        }
    }
    startRecordTrace(traceConfig) {
        this.scheduleBufferUpdateRequests();
        this.traceBuffer = [];
        this.consumerPort.enableTracing({ traceConfig });
    }
    stopRecordTrace() {
        if (this.bufferUpdateInterval)
            clearInterval(this.bufferUpdateInterval);
        this.consumerPort.flush({});
        this.consumerPort.disableTracing({});
    }
    scheduleBufferUpdateRequests() {
        if (this.bufferUpdateInterval)
            clearInterval(this.bufferUpdateInterval);
        this.bufferUpdateInterval = setInterval(() => {
            this.consumerPort.getTraceStats({});
        }, 200);
    }
    readBuffers() {
        this.consumerPort.readBuffers({});
    }
    onConsumerPortResponse(data) {
        if (data === undefined)
            return;
        if ((0, consumer_port_types_1.isReadBuffersResponse)(data)) {
            if (!data.slices || data.slices.length === 0)
                return;
            // TODO(nicomazz): handle this as intended by consumer_port.proto.
            console.assert(data.slices.length === 1);
            if (data.slices[0].data)
                this.traceBuffer.push(data.slices[0].data);
            // The line underneath is 'misusing' the format ReadBuffersResponse.
            // The boolean field 'lastSliceForPacket' is used as 'lastPacketInTrace'.
            // See http://shortn/_53WB8A1aIr.
            if (data.slices[0].lastSliceForPacket)
                this.onTraceComplete();
        }
        else if ((0, consumer_port_types_1.isEnableTracingResponse)(data)) {
            this.readBuffers();
        }
        else if ((0, consumer_port_types_1.isGetTraceStatsResponse)(data)) {
            const percentage = this.getBufferUsagePercentage(data);
            if (percentage) {
                this.recMgr.state.bufferUsage = percentage;
            }
        }
        else if ((0, consumer_port_types_1.isFreeBuffersResponse)(data)) {
            // No action required.
        }
        else if ((0, consumer_port_types_1.isDisableTracingResponse)(data)) {
            // No action required.
        }
        else {
            console.error('Unrecognized consumer port response:', data);
        }
    }
    onTraceComplete() {
        this.consumerPort.freeBuffers({});
        this.recMgr.setRecordingStatus(undefined);
        if (this.state.recordingCancelled) {
            this.recMgr.setLastRecordingError('Recording cancelled.');
            this.traceBuffer = [];
            return;
        }
        const trace = this.generateTrace();
        this.app.openTraceFromBuffer({
            title: 'Recorded trace',
            buffer: trace.buffer,
            fileName: `recorded_trace${this.recordedTraceSuffix}`,
        });
        this.traceBuffer = [];
    }
    // TODO(nicomazz): stream each chunk into the trace processor, instead of
    // creating a big long trace.
    generateTrace() {
        let traceLen = 0;
        for (const chunk of this.traceBuffer)
            traceLen += chunk.length;
        const completeTrace = new Uint8Array(traceLen);
        let written = 0;
        for (const chunk of this.traceBuffer) {
            completeTrace.set(chunk, written);
            written += chunk.length;
        }
        return completeTrace;
    }
    getBufferUsagePercentage(data) {
        if (!data.traceStats || !data.traceStats.bufferStats)
            return 0.0;
        let maximumUsage = 0;
        for (const buffer of data.traceStats.bufferStats) {
            const used = buffer.bytesWritten;
            const total = buffer.bufferSize;
            maximumUsage = Math.max(maximumUsage, used / total);
        }
        return maximumUsage;
    }
    onError(message) {
        // TODO(octaviant): b/204998302
        console.error('Error in record controller: ', message);
        this.recMgr.setLastRecordingError(message.substring(0, 150));
        this.recMgr.stopRecording();
    }
    onStatus(message) {
        this.recMgr.setRecordingStatus(message);
    }
    // Depending on the recording target, different implementation of the
    // consumer_port will be used.
    // - Chrome target: This forwards the messages that have to be sent
    // to the extension to the frontend. This is necessary because this
    // controller is running in a separate worker, that can't directly send
    // messages to the extension.
    // - Android device target: WebUSB is used to communicate using the adb
    // protocol. Actually, there is no full consumer_port implementation, but
    // only the support to start tracing and fetch the file.
    async getTargetController(target) {
        const identifier = RecordController.getTargetIdentifier(target);
        // The reason why caching the target 'record controller' Promise is that
        // multiple rcp calls can happen while we are trying to understand if an
        // android device has a socket connection available or not.
        const precedentPromise = this.controllerPromises.get(identifier);
        if (precedentPromise)
            return precedentPromise;
        const controllerPromise = new Promise(async (resolve, _) => {
            let controller = undefined;
            if ((0, state_1.isChromeTarget)(target) || (0, state_1.isWindowsTarget)(target)) {
                controller = new chrome_proxy_record_controller_1.ChromeExtensionConsumerPort(this.extensionPort, this);
            }
            else if ((0, state_1.isAdbTarget)(target)) {
                this.onStatus(`Please allow USB debugging on device.
                 If you press cancel, reload the page.`);
                const socketAccess = await this.hasSocketAccess(target);
                controller = socketAccess
                    ? new adb_socket_controller_1.AdbSocketConsumerPort(this.adb, this, this.recMgr.state)
                    : new adb_shell_controller_1.AdbConsumerPort(this.adb, this, this.recMgr.state);
            }
            else {
                throw Error(`No device connected`);
            }
            /* eslint-disable @typescript-eslint/strict-boolean-expressions */
            if (!controller)
                throw Error(`Unknown target: ${target}`);
            /* eslint-enable */
            resolve(controller);
        });
        this.controllerPromises.set(identifier, controllerPromise);
        return controllerPromise;
    }
    static getTargetIdentifier(target) {
        return (0, state_1.isAdbTarget)(target) ? target.serial : target.os;
    }
    async hasSocketAccess(target) {
        const devices = await navigator.usb.getDevices();
        const device = devices.find((d) => d.serialNumber === target.serial);
        console.assert(device);
        if (!device)
            return Promise.resolve(false);
        return adb_socket_controller_1.AdbSocketConsumerPort.hasSocketAccess(device, this.adb);
    }
    async rpcImpl(method, requestData, _callback) {
        try {
            const state = this.state;
            // TODO(hjd): This is a bit weird. We implicitly send each RPC message to
            // whichever target is currently selected (creating that target if needed)
            // it would be nicer if the setup/teardown was more explicit.
            const target = await this.getTargetController(state.recordingTarget);
            this.recordedTraceSuffix = target.getRecordedTraceSuffix();
            target.handleCommand(method.name, requestData);
        }
        catch (e) {
            console.error(`error invoking ${method}: ${e.message}`);
        }
    }
}
exports.RecordController = RecordController;
//# sourceMappingURL=record_controller.js.map