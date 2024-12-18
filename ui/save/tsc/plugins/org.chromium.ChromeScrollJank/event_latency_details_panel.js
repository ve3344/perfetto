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
exports.EventLatencySliceDetailsPanel = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const time_1 = require("../../base/time");
const slice_args_1 = require("../../components/details/slice_args");
const slice_details_1 = require("../../components/details/slice_details");
const slice_1 = require("../../components/sql_utils/slice");
const core_types_1 = require("../../components/sql_utils/core_types");
const table_1 = require("../../widgets/table");
const treetable_1 = require("../../components/widgets/treetable");
const query_result_1 = require("../../trace_processor/query_result");
const details_shell_1 = require("../../widgets/details_shell");
const grid_layout_1 = require("../../widgets/grid_layout");
const section_1 = require("../../widgets/section");
const text_paragraph_1 = require("../../widgets/text_paragraph");
const tree_1 = require("../../widgets/tree");
const scroll_jank_cause_link_utils_1 = require("./scroll_jank_cause_link_utils");
const scroll_jank_cause_map_1 = require("./scroll_jank_cause_map");
const slice_2 = require("../../components/widgets/slice");
const selection_utils_1 = require("./selection_utils");
// Given a node in the slice tree, return a path from root to it.
function getPath(slice) {
    const result = [];
    let node = slice;
    while (node.parent !== undefined) {
        result.push(node.name);
        node = node.parent;
    }
    return result.reverse();
}
// Given a slice tree node and a path, find the node following the path from
// the given slice, or `undefined` if not found.
function findSliceInTreeByPath(slice, path) {
    if (slice === undefined) {
        return undefined;
    }
    let result = slice;
    for (const segment of path) {
        let found = false;
        for (const child of result.children) {
            if (child.name === segment) {
                found = true;
                result = child;
                break;
            }
        }
        if (!found) {
            return undefined;
        }
    }
    return result;
}
function durationDelta(value, base) {
    if (base === undefined) {
        return 'NULL';
    }
    const delta = value - base;
    return `${delta > 0 ? '+' : ''}${time_1.Duration.humanise(delta)}`;
}
class EventLatencySliceDetailsPanel {
    trace;
    id;
    name = '';
    topEventLatencyId = undefined;
    sliceDetails;
    jankySlice;
    // Whether this stage has caused jank. This is also true for top level
    // EventLatency slices where a descendant is a cause of jank.
    isJankStage = false;
    // For top level EventLatency slices - if any descendant is a cause of jank,
    // this field stores information about that descendant slice. Otherwise, this
    // is stores information about the current stage;
    relevantThreadStage;
    relevantThreadTracks = [];
    // Stages tree for the current EventLatency.
    eventLatencyBreakdown;
    // Stages tree for the next EventLatency.
    nextEventLatencyBreakdown;
    // Stages tree for the prev EventLatency.
    prevEventLatencyBreakdown;
    tracksByTrackId;
    constructor(trace, id) {
        this.trace = trace;
        this.id = id;
        this.tracksByTrackId = new Map();
        this.trace.tracks.getAllTracks().forEach((td) => {
            td.tags?.trackIds?.forEach((trackId) => {
                this.tracksByTrackId.set(trackId, td.uri);
            });
        });
    }
    async load() {
        const queryResult = await this.trace.engine.query(`
      SELECT
        name
      FROM slice
      WHERE id = ${this.id}
      `);
        const iter = queryResult.firstRow({
            name: query_result_1.STR,
        });
        this.name = iter.name;
        await this.loadSlice();
        await this.loadJankSlice();
        await this.loadRelevantThreads();
        await this.loadEventLatencyBreakdown();
    }
    async loadSlice() {
        this.sliceDetails = await (0, slice_1.getSlice)(this.trace.engine, (0, core_types_1.asSliceSqlId)(this.id));
        this.trace.scheduleFullRedraw();
    }
    async loadJankSlice() {
        if (!this.sliceDetails)
            return;
        // Get the id for the top-level EventLatency slice (this or parent), as
        // this id is used in the ScrollJankV3 track to identify the corresponding
        // janky interval.
        if (this.sliceDetails.name === 'EventLatency') {
            this.topEventLatencyId = this.sliceDetails.id;
        }
        else {
            this.topEventLatencyId = (0, core_types_1.asSliceSqlId)(await this.getOldestAncestorSliceId());
        }
        const it = (await this.trace.engine.query(`
      SELECT ts, dur, id, cause_of_jank as causeOfJank
      FROM chrome_janky_frame_presentation_intervals
      WHERE event_latency_id = ${this.topEventLatencyId}`)).iter({
            id: query_result_1.NUM,
            ts: query_result_1.LONG,
            dur: query_result_1.LONG,
            causeOfJank: query_result_1.STR,
        });
        if (it.valid()) {
            this.jankySlice = {
                id: it.id,
                ts: time_1.Time.fromRaw(it.ts),
                dur: time_1.Duration.fromRaw(it.dur),
                causeOfJank: it.causeOfJank,
            };
        }
    }
    async loadRelevantThreads() {
        if (!this.sliceDetails)
            return;
        if (!this.topEventLatencyId)
            return;
        // Relevant threads should only be available on a "Janky" EventLatency
        // slice to allow the user to jump to the possible cause of jank.
        if (this.sliceDetails.name === 'EventLatency' && !this.jankySlice)
            return;
        const possibleScrollJankStage = await (0, scroll_jank_cause_link_utils_1.getScrollJankCauseStage)(this.trace.engine, this.topEventLatencyId);
        if (this.sliceDetails.name === 'EventLatency') {
            this.isJankStage = true;
            this.relevantThreadStage = possibleScrollJankStage;
        }
        else {
            if (possibleScrollJankStage &&
                this.sliceDetails.name === possibleScrollJankStage.name) {
                this.isJankStage = true;
            }
            this.relevantThreadStage = {
                name: this.sliceDetails.name,
                eventLatencyId: this.topEventLatencyId,
                ts: this.sliceDetails.ts,
                dur: this.sliceDetails.dur,
            };
        }
        if (this.relevantThreadStage) {
            this.relevantThreadTracks = await (0, scroll_jank_cause_link_utils_1.getEventLatencyCauseTracks)(this.trace.engine, this.relevantThreadStage);
        }
    }
    async loadEventLatencyBreakdown() {
        if (this.topEventLatencyId === undefined) {
            return;
        }
        this.eventLatencyBreakdown = await (0, slice_1.getDescendantSliceTree)(this.trace.engine, this.topEventLatencyId);
        // TODO(altimin): this should only consider EventLatencies within the same scroll.
        const prevEventLatency = (await this.trace.engine.query(`
      INCLUDE PERFETTO MODULE chrome.event_latency;
      SELECT
        id
      FROM chrome_event_latencies
      WHERE event_type IN (
        'FIRST_GESTURE_SCROLL_UPDATE',
        'GESTURE_SCROLL_UPDATE',
        'INERTIAL_GESTURE_SCROLL_UPDATE')
      AND is_presented
      AND id < ${this.topEventLatencyId}
      ORDER BY id DESC
      LIMIT 1
      ;
    `)).maybeFirstRow({ id: query_result_1.NUM });
        if (prevEventLatency !== undefined) {
            this.prevEventLatencyBreakdown = await (0, slice_1.getDescendantSliceTree)(this.trace.engine, (0, core_types_1.asSliceSqlId)(prevEventLatency.id));
        }
        const nextEventLatency = (await this.trace.engine.query(`
      INCLUDE PERFETTO MODULE chrome.event_latency;
      SELECT
        id
      FROM chrome_event_latencies
      WHERE event_type IN (
        'FIRST_GESTURE_SCROLL_UPDATE',
        'GESTURE_SCROLL_UPDATE',
        'INERTIAL_GESTURE_SCROLL_UPDATE')
      AND is_presented
      AND id > ${this.topEventLatencyId}
      ORDER BY id DESC
      LIMIT 1;
    `)).maybeFirstRow({ id: query_result_1.NUM });
        if (nextEventLatency !== undefined) {
            this.nextEventLatencyBreakdown = await (0, slice_1.getDescendantSliceTree)(this.trace.engine, (0, core_types_1.asSliceSqlId)(nextEventLatency.id));
        }
    }
    getRelevantLinks() {
        if (!this.sliceDetails)
            return undefined;
        // Relevant threads should only be available on a "Janky" EventLatency
        // slice to allow the user to jump to the possible cause of jank.
        if (this.sliceDetails.name === 'EventLatency' &&
            !this.relevantThreadStage) {
            return undefined;
        }
        const name = this.relevantThreadStage
            ? this.relevantThreadStage.name
            : this.sliceDetails.name;
        const ts = this.relevantThreadStage
            ? this.relevantThreadStage.ts
            : this.sliceDetails.ts;
        const dur = this.relevantThreadStage
            ? this.relevantThreadStage.dur
            : this.sliceDetails.dur;
        const stageDetails = scroll_jank_cause_map_1.ScrollJankCauseMap.getEventLatencyDetails(name);
        if (stageDetails === undefined)
            return undefined;
        const childWidgets = [];
        childWidgets.push((0, mithril_1.default)(text_paragraph_1.TextParagraph, { text: stageDetails.description }));
        const columns = [
            (0, table_1.widgetColumn)('Relevant Thread', (x) => (0, scroll_jank_cause_link_utils_1.getCauseLink)(this.trace, x.tracks, this.tracksByTrackId, x.ts, x.dur)),
            (0, table_1.widgetColumn)('Description', (x) => {
                if (x.description === '') {
                    return x.description;
                }
                else {
                    return (0, mithril_1.default)(text_paragraph_1.TextParagraph, { text: x.description });
                }
            }),
        ];
        const trackLinks = [];
        for (let i = 0; i < this.relevantThreadTracks.length; i++) {
            const track = this.relevantThreadTracks[i];
            let description = '';
            if (i == 0 || track.thread != this.relevantThreadTracks[i - 1].thread) {
                description = track.causeDescription;
            }
            trackLinks.push({
                description: description,
                tracks: this.relevantThreadTracks[i],
                ts: ts,
                dur: dur,
            });
        }
        const tableData = new table_1.TableData(trackLinks);
        if (trackLinks.length > 0) {
            childWidgets.push((0, mithril_1.default)(table_1.Table, {
                data: tableData,
                columns: columns,
            }));
        }
        return (0, mithril_1.default)(section_1.Section, { title: this.isJankStage ? `Jank Cause: ${name}` : name }, childWidgets);
    }
    async getOldestAncestorSliceId() {
        let eventLatencyId = -1;
        if (!this.sliceDetails)
            return eventLatencyId;
        const queryResult = await this.trace.engine.query(`
      SELECT
        id
      FROM ancestor_slice(${this.sliceDetails.id})
      WHERE name = 'EventLatency'
    `);
        const it = queryResult.iter({
            id: query_result_1.NUM,
        });
        for (; it.valid(); it.next()) {
            eventLatencyId = it.id;
            break;
        }
        return eventLatencyId;
    }
    getLinksSection() {
        return (0, mithril_1.default)(section_1.Section, { title: 'Quick links' }, (0, mithril_1.default)(tree_1.Tree, (0, mithril_1.default)(tree_1.TreeNode, {
            left: this.sliceDetails
                ? (0, slice_2.sliceRef)(this.sliceDetails, 'EventLatency in context of other Input events')
                : 'EventLatency in context of other Input events',
            right: this.sliceDetails ? '' : 'N/A',
        }), this.jankySlice &&
            (0, mithril_1.default)(tree_1.TreeNode, {
                left: (0, selection_utils_1.renderSliceRef)({
                    trace: this.trace,
                    id: this.jankySlice.id,
                    trackUri: selection_utils_1.JANKS_TRACK_URI,
                    title: this.jankySlice.causeOfJank,
                }),
            })));
    }
    getBreakdownSection() {
        if (this.eventLatencyBreakdown === undefined) {
            return undefined;
        }
        const attrs = {
            rows: [this.eventLatencyBreakdown],
            getChildren: (slice) => slice.children,
            columns: [
                { name: 'Name', getData: (slice) => slice.name },
                { name: 'Duration', getData: (slice) => time_1.Duration.humanise(slice.dur) },
                {
                    name: 'vs prev',
                    getData: (slice) => durationDelta(slice.dur, findSliceInTreeByPath(this.prevEventLatencyBreakdown, getPath(slice))?.dur),
                },
                {
                    name: 'vs next',
                    getData: (slice) => durationDelta(slice.dur, findSliceInTreeByPath(this.nextEventLatencyBreakdown, getPath(slice))?.dur),
                },
            ],
        };
        return (0, mithril_1.default)(section_1.Section, {
            title: 'EventLatency Stage Breakdown',
        }, (0, mithril_1.default)((treetable_1.TreeTable), attrs));
    }
    getDescriptionText() {
        return (0, mithril_1.default)(text_paragraph_1.MultiParagraphText, (0, mithril_1.default)(text_paragraph_1.TextParagraph, {
            text: `EventLatency tracks the latency of handling a given input event
                 (Scrolls, Touches, Taps, etc). Ideally from when the input was
                 read by the hardware to when it was reflected on the screen.`,
        }), (0, mithril_1.default)(text_paragraph_1.TextParagraph, {
            text: `Note however the concept of coalescing or terminating early. This
               occurs when we receive multiple events or handle them quickly by
               converting them into a different event. Such as a TOUCH_MOVE
               being converted into a GESTURE_SCROLL_UPDATE type, or a multiple
               GESTURE_SCROLL_UPDATE events being formed into a single frame at
               the end of the RendererCompositorQueuingDelay.`,
        }), (0, mithril_1.default)(text_paragraph_1.TextParagraph, {
            text: `*Important:* On some platforms (MacOS) we do not get feedback on
               when something is presented on the screen so the timings are only
               accurate for what we know on a given platform.`,
        }));
    }
    render() {
        if (this.sliceDetails) {
            const slice = this.sliceDetails;
            const rightSideWidgets = [];
            rightSideWidgets.push((0, mithril_1.default)(section_1.Section, { title: 'Description' }, (0, mithril_1.default)('.div', this.getDescriptionText())));
            const stageWidget = this.getRelevantLinks();
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            if (stageWidget) {
                rightSideWidgets.push(stageWidget);
            }
            rightSideWidgets.push(this.getLinksSection());
            rightSideWidgets.push(this.getBreakdownSection());
            return (0, mithril_1.default)(details_shell_1.DetailsShell, {
                title: 'Slice',
                description: this.name,
            }, (0, mithril_1.default)(grid_layout_1.GridLayout, (0, mithril_1.default)(grid_layout_1.GridLayoutColumn, (0, slice_details_1.renderDetails)(this.trace, slice), (0, slice_args_1.hasArgs)(slice.args) &&
                (0, mithril_1.default)(section_1.Section, { title: 'Arguments' }, (0, mithril_1.default)(tree_1.Tree, (0, slice_args_1.renderArguments)(this.trace, slice.args)))), (0, mithril_1.default)(grid_layout_1.GridLayoutColumn, rightSideWidgets)));
        }
        else {
            return (0, mithril_1.default)(details_shell_1.DetailsShell, { title: 'Slice', description: 'Loading...' });
        }
    }
}
exports.EventLatencySliceDetailsPanel = EventLatencySliceDetailsPanel;
//# sourceMappingURL=event_latency_details_panel.js.map