"use strict";
// Copyright (C) 2023 The Android Open Source Project
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
exports.LinuxPerfSettings = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const record_widgets_1 = require("./record_widgets");
const PLACEHOLDER_TEXT = `Filters for processes to profile, one per line e.g.:
com.android.phone
lmkd
com.android.webview:sandboxed_process*`;
class LinuxPerfSettings {
    config = { targets: [] };
    view({ attrs }) {
        const recCfg = attrs.recState.recordConfig;
        return (0, mithril_1.default)(`.record-section${attrs.cssClass}`, (0, mithril_1.default)(record_widgets_1.Probe, {
            title: 'Callstack sampling',
            img: 'rec_profiling.png',
            descr: `Periodically records the current callstack (chain of
              function calls) of processes.`,
            setEnabled: (cfg, val) => (cfg.tracePerf = val),
            isEnabled: (cfg) => cfg.tracePerf,
            recCfg,
        }, (0, mithril_1.default)(record_widgets_1.Slider, {
            title: 'Sampling Frequency',
            cssClass: '.thin',
            values: [20, 40, 60, 80, 100, 120, 140, 160, 180, 200],
            unit: 'hz',
            set: (cfg, val) => (cfg.timebaseFrequency = val),
            get: (cfg) => cfg.timebaseFrequency,
            recCfg,
        }), (0, mithril_1.default)(record_widgets_1.Textarea, {
            placeholder: PLACEHOLDER_TEXT,
            cssClass: '.record-apps-list',
            set: (cfg, val) => {
                cfg.targetCmdLine = val.split('\n');
            },
            get: (cfg) => cfg.targetCmdLine.join('\n'),
            recCfg,
        })));
    }
}
exports.LinuxPerfSettings = LinuxPerfSettings;
//# sourceMappingURL=linux_perf_settings.js.map