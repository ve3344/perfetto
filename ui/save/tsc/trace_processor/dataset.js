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
exports.UnionDataset = exports.SourceDataset = void 0;
const logging_1 = require("../base/logging");
const utils_1 = require("../base/utils");
/**
 * Defines a dataset with a source SQL select statement of table name, a
 * schema describing the columns, and an optional filter.
 */
class SourceDataset {
    src;
    schema;
    filter;
    constructor(config) {
        this.src = config.src;
        this.schema = config.schema;
        this.filter = config.filter;
    }
    query(schema) {
        schema = schema ?? this.schema;
        const cols = Object.keys(schema);
        const whereClause = this.filterToQuery();
        return `select ${cols.join(', ')} from (${this.src}) ${whereClause}`.trim();
    }
    optimize() {
        // Cannot optimize SourceDataset
        return this;
    }
    implements(schema) {
        return Object.entries(schema).every(([name, kind]) => {
            return name in this.schema && this.schema[name] === kind;
        });
    }
    filterToQuery() {
        const filter = this.filter;
        if (filter === undefined) {
            return '';
        }
        if ('eq' in filter) {
            return `where ${filter.col} = ${filter.eq}`;
        }
        else if ('in' in filter) {
            return `where ${filter.col} in (${filter.in.join(',')})`;
        }
        else {
            (0, logging_1.assertUnreachable)(filter);
        }
    }
}
exports.SourceDataset = SourceDataset;
/**
 * A dataset that represents the union of multiple datasets.
 */
class UnionDataset {
    union;
    constructor(union) {
        this.union = union;
    }
    get schema() {
        // Find the minimal set of columns that are supported by all datasets of
        // the union
        let sch = undefined;
        this.union.forEach((ds) => {
            const dsSchema = ds.schema;
            if (sch === undefined) {
                // First time just use this one
                sch = dsSchema;
            }
            else {
                const newSch = {};
                for (const [key, kind] of Object.entries(sch)) {
                    if (key in dsSchema && dsSchema[key] === kind) {
                        newSch[key] = kind;
                    }
                }
                sch = newSch;
            }
        });
        return sch ?? {};
    }
    query(schema) {
        schema = schema ?? this.schema;
        return this.union
            .map((dataset) => dataset.query(schema))
            .join(' union all ');
    }
    optimize() {
        // Recursively optimize each dataset of this union
        const optimizedUnion = this.union.map((ds) => ds.optimize());
        // Find all source datasets and combine then based on src
        const combinedSrcSets = new Map();
        const otherDatasets = [];
        for (const e of optimizedUnion) {
            if (e instanceof SourceDataset) {
                const set = (0, utils_1.getOrCreate)(combinedSrcSets, e.src, () => []);
                set.push(e);
            }
            else {
                otherDatasets.push(e);
            }
        }
        const mergedSrcSets = Array.from(combinedSrcSets.values()).map((srcGroup) => {
            if (srcGroup.length === 1)
                return srcGroup[0];
            // Combine schema across all members in the union
            const combinedSchema = srcGroup.reduce((acc, e) => {
                Object.assign(acc, e.schema);
                return acc;
            }, {});
            // Merge filters for the same src
            const inFilters = [];
            for (const { filter } of srcGroup) {
                if (filter) {
                    if ('eq' in filter) {
                        inFilters.push({ col: filter.col, in: [filter.eq] });
                    }
                    else {
                        inFilters.push(filter);
                    }
                }
            }
            const mergedFilter = mergeFilters(inFilters);
            return new SourceDataset({
                src: srcGroup[0].src,
                schema: combinedSchema,
                filter: mergedFilter,
            });
        });
        const finalUnion = [...mergedSrcSets, ...otherDatasets];
        if (finalUnion.length === 1) {
            return finalUnion[0];
        }
        else {
            return new UnionDataset(finalUnion);
        }
    }
    implements(schema) {
        return Object.entries(schema).every(([name, kind]) => {
            return name in this.schema && this.schema[name] === kind;
        });
    }
}
exports.UnionDataset = UnionDataset;
function mergeFilters(filters) {
    if (filters.length === 0)
        return undefined;
    const col = filters[0].col;
    const values = new Set(filters.flatMap((filter) => filter.in));
    return { col, in: Array.from(values) };
}
//# sourceMappingURL=dataset.js.map