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
exports.pseudoRand = pseudoRand;
// Match C++ minstd_rand0 behaviour.
const MODULUS = 2 ** 31 - 1;
const MULTIPLIER = 48271;
const INCREMENT = 1;
// If callers don't want to bother maintain their own state, use the global one
// for the whole app.
const globalRandState = { seed: 0 };
// Like math.Rand(), but yields a repeateabled sequence (matters for tests).
function pseudoRand(state) {
    state = state ?? globalRandState;
    state.seed = (MULTIPLIER * state.seed + INCREMENT) % MODULUS;
    return state.seed / MODULUS;
}
//# sourceMappingURL=rand.js.map