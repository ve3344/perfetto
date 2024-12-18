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
const tslib_1 = require("tslib");
const handlerRegistry_1 = require("./handlers/handlerRegistry");
const pluginId_1 = require("./pluginId");
const dev_perfetto_AndroidCujs_1 = tslib_1.__importDefault(require("../dev.perfetto.AndroidCujs"));
const JANK_CUJ_QUERY_PRECONDITIONS = `
  SELECT RUN_METRIC('android/android_blocking_calls_cuj_metric.sql');
`;
function getMetricsFromHash() {
    const metricVal = location.hash;
    const regex = new RegExp(`${pluginId_1.PLUGIN_ID}:metrics=(.*)`);
    const match = metricVal.match(regex);
    if (match === null) {
        return [];
    }
    const capturedString = match[1];
    let metricList = [];
    if (capturedString.includes('--')) {
        metricList = capturedString.split('--');
    }
    else {
        metricList = [capturedString];
    }
    return metricList.map((metric) => decodeURIComponent(metric));
}
let metrics;
/**
 * Plugin that adds and pins the debug track for the metric passed
 * For more context -
 * This plugin reads the names of regressed metrics from the url upon loading
 * It then checks the metric names against some handlers and if they
 * match it accordingly adds the debug tracks for them
 * This way when comparing two different perfetto traces before and after
 * the regression, the user will not have to manually search for the
 * slices related to the regressed metric
 */
class default_1 {
    static id = pluginId_1.PLUGIN_ID;
    static dependencies = [dev_perfetto_AndroidCujs_1.default];
    static onActivate() {
        metrics = getMetricsFromHash();
    }
    async onTraceLoad(ctx) {
        ctx.commands.registerCommand({
            id: 'dev.perfetto.PinAndroidPerfMetrics#PinAndroidPerfMetrics',
            name: 'Add and Pin: Jank Metric Slice',
            callback: async (metric) => {
                metric = prompt('Metrics names (separated by comma)', '');
                if (metric === null)
                    return;
                const metricList = metric.split(',');
                this.callHandlers(metricList, ctx);
            },
        });
        if (metrics.length !== 0) {
            this.callHandlers(metrics, ctx);
        }
    }
    async callHandlers(metricsList, ctx) {
        // List of metrics that actually match some handler
        const metricsToShow = this.getMetricsToShow(metricsList);
        if (metricsToShow.length === 0) {
            return;
        }
        await ctx.engine.query(JANK_CUJ_QUERY_PRECONDITIONS);
        for (const { metricData, metricHandler } of metricsToShow) {
            metricHandler.addMetricTrack(metricData, ctx);
        }
    }
    getMetricsToShow(metricList) {
        const sortedMetricList = [...metricList].sort();
        const validMetrics = [];
        const alreadyMatchedMetricData = new Set();
        for (const metric of sortedMetricList) {
            for (const metricHandler of handlerRegistry_1.METRIC_HANDLERS) {
                const metricData = metricHandler.match(metric);
                if (!metricData)
                    continue;
                const jsonMetricData = this.metricDataToJson(metricData);
                if (!alreadyMatchedMetricData.has(jsonMetricData)) {
                    alreadyMatchedMetricData.add(jsonMetricData);
                    validMetrics.push({
                        metricData: metricData,
                        metricHandler: metricHandler,
                    });
                }
            }
        }
        return validMetrics;
    }
    metricDataToJson(metricData) {
        // Used to have a deterministic keys order.
        return JSON.stringify(metricData, Object.keys(metricData).sort());
    }
}
exports.default = default_1;
//# sourceMappingURL=index.js.map