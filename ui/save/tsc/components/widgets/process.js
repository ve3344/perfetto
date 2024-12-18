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
exports.showProcessDetailsMenuItem = showProcessDetailsMenuItem;
exports.processRefMenuItems = processRefMenuItems;
exports.renderProcessRef = renderProcessRef;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const clipboard_1 = require("../../base/clipboard");
const semantic_icons_1 = require("../../base/semantic_icons");
const utils_1 = require("../../base/utils");
const add_ephemeral_tab_1 = require("../details/add_ephemeral_tab");
const process_1 = require("../sql_utils/process");
const anchor_1 = require("../../widgets/anchor");
const menu_1 = require("../../widgets/menu");
const process_details_tab_1 = require("../details/process_details_tab");
const sql_ref_renderer_registry_1 = require("../widgets/sql/details/sql_ref_renderer_registry");
const core_types_1 = require("../sql_utils/core_types");
const app_impl_1 = require("../../core/app_impl");
function showProcessDetailsMenuItem(upid, pid) {
    return (0, mithril_1.default)(menu_1.MenuItem, {
        icon: semantic_icons_1.Icons.ExternalLink,
        label: 'Show process details',
        onclick: () => {
            // TODO(primiano): `trace` should be injected, but doing so would require
            // an invasive refactoring of most classes in frontend/widgets/sql/*.
            const trace = app_impl_1.AppImpl.instance.trace;
            if (trace === undefined)
                return;
            (0, add_ephemeral_tab_1.addEphemeralTab)('processDetails', new process_details_tab_1.ProcessDetailsTab({
                trace,
                upid,
                pid,
            }));
        },
    });
}
function processRefMenuItems(info) {
    // We capture a copy to be able to pass it across async boundary to `onclick`.
    const name = info.name;
    return [
        (0, utils_1.exists)(name) &&
            (0, mithril_1.default)(menu_1.MenuItem, {
                icon: semantic_icons_1.Icons.Copy,
                label: 'Copy process name',
                onclick: () => (0, clipboard_1.copyToClipboard)(name),
            }),
        (0, utils_1.exists)(info.pid) &&
            (0, mithril_1.default)(menu_1.MenuItem, {
                icon: semantic_icons_1.Icons.Copy,
                label: 'Copy pid',
                onclick: () => (0, clipboard_1.copyToClipboard)(`${info.pid}`),
            }),
        (0, mithril_1.default)(menu_1.MenuItem, {
            icon: semantic_icons_1.Icons.Copy,
            label: 'Copy upid',
            onclick: () => (0, clipboard_1.copyToClipboard)(`${info.upid}`),
        }),
        showProcessDetailsMenuItem(info.upid, info.pid),
    ];
}
function renderProcessRef(info) {
    return (0, mithril_1.default)(menu_1.PopupMenu2, {
        trigger: (0, mithril_1.default)(anchor_1.Anchor, (0, process_1.getProcessName)(info)),
    }, processRefMenuItems(info));
}
sql_ref_renderer_registry_1.sqlIdRegistry['process'] = (0, sql_ref_renderer_registry_1.createSqlIdRefRenderer)(async (engine, id) => await (0, process_1.getProcessInfo)(engine, (0, core_types_1.asUpid)(Number(id))), (data) => ({
    value: renderProcessRef(data),
}));
//# sourceMappingURL=process.js.map