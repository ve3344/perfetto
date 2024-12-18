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
const query_counter_track_1 = require("../../components/tracks/query_counter_track");
const track_kinds_1 = require("../../public/track_kinds");
const workspace_1 = require("../../public/workspace");
const query_result_1 = require("../../trace_processor/query_result");
class default_1 {
    static id = 'com.google.PixelCpmTrace';
    async onTraceLoad(ctx) {
        const group = new workspace_1.TrackNode({
            title: 'Central Power Manager',
            isSummary: true,
        });
        const { engine } = ctx;
        const result = await engine.query(`
      select
        id AS trackId,
        extract_arg(dimension_arg_set_id, 'name') AS trackName
      FROM track
      WHERE classification = 'pixel_cpm_trace'
      ORDER BY trackName
    `);
        const it = result.iter({ trackId: query_result_1.NUM, trackName: query_result_1.STR });
        for (let groupAdded = false; it.valid(); it.next()) {
            const { trackId, trackName } = it;
            const uri = `/cpm_trace_${trackName}`;
            const track = await (0, query_counter_track_1.createQueryCounterTrack)({
                trace: ctx,
                uri,
                data: {
                    sqlSource: `
             select ts, value
             from counter
             where track_id = ${trackId}
           `,
                    columns: ['ts', 'value'],
                },
                columns: { ts: 'ts', value: 'value' },
            });
            ctx.tracks.registerTrack({
                uri,
                title: trackName,
                tags: {
                    kind: track_kinds_1.COUNTER_TRACK_KIND,
                    trackIds: [trackId],
                },
                track,
            });
            group.addChildInOrder(new workspace_1.TrackNode({ uri, title: trackName }));
            if (!groupAdded) {
                ctx.workspace.addChildInOrder(group);
                groupAdded = true;
            }
        }
    }
}
exports.default = default_1;
//# sourceMappingURL=index.js.map