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
const query_result_1 = require("../../trace_processor/query_result");
const query_slice_track_1 = require("../../components/tracks/query_slice_track");
const workspace_1 = require("../../public/workspace");
const optimizations_1 = require("./optimizations");
class default_1 {
    static id = 'dev.perfetto.AndroidStartup';
    async onTraceLoad(ctx) {
        const e = ctx.engine;
        await e.query(`
          include perfetto module android.startup.startups;
          include perfetto module android.startup.startup_breakdowns;
         `);
        const cnt = await e.query('select count() cnt from android_startups');
        if (cnt.firstRow({ cnt: query_result_1.LONG }).cnt === 0n) {
            return;
        }
        const trackSource = `
          SELECT l.ts AS ts, l.dur AS dur, l.package AS name
          FROM android_startups l
    `;
        const trackBreakdownSource = `
        SELECT
          ts,
          dur,
          reason AS name
          FROM android_startup_opinionated_breakdown
    `;
        const trackNode = await this.loadStartupTrack(ctx, trackSource, `/android_startups`, 'Android App Startups');
        const trackBreakdownNode = await this.loadStartupTrack(ctx, trackBreakdownSource, `/android_startups_breakdown`, 'Android App Startups Breakdown');
        const optimizations = await (0, optimizations_1.optimizationsTrack)(ctx);
        ctx.workspace.addChildInOrder(trackNode);
        trackNode.addChildLast(trackBreakdownNode);
        if (!!optimizations) {
            trackNode.addChildLast(optimizations);
        }
    }
    async loadStartupTrack(ctx, sqlSource, uri, title) {
        const track = await (0, query_slice_track_1.createQuerySliceTrack)({
            trace: ctx,
            uri,
            data: {
                sqlSource,
                columns: ['ts', 'dur', 'name'],
            },
        });
        ctx.tracks.registerTrack({
            uri,
            title,
            track,
        });
        // Needs a sort order lower than 'Ftrace Events' so that it is prioritized in the UI.
        return new workspace_1.TrackNode({ title, uri, sortOrder: -6 });
    }
}
exports.default = default_1;
//# sourceMappingURL=index.js.map