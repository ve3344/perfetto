"use strict";
// Copyright (C) 2018 The Android Open Source Project
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
const tslib_1 = require("tslib");
const protos_1 = tslib_1.__importDefault(require("../protos"));
test('round trip config proto', () => {
    const input = protos_1.default.TraceConfig.create({
        durationMs: 42,
    });
    const output = protos_1.default.TraceConfig.decode(protos_1.default.TraceConfig.encode(input).finish());
    expect(output.durationMs).toBe(42);
});
//# sourceMappingURL=protos_unittest.js.map