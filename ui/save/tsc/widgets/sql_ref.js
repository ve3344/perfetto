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
exports.SqlRef = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const clipboard_1 = require("../base/clipboard");
const semantic_icons_1 = require("../base/semantic_icons");
const anchor_1 = require("./anchor");
const menu_1 = require("./menu");
class SqlRef {
    view({ attrs }) {
        const { table, id } = attrs;
        if (id !== undefined) {
            return (0, mithril_1.default)(menu_1.PopupMenu2, {
                trigger: (0, mithril_1.default)(anchor_1.Anchor, { icon: semantic_icons_1.Icons.ContextMenu }, `${table}[${id}]`),
            }, (0, mithril_1.default)(menu_1.MenuItem, {
                label: 'Copy ID',
                icon: 'content_copy',
                onclick: () => (0, clipboard_1.copyToClipboard)(`${id}`),
            }), (0, mithril_1.default)(menu_1.MenuItem, {
                label: 'Copy SQL query',
                icon: 'file_copy',
                onclick: () => (0, clipboard_1.copyToClipboard)(`select * from ${table} where id=${id}`),
            }));
        }
        else {
            return `${table}[Unknown]`;
        }
    }
}
exports.SqlRef = SqlRef;
//# sourceMappingURL=sql_ref.js.map