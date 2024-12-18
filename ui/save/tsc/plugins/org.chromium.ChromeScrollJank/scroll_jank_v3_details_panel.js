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
exports.ScrollJankV3DetailsPanel = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const time_1 = require("../../base/time");
const utils_1 = require("../../base/utils");
const slice_1 = require("../../components/sql_utils/slice");
const core_types_1 = require("../../components/sql_utils/core_types");
const duration_1 = require("../../components/widgets/duration");
const timestamp_1 = require("../../components/widgets/timestamp");
const query_result_1 = require("../../trace_processor/query_result");
const details_shell_1 = require("../../widgets/details_shell");
const grid_layout_1 = require("../../widgets/grid_layout");
const section_1 = require("../../widgets/section");
const sql_ref_1 = require("../../widgets/sql_ref");
const text_paragraph_1 = require("../../widgets/text_paragraph");
const tree_1 = require("../../widgets/tree");
const selection_utils_1 = require("./selection_utils");
async function getSliceDetails(engine, id) {
    return (0, slice_1.getSlice)(engine, (0, core_types_1.asSliceSqlId)(id));
}
class ScrollJankV3DetailsPanel {
    trace;
    id;
    data;
    //
    // Linking to associated slices
    //
    // Link to the original Event Latency in the Slice table.
    // TODO(b/278844325): once the EventLatencyTrack has a custom details panel,
    // move this link there.
    sliceDetails;
    // Link to the Event Latency in the EventLatencyTrack (subset of event
    // latencies associated with input events).
    eventLatencySliceDetails;
    // Link to the scroll jank cause stage of the associated EventLatencyTrack
    // slice. May be unknown.
    causeSliceDetails;
    // Link to the scroll jank sub-cause stage of the associated EventLatencyTrack
    // slice. Does not apply to all causes.
    subcauseSliceDetails;
    constructor(trace, id) {
        this.trace = trace;
        this.id = id;
    }
    async load() {
        const queryResult = await this.trace.engine.query(`
      SELECT
        IIF(
          cause_of_jank IS NOT NULL,
          cause_of_jank || IIF(
            sub_cause_of_jank IS NOT NULL, "::" || sub_cause_of_jank, ""
            ), "Unknown") || " Jank" AS name,
        id,
        ts,
        dur,
        delayed_frame_count AS delayedVsyncCount,
        event_latency_id AS eventLatencyId,
        IFNULL(cause_of_jank, "UNKNOWN") AS causeOfJank,
        IFNULL(sub_cause_of_jank, "UNKNOWN") AS subcauseOfJank
      FROM chrome_janky_frame_presentation_intervals
      WHERE id = ${this.id}`);
        const iter = queryResult.firstRow({
            name: query_result_1.STR,
            id: query_result_1.NUM,
            ts: query_result_1.LONG,
            dur: query_result_1.LONG,
            delayedVsyncCount: query_result_1.NUM,
            eventLatencyId: query_result_1.NUM,
            causeOfJank: query_result_1.STR,
            subcauseOfJank: query_result_1.STR,
        });
        this.data = {
            name: iter.name,
            id: iter.id,
            ts: time_1.Time.fromRaw(iter.ts),
            dur: iter.dur,
            delayedVsyncCount: iter.delayedVsyncCount,
            eventLatencyId: iter.eventLatencyId,
            jankCause: iter.causeOfJank,
            jankSubcause: iter.subcauseOfJank,
        };
        await this.loadJankyFrames();
        await this.loadSlices();
        this.trace.scheduleFullRedraw();
    }
    hasCause() {
        if (this.data === undefined) {
            return false;
        }
        return this.data.jankCause !== 'UNKNOWN';
    }
    hasSubcause() {
        if (this.data === undefined) {
            return false;
        }
        return this.hasCause() && this.data.jankSubcause !== 'UNKNOWN';
    }
    async loadSlices() {
        if ((0, utils_1.exists)(this.data)) {
            this.sliceDetails = await getSliceDetails(this.trace.engine, this.data.eventLatencyId);
            const it = (await this.trace.engine.query(`
        SELECT ts, dur
        FROM slice
        WHERE id = ${this.data.eventLatencyId}
      `)).iter({ ts: query_result_1.LONG, dur: query_result_1.LONG });
            this.eventLatencySliceDetails = {
                ts: time_1.Time.fromRaw(it.ts),
                dur: it.dur,
            };
            if (this.hasCause()) {
                const it = (await this.trace.engine.query(`
          SELECT id, ts, dur
          FROM descendant_slice(${this.data.eventLatencyId})
          WHERE name = "${this.data.jankCause}"
        `)).iter({ id: query_result_1.NUM, ts: query_result_1.LONG, dur: query_result_1.LONG });
                if (it.valid()) {
                    this.causeSliceDetails = {
                        id: it.id,
                        ts: time_1.Time.fromRaw(it.ts),
                        dur: it.dur,
                    };
                }
            }
            if (this.hasSubcause()) {
                const it = (await this.trace.engine.query(`
          SELECT id, ts, dur
          FROM descendant_slice(${this.data.eventLatencyId})
          WHERE name = "${this.data.jankSubcause}"
        `)).iter({ id: query_result_1.NUM, ts: query_result_1.LONG, dur: query_result_1.LONG });
                if (it.valid()) {
                    this.subcauseSliceDetails = {
                        id: it.id,
                        ts: time_1.Time.fromRaw(it.ts),
                        dur: it.dur,
                    };
                }
            }
        }
    }
    async loadJankyFrames() {
        if ((0, utils_1.exists)(this.data)) {
            const queryResult = await this.trace.engine.query(`
        SELECT
          COUNT(*) AS jankyFrames
        FROM chrome_frame_info_with_delay
        WHERE delay_since_last_frame >
          (
            SELECT
              vsync_interval + vsync_interval / 2
            FROM chrome_vsyncs)
          AND delay_since_last_input <
            (
              SELECT
                vsync_interval + vsync_interval / 2
              FROM chrome_vsyncs)
          AND presentation_timestamp >= ${this.data.ts}
          AND presentation_timestamp <= ${this.data.ts + this.data.dur};
      `);
            const iter = queryResult.firstRow({
                jankyFrames: query_result_1.NUM,
            });
            this.data.jankyFrames = iter.jankyFrames;
        }
    }
    renderDetailsDictionary() {
        const details = {};
        if ((0, utils_1.exists)(this.data)) {
            details['Name'] = this.data.name;
            details['Expected Frame Presentation Timestamp'] = (0, mithril_1.default)(timestamp_1.Timestamp, {
                ts: this.data.ts,
            });
            details['Actual Frame Presentation Timestamp'] = (0, mithril_1.default)(timestamp_1.Timestamp, {
                ts: time_1.Time.add(this.data.ts, this.data.dur),
            });
            details['Frame Presentation Delay'] = (0, mithril_1.default)(duration_1.DurationWidget, {
                dur: this.data.dur,
            });
            details['Vsyncs Delayed'] = this.data.delayedVsyncCount;
            if ((0, utils_1.exists)(this.data.jankyFrames)) {
                details['Janky Frame Count'] = this.data.jankyFrames;
            }
            details['Original Event Latency'] = this.data.eventLatencyId;
            details['SQL ID'] = (0, mithril_1.default)(sql_ref_1.SqlRef, {
                table: 'chrome_janky_frame_presentation_intervals',
                id: this.data.id,
            });
        }
        return (0, tree_1.dictToTreeNodes)(details);
    }
    getDescriptionText() {
        return (0, mithril_1.default)(text_paragraph_1.MultiParagraphText, (0, mithril_1.default)(text_paragraph_1.TextParagraph, {
            text: `Delay between when the frame was expected to be presented and
                 when it was actually presented.`,
        }), (0, mithril_1.default)(text_paragraph_1.TextParagraph, {
            text: `This is the period of time during which the user is viewing a
                 frame that isn't correct.`,
        }));
    }
    getLinksSection() {
        const result = {};
        if ((0, utils_1.exists)(this.sliceDetails) && (0, utils_1.exists)(this.data)) {
            result['Janked Event Latency stage'] =
                (0, utils_1.exists)(this.causeSliceDetails) &&
                    (0, selection_utils_1.renderSliceRef)({
                        trace: this.trace,
                        id: this.causeSliceDetails.id,
                        trackUri: selection_utils_1.EVENT_LATENCY_TRACK_URI,
                        title: this.data.jankCause,
                    });
            if (this.hasSubcause()) {
                result['Sub-cause of Jank'] =
                    (0, utils_1.exists)(this.subcauseSliceDetails) &&
                        (0, selection_utils_1.renderSliceRef)({
                            trace: this.trace,
                            id: this.subcauseSliceDetails.id,
                            trackUri: selection_utils_1.EVENT_LATENCY_TRACK_URI,
                            title: this.data.jankCause,
                        });
            }
            const children = (0, tree_1.dictToTreeNodes)(result);
            if ((0, utils_1.exists)(this.eventLatencySliceDetails)) {
                children.unshift((0, mithril_1.default)(tree_1.TreeNode, {
                    left: (0, selection_utils_1.renderSliceRef)({
                        trace: this.trace,
                        id: this.data.eventLatencyId,
                        trackUri: selection_utils_1.EVENT_LATENCY_TRACK_URI,
                        title: this.data.jankCause,
                    }),
                    right: '',
                }));
            }
            else {
                children.unshift('Event Latency');
            }
            return children;
        }
        return (0, tree_1.dictToTreeNodes)(result);
    }
    render() {
        if (this.data === undefined) {
            return (0, mithril_1.default)('h2', 'Loading');
        }
        const details = this.renderDetailsDictionary();
        return (0, mithril_1.default)(details_shell_1.DetailsShell, {
            title: 'EventLatency',
        }, (0, mithril_1.default)(grid_layout_1.GridLayout, (0, mithril_1.default)(grid_layout_1.GridLayoutColumn, (0, mithril_1.default)(section_1.Section, { title: 'Details' }, (0, mithril_1.default)(tree_1.Tree, details))), (0, mithril_1.default)(grid_layout_1.GridLayoutColumn, (0, mithril_1.default)(section_1.Section, { title: 'Description' }, this.getDescriptionText()), (0, mithril_1.default)(section_1.Section, { title: 'Jank Cause' }, (0, mithril_1.default)(tree_1.Tree, this.getLinksSection())))));
    }
}
exports.ScrollJankV3DetailsPanel = ScrollJankV3DetailsPanel;
//# sourceMappingURL=scroll_jank_v3_details_panel.js.map