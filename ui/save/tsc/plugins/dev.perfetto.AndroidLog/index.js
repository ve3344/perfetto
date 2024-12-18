"use strict";
// Copyright (C) 2021 The Android Open Source Project
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
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const logs_panel_1 = require("./logs_panel");
const track_kinds_1 = require("../../public/track_kinds");
const query_result_1 = require("../../trace_processor/query_result");
const logs_track_1 = require("./logs_track");
const utils_1 = require("../../base/utils");
const workspace_1 = require("../../public/workspace");
const VERSION = 1;
const DEFAULT_STATE = {
    version: VERSION,
    filter: {
        // The first two log priorities are ignored.
        minimumLevel: 2,
        tags: [],
        textEntry: '',
        hideNonMatching: true,
    },
};
class default_1 {
    static id = 'dev.perfetto.AndroidLog';
    async onTraceLoad(ctx) {
        const store = ctx.mountStore((init) => {
            return (0, utils_1.exists)(init) && init.version === VERSION
                ? init
                : DEFAULT_STATE;
        });
        const result = await ctx.engine.query(`select count(1) as cnt from android_logs`);
        const logCount = result.firstRow({ cnt: query_result_1.NUM }).cnt;
        const uri = 'perfetto.AndroidLog';
        const title = 'Android logs';
        if (logCount > 0) {
            ctx.tracks.registerTrack({
                uri,
                title,
                tags: { kind: track_kinds_1.ANDROID_LOGS_TRACK_KIND },
                track: new logs_track_1.AndroidLogTrack(ctx.engine),
            });
            const track = new workspace_1.TrackNode({ title, uri });
            ctx.workspace.addChildInOrder(track);
        }
        const androidLogsTabUri = 'perfetto.AndroidLog#tab';
        // Eternal tabs should always be available even if there is nothing to show
        const filterStore = store.createSubStore(['filter'], (x) => x);
        ctx.tabs.registerTab({
            isEphemeral: false,
            uri: androidLogsTabUri,
            content: {
                render: () => (0, mithril_1.default)(logs_panel_1.LogPanel, { filterStore: filterStore, trace: ctx }),
                getTitle: () => 'Android Logs',
            },
        });
        if (logCount > 0) {
            ctx.tabs.addDefaultTab(androidLogsTabUri);
        }
        ctx.commands.registerCommand({
            id: 'perfetto.AndroidLog#ShowLogsTab',
            name: 'Show android logs tab',
            callback: () => {
                ctx.tabs.showTab(androidLogsTabUri);
            },
        });
    }
}
exports.default = default_1;
//# sourceMappingURL=index.js.map