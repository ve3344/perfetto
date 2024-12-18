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
exports.initAssets = initAssets;
exports.assetSrc = assetSrc;
const http_utils_1 = require("./http_utils");
let rootUrl = '';
/**
 * This function must be called once while bootstrapping in a direct script
 * context (i.e. not a promise or callback). Typically frontend/index.ts.
 */
function initAssets() {
    rootUrl = (0, http_utils_1.getServingRoot)();
}
/**
 * Returns the absolute url of an asset.
 * assetSrc('assets/image.jpg') -> '/v123-deadbef/assets/image.png';
 */
function assetSrc(relPath) {
    return rootUrl + relPath;
}
//# sourceMappingURL=assets.js.map