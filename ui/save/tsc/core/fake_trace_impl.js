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
exports.initializeAppImplForTesting = initializeAppImplForTesting;
exports.createFakeTraceImpl = createFakeTraceImpl;
const time_1 = require("../base/time");
const engine_1 = require("../trace_processor/engine");
const app_impl_1 = require("./app_impl");
const trace_impl_1 = require("./trace_impl");
let appImplInitialized = false;
function initializeAppImplForTesting() {
    if (!appImplInitialized) {
        appImplInitialized = true;
        app_impl_1.AppImpl.initialize({ initialRouteArgs: {} });
    }
    return app_impl_1.AppImpl.instance;
}
// For testing purposes only.
function createFakeTraceImpl(args = {}) {
    initializeAppImplForTesting();
    const fakeTraceInfo = {
        source: { type: 'URL', url: '' },
        traceTitle: '',
        traceUrl: '',
        start: time_1.Time.fromSeconds(0),
        end: time_1.Time.fromSeconds(10),
        realtimeOffset: time_1.Time.ZERO,
        utcOffset: time_1.Time.ZERO,
        traceTzOffset: time_1.Time.ZERO,
        cpus: [],
        importErrors: 0,
        traceType: 'proto',
        hasFtrace: false,
        uuid: '',
        cached: false,
        downloadable: false,
    };
    return trace_impl_1.TraceImpl.createInstanceForCore(app_impl_1.AppImpl.instance, new FakeEngine(args.allowQueries ?? false), fakeTraceInfo);
}
class FakeEngine extends engine_1.EngineBase {
    allowQueries;
    mode = 'WASM';
    id = 'TestEngine';
    constructor(allowQueries) {
        super();
        this.allowQueries = allowQueries;
    }
    rpcSendRequestBytes(_data) {
        if (!this.allowQueries) {
            throw new Error('FakeEngine.query() should never be reached. ' +
                'If this is a unittest, try adding {allowQueries: true} to the ' +
                'createFakeTraceImpl() call.');
        }
    }
    [Symbol.dispose]() { }
}
//# sourceMappingURL=fake_trace_impl.js.map