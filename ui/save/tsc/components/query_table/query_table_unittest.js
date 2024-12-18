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
const query_table_1 = require("./query_table");
describe('getSliceId', () => {
    test('get slice_id if present when no other clues are available', () => {
        expect((0, query_table_1.getSliceId)({})).toBe(undefined);
        expect((0, query_table_1.getSliceId)({ id: 123 })).toBe(undefined);
        expect((0, query_table_1.getSliceId)({ slice_id: 456 })).toBe(456);
        expect((0, query_table_1.getSliceId)({ id: 123, slice_id: 456 })).toBe(456);
        expect((0, query_table_1.getSliceId)({ type: 'foo' })).toBe(undefined);
        expect((0, query_table_1.getSliceId)({ type: 'foo', id: 123 })).toBe(undefined);
        expect((0, query_table_1.getSliceId)({ type: 'foo', slice_id: 456 })).toBe(456);
        expect((0, query_table_1.getSliceId)({ type: 'foo', id: 123, slice_id: 456 })).toBe(456);
    });
    test('get id if present when row looks like a slice', () => {
        expect((0, query_table_1.getSliceId)({ type: 'slice' })).toBe(undefined);
        expect((0, query_table_1.getSliceId)({ type: 'slice', id: 123 })).toBe(123);
        expect((0, query_table_1.getSliceId)({ type: 'slice', slice_id: 456 })).toBe(undefined);
        expect((0, query_table_1.getSliceId)({ type: 'slice', id: 123, slice_id: 456 })).toBe(123);
    });
});
test('isSliceish', () => {
    expect((0, query_table_1.isSliceish)({})).toBeFalsy();
    expect((0, query_table_1.isSliceish)({ ts: 123, dur: 456 })).toBeFalsy();
    expect((0, query_table_1.isSliceish)({ ts: 123, dur: 456, track_id: 798 })).toBeTruthy();
    expect((0, query_table_1.isSliceish)({ ts: 123n, dur: 456n })).toBeFalsy();
    expect((0, query_table_1.isSliceish)({ ts: 123n, dur: 456n, track_id: 798n })).toBeTruthy();
    expect((0, query_table_1.isSliceish)({ ts: 123.4, dur: 456.7, track_id: 798.9 })).toBeFalsy();
    expect((0, query_table_1.isSliceish)({ ts: '123', dur: '456', track_id: '789' })).toBeFalsy();
});
//# sourceMappingURL=query_table_unittest.js.map