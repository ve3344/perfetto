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
exports.ScrollDetailsPanel = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const time_1 = require("../../base/time");
const utils_1 = require("../../base/utils");
const table_1 = require("../../widgets/table");
const duration_1 = require("../../components/widgets/duration");
const timestamp_1 = require("../../components/widgets/timestamp");
const query_result_1 = require("../../trace_processor/query_result");
const details_shell_1 = require("../../widgets/details_shell");
const grid_layout_1 = require("../../widgets/grid_layout");
const section_1 = require("../../widgets/section");
const sql_ref_1 = require("../../widgets/sql_ref");
const text_paragraph_1 = require("../../widgets/text_paragraph");
const tree_1 = require("../../widgets/tree");
const scroll_delta_graph_1 = require("./scroll_delta_graph");
const selection_utils_1 = require("./selection_utils");
class ScrollDetailsPanel {
    trace;
    id;
    data;
    metrics = {};
    orderedJankSlices = [];
    // TODO(altimin): Don't store Mithril vnodes between render cycles.
    scrollDeltas;
    constructor(trace, id) {
        this.trace = trace;
        this.id = id;
    }
    async load() {
        const queryResult = await this.trace.engine.query(`
      WITH scrolls AS (
        SELECT
          id,
          IFNULL(gesture_scroll_begin_ts, ts) AS start_ts,
          CASE
            WHEN gesture_scroll_end_ts IS NOT NULL THEN gesture_scroll_end_ts
            WHEN gesture_scroll_begin_ts IS NOT NULL
              THEN gesture_scroll_begin_ts + dur
            ELSE ts + dur
          END AS end_ts
        FROM chrome_scrolls WHERE id = ${this.id})
      SELECT
        id,
        start_ts AS ts,
        end_ts - start_ts AS dur
      FROM scrolls`);
        const iter = queryResult.firstRow({
            id: query_result_1.NUM,
            ts: query_result_1.LONG,
            dur: query_result_1.LONG,
        });
        this.data = {
            id: iter.id,
            ts: time_1.Time.fromRaw(iter.ts),
            dur: iter.dur,
        };
        await this.loadMetrics();
    }
    async loadMetrics() {
        await this.loadInputEventCount();
        await this.loadFrameStats();
        await this.loadDelayData();
        await this.loadScrollOffsets();
    }
    async loadInputEventCount() {
        if ((0, utils_1.exists)(this.data)) {
            const queryResult = await this.trace.engine.query(`
        SELECT
          COUNT(*) AS inputEventCount
        FROM slice s
        WHERE s.name = "EventLatency"
          AND EXTRACT_ARG(arg_set_id, 'event_latency.event_type') = 'TOUCH_MOVED'
          AND s.ts >= ${this.data.ts}
          AND s.ts + s.dur <= ${this.data.ts + this.data.dur}
      `);
            const iter = queryResult.firstRow({
                inputEventCount: query_result_1.NUM,
            });
            this.metrics.inputEventCount = iter.inputEventCount;
        }
    }
    async loadFrameStats() {
        if ((0, utils_1.exists)(this.data)) {
            const queryResult = await this.trace.engine.query(`
        SELECT
          IFNULL(frame_count, 0) AS frameCount,
          IFNULL(missed_vsyncs, 0) AS missedVsyncs,
          IFNULL(presented_frame_count, 0) AS presentedFrameCount,
          IFNULL(janky_frame_count, 0) AS jankyFrameCount,
          ROUND(IFNULL(janky_frame_percent, 0), 2) AS jankyFramePercent
        FROM chrome_scroll_stats
        WHERE scroll_id = ${this.data.id}
      `);
            const iter = queryResult.iter({
                frameCount: query_result_1.NUM,
                missedVsyncs: query_result_1.NUM,
                presentedFrameCount: query_result_1.NUM,
                jankyFrameCount: query_result_1.NUM,
                jankyFramePercent: query_result_1.NUM,
            });
            for (; iter.valid(); iter.next()) {
                this.metrics.frameCount = iter.frameCount;
                this.metrics.missedVsyncs = iter.missedVsyncs;
                this.metrics.presentedFrameCount = iter.presentedFrameCount;
                this.metrics.jankyFrameCount = iter.jankyFrameCount;
                this.metrics.jankyFramePercent = iter.jankyFramePercent;
                return;
            }
        }
    }
    async loadDelayData() {
        if ((0, utils_1.exists)(this.data)) {
            const queryResult = await this.trace.engine.query(`
        SELECT
          id,
          ts,
          dur,
          IFNULL(sub_cause_of_jank, IFNULL(cause_of_jank, 'Unknown')) AS cause,
          event_latency_id AS eventLatencyId,
          delayed_frame_count AS delayVsync
        FROM chrome_janky_frame_presentation_intervals s
        WHERE s.ts >= ${this.data.ts}
          AND s.ts + s.dur <= ${this.data.ts + this.data.dur}
        ORDER by dur DESC;
      `);
            const it = queryResult.iter({
                id: query_result_1.NUM,
                ts: query_result_1.LONG,
                dur: query_result_1.LONG_NULL,
                cause: query_result_1.STR,
                eventLatencyId: query_result_1.NUM_NULL,
                delayVsync: query_result_1.NUM_NULL,
            });
            for (; it.valid(); it.next()) {
                this.orderedJankSlices.push({
                    id: it.id,
                    ts: time_1.Time.fromRaw(it.ts),
                    dur: it.dur ?? undefined,
                    cause: it.cause,
                    delayVsync: it.delayVsync ?? undefined,
                });
            }
        }
    }
    async loadScrollOffsets() {
        if ((0, utils_1.exists)(this.data)) {
            const inputDeltas = await (0, scroll_delta_graph_1.getInputScrollDeltas)(this.trace.engine, this.data.id);
            const presentedDeltas = await (0, scroll_delta_graph_1.getPresentedScrollDeltas)(this.trace.engine, this.data.id);
            const predictorDeltas = await (0, scroll_delta_graph_1.getPredictorJankDeltas)(this.trace.engine, this.data.id);
            const jankIntervals = await (0, scroll_delta_graph_1.getJankIntervals)(this.trace.engine, this.data.ts, this.data.dur);
            this.scrollDeltas = (0, scroll_delta_graph_1.buildScrollOffsetsGraph)(inputDeltas, presentedDeltas, predictorDeltas, jankIntervals);
            if (presentedDeltas.length > 0) {
                this.metrics.startOffset = presentedDeltas[0].scrollOffset;
                this.metrics.endOffset =
                    presentedDeltas[presentedDeltas.length - 1].scrollOffset;
                let pixelsScrolled = 0;
                for (let i = 0; i < presentedDeltas.length; i++) {
                    pixelsScrolled += Math.abs(presentedDeltas[i].scrollDelta);
                }
                if (pixelsScrolled != 0) {
                    this.metrics.totalPixelsScrolled = pixelsScrolled;
                }
            }
        }
    }
    renderMetricsDictionary() {
        const metrics = {};
        metrics['Total Finger Input Event Count'] = this.metrics.inputEventCount;
        metrics['Total Vsyncs within Scrolling period'] = this.metrics.frameCount;
        metrics['Total Chrome Presented Frames'] = this.metrics.presentedFrameCount;
        metrics['Total Janky Frames'] = this.metrics.jankyFrameCount;
        metrics['Number of Vsyncs Janky Frames were Delayed by'] =
            this.metrics.missedVsyncs;
        if (this.metrics.jankyFramePercent !== undefined) {
            metrics['Janky Frame Percentage (Total Janky Frames / Total Chrome Presented Frames)'] = `${this.metrics.jankyFramePercent}%`;
        }
        if (this.metrics.startOffset != undefined) {
            metrics['Starting Offset'] = this.metrics.startOffset;
        }
        if (this.metrics.endOffset != undefined) {
            metrics['Ending Offset'] = this.metrics.endOffset;
        }
        if (this.metrics.startOffset != undefined &&
            this.metrics.endOffset != undefined) {
            metrics['Net Pixels Scrolled'] = Math.abs(this.metrics.endOffset - this.metrics.startOffset);
        }
        if (this.metrics.totalPixelsScrolled != undefined) {
            metrics['Total Pixels Scrolled (all directions)'] =
                this.metrics.totalPixelsScrolled;
        }
        return (0, tree_1.dictToTreeNodes)(metrics);
    }
    getDelayTable() {
        if (this.orderedJankSlices.length > 0) {
            const columns = [
                (0, table_1.widgetColumn)('Cause', (jankSlice) => (0, selection_utils_1.renderSliceRef)({
                    trace: this.trace,
                    id: jankSlice.id,
                    trackUri: selection_utils_1.JANKS_TRACK_URI,
                    title: jankSlice.cause,
                })),
                (0, table_1.widgetColumn)('Duration', (jankSlice) => jankSlice.dur !== undefined
                    ? (0, mithril_1.default)(duration_1.DurationWidget, { dur: jankSlice.dur })
                    : 'NULL'),
                (0, table_1.widgetColumn)('Delayed Vsyncs', (jankSlice) => jankSlice.delayVsync),
            ];
            const tableData = new table_1.TableData(this.orderedJankSlices);
            return (0, mithril_1.default)(table_1.Table, {
                data: tableData,
                columns: columns,
            });
        }
        else {
            return 'None';
        }
    }
    getDescriptionText() {
        return (0, mithril_1.default)(text_paragraph_1.MultiParagraphText, (0, mithril_1.default)(text_paragraph_1.TextParagraph, {
            text: `The interval during which the user has started a scroll ending
                 after their finger leaves the screen and any resulting fling
                 animations have finished.`,
        }), (0, mithril_1.default)(text_paragraph_1.TextParagraph, {
            text: `Note: This can contain periods of time where the finger is down
                 and not moving and no active scrolling is occurring.`,
        }), (0, mithril_1.default)(text_paragraph_1.TextParagraph, {
            text: `Note: Sometimes if a user touches the screen quickly after
                 letting go or Chrome was hung and got into a bad state. A new
                 scroll will start which will result in a slightly overlapping
                 scroll. This can occur due to the last scroll still outputting
                 frames (to get caught up) and the "new" scroll having started
                 producing frames after the user has started scrolling again.`,
        }));
    }
    getGraphText() {
        return (0, mithril_1.default)(text_paragraph_1.MultiParagraphText, (0, mithril_1.default)(text_paragraph_1.TextParagraph, {
            text: `The scroll offset is the discrepancy in physical screen pixels
                 between two consecutive frames.`,
        }), (0, mithril_1.default)(text_paragraph_1.TextParagraph, {
            text: `The overall curve of the graph indicates the direction (up or
                 down) by which the user scrolled over time.`,
        }), (0, mithril_1.default)(text_paragraph_1.TextParagraph, {
            text: `Grey blocks in the graph represent intervals of jank
                 corresponding with the Chrome Scroll Janks track.`,
        }), (0, mithril_1.default)(text_paragraph_1.TextParagraph, {
            text: `Yellow dots represent frames that were presented (sae as the red
                 dots), but that we suspect are visible to users as unsmooth
                 velocity/stutter (predictor jank).`,
        }));
    }
    render() {
        if (this.data == undefined) {
            return (0, mithril_1.default)('h2', 'Loading');
        }
        const details = (0, tree_1.dictToTreeNodes)({
            'Scroll ID': this.data.id,
            'Start time': (0, mithril_1.default)(timestamp_1.Timestamp, { ts: this.data.ts }),
            'Duration': (0, mithril_1.default)(duration_1.DurationWidget, { dur: this.data.dur }),
            'SQL ID': (0, mithril_1.default)(sql_ref_1.SqlRef, { table: 'chrome_scrolls', id: this.id }),
        });
        return (0, mithril_1.default)(details_shell_1.DetailsShell, {
            title: 'Scroll',
        }, (0, mithril_1.default)(grid_layout_1.GridLayout, (0, mithril_1.default)(grid_layout_1.GridLayoutColumn, (0, mithril_1.default)(section_1.Section, { title: 'Details' }, (0, mithril_1.default)(tree_1.Tree, details)), (0, mithril_1.default)(section_1.Section, { title: 'Slice Metrics' }, (0, mithril_1.default)(tree_1.Tree, this.renderMetricsDictionary())), (0, mithril_1.default)(section_1.Section, { title: 'Frame Presentation Delays' }, this.getDelayTable())), (0, mithril_1.default)(grid_layout_1.GridLayoutColumn, (0, mithril_1.default)(section_1.Section, { title: 'Description' }, this.getDescriptionText()), (0, mithril_1.default)(section_1.Section, { title: 'Scroll Offsets Plot' }, (0, mithril_1.default)(".div[style='padding-bottom:5px']", this.getGraphText()), this.scrollDeltas))));
    }
}
exports.ScrollDetailsPanel = ScrollDetailsPanel;
//# sourceMappingURL=scroll_details_panel.js.map