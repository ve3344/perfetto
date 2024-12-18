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
exports.pinCujScopedJankInstance = void 0;
const metricUtils_1 = require("./metricUtils");
const query_result_1 = require("../../../trace_processor/query_result");
// TODO(primiano): make deps check stricter, we shouldn't allow plugins to
// depend on each other.
const trackUtils_1 = require("../../dev.perfetto.AndroidCujs/trackUtils");
const debug_tracks_1 = require("../../../components/tracks/debug_tracks");
const ENABLE_FOCUS_ON_FIRST_JANK = true;
class PinCujScopedJank {
    /**
     * Matches metric key & return parsed data if successful.
     *
     * @param {string} metricKey The metric key to match.
     * @returns {CujScopedMetricData | undefined} Parsed data or undefined if no match.
     */
    match(metricKey) {
        const matcher = /perfetto_cuj_(?<process>.*)-(?<cujName>.*)-.*-missed_(?<jankType>frames|sf_frames|app_frames)/;
        const match = matcher.exec(metricKey);
        if (!match?.groups) {
            return undefined;
        }
        const metricData = {
            process: (0, metricUtils_1.expandProcessName)(match.groups.process),
            cujName: match.groups.cujName,
            jankType: match.groups.jankType,
        };
        return metricData;
        1;
    }
    /**
     * Adds the debug tracks for cuj Scoped jank metrics.
     *
     * @param {CujScopedMetricData} metricData Parsed metric data for the cuj scoped jank
     * @param {Trace} ctx PluginContextTrace for trace related properties and methods
     * @returns {void} Adds one track for Jank CUJ slice and one for Janky CUJ frames
     */
    async addMetricTrack(metricData, ctx) {
        // TODO: b/349502258 - Refactor to single API
        const { tableName, ...config } = await this.cujScopedTrackConfig(metricData, ctx);
        (0, debug_tracks_1.addDebugSliceTrack)({ trace: ctx, ...config });
        if (ENABLE_FOCUS_ON_FIRST_JANK) {
            await this.focusOnFirstJank(ctx, tableName);
        }
    }
    async cujScopedTrackConfig(metricData, ctx) {
        let jankTypeFilter;
        let jankTypeDisplayName = 'all';
        if (metricData.jankType?.includes('app')) {
            jankTypeFilter = ' AND app_missed > 0';
            jankTypeDisplayName = 'app';
        }
        else if (metricData.jankType?.includes('sf')) {
            jankTypeFilter = ' AND sf_missed > 0';
            jankTypeDisplayName = 'sf';
        }
        const cuj = metricData.cujName;
        const processName = metricData.process;
        const tableWithJankyFramesName = `_janky_frames_during_cuj_from_metric_key_${Math.floor(Math.random() * 1_000_000)}`;
        const createJankyCujFrameTable = `
      CREATE OR REPLACE PERFETTO TABLE ${tableWithJankyFramesName} AS
      SELECT
        f.vsync as id,
        f.ts AS ts,
        f.dur as dur
      FROM android_jank_cuj_frame f LEFT JOIN android_jank_cuj cuj USING (cuj_id)
      WHERE cuj.process_name = "${processName}"
      AND cuj_name = "${cuj}" ${jankTypeFilter}
    `;
        await ctx.engine.query(createJankyCujFrameTable);
        const jankyFramesDuringCujQuery = `
      SELECT id, ts, dur
      FROM ${tableWithJankyFramesName}
    `;
        const trackName = jankTypeDisplayName + ' missed frames in ' + processName;
        const cujScopedJankSlice = {
            data: {
                sqlSource: jankyFramesDuringCujQuery,
                columns: ['id', 'ts', 'dur'],
            },
            columns: { ts: 'ts', dur: 'dur', name: 'id' },
            argColumns: ['id', 'ts', 'dur'],
            trackName,
        };
        return {
            ...cujScopedJankSlice,
            tableName: tableWithJankyFramesName,
        };
    }
    async focusOnFirstJank(ctx, tableWithJankyFramesName) {
        const queryForFirstJankyFrame = `
      SELECT id as slice_id, track_id
      FROM actual_frame_timeline_slice
      WHERE name = cast_string!(
        (SELECT id FROM ${tableWithJankyFramesName} LIMIT 1)
      );
    `;
        const queryResult = await ctx.engine.query(queryForFirstJankyFrame);
        if (queryResult.numRows() === 0) {
            return;
        }
        const row = queryResult.firstRow({
            slice_id: query_result_1.NUM,
            track_id: query_result_1.NUM,
        });
        (0, trackUtils_1.focusOnSlice)(ctx, row.slice_id);
    }
}
exports.pinCujScopedJankInstance = new PinCujScopedJank();
//# sourceMappingURL=pinCujScoped.js.map