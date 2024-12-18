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
exports.CopyableLink = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const clipboard_1 = require("../base/clipboard");
const anchor_1 = require("./anchor");
class CopyableLink {
    view({ attrs }) {
        const url = attrs.url;
        return (0, mithril_1.default)('div', (0, mithril_1.default)(anchor_1.Anchor, {
            href: url,
            title: 'Click to copy the URL into the clipboard',
            target: '_blank',
            icon: attrs.noicon ? undefined : 'content_copy',
            onclick: (e) => {
                e.preventDefault();
                (0, clipboard_1.copyToClipboard)(url);
            },
        }, attrs.text ?? url));
    }
}
exports.CopyableLink = CopyableLink;
//# sourceMappingURL=copyable_link.js.map