"use strict";
// Copyright (C) 2020 The Android Open Source Project
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
exports.MetricsPage = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const result_1 = require("../../base/result");
const query_result_1 = require("../../trace_processor/query_result");
const select_1 = require("../../widgets/select");
const spinner_1 = require("../../widgets/spinner");
const vega_view_1 = require("../../components/widgets/vega_view");
const logging_1 = require("../../base/logging");
const FORMATS = ['json', 'prototext', 'proto'];
async function getMetrics(engine) {
    const metrics = [];
    const metricsResult = await engine.query('select name from trace_metrics');
    for (const it = metricsResult.iter({ name: query_result_1.STR }); it.valid(); it.next()) {
        metrics.push(it.name);
    }
    return metrics;
}
async function getMetric(engine, metric, format) {
    const result = await engine.computeMetric([metric], format);
    if (result instanceof Uint8Array) {
        return `Uint8Array<len=${result.length}>`;
    }
    else {
        return result;
    }
}
class MetricsController {
    trace;
    engine;
    _metrics;
    _selected;
    _result;
    _format;
    _json;
    constructor(trace) {
        this.trace = trace;
        this.engine = trace.engine.getProxy('MetricsPage');
        this._metrics = [];
        this._result = (0, result_1.okResult)('');
        this._json = {};
        this._format = 'json';
        getMetrics(this.engine).then((metrics) => {
            this._metrics = metrics;
        });
    }
    get metrics() {
        return this._metrics;
    }
    get visualisations() {
        return this.trace.plugins
            .metricVisualisations()
            .filter((v) => v.metric === this.selected);
    }
    set selected(metric) {
        if (this._selected === metric) {
            return;
        }
        this._selected = metric;
        this.update();
    }
    get selected() {
        return this._selected;
    }
    set format(format) {
        if (this._format === format) {
            return;
        }
        this._format = format;
        this.update();
    }
    get format() {
        return this._format;
    }
    get result() {
        return this._result;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get resultAsJson() {
        return this._json;
    }
    update() {
        const selected = this._selected;
        const format = this._format;
        if (selected === undefined) {
            this._result = (0, result_1.okResult)('');
            this._json = {};
        }
        else {
            this._result = 'pending';
            this._json = {};
            getMetric(this.engine, selected, format)
                .then((result) => {
                if (this._selected === selected && this._format === format) {
                    this._result = (0, result_1.okResult)(result);
                    if (format === 'json') {
                        this._json = JSON.parse(result);
                    }
                }
            })
                .catch((e) => {
                if (this._selected === selected && this._format === format) {
                    this._result = (0, result_1.errResult)(e);
                    this._json = {};
                }
            })
                .finally(() => {
                this.trace.scheduleFullRedraw();
            });
        }
        this.trace.scheduleFullRedraw();
    }
}
class MetricResultView {
    view({ attrs }) {
        const result = attrs.result;
        if (result === 'pending') {
            return (0, mithril_1.default)(spinner_1.Spinner);
        }
        if (!result.ok) {
            return (0, mithril_1.default)('pre.metric-error', result.error);
        }
        return (0, mithril_1.default)('pre', result.value);
    }
}
class MetricPicker {
    view({ attrs }) {
        const { controller } = attrs;
        return (0, mithril_1.default)('.metrics-page-picker', (0, mithril_1.default)(select_1.Select, {
            value: controller.selected,
            oninput: (e) => {
                if (!e.target)
                    return;
                controller.selected = e.target.value;
            },
        }, controller.metrics.map((metric) => (0, mithril_1.default)('option', {
            value: metric,
            key: metric,
        }, metric))), (0, mithril_1.default)(select_1.Select, {
            oninput: (e) => {
                if (!e.target)
                    return;
                controller.format = e.target.value;
            },
        }, FORMATS.map((f) => {
            return (0, mithril_1.default)('option', {
                selected: controller.format === f,
                key: f,
                value: f,
                label: f,
            });
        })));
    }
}
class MetricVizView {
    view({ attrs }) {
        return (0, mithril_1.default)('', (0, mithril_1.default)(vega_view_1.VegaView, {
            spec: attrs.visualisation.spec,
            data: {
                metric: attrs.data,
            },
        }));
    }
}
class MetricsPage {
    controller;
    oninit({ attrs }) {
        this.controller = new MetricsController(attrs.trace);
    }
    view() {
        const controller = (0, logging_1.assertExists)(this.controller);
        const json = controller.resultAsJson;
        return (0, mithril_1.default)('.metrics-page', (0, mithril_1.default)(MetricPicker, {
            controller,
        }), controller.format === 'json' &&
            controller.visualisations.map((visualisation) => {
                let data = json;
                for (const p of visualisation.path) {
                    data = data[p] ?? [];
                }
                return (0, mithril_1.default)(MetricVizView, { visualisation, data });
            }), (0, mithril_1.default)(MetricResultView, { result: controller.result }));
    }
}
exports.MetricsPage = MetricsPage;
//# sourceMappingURL=metrics_page.js.map