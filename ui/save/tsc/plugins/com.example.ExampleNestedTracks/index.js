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
const query_slice_track_1 = require("../../components/tracks/query_slice_track");
const workspace_1 = require("../../public/workspace");
class default_1 {
    static id = 'com.example.ExampleNestedTracks';
    async onTraceLoad(ctx) {
        const traceStartTime = ctx.traceInfo.start;
        const traceDur = ctx.traceInfo.end - ctx.traceInfo.start;
        await ctx.engine.query(`
      create table example_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        ts INTEGER,
        dur INTEGER,
        arg INTEGER
      );

      insert into example_events (name, ts, dur, arg)
      values
        ('Foo', ${traceStartTime}, ${traceDur}, 'aaa'),
        ('Bar', ${traceStartTime}, ${traceDur / 2n}, 'bbb'),
        ('Baz', ${traceStartTime}, ${traceDur / 3n}, 'bbb');
    `);
        const title = 'Test Track';
        const uri = `com.example.ExampleNestedTracks#TestTrack`;
        const track = await (0, query_slice_track_1.createQuerySliceTrack)({
            trace: ctx,
            uri,
            data: {
                sqlSource: 'select * from example_events',
            },
        });
        ctx.tracks.registerTrack({
            uri,
            title,
            track,
        });
        this.addNestedTracks(ctx, uri);
    }
    addNestedTracks(ctx, uri) {
        const trackRoot = new workspace_1.TrackNode({ uri, title: 'Root' });
        const track1 = new workspace_1.TrackNode({ uri, title: '1' });
        const track2 = new workspace_1.TrackNode({ uri, title: '2' });
        const track11 = new workspace_1.TrackNode({ uri, title: '1.1' });
        const track12 = new workspace_1.TrackNode({ uri, title: '1.2' });
        const track121 = new workspace_1.TrackNode({ uri, title: '1.2.1' });
        const track21 = new workspace_1.TrackNode({ uri, title: '2.1' });
        ctx.workspace.addChildInOrder(trackRoot);
        trackRoot.addChildLast(track1);
        trackRoot.addChildLast(track2);
        track1.addChildLast(track11);
        track1.addChildLast(track12);
        track12.addChildLast(track121);
        track2.addChildLast(track21);
        ctx.commands.registerCommand({
            id: 'com.example.ExampleNestedTracks#CloneTracksToNewWorkspace',
            name: 'Clone track to new workspace',
            callback: () => {
                const ws = ctx.workspaces.createEmptyWorkspace('New workspace');
                ws.addChildLast(trackRoot.clone());
                ctx.workspaces.switchWorkspace(ws);
            },
        });
        ctx.commands.registerCommand({
            id: 'com.example.ExampleNestedTracks#DeepCloneTracksToNewWorkspace',
            name: 'Clone all tracks to new workspace',
            callback: () => {
                const ws = ctx.workspaces.createEmptyWorkspace('Deep workspace');
                ws.addChildLast(trackRoot.clone(true));
                ctx.workspaces.switchWorkspace(ws);
            },
        });
    }
}
exports.default = default_1;
//# sourceMappingURL=index.js.map