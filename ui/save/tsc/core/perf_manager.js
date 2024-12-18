"use strict";
// Copyright (C) 2018 The Android Open Source Project
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
exports.PerfManager = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const raf_scheduler_1 = require("./raf_scheduler");
const perf_stats_1 = require("./perf_stats");
class PerfManager {
    _enabled = false;
    containers = [];
    get enabled() {
        return this._enabled;
    }
    set enabled(enabled) {
        this._enabled = enabled;
        raf_scheduler_1.raf.setPerfStatsEnabled(true);
        this.containers.forEach((c) => c.setPerfStatsEnabled(enabled));
    }
    addContainer(container) {
        this.containers.push(container);
        return {
            [Symbol.dispose]: () => {
                const i = this.containers.indexOf(container);
                this.containers.splice(i, 1);
            },
        };
    }
    renderPerfStats() {
        if (!this._enabled)
            return;
        // The rendering of the perf stats UI is atypical. The main issue is that we
        // want to redraw the mithril component even if there is no full DOM redraw
        // happening (and we don't want to force redraws as a side effect). So we
        // return here just a container and handle its rendering ourselves.
        const perfMgr = this;
        let removed = false;
        return (0, mithril_1.default)('.perf-stats', {
            oncreate(vnode) {
                const animationFrame = (dom) => {
                    if (removed)
                        return;
                    mithril_1.default.render(dom, (0, mithril_1.default)(PerfStatsUi, { perfMgr }));
                    requestAnimationFrame(() => animationFrame(dom));
                };
                animationFrame(vnode.dom);
            },
            onremove() {
                removed = true;
            },
        });
    }
}
exports.PerfManager = PerfManager;
class PerfStatsUi {
    view({ attrs }) {
        return (0, mithril_1.default)('.perf-stats', {}, (0, mithril_1.default)('section', this.renderRafSchedulerStats()), (0, mithril_1.default)('button.close-button', {
            onclick: () => (attrs.perfMgr.enabled = false),
        }, (0, mithril_1.default)('i.material-icons', 'close')), attrs.perfMgr.containers.map((c, i) => (0, mithril_1.default)('section', (0, mithril_1.default)('div', `Panel Container ${i + 1}`), c.renderPerfStats())));
    }
    renderRafSchedulerStats() {
        return (0, mithril_1.default)('div', (0, mithril_1.default)('div', [
            (0, mithril_1.default)('button', { onclick: () => raf_scheduler_1.raf.scheduleCanvasRedraw() }, 'Do Canvas Redraw'),
            '   |   ',
            (0, mithril_1.default)('button', { onclick: () => raf_scheduler_1.raf.scheduleFullRedraw() }, 'Do Full Redraw'),
        ]), (0, mithril_1.default)('div', 'Raf Timing ' + '(Total may not add up due to imprecision)'), (0, mithril_1.default)('table', this.statTableHeader(), this.statTableRow('Actions', raf_scheduler_1.raf.perfStats.rafActions), this.statTableRow('Dom', raf_scheduler_1.raf.perfStats.rafDom), this.statTableRow('Canvas', raf_scheduler_1.raf.perfStats.rafCanvas), this.statTableRow('Total', raf_scheduler_1.raf.perfStats.rafTotal)), (0, mithril_1.default)('div', 'Dom redraw: ' +
            `Count: ${raf_scheduler_1.raf.perfStats.domRedraw.count} | ` +
            (0, perf_stats_1.runningStatStr)(raf_scheduler_1.raf.perfStats.domRedraw)));
    }
    statTableHeader() {
        return (0, mithril_1.default)('tr', (0, mithril_1.default)('th', ''), (0, mithril_1.default)('th', 'Last (ms)'), (0, mithril_1.default)('th', 'Avg (ms)'), (0, mithril_1.default)('th', 'Avg-10 (ms)'));
    }
    statTableRow(title, stat) {
        return (0, mithril_1.default)('tr', (0, mithril_1.default)('td', title), (0, mithril_1.default)('td', stat.last.toFixed(2)), (0, mithril_1.default)('td', stat.mean.toFixed(2)), (0, mithril_1.default)('td', stat.bufferMean.toFixed(2)));
    }
}
//# sourceMappingURL=perf_manager.js.map