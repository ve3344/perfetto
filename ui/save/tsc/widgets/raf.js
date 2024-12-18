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
exports.setScheduleFullRedraw = setScheduleFullRedraw;
exports.scheduleFullRedraw = scheduleFullRedraw;
let FULL_REDRAW_FUNCTION = (_force) => { };
function setScheduleFullRedraw(func) {
    FULL_REDRAW_FUNCTION = func;
}
function scheduleFullRedraw(force) {
    FULL_REDRAW_FUNCTION(force);
}
//# sourceMappingURL=raf.js.map