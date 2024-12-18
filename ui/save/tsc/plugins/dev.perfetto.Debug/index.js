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
const debug_tracks_1 = require("../../components/tracks/debug_tracks");
const utils_1 = require("../../base/utils");
class default_1 {
    static id = 'dev.perfetto.DebugTracks';
    async onTraceLoad(ctx) {
        ctx.commands.registerCommand({
            id: 'perfetto.DebugTracks#addDebugSliceTrack',
            name: 'Add debug slice track',
            callback: async (arg) => {
                // This command takes a query and creates a debug track out of it The
                // query can be passed in using the first arg, or if this is not defined
                // or is the wrong type, we prompt the user for it.
                const query = await getStringFromArgOrPrompt(ctx, arg);
                if ((0, utils_1.exists)(query)) {
                    await (0, debug_tracks_1.addDebugSliceTrack)({
                        trace: ctx,
                        data: {
                            sqlSource: query,
                        },
                        title: 'Debug slice track',
                    });
                }
            },
        });
        ctx.commands.registerCommand({
            id: 'perfetto.DebugTracks#addDebugCounterTrack',
            name: 'Add debug counter track',
            callback: async (arg) => {
                const query = await getStringFromArgOrPrompt(ctx, arg);
                if ((0, utils_1.exists)(query)) {
                    await (0, debug_tracks_1.addDebugCounterTrack)({
                        trace: ctx,
                        data: {
                            sqlSource: query,
                        },
                        title: 'Debug slice track',
                    });
                }
            },
        });
    }
}
exports.default = default_1;
// If arg is a string, return it, otherwise prompt the user for a string. An
// exception is thrown if the prompt is cancelled, so this function handles this
// and returns undefined in this case.
async function getStringFromArgOrPrompt(ctx, arg) {
    if (typeof arg === 'string') {
        return arg;
    }
    else {
        return await ctx.omnibox.prompt('Enter a query...');
    }
}
//# sourceMappingURL=index.js.map