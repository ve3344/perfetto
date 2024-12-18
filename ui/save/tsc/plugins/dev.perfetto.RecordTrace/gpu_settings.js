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
exports.GpuSettings = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const record_widgets_1 = require("./record_widgets");
class GpuSettings {
    view({ attrs }) {
        const recCfg = attrs.recState.recordConfig;
        return (0, mithril_1.default)(`.record-section${attrs.cssClass}`, (0, mithril_1.default)(record_widgets_1.Probe, {
            title: 'GPU frequency',
            img: 'rec_cpu_freq.png',
            descr: 'Records gpu frequency via ftrace',
            setEnabled: (cfg, val) => (cfg.gpuFreq = val),
            isEnabled: (cfg) => cfg.gpuFreq,
            recCfg,
        }), (0, mithril_1.default)(record_widgets_1.Probe, {
            title: 'GPU memory',
            img: 'rec_gpu_mem_total.png',
            descr: `Allows to track per process and global total GPU memory usages.
                (Available on recent Android 12+ kernels)`,
            setEnabled: (cfg, val) => (cfg.gpuMemTotal = val),
            isEnabled: (cfg) => cfg.gpuMemTotal,
            recCfg,
        }), (0, mithril_1.default)(record_widgets_1.Probe, {
            title: 'GPU work period',
            img: 'rec_cpu_voltage.png',
            descr: `Allows to track per package GPU work.
                (Available on recent Android 14+ kernels)`,
            setEnabled: (cfg, val) => (cfg.gpuWorkPeriod = val),
            isEnabled: (cfg) => cfg.gpuWorkPeriod,
            recCfg,
        }));
    }
}
exports.GpuSettings = GpuSettings;
//# sourceMappingURL=gpu_settings.js.map