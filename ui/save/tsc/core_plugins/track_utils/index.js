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
const omnibox_manager_1 = require("../../core/omnibox_manager");
const app_impl_1 = require("../../core/app_impl");
const utils_1 = require("../../public/utils");
const utils_2 = require("../../base/utils");
const query_result_1 = require("../../trace_processor/query_result");
class default_1 {
    static id = 'perfetto.TrackUtils';
    async onTraceLoad(ctx) {
        ctx.commands.registerCommand({
            id: 'perfetto.RunQueryInSelectedTimeWindow',
            name: `Run query in selected time window`,
            callback: async () => {
                const window = await (0, utils_1.getTimeSpanOfSelectionOrVisibleWindow)(ctx);
                const omnibox = app_impl_1.AppImpl.instance.omnibox;
                omnibox.setMode(omnibox_manager_1.OmniboxMode.Query);
                omnibox.setText(`select  where ts >= ${window.start} and ts < ${window.end}`);
                omnibox.focus(/* cursorPlacement= */ 7);
            },
        });
        ctx.commands.registerCommand({
            id: 'perfetto.FindTrackByName',
            name: 'Find track by name',
            callback: async () => {
                const tracksWithUris = ctx.workspace.flatTracksOrdered.filter((track) => track.uri !== undefined);
                const track = await ctx.omnibox.prompt('Choose a track...', {
                    values: tracksWithUris,
                    getName: (track) => track.title,
                });
                track &&
                    ctx.selection.selectTrack(track.uri, {
                        scrollToSelection: true,
                    });
            },
        });
        ctx.commands.registerCommand({
            id: 'perfetto.FindTrackByUri',
            name: 'Find track by URI',
            callback: async () => {
                const tracksWithUris = ctx.workspace.flatTracksOrdered.filter((track) => track.uri !== undefined);
                const track = await ctx.omnibox.prompt('Choose a track...', {
                    values: tracksWithUris,
                    getName: (track) => track.uri,
                });
                track &&
                    ctx.selection.selectTrack(track.uri, {
                        scrollToSelection: true,
                    });
            },
        });
        ctx.commands.registerCommand({
            id: 'perfetto.PinTrackByName',
            name: 'Pin track by name',
            callback: async () => {
                const tracksWithUris = ctx.workspace.flatTracksOrdered.filter((track) => track.uri !== undefined);
                const track = await ctx.omnibox.prompt('Choose a track...', {
                    values: tracksWithUris,
                    getName: (track) => track.title,
                });
                track && track.pin();
            },
        });
        ctx.commands.registerCommand({
            id: 'perfetto.SelectNextTrackEvent',
            name: 'Select next track event',
            defaultHotkey: '.',
            callback: async () => {
                await selectAdjacentTrackEvent(ctx, 'next');
            },
        });
        ctx.commands.registerCommand({
            id: 'perfetto.SelectPreviousTrackEvent',
            name: 'Select previous track event',
            defaultHotkey: ',',
            callback: async () => {
                await selectAdjacentTrackEvent(ctx, 'prev');
            },
        });
    }
}
exports.default = default_1;
/**
 * If a track event is currently selected, select the next or previous event on
 * that same track chronologically ordered by `ts`.
 */
async function selectAdjacentTrackEvent(ctx, direction) {
    const selection = ctx.selection.selection;
    if (selection.kind !== 'track_event')
        return;
    const td = ctx.tracks.getTrack(selection.trackUri);
    const dataset = td?.track.getDataset?.();
    if (!dataset || !dataset.implements({ id: query_result_1.NUM, ts: query_result_1.LONG }))
        return;
    const windowFunc = direction === 'next' ? 'LEAD' : 'LAG';
    const result = await ctx.engine.query(`
      WITH
        CTE AS (
          SELECT
            id,
            ${windowFunc}(id) OVER (ORDER BY ts) AS resultId
          FROM (${dataset.query()})
        )
      SELECT * FROM CTE WHERE id = ${selection.eventId}
    `);
    const resultId = result.maybeFirstRow({ resultId: query_result_1.NUM_NULL })?.resultId;
    if (!(0, utils_2.exists)(resultId))
        return;
    ctx.selection.selectTrackEvent(selection.trackUri, resultId, {
        scrollToSelection: true,
    });
}
//# sourceMappingURL=index.js.map