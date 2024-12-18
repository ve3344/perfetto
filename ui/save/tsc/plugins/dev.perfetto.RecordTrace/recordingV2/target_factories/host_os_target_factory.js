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
exports.HostOsTargetFactory = exports.HOST_OS_TARGET_FACTORY = void 0;
const recording_error_handling_1 = require("../recording_error_handling");
const recording_utils_1 = require("../recording_utils");
const target_factory_registry_1 = require("../target_factory_registry");
const host_os_target_1 = require("../targets/host_os_target");
exports.HOST_OS_TARGET_FACTORY = 'HostOsTargetFactory';
class HostOsTargetFactory {
    kind = exports.HOST_OS_TARGET_FACTORY;
    target;
    onTargetChange = () => { };
    connectNewTarget() {
        throw new recording_error_handling_1.RecordingError('Can not create a new Host OS target.' +
            'The Host OS target is created at factory initialisation.');
    }
    getName() {
        return 'HostOs';
    }
    listRecordingProblems() {
        return [];
    }
    listTargets() {
        if (this.target) {
            return [this.target];
        }
        return [];
    }
    tryEstablishWebsocket(websocketUrl) {
        if (this.target) {
            if (this.target.getUrl() === websocketUrl) {
                return;
            }
            else {
                this.target.disconnect();
            }
        }
        this.target = new host_os_target_1.HostOsTarget(websocketUrl, this.maybeClearTarget.bind(this), this.onTargetChange);
        this.onTargetChange();
    }
    maybeClearTarget(target) {
        if (this.target === target) {
            this.target = undefined;
            this.onTargetChange();
        }
    }
    setOnTargetChange(onTargetChange) {
        this.onTargetChange = onTargetChange;
    }
}
exports.HostOsTargetFactory = HostOsTargetFactory;
// We instantiate the host target factory only on Mac, Linux, and Windows.
if ((0, recording_utils_1.isMacOs)(navigator.userAgent) || (0, recording_utils_1.isLinux)(navigator.userAgent)) {
    target_factory_registry_1.targetFactoryRegistry.register(new HostOsTargetFactory());
}
//# sourceMappingURL=host_os_target_factory.js.map