"use strict";
// Copyright (C) 2024 The Android Open Source Project
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
exports.RecordingManager = void 0;
const empty_state_1 = require("./empty_state");
const state_1 = require("./state");
const adb_1 = require("./adb");
const chrome_proxy_record_controller_1 = require("./chrome_proxy_record_controller");
const record_config_types_1 = require("./record_config_types");
const record_controller_1 = require("./record_controller");
const raf_1 = require("../../widgets/raf");
const target_factory_registry_1 = require("./recordingV2/target_factory_registry");
const android_websocket_target_factory_1 = require("./recordingV2/target_factories/android_websocket_target_factory");
const android_webusb_target_factory_1 = require("./recordingV2/target_factories/android_webusb_target_factory");
const utils_1 = require("../../base/utils");
const EXTENSION_ID = 'lfmkphfpdbjijhpomgecfikhfohaoine';
// TODO(primiano): this class and RecordController should be merged. I'm keeping
// them separate for now to reduce scope of refactorings.
class RecordingManager {
    app;
    _state = (0, empty_state_1.createEmptyState)();
    recCtl;
    constructor(app, useRecordingV2) {
        this.app = app;
        const extensionLocalChannel = new MessageChannel();
        this.recCtl = new record_controller_1.RecordController(app, this, extensionLocalChannel.port1);
        this.setupExtentionPort(extensionLocalChannel);
        if (useRecordingV2) {
            target_factory_registry_1.targetFactoryRegistry.register(new android_websocket_target_factory_1.AndroidWebsocketTargetFactory());
            if ((0, utils_1.exists)(navigator.usb)) {
                target_factory_registry_1.targetFactoryRegistry.register(new android_webusb_target_factory_1.AndroidWebusbTargetFactory(navigator.usb));
            }
        }
        else {
            this.updateAvailableAdbDevices();
            try {
                navigator.usb.addEventListener('connect', () => this.updateAvailableAdbDevices());
                navigator.usb.addEventListener('disconnect', () => this.updateAvailableAdbDevices());
            }
            catch (e) {
                console.error('WebUSB API not supported');
            }
        }
    }
    clearRecordConfig() {
        this._state.recordConfig = (0, record_config_types_1.createEmptyRecordConfig)();
        this._state.lastLoadedConfig = { type: 'NONE' };
        this.recCtl.refreshOnStateChange();
    }
    setRecordConfig(config, configType) {
        this._state.recordConfig = config;
        this._state.lastLoadedConfig = configType || { type: 'NONE' };
        this.recCtl.refreshOnStateChange();
    }
    startRecording() {
        this._state.recordingInProgress = true;
        this._state.lastRecordingError = undefined;
        this._state.recordingCancelled = false;
        this.recCtl.refreshOnStateChange();
    }
    stopRecording() {
        this._state.recordingInProgress = false;
        this.recCtl.refreshOnStateChange();
    }
    cancelRecording() {
        this._state.recordingInProgress = false;
        this._state.recordingCancelled = true;
        this.recCtl.refreshOnStateChange();
    }
    setRecordingTarget(target) {
        this._state.recordingTarget = target;
        this.recCtl.refreshOnStateChange();
    }
    setFetchChromeCategories(fetch) {
        this._state.fetchChromeCategories = fetch;
        this.recCtl.refreshOnStateChange();
    }
    setAvailableAdbDevices(devices) {
        this._state.availableAdbDevices = devices;
        this.recCtl.refreshOnStateChange();
    }
    setLastRecordingError(error) {
        this._state.lastRecordingError = error;
        this._state.recordingStatus = undefined;
        this.recCtl.refreshOnStateChange();
    }
    setRecordingStatus(status) {
        this._state.recordingStatus = status;
        this._state.lastRecordingError = undefined;
        this.recCtl.refreshOnStateChange();
    }
    get state() {
        return this._state;
    }
    setupExtentionPort(extensionLocalChannel) {
        // We proxy messages between the extension and the controller because the
        // controller's worker can't access chrome.runtime.
        const extensionPort = 
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        window.chrome && chrome.runtime
            ? chrome.runtime.connect(EXTENSION_ID)
            : undefined;
        this._state.extensionInstalled = extensionPort !== undefined;
        if (extensionPort) {
            // Send messages to keep-alive the extension port.
            const interval = setInterval(() => {
                extensionPort.postMessage({
                    method: 'ExtensionVersion',
                });
            }, 25000);
            extensionPort.onDisconnect.addListener((_) => {
                this._state.extensionInstalled = false;
                clearInterval(interval);
                void chrome.runtime.lastError; // Needed to not receive an error log.
            });
            // This forwards the messages from the extension to the controller.
            extensionPort.onMessage.addListener((message, _port) => {
                if ((0, chrome_proxy_record_controller_1.isGetCategoriesResponse)(message)) {
                    this._state.chromeCategories = message.categories;
                    (0, raf_1.scheduleFullRedraw)();
                    return;
                }
                extensionLocalChannel.port2.postMessage(message);
            });
        }
        // This forwards the messages from the controller to the extension
        extensionLocalChannel.port2.onmessage = ({ data }) => {
            if (extensionPort)
                extensionPort.postMessage(data);
        };
    }
    async updateAvailableAdbDevices(preferredDeviceSerial) {
        const devices = await new adb_1.AdbOverWebUsb().getPairedDevices();
        let recordingTarget = undefined;
        const availableAdbDevices = [];
        devices.forEach((d) => {
            if (d.productName && d.serialNumber) {
                availableAdbDevices.push({
                    name: d.productName,
                    serial: d.serialNumber,
                    os: 'S',
                });
                if (preferredDeviceSerial && preferredDeviceSerial === d.serialNumber) {
                    recordingTarget = availableAdbDevices[availableAdbDevices.length - 1];
                }
            }
        });
        this.setAvailableAdbDevices(availableAdbDevices);
        this.selectAndroidDeviceIfAvailable(availableAdbDevices, recordingTarget);
        (0, raf_1.scheduleFullRedraw)();
        return availableAdbDevices;
    }
    selectAndroidDeviceIfAvailable(availableAdbDevices, recordingTarget) {
        if (!recordingTarget) {
            recordingTarget = this.state.recordingTarget;
        }
        const deviceConnected = (0, state_1.isAdbTarget)(recordingTarget);
        const connectedDeviceDisconnected = deviceConnected &&
            availableAdbDevices.find((e) => e.serial === recordingTarget.serial) === undefined;
        if (availableAdbDevices.length) {
            // If there's an Android device available and the current selection isn't
            // one, select the Android device by default. If the current device isn't
            // available anymore, but another Android device is, select the other
            // Android device instead.
            if (!deviceConnected || connectedDeviceDisconnected) {
                recordingTarget = availableAdbDevices[0];
            }
            this.setRecordingTarget(recordingTarget);
            return;
        }
        // If the currently selected device was disconnected, reset the recording
        // target to the default one.
        if (connectedDeviceDisconnected) {
            this.setRecordingTarget((0, state_1.getDefaultRecordingTargets)()[0]);
        }
    }
}
exports.RecordingManager = RecordingManager;
//# sourceMappingURL=recording_manager.js.map