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
exports.pinBlockingCallHandlerInstance = void 0;
const metricUtils_1 = require("./metricUtils");
const dev_perfetto_AndroidCujs_1 = require("../../dev.perfetto.AndroidCujs");
const debug_tracks_1 = require("../../../components/tracks/debug_tracks");
class BlockingCallMetricHandler {
    /**
     * Match metric key & return parsed data if successful.
     *
     * @param {string} metricKey The metric key to match.
     * @returns {BlockingCallMetricData | undefined} Parsed data or undefined if no match.
     */
    match(metricKey) {
        const matcher = /perfetto_android_blocking_call-cuj-name-(?<process>.*)-name-(?<cujName>.*)-blocking_calls-name-(?<blockingCallName>([^\-]*))-(?<aggregation>.*)/;
        const match = matcher.exec(metricKey);
        if (!match?.groups) {
            return undefined;
        }
        const metricData = {
            process: (0, metricUtils_1.expandProcessName)(match.groups.process),
            cujName: match.groups.cujName,
            blockingCallName: match.groups.blockingCallName,
            aggregation: match.groups.aggregation,
        };
        return metricData;
    }
    /**
     * Adds the debug tracks for Blocking Call metrics
     *
     * @param {BlockingCallMetricData} metricData Parsed metric data for the cuj scoped jank
     * @param {Trace} ctx PluginContextTrace for trace related properties and methods
     * @returns {void} Adds one track for Jank CUJ slice and one for Janky CUJ frames
     */
    addMetricTrack(metricData, ctx) {
        this.pinSingleCuj(ctx, metricData);
        const config = this.blockingCallTrackConfig(metricData);
        (0, debug_tracks_1.addDebugSliceTrack)({ trace: ctx, ...config });
    }
    pinSingleCuj(ctx, metricData) {
        const trackName = `Jank CUJ: ${metricData.cujName}`;
        (0, dev_perfetto_AndroidCujs_1.addJankCUJDebugTrack)(ctx, trackName, metricData.cujName);
    }
    blockingCallTrackConfig(metricData) {
        const cuj = metricData.cujName;
        const processName = metricData.process;
        const blockingCallName = metricData.blockingCallName;
        // TODO: b/296349525 - Migrate jank tables from run metrics to stdlib
        const blockingCallDuringCujQuery = `
  SELECT name, ts, dur
  FROM main_thread_slices_scoped_to_cujs
  WHERE process_name = "${processName}"
      AND cuj_name = "${cuj}"
      AND name = "${blockingCallName}"
  `;
        const trackName = 'Blocking calls in ' + processName;
        return {
            data: {
                sqlSource: blockingCallDuringCujQuery,
                columns: ['name', 'ts', 'dur'],
            },
            columns: { ts: 'ts', dur: 'dur', name: 'name' },
            argColumns: ['name', 'ts', 'dur'],
            trackName,
        };
    }
}
exports.pinBlockingCallHandlerInstance = new BlockingCallMetricHandler();
//# sourceMappingURL=pinBlockingCall.js.map