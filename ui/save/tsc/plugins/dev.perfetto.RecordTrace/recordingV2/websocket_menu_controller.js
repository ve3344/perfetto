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
exports.WebsocketMenuController = void 0;
const recording_ui_utils_1 = require("../recording_ui_utils");
const android_websocket_target_factory_1 = require("./target_factories/android_websocket_target_factory");
const host_os_target_factory_1 = require("./target_factories/host_os_target_factory");
const target_factory_registry_1 = require("./target_factory_registry");
// The WebsocketMenuController will handle paths for all factories which
// connect over websocket. At present, these are:
// - adb websocket factory
// - host OS websocket factory
class WebsocketMenuController {
    path = recording_ui_utils_1.DEFAULT_WEBSOCKET_URL;
    getPath() {
        return this.path;
    }
    setPath(path) {
        this.path = path;
    }
    onPathChange() {
        if (target_factory_registry_1.targetFactoryRegistry.has(android_websocket_target_factory_1.ANDROID_WEBSOCKET_TARGET_FACTORY)) {
            const androidTargetFactory = target_factory_registry_1.targetFactoryRegistry.get(android_websocket_target_factory_1.ANDROID_WEBSOCKET_TARGET_FACTORY);
            androidTargetFactory.tryEstablishWebsocket(this.path + recording_ui_utils_1.ADB_ENDPOINT);
        }
        if (target_factory_registry_1.targetFactoryRegistry.has(host_os_target_factory_1.HOST_OS_TARGET_FACTORY)) {
            const hostTargetFactory = target_factory_registry_1.targetFactoryRegistry.get(host_os_target_factory_1.HOST_OS_TARGET_FACTORY);
            hostTargetFactory.tryEstablishWebsocket(this.path + recording_ui_utils_1.TRACED_ENDPOINT);
        }
    }
    getTargetFactories() {
        const targetFactories = [];
        if (target_factory_registry_1.targetFactoryRegistry.has(android_websocket_target_factory_1.ANDROID_WEBSOCKET_TARGET_FACTORY)) {
            targetFactories.push(target_factory_registry_1.targetFactoryRegistry.get(android_websocket_target_factory_1.ANDROID_WEBSOCKET_TARGET_FACTORY));
        }
        if (target_factory_registry_1.targetFactoryRegistry.has(host_os_target_factory_1.HOST_OS_TARGET_FACTORY)) {
            targetFactories.push(target_factory_registry_1.targetFactoryRegistry.get(host_os_target_factory_1.HOST_OS_TARGET_FACTORY));
        }
        return targetFactories;
    }
}
exports.WebsocketMenuController = WebsocketMenuController;
//# sourceMappingURL=websocket_menu_controller.js.map