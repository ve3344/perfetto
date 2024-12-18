"use strict";
// Copyright (C) 2021 The Android Open Source Project
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
exports.DEFAULT_SLICE_LAYOUT = exports.SLICE_LAYOUT_FLAT_DEFAULTS = exports.SLICE_LAYOUT_FIT_CONTENT_DEFAULTS = exports.SLICE_LAYOUT_FIXED_DEFAULTS = exports.SLICE_LAYOUT_BASE_DEFAULTS = void 0;
exports.SLICE_LAYOUT_BASE_DEFAULTS = Object.freeze({
    padding: 3,
    rowSpacing: 0,
});
exports.SLICE_LAYOUT_FIXED_DEFAULTS = Object.freeze({
    ...exports.SLICE_LAYOUT_BASE_DEFAULTS,
    heightMode: 'FIXED',
    fixedHeight: 30,
});
exports.SLICE_LAYOUT_FIT_CONTENT_DEFAULTS = Object.freeze({
    ...exports.SLICE_LAYOUT_BASE_DEFAULTS,
    heightMode: 'FIT_CONTENT',
    sliceHeight: 18,
});
exports.SLICE_LAYOUT_FLAT_DEFAULTS = Object.freeze({
    ...exports.SLICE_LAYOUT_BASE_DEFAULTS,
    depthGuess: 0,
    isFlat: true,
    heightMode: 'FIXED',
    fixedHeight: 18,
    titleSizePx: 10,
    padding: 3,
});
exports.DEFAULT_SLICE_LAYOUT = exports.SLICE_LAYOUT_FIT_CONTENT_DEFAULTS;
//# sourceMappingURL=slice_layout.js.map