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
exports.PARSING_UNRECOGNIZED_MESSAGE = exports.PARSING_UNRECOGNIZED_PORT = exports.PARSING_UNABLE_TO_DECODE_METHOD = exports.PARSING_UNKNWON_REQUEST_ID = exports.RECORDING_IN_PROGRESS = exports.BUFFER_USAGE_INCORRECT_FORMAT = exports.BUFFER_USAGE_NOT_ACCESSIBLE = exports.MALFORMED_EXTENSION_MESSAGE = exports.EXTENSION_NOT_INSTALLED = exports.EXTENSION_NAME = exports.EXTENSION_URL = exports.EXTENSION_ID = exports.ADB_DEVICE_FILTER = exports.NO_DEVICE_SELECTED = exports.CUSTOM_TRACED_CONSUMER_SOCKET_PATH = exports.DEFAULT_TRACED_CONSUMER_SOCKET_PATH = exports.ALLOW_USB_DEBUGGING = exports.TRACEBOX_FETCH_TIMEOUT = exports.TRACEBOX_DEVICE_PATH = exports.BINARY_PUSH_UNKNOWN_RESPONSE = exports.BINARY_PUSH_FAILURE = exports.WEBSOCKET_CLOSED_ABNORMALLY_CODE = exports.WEBSOCKET_UNABLE_TO_CONNECT = exports.RECORDING_MODAL_DIALOG_KEY = void 0;
exports.buildAbdWebsocketCommand = buildAbdWebsocketCommand;
exports.isMacOs = isMacOs;
exports.isLinux = isLinux;
exports.isWindows = isWindows;
exports.isCrOS = isCrOS;
exports.findInterfaceAndEndpoint = findInterfaceAndEndpoint;
exports.RECORDING_MODAL_DIALOG_KEY = 'recording_target';
// Begin Websocket ////////////////////////////////////////////////////////
exports.WEBSOCKET_UNABLE_TO_CONNECT = 'Unable to connect to device via websocket.';
// https://www.rfc-editor.org/rfc/rfc6455#section-7.4.1
exports.WEBSOCKET_CLOSED_ABNORMALLY_CODE = 1006;
// The messages read by the adb server have their length prepended in hex.
// This method adds the length at the beginning of the message.
// Example: 'host:track-devices' -> '0012host:track-devices'
// go/codesearch/aosp-android11/system/core/adb/SERVICES.TXT
function buildAbdWebsocketCommand(cmd) {
    const hdr = cmd.length.toString(16).padStart(4, '0');
    return hdr + cmd;
}
// Sample user agent for Chrome on Mac OS:
// 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36
// (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36'
function isMacOs(userAgent) {
    return userAgent.toLowerCase().includes(' mac os ');
}
// Sample user agent for Chrome on Linux:
// Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko)
// Chrome/105.0.0.0 Safari/537.36
function isLinux(userAgent) {
    return userAgent.toLowerCase().includes(' linux ');
}
// Sample user agent for Chrome on Windows:
// Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML,
// like Gecko) Chrome/125.0.0.0 Safari/537.36
function isWindows(userAgent) {
    return userAgent.toLowerCase().includes('windows ');
}
// Sample user agent for Chrome on Chrome OS:
// "Mozilla/5.0 (X11; CrOS x86_64 14816.99.0) AppleWebKit/537.36
// (KHTML, like Gecko) Chrome/103.0.5060.114 Safari/537.36"
// This condition is wider, in the unlikely possibility of different casing,
function isCrOS(userAgent) {
    return userAgent.toLowerCase().includes(' cros ');
}
// End Websocket //////////////////////////////////////////////////////////
// Begin Adb //////////////////////////////////////////////////////////////
exports.BINARY_PUSH_FAILURE = 'BinaryPushFailure';
exports.BINARY_PUSH_UNKNOWN_RESPONSE = 'BinaryPushUnknownResponse';
// In case the device doesn't have the tracebox, we upload the latest version
// to this path.
exports.TRACEBOX_DEVICE_PATH = '/data/local/tmp/tracebox';
// Experimentally, this takes 900ms on the first fetch and 20-30ms after
// because of caching.
exports.TRACEBOX_FETCH_TIMEOUT = 30000;
// Message shown to the user when they need to allow authentication on the
// device in order to connect.
exports.ALLOW_USB_DEBUGGING = 'Please allow USB debugging on device and try again.';
// If the Android device has the tracing service on it (from API version 29),
// then we can connect to this consumer socket.
exports.DEFAULT_TRACED_CONSUMER_SOCKET_PATH = 'localfilesystem:/dev/socket/traced_consumer';
// If the Android device does not have the tracing service on it (before API
// version 29), we will have to push the tracebox on the device. Then, we
// can connect to this consumer socket (using it does not require system admin
// privileges).
exports.CUSTOM_TRACED_CONSUMER_SOCKET_PATH = 'localabstract:traced_consumer';
// End Adb /////////////////////////////////////////////////////////////////
// Begin Webusb ///////////////////////////////////////////////////////////
exports.NO_DEVICE_SELECTED = 'No device selected.';
exports.ADB_DEVICE_FILTER = {
    classCode: 255, // USB vendor specific code
    subclassCode: 66, // Android vendor specific subclass
    protocolCode: 1, // Adb protocol
};
function findInterfaceAndEndpoint(device) {
    const adbDeviceFilter = exports.ADB_DEVICE_FILTER;
    for (const config of device.configurations) {
        for (const interface_ of config.interfaces) {
            for (const alt of interface_.alternates) {
                if (alt.interfaceClass === adbDeviceFilter.classCode &&
                    alt.interfaceSubclass === adbDeviceFilter.subclassCode &&
                    alt.interfaceProtocol === adbDeviceFilter.protocolCode) {
                    return {
                        configurationValue: config.configurationValue,
                        usbInterfaceNumber: interface_.interfaceNumber,
                        endpoints: alt.endpoints,
                    };
                } // if (alternate)
            } // for (interface.alternates)
        } // for (configuration.interfaces)
    } // for (configurations)
    return undefined;
}
// End Webusb //////////////////////////////////////////////////////////////
// Begin Chrome ///////////////////////////////////////////////////////////
exports.EXTENSION_ID = 'lfmkphfpdbjijhpomgecfikhfohaoine';
exports.EXTENSION_URL = `https://chrome.google.com/webstore/detail/perfetto-ui/${exports.EXTENSION_ID}`;
exports.EXTENSION_NAME = 'Chrome extension';
exports.EXTENSION_NOT_INSTALLED = `To trace Chrome from the Perfetto UI, you need to install our
    ${exports.EXTENSION_URL} and then reload this page.`;
exports.MALFORMED_EXTENSION_MESSAGE = 'Malformed extension message.';
exports.BUFFER_USAGE_NOT_ACCESSIBLE = 'Buffer usage not accessible';
exports.BUFFER_USAGE_INCORRECT_FORMAT = 'The buffer usage data has am incorrect format';
// End Chrome /////////////////////////////////////////////////////////////
// Begin Traced //////////////////////////////////////////////////////////
exports.RECORDING_IN_PROGRESS = 'Recording in progress';
exports.PARSING_UNKNWON_REQUEST_ID = 'Unknown request id';
exports.PARSING_UNABLE_TO_DECODE_METHOD = 'Unable to decode method';
exports.PARSING_UNRECOGNIZED_PORT = 'Unrecognized consumer port response';
exports.PARSING_UNRECOGNIZED_MESSAGE = 'Unrecognized frame message';
// End Traced ///////////////////////////////////////////////////////////
//# sourceMappingURL=recording_utils.js.map