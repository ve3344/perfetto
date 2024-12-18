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
exports.DurationPrecisionMenuItem = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const menu_1 = require("../../widgets/menu");
const timeline_1 = require("../../public/timeline");
class DurationPrecisionMenuItem {
    view({ attrs }) {
        function renderMenuItem(value, label) {
            return (0, mithril_1.default)(menu_1.MenuItem, {
                label,
                active: value === attrs.trace.timeline.durationPrecision,
                onclick: () => {
                    attrs.trace.timeline.durationPrecision = value;
                    attrs.trace.scheduleFullRedraw();
                },
            });
        }
        function durationPrecisionHasEffect() {
            switch (attrs.trace.timeline.timestampFormat) {
                case timeline_1.TimestampFormat.Timecode:
                case timeline_1.TimestampFormat.UTC:
                case timeline_1.TimestampFormat.TraceTz:
                    return true;
                default:
                    return false;
            }
        }
        return (0, mithril_1.default)(menu_1.MenuItem, {
            label: 'Duration precision',
            disabled: !durationPrecisionHasEffect(),
            title: 'Not configurable with current time format',
        }, renderMenuItem(timeline_1.DurationPrecision.Full, 'Full'), renderMenuItem(timeline_1.DurationPrecision.HumanReadable, 'Human readable'));
    }
}
exports.DurationPrecisionMenuItem = DurationPrecisionMenuItem;
//# sourceMappingURL=duration_precision_menu_items.js.map