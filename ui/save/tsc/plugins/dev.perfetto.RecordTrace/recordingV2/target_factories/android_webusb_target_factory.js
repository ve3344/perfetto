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
exports.AndroidWebusbTargetFactory = exports.ANDROID_WEBUSB_TARGET_FACTORY = void 0;
const errors_1 = require("../../../../base/errors");
const logging_1 = require("../../../../base/logging");
const adb_key_manager_1 = require("../auth/adb_key_manager");
const recording_error_handling_1 = require("../recording_error_handling");
const recording_utils_1 = require("../recording_utils");
const android_webusb_target_1 = require("../targets/android_webusb_target");
exports.ANDROID_WEBUSB_TARGET_FACTORY = 'AndroidWebusbTargetFactory';
const SERIAL_NUMBER_ISSUE = 'an invalid serial number';
const ADB_INTERFACE_ISSUE = 'an incompatible adb interface';
function createDeviceErrorMessage(device, issue) {
    const productName = device.productName;
    return `USB device${productName ? ' ' + productName : ''} has ${issue}`;
}
class AndroidWebusbTargetFactory {
    usb;
    kind = exports.ANDROID_WEBUSB_TARGET_FACTORY;
    onTargetChange = () => { };
    recordingProblems = [];
    targets = new Map();
    // AdbKeyManager should only be instantiated once, so we can use the same key
    // for all devices.
    keyManager = new adb_key_manager_1.AdbKeyManager();
    constructor(usb) {
        this.usb = usb;
        this.init();
    }
    getName() {
        return 'Android WebUsb';
    }
    listTargets() {
        return Array.from(this.targets.values());
    }
    listRecordingProblems() {
        return this.recordingProblems;
    }
    async connectNewTarget() {
        let device;
        try {
            device = await this.usb.requestDevice({ filters: [recording_utils_1.ADB_DEVICE_FILTER] });
        }
        catch (e) {
            throw new recording_error_handling_1.RecordingError((0, errors_1.getErrorMessage)(e));
        }
        const deviceValid = this.checkDeviceValidity(device);
        if (!deviceValid.isValid) {
            throw new recording_error_handling_1.RecordingError(deviceValid.issues.join('\n'));
        }
        const androidTarget = new android_webusb_target_1.AndroidWebusbTarget(device, this.keyManager, this.onTargetChange);
        this.targets.set((0, logging_1.assertExists)(device.serialNumber), androidTarget);
        return androidTarget;
    }
    setOnTargetChange(onTargetChange) {
        this.onTargetChange = onTargetChange;
    }
    async init() {
        let devices = [];
        try {
            devices = await this.usb.getDevices();
        }
        catch (_) {
            return; // WebUSB not available or disallowed in iframe.
        }
        for (const device of devices) {
            if (this.checkDeviceValidity(device).isValid) {
                this.targets.set((0, logging_1.assertExists)(device.serialNumber), new android_webusb_target_1.AndroidWebusbTarget(device, this.keyManager, this.onTargetChange));
            }
        }
        this.usb.addEventListener('connect', (ev) => {
            if (this.checkDeviceValidity(ev.device).isValid) {
                this.targets.set((0, logging_1.assertExists)(ev.device.serialNumber), new android_webusb_target_1.AndroidWebusbTarget(ev.device, this.keyManager, this.onTargetChange));
                this.onTargetChange();
            }
        });
        this.usb.addEventListener('disconnect', async (ev) => {
            // We don't check device validity when disconnecting because if the device
            // is invalid we would not have connected in the first place.
            const serialNumber = (0, logging_1.assertExists)(ev.device.serialNumber);
            await (0, logging_1.assertExists)(this.targets.get(serialNumber)).disconnect(`Device with serial ${serialNumber} was disconnected.`);
            this.targets.delete(serialNumber);
            this.onTargetChange();
        });
    }
    checkDeviceValidity(device) {
        const deviceValidity = { isValid: true, issues: [] };
        if (!device.serialNumber) {
            deviceValidity.issues.push(createDeviceErrorMessage(device, SERIAL_NUMBER_ISSUE));
            deviceValidity.isValid = false;
        }
        if (!(0, recording_utils_1.findInterfaceAndEndpoint)(device)) {
            deviceValidity.issues.push(createDeviceErrorMessage(device, ADB_INTERFACE_ISSUE));
            deviceValidity.isValid = false;
        }
        this.recordingProblems.push(...deviceValidity.issues);
        return deviceValidity;
    }
}
exports.AndroidWebusbTargetFactory = AndroidWebusbTargetFactory;
//# sourceMappingURL=android_webusb_target_factory.js.map