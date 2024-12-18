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
exports.GenericSliceDetailsTab = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const sql_utils_1 = require("../../trace_processor/sql_utils");
const details_shell_1 = require("../../widgets/details_shell");
const grid_layout_1 = require("../../widgets/grid_layout");
const section_1 = require("../../widgets/section");
const sql_ref_1 = require("../../widgets/sql_ref");
const tree_1 = require("../../widgets/tree");
// A details tab, which fetches slice-like object from a given SQL table by id
// and renders it according to the provided config, specifying which columns
// need to be rendered and how.
class GenericSliceDetailsTab {
    trace;
    sqlTableName;
    id;
    title;
    columns;
    data;
    constructor(trace, sqlTableName, id, title, columns) {
        this.trace = trace;
        this.sqlTableName = sqlTableName;
        this.id = id;
        this.title = title;
        this.columns = columns;
    }
    async load() {
        const result = await this.trace.engine.query(`select * from ${this.sqlTableName} where id = ${this.id}`);
        this.data = result.firstRow({});
    }
    render() {
        if (!this.data) {
            return (0, mithril_1.default)('h2', 'Loading');
        }
        const args = {};
        if (this.columns !== undefined) {
            for (const key of Object.keys(this.columns)) {
                let argKey = key;
                if (this.columns[key].displayName !== undefined) {
                    argKey = this.columns[key].displayName;
                }
                args[argKey] = (0, sql_utils_1.sqlValueToReadableString)(this.data[key]);
            }
        }
        else {
            for (const key of Object.keys(this.data)) {
                args[key] = (0, sql_utils_1.sqlValueToReadableString)(this.data[key]);
            }
        }
        const details = (0, tree_1.dictToTree)(args);
        return (0, mithril_1.default)(details_shell_1.DetailsShell, {
            title: this.title,
        }, (0, mithril_1.default)(grid_layout_1.GridLayout, (0, mithril_1.default)(section_1.Section, { title: 'Details' }, (0, mithril_1.default)(tree_1.Tree, details)), (0, mithril_1.default)(section_1.Section, { title: 'Metadata' }, (0, mithril_1.default)(tree_1.Tree, [
            (0, mithril_1.default)(tree_1.TreeNode, {
                left: 'SQL ID',
                right: (0, mithril_1.default)(sql_ref_1.SqlRef, {
                    table: this.sqlTableName,
                    id: this.id,
                }),
            }),
        ]))));
    }
}
exports.GenericSliceDetailsTab = GenericSliceDetailsTab;
//# sourceMappingURL=generic_slice_details_tab.js.map