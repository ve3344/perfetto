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
exports.EtwSettings = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const record_widgets_1 = require("./record_widgets");
class EtwSettings {
    view({ attrs }) {
        const recCfg = attrs.recState.recordConfig;
        return (0, mithril_1.default)(`.record-section${attrs.cssClass}`, (0, mithril_1.default)(record_widgets_1.Probe, {
            title: 'CSwitch',
            img: null,
            descr: `Enables to recording of context switches.`,
            setEnabled: (cfg, val) => (cfg.etwCSwitch = val),
            isEnabled: (cfg) => cfg.etwCSwitch,
            recCfg,
        }), (0, mithril_1.default)(record_widgets_1.Probe, {
            title: 'Dispatcher',
            img: null,
            descr: 'Enables to get thread state.',
            setEnabled: (cfg, val) => (cfg.etwThreadState = val),
            isEnabled: (cfg) => cfg.etwThreadState,
            recCfg,
        }));
    }
}
exports.EtwSettings = EtwSettings;
//# sourceMappingURL=etw_settings.js.map