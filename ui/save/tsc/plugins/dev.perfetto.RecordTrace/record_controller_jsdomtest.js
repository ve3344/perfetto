"use strict";
// Copyright (C) 2018 The Android Open Source Project
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
const logging_1 = require("../../base/logging");
const protos_1 = require("./protos");
const record_config_types_1 = require("./record_config_types");
const record_controller_1 = require("./record_controller");
test('encodeConfig', () => {
    const config = (0, record_config_types_1.createEmptyRecordConfig)();
    config.durationMs = 20000;
    const result = protos_1.TraceConfig.decode((0, record_controller_1.genConfigProto)(config, { os: 'Q', name: 'Android Q' }));
    expect(result.durationMs).toBe(20000);
});
test('SysConfig', () => {
    const config = (0, record_config_types_1.createEmptyRecordConfig)();
    config.cpuSyscall = true;
    const result = protos_1.TraceConfig.decode((0, record_controller_1.genConfigProto)(config, { os: 'Q', name: 'Android Q' }));
    const sources = (0, logging_1.assertExists)(result.dataSources);
    // TODO(hjd): This is all bad. Should just match the whole config.
    const srcConfig = (0, logging_1.assertExists)(sources[2].config);
    const ftraceConfig = (0, logging_1.assertExists)(srcConfig.ftraceConfig);
    const ftraceEvents = (0, logging_1.assertExists)(ftraceConfig.ftraceEvents);
    expect(ftraceEvents.includes('raw_syscalls/sys_enter')).toBe(true);
    expect(ftraceEvents.includes('raw_syscalls/sys_exit')).toBe(true);
});
test('LinuxSystemInfo present', () => {
    const config = (0, record_config_types_1.createEmptyRecordConfig)();
    const result = protos_1.TraceConfig.decode((0, record_controller_1.genConfigProto)(config, { os: 'Q', name: 'Android Q' }));
    const sources = (0, logging_1.assertExists)(result.dataSources);
    const sysInfoConfig = (0, logging_1.assertExists)(sources[1].config);
    expect(sysInfoConfig.name).toBe('linux.system_info');
});
test('cpu scheduling includes kSyms if OS >= S', () => {
    const config = (0, record_config_types_1.createEmptyRecordConfig)();
    config.cpuSched = true;
    const result = protos_1.TraceConfig.decode((0, record_controller_1.genConfigProto)(config, { os: 'S', name: 'Android S' }));
    const sources = (0, logging_1.assertExists)(result.dataSources);
    const srcConfig = (0, logging_1.assertExists)(sources[3].config);
    const ftraceConfig = (0, logging_1.assertExists)(srcConfig.ftraceConfig);
    const ftraceEvents = (0, logging_1.assertExists)(ftraceConfig.ftraceEvents);
    expect(ftraceConfig.symbolizeKsyms).toBe(true);
    expect(ftraceEvents.includes('sched/sched_blocked_reason')).toBe(true);
});
test('cpu scheduling does not include kSyms if OS <= S', () => {
    const config = (0, record_config_types_1.createEmptyRecordConfig)();
    config.cpuSched = true;
    const result = protos_1.TraceConfig.decode((0, record_controller_1.genConfigProto)(config, { os: 'Q', name: 'Android Q' }));
    const sources = (0, logging_1.assertExists)(result.dataSources);
    const srcConfig = (0, logging_1.assertExists)(sources[3].config);
    const ftraceConfig = (0, logging_1.assertExists)(srcConfig.ftraceConfig);
    const ftraceEvents = (0, logging_1.assertExists)(ftraceConfig.ftraceEvents);
    expect(ftraceConfig.symbolizeKsyms).toBe(false);
    expect(ftraceEvents.includes('sched/sched_blocked_reason')).toBe(false);
});
test('kSyms can be enabled individually', () => {
    const config = (0, record_config_types_1.createEmptyRecordConfig)();
    config.ftrace = true;
    config.symbolizeKsyms = true;
    const result = protos_1.TraceConfig.decode((0, record_controller_1.genConfigProto)(config, { os: 'Q', name: 'Android Q' }));
    const sources = (0, logging_1.assertExists)(result.dataSources);
    const srcConfig = (0, logging_1.assertExists)(sources[2].config);
    const ftraceConfig = (0, logging_1.assertExists)(srcConfig.ftraceConfig);
    const ftraceEvents = (0, logging_1.assertExists)(ftraceConfig.ftraceEvents);
    expect(ftraceConfig.symbolizeKsyms).toBe(true);
    expect(ftraceEvents.includes('sched/sched_blocked_reason')).toBe(true);
});
test('kSyms can be disabled individually', () => {
    const config = (0, record_config_types_1.createEmptyRecordConfig)();
    config.ftrace = true;
    config.symbolizeKsyms = false;
    const result = protos_1.TraceConfig.decode((0, record_controller_1.genConfigProto)(config, { os: 'Q', name: 'Android Q' }));
    const sources = (0, logging_1.assertExists)(result.dataSources);
    const srcConfig = (0, logging_1.assertExists)(sources[2].config);
    const ftraceConfig = (0, logging_1.assertExists)(srcConfig.ftraceConfig);
    const ftraceEvents = (0, logging_1.assertExists)(ftraceConfig.ftraceEvents);
    expect(ftraceConfig.symbolizeKsyms).toBe(false);
    expect(ftraceEvents.includes('sched/sched_blocked_reason')).toBe(false);
});
test('toPbtxt', () => {
    const config = {
        durationMs: 1000,
        maxFileSizeBytes: 43,
        buffers: [
            {
                sizeKb: 42,
            },
        ],
        dataSources: [
            {
                config: {
                    name: 'linux.ftrace',
                    targetBuffer: 1,
                    ftraceConfig: {
                        ftraceEvents: ['sched_switch', 'print'],
                    },
                },
            },
        ],
        producers: [
            {
                producerName: 'perfetto.traced_probes',
            },
        ],
    };
    const text = (0, record_controller_1.toPbtxt)(protos_1.TraceConfig.encode(config).finish());
    expect(text).toEqual(`buffers: {
    size_kb: 42
}
data_sources: {
    config {
        name: "linux.ftrace"
        target_buffer: 1
        ftrace_config {
            ftrace_events: "sched_switch"
            ftrace_events: "print"
        }
    }
}
duration_ms: 1000
producers: {
    producer_name: "perfetto.traced_probes"
}
max_file_size_bytes: 43
`);
});
test('ChromeConfig', () => {
    const config = (0, record_config_types_1.createEmptyRecordConfig)();
    config.ipcFlows = true;
    config.jsExecution = true;
    config.mode = 'STOP_WHEN_FULL';
    const result = protos_1.TraceConfig.decode((0, record_controller_1.genConfigProto)(config, { os: 'C', name: 'Chrome' }));
    const sources = (0, logging_1.assertExists)(result.dataSources);
    const traceConfigSource = (0, logging_1.assertExists)(sources[0].config);
    expect(traceConfigSource.name).toBe('org.chromium.trace_event');
    const chromeConfig = (0, logging_1.assertExists)(traceConfigSource.chromeConfig);
    expect(chromeConfig.privacyFilteringEnabled).toBe(false);
    const traceConfig = (0, logging_1.assertExists)(chromeConfig.traceConfig);
    const trackEventConfigSource = (0, logging_1.assertExists)(sources[1].config);
    expect(trackEventConfigSource.name).toBe('track_event');
    const trackEventConfig = (0, logging_1.assertExists)(trackEventConfigSource.trackEventConfig);
    expect(trackEventConfig.filterDynamicEventNames).toBe(false);
    expect(trackEventConfig.filterDebugAnnotations).toBe(false);
    const chromeConfigT = (0, logging_1.assertExists)(trackEventConfigSource.chromeConfig);
    const traceConfigT = (0, logging_1.assertExists)(chromeConfigT.traceConfig);
    const metadataConfigSource = (0, logging_1.assertExists)(sources[2].config);
    expect(metadataConfigSource.name).toBe('org.chromium.trace_metadata');
    const chromeConfigM = (0, logging_1.assertExists)(metadataConfigSource.chromeConfig);
    const traceConfigM = (0, logging_1.assertExists)(chromeConfigM.traceConfig);
    const expectedTraceConfig = '{"record_mode":"record-until-full",' +
        '"included_categories":' +
        '["toplevel","toplevel.flow","disabled-by-default-ipc.flow",' +
        '"mojom","v8"],' +
        '"excluded_categories":["*"],' +
        '"memory_dump_config":{}}';
    expect(traceConfig).toEqual(expectedTraceConfig);
    expect(traceConfigT).toEqual(expectedTraceConfig);
    expect(traceConfigM).toEqual(expectedTraceConfig);
});
test('ChromeConfig with privacy filtering', () => {
    const config = (0, record_config_types_1.createEmptyRecordConfig)();
    config.ipcFlows = true;
    config.jsExecution = true;
    config.mode = 'STOP_WHEN_FULL';
    config.chromePrivacyFiltering = true;
    const result = protos_1.TraceConfig.decode((0, record_controller_1.genConfigProto)(config, { os: 'C', name: 'Chrome' }));
    const sources = (0, logging_1.assertExists)(result.dataSources);
    const traceConfigSource = (0, logging_1.assertExists)(sources[0].config);
    expect(traceConfigSource.name).toBe('org.chromium.trace_event');
    const chromeConfig = (0, logging_1.assertExists)(traceConfigSource.chromeConfig);
    expect(chromeConfig.privacyFilteringEnabled).toBe(true);
    const trackEventConfigSource = (0, logging_1.assertExists)(sources[1].config);
    expect(trackEventConfigSource.name).toBe('track_event');
    const trackEventConfig = (0, logging_1.assertExists)(trackEventConfigSource.trackEventConfig);
    expect(trackEventConfig.filterDynamicEventNames).toBe(true);
    expect(trackEventConfig.filterDebugAnnotations).toBe(true);
});
test('ChromeMemoryConfig', () => {
    const config = (0, record_config_types_1.createEmptyRecordConfig)();
    config.chromeHighOverheadCategoriesSelected = [
        'disabled-by-default-memory-infra',
    ];
    const result = protos_1.TraceConfig.decode((0, record_controller_1.genConfigProto)(config, { os: 'C', name: 'Chrome' }));
    const sources = (0, logging_1.assertExists)(result.dataSources);
    const traceConfigSource = (0, logging_1.assertExists)(sources[0].config);
    expect(traceConfigSource.name).toBe('org.chromium.trace_event');
    const chromeConfig = (0, logging_1.assertExists)(traceConfigSource.chromeConfig);
    const traceConfig = (0, logging_1.assertExists)(chromeConfig.traceConfig);
    const trackEventConfigSource = (0, logging_1.assertExists)(sources[1].config);
    expect(trackEventConfigSource.name).toBe('track_event');
    const chromeConfigT = (0, logging_1.assertExists)(trackEventConfigSource.chromeConfig);
    const traceConfigT = (0, logging_1.assertExists)(chromeConfigT.traceConfig);
    const metadataConfigSource = (0, logging_1.assertExists)(sources[2].config);
    expect(metadataConfigSource.name).toBe('org.chromium.trace_metadata');
    const chromeConfigM = (0, logging_1.assertExists)(metadataConfigSource.chromeConfig);
    const traceConfigM = (0, logging_1.assertExists)(chromeConfigM.traceConfig);
    const miConfigSource = (0, logging_1.assertExists)(sources[3].config);
    expect(miConfigSource.name).toBe('org.chromium.memory_instrumentation');
    const chromeConfigI = (0, logging_1.assertExists)(miConfigSource.chromeConfig);
    const traceConfigI = (0, logging_1.assertExists)(chromeConfigI.traceConfig);
    const hpConfigSource = (0, logging_1.assertExists)(sources[4].config);
    expect(hpConfigSource.name).toBe('org.chromium.native_heap_profiler');
    const chromeConfigH = (0, logging_1.assertExists)(hpConfigSource.chromeConfig);
    const traceConfigH = (0, logging_1.assertExists)(chromeConfigH.traceConfig);
    const expectedTraceConfig = '{"record_mode":"record-until-full",' +
        '"included_categories":["disabled-by-default-memory-infra"],' +
        '"excluded_categories":["*"],' +
        '"memory_dump_config":{"allowed_dump_modes":["background",' +
        '"light","detailed"],"triggers":[{"min_time_between_dumps_ms":' +
        '10000,"mode":"detailed","type":"periodic_interval"}]}}';
    expect(traceConfig).toEqual(expectedTraceConfig);
    expect(traceConfigT).toEqual(expectedTraceConfig);
    expect(traceConfigM).toEqual(expectedTraceConfig);
    expect(traceConfigI).toEqual(expectedTraceConfig);
    expect(traceConfigH).toEqual(expectedTraceConfig);
});
test('ChromeCpuProfilerConfig', () => {
    const config = (0, record_config_types_1.createEmptyRecordConfig)();
    config.chromeHighOverheadCategoriesSelected = [
        'disabled-by-default-cpu_profiler',
    ];
    const decoded = protos_1.TraceConfig.decode((0, record_controller_1.genConfigProto)(config, { os: 'C', name: 'Chrome' }));
    const sources = (0, logging_1.assertExists)(decoded.dataSources);
    const traceConfigSource = (0, logging_1.assertExists)(sources[0].config);
    expect(traceConfigSource.name).toBe('org.chromium.trace_event');
    const traceEventChromeConfig = (0, logging_1.assertExists)(traceConfigSource.chromeConfig);
    const traceEventConfig = (0, logging_1.assertExists)(traceEventChromeConfig.traceConfig);
    const trackEventConfigSource = (0, logging_1.assertExists)(sources[1].config);
    expect(trackEventConfigSource.name).toBe('track_event');
    const chromeConfigT = (0, logging_1.assertExists)(trackEventConfigSource.chromeConfig);
    const traceConfigT = (0, logging_1.assertExists)(chromeConfigT.traceConfig);
    const metadataConfigSource = (0, logging_1.assertExists)(sources[2].config);
    expect(metadataConfigSource.name).toBe('org.chromium.trace_metadata');
    const traceMetadataChromeConfig = (0, logging_1.assertExists)(metadataConfigSource.chromeConfig);
    const traceMetadataConfig = (0, logging_1.assertExists)(traceMetadataChromeConfig.traceConfig);
    const profilerConfigSource = (0, logging_1.assertExists)(sources[3].config);
    expect(profilerConfigSource.name).toBe('org.chromium.sampler_profiler');
    const profilerChromeConfig = (0, logging_1.assertExists)(profilerConfigSource.chromeConfig);
    const profilerConfig = (0, logging_1.assertExists)(profilerChromeConfig.traceConfig);
    const expectedTraceConfig = '{"record_mode":"record-until-full",' +
        '"included_categories":["disabled-by-default-cpu_profiler"],' +
        '"excluded_categories":["*"],"memory_dump_config":{}}';
    expect(traceEventConfig).toEqual(expectedTraceConfig);
    expect(traceConfigT).toEqual(expectedTraceConfig);
    expect(traceMetadataConfig).toEqual(expectedTraceConfig);
    expect(profilerConfig).toEqual(expectedTraceConfig);
});
test('ChromeCpuProfilerDebugConfig', () => {
    const config = (0, record_config_types_1.createEmptyRecordConfig)();
    config.chromeHighOverheadCategoriesSelected = [
        'disabled-by-default-cpu_profiler.debug',
    ];
    const decoded = protos_1.TraceConfig.decode((0, record_controller_1.genConfigProto)(config, { os: 'C', name: 'Chrome' }));
    const sources = (0, logging_1.assertExists)(decoded.dataSources);
    const traceConfigSource = (0, logging_1.assertExists)(sources[0].config);
    expect(traceConfigSource.name).toBe('org.chromium.trace_event');
    const traceEventChromeConfig = (0, logging_1.assertExists)(traceConfigSource.chromeConfig);
    const traceEventConfig = (0, logging_1.assertExists)(traceEventChromeConfig.traceConfig);
    const trackEventConfigSource = (0, logging_1.assertExists)(sources[1].config);
    expect(trackEventConfigSource.name).toBe('track_event');
    const chromeConfigT = (0, logging_1.assertExists)(trackEventConfigSource.chromeConfig);
    const traceConfigT = (0, logging_1.assertExists)(chromeConfigT.traceConfig);
    const metadataConfigSource = (0, logging_1.assertExists)(sources[2].config);
    expect(metadataConfigSource.name).toBe('org.chromium.trace_metadata');
    const traceMetadataChromeConfig = (0, logging_1.assertExists)(metadataConfigSource.chromeConfig);
    const traceMetadataConfig = (0, logging_1.assertExists)(traceMetadataChromeConfig.traceConfig);
    const profilerConfigSource = (0, logging_1.assertExists)(sources[3].config);
    expect(profilerConfigSource.name).toBe('org.chromium.sampler_profiler');
    const profilerChromeConfig = (0, logging_1.assertExists)(profilerConfigSource.chromeConfig);
    const profilerConfig = (0, logging_1.assertExists)(profilerChromeConfig.traceConfig);
    const expectedTraceConfig = '{"record_mode":"record-until-full",' +
        '"included_categories":["disabled-by-default-cpu_profiler.debug"],' +
        '"excluded_categories":["*"],"memory_dump_config":{}}';
    expect(traceConfigT).toEqual(expectedTraceConfig);
    expect(traceEventConfig).toEqual(expectedTraceConfig);
    expect(traceMetadataConfig).toEqual(expectedTraceConfig);
    expect(profilerConfig).toEqual(expectedTraceConfig);
});
test('ChromeConfigRingBuffer', () => {
    const config = (0, record_config_types_1.createEmptyRecordConfig)();
    config.ipcFlows = true;
    config.jsExecution = true;
    config.mode = 'RING_BUFFER';
    const result = protos_1.TraceConfig.decode((0, record_controller_1.genConfigProto)(config, { os: 'C', name: 'Chrome' }));
    const sources = (0, logging_1.assertExists)(result.dataSources);
    const traceConfigSource = (0, logging_1.assertExists)(sources[0].config);
    expect(traceConfigSource.name).toBe('org.chromium.trace_event');
    const chromeConfig = (0, logging_1.assertExists)(traceConfigSource.chromeConfig);
    const traceConfig = (0, logging_1.assertExists)(chromeConfig.traceConfig);
    const trackEventConfigSource = (0, logging_1.assertExists)(sources[1].config);
    expect(trackEventConfigSource.name).toBe('track_event');
    const chromeConfigT = (0, logging_1.assertExists)(trackEventConfigSource.chromeConfig);
    const traceConfigT = (0, logging_1.assertExists)(chromeConfigT.traceConfig);
    const metadataConfigSource = (0, logging_1.assertExists)(sources[2].config);
    expect(metadataConfigSource.name).toBe('org.chromium.trace_metadata');
    const chromeConfigM = (0, logging_1.assertExists)(metadataConfigSource.chromeConfig);
    const traceConfigM = (0, logging_1.assertExists)(chromeConfigM.traceConfig);
    const expectedTraceConfig = '{"record_mode":"record-continuously",' +
        '"included_categories":' +
        '["toplevel","toplevel.flow","disabled-by-default-ipc.flow",' +
        '"mojom","v8"],' +
        '"excluded_categories":["*"],"memory_dump_config":{}}';
    expect(traceConfig).toEqual(expectedTraceConfig);
    expect(traceConfigT).toEqual(expectedTraceConfig);
    expect(traceConfigM).toEqual(expectedTraceConfig);
});
test('ChromeConfigLongTrace', () => {
    const config = (0, record_config_types_1.createEmptyRecordConfig)();
    config.ipcFlows = true;
    config.jsExecution = true;
    config.mode = 'RING_BUFFER';
    const result = protos_1.TraceConfig.decode((0, record_controller_1.genConfigProto)(config, { os: 'C', name: 'Chrome' }));
    const sources = (0, logging_1.assertExists)(result.dataSources);
    const traceConfigSource = (0, logging_1.assertExists)(sources[0].config);
    expect(traceConfigSource.name).toBe('org.chromium.trace_event');
    const chromeConfig = (0, logging_1.assertExists)(traceConfigSource.chromeConfig);
    const traceConfig = (0, logging_1.assertExists)(chromeConfig.traceConfig);
    const trackEventConfigSource = (0, logging_1.assertExists)(sources[1].config);
    expect(trackEventConfigSource.name).toBe('track_event');
    const chromeConfigT = (0, logging_1.assertExists)(trackEventConfigSource.chromeConfig);
    const traceConfigT = (0, logging_1.assertExists)(chromeConfigT.traceConfig);
    const metadataConfigSource = (0, logging_1.assertExists)(sources[2].config);
    expect(metadataConfigSource.name).toBe('org.chromium.trace_metadata');
    const chromeConfigM = (0, logging_1.assertExists)(metadataConfigSource.chromeConfig);
    const traceConfigM = (0, logging_1.assertExists)(chromeConfigM.traceConfig);
    const expectedTraceConfig = '{"record_mode":"record-continuously",' +
        '"included_categories":' +
        '["toplevel","toplevel.flow","disabled-by-default-ipc.flow",' +
        '"mojom","v8"],' +
        '"excluded_categories":["*"],"memory_dump_config":{}}';
    expect(traceConfig).toEqual(expectedTraceConfig);
    expect(traceConfigT).toEqual(expectedTraceConfig);
    expect(traceConfigM).toEqual(expectedTraceConfig);
});
test('ChromeConfigToPbtxt', () => {
    const config = {
        dataSources: [
            {
                config: {
                    name: 'org.chromium.trace_event',
                    chromeConfig: {
                        traceConfig: JSON.stringify({ included_categories: ['v8'] }),
                    },
                },
            },
        ],
    };
    const text = (0, record_controller_1.toPbtxt)(protos_1.TraceConfig.encode(config).finish());
    expect(text).toEqual(`data_sources: {
    config {
        name: "org.chromium.trace_event"
        chrome_config {
            trace_config: "{\\"included_categories\\":[\\"v8\\"]}"
        }
    }
}
`);
});
//# sourceMappingURL=record_controller_jsdomtest.js.map