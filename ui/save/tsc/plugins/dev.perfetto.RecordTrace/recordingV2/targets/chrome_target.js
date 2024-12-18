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
exports.ChromeTarget = void 0;
const chrome_traced_tracing_session_1 = require("../chrome_traced_tracing_session");
class ChromeTarget {
    name;
    targetType;
    onTargetChange;
    chromeCategories;
    constructor(name, targetType) {
        this.name = name;
        this.targetType = targetType;
    }
    getInfo() {
        return {
            targetType: this.targetType,
            name: this.name,
            dataSources: [
                { name: 'chromeCategories', descriptor: this.chromeCategories },
            ],
        };
    }
    // Chrome targets are created after we check that the extension is installed,
    // so they support tracing sessions.
    canCreateTracingSession() {
        return true;
    }
    async createTracingSession(tracingSessionListener) {
        const tracingSession = new chrome_traced_tracing_session_1.ChromeTracedTracingSession(tracingSessionListener);
        tracingSession.initConnection();
        if (!this.chromeCategories) {
            // Fetch chrome categories from the extension.
            this.chromeCategories = await tracingSession.getCategories();
            if (this.onTargetChange) {
                this.onTargetChange();
            }
        }
        return tracingSession;
    }
    // Starts a tracing session in order to fetch chrome categories from the
    // device. Then, it cancels the session.
    async fetchTargetInfo(tracingSessionListener) {
        const tracingSession = await this.createTracingSession(tracingSessionListener);
        tracingSession.cancel();
    }
    disconnect(_disconnectMessage) {
        return Promise.resolve(undefined);
    }
    // We can connect to the Chrome target without taking the connection away
    // from another process.
    async canConnectWithoutContention() {
        return true;
    }
}
exports.ChromeTarget = ChromeTarget;
//# sourceMappingURL=chrome_target.js.map