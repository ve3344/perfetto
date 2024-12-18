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
exports.ProfileType = void 0;
exports.profileType = profileType;
var ProfileType;
(function (ProfileType) {
    ProfileType["HEAP_PROFILE"] = "heap_profile";
    ProfileType["MIXED_HEAP_PROFILE"] = "heap_profile:com.android.art,libc.malloc";
    ProfileType["NATIVE_HEAP_PROFILE"] = "heap_profile:libc.malloc";
    ProfileType["JAVA_HEAP_SAMPLES"] = "heap_profile:com.android.art";
    ProfileType["JAVA_HEAP_GRAPH"] = "graph";
    ProfileType["PERF_SAMPLE"] = "perf";
})(ProfileType || (exports.ProfileType = ProfileType = {}));
function profileType(s) {
    if (s === 'heap_profile:libc.malloc,com.android.art') {
        s = 'heap_profile:com.android.art,libc.malloc';
    }
    if (Object.values(ProfileType).includes(s)) {
        return s;
    }
    if (s.startsWith('heap_profile')) {
        return ProfileType.HEAP_PROFILE;
    }
    throw new Error('Unknown type ${s}');
}
//# sourceMappingURL=selection.js.map