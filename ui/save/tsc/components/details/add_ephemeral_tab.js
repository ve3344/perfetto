"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addEphemeralTab = addEphemeralTab;
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
const uuid_1 = require("../../base/uuid");
const app_impl_1 = require("../../core/app_impl");
// TODO(primiano): this method should take a Trace parameter (or probably
// shouldn't exist at all in favour of some helper in the Trace object).
function addEphemeralTab(uriPrefix, tab) {
    const uri = `${uriPrefix}#${(0, uuid_1.uuidv4)()}`;
    const tabManager = app_impl_1.AppImpl.instance.trace?.tabs;
    if (tabManager === undefined)
        return;
    tabManager.registerTab({
        uri,
        content: tab,
        isEphemeral: true,
    });
    tabManager.showTab(uri);
}
//# sourceMappingURL=add_ephemeral_tab.js.map