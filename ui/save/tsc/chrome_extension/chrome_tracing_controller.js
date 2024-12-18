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
exports.ChromeTracingController = void 0;
const tslib_1 = require("tslib");
const noice_json_rpc_1 = require("noice-json-rpc");
const string_utils_1 = require("../base/string_utils");
const record_controller_interfaces_1 = require("../plugins/dev.perfetto.RecordTrace/record_controller_interfaces");
const trace_config_utils_1 = require("../plugins/dev.perfetto.RecordTrace/trace_config_utils");
const protos_1 = tslib_1.__importDefault(require("../protos"));
const devtools_socket_1 = require("./devtools_socket");
const utils_1 = require("../base/utils");
const CHUNK_SIZE = 1024 * 1024 * 16; // 16Mb
class ChromeTracingController extends record_controller_interfaces_1.RpcConsumerPort {
    streamHandle = undefined;
    uiPort;
    api;
    devtoolsSocket;
    lastBufferUsageEvent;
    tracingSessionOngoing = false;
    tracingSessionId = 0;
    constructor(port) {
        super({
            onConsumerPortResponse: (message) => this.uiPort.postMessage(message),
            onError: (error) => this.uiPort.postMessage({ type: 'ChromeExtensionError', error }),
            onStatus: (status) => this.uiPort.postMessage({ type: 'ChromeExtensionStatus', status }),
        });
        this.uiPort = port;
        this.devtoolsSocket = new devtools_socket_1.DevToolsSocket();
        this.devtoolsSocket.on('close', () => this.resetState());
        const rpcClient = new noice_json_rpc_1.Client(this.devtoolsSocket);
        this.api = rpcClient.api();
        this.api.Tracing.on('tracingComplete', this.onTracingComplete.bind(this));
        this.api.Tracing.on('bufferUsage', this.onBufferUsage.bind(this));
        this.uiPort.onDisconnect.addListener(() => {
            this.devtoolsSocket.detach();
        });
    }
    handleCommand(methodName, requestData) {
        switch (methodName) {
            case 'EnableTracing':
                this.enableTracing(requestData);
                break;
            case 'FreeBuffers':
                this.freeBuffers();
                break;
            case 'ReadBuffers':
                this.readBuffers();
                break;
            case 'DisableTracing':
                this.disableTracing();
                break;
            case 'GetTraceStats':
                this.getTraceStats();
                break;
            case 'GetCategories':
                this.getCategories();
                break;
            default:
                this.sendErrorMessage('Action not recognized');
                console.log('Received not recognized message: ', methodName);
                break;
        }
    }
    enableTracing(enableTracingRequest) {
        this.resetState();
        const traceConfigProto = (0, trace_config_utils_1.extractTraceConfig)(enableTracingRequest);
        if (!traceConfigProto) {
            this.sendErrorMessage('Invalid trace config');
            return;
        }
        this.handleStartTracing(traceConfigProto);
    }
    toCamelCase(key, separator) {
        return key
            .split(separator)
            .map((part, index) => {
            return index === 0 ? part : part[0].toUpperCase() + part.slice(1);
        })
            .join('');
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    convertDictKeys(obj) {
        if (Array.isArray(obj)) {
            return obj.map((v) => this.convertDictKeys(v));
        }
        if (typeof obj === 'object' && obj !== null) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const converted = {};
            for (const key of Object.keys(obj)) {
                converted[this.toCamelCase(key, '_')] = this.convertDictKeys(obj[key]);
            }
            return converted;
        }
        return obj;
    }
    convertToDevToolsConfig(config) {
        // DevTools uses a different naming style for config properties: Dictionary
        // keys are named "camelCase" style, rather than "underscore_case" style as
        // in the TraceConfig.
        const convertedConfig = this.convertDictKeys(config);
        // recordMode is specified as an enum with camelCase values.
        if (convertedConfig.recordMode) {
            convertedConfig.recordMode = this.toCamelCase(convertedConfig.recordMode, '-');
        }
        return convertedConfig;
    }
    // TODO(nicomazz): write unit test for this
    extractChromeConfig(perfettoConfig) {
        for (const ds of perfettoConfig.dataSources) {
            if (ds.config &&
                ds.config.name === 'org.chromium.trace_event' &&
                (0, utils_1.exists)(ds.config.chromeConfig) &&
                (0, utils_1.exists)(ds.config.chromeConfig.traceConfig)) {
                const chromeConfigJsonString = ds.config.chromeConfig.traceConfig;
                const config = JSON.parse(chromeConfigJsonString);
                return this.convertToDevToolsConfig(config);
            }
        }
        return {};
    }
    freeBuffers() {
        this.devtoolsSocket.detach();
        this.sendMessage({ type: 'FreeBuffersResponse' });
    }
    async readBuffers(offset = 0) {
        if (!this.devtoolsSocket.isAttached() || this.streamHandle === undefined) {
            this.sendErrorMessage('No tracing session to read from');
            return;
        }
        const res = await this.api.IO.read({
            handle: this.streamHandle,
            offset,
            size: CHUNK_SIZE,
        });
        if (res === undefined)
            return;
        const chunk = res.base64Encoded ? atob(res.data) : res.data;
        // The 'as {} as UInt8Array' is done because we can't send ArrayBuffers
        // trough a chrome.runtime.Port. The conversion from string to ArrayBuffer
        // takes place on the other side of the port.
        const response = {
            type: 'ReadBuffersResponse',
            slices: [{ data: chunk, lastSliceForPacket: res.eof }],
        };
        this.sendMessage(response);
        if (res.eof)
            return;
        this.readBuffers(offset + chunk.length);
    }
    async disableTracing() {
        await this.endTracing(this.tracingSessionId);
        this.sendMessage({ type: 'DisableTracingResponse' });
    }
    async endTracing(tracingSessionId) {
        if (tracingSessionId !== this.tracingSessionId) {
            return;
        }
        if (this.tracingSessionOngoing) {
            await this.api.Tracing.end();
        }
        this.tracingSessionOngoing = false;
    }
    getTraceStats() {
        // If the statistics are not available yet, it is 0.
        const percentFull = this.lastBufferUsageEvent?.percentFull ?? 0;
        const stats = {
            bufferStats: [
                { bufferSize: 1000, bytesWritten: Math.round(percentFull * 1000) },
            ],
        };
        const response = {
            type: 'GetTraceStatsResponse',
            traceStats: stats,
        };
        this.sendMessage(response);
    }
    getCategories() {
        const fetchCategories = async () => {
            const categories = (await this.api.Tracing.getCategories()).categories;
            this.uiPort.postMessage({ type: 'GetCategoriesResponse', categories });
        };
        // If a target is already attached, we simply fetch the categories.
        if (this.devtoolsSocket.isAttached()) {
            fetchCategories();
            return;
        }
        // Otherwise, we attach temporarily.
        this.devtoolsSocket.attachToBrowser(async (error) => {
            if (error) {
                this.sendErrorMessage(`Could not attach to DevTools browser target ` +
                    `(req. Chrome >= M81): ${error}`);
                return;
            }
            fetchCategories();
            this.devtoolsSocket.detach();
        });
    }
    resetState() {
        this.devtoolsSocket.detach();
        this.streamHandle = undefined;
    }
    onTracingComplete(params) {
        this.streamHandle = params.stream;
        this.sendMessage({ type: 'EnableTracingResponse' });
    }
    onBufferUsage(params) {
        this.lastBufferUsageEvent = params;
    }
    handleStartTracing(traceConfigProto) {
        this.devtoolsSocket.attachToBrowser(async (error) => {
            if (error) {
                this.sendErrorMessage(`Could not attach to DevTools browser target ` +
                    `(req. Chrome >= M81): ${error}`);
                return;
            }
            const requestParams = {
                streamFormat: 'proto',
                transferMode: 'ReturnAsStream',
                streamCompression: 'gzip',
                bufferUsageReportingInterval: 200,
            };
            const traceConfig = protos_1.default.TraceConfig.decode(traceConfigProto);
            if ((0, trace_config_utils_1.browserSupportsPerfettoConfig)()) {
                const configEncoded = (0, string_utils_1.base64Encode)(traceConfigProto);
                await this.api.Tracing.start({
                    perfettoConfig: configEncoded,
                    ...requestParams,
                });
                this.tracingSessionOngoing = true;
                const tracingSessionId = ++this.tracingSessionId;
                setTimeout(() => this.endTracing(tracingSessionId), traceConfig.durationMs);
            }
            else {
                console.log('Used Chrome version is too old to support ' +
                    'perfettoConfig parameter. Using chrome config only instead.');
                if ((0, trace_config_utils_1.hasSystemDataSourceConfig)(traceConfig)) {
                    this.sendErrorMessage('System tracing is not supported by this Chrome version. Choose' +
                        " the 'Chrome' target instead to record a Chrome-only trace.");
                    return;
                }
                const chromeConfig = this.extractChromeConfig(traceConfig);
                await this.api.Tracing.start({
                    traceConfig: chromeConfig,
                    ...requestParams,
                });
            }
        });
    }
}
exports.ChromeTracingController = ChromeTracingController;
//# sourceMappingURL=chrome_tracing_controller.js.map