"use strict";
// Copyright (C) 2024 The Android Open Source Project
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
exports.METRIC_HANDLERS = void 0;
const pinBlockingCall_1 = require("./pinBlockingCall");
const pinCujScoped_1 = require("./pinCujScoped");
const fullTraceJankMetricHandler_1 = require("./fullTraceJankMetricHandler");
const pinCujMetricHandler_1 = require("./pinCujMetricHandler");
// TODO: b/337774166 - Add handlers for the metric name categories here
exports.METRIC_HANDLERS = [
    pinCujMetricHandler_1.pinCujInstance,
    pinCujScoped_1.pinCujScopedJankInstance,
    pinBlockingCall_1.pinBlockingCallHandlerInstance,
    fullTraceJankMetricHandler_1.pinFullTraceJankInstance,
];
//# sourceMappingURL=handlerRegistry.js.map