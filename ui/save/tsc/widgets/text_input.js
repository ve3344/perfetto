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
exports.TextInput = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
// For now, this component is just a simple wrapper around a plain old input
// element, which does no more than specify a class. However, in the future we
// might want to add more features such as an optional icon or button (e.g. a
// clear button), at which point the benefit of having this as a component would
// become more apparent.
class TextInput {
    oncreate(vnode) {
        if (vnode.attrs.autofocus) {
            vnode.dom.focus();
        }
    }
    view({ attrs }) {
        return (0, mithril_1.default)('input.pf-text-input', attrs);
    }
}
exports.TextInput = TextInput;
//# sourceMappingURL=text_input.js.map