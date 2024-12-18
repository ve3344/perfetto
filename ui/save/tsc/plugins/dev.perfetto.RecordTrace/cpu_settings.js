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
exports.CpuSettings = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const record_widgets_1 = require("./record_widgets");
const recording_sections_1 = require("./recording_sections");
class CpuSettings {
    view({ attrs }) {
        const recCfg = attrs.recState.recordConfig;
        return (0, mithril_1.default)(`.record-section${attrs.cssClass}`, (0, mithril_1.default)(record_widgets_1.Probe, {
            title: 'Coarse CPU usage counter',
            img: 'rec_cpu_coarse.png',
            descr: `Lightweight polling of CPU usage counters via /proc/stat.
                    Allows to periodically monitor CPU usage.`,
            setEnabled: (cfg, val) => (cfg.cpuCoarse = val),
            isEnabled: (cfg) => cfg.cpuCoarse,
            recCfg,
        }, (0, mithril_1.default)(record_widgets_1.Slider, {
            title: 'Poll interval',
            cssClass: '.thin',
            values: recording_sections_1.POLL_INTERVAL_MS,
            unit: 'ms',
            set: (cfg, val) => (cfg.cpuCoarsePollMs = val),
            get: (cfg) => cfg.cpuCoarsePollMs,
            recCfg,
        })), (0, mithril_1.default)(record_widgets_1.Probe, {
            title: 'Scheduling details',
            img: 'rec_cpu_fine.png',
            descr: 'Enables high-detailed tracking of scheduling events',
            setEnabled: (cfg, val) => (cfg.cpuSched = val),
            isEnabled: (cfg) => cfg.cpuSched,
            recCfg,
        }), (0, mithril_1.default)(record_widgets_1.Probe, {
            title: 'CPU frequency and idle states',
            img: 'rec_cpu_freq.png',
            descr: 'Records cpu frequency and idle state changes via ftrace and sysfs',
            setEnabled: (cfg, val) => (cfg.cpuFreq = val),
            isEnabled: (cfg) => cfg.cpuFreq,
            recCfg,
        }, (0, mithril_1.default)(record_widgets_1.Slider, {
            title: 'Sysfs poll interval',
            cssClass: '.thin',
            values: recording_sections_1.POLL_INTERVAL_MS,
            unit: 'ms',
            set: (cfg, val) => (cfg.cpuFreqPollMs = val),
            get: (cfg) => cfg.cpuFreqPollMs,
            recCfg,
        })), (0, mithril_1.default)(record_widgets_1.Probe, {
            title: 'Syscalls',
            img: 'rec_syscalls.png',
            descr: `Tracks the enter and exit of all syscalls. On Android
                requires a userdebug or eng build.`,
            setEnabled: (cfg, val) => (cfg.cpuSyscall = val),
            isEnabled: (cfg) => cfg.cpuSyscall,
            recCfg,
        }));
    }
}
exports.CpuSettings = CpuSettings;
//# sourceMappingURL=cpu_settings.js.map