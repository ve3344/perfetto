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
exports.showAddNewTargetModal = showAddNewTargetModal;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const recording_utils_1 = require("./recordingV2/recording_utils");
const chrome_target_factory_1 = require("./recordingV2/target_factories/chrome_target_factory");
const target_factory_registry_1 = require("./recordingV2/target_factory_registry");
const websocket_menu_controller_1 = require("./recordingV2/websocket_menu_controller");
const modal_1 = require("../../widgets/modal");
const record_widgets_1 = require("./record_widgets");
const recording_multiple_choice_1 = require("./recording_multiple_choice");
const RUN_WEBSOCKET_CMD = '# Get tracebox\n' +
    'curl -LO https://get.perfetto.dev/tracebox\n' +
    'chmod +x ./tracebox\n' +
    '# Option A - trace android devices\n' +
    'adb start-server\n' +
    '# Option B - trace the host OS\n' +
    './tracebox traced --background\n' +
    './tracebox traced_probes --background\n' +
    '# Start the websocket server\n' +
    './tracebox websocket_bridge\n';
function showAddNewTargetModal(controller) {
    (0, modal_1.showModal)({
        title: 'Add new recording target',
        key: recording_utils_1.RECORDING_MODAL_DIALOG_KEY,
        content: () => (0, mithril_1.default)('.record-modal', (0, mithril_1.default)('text', 'Select platform:'), assembleWebusbSection(controller), (0, mithril_1.default)('.line'), assembleWebsocketSection(controller), (0, mithril_1.default)('.line'), assembleChromeSection(controller)),
    });
}
function assembleWebusbSection(recordingPageController) {
    return (0, mithril_1.default)('.record-modal-section', (0, mithril_1.default)('.logo-wrapping', (0, mithril_1.default)('i.material-icons', 'usb')), (0, mithril_1.default)('.record-modal-description', (0, mithril_1.default)('h3', 'Android device over WebUSB'), (0, mithril_1.default)('text', 'Android developers: this option cannot co-operate ' +
        'with the adb host on your machine. Only one entity between ' +
        'the browser and adb can control the USB endpoint. If adb is ' +
        'running, you will be prompted to re-assign the device to the ' +
        'browser. Use the websocket option below to use both ' +
        'simultaneously.'), (0, mithril_1.default)('.record-modal-button', {
        onclick: () => {
            (0, modal_1.closeModal)(recording_utils_1.RECORDING_MODAL_DIALOG_KEY);
            recordingPageController.addAndroidDevice();
        },
    }, 'Connect new WebUSB driver')));
}
function assembleWebsocketSection(recordingPageController) {
    const websocketComponents = [];
    websocketComponents.push((0, mithril_1.default)('h3', 'Android / Linux / MacOS device via Websocket'));
    websocketComponents.push((0, mithril_1.default)('text', 'This option assumes that the adb server is already ' +
        'running on your machine.'), (0, mithril_1.default)('.record-modal-command', (0, mithril_1.default)(record_widgets_1.CodeSnippet, {
        text: RUN_WEBSOCKET_CMD,
    })));
    websocketComponents.push((0, mithril_1.default)('.record-modal-command', (0, mithril_1.default)('text', 'Websocket bridge address: '), (0, mithril_1.default)('input[type=text]', {
        value: websocketMenuController.getPath(),
        oninput() {
            websocketMenuController.setPath(this.value);
        },
    }), (0, mithril_1.default)('.record-modal-logo-button', {
        onclick: () => websocketMenuController.onPathChange(),
    }, (0, mithril_1.default)('i.material-icons', 'refresh'))));
    websocketComponents.push((0, mithril_1.default)(recording_multiple_choice_1.RecordingMultipleChoice, {
        controller: recordingPageController,
        targetFactories: websocketMenuController.getTargetFactories(),
    }));
    return (0, mithril_1.default)('.record-modal-section', (0, mithril_1.default)('.logo-wrapping', (0, mithril_1.default)('i.material-icons', 'settings_ethernet')), (0, mithril_1.default)('.record-modal-description', ...websocketComponents));
}
function assembleChromeSection(recordingPageController) {
    if (!target_factory_registry_1.targetFactoryRegistry.has(chrome_target_factory_1.CHROME_TARGET_FACTORY)) {
        return undefined;
    }
    const chromeComponents = [];
    chromeComponents.push((0, mithril_1.default)('h3', 'Chrome Browser instance or ChromeOS device'));
    const chromeFactory = target_factory_registry_1.targetFactoryRegistry.get(chrome_target_factory_1.CHROME_TARGET_FACTORY);
    if (!chromeFactory.isExtensionInstalled) {
        chromeComponents.push((0, mithril_1.default)('text', 'Install the extension ', (0, mithril_1.default)('a', { href: recording_utils_1.EXTENSION_URL, target: '_blank' }, 'from this link '), 'and refresh the page.'));
    }
    else {
        chromeComponents.push((0, mithril_1.default)(recording_multiple_choice_1.RecordingMultipleChoice, {
            controller: recordingPageController,
            targetFactories: [chromeFactory],
        }));
    }
    return (0, mithril_1.default)('.record-modal-section', (0, mithril_1.default)('.logo-wrapping', (0, mithril_1.default)('i.material-icons', 'web')), (0, mithril_1.default)('.record-modal-description', ...chromeComponents));
}
const websocketMenuController = new websocket_menu_controller_1.WebsocketMenuController();
//# sourceMappingURL=reset_target_modal.js.map