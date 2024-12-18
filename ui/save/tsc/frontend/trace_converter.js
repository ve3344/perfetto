"use strict";
// Copyright (C) 2021 The Android Open Source Project
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
exports.convertTraceToJsonAndDownload = convertTraceToJsonAndDownload;
exports.convertTraceToSystraceAndDownload = convertTraceToSystraceAndDownload;
exports.convertToJson = convertToJson;
exports.convertTraceToPprofAndDownload = convertTraceToPprofAndDownload;
const assets_1 = require("../base/assets");
const clipboard_1 = require("../base/clipboard");
const deferred_1 = require("../base/deferred");
const string_utils_1 = require("../base/string_utils");
const app_impl_1 = require("../core/app_impl");
const error_dialog_1 = require("./error_dialog");
async function makeWorkerAndPost(msg, openTraceInLegacy) {
    const promise = (0, deferred_1.defer)();
    function handleOnMessage(msg) {
        const args = msg.data;
        if (args.kind === 'updateStatus') {
            app_impl_1.AppImpl.instance.omnibox.showStatusMessage(args.status);
        }
        else if (args.kind === 'jobCompleted') {
            promise.resolve();
        }
        else if (args.kind === 'downloadFile') {
            (0, clipboard_1.download)(new File([new Blob([args.buffer])], args.name));
        }
        else if (args.kind === 'openTraceInLegacy') {
            const str = (0, string_utils_1.utf8Decode)(args.buffer);
            openTraceInLegacy?.('trace.json', str, 0);
        }
        else if (args.kind === 'error') {
            (0, error_dialog_1.maybeShowErrorDialog)(args.error);
        }
        else {
            throw new Error(`Unhandled message ${JSON.stringify(args)}`);
        }
    }
    const worker = new Worker((0, assets_1.assetSrc)('traceconv_bundle.js'));
    worker.onmessage = handleOnMessage;
    worker.postMessage(msg);
    return promise;
}
function convertTraceToJsonAndDownload(trace) {
    return makeWorkerAndPost({
        kind: 'ConvertTraceAndDownload',
        trace,
        format: 'json',
    });
}
function convertTraceToSystraceAndDownload(trace) {
    return makeWorkerAndPost({
        kind: 'ConvertTraceAndDownload',
        trace,
        format: 'systrace',
    });
}
function convertToJson(trace, openTraceInLegacy, truncate) {
    return makeWorkerAndPost({
        kind: 'ConvertTraceAndOpenInLegacy',
        trace,
        truncate,
    }, openTraceInLegacy);
}
function convertTraceToPprofAndDownload(trace, pid, ts) {
    return makeWorkerAndPost({
        kind: 'ConvertTraceToPprof',
        trace,
        pid,
        ts,
    });
}
//# sourceMappingURL=trace_converter.js.map