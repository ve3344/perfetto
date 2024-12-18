"use strict";
// Copyright (C) 2020 The Android Open Source Project
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
exports.ratelimit = ratelimit;
exports.debounce = debounce;
// Returns a wrapper around |f| which calls f at most once every |ms|ms.
function ratelimit(f, ms) {
    let inProgess = false;
    return () => {
        if (inProgess) {
            return;
        }
        inProgess = true;
        setTimeout(() => {
            f();
            inProgess = false;
        }, ms);
    };
}
// Returns a wrapper around |f| which waits for a |ms|ms pause in calls
// before calling |f|.
function debounce(f, ms) {
    let timerId;
    return () => {
        if (timerId) {
            clearTimeout(timerId);
        }
        timerId = setTimeout(() => {
            f();
            timerId = undefined;
        }, ms);
    };
}
//# sourceMappingURL=rate_limiters.js.map