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
exports.pinCujInstance = void 0;
const dev_perfetto_AndroidCujs_1 = require("../../dev.perfetto.AndroidCujs");
/** Pins a single CUJ from CUJ scoped metrics. */
class PinCujMetricHandler {
    /**
     * Matches metric key & return parsed data if successful.
     *
     * @param {string} metricKey The metric key to match.
     * @returns {CujMetricData | undefined} Parsed data or undefined if no match.
     */
    match(metricKey) {
        const matcher = /perfetto_cuj_(?<process>.*)-(?<cujName>.*)-.*-missed_.*/;
        const match = matcher.exec(metricKey);
        if (!match?.groups) {
            return undefined;
        }
        return {
            cujName: match.groups.cujName,
        };
    }
    /**
     * Adds the debug tracks for cuj Scoped jank metrics
     *
     * @param {CujMetricData} metricData Parsed metric data for the cuj scoped jank
     * @param {Trace} ctx PluginContextTrace for trace related properties and methods
     * @returns {void} Adds one track for Jank CUJ slice and one for Janky CUJ frames
     */
    async addMetricTrack(metricData, ctx) {
        this.pinSingleCuj(ctx, metricData.cujName);
    }
    pinSingleCuj(ctx, cujName) {
        const trackName = `Jank CUJ: ${cujName}`;
        (0, dev_perfetto_AndroidCujs_1.addJankCUJDebugTrack)(ctx, trackName, cujName);
    }
}
exports.pinCujInstance = new PinCujMetricHandler();
//# sourceMappingURL=pinCujMetricHandler.js.map