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
exports.TableShowcase = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const table_1 = require("../../widgets/table");
const languagesList = [
    {
        id: 1,
        name: 'TypeScript',
        year: 2012,
    },
    {
        id: 2,
        name: 'JavaScript',
        year: 1995,
    },
    {
        id: 3,
        name: 'Lean',
        year: 2013,
    },
];
const columns = [
    (0, table_1.numberColumn)('ID', (x) => x.id),
    (0, table_1.stringColumn)('Name', (x) => x.name),
    (0, table_1.numberColumn)('Year', (x) => x.year),
];
class TableShowcase {
    data = new table_1.TableData(languagesList);
    view() {
        return (0, mithril_1.default)(table_1.Table, {
            data: this.data,
            columns,
        });
    }
}
exports.TableShowcase = TableShowcase;
//# sourceMappingURL=table_showcase.js.map