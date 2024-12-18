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
exports.RecordingSettings = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const record_widgets_1 = require("./record_widgets");
const assets_1 = require("../../base/assets");
class RecordingSettings {
    view({ attrs }) {
        const S = (x) => x * 1000;
        const M = (x) => x * 1000 * 60;
        const H = (x) => x * 1000 * 60 * 60;
        const recCfg = attrs.recState.recordConfig;
        const recButton = (mode, title, img) => {
            const checkboxArgs = {
                checked: recCfg.mode === mode,
                onchange: (e) => {
                    const checked = e.target.checked;
                    if (!checked)
                        return;
                    recCfg.mode = mode;
                },
            };
            return (0, mithril_1.default)(`label${recCfg.mode === mode ? '.selected' : ''}`, (0, mithril_1.default)(`input[type=radio][name=rec_mode]`, checkboxArgs), (0, mithril_1.default)(`img[src=${(0, assets_1.assetSrc)(`assets/${img}`)}]`), (0, mithril_1.default)('span', title));
        };
        return (0, mithril_1.default)(`.record-section${attrs.cssClass}`, (0, mithril_1.default)('header', 'Recording mode'), (0, mithril_1.default)('.record-mode', recButton('STOP_WHEN_FULL', 'Stop when full', 'rec_one_shot.png'), recButton('RING_BUFFER', 'Ring buffer', 'rec_ring_buf.png'), recButton('LONG_TRACE', 'Long trace', 'rec_long_trace.png')), (0, mithril_1.default)(record_widgets_1.Slider, {
            title: 'In-memory buffer size',
            icon: '360',
            values: [4, 8, 16, 32, 64, 128, 256, 512],
            unit: 'MB',
            set: (cfg, val) => (cfg.bufferSizeMb = val),
            get: (cfg) => cfg.bufferSizeMb,
            recCfg,
        }), (0, mithril_1.default)(record_widgets_1.Slider, {
            title: 'Max duration',
            icon: 'timer',
            values: [S(10), S(15), S(30), S(60), M(5), M(30), H(1), H(6), H(12)],
            isTime: true,
            unit: 'h:m:s',
            set: (cfg, val) => (cfg.durationMs = val),
            get: (cfg) => cfg.durationMs,
            recCfg,
        }), (0, mithril_1.default)(record_widgets_1.Slider, {
            title: 'Max file size',
            icon: 'save',
            cssClass: recCfg.mode !== 'LONG_TRACE' ? '.hide' : '',
            values: [5, 25, 50, 100, 500, 1000, 1000 * 5, 1000 * 10],
            unit: 'MB',
            set: (cfg, val) => (cfg.maxFileSizeMb = val),
            get: (cfg) => cfg.maxFileSizeMb,
            recCfg,
        }), (0, mithril_1.default)(record_widgets_1.Slider, {
            title: 'Flush on disk every',
            cssClass: recCfg.mode !== 'LONG_TRACE' ? '.hide' : '',
            icon: 'av_timer',
            values: [100, 250, 500, 1000, 2500, 5000],
            unit: 'ms',
            set: (cfg, val) => (cfg.fileWritePeriodMs = val),
            get: (cfg) => cfg.fileWritePeriodMs || 0,
            recCfg,
        }));
    }
}
exports.RecordingSettings = RecordingSettings;
//# sourceMappingURL=recording_settings.js.map