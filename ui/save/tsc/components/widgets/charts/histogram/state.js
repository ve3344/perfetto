"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistogramState = void 0;
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
// import {stringifyJsonWithBigints} from '../../../../base/json_utils';
const raf_scheduler_1 = require("../../../../core/raf_scheduler");
class HistogramState {
    engine;
    query;
    columns;
    aggregationType;
    data;
    spec;
    constructor(engine, query, columns, aggregationType) {
        this.engine = engine;
        this.query = query;
        this.columns = columns;
        this.aggregationType = aggregationType;
        this.loadData();
    }
    createHistogramVegaSpec() {
        const binAxisEncoding = {
            bin: this.aggregationType !== 'nominal',
            field: this.columns[0],
            type: this.aggregationType,
            title: this.columns[0],
            sort: this.aggregationType === 'nominal' && {
                op: 'count',
                order: 'descending',
            },
            axis: {
                labelLimit: 500,
            },
        };
        const countAxisEncoding = {
            aggregate: 'count',
            title: 'Count',
        };
        const spec = {
            $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
            width: 'container',
            mark: 'bar',
            data: {
                values: this.data?.rows,
            },
            encoding: {
                x: this.aggregationType !== 'nominal'
                    ? binAxisEncoding
                    : countAxisEncoding,
                y: this.aggregationType !== 'nominal'
                    ? countAxisEncoding
                    : binAxisEncoding,
            },
        };
        return spec;
    }
    async loadData() {
        const res = await this.engine.query(`
      SELECT ${this.columns[0]}
      FROM (
        ${this.query}
      )
    `);
        const rows = [];
        let hasQuantitativeData = false;
        for (const it = res.iter({}); it.valid(); it.next()) {
            const rowVal = it.get(this.columns[0]);
            if (typeof rowVal === 'bigint') {
                hasQuantitativeData = true;
            }
            rows.push({
                [this.columns[0]]: rowVal,
            });
        }
        if (this.aggregationType === undefined) {
            this.aggregationType = hasQuantitativeData ? 'quantitative' : 'nominal';
        }
        this.data = {
            rows,
        };
        this.spec = this.createHistogramVegaSpec();
        raf_scheduler_1.raf.scheduleFullRedraw();
    }
    isLoading() {
        return this.data === undefined;
    }
}
exports.HistogramState = HistogramState;
//# sourceMappingURL=state.js.map