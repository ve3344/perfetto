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
exports.AttributeModalHolder = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const modal_1 = require("../../widgets/modal");
const pivot_table_argument_popup_1 = require("../pivot_table_argument_popup");
class AttributeModalHolder {
    typedArgument = '';
    callback;
    constructor(callback) {
        this.callback = callback;
    }
    start() {
        (0, modal_1.showModal)({
            title: 'Enter argument name',
            content: () => this.renderModalContents(),
            buttons: [
                {
                    text: 'Add',
                    action: () => {
                        this.callback(this.typedArgument);
                        this.typedArgument = '';
                    },
                },
            ],
        });
    }
    renderModalContents() {
        return (0, mithril_1.default)(pivot_table_argument_popup_1.ArgumentPopup, {
            onArgumentChange: (arg) => {
                this.typedArgument = arg;
            },
        });
    }
}
exports.AttributeModalHolder = AttributeModalHolder;
//# sourceMappingURL=attribute_modal_holder.js.map