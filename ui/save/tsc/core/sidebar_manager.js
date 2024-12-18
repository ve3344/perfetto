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
exports.SidebarManagerImpl = void 0;
const registry_1 = require("../base/registry");
const raf_scheduler_1 = require("./raf_scheduler");
class SidebarManagerImpl {
    enabled;
    _visible;
    lastId = 0;
    menuItems = new registry_1.Registry((m) => m.id);
    constructor(args) {
        this.enabled = !args.disabled;
        this._visible = !args.hidden;
    }
    addMenuItem(item) {
        // Assign a unique id to every item. This simplifies the job of the mithril
        // component that renders the sidebar.
        const id = `sidebar_${++this.lastId}`;
        const itemInt = { ...item, id };
        return this.menuItems.register(itemInt);
    }
    get visible() {
        return this._visible;
    }
    toggleVisibility() {
        if (!this.enabled)
            return;
        this._visible = !this._visible;
        raf_scheduler_1.raf.scheduleFullRedraw();
    }
}
exports.SidebarManagerImpl = SidebarManagerImpl;
//# sourceMappingURL=sidebar_manager.js.map