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
exports.TimestampFormatMenuItem = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const menu_1 = require("../../widgets/menu");
const timeline_1 = require("../../public/timeline");
class TimestampFormatMenuItem {
    view({ attrs }) {
        function renderMenuItem(value, label) {
            return (0, mithril_1.default)(menu_1.MenuItem, {
                label,
                active: value === attrs.trace.timeline.timestampFormat,
                onclick: () => {
                    attrs.trace.timeline.timestampFormat = value;
                    attrs.trace.scheduleFullRedraw();
                },
            });
        }
        return (0, mithril_1.default)(menu_1.MenuItem, {
            label: 'Time format',
        }, renderMenuItem(timeline_1.TimestampFormat.Timecode, 'Timecode'), renderMenuItem(timeline_1.TimestampFormat.UTC, 'Realtime (UTC)'), renderMenuItem(timeline_1.TimestampFormat.TraceTz, 'Realtime (Trace TZ)'), renderMenuItem(timeline_1.TimestampFormat.Seconds, 'Seconds'), renderMenuItem(timeline_1.TimestampFormat.Milliseconds, 'Milliseconds'), renderMenuItem(timeline_1.TimestampFormat.Microseconds, 'Microseconds'), renderMenuItem(timeline_1.TimestampFormat.TraceNs, 'Raw'), renderMenuItem(timeline_1.TimestampFormat.TraceNsLocale, 'Raw (with locale-specific formatting)'));
    }
}
exports.TimestampFormatMenuItem = TimestampFormatMenuItem;
//# sourceMappingURL=timestamp_format_menu.js.map