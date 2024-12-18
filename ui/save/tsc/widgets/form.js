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
exports.FormLabel = exports.Form = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const button_1 = require("./button");
const popup_1 = require("./popup");
const common_1 = require("../widgets/common");
// A simple wrapper around a <form> element providing some opinionated default
// buttons and form behavior. Designed to be used with FormLabel elements.
// Can be used in popups and popup menus and pressing either of the cancel or
// submit buttons dismisses the popup.
// See Widgets page for examples.
class Form {
    view({ attrs, children }) {
        const { submitIcon = undefined, submitLabel = 'Submit', cancelLabel, resetLabel, onSubmit = () => { }, preventDefault = true, ...htmlAttrs } = attrs;
        return (0, mithril_1.default)('form.pf-form', htmlAttrs, children, (0, mithril_1.default)('.pf-form-button-bar', (0, mithril_1.default)(button_1.Button, {
            type: 'submit',
            label: submitLabel,
            rightIcon: submitIcon,
            className: popup_1.Popup.DISMISS_POPUP_GROUP_CLASS,
            intent: common_1.Intent.Primary,
            onclick: (e) => {
                preventDefault && e.preventDefault();
                onSubmit();
            },
        }), 
        // This cancel button just closes the popup if we are inside one.
        cancelLabel &&
            (0, mithril_1.default)(button_1.Button, {
                type: 'button',
                label: cancelLabel,
                className: popup_1.Popup.DISMISS_POPUP_GROUP_CLASS,
            }), 
        // This reset button just clears the form.
        resetLabel &&
            (0, mithril_1.default)(button_1.Button, {
                label: resetLabel,
                type: 'reset',
            })));
    }
}
exports.Form = Form;
// A simple wrapper around a <label> element. Designed to be used within Form
// widgets in combination with input controls to provide consistent label
// styling.
//
// Like normal labels, FormLabels provide a name for an input while also
// improving their hit area which improves a11y.
//
// Labels are bound to inputs by placing the input inside the FormLabel widget,
// or by referencing the input's "id" tag with a "for" tag.
class FormLabel {
    view({ attrs, children }) {
        return (0, mithril_1.default)('label.pf-form-label', attrs, children);
    }
}
exports.FormLabel = FormLabel;
//# sourceMappingURL=form.js.map