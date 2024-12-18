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
exports.PowerSettings = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const globals_1 = require("../../frontend/globals");
const record_widgets_1 = require("./record_widgets");
const recording_sections_1 = require("./recording_sections");
class PowerSettings {
    view({ attrs }) {
        const recCfg = attrs.recState.recordConfig;
        const DOC_URL = 'https://perfetto.dev/docs/data-sources/battery-counters';
        const descr = [
            (0, mithril_1.default)('div', (0, mithril_1.default)('span', `Polls charge counters and instantaneous power draw from
                    the battery power management IC and the power rails from
                    the PowerStats HAL (`), (0, mithril_1.default)('a', { href: DOC_URL, target: '_blank' }, 'see docs for more'), (0, mithril_1.default)('span', ')')),
        ];
        // TODO(primiano): figure out a better story for isInternalUser.
        if (globals_1.globals.isInternalUser) {
            descr.push((0, mithril_1.default)('div', (0, mithril_1.default)('span', 'Googlers: See '), (0, mithril_1.default)('a', { href: 'http://go/power-rails-internal-doc', target: '_blank' }, 'this doc'), (0, mithril_1.default)('span', ` for instructions on how to change the default rail selection
                  on internal devices.`)));
        }
        return (0, mithril_1.default)(`.record-section${attrs.cssClass}`, (0, mithril_1.default)(record_widgets_1.Probe, {
            title: 'Battery drain & power rails',
            img: 'rec_battery_counters.png',
            descr,
            setEnabled: (cfg, val) => (cfg.batteryDrain = val),
            isEnabled: (cfg) => cfg.batteryDrain,
            recCfg,
        }, (0, mithril_1.default)(record_widgets_1.Slider, {
            title: 'Poll interval',
            cssClass: '.thin',
            values: recording_sections_1.POLL_INTERVAL_MS,
            unit: 'ms',
            set: (cfg, val) => (cfg.batteryDrainPollMs = val),
            get: (cfg) => cfg.batteryDrainPollMs,
            recCfg,
        })), (0, mithril_1.default)(record_widgets_1.Probe, {
            title: 'Board voltages & frequencies',
            img: 'rec_board_voltage.png',
            descr: 'Tracks voltage and frequency changes from board sensors',
            setEnabled: (cfg, val) => (cfg.boardSensors = val),
            isEnabled: (cfg) => cfg.boardSensors,
            recCfg,
        }));
    }
}
exports.PowerSettings = PowerSettings;
//# sourceMappingURL=power_settings.js.map