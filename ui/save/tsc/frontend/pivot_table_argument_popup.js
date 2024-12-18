"use strict";
// Copyright (C) 2022 The Android Open Source Project
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
exports.ArgumentPopup = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const raf_scheduler_1 = require("../core/raf_scheduler");
// Component rendering popup for entering an argument name to use as a pivot.
class ArgumentPopup {
    argument = '';
    setArgument(attrs, arg) {
        this.argument = arg;
        attrs.onArgumentChange(arg);
        raf_scheduler_1.raf.scheduleFullRedraw();
    }
    view({ attrs }) {
        return (0, mithril_1.default)('.name-completion', (0, mithril_1.default)('input', {
            oncreate: (vnode) => vnode.dom.focus(),
            oninput: (e) => {
                const input = e.target;
                this.setArgument(attrs, input.value);
            },
            value: this.argument,
        }));
    }
}
exports.ArgumentPopup = ArgumentPopup;
//# sourceMappingURL=pivot_table_argument_popup.js.map