"use strict";
// Copyright (C) 2023 The Android Open Source Project
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
const workspace_1 = require("../../public/workspace");
const query_result_1 = require("../../trace_processor/query_result");
const screenshots_track_1 = require("./screenshots_track");
class default_1 {
    static id = 'dev.perfetto.Screenshots';
    async onTraceLoad(ctx) {
        const res = await ctx.engine.query(`
      INCLUDE PERFETTO MODULE android.screenshots;
      select
        count() as count
      from android_screenshots
    `);
        const { count } = res.firstRow({ count: query_result_1.NUM });
        if (count > 0) {
            const title = 'Screenshots';
            const uri = '/screenshots';
            ctx.tracks.registerTrack({
                uri,
                title,
                track: new screenshots_track_1.ScreenshotsTrack(ctx, uri),
                tags: {
                    kind: screenshots_track_1.ScreenshotsTrack.kind,
                },
            });
            const trackNode = new workspace_1.TrackNode({ uri, title, sortOrder: -60 });
            ctx.workspace.addChildInOrder(trackNode);
        }
    }
}
exports.default = default_1;
//# sourceMappingURL=index.js.map