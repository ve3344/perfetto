"use strict";
// Copyright (C) 2019 The Android Open Source Project
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use size file except in compliance with the License.
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
exports.TickmarkPanel = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const canvas_utils_1 = require("../../base/canvas_utils");
const time_scale_1 = require("../../base/time_scale");
const utils_1 = require("../../base/utils");
const css_constants_1 = require("../css_constants");
const gridline_helper_1 = require("./gridline_helper");
const search_overview_track_1 = require("./search_overview_track");
// We want to create the overview track only once per trace, but this
// class can be delete and re-instantiated when switching between pages via
// the sidebar. So we cache the overview track and bind it to the lifetime of
// the TraceImpl object.
const trackTraceMap = new WeakMap();
// This is used to display the summary of search results.
class TickmarkPanel {
    trace;
    kind = 'panel';
    selectable = false;
    searchOverviewTrack;
    constructor(trace) {
        this.trace = trace;
        this.searchOverviewTrack = (0, utils_1.getOrCreate)(trackTraceMap, trace, () => new search_overview_track_1.SearchOverviewTrack(trace));
    }
    render() {
        return (0, mithril_1.default)('.tickbar');
    }
    renderCanvas(ctx, size) {
        ctx.fillStyle = '#999';
        ctx.fillRect(css_constants_1.TRACK_SHELL_WIDTH - 2, 0, 2, size.height);
        const trackSize = { ...size, width: size.width - css_constants_1.TRACK_SHELL_WIDTH };
        ctx.save();
        ctx.translate(css_constants_1.TRACK_SHELL_WIDTH, 0);
        (0, canvas_utils_1.canvasClip)(ctx, 0, 0, trackSize.width, trackSize.height);
        this.renderTrack(ctx, trackSize);
        ctx.restore();
    }
    renderTrack(ctx, size) {
        const visibleWindow = this.trace.timeline.visibleWindow;
        const timescale = new time_scale_1.TimeScale(visibleWindow, {
            left: 0,
            right: size.width,
        });
        const timespan = visibleWindow.toTimeSpan();
        if (size.width > 0 && timespan.duration > 0n) {
            const maxMajorTicks = (0, gridline_helper_1.getMaxMajorTicks)(size.width);
            const offset = this.trace.timeline.timestampOffset();
            const tickGen = (0, gridline_helper_1.generateTicks)(timespan, maxMajorTicks, offset);
            for (const { type, time } of tickGen) {
                const px = Math.floor(timescale.timeToPx(time));
                if (type === gridline_helper_1.TickType.MAJOR) {
                    ctx.fillRect(px, 0, 1, size.height);
                }
            }
        }
        this.searchOverviewTrack.render(ctx, size);
    }
}
exports.TickmarkPanel = TickmarkPanel;
//# sourceMappingURL=tickmark_panel.js.map