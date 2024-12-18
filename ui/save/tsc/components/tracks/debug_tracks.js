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
exports.addPivotedTracks = addPivotedTracks;
exports.addDebugSliceTrack = addDebugSliceTrack;
exports.addDebugCounterTrack = addDebugCounterTrack;
const sql_utils_1 = require("../../trace_processor/sql_utils");
const workspace_1 = require("../../public/workspace");
const query_slice_track_1 = require("./query_slice_track");
const query_counter_track_1 = require("./query_counter_track");
let trackCounter = 0; // For reproducible ids.
async function addPivotedTracks(trace, data, trackName, pivotColumn, createTrack) {
    const iter = (await trace.engine.query(`
    with all_vals as (${data.sqlSource})
    select DISTINCT ${pivotColumn} from all_vals
    order by ${pivotColumn}
  `)).iter({});
    for (; iter.valid(); iter.next()) {
        await createTrack(trace, {
            sqlSource: `select * from
        (${data.sqlSource})
        where ${pivotColumn} ${(0, sql_utils_1.matchesSqlValue)(iter.get(pivotColumn))}`,
        }, `${trackName.trim() || 'Pivot Track'}: ${(0, sql_utils_1.sqlValueToReadableString)(iter.get(pivotColumn))}`);
    }
}
/**
 * Adds a new debug slice track to the workspace.
 *
 * See {@link createQuerySliceTrack} for details about the configuration args.
 *
 * A debug slice track is a track based on a query which is:
 * - Based on a query.
 * - Uses automatic slice layout.
 * - Automatically added to the top of the current workspace.
 * - Pinned.
 * - Has a close button.
 */
async function addDebugSliceTrack(args) {
    const trace = args.trace;
    const cnt = trackCounter++;
    const uri = `debugSliceTrack/${cnt}`;
    const title = args.title?.trim() || `Debug Slice Track ${cnt}`;
    // Create & register the track renderer
    const track = await (0, query_slice_track_1.createQuerySliceTrack)({ ...args, uri });
    trace.tracks.registerTrack({ uri, title, track });
    // Create the track node and pin it
    const trackNode = new workspace_1.TrackNode({ uri, title, removable: true });
    trace.workspace.pinnedTracksNode.addChildLast(trackNode);
}
/**
 * Adds a new debug counter track to the workspace.
 *
 * See {@link createQueryCounterTrack} for details about the configuration args.
 *
 * A debug counter track is a track based on a query which is:
 * - Based on a query.
 * - Automatically added to the top of the current workspace.
 * - Pinned.
 * - Has a close button.
 */
async function addDebugCounterTrack(args) {
    const trace = args.trace;
    const cnt = trackCounter++;
    const uri = `debugCounterTrack/${cnt}`;
    const title = args.title?.trim() || `Debug Counter Track ${cnt}`;
    // Create & register the track renderer
    const track = await (0, query_counter_track_1.createQueryCounterTrack)({ ...args, uri });
    trace.tracks.registerTrack({ uri, title, track });
    // Create the track node and pin it
    const trackNode = new workspace_1.TrackNode({ uri, title, removable: true });
    trace.workspace.pinnedTracksNode.addChildLast(trackNode);
}
//# sourceMappingURL=debug_tracks.js.map