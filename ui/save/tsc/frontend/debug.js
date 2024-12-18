"use strict";
// Copyright (C) 2023 The Android Open Source Project
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
exports.registerDebugGlobals = registerDebugGlobals;
const tslib_1 = require("tslib");
const immer_1 = require("immer");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const raf_scheduler_1 = require("../core/raf_scheduler");
const globals_1 = require("./globals");
const app_impl_1 = require("../core/app_impl");
function registerDebugGlobals() {
    window.m = mithril_1.default;
    window.app = app_impl_1.AppImpl.instance;
    window.globals = globals_1.globals;
    window.produce = immer_1.produce;
    window.raf = raf_scheduler_1.raf;
}
//# sourceMappingURL=debug.js.map