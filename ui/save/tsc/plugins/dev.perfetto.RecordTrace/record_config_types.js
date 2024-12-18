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
exports.NAMED_RECORD_CONFIG_SCHEMA = exports.RECORD_CONFIG_SCHEMA = void 0;
exports.createEmptyRecordConfig = createEmptyRecordConfig;
const zod_1 = require("zod");
const recordModes = ['STOP_WHEN_FULL', 'RING_BUFFER', 'LONG_TRACE'];
exports.RECORD_CONFIG_SCHEMA = zod_1.z
    .object({
    mode: zod_1.z.enum(recordModes).default('STOP_WHEN_FULL'),
    durationMs: zod_1.z.number().default(10000.0),
    maxFileSizeMb: zod_1.z.number().default(100),
    fileWritePeriodMs: zod_1.z.number().default(2500),
    bufferSizeMb: zod_1.z.number().default(64.0),
    cpuSched: zod_1.z.boolean().default(false),
    cpuFreq: zod_1.z.boolean().default(false),
    cpuFreqPollMs: zod_1.z.number().default(1000),
    cpuSyscall: zod_1.z.boolean().default(false),
    gpuFreq: zod_1.z.boolean().default(false),
    gpuMemTotal: zod_1.z.boolean().default(false),
    gpuWorkPeriod: zod_1.z.boolean().default(false),
    ftrace: zod_1.z.boolean().default(false),
    atrace: zod_1.z.boolean().default(false),
    ftraceEvents: zod_1.z.array(zod_1.z.string()).default([]),
    ftraceExtraEvents: zod_1.z.string().default(''),
    atraceCats: zod_1.z.array(zod_1.z.string()).default([]),
    allAtraceApps: zod_1.z.boolean().default(true),
    atraceApps: zod_1.z.string().default(''),
    ftraceBufferSizeKb: zod_1.z.number().default(0),
    ftraceDrainPeriodMs: zod_1.z.number().default(0),
    androidLogs: zod_1.z.boolean().default(false),
    androidLogBuffers: zod_1.z.array(zod_1.z.string()).default([]),
    androidFrameTimeline: zod_1.z.boolean().default(false),
    androidGameInterventionList: zod_1.z.boolean().default(false),
    androidNetworkTracing: zod_1.z.boolean().default(false),
    androidNetworkTracingPollMs: zod_1.z.number().default(250),
    androidStatsd: zod_1.z.boolean().default(false),
    androidStatsdRawPushedAtoms: zod_1.z.string().default(''),
    androidStatsdRawPulledAtoms: zod_1.z.string().default(''),
    androidStatsdPushedAtoms: zod_1.z.array(zod_1.z.string()).default([]),
    androidStatsdPulledAtoms: zod_1.z.array(zod_1.z.string()).default([]),
    androidStatsdPulledAtomPackages: zod_1.z.string().default(''),
    androidStatsdPulledAtomPullFrequencyMs: zod_1.z.number().default(5000),
    cpuCoarse: zod_1.z.boolean().default(false),
    cpuCoarsePollMs: zod_1.z.number().default(1000),
    batteryDrain: zod_1.z.boolean().default(false),
    batteryDrainPollMs: zod_1.z.number().default(1000),
    boardSensors: zod_1.z.boolean().default(false),
    memHiFreq: zod_1.z.boolean().default(false),
    meminfo: zod_1.z.boolean().default(false),
    meminfoPeriodMs: zod_1.z.number().default(1000),
    meminfoCounters: zod_1.z.array(zod_1.z.string()).default([]),
    vmstat: zod_1.z.boolean().default(false),
    vmstatPeriodMs: zod_1.z.number().default(1000),
    vmstatCounters: zod_1.z.array(zod_1.z.string()).default([]),
    heapProfiling: zod_1.z.boolean().default(false),
    hpSamplingIntervalBytes: zod_1.z.number().default(4096),
    hpProcesses: zod_1.z.string().default(''),
    hpContinuousDumpsPhase: zod_1.z.number().default(0),
    hpContinuousDumpsInterval: zod_1.z.number().default(0),
    hpSharedMemoryBuffer: zod_1.z.number().default(8 * 1048576),
    hpBlockClient: zod_1.z.boolean().default(true),
    hpAllHeaps: zod_1.z.boolean().default(false),
    javaHeapDump: zod_1.z.boolean().default(false),
    jpProcesses: zod_1.z.string().default(''),
    jpContinuousDumpsPhase: zod_1.z.number().default(0),
    jpContinuousDumpsInterval: zod_1.z.number().default(0),
    memLmk: zod_1.z.boolean().default(false),
    procStats: zod_1.z.boolean().default(false),
    procStatsPeriodMs: zod_1.z.number().default(1000),
    chromeCategoriesSelected: zod_1.z.array(zod_1.z.string()).default([]),
    chromeHighOverheadCategoriesSelected: zod_1.z.array(zod_1.z.string()).default([]),
    chromePrivacyFiltering: zod_1.z.boolean().default(false),
    chromeLogs: zod_1.z.boolean().default(false),
    taskScheduling: zod_1.z.boolean().default(false),
    ipcFlows: zod_1.z.boolean().default(false),
    jsExecution: zod_1.z.boolean().default(false),
    webContentRendering: zod_1.z.boolean().default(false),
    uiRendering: zod_1.z.boolean().default(false),
    inputEvents: zod_1.z.boolean().default(false),
    navigationAndLoading: zod_1.z.boolean().default(false),
    audio: zod_1.z.boolean().default(false),
    video: zod_1.z.boolean().default(false),
    etwCSwitch: zod_1.z.boolean().default(false),
    etwThreadState: zod_1.z.boolean().default(false),
    symbolizeKsyms: zod_1.z.boolean().default(false),
    // Enabling stack sampling
    tracePerf: zod_1.z.boolean().default(false),
    timebaseFrequency: zod_1.z.number().default(100),
    targetCmdLine: zod_1.z.array(zod_1.z.string()).default([]),
    linuxDeviceRpm: zod_1.z.boolean().default(false),
})
    // .default({}) ensures that we can always default-construct a config and
    // spots accidental missing .default(...)
    .default({});
exports.NAMED_RECORD_CONFIG_SCHEMA = zod_1.z.object({
    title: zod_1.z.string(),
    key: zod_1.z.string(),
    config: exports.RECORD_CONFIG_SCHEMA,
});
function createEmptyRecordConfig() {
    return exports.RECORD_CONFIG_SCHEMA.parse({});
}
//# sourceMappingURL=record_config_types.js.map