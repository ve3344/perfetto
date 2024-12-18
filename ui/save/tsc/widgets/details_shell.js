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
exports.DetailsShell = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const classnames_1 = require("../base/classnames");
// A shell for details panels to be more visually consistent.
// It provides regular placement for the header bar and placement of buttons
class DetailsShell {
    view({ attrs, children }) {
        const { title, description, buttons, fillParent = true } = attrs;
        return (0, mithril_1.default)('section.pf-details-shell', { class: (0, classnames_1.classNames)(fillParent && 'pf-fill-parent') }, (0, mithril_1.default)('header.pf-header-bar', (0, mithril_1.default)('h1.pf-header-title', title), (0, mithril_1.default)('span.pf-header-description', description), (0, mithril_1.default)('nav.pf-header-buttons', buttons)), (0, mithril_1.default)('article.pf-content', children));
    }
}
exports.DetailsShell = DetailsShell;
//# sourceMappingURL=details_shell.js.map