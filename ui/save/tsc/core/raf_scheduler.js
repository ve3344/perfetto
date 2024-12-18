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
exports.raf = exports.RafScheduler = exports.AUTOREDRAW_FLAG = void 0;
const tslib_1 = require("tslib");
const perf_stats_1 = require("./perf_stats");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const feature_flags_1 = require("./feature_flags");
exports.AUTOREDRAW_FLAG = feature_flags_1.featureFlags.register({
    id: 'mithrilAutoredraw',
    name: 'Enable Mithril autoredraw',
    description: 'Turns calls to schedulefullRedraw() a no-op',
    defaultValue: true,
});
// This class orchestrates all RAFs in the UI. It ensures that there is only
// one animation frame handler overall and that callbacks are called in
// predictable order. There are two types of callbacks here:
// - actions (e.g. pan/zoon animations), which will alter the "fast"
//  (main-thread-only) state (e.g. update visible time bounds @ 60 fps).
// - redraw callbacks that will repaint canvases.
// This class guarantees that, on each frame, redraw callbacks are called after
// all action callbacks.
class RafScheduler {
    // These happen at the beginning of any animation frame. Used by Animation.
    animationCallbacks = new Set();
    // These happen during any animaton frame, after the (optional) DOM redraw.
    canvasRedrawCallbacks = new Set();
    // These happen at the end of full (DOM) animation frames.
    postRedrawCallbacks = new Array();
    hasScheduledNextFrame = false;
    requestedFullRedraw = false;
    isRedrawing = false;
    _shutdown = false;
    recordPerfStats = false;
    mounts = new Map();
    perfStats = {
        rafActions: new perf_stats_1.PerfStats(),
        rafCanvas: new perf_stats_1.PerfStats(),
        rafDom: new perf_stats_1.PerfStats(),
        rafTotal: new perf_stats_1.PerfStats(),
        domRedraw: new perf_stats_1.PerfStats(),
    };
    constructor() {
        // Patch m.redraw() to our RAF full redraw.
        const origSync = mithril_1.default.redraw.sync;
        const redrawFn = () => this.scheduleFullRedraw('force');
        redrawFn.sync = origSync;
        mithril_1.default.redraw = redrawFn;
        mithril_1.default.mount = this.mount.bind(this);
    }
    // Schedule re-rendering of virtual DOM and canvas.
    // If a callback is passed it will be executed after the DOM redraw has
    // completed.
    scheduleFullRedraw(force, cb) {
        // If we are using autoredraw mode, make this function a no-op unless
        // 'force' is passed.
        if (exports.AUTOREDRAW_FLAG.get() && force !== 'force')
            return;
        this.requestedFullRedraw = true;
        cb && this.postRedrawCallbacks.push(cb);
        this.maybeScheduleAnimationFrame(true);
    }
    // Schedule re-rendering of canvas only.
    scheduleCanvasRedraw() {
        this.maybeScheduleAnimationFrame(true);
    }
    startAnimation(cb) {
        this.animationCallbacks.add(cb);
        this.maybeScheduleAnimationFrame();
    }
    stopAnimation(cb) {
        this.animationCallbacks.delete(cb);
    }
    addCanvasRedrawCallback(cb) {
        this.canvasRedrawCallbacks.add(cb);
        const canvasRedrawCallbacks = this.canvasRedrawCallbacks;
        return {
            [Symbol.dispose]() {
                canvasRedrawCallbacks.delete(cb);
            },
        };
    }
    mount(element, component) {
        const mounts = this.mounts;
        if (component === null) {
            mounts.delete(element);
        }
        else {
            mounts.set(element, component);
        }
        this.syncDomRedrawMountEntry(element, component);
    }
    shutdown() {
        this._shutdown = true;
    }
    setPerfStatsEnabled(enabled) {
        this.recordPerfStats = enabled;
        this.scheduleFullRedraw();
    }
    get hasPendingRedraws() {
        return this.isRedrawing || this.hasScheduledNextFrame;
    }
    syncDomRedraw() {
        const redrawStart = performance.now();
        for (const [element, component] of this.mounts.entries()) {
            this.syncDomRedrawMountEntry(element, component);
        }
        if (this.recordPerfStats) {
            this.perfStats.domRedraw.addValue(performance.now() - redrawStart);
        }
    }
    syncDomRedrawMountEntry(element, component) {
        // Mithril's render() function takes a third argument which tells us if a
        // further redraw is needed (e.g. due to managed event handler). This allows
        // us to implement auto-redraw. The redraw argument is documented in the
        // official Mithril docs but is just not part of the @types/mithril package.
        const mithrilRender = mithril_1.default.render;
        mithrilRender(element, component !== null ? (0, mithril_1.default)(component) : null, exports.AUTOREDRAW_FLAG.get() ? () => exports.raf.scheduleFullRedraw('force') : undefined);
    }
    syncCanvasRedraw() {
        const redrawStart = performance.now();
        if (this.isRedrawing)
            return;
        this.isRedrawing = true;
        this.canvasRedrawCallbacks.forEach((cb) => cb());
        this.isRedrawing = false;
        if (this.recordPerfStats) {
            this.perfStats.rafCanvas.addValue(performance.now() - redrawStart);
        }
    }
    maybeScheduleAnimationFrame(force = false) {
        if (this.hasScheduledNextFrame)
            return;
        if (this.animationCallbacks.size !== 0 || force) {
            this.hasScheduledNextFrame = true;
            window.requestAnimationFrame(this.onAnimationFrame.bind(this));
        }
    }
    onAnimationFrame(lastFrameMs) {
        if (this._shutdown)
            return;
        this.hasScheduledNextFrame = false;
        const doFullRedraw = this.requestedFullRedraw;
        this.requestedFullRedraw = false;
        const tStart = performance.now();
        this.animationCallbacks.forEach((cb) => cb(lastFrameMs));
        const tAnim = performance.now();
        doFullRedraw && this.syncDomRedraw();
        const tDom = performance.now();
        this.syncCanvasRedraw();
        const tCanvas = performance.now();
        const animTime = tAnim - tStart;
        const domTime = tDom - tAnim;
        const canvasTime = tCanvas - tDom;
        const totalTime = tCanvas - tStart;
        this.updatePerfStats(animTime, domTime, canvasTime, totalTime);
        this.maybeScheduleAnimationFrame();
        if (doFullRedraw && this.postRedrawCallbacks.length > 0) {
            const pendingCbs = this.postRedrawCallbacks.splice(0); // splice = clear.
            pendingCbs.forEach((cb) => cb());
        }
    }
    updatePerfStats(actionsTime, domTime, canvasTime, totalRafTime) {
        if (!this.recordPerfStats)
            return;
        this.perfStats.rafActions.addValue(actionsTime);
        this.perfStats.rafDom.addValue(domTime);
        this.perfStats.rafCanvas.addValue(canvasTime);
        this.perfStats.rafTotal.addValue(totalRafTime);
    }
}
exports.RafScheduler = RafScheduler;
exports.raf = new RafScheduler();
//# sourceMappingURL=raf_scheduler.js.map