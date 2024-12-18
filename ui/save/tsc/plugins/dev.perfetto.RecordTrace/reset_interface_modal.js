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
exports.couldNotClaimInterface = couldNotClaimInterface;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const modal_1 = require("../../widgets/modal");
const recording_ui_utils_1 = require("./recording_ui_utils");
function couldNotClaimInterface(onReset, onCancel) {
    let hasPressedAButton = false;
    (0, modal_1.showModal)({
        title: 'Could not claim the USB interface',
        content: (0, mithril_1.default)('div', (0, mithril_1.default)('text', 'This can happen if you have the Android Debug Bridge ' +
            '(adb) running on your workstation or any other tool which is ' +
            'taking exclusive access of the USB interface.'), (0, mithril_1.default)('br'), (0, mithril_1.default)('br'), (0, mithril_1.default)('text.small-font', 'Resetting will cause the ADB server to disconnect and ' +
            'will try to reassign the interface to the current browser.')),
        buttons: [
            {
                text: recording_ui_utils_1.FORCE_RESET_MESSAGE,
                primary: true,
                id: 'force_USB_interface',
                action: () => {
                    hasPressedAButton = true;
                    onReset();
                },
            },
            {
                text: 'Cancel',
                primary: false,
                id: 'cancel_USB_interface',
                action: () => {
                    hasPressedAButton = true;
                    onCancel();
                },
            },
        ],
    }).then(() => {
        // If the user has clicked away from the modal, we interpret that as a
        // 'Cancel'.
        if (!hasPressedAButton) {
            onCancel();
        }
    });
}
//# sourceMappingURL=reset_interface_modal.js.map