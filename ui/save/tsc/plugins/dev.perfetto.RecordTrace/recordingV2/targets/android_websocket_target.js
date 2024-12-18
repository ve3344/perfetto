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
exports.AndroidWebsocketTarget = void 0;
const adb_connection_over_websocket_1 = require("../adb_connection_over_websocket");
const android_target_1 = require("./android_target");
class AndroidWebsocketTarget extends android_target_1.AndroidTarget {
    serialNumber;
    constructor(serialNumber, websocketUrl, onTargetChange) {
        super(new adb_connection_over_websocket_1.AdbConnectionOverWebsocket(serialNumber, websocketUrl), onTargetChange);
        this.serialNumber = serialNumber;
    }
    getInfo() {
        return {
            targetType: 'ANDROID',
            // 'androidApiLevel' will be populated after ADB authorization.
            androidApiLevel: this.androidApiLevel,
            dataSources: this.dataSources || [],
            name: this.serialNumber + ' WebSocket',
        };
    }
}
exports.AndroidWebsocketTarget = AndroidWebsocketTarget;
//# sourceMappingURL=android_websocket_target.js.map