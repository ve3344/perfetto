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
const record_page_1 = require("./record_page");
const record_page_v2_1 = require("./record_page_v2");
const recording_page_controller_1 = require("./recordingV2/recording_page_controller");
const recording_manager_1 = require("./recording_manager");
const mithril_utils_1 = require("../../base/mithril_utils");
class default_1 {
    static id = 'dev.perfetto.RecordTrace';
    static onActivate(app) {
        app.sidebar.addMenuItem({
            section: 'navigation',
            text: 'Record new trace',
            href: '#!/record',
            icon: 'fiber_smart_record',
            sortOrder: 2,
        });
        const RECORDING_V2_FLAG = app.featureFlags.register({
            id: 'recordingv2',
            name: 'Recording V2',
            description: 'Record using V2 interface',
            defaultValue: false,
        });
        const useRecordingV2 = RECORDING_V2_FLAG.get();
        const recMgr = new recording_manager_1.RecordingManager(app, useRecordingV2);
        let page;
        if (useRecordingV2) {
            const recCtl = new recording_page_controller_1.RecordingPageController(app, recMgr);
            recCtl.initFactories();
            page = (0, mithril_utils_1.bindMithrilAttrs)(record_page_v2_1.RecordPageV2, { app, recCtl, recMgr });
        }
        else {
            page = (0, mithril_utils_1.bindMithrilAttrs)(record_page_1.RecordPage, { app, recMgr });
        }
        app.pages.registerPage({ route: '/record', traceless: true, page });
    }
}
exports.default = default_1;
//# sourceMappingURL=index.js.map