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
exports.VirtualTargetFactory = void 0;
const recording_error_handling_1 = require("../recording_error_handling");
const target_factory_registry_1 = require("../target_factory_registry");
const android_virtual_target_1 = require("../targets/android_virtual_target");
const VIRTUAL_TARGET_FACTORY = 'VirtualTargetFactory';
class VirtualTargetFactory {
    kind = VIRTUAL_TARGET_FACTORY;
    targets;
    constructor() {
        this.targets = [];
        this.targets.push(new android_virtual_target_1.AndroidVirtualTarget('Android Q', 29));
        this.targets.push(new android_virtual_target_1.AndroidVirtualTarget('Android P', 28));
        this.targets.push(new android_virtual_target_1.AndroidVirtualTarget('Android O-', 27));
    }
    connectNewTarget() {
        throw new recording_error_handling_1.RecordingError('Can not create a new virtual target.' +
            'All virtual targets are created at factory initialisation.');
    }
    getName() {
        return 'Virtual';
    }
    listRecordingProblems() {
        return [];
    }
    listTargets() {
        return this.targets;
    }
    // Virtual targets won't change.
    setOnTargetChange(_) { }
}
exports.VirtualTargetFactory = VirtualTargetFactory;
target_factory_registry_1.targetFactoryRegistry.register(new VirtualTargetFactory());
//# sourceMappingURL=virtual_target_factory.js.map