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
exports.showThreadDetailsMenuItem = showThreadDetailsMenuItem;
exports.threadRefMenuItems = threadRefMenuItems;
exports.renderThreadRef = renderThreadRef;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const clipboard_1 = require("../../base/clipboard");
const semantic_icons_1 = require("../../base/semantic_icons");
const utils_1 = require("../../base/utils");
const add_ephemeral_tab_1 = require("../details/add_ephemeral_tab");
const thread_1 = require("../sql_utils/thread");
const anchor_1 = require("../../widgets/anchor");
const menu_1 = require("../../widgets/menu");
const thread_details_tab_1 = require("../details/thread_details_tab");
const sql_ref_renderer_registry_1 = require("./sql/details/sql_ref_renderer_registry");
const core_types_1 = require("../sql_utils/core_types");
const app_impl_1 = require("../../core/app_impl");
function showThreadDetailsMenuItem(utid, tid) {
    return (0, mithril_1.default)(menu_1.MenuItem, {
        icon: semantic_icons_1.Icons.ExternalLink,
        label: 'Show thread details',
        onclick: () => {
            // TODO(primiano): `trace` should be injected, but doing so would require
            // an invasive refactoring of most classes in frontend/widgets/sql/*.
            const trace = app_impl_1.AppImpl.instance.trace;
            if (trace === undefined)
                return;
            (0, add_ephemeral_tab_1.addEphemeralTab)('threadDetails', new thread_details_tab_1.ThreadDetailsTab({
                trace,
                utid,
                tid,
            }));
        },
    });
}
function threadRefMenuItems(info) {
    // We capture a copy to be able to pass it across async boundary to `onclick`.
    const name = info.name;
    return [
        (0, utils_1.exists)(name) &&
            (0, mithril_1.default)(menu_1.MenuItem, {
                icon: semantic_icons_1.Icons.Copy,
                label: 'Copy thread name',
                onclick: () => (0, clipboard_1.copyToClipboard)(name),
            }),
        (0, utils_1.exists)(info.tid) &&
            (0, mithril_1.default)(menu_1.MenuItem, {
                icon: semantic_icons_1.Icons.Copy,
                label: 'Copy tid',
                onclick: () => (0, clipboard_1.copyToClipboard)(`${info.tid}`),
            }),
        (0, mithril_1.default)(menu_1.MenuItem, {
            icon: semantic_icons_1.Icons.Copy,
            label: 'Copy utid',
            onclick: () => (0, clipboard_1.copyToClipboard)(`${info.utid}`),
        }),
        showThreadDetailsMenuItem(info.utid, info.tid),
    ];
}
function renderThreadRef(info) {
    return (0, mithril_1.default)(menu_1.PopupMenu2, {
        trigger: (0, mithril_1.default)(anchor_1.Anchor, (0, thread_1.getThreadName)(info)),
    }, threadRefMenuItems(info));
}
sql_ref_renderer_registry_1.sqlIdRegistry['thread'] = (0, sql_ref_renderer_registry_1.createSqlIdRefRenderer)(async (engine, id) => await (0, thread_1.getThreadInfo)(engine, (0, core_types_1.asUtid)(Number(id))), (data) => ({
    value: renderThreadRef(data),
}));
//# sourceMappingURL=thread.js.map