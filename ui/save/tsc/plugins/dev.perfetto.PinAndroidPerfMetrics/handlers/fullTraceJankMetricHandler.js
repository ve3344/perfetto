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
exports.pinFullTraceJankInstance = void 0;
const metricUtils_1 = require("./metricUtils");
const debug_tracks_1 = require("../../../components/tracks/debug_tracks");
class FullTraceJankMetricHandler {
    /**
     * Matches metric key & return parsed data if successful.
     *
     * @param {string} metricKey The metric key to match.
     * @returns {FullTraceMetricData | undefined} Parsed data or undefined if no match.
     */
    match(metricKey) {
        const matcher = /perfetto_ft_(?<process>.*)-missed_(?<jankType>frames|sf_frames|app_frames)/;
        const match = matcher.exec(metricKey);
        if (!match?.groups) {
            return undefined;
        }
        const metricData = {
            process: (0, metricUtils_1.expandProcessName)(match.groups.process),
            jankType: match.groups.jankType,
        };
        return metricData;
    }
    /**
     * Adds the debug track for full trace jank metrics
     *
     * @param {FullTraceMetricData} metricData Parsed metric data for the full trace jank
     * @param {Trace} ctx PluginContextTrace for trace related properties and methods
     * @returns {void} Adds one track for Jank slice
     */
    async addMetricTrack(metricData, ctx) {
        const INCLUDE_PREQUERY = `
    INCLUDE PERFETTO MODULE android.frames.jank_type;
    INCLUDE PERFETTO MODULE slices.slices;
    `;
        const config = this.fullTraceJankConfig(metricData);
        await ctx.engine.query(INCLUDE_PREQUERY);
        (0, debug_tracks_1.addDebugSliceTrack)({ trace: ctx, ...config });
    }
    fullTraceJankConfig(metricData) {
        let jankTypeFilter;
        let jankTypeDisplayName;
        if (metricData.jankType?.includes('app')) {
            jankTypeFilter = ' android_is_app_jank_type(display_value)';
            jankTypeDisplayName = 'app';
        }
        else if (metricData.jankType?.includes('sf')) {
            jankTypeFilter = ' android_is_sf_jank_type(display_value)';
            jankTypeDisplayName = 'sf';
        }
        else {
            jankTypeFilter = " display_value != 'None'";
            jankTypeDisplayName = 'all';
        }
        const processName = metricData.process;
        // TODO: b/324245198 - Refactor when jank_type added to android_frame_stats
        const fullTraceJankQuery = `
      WITH filtered_args AS (
        SELECT DISTINCT arg_set_id
        FROM args
        WHERE key = 'Jank type'
        ${jankTypeFilter ? 'AND ' + jankTypeFilter : ''}
      )
      SELECT
        name,
        ts as ts,
        dur as dur,
        track_id as track_id,
        id as slice_id,
        thread_dur as thread_dur,
        category,
        thread_name,
        tid as tid,
        process_name,
        pid as pid
      FROM _slice_with_thread_and_process_info
      JOIN filtered_args ON filtered_args.arg_set_id = _slice_with_thread_and_process_info.arg_set_id
      WHERE process_name = '${processName}'`;
        const fullTraceJankColumns = [
            'name',
            'ts',
            'dur',
            'track_id',
            'slice_id',
            'thread_dur',
            'category',
            'thread_name',
            'tid',
            'process_name',
            'pid',
        ];
        const trackName = jankTypeDisplayName + ' missed frames in ' + processName;
        return {
            data: {
                sqlSource: fullTraceJankQuery,
                columns: fullTraceJankColumns,
            },
            columns: { ts: 'ts', dur: 'dur', name: 'name' },
            argColumns: fullTraceJankColumns,
            tableName: trackName,
        };
    }
}
exports.pinFullTraceJankInstance = new FullTraceJankMetricHandler();
//# sourceMappingURL=fullTraceJankMetricHandler.js.map