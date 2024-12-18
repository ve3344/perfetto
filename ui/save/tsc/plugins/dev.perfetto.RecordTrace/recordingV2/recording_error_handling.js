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
exports.RecordingError = void 0;
exports.wrapRecordingError = wrapRecordingError;
exports.showRecordingModal = showRecordingModal;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const errors_1 = require("../../../base/errors");
const modal_1 = require("../../../widgets/modal");
const recording_utils_1 = require("./recording_utils");
// The pattern for handling recording error can have the following nesting in
// case of errors:
// A. wrapRecordingError -> wraps a promise
// B. onFailure -> has user defined logic and calls showRecordingModal
// C. showRecordingModal -> shows UX for a given error; this is not called
//    directly by wrapRecordingError, because we want the caller (such as the
//    UI) to dictate the UX
// This method takes a promise and a callback to be execute in case the promise
// fails. It then awaits the promise and executes the callback in case of
// failure. In the recording code it is used to wrap:
// 1. Acessing the WebUSB API.
// 2. Methods returning promises which can be rejected. For instance:
// a) When the user clicks 'Add a new device' but then doesn't select a valid
//    device.
// b) When the user starts a tracing session, but cancels it before they
//    authorize the session on the device.
async function wrapRecordingError(promise, onFailure) {
    try {
        return await promise;
    }
    catch (e) {
        // Sometimes the message is wrapped in an Error object, sometimes not, so
        // we make sure we transform it into a string.
        const errorMessage = (0, errors_1.getErrorMessage)(e);
        onFailure(errorMessage);
        return undefined;
    }
}
// Shows a modal for every known type of error which can arise during recording.
// In this way, errors occuring at different levels of the recording process
// can be handled in a central location.
function showRecordingModal(message) {
    if ([
        'Unable to claim interface.',
        'The specified endpoint is not part of a claimed and selected ' +
            'alternate interface.',
        // thrown when calling the 'reset' method on a WebUSB device.
        'Unable to reset the device.',
    ].some((partOfMessage) => message.includes(partOfMessage))) {
        showWebUSBErrorV2();
    }
    else if ([
        'A transfer error has occurred.',
        'The device was disconnected.',
        'The transfer was cancelled.',
    ].some((partOfMessage) => message.includes(partOfMessage)) ||
        isDeviceDisconnectedError(message)) {
        showConnectionLostError();
    }
    else if (message === recording_utils_1.ALLOW_USB_DEBUGGING) {
        showAllowUSBDebugging();
    }
    else if (isMessageComposedOf(message, [
        recording_utils_1.BINARY_PUSH_FAILURE,
        recording_utils_1.BINARY_PUSH_UNKNOWN_RESPONSE,
    ])) {
        showFailedToPushBinary(message.substring(message.indexOf(':') + 1));
    }
    else if (message === recording_utils_1.NO_DEVICE_SELECTED) {
        showNoDeviceSelected();
    }
    else if (recording_utils_1.WEBSOCKET_UNABLE_TO_CONNECT === message) {
        showWebsocketConnectionIssue(message);
    }
    else if (message === recording_utils_1.EXTENSION_NOT_INSTALLED) {
        showExtensionNotInstalled();
    }
    else if (isMessageComposedOf(message, [
        recording_utils_1.PARSING_UNKNWON_REQUEST_ID,
        recording_utils_1.PARSING_UNABLE_TO_DECODE_METHOD,
        recording_utils_1.PARSING_UNRECOGNIZED_PORT,
        recording_utils_1.PARSING_UNRECOGNIZED_MESSAGE,
    ])) {
        showIssueParsingTheTracedResponse(message);
    }
    else {
        throw new Error(`${message}`);
    }
}
function isDeviceDisconnectedError(message) {
    return (message.includes('Device with serial') &&
        message.includes('was disconnected.'));
}
function isMessageComposedOf(message, issues) {
    for (const issue of issues) {
        if (message.includes(issue)) {
            return true;
        }
    }
    return false;
}
// Exception thrown by the Recording logic.
class RecordingError extends Error {
}
exports.RecordingError = RecordingError;
function showWebUSBErrorV2() {
    (0, modal_1.showModal)({
        title: 'A WebUSB error occurred',
        content: (0, mithril_1.default)('div', (0, mithril_1.default)('span', `Is adb already running on the host? Run this command and
      try again.`), (0, mithril_1.default)('br'), (0, mithril_1.default)('.modal-bash', '> adb kill-server'), (0, mithril_1.default)('br'), 
        // The statement below covers the following edge case:
        // 1. 'adb server' is running on the device.
        // 2. The user selects the new Android target, so we try to fetch the
        // OS version and do QSS.
        // 3. The error modal is shown.
        // 4. The user runs 'adb kill-server'.
        // At this point we don't have a trigger to try fetching the OS version
        // + QSS again. Therefore, the user will need to refresh the page.
        (0, mithril_1.default)('span', "If after running 'adb kill-server', you don't see " +
            "a 'Start Recording' button on the page and you don't see " +
            "'Allow USB debugging' on the device, " +
            'you will need to reload this page.'), (0, mithril_1.default)('br'), (0, mithril_1.default)('br'), (0, mithril_1.default)('span', 'For details see '), (0, mithril_1.default)('a', { href: 'http://b/159048331', target: '_blank' }, 'b/159048331')),
    });
}
function showConnectionLostError() {
    (0, modal_1.showModal)({
        title: 'Connection with the ADB device lost',
        content: (0, mithril_1.default)('div', (0, mithril_1.default)('span', `Please connect the device again to restart the recording.`), (0, mithril_1.default)('br')),
    });
}
function showAllowUSBDebugging() {
    (0, modal_1.showModal)({
        title: 'Could not connect to the device',
        content: (0, mithril_1.default)('div', (0, mithril_1.default)('span', 'Please allow USB debugging on the device.'), (0, mithril_1.default)('br')),
    });
}
function showNoDeviceSelected() {
    (0, modal_1.showModal)({
        title: 'No device was selected for recording',
        content: (0, mithril_1.default)('div', (0, mithril_1.default)('span', `If you want to connect to an ADB device,
           please select it from the list.`), (0, mithril_1.default)('br')),
    });
}
function showExtensionNotInstalled() {
    (0, modal_1.showModal)({
        title: 'Perfetto Chrome extension not installed',
        content: (0, mithril_1.default)('div', (0, mithril_1.default)('.note', `To trace Chrome from the Perfetto UI, you need to install our `, (0, mithril_1.default)('a', { href: recording_utils_1.EXTENSION_URL, target: '_blank' }, 'Chrome extension'), ' and then reload this page.'), (0, mithril_1.default)('br')),
    });
}
function showIssueParsingTheTracedResponse(message) {
    (0, modal_1.showModal)({
        title: 'A problem was encountered while connecting to' +
            ' the Perfetto tracing service',
        content: (0, mithril_1.default)('div', (0, mithril_1.default)('span', message), (0, mithril_1.default)('br')),
    });
}
function showFailedToPushBinary(message) {
    (0, modal_1.showModal)({
        title: 'Failed to push a binary to the device',
        content: (0, mithril_1.default)('div', (0, mithril_1.default)('span', 'This can happen if your Android device has an OS version lower ' +
            'than Q. Perfetto tried to push the latest version of its ' +
            'embedded binary but failed.'), (0, mithril_1.default)('br'), (0, mithril_1.default)('br'), (0, mithril_1.default)('span', 'Error message:'), (0, mithril_1.default)('br'), (0, mithril_1.default)('span', message)),
    });
}
function showWebsocketConnectionIssue(message) {
    (0, modal_1.showModal)({
        title: 'Unable to connect to the device via websocket',
        content: (0, mithril_1.default)('div', (0, mithril_1.default)('div', 'trace_processor_shell --httpd is unreachable or crashed.'), (0, mithril_1.default)('pre', message)),
    });
}
//# sourceMappingURL=recording_error_handling.js.map