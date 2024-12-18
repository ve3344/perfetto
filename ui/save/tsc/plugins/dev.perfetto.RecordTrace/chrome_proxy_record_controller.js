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
exports.ChromeExtensionConsumerPort = void 0;
exports.isChromeExtensionError = isChromeExtensionError;
exports.isChromeExtensionStatus = isChromeExtensionStatus;
exports.isGetCategoriesResponse = isGetCategoriesResponse;
const string_utils_1 = require("../../base/string_utils");
const trace_1 = require("../../public/trace");
const consumer_port_types_1 = require("./consumer_port_types");
const record_controller_interfaces_1 = require("./record_controller_interfaces");
function isChromeExtensionError(obj) {
    return obj.type === 'ChromeExtensionError';
}
function isChromeExtensionStatus(obj) {
    return obj.type === 'ChromeExtensionStatus';
}
function isObject(obj) {
    return typeof obj === 'object' && obj !== null;
}
function isGetCategoriesResponse(obj) {
    if (!(isObject(obj) &&
        (0, consumer_port_types_1.hasProperty)(obj, 'type') &&
        obj.type === 'GetCategoriesResponse')) {
        return false;
    }
    return (0, consumer_port_types_1.hasProperty)(obj, 'categories') && Array.isArray(obj.categories);
}
// This class acts as a proxy from the record controller (running in a worker),
// to the frontend. This is needed because we can't directly talk with the
// extension from a web-worker, so we use a MessagePort to communicate with the
// frontend, that will consecutively forward it to the extension.
// Rationale for the binaryEncode / binaryDecode calls below:
// Messages to/from extensions need to be JSON serializable. ArrayBuffers are
// not supported. For this reason here we use binaryEncode/Decode.
// See https://developer.chrome.com/extensions/messaging#simple
class ChromeExtensionConsumerPort extends record_controller_interfaces_1.RpcConsumerPort {
    extensionPort;
    constructor(extensionPort, consumer) {
        super(consumer);
        this.extensionPort = extensionPort;
        this.extensionPort.onmessage = this.onExtensionMessage.bind(this);
    }
    onExtensionMessage(message) {
        if (isChromeExtensionError(message.data)) {
            this.sendErrorMessage(message.data.error);
            return;
        }
        if (isChromeExtensionStatus(message.data)) {
            this.sendStatus(message.data.status);
            return;
        }
        // In this else branch message.data will be a ConsumerPortResponse.
        if ((0, consumer_port_types_1.isReadBuffersResponse)(message.data) && message.data.slices) {
            const slice = message.data.slices[0].data;
            message.data.slices[0].data = (0, string_utils_1.binaryDecode)(slice);
        }
        this.sendMessage(message.data);
    }
    handleCommand(method, requestData) {
        const reqEncoded = (0, string_utils_1.binaryEncode)(requestData);
        this.extensionPort.postMessage({ method, requestData: reqEncoded });
    }
    getRecordedTraceSuffix() {
        return `${trace_1.TRACE_SUFFIX}.gz`;
    }
}
exports.ChromeExtensionConsumerPort = ChromeExtensionConsumerPort;
//# sourceMappingURL=chrome_proxy_record_controller.js.map