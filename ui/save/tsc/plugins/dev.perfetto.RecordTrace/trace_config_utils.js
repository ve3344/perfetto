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
exports.extractTraceConfig = extractTraceConfig;
exports.extractDurationFromTraceConfig = extractDurationFromTraceConfig;
exports.browserSupportsPerfettoConfig = browserSupportsPerfettoConfig;
exports.hasSystemDataSourceConfig = hasSystemDataSourceConfig;
const protos_1 = require("./protos");
// In this file are contained a few functions to simplify the proto parsing.
function extractTraceConfig(enableTracingRequest) {
    try {
        const enableTracingObject = protos_1.EnableTracingRequest.decode(enableTracingRequest);
        if (!enableTracingObject.traceConfig)
            return undefined;
        return protos_1.TraceConfig.encode(enableTracingObject.traceConfig).finish();
    }
    catch (e) {
        // This catch is for possible proto encoding/decoding issues.
        console.error('Error extracting the config: ', e.message);
        return undefined;
    }
}
function extractDurationFromTraceConfig(traceConfigProto) {
    try {
        return protos_1.TraceConfig.decode(traceConfigProto).durationMs;
    }
    catch (e) {
        // This catch is for possible proto encoding/decoding issues.
        return undefined;
    }
}
function browserSupportsPerfettoConfig() {
    const minimumChromeVersion = '91.0.4448.0';
    const runningVersion = String((/Chrome\/(([0-9]+\.?){4})/.exec(navigator.userAgent) || [, 0])[1]);
    if (!runningVersion)
        return false;
    const minVerArray = minimumChromeVersion.split('.').map(Number);
    const runVerArray = runningVersion.split('.').map(Number);
    for (let index = 0; index < minVerArray.length; index++) {
        if (runVerArray[index] === minVerArray[index])
            continue;
        return runVerArray[index] > minVerArray[index];
    }
    return true; // Exact version match.
}
function hasSystemDataSourceConfig(config) {
    for (const ds of config.dataSources) {
        if (!(ds.config?.name ?? '').startsWith('org.chromium.')) {
            return true;
        }
    }
    return false;
}
//# sourceMappingURL=trace_config_utils.js.map