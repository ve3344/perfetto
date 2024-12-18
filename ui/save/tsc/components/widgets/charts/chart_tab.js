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
exports.ChartTab = void 0;
exports.addChartTab = addChartTab;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const details_shell_1 = require("../../../widgets/details_shell");
const column_1 = require("../sql/legacy_table/column");
const add_ephemeral_tab_1 = require("../../details/add_ephemeral_tab");
const chart_1 = require("./chart");
function addChartTab(chart) {
    (0, add_ephemeral_tab_1.addEphemeralTab)('histogramTab', new ChartTab(chart));
}
class ChartTab {
    chart;
    constructor(chart) {
        this.chart = chart;
    }
    render() {
        return (0, mithril_1.default)(details_shell_1.DetailsShell, {
            title: this.getTitle(),
            description: this.getDescription(),
        }, (0, chart_1.renderChartComponent)(this.chart));
    }
    getTitle() {
        return `${(0, chart_1.toTitleCase)(this.chart.config.columnTitle)} Histogram`;
    }
    getDescription() {
        let desc = `Count distribution for ${this.chart.config.tableDisplay ?? ''} table`;
        if (this.chart.config.filters && this.chart.config.filters.length > 0) {
            desc += ' where ';
            desc += this.chart.config.filters.map((f) => (0, column_1.filterTitle)(f)).join(', ');
        }
        return desc;
    }
}
exports.ChartTab = ChartTab;
//# sourceMappingURL=chart_tab.js.map