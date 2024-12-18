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
const string_utils_1 = require("../base/string_utils");
const chrome_tracing_controller_1 = require("./chrome_tracing_controller");
let chromeTraceController = undefined;
enableOnlyOnPerfettoHost();
// Listen for messages from the perfetto ui.
// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
if (globalThis.chrome) {
    chrome.runtime.onConnectExternal.addListener((port) => {
        chromeTraceController = new chrome_tracing_controller_1.ChromeTracingController(port);
        port.onMessage.addListener(onUIMessage);
    });
}
function onUIMessage(message, port) {
    if (message.method === 'ExtensionVersion') {
        port.postMessage({ version: chrome.runtime.getManifest().version });
        return;
    }
    console.assert(chromeTraceController !== undefined);
    if (!chromeTraceController)
        return;
    // ChromeExtensionConsumerPort sends the request data as string because
    // chrome.runtime.port doesn't support ArrayBuffers.
    const requestDataArray = message.requestData
        ? (0, string_utils_1.binaryDecode)(message.requestData)
        : new Uint8Array();
    chromeTraceController.handleCommand(message.method, requestDataArray);
}
function enableOnlyOnPerfettoHost() {
    function enableOnHostWithSuffix(suffix) {
        return {
            conditions: [
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: { hostSuffix: suffix },
                }),
            ],
            actions: [new chrome.declarativeContent.ShowPageAction()],
        };
    }
    chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
        chrome.declarativeContent.onPageChanged.addRules([
            enableOnHostWithSuffix('localhost'),
            enableOnHostWithSuffix('127.0.0.1'),
            enableOnHostWithSuffix('.perfetto.dev'),
            enableOnHostWithSuffix('.storage.googleapis.com'),
        ]);
    });
}
//# sourceMappingURL=index.js.map