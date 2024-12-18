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
exports.AndroidVirtualTarget = void 0;
const recording_error_handling_1 = require("../recording_error_handling");
class AndroidVirtualTarget {
    name;
    androidApiLevel;
    constructor(name, androidApiLevel) {
        this.name = name;
        this.androidApiLevel = androidApiLevel;
    }
    canConnectWithoutContention() {
        return Promise.resolve(true);
    }
    canCreateTracingSession() {
        return false;
    }
    createTracingSession(_) {
        throw new recording_error_handling_1.RecordingError('Can not create tracing session for a virtual target');
    }
    disconnect(_) {
        throw new recording_error_handling_1.RecordingError('Can not disconnect from a virtual target');
    }
    fetchTargetInfo(_) {
        return Promise.resolve();
    }
    getInfo() {
        return {
            name: this.name,
            androidApiLevel: this.androidApiLevel,
            targetType: 'ANDROID',
            dataSources: [],
        };
    }
}
exports.AndroidVirtualTarget = AndroidVirtualTarget;
//# sourceMappingURL=android_virtual_target.js.map