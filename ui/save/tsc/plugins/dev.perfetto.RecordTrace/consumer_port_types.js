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
exports.hasProperty = hasProperty;
exports.isTyped = isTyped;
exports.isReadBuffersResponse = isReadBuffersResponse;
exports.isEnableTracingResponse = isEnableTracingResponse;
exports.isGetTraceStatsResponse = isGetTraceStatsResponse;
exports.isFreeBuffersResponse = isFreeBuffersResponse;
exports.isDisableTracingResponse = isDisableTracingResponse;
// A type guard that can be used in order to be able to access the property of
// an object in a checked manner.
function hasProperty(obj, prop) {
    return obj.hasOwnProperty(prop);
}
function isTyped(obj) {
    return obj.hasOwnProperty('type');
}
function isReadBuffersResponse(obj) {
    return obj.type === 'ReadBuffersResponse';
}
function isEnableTracingResponse(obj) {
    return obj.type === 'EnableTracingResponse';
}
function isGetTraceStatsResponse(obj) {
    return obj.type === 'GetTraceStatsResponse';
}
function isFreeBuffersResponse(obj) {
    return obj.type === 'FreeBuffersResponse';
}
function isDisableTracingResponse(obj) {
    return obj.type === 'DisableTracingResponse';
}
//# sourceMappingURL=consumer_port_types.js.map