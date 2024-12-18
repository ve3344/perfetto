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
exports.Details = exports.DetailsSchema = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const time_1 = require("../../../../base/time");
const utils_1 = require("../../../../base/utils");
const raf_scheduler_1 = require("../../../../core/raf_scheduler");
const sql_utils_1 = require("../../../../trace_processor/sql_utils");
const args_1 = require("../../../sql_utils/args");
const core_types_1 = require("../../../sql_utils/core_types");
const anchor_1 = require("../../../../widgets/anchor");
const error_1 = require("../../../../widgets/error");
const sql_ref_1 = require("../../../../widgets/sql_ref");
const tree_1 = require("../../../../widgets/tree");
const slice_args_1 = require("../../../details/slice_args");
const duration_1 = require("../../../widgets/duration");
const timestamp_1 = require("../../../widgets/timestamp");
const sql_ref_renderer_registry_1 = require("./sql_ref_renderer_registry");
// This file contains the helper to render the details tree (based on Tree
// widget) for an object represented by a SQL row in some table. The user passes
// a typed schema of the tree and this impl handles fetching and rendering.
//
// The following types are supported:
// Containers:
//  - dictionary (keys should be strings)
//  - array
// Primitive values:
//  - number, string, timestamp, duration, interval and thread interval.
//  - id into another sql table.
//  - arg set id.
//
// For each primitive value, the user should specify a SQL expression (usually
// just the column name). Each primitive value can be auto-skipped if the
// underlying SQL value is null (skipIfNull). Each container can be auto-skipped
// if empty (skipIfEmpty).
//
// Example of a schema:
// {
//  'Navigation ID': 'navigation_id',
//  'beforeunload': SqlIdRef({
//    source: 'beforeunload_slice_id',
//    table: 'chrome_frame_tree_nodes.id',
//   }),
//   'initiator_origin': String({
//      source: 'initiator_origin',
//      skipIfNull: true,
//   }),
//   'committed_render_frame_host': {
//     'Process ID' : 'committed_render_frame_host_process_id',
//     'RFH ID': 'committed_render_frame_host_rfh_id',
//   },
//   'initial_render_frame_host': Dict({
//     data: {
//       'Process ID': 'committed_render_frame_host_process_id',
//       'RFH ID': 'committed_render_frame_host_rfh_id',
//     },
//     preview: 'printf("id=%d:%d")', committed_render_frame_host_process_id,
//     committed_render_frame_host_rfh_id)', skipIfEmpty: true,
//   })
// }
// === Public API surface ===
var DetailsSchema;
(function (DetailsSchema) {
    // Create a dictionary object for the schema.
    function Dict(args) {
        return new DictSchema(args.data, {
            skipIfEmpty: args.skipIfEmpty,
        });
    }
    DetailsSchema.Dict = Dict;
    // Create an array object for the schema.
    function Arr(args) {
        return new ArraySchema(args.data, {
            skipIfEmpty: args.skipIfEmpty,
        });
    }
    DetailsSchema.Arr = Arr;
    // Create an object representing a timestamp for the schema.
    // |ts| — SQL expression (e.g. column name) for the timestamp.
    function Timestamp(ts, args) {
        return new ScalarValueSchema('timestamp', ts, args);
    }
    DetailsSchema.Timestamp = Timestamp;
    // Create an object representing a duration for the schema.
    // |dur| — SQL expression (e.g. column name) for the duration.
    function Duration(dur, args) {
        return new ScalarValueSchema('duration', dur, args);
    }
    DetailsSchema.Duration = Duration;
    // Create an object representing a time interval (timestamp + duration)
    // for the schema.
    // |ts|, |dur| - SQL expressions (e.g. column names) for the timestamp
    // and duration.
    function Interval(ts, dur, args) {
        return new IntervalSchema(ts, dur, args);
    }
    DetailsSchema.Interval = Interval;
    // Create an object representing a combination of time interval and thread for
    // the schema.
    // |ts|, |dur|, |utid| - SQL expressions (e.g. column names) for the
    // timestamp, duration and unique thread id.
    function ThreadInterval(ts, dur, utid, args) {
        return new ThreadIntervalSchema(ts, dur, utid, args);
    }
    DetailsSchema.ThreadInterval = ThreadInterval;
    // Create an object representing a reference to an arg set for the schema.
    // |argSetId| - SQL expression (e.g. column name) for the arg set id.
    function ArgSetId(argSetId, args) {
        return new ScalarValueSchema('arg_set_id', argSetId, args);
    }
    DetailsSchema.ArgSetId = ArgSetId;
    // Create an object representing a SQL value for the schema.
    // |value| - SQL expression (e.g. column name) for the value.
    function Value(value, args) {
        return new ScalarValueSchema('value', value, args);
    }
    DetailsSchema.Value = Value;
    // Create an object representing string-rendered-as-url for the schema.
    // |value| - SQL expression (e.g. column name) for the value.
    function URLValue(value, args) {
        return new ScalarValueSchema('url', value, args);
    }
    DetailsSchema.URLValue = URLValue;
    function Boolean(value, args) {
        return new ScalarValueSchema('boolean', value, args);
    }
    DetailsSchema.Boolean = Boolean;
    // Create an object representing a reference to a SQL table row in the schema.
    // |table| - name of the table.
    // |id| - SQL expression (e.g. column name) for the id.
    function SqlIdRef(table, id, args) {
        return new SqlIdRefSchema(table, id, args);
    }
    DetailsSchema.SqlIdRef = SqlIdRef;
})(DetailsSchema || (exports.DetailsSchema = DetailsSchema = {})); // namespace DetailsSchema
// Class responsible for fetching the data and rendering the data.
class Details {
    trace;
    sqlTable;
    id;
    constructor(trace, sqlTable, id, schema) {
        this.trace = trace;
        this.sqlTable = sqlTable;
        this.id = id;
        this.dataController = new DataController(trace, sqlTable, id, sql_ref_renderer_registry_1.sqlIdRegistry);
        this.resolvedSchema = {
            kind: 'dict',
            data: Object.fromEntries(Object.entries(schema).map(([key, value]) => [
                key,
                resolve(value, this.dataController),
            ])),
        };
        this.dataController.fetch();
    }
    isLoading() {
        return this.dataController.data === undefined;
    }
    render() {
        if (this.dataController.data === undefined) {
            return (0, mithril_1.default)('h2', 'Loading');
        }
        const nodes = [];
        for (const [key, value] of Object.entries(this.resolvedSchema.data)) {
            nodes.push(renderValue(this.trace, key, value, this.dataController.data, this.dataController.sqlIdRefRenderers));
        }
        nodes.push((0, mithril_1.default)(tree_1.TreeNode, {
            left: 'SQL ID',
            right: (0, mithril_1.default)(sql_ref_1.SqlRef, {
                table: this.sqlTable,
                id: this.id,
            }),
        }));
        return (0, mithril_1.default)(tree_1.Tree, nodes);
    }
    dataController;
    resolvedSchema;
}
exports.Details = Details;
// Description is passed by the user and then the data is resolved into
// "resolved" versions of the types. Description focuses on the end-user
// ergonomics, while "Resolved" optimises for internal processing.
// Description of a dict in the schema.
class DictSchema {
    data;
    params;
    constructor(data, params) {
        this.data = data;
        this.params = params;
    }
}
// Description of an array in the schema.
class ArraySchema {
    data;
    params;
    constructor(data, params) {
        this.data = data;
        this.params = params;
    }
}
// Schema for all simple scalar values (ones that need to fetch only one value
// from SQL).
class ScalarValueSchema {
    kind;
    sourceExpression;
    params;
    constructor(kind, sourceExpression, params) {
        this.kind = kind;
        this.sourceExpression = sourceExpression;
        this.params = params;
    }
}
// Schema for a time interval (ts, dur pair).
class IntervalSchema {
    ts;
    dur;
    params;
    constructor(ts, dur, params) {
        this.ts = ts;
        this.dur = dur;
        this.params = params;
    }
}
// Schema for a time interval for a given thread (ts, dur, utid triple).
class ThreadIntervalSchema {
    ts;
    dur;
    utid;
    params;
    constructor(ts, dur, utid, params) {
        this.ts = ts;
        this.dur = dur;
        this.utid = utid;
        this.params = params;
    }
}
// Schema for a reference to a SQL table row.
class SqlIdRefSchema {
    table;
    id;
    params;
    constructor(table, id, params) {
        this.table = table;
        this.id = id;
        this.params = params;
    }
}
// Helper class to store the error messages while fetching the data.
class Err {
    message;
    constructor(message) {
        this.message = message;
    }
}
// Class responsible for collecting the description of the data to fetch and
// fetching it.
class DataController {
    trace;
    sqlTable;
    id;
    sqlIdRefRenderers;
    // List of expressions to fetch. Resolved values will have indexes into this
    // list.
    expressions = [];
    // List of arg sets to fetch. Arg set ids are fetched first (together with
    // other scalar values as a part of the `expressions` list) and then the arg
    // sets themselves are fetched.
    argSets = [];
    // List of SQL references to fetch. SQL reference ids are fetched first
    // (together with other scalar values as a part of the `expressions` list) and
    // then the SQL references themselves are fetched.
    sqlIdRefs = [];
    // Fetched data.
    data;
    constructor(trace, sqlTable, id, sqlIdRefRenderers) {
        this.trace = trace;
        this.sqlTable = sqlTable;
        this.id = id;
        this.sqlIdRefRenderers = sqlIdRefRenderers;
    }
    // Fetch the data. `expressions` and other lists must be populated first by
    // resolving the schema.
    async fetch() {
        const data = {
            valueExpressions: this.expressions,
            values: [],
            argSetExpressions: this.argSets.map((index) => this.expressions[index]),
            argSets: [],
            sqlIdRefs: this.sqlIdRefs.map((ref) => ({
                tableName: ref.tableName,
                idExpression: this.expressions[ref.id],
            })),
            sqlIdRefData: [],
        };
        // Helper to generate the labels for the expressions.
        const label = (index) => `col_${index}`;
        // Fetch the scalar values for the basic expressions.
        const row = (await this.trace.engine.query(`
      SELECT
        ${this.expressions
            .map((value, index) => `${value} as ${label(index)}`)
            .join(',\n')}
      FROM ${this.sqlTable}
      WHERE id = ${this.id}
    `)).firstRow({});
        for (let i = 0; i < this.expressions.length; ++i) {
            data.values.push(row[label(i)]);
        }
        // Fetch the arg sets based on the fetched arg set ids.
        for (const argSetIndex of this.argSets) {
            const argSetId = data.values[argSetIndex];
            if (argSetId === null) {
                data.argSets.push([]);
            }
            else if (typeof argSetId !== 'number' && typeof argSetId !== 'bigint') {
                data.argSets.push(new Err(`Incorrect type for arg set ${data.argSetExpressions[argSetIndex]}: expected a number, got ${typeof argSetId} instead}`));
            }
            else {
                data.argSets.push(await (0, args_1.getArgs)(this.trace.engine, (0, core_types_1.asArgSetId)(Number(argSetId))));
            }
        }
        // Fetch the data for SQL references based on fetched ids.
        for (const ref of this.sqlIdRefs) {
            const renderer = this.sqlIdRefRenderers[ref.tableName];
            if (renderer === undefined) {
                data.sqlIdRefData.push(new Err(`Unknown table ${ref.tableName}`));
                continue;
            }
            const id = data.values[ref.id];
            if (id === null) {
                data.sqlIdRefData.push({ data: {}, id });
                continue;
            }
            else if (typeof id !== 'bigint') {
                data.sqlIdRefData.push(new Err(`Incorrect type for SQL reference ${data.valueExpressions[ref.id]}: expected a bigint, got ${typeof id} instead}`));
                continue;
            }
            const refData = await renderer.fetch(this.trace.engine, id);
            if (refData === undefined) {
                data.sqlIdRefData.push(new Err(`Failed to fetch the data with id ${id} for table ${ref.tableName}`));
                continue;
            }
            data.sqlIdRefData.push({ data: refData, id });
        }
        this.data = data;
        raf_scheduler_1.raf.scheduleFullRedraw();
    }
    // Add a given expression to the list of expressions to fetch and return its
    // index.
    addExpression(expr) {
        const result = this.expressions.length;
        this.expressions.push(expr);
        return result;
    }
    // Add a given arg set to the list of arg sets to fetch and return its index.
    addArgSet(expr) {
        const result = this.argSets.length;
        this.argSets.push(this.addExpression(expr));
        return result;
    }
    // Add a given SQL reference to the list of SQL references to fetch and return
    // its index.
    addSqlIdRef(tableName, idExpr) {
        const result = this.sqlIdRefs.length;
        this.sqlIdRefs.push({
            tableName,
            id: this.addExpression(idExpr),
        });
        return result;
    }
}
// Resolve a given schema into a resolved version, normalising the schema and
// computing the list of data to fetch.
function resolve(schema, data) {
    if (typeof schema === 'string') {
        return {
            kind: 'value',
            source: data.addExpression(schema),
        };
    }
    if (Array.isArray(schema)) {
        return {
            kind: 'array',
            data: schema.map((x) => resolve(x, data)),
        };
    }
    if (schema instanceof ArraySchema) {
        return {
            kind: 'array',
            data: schema.data.map((x) => resolve(x, data)),
            ...schema.params,
        };
    }
    if (schema instanceof ScalarValueSchema) {
        if (schema.kind === 'arg_set_id') {
            return {
                kind: schema.kind,
                source: data.addArgSet(schema.sourceExpression),
                ...schema.params,
            };
        }
        else {
            return {
                kind: schema.kind,
                source: data.addExpression(schema.sourceExpression),
                ...schema.params,
            };
        }
    }
    if (schema instanceof IntervalSchema) {
        return {
            kind: 'interval',
            ts: data.addExpression(schema.ts),
            dur: data.addExpression(schema.dur),
            ...schema.params,
        };
    }
    if (schema instanceof ThreadIntervalSchema) {
        return {
            kind: 'thread_interval',
            ts: data.addExpression(schema.ts),
            dur: data.addExpression(schema.dur),
            utid: data.addExpression(schema.utid),
            ...schema.params,
        };
    }
    if (schema instanceof SqlIdRefSchema) {
        return {
            kind: 'sql_id_ref',
            ref: data.addSqlIdRef(schema.table, schema.id),
            ...schema.params,
        };
    }
    if (schema instanceof DictSchema) {
        return {
            kind: 'dict',
            data: Object.fromEntries(Object.entries(schema.data).map(([key, value]) => [
                key,
                resolve(value, data),
            ])),
            ...schema.params,
        };
    }
    return {
        kind: 'dict',
        data: Object.fromEntries(Object.entries(schema).map(([key, value]) => [key, resolve(value, data)])),
    };
}
// Generate the vdom for a given value using the fetched `data`.
function renderValue(trace, key, value, data, sqlIdRefRenderers) {
    switch (value.kind) {
        case 'value':
            if (data.values[value.source] === null && value.skipIfNull)
                return null;
            return (0, mithril_1.default)(tree_1.TreeNode, {
                left: key,
                right: (0, sql_utils_1.sqlValueToReadableString)(data.values[value.source]),
            });
        case 'url': {
            const url = data.values[value.source];
            let rhs;
            if (url === null) {
                if (value.skipIfNull)
                    return null;
                rhs = renderNull();
            }
            else if (typeof url !== 'string') {
                rhs = (0, error_1.renderError)(`Incorrect type for URL ${data.valueExpressions[value.source]}: expected string, got ${typeof url}`);
            }
            else {
                rhs = (0, mithril_1.default)(anchor_1.Anchor, { href: url, target: '_blank', icon: 'open_in_new' }, url);
            }
            return (0, mithril_1.default)(tree_1.TreeNode, {
                left: key,
                right: rhs,
            });
        }
        case 'boolean': {
            const bool = data.values[value.source];
            if (bool === null && value.skipIfNull)
                return null;
            let rhs;
            if (typeof bool !== 'bigint' && typeof bool !== 'number') {
                rhs = (0, error_1.renderError)(`Incorrect type for boolean ${data.valueExpressions[value.source]}: expected bigint or number, got ${typeof bool}`);
            }
            else {
                rhs = bool ? 'true' : 'false';
            }
            return (0, mithril_1.default)(tree_1.TreeNode, { left: key, right: rhs });
        }
        case 'timestamp': {
            const ts = data.values[value.source];
            let rhs;
            if (ts === null) {
                if (value.skipIfNull)
                    return null;
                rhs = (0, mithril_1.default)('i', 'NULL');
            }
            else if (typeof ts !== 'bigint') {
                rhs = (0, error_1.renderError)(`Incorrect type for timestamp ${data.valueExpressions[value.source]}: expected bigint, got ${typeof ts}`);
            }
            else {
                rhs = (0, mithril_1.default)(timestamp_1.Timestamp, {
                    ts: time_1.Time.fromRaw(ts),
                });
            }
            return (0, mithril_1.default)(tree_1.TreeNode, {
                left: key,
                right: rhs,
            });
        }
        case 'duration': {
            const dur = data.values[value.source];
            return (0, mithril_1.default)(tree_1.TreeNode, {
                left: key,
                right: typeof dur === 'bigint' &&
                    (0, mithril_1.default)(duration_1.DurationWidget, {
                        dur,
                    }),
            });
        }
        case 'interval':
        case 'thread_interval': {
            const dur = data.values[value.dur];
            return (0, mithril_1.default)(tree_1.TreeNode, {
                left: key,
                right: typeof dur === 'bigint' &&
                    (0, mithril_1.default)(duration_1.DurationWidget, {
                        dur,
                    }),
            });
        }
        case 'sql_id_ref':
            const ref = data.sqlIdRefs[value.ref];
            const refData = data.sqlIdRefData[value.ref];
            let rhs;
            let children;
            if (refData instanceof Err) {
                rhs = (0, error_1.renderError)(refData.message);
            }
            else if (refData.id === null && value.skipIfNull === true) {
                rhs = renderNull();
            }
            else {
                const renderer = sqlIdRefRenderers[ref.tableName];
                if (renderer === undefined) {
                    rhs = (0, error_1.renderError)(`Unknown table ${ref.tableName} (${ref.tableName}[${refData.id}])`);
                }
                else {
                    const rendered = renderer.render(refData.data);
                    rhs = rendered.value;
                    children = rendered.children;
                }
            }
            return (0, mithril_1.default)(tree_1.TreeNode, {
                left: key,
                right: rhs,
            }, children);
        case 'arg_set_id':
            const args = data.argSets[value.source];
            if (args instanceof Err) {
                return (0, error_1.renderError)(args.message);
            }
            return ((0, slice_args_1.hasArgs)(args) &&
                (0, mithril_1.default)(tree_1.TreeNode, {
                    left: key,
                }, (0, slice_args_1.renderArguments)(trace, args)));
        case 'array': {
            const children = [];
            for (const child of value.data) {
                const renderedChild = renderValue(trace, `[${children.length}]`, child, data, sqlIdRefRenderers);
                if ((0, utils_1.exists)(renderedChild)) {
                    children.push(renderedChild);
                }
            }
            if (children.length === 0 && value.skipIfEmpty) {
                return null;
            }
            return (0, mithril_1.default)(tree_1.TreeNode, {
                left: key,
            }, children);
        }
        case 'dict': {
            const children = [];
            for (const [key, val] of Object.entries(value.data)) {
                const child = renderValue(trace, key, val, data, sqlIdRefRenderers);
                if ((0, utils_1.exists)(child)) {
                    children.push(child);
                }
            }
            if (children.length === 0 && value.skipIfEmpty) {
                return null;
            }
            return (0, mithril_1.default)(tree_1.TreeNode, {
                left: key,
            }, children);
        }
    }
}
function renderNull() {
    return (0, mithril_1.default)('i', 'NULL');
}
//# sourceMappingURL=details.js.map