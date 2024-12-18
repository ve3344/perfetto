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
exports.getScrollJankCauseStage = getScrollJankCauseStage;
exports.getEventLatencyCauseTracks = getEventLatencyCauseTracks;
exports.getCauseLink = getCauseLink;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const semantic_icons_1 = require("../../base/semantic_icons");
const time_1 = require("../../base/time");
const utils_1 = require("../../base/utils");
const query_result_1 = require("../../trace_processor/query_result");
const anchor_1 = require("../../widgets/anchor");
const scroll_jank_cause_map_1 = require("./scroll_jank_cause_map");
const scroll_helper_1 = require("../../public/scroll_helper");
const UNKNOWN_NAME = 'Unknown';
async function getScrollJankCauseStage(engine, eventLatencyId) {
    const queryResult = await engine.query(`
    SELECT
      IFNULL(cause_of_jank, '${UNKNOWN_NAME}') AS causeOfJank,
      IFNULL(sub_cause_of_jank, '${UNKNOWN_NAME}') AS subCauseOfJank,
      IFNULL(substage.ts, -1) AS ts,
      IFNULL(substage.dur, -1) AS dur
    FROM chrome_janky_frame_presentation_intervals
      JOIN descendant_slice(event_latency_id) substage
    WHERE event_latency_id = ${eventLatencyId}
      AND substage.name = COALESCE(sub_cause_of_jank, cause_of_jank)
  `);
    const causeIt = queryResult.iter({
        causeOfJank: query_result_1.STR,
        subCauseOfJank: query_result_1.STR,
        ts: query_result_1.LONG,
        dur: query_result_1.LONG,
    });
    for (; causeIt.valid(); causeIt.next()) {
        const causeOfJank = causeIt.causeOfJank;
        const subCauseOfJank = causeIt.subCauseOfJank;
        if (causeOfJank == '' || causeOfJank == UNKNOWN_NAME)
            return undefined;
        const cause = subCauseOfJank == UNKNOWN_NAME ? causeOfJank : subCauseOfJank;
        const stageDetails = {
            name: cause,
            eventLatencyId: eventLatencyId,
            ts: time_1.Time.fromRaw(causeIt.ts),
            dur: causeIt.dur,
        };
        return stageDetails;
    }
    return undefined;
}
async function getEventLatencyCauseTracks(engine, scrollJankCauseStage) {
    const threadTracks = [];
    const causeDetails = scroll_jank_cause_map_1.ScrollJankCauseMap.getEventLatencyDetails(scrollJankCauseStage.name);
    if (causeDetails === undefined)
        return threadTracks;
    for (const cause of causeDetails.jankCauses) {
        switch (cause.process) {
            case scroll_jank_cause_map_1.CauseProcess.RENDERER:
            case scroll_jank_cause_map_1.CauseProcess.BROWSER:
            case scroll_jank_cause_map_1.CauseProcess.GPU:
                const tracksForProcess = await getChromeCauseTracks(engine, scrollJankCauseStage.eventLatencyId, cause.process, cause.thread);
                for (const track of tracksForProcess) {
                    track.causeDescription = cause.description;
                    threadTracks.push(track);
                }
                break;
            case scroll_jank_cause_map_1.CauseProcess.UNKNOWN:
            default:
                break;
        }
    }
    return threadTracks;
}
async function getChromeCauseTracks(engine, eventLatencySliceId, processName, threadName) {
    const queryResult = await engine.query(`
      INCLUDE PERFETTO MODULE chrome.scroll_jank.scroll_jank_cause_utils;

      SELECT DISTINCT
        utid,
        id AS trackId
      FROM thread_track
      WHERE utid IN (
        SELECT DISTINCT
          utid
        FROM chrome_select_scroll_jank_cause_thread(
          ${eventLatencySliceId},
          '${processName}',
          '${threadName}'
        )
      );
  `);
    const it = queryResult.iter({
        utid: query_result_1.NUM,
        trackId: query_result_1.NUM,
    });
    const threadsWithTrack = {};
    const utids = [];
    for (; it.valid(); it.next()) {
        const utid = it.utid;
        if (!(utid in threadsWithTrack)) {
            threadsWithTrack[utid] = {
                trackIds: [it.trackId],
                thread: threadName,
                causeDescription: '',
            };
            utids.push(utid);
        }
        else {
            threadsWithTrack[utid].trackIds.push(it.trackId);
        }
    }
    return utids.map((each) => threadsWithTrack[each]);
}
function getCauseLink(trace, threadTracks, tracksByTrackId, ts, dur) {
    const trackUris = [];
    for (const trackId of threadTracks.trackIds) {
        const track = tracksByTrackId.get(trackId);
        if (track === undefined) {
            return `Could not locate track ${trackId} for thread ${threadTracks.thread} in the global state`;
        }
        trackUris.push(track);
    }
    if (trackUris.length == 0) {
        return `No valid tracks for thread ${threadTracks.thread}.`;
    }
    // Fixed length of a container to ensure that the icon does not overlap with
    // the text due to table formatting.
    return (0, mithril_1.default)(`div[style='width:250px']`, (0, mithril_1.default)(anchor_1.Anchor, {
        icon: semantic_icons_1.Icons.UpdateSelection,
        onclick: () => {
            (0, scroll_helper_1.scrollTo)({
                track: { uri: trackUris[0], expandGroup: true },
            });
            if ((0, utils_1.exists)(ts) && (0, utils_1.exists)(dur)) {
                (0, scroll_helper_1.scrollTo)({
                    time: {
                        start: ts,
                        end: time_1.Time.fromRaw(ts + dur),
                        viewPercentage: 0.3,
                    },
                });
                trace.selection.selectArea({
                    start: ts,
                    end: time_1.Time.fromRaw(ts + dur),
                    trackUris,
                });
            }
        },
    }, threadTracks.thread));
}
//# sourceMappingURL=scroll_jank_cause_link_utils.js.map