"use strict";
// Copyright (C) 2022 The Android Open Source Project
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
exports.MemorySettings = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const protos_1 = require("./protos");
const record_widgets_1 = require("./record_widgets");
const recording_sections_1 = require("./recording_sections");
class HeapSettings {
    view({ attrs }) {
        const valuesForMS = [
            0,
            1000,
            10 * 1000,
            30 * 1000,
            60 * 1000,
            5 * 60 * 1000,
            10 * 60 * 1000,
            30 * 60 * 1000,
            60 * 60 * 1000,
        ];
        const valuesForShMemBuff = [
            0,
            512,
            1024,
            2 * 1024,
            4 * 1024,
            8 * 1024,
            16 * 1024,
            32 * 1024,
            64 * 1024,
            128 * 1024,
            256 * 1024,
            512 * 1024,
            1024 * 1024,
            64 * 1024 * 1024,
            128 * 1024 * 1024,
            256 * 1024 * 1024,
            512 * 1024 * 1024,
        ];
        const recCfg = attrs.recState.recordConfig;
        return (0, mithril_1.default)(`.${attrs.cssClass}`, (0, mithril_1.default)(record_widgets_1.Textarea, {
            title: 'Names or pids of the processes to track (required)',
            docsLink: 'https://perfetto.dev/docs/data-sources/native-heap-profiler#heapprofd-targets',
            placeholder: 'One per line, e.g.:\n' +
                'system_server\n' +
                'com.google.android.apps.photos\n' +
                '1503',
            set: (cfg, val) => (cfg.hpProcesses = val),
            get: (cfg) => cfg.hpProcesses,
            recCfg,
        }), (0, mithril_1.default)(record_widgets_1.Slider, {
            title: 'Sampling interval',
            cssClass: '.thin',
            values: [
                0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192,
                16384, 32768, 65536, 131072, 262144, 524288, 1048576,
            ],
            unit: 'B',
            min: 0,
            set: (cfg, val) => (cfg.hpSamplingIntervalBytes = val),
            get: (cfg) => cfg.hpSamplingIntervalBytes,
            recCfg,
        }), (0, mithril_1.default)(record_widgets_1.Slider, {
            title: 'Continuous dumps interval ',
            description: 'Time between following dumps (0 = disabled)',
            cssClass: '.thin',
            values: valuesForMS,
            unit: 'ms',
            min: 0,
            set: (cfg, val) => {
                cfg.hpContinuousDumpsInterval = val;
            },
            get: (cfg) => cfg.hpContinuousDumpsInterval,
            recCfg,
        }), (0, mithril_1.default)(record_widgets_1.Slider, {
            title: 'Continuous dumps phase',
            description: 'Time before first dump',
            cssClass: `.thin${attrs.recState.recordConfig.hpContinuousDumpsInterval === 0
                ? '.greyed-out'
                : ''}`,
            values: valuesForMS,
            unit: 'ms',
            min: 0,
            disabled: attrs.recState.recordConfig.hpContinuousDumpsInterval === 0,
            set: (cfg, val) => (cfg.hpContinuousDumpsPhase = val),
            get: (cfg) => cfg.hpContinuousDumpsPhase,
            recCfg,
        }), (0, mithril_1.default)(record_widgets_1.Slider, {
            title: `Shared memory buffer`,
            cssClass: '.thin',
            values: valuesForShMemBuff.filter((value) => value === 0 || (value >= 8192 && value % 4096 === 0)),
            unit: 'B',
            min: 0,
            set: (cfg, val) => (cfg.hpSharedMemoryBuffer = val),
            get: (cfg) => cfg.hpSharedMemoryBuffer,
            recCfg,
        }), (0, mithril_1.default)(record_widgets_1.Toggle, {
            title: 'Block client',
            cssClass: '.thin',
            descr: `Slow down target application if profiler cannot keep up.`,
            setEnabled: (cfg, val) => (cfg.hpBlockClient = val),
            isEnabled: (cfg) => cfg.hpBlockClient,
            recCfg,
        }), (0, mithril_1.default)(record_widgets_1.Toggle, {
            title: 'All custom allocators (Q+)',
            cssClass: '.thin',
            descr: `If the target application exposes custom allocators, also
sample from those.`,
            setEnabled: (cfg, val) => (cfg.hpAllHeaps = val),
            isEnabled: (cfg) => cfg.hpAllHeaps,
            recCfg,
        }));
    }
}
class JavaHeapDumpSettings {
    view({ attrs }) {
        const valuesForMS = [
            0,
            1000,
            10 * 1000,
            30 * 1000,
            60 * 1000,
            5 * 60 * 1000,
            10 * 60 * 1000,
            30 * 60 * 1000,
            60 * 60 * 1000,
        ];
        const recCfg = attrs.recState.recordConfig;
        return (0, mithril_1.default)(`.${attrs.cssClass}`, (0, mithril_1.default)(record_widgets_1.Textarea, {
            title: 'Names or pids of the processes to track (required)',
            placeholder: 'One per line, e.g.:\n' + 'com.android.vending\n' + '1503',
            set: (cfg, val) => (cfg.jpProcesses = val),
            get: (cfg) => cfg.jpProcesses,
            recCfg,
        }), (0, mithril_1.default)(record_widgets_1.Slider, {
            title: 'Continuous dumps interval ',
            description: 'Time between following dumps (0 = disabled)',
            cssClass: '.thin',
            values: valuesForMS,
            unit: 'ms',
            min: 0,
            set: (cfg, val) => {
                cfg.jpContinuousDumpsInterval = val;
            },
            get: (cfg) => cfg.jpContinuousDumpsInterval,
            recCfg,
        }), (0, mithril_1.default)(record_widgets_1.Slider, {
            title: 'Continuous dumps phase',
            description: 'Time before first dump',
            cssClass: `.thin${attrs.recState.recordConfig.jpContinuousDumpsInterval === 0
                ? '.greyed-out'
                : ''}`,
            values: valuesForMS,
            unit: 'ms',
            min: 0,
            disabled: attrs.recState.recordConfig.jpContinuousDumpsInterval === 0,
            set: (cfg, val) => (cfg.jpContinuousDumpsPhase = val),
            get: (cfg) => cfg.jpContinuousDumpsPhase,
            recCfg,
        }));
    }
}
class MemorySettings {
    view({ attrs }) {
        const recCfg = attrs.recState.recordConfig;
        const meminfoOpts = new Map();
        for (const x in protos_1.MeminfoCounters) {
            if (typeof protos_1.MeminfoCounters[x] === 'number' &&
                !`${x}`.endsWith('_UNSPECIFIED')) {
                meminfoOpts.set(x, x.replace('MEMINFO_', '').toLowerCase());
            }
        }
        const vmstatOpts = new Map();
        for (const x in protos_1.VmstatCounters) {
            if (typeof protos_1.VmstatCounters[x] === 'number' &&
                !`${x}`.endsWith('_UNSPECIFIED')) {
                vmstatOpts.set(x, x.replace('VMSTAT_', '').toLowerCase());
            }
        }
        return (0, mithril_1.default)(`.record-section${attrs.cssClass}`, (0, mithril_1.default)(record_widgets_1.Probe, {
            title: 'Native heap profiling',
            img: 'rec_native_heap_profiler.png',
            descr: `Track native heap allocations & deallocations of an Android
               process. (Available on Android 10+)`,
            setEnabled: (cfg, val) => (cfg.heapProfiling = val),
            isEnabled: (cfg) => cfg.heapProfiling,
            recCfg,
        }, (0, mithril_1.default)(HeapSettings, attrs)), (0, mithril_1.default)(record_widgets_1.Probe, {
            title: 'Java heap dumps',
            img: 'rec_java_heap_dump.png',
            descr: `Dump information about the Java object graph of an
          Android app. (Available on Android 11+)`,
            setEnabled: (cfg, val) => (cfg.javaHeapDump = val),
            isEnabled: (cfg) => cfg.javaHeapDump,
            recCfg,
        }, (0, mithril_1.default)(JavaHeapDumpSettings, attrs)), (0, mithril_1.default)(record_widgets_1.Probe, {
            title: 'Kernel meminfo',
            img: 'rec_meminfo.png',
            descr: 'Polling of /proc/meminfo',
            setEnabled: (cfg, val) => (cfg.meminfo = val),
            isEnabled: (cfg) => cfg.meminfo,
            recCfg,
        }, (0, mithril_1.default)(record_widgets_1.Slider, {
            title: 'Poll interval',
            cssClass: '.thin',
            values: recording_sections_1.POLL_INTERVAL_MS,
            unit: 'ms',
            set: (cfg, val) => (cfg.meminfoPeriodMs = val),
            get: (cfg) => cfg.meminfoPeriodMs,
            recCfg,
        }), (0, mithril_1.default)(record_widgets_1.Dropdown, {
            title: 'Select counters',
            cssClass: '.multicolumn',
            options: meminfoOpts,
            set: (cfg, val) => (cfg.meminfoCounters = val),
            get: (cfg) => cfg.meminfoCounters,
            recCfg,
        })), (0, mithril_1.default)(record_widgets_1.Probe, {
            title: 'High-frequency memory events',
            img: 'rec_mem_hifreq.png',
            descr: `Allows to track short memory spikes and transitories through
                ftrace's mm_event, rss_stat and ion events. Available only
                on recent Android Q+ kernels`,
            setEnabled: (cfg, val) => (cfg.memHiFreq = val),
            isEnabled: (cfg) => cfg.memHiFreq,
            recCfg,
        }), (0, mithril_1.default)(record_widgets_1.Probe, {
            title: 'Low memory killer',
            img: 'rec_lmk.png',
            descr: `Record LMK events. Works both with the old in-kernel LMK
                and the newer userspace lmkd. It also tracks OOM score
                adjustments.`,
            setEnabled: (cfg, val) => (cfg.memLmk = val),
            isEnabled: (cfg) => cfg.memLmk,
            recCfg,
        }), (0, mithril_1.default)(record_widgets_1.Probe, {
            title: 'Per process stats',
            img: 'rec_ps_stats.png',
            descr: `Periodically samples all processes in the system tracking:
                    their thread list, memory counters (RSS, swap and other
                    /proc/status counters) and oom_score_adj.`,
            setEnabled: (cfg, val) => (cfg.procStats = val),
            isEnabled: (cfg) => cfg.procStats,
            recCfg,
        }, (0, mithril_1.default)(record_widgets_1.Slider, {
            title: 'Poll interval',
            cssClass: '.thin',
            values: recording_sections_1.POLL_INTERVAL_MS,
            unit: 'ms',
            set: (cfg, val) => (cfg.procStatsPeriodMs = val),
            get: (cfg) => cfg.procStatsPeriodMs,
            recCfg,
        })), (0, mithril_1.default)(record_widgets_1.Probe, {
            title: 'Virtual memory stats',
            img: 'rec_vmstat.png',
            descr: `Periodically polls virtual memory stats from /proc/vmstat.
                    Allows to gather statistics about swap, eviction,
                    compression and pagecache efficiency`,
            setEnabled: (cfg, val) => (cfg.vmstat = val),
            isEnabled: (cfg) => cfg.vmstat,
            recCfg,
        }, (0, mithril_1.default)(record_widgets_1.Slider, {
            title: 'Poll interval',
            cssClass: '.thin',
            values: recording_sections_1.POLL_INTERVAL_MS,
            unit: 'ms',
            set: (cfg, val) => (cfg.vmstatPeriodMs = val),
            get: (cfg) => cfg.vmstatPeriodMs,
            recCfg,
        }), (0, mithril_1.default)(record_widgets_1.Dropdown, {
            title: 'Select counters',
            cssClass: '.multicolumn',
            options: vmstatOpts,
            set: (cfg, val) => (cfg.vmstatCounters = val),
            get: (cfg) => cfg.vmstatCounters,
            recCfg,
        })));
    }
}
exports.MemorySettings = MemorySettings;
//# sourceMappingURL=memory_settings.js.map