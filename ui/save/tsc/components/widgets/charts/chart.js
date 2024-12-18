"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartOption = void 0;
exports.toTitleCase = toTitleCase;
exports.renderChartComponent = renderChartComponent;
exports.createChartConfigFromSqlTableState = createChartConfigFromSqlTableState;
const tslib_1 = require("tslib");
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
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const histogram_1 = require("./histogram/histogram");
const table_1 = require("../sql/legacy_table/table");
// Holds the various chart types and human readable string
var ChartOption;
(function (ChartOption) {
    ChartOption["HISTOGRAM"] = "histogram";
})(ChartOption || (exports.ChartOption = ChartOption = {}));
function toTitleCase(s) {
    const words = s.split(/\s/);
    for (let i = 0; i < words.length; ++i) {
        words[i] = words[i][0].toUpperCase() + words[i].substring(1);
    }
    return words.join(' ');
}
// renderChartComponent will take a chart option and config and map
// to the corresponding chart class component.
function renderChartComponent(chart) {
    switch (chart.option) {
        case ChartOption.HISTOGRAM:
            return (0, mithril_1.default)(histogram_1.Histogram, chart.config);
        default:
            return;
    }
}
function createChartConfigFromSqlTableState(column, columnAlias, sqlTableState) {
    return {
        engine: sqlTableState.trace.engine,
        columnTitle: (0, table_1.columnTitle)(column),
        sqlColumn: [columnAlias],
        filters: sqlTableState?.getFilters(),
        tableDisplay: sqlTableState.config.displayName ?? sqlTableState.config.name,
        query: sqlTableState.getSqlQuery(Object.fromEntries([[columnAlias, column.primaryColumn()]])),
        aggregationType: column.aggregation?.().dataType,
    };
}
//# sourceMappingURL=chart.js.map