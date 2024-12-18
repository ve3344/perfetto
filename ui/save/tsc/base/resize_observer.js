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
exports.SimpleResizeObserver = void 0;
class SimpleResizeObserver {
    observer;
    constructor(dom, callback) {
        const observer = new ResizeObserver(() => {
            callback();
        });
        observer.observe(dom);
        this.observer = observer;
    }
    [Symbol.dispose]() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = undefined;
        }
    }
}
exports.SimpleResizeObserver = SimpleResizeObserver;
//# sourceMappingURL=resize_observer.js.map