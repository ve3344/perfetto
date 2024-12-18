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
const deferred_1 = require("./deferred");
test('deferred can resolve', async () => {
    const deferred = (0, deferred_1.defer)();
    let i = 0;
    deferred.then(() => i++);
    expect(i).toBe(0);
    deferred.resolve();
    expect(i).toBe(0);
    await deferred;
    expect(i).toBe(1);
});
test('deferred can resolve with value', () => {
    const deferred = (0, deferred_1.defer)();
    deferred.resolve('foo');
    return expect(deferred).resolves.toBe('foo');
});
test('deferred can reject', () => {
    const deferred = (0, deferred_1.defer)();
    deferred.reject('foo');
    return expect(deferred).rejects.toBe('foo');
});
//# sourceMappingURL=deferred_unittest.js.map