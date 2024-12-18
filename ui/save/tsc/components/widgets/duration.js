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
exports.DurationWidget = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const clipboard_1 = require("../../base/clipboard");
const logging_1 = require("../../base/logging");
const semantic_icons_1 = require("../../base/semantic_icons");
const app_impl_1 = require("../../core/app_impl");
const anchor_1 = require("../../widgets/anchor");
const menu_1 = require("../../widgets/menu");
const time_utils_1 = require("../time_utils");
const duration_precision_menu_items_1 = require("./duration_precision_menu_items");
const timestamp_format_menu_1 = require("./timestamp_format_menu");
class DurationWidget {
    trace;
    constructor() {
        // TODO(primiano): the Trace object should be injected into the attrs, but
        // there are too many users of this class and doing so requires a larger
        // refactoring CL. Either that or we should find a different way to plumb
        // the hoverCursorTimestamp.
        this.trace = (0, logging_1.assertExists)(app_impl_1.AppImpl.instance.trace);
    }
    view({ attrs }) {
        const { dur } = attrs;
        if (dur === -1n) {
            return '(Did not end)';
        }
        return (0, mithril_1.default)(menu_1.PopupMenu2, {
            trigger: (0, mithril_1.default)(anchor_1.Anchor, (0, time_utils_1.formatDuration)(this.trace, dur)),
        }, (0, mithril_1.default)(menu_1.MenuItem, {
            icon: semantic_icons_1.Icons.Copy,
            label: `Copy raw value`,
            onclick: () => {
                (0, clipboard_1.copyToClipboard)(dur.toString());
            },
        }), (0, mithril_1.default)(timestamp_format_menu_1.TimestampFormatMenuItem, { trace: this.trace }), (0, mithril_1.default)(duration_precision_menu_items_1.DurationPrecisionMenuItem, { trace: this.trace }), attrs.extraMenuItems ? [(0, mithril_1.default)(menu_1.MenuDivider), attrs.extraMenuItems] : null);
    }
}
exports.DurationWidget = DurationWidget;
//# sourceMappingURL=duration.js.map