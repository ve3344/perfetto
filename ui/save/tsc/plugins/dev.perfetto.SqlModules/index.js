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
const assets_1 = require("../../base/assets");
const logging_1 = require("../../base/logging");
const sql_modules_impl_1 = require("./sql_modules_impl");
const extensions_1 = require("../../components/extensions");
class default_1 {
    static id = 'dev.perfetto.SqlModules';
    sqlModules;
    async onTraceLoad(ctx) {
        const resp = await fetch((0, assets_1.assetSrc)('stdlib_docs.json'));
        const json = await resp.json();
        const docs = sql_modules_impl_1.SQL_MODULES_DOCS_SCHEMA.parse(json);
        const sqlModules = new sql_modules_impl_1.SqlModulesImpl(docs);
        this.sqlModules = sqlModules;
        ctx.commands.registerCommand({
            id: 'perfetto.OpenSqlModulesTable',
            name: 'Open table...',
            callback: async () => {
                const tables = sqlModules.listTables();
                const tableName = await ctx.omnibox.prompt('Choose a table...', tables);
                if (tableName === undefined) {
                    return;
                }
                const module = sqlModules.getModuleForTable(tableName);
                if (module === undefined) {
                    return;
                }
                const sqlTable = module.getSqlTableDescription(tableName);
                sqlTable &&
                    extensions_1.extensions.addLegacySqlTableTab(ctx, {
                        table: sqlTable,
                    });
            },
        });
    }
    getSqlModules() {
        return (0, logging_1.assertExists)(this.sqlModules);
    }
}
exports.default = default_1;
//# sourceMappingURL=index.js.map