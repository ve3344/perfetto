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
const sql_table_registry_1 = require("../../components/widgets/sql/legacy_table/sql_table_registry");
const tables_1 = require("./tables");
const extensions_1 = require("../../components/extensions");
class default_1 {
    static id = 'org.Chromium.OpenTableCommands';
    async onTraceLoad(ctx) {
        sql_table_registry_1.sqlTableRegistry['slice'] = (0, tables_1.getSliceTable)();
        ctx.commands.registerCommand({
            id: 'perfetto.ShowTable.slice',
            name: 'Open table: slice',
            callback: () => {
                extensions_1.extensions.addLegacySqlTableTab(ctx, {
                    table: (0, tables_1.getSliceTable)(),
                });
            },
        });
        sql_table_registry_1.sqlTableRegistry['thread'] = (0, tables_1.getThreadTable)();
        ctx.commands.registerCommand({
            id: 'perfetto.ShowTable.thread',
            name: 'Open table: thread',
            callback: () => {
                extensions_1.extensions.addLegacySqlTableTab(ctx, {
                    table: (0, tables_1.getThreadTable)(),
                });
            },
        });
        sql_table_registry_1.sqlTableRegistry['process'] = (0, tables_1.getThreadTable)();
        ctx.commands.registerCommand({
            id: 'perfetto.ShowTable.process',
            name: 'Open table: process',
            callback: () => {
                extensions_1.extensions.addLegacySqlTableTab(ctx, {
                    table: (0, tables_1.getProcessTable)(),
                });
            },
        });
        sql_table_registry_1.sqlTableRegistry['sched'] = (0, tables_1.getSchedTable)();
        ctx.commands.registerCommand({
            id: 'perfetto.ShowTable.sched',
            name: 'Open table: sched',
            callback: () => {
                extensions_1.extensions.addLegacySqlTableTab(ctx, {
                    table: (0, tables_1.getSchedTable)(),
                });
            },
        });
        sql_table_registry_1.sqlTableRegistry['thread_state'] = (0, tables_1.getThreadStateTable)();
        ctx.commands.registerCommand({
            id: 'perfetto.ShowTable.thread_state',
            name: 'Open table: thread_state',
            callback: () => {
                extensions_1.extensions.addLegacySqlTableTab(ctx, {
                    table: (0, tables_1.getThreadStateTable)(),
                });
            },
        });
        sql_table_registry_1.sqlTableRegistry['android_logs'] = (0, tables_1.getAndroidLogsTable)();
        ctx.commands.registerCommand({
            id: 'perfetto.ShowTable.android_logs',
            name: 'Open table: android_logs',
            callback: () => {
                extensions_1.extensions.addLegacySqlTableTab(ctx, {
                    table: (0, tables_1.getAndroidLogsTable)(),
                });
            },
        });
    }
}
exports.default = default_1;
//# sourceMappingURL=index.js.map