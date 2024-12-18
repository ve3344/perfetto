"use strict";
// Copyright (C) 2023 The Android Open Source Project
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotSupportedError = void 0;
exports.nativeKeyboardLayoutMap = nativeKeyboardLayoutMap;
class NotSupportedError extends Error {
}
exports.NotSupportedError = NotSupportedError;
// Fetch the user's keyboard layout map.
// This function is merely a wrapper around the keyboard API, which throws a
// specific error when used in browsers that don't support it.
async function nativeKeyboardLayoutMap() {
    // Browser's that don't support the Keyboard API won't have a keyboard
    // property in their window.navigator object.
    // Note: it seems this is also what Chrome does when the website is accessed
    // through an insecure connection.
    if ('keyboard' in window.navigator) {
        // Typescript's dom library doesn't know about this feature, so we must
        // take some liberties when it comes to relaxing types
        const keyboard = window.navigator.keyboard;
        return await keyboard.getLayoutMap();
    }
    else {
        throw new NotSupportedError('Keyboard API is not supported');
    }
}
//# sourceMappingURL=keyboard_layout_map.js.map