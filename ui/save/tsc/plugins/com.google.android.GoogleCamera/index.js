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
const tslib_1 = require("tslib");
const cameraConstants = tslib_1.__importStar(require("./googleCameraConstants"));
class default_1 {
    static id = 'com.google.android.GoogleCamera';
    async onTraceLoad(ctx) {
        ctx.commands.registerCommand({
            id: 'com.google.android.GoogleCamera#LoadGoogleCameraStartupView',
            name: 'Load google camera startup view',
            callback: () => {
                this.loadGCAStartupView(ctx);
            },
        });
        ctx.commands.registerCommand({
            id: 'com.google.android.GoogleCamera#PinCameraRelatedTracks',
            name: 'Pin camera related tracks',
            callback: (trackNames) => {
                trackNames = prompt('List of additional track names that you would like to pin separated by commas', '');
                const trackNameList = trackNames.split(',').map(function (item) {
                    return item.trim();
                });
                this.pinTracks(ctx, trackNameList);
            },
        });
    }
    loadGCAStartupView(ctx) {
        this.pinTracks(ctx, cameraConstants.MAIN_THREAD_TRACK);
        this.pinTracks(ctx, cameraConstants.STARTUP_RELATED_TRACKS);
    }
    pinTracks(ctx, trackNames) {
        ctx.workspace.flatTracks.forEach((track) => {
            trackNames.forEach((trackName) => {
                if (track.title.match(trackName)) {
                    track.pin();
                }
            });
        });
    }
}
exports.default = default_1;
//# sourceMappingURL=index.js.map