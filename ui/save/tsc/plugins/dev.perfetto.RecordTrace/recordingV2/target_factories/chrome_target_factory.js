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
exports.ChromeTargetFactory = exports.CHROME_TARGET_FACTORY = void 0;
const recording_error_handling_1 = require("../recording_error_handling");
const recording_utils_1 = require("../recording_utils");
const target_factory_registry_1 = require("../target_factory_registry");
const chrome_target_1 = require("../targets/chrome_target");
exports.CHROME_TARGET_FACTORY = 'ChromeTargetFactory';
class ChromeTargetFactory {
    kind = exports.CHROME_TARGET_FACTORY;
    // We only check the connection once at the beginning to:
    // a) Avoid creating a 'Port' object every time 'getInfo' is called.
    // b) When a new Port is created, the extension starts communicating with it
    // and leaves aside the old Port objects, so creating a new Port would break
    // any ongoing tracing session.
    isExtensionInstalled = false;
    targets = [];
    constructor() {
        this.init();
    }
    init() {
        const testPort = chrome.runtime.connect(recording_utils_1.EXTENSION_ID);
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        this.isExtensionInstalled = !!testPort;
        testPort.disconnect();
        if (!this.isExtensionInstalled) {
            return;
        }
        this.targets.push(new chrome_target_1.ChromeTarget('Chrome', 'CHROME'));
        if ((0, recording_utils_1.isCrOS)(navigator.userAgent)) {
            this.targets.push(new chrome_target_1.ChromeTarget('ChromeOS', 'CHROME_OS'));
        }
        // Pass through the chrome target since it launches ETW on windows through
        // same path as when we start chrome tracing.
        if ((0, recording_utils_1.isWindows)(navigator.userAgent)) {
            this.targets.push(new chrome_target_1.ChromeTarget('Windows Desktop', 'WINDOWS'));
        }
    }
    connectNewTarget() {
        throw new recording_error_handling_1.RecordingError('Can not create a new Chrome target.' +
            'All Chrome targets are created at factory initialisation.');
    }
    getName() {
        return 'Chrome';
    }
    listRecordingProblems() {
        const recordingProblems = [];
        if (!this.isExtensionInstalled) {
            recordingProblems.push(recording_utils_1.EXTENSION_NOT_INSTALLED);
        }
        return recordingProblems;
    }
    listTargets() {
        return this.targets;
    }
    setOnTargetChange(onTargetChange) {
        for (const target of this.targets) {
            target.onTargetChange = onTargetChange;
        }
    }
}
exports.ChromeTargetFactory = ChromeTargetFactory;
// We only instantiate the factory if Perfetto UI is open in the Chrome browser.
// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
if (globalThis.chrome && chrome.runtime) {
    target_factory_registry_1.targetFactoryRegistry.register(new ChromeTargetFactory());
}
//# sourceMappingURL=chrome_target_factory.js.map