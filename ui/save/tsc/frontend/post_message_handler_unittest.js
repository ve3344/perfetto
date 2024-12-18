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
const post_message_handler_1 = require("./post_message_handler");
describe('postMessageHandler', () => {
    test('baked-in trusted origins are trusted', () => {
        expect((0, post_message_handler_1.isTrustedOrigin)('https://chrometto.googleplex.com')).toBeTruthy();
        expect((0, post_message_handler_1.isTrustedOrigin)('https://uma.googleplex.com')).toBeTruthy();
        expect((0, post_message_handler_1.isTrustedOrigin)('https://android-build.googleplex.com')).toBeTruthy();
        expect((0, post_message_handler_1.isTrustedOrigin)('https://html5zombo.com')).toBeFalsy();
    });
    test('user trusted origins in local storage are trusted', () => {
        try {
            expect((0, post_message_handler_1.isTrustedOrigin)('https://html5zombo.com')).toBeFalsy();
            window.localStorage['trustedOrigins'] = '["https://html5zombo.com"]';
            expect((0, post_message_handler_1.isTrustedOrigin)('https://html5zombo.com')).toBeTruthy();
        }
        finally {
            window.localStorage.clear();
        }
    });
    test('developer hostnames are trusted', () => {
        expect((0, post_message_handler_1.isTrustedOrigin)('https://google.com')).toBeFalsy();
        expect((0, post_message_handler_1.isTrustedOrigin)('https://broccoliman.corp.google.com')).toBeTruthy();
        expect((0, post_message_handler_1.isTrustedOrigin)('http://broccoliman.corp.google.com')).toBeTruthy();
        expect((0, post_message_handler_1.isTrustedOrigin)('https://broccoliman.c.googlers.com')).toBeTruthy();
        expect((0, post_message_handler_1.isTrustedOrigin)('http://broccoliman.c.googlers.com')).toBeTruthy();
        expect((0, post_message_handler_1.isTrustedOrigin)('https://broccolimancorp.google.com')).toBeFalsy();
        expect((0, post_message_handler_1.isTrustedOrigin)('https://broccolimanc.googlers.com')).toBeFalsy();
        expect((0, post_message_handler_1.isTrustedOrigin)('https://localhost')).toBeTruthy();
        expect((0, post_message_handler_1.isTrustedOrigin)('http://localhost')).toBeTruthy();
        expect((0, post_message_handler_1.isTrustedOrigin)('https://127.0.0.1')).toBeTruthy();
        expect((0, post_message_handler_1.isTrustedOrigin)('http://127.0.0.1')).toBeTruthy();
        // IPv6 localhost
        expect((0, post_message_handler_1.isTrustedOrigin)('https://[::1]')).toBeTruthy();
        expect((0, post_message_handler_1.isTrustedOrigin)('http://[::1]')).toBeTruthy();
    });
});
//# sourceMappingURL=post_message_handler_unittest.js.map