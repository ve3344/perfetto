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
exports.Checkbox = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const classnames_1 = require("../base/classnames");
class Checkbox {
    view({ attrs }) {
        const { label, disabled, checked, className, ...htmlAttrs } = attrs;
        const classes = (0, classnames_1.classNames)(disabled && 'pf-disabled', className);
        // The default checkbox is removed and an entirely new one created inside
        // the span element in CSS.
        return (0, mithril_1.default)('label.pf-checkbox', {
            ...htmlAttrs,
            className: classes,
        }, (0, mithril_1.default)('input[type=checkbox]', { disabled, checked }), (0, mithril_1.default)('span'), label);
    }
}
exports.Checkbox = Checkbox;
//# sourceMappingURL=checkbox.js.map