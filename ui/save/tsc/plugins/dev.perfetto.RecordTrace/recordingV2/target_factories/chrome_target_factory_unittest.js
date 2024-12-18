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
const recording_utils_1 = require("../recording_utils");
test('parse Chrome on Chrome OS user agent', () => {
    const userAgent = 'Mozilla/5.0 (X11; CrOS x86_64 14816.99.0) ' +
        'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.114 ' +
        'Safari/537.36';
    expect((0, recording_utils_1.isCrOS)(userAgent)).toBe(true);
    expect((0, recording_utils_1.isMacOs)(userAgent)).toBe(false);
    expect((0, recording_utils_1.isLinux)(userAgent)).toBe(false);
});
test('parse Chrome on Mac user agent', () => {
    const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ' +
        'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36';
    expect((0, recording_utils_1.isCrOS)(userAgent)).toBe(false);
    expect((0, recording_utils_1.isMacOs)(userAgent)).toBe(true);
    expect((0, recording_utils_1.isLinux)(userAgent)).toBe(false);
});
test('parse Chrome on Linux user agent', () => {
    const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36';
    expect((0, recording_utils_1.isCrOS)(userAgent)).toBe(false);
    expect((0, recording_utils_1.isMacOs)(userAgent)).toBe(false);
    expect((0, recording_utils_1.isLinux)(userAgent)).toBe(true);
});
//# sourceMappingURL=chrome_target_factory_unittest.js.map