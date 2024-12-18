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
const custom_sql_table_slice_track_1 = require("./custom_sql_table_slice_track");
describe('CustomSqlTableSliceTrack.getDataset()', () => {
    test('simple track', () => {
        class Track extends custom_sql_table_slice_track_1.CustomSqlTableSliceTrack {
            getSqlDataSource() {
                return {
                    sqlTableName: 'footable',
                };
            }
        }
        const foo = new Track(undefined, 'foo');
        const dataset = foo.getDataset();
        expect(dataset.src).toBe('SELECT * FROM footable');
    });
    test('track with cols', () => {
        class Track extends custom_sql_table_slice_track_1.CustomSqlTableSliceTrack {
            getSqlDataSource() {
                return {
                    columns: ['foo', 'bar', 'baz'],
                    sqlTableName: 'footable',
                };
            }
        }
        const foo = new Track(undefined, 'foo');
        const dataset = foo.getDataset();
        expect(dataset.src).toBe('SELECT foo,bar,baz FROM footable');
    });
    test('track with where clause', () => {
        class Track extends custom_sql_table_slice_track_1.CustomSqlTableSliceTrack {
            getSqlDataSource() {
                return {
                    sqlTableName: 'footable',
                    columns: ['foo', 'bar', 'baz'],
                    whereClause: 'bar = 123',
                };
            }
        }
        const foo = new Track(undefined, 'foo');
        const dataset = foo.getDataset();
        expect(dataset.src).toBe('SELECT foo,bar,baz FROM footable WHERE bar = 123');
    });
});
//# sourceMappingURL=custom_sql_table_slice_track_unittest.js.map