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
exports.Section = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
class Section {
    view({ attrs, children }) {
        const { title, ...htmlAttrs } = attrs;
        return (0, mithril_1.default)('section.pf-section', htmlAttrs, (0, mithril_1.default)('header', (0, mithril_1.default)('h1', title)), (0, mithril_1.default)('article', children));
    }
}
exports.Section = Section;
//# sourceMappingURL=section.js.map