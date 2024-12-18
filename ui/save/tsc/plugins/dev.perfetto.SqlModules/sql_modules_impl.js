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
exports.SQL_MODULES_DOCS_SCHEMA = exports.StdlibModuleImpl = exports.StdlibPackageImpl = exports.SqlModulesImpl = void 0;
const zod_1 = require("zod");
const column_1 = require("../../components/widgets/sql/legacy_table/column");
const table_1 = require("../../components/widgets/sql/table/table");
class SqlModulesImpl {
    packages;
    constructor(docs) {
        this.packages = docs.map((json) => new StdlibPackageImpl(json));
    }
    listTables() {
        return this.packages.flatMap((p) => p.listTables());
    }
    getModuleForTable(tableName) {
        for (const stdlibPackage of this.packages) {
            const maybeTable = stdlibPackage.getModuleForTable(tableName);
            if (maybeTable) {
                return maybeTable;
            }
        }
        return undefined;
    }
}
exports.SqlModulesImpl = SqlModulesImpl;
class StdlibPackageImpl {
    name;
    modules;
    constructor(docs) {
        this.name = docs.name;
        this.modules = [];
        for (const moduleJson of docs.modules) {
            this.modules.push(new StdlibModuleImpl(moduleJson));
        }
    }
    getModuleForTable(tableName) {
        for (const module of this.modules) {
            for (const dataObj of module.dataObjects) {
                if (dataObj.name == tableName) {
                    return module;
                }
            }
        }
        return undefined;
    }
    listTables() {
        return this.modules.flatMap((module) => module.dataObjects.map((dataObj) => dataObj.name));
    }
    getSqlTableDescription(tableName) {
        for (const module of this.modules) {
            for (const dataObj of module.dataObjects) {
                if (dataObj.name == tableName) {
                    return module.getSqlTableDescription(tableName);
                }
            }
        }
        return undefined;
    }
}
exports.StdlibPackageImpl = StdlibPackageImpl;
class StdlibModuleImpl {
    includeKey;
    dataObjects;
    functions;
    tableFunctions;
    macros;
    constructor(docs) {
        this.includeKey = docs.module_name;
        this.dataObjects = docs.data_objects.map((json) => new StdlibDataObjectImpl(json));
        this.functions = docs.functions.map((json) => new StdlibFunctionImpl(json));
        this.tableFunctions = docs.table_functions.map((json) => new StdlibTableFunctionImpl(json));
        this.macros = docs.macros.map((json) => new StdlibMacroImpl(json));
    }
    getTable(tableName) {
        for (const obj of this.dataObjects) {
            if (obj.name == tableName) {
                return obj;
            }
        }
        return undefined;
    }
    getSqlTableDescription(tableName) {
        const sqlTable = this.getTable(tableName);
        if (sqlTable === undefined) {
            return undefined;
        }
        return {
            imports: [this.includeKey],
            name: sqlTable.name,
            columns: sqlTable.getTableColumns(),
        };
    }
}
exports.StdlibModuleImpl = StdlibModuleImpl;
class StdlibMacroImpl {
    name;
    summaryDesc;
    description;
    args;
    returnType;
    constructor(docs) {
        this.name = docs.name;
        this.summaryDesc = docs.summary_desc;
        this.description = docs.desc;
        this.returnType = docs.return_type;
        this.args = [];
        this.args = docs.args.map((json) => new StdlibFunctionArgImpl(json));
    }
}
class StdlibTableFunctionImpl {
    name;
    summaryDesc;
    description;
    args;
    returnCols;
    constructor(docs) {
        this.name = docs.name;
        this.summaryDesc = docs.summary_desc;
        this.description = docs.desc;
        this.args = docs.args.map((json) => new StdlibFunctionArgImpl(json));
        this.returnCols = docs.cols.map((json) => new StdlibColumnImpl(json));
    }
}
class StdlibFunctionImpl {
    name;
    summaryDesc;
    description;
    args;
    returnType;
    returnDesc;
    constructor(docs) {
        this.name = docs.name;
        this.summaryDesc = docs.summary_desc;
        this.description = docs.desc;
        this.returnType = docs.return_type;
        this.returnDesc = docs.return_desc;
        this.args = docs.args.map((json) => new StdlibFunctionArgImpl(json));
    }
}
class StdlibDataObjectImpl {
    name;
    description;
    type;
    columns;
    constructor(docs) {
        this.name = docs.name;
        this.description = docs.desc;
        this.type = docs.type;
        this.columns = docs.cols.map((json) => new StdlibColumnImpl(json));
    }
    getTableColumns() {
        return this.columns.map((col) => new column_1.FromSimpleColumn(col.asSimpleColumn(this.name)));
    }
}
class StdlibColumnImpl {
    name;
    type;
    description;
    constructor(docs) {
        this.type = docs.type;
        this.description = docs.desc;
        this.name = docs.name;
    }
    asSimpleColumn(tableName) {
        if (this.type === 'TIMESTAMP') {
            return (0, table_1.createTimestampColumn)(this.name);
        }
        if (this.type === 'DURATION') {
            return (0, table_1.createDurationColumn)(this.name);
        }
        if (this.name === 'ID') {
            if (tableName === 'slice') {
                return (0, table_1.createSliceIdColumn)(this.name);
            }
            if (tableName === 'thread') {
                return (0, table_1.createThreadIdColumn)(this.name);
            }
            if (tableName === 'process') {
                return (0, table_1.createProcessIdColumn)(this.name);
            }
            if (tableName === 'thread_state') {
                return (0, table_1.createThreadStateIdColumn)(this.name);
            }
            if (tableName === 'sched') {
                return (0, table_1.createSchedIdColumn)(this.name);
            }
            return (0, table_1.createStandardColumn)(this.name);
        }
        if (this.type === 'JOINID(slice.id)') {
            return (0, table_1.createSliceIdColumn)(this.name);
        }
        if (this.type === 'JOINID(thread.id)') {
            return (0, table_1.createThreadIdColumn)(this.name);
        }
        if (this.type === 'JOINID(process.id)') {
            return (0, table_1.createProcessIdColumn)(this.name);
        }
        if (this.type === 'JOINID(thread_state.id)') {
            return (0, table_1.createThreadStateIdColumn)(this.name);
        }
        if (this.type === 'JOINID(sched.id)') {
            return (0, table_1.createSchedIdColumn)(this.name);
        }
        return (0, table_1.createStandardColumn)(this.name);
    }
}
class StdlibFunctionArgImpl {
    name;
    description;
    type;
    constructor(docs) {
        this.type = docs.type;
        this.description = docs.desc;
        this.name = docs.name;
    }
}
const ARG_OR_COL_SCHEMA = zod_1.z.object({
    name: zod_1.z.string(),
    type: zod_1.z.string(),
    desc: zod_1.z.string(),
});
const DATA_OBJECT_SCHEMA = zod_1.z.object({
    name: zod_1.z.string(),
    desc: zod_1.z.string(),
    summary_desc: zod_1.z.string(),
    type: zod_1.z.string(),
    cols: zod_1.z.array(ARG_OR_COL_SCHEMA),
});
const FUNCTION_SCHEMA = zod_1.z.object({
    name: zod_1.z.string(),
    desc: zod_1.z.string(),
    summary_desc: zod_1.z.string(),
    args: zod_1.z.array(ARG_OR_COL_SCHEMA),
    return_type: zod_1.z.string(),
    return_desc: zod_1.z.string(),
});
const TABLE_FUNCTION_SCHEMA = zod_1.z.object({
    name: zod_1.z.string(),
    desc: zod_1.z.string(),
    summary_desc: zod_1.z.string(),
    args: zod_1.z.array(ARG_OR_COL_SCHEMA),
    cols: zod_1.z.array(ARG_OR_COL_SCHEMA),
});
const MACRO_SCHEMA = zod_1.z.object({
    name: zod_1.z.string(),
    desc: zod_1.z.string(),
    summary_desc: zod_1.z.string(),
    return_desc: zod_1.z.string(),
    return_type: zod_1.z.string(),
    args: zod_1.z.array(ARG_OR_COL_SCHEMA),
});
const MODULE_SCHEMA = zod_1.z.object({
    module_name: zod_1.z.string(),
    data_objects: zod_1.z.array(DATA_OBJECT_SCHEMA),
    functions: zod_1.z.array(FUNCTION_SCHEMA),
    table_functions: zod_1.z.array(TABLE_FUNCTION_SCHEMA),
    macros: zod_1.z.array(MACRO_SCHEMA),
});
const PACKAGE_SCHEMA = zod_1.z.object({
    name: zod_1.z.string(),
    modules: zod_1.z.array(MODULE_SCHEMA),
});
exports.SQL_MODULES_DOCS_SCHEMA = zod_1.z.array(PACKAGE_SCHEMA);
//# sourceMappingURL=sql_modules_impl.js.map