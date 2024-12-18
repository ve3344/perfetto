"use strict";
// Copyright (C) 2022  The Android Open Source Project
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
exports.MetatraceTrackId = void 0;
exports.enableMetatracing = enableMetatracing;
exports.disableMetatracingAndGetTrace = disableMetatracingAndGetTrace;
exports.isMetatracingEnabled = isMetatracingEnabled;
exports.getEnabledMetatracingCategories = getEnabledMetatracingCategories;
exports.traceEvent = traceEvent;
exports.traceEventBegin = traceEventBegin;
exports.traceEventEnd = traceEventEnd;
exports.flattenArgs = flattenArgs;
const tslib_1 = require("tslib");
const feature_flags_1 = require("./feature_flags");
const protos_1 = tslib_1.__importDefault(require("../protos"));
const minimal_1 = tslib_1.__importDefault(require("protobufjs/minimal"));
const METATRACING_BUFFER_SIZE = 100000;
var MetatraceTrackId;
(function (MetatraceTrackId) {
    // 1 is reserved for the Trace Processor track.
    // Events emitted by the JS main thread.
    MetatraceTrackId[MetatraceTrackId["kMainThread"] = 2] = "kMainThread";
    // Async track for the status (e.g. "loading tracks") shown to the user
    // in the omnibox.
    MetatraceTrackId[MetatraceTrackId["kOmniboxStatus"] = 3] = "kOmniboxStatus";
})(MetatraceTrackId || (exports.MetatraceTrackId = MetatraceTrackId = {}));
const AOMT_FLAG = feature_flags_1.featureFlags.register({
    id: 'alwaysOnMetatracing',
    name: 'Enable always-on-metatracing',
    description: 'Enables trace events in the UI and trace processor',
    defaultValue: false,
});
const AOMT_DETAILED_FLAG = feature_flags_1.featureFlags.register({
    id: 'alwaysOnMetatracing_detailed',
    name: 'Detailed always-on-metatracing',
    description: 'Enables recording additional events for trace event',
    defaultValue: false,
});
function getInitialCategories() {
    if (!AOMT_FLAG.get())
        return undefined;
    if (AOMT_DETAILED_FLAG.get())
        return protos_1.default.MetatraceCategories.ALL;
    return (protos_1.default.MetatraceCategories.QUERY_TIMELINE |
        protos_1.default.MetatraceCategories.API_TIMELINE);
}
let enabledCategories = getInitialCategories();
function enableMetatracing(categories) {
    enabledCategories =
        categories === undefined || categories === protos_1.default.MetatraceCategories.NONE
            ? protos_1.default.MetatraceCategories.ALL
            : categories;
}
function disableMetatracingAndGetTrace() {
    enabledCategories = undefined;
    return readMetatrace();
}
function isMetatracingEnabled() {
    return enabledCategories !== undefined;
}
function getEnabledMetatracingCategories() {
    return enabledCategories;
}
const traceEvents = [];
function readMetatrace() {
    const eventToPacket = (e) => {
        const metatraceEvent = protos_1.default.PerfettoMetatrace.create({
            eventName: e.eventName,
            threadId: e.track,
            eventDurationNs: e.durNs,
        });
        for (const [key, value] of Object.entries(e.args ?? {})) {
            metatraceEvent.args.push(protos_1.default.PerfettoMetatrace.Arg.create({
                key,
                value,
            }));
        }
        const PROTO_VARINT_TYPE = 0;
        const PROTO_LEN_DELIMITED_WIRE_TYPE = 2;
        const TRACE_PACKET_PROTO_TAG = (1 << 3) | PROTO_LEN_DELIMITED_WIRE_TYPE;
        const TRACE_PACKET_TIMESTAMP_TAG = (8 << 3) | PROTO_VARINT_TYPE;
        const TRACE_PACKET_CLOCK_ID_TAG = (58 << 3) | PROTO_VARINT_TYPE;
        const TRACE_PACKET_METATRACE_TAG = (49 << 3) | PROTO_LEN_DELIMITED_WIRE_TYPE;
        const wri = minimal_1.default.Writer.create();
        wri.uint32(TRACE_PACKET_PROTO_TAG);
        wri.fork(); // Start of Trace Packet.
        wri.uint32(TRACE_PACKET_TIMESTAMP_TAG).int64(e.startNs);
        wri.uint32(TRACE_PACKET_CLOCK_ID_TAG).int32(1);
        wri
            .uint32(TRACE_PACKET_METATRACE_TAG)
            .bytes(protos_1.default.PerfettoMetatrace.encode(metatraceEvent).finish());
        wri.ldelim();
        return wri.finish();
    };
    const packets = [];
    for (const event of traceEvents) {
        packets.push(eventToPacket(event));
    }
    const totalLength = packets.reduce((acc, arr) => acc + arr.length, 0);
    const trace = new Uint8Array(totalLength);
    let offset = 0;
    for (const packet of packets) {
        trace.set(packet, offset);
        offset += packet.length;
    }
    return trace;
}
const correctedTimeOrigin = new Date().getTime() - performance.now();
function msToNs(ms) {
    return Math.round(ms * 1e6);
}
function now() {
    return msToNs(correctedTimeOrigin + performance.now());
}
function traceEvent(name, event, params) {
    const scope = traceEventBegin(name, params);
    try {
        const result = event();
        return result;
    }
    finally {
        traceEventEnd(scope);
    }
}
function traceEventBegin(eventName, params) {
    return {
        eventName,
        startNs: now(),
        params: params,
    };
}
function traceEventEnd(traceEvent) {
    if (!isMetatracingEnabled())
        return;
    traceEvents.push({
        eventName: traceEvent.eventName,
        startNs: traceEvent.startNs,
        durNs: now() - traceEvent.startNs,
        track: traceEvent.params?.track ?? MetatraceTrackId.kMainThread,
        args: traceEvent.params?.args,
    });
    while (traceEvents.length > METATRACING_BUFFER_SIZE) {
        traceEvents.shift();
    }
}
// Flatten arbitrary values so they can be used as args in traceEvent() et al.
function flattenArgs(input, parentKey = '') {
    if (typeof input !== 'object' || input === null) {
        return { [parentKey]: String(input) };
    }
    if (Array.isArray(input)) {
        const result = {};
        input.forEach((item, index) => {
            const arrayKey = `${parentKey}[${index}]`;
            Object.assign(result, flattenArgs(item, arrayKey));
        });
        return result;
    }
    const result = {};
    Object.entries(input).forEach(([key, value]) => {
        const newKey = parentKey ? `${parentKey}.${key}` : key;
        Object.assign(result, flattenArgs(value, newKey));
    });
    return result;
}
//# sourceMappingURL=metatracing.js.map