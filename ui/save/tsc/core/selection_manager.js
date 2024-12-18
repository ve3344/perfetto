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
exports.SelectionManagerImpl = void 0;
const logging_1 = require("../base/logging");
const time_1 = require("../base/time");
const raf_scheduler_1 = require("./raf_scheduler");
const utils_1 = require("../base/utils");
const selection_aggregation_manager_1 = require("./selection_aggregation_manager");
const async_limiter_1 = require("../base/async_limiter");
const INSTANT_FOCUS_DURATION = 1n;
const INCOMPLETE_SLICE_DURATION = 30000n;
// There are two selection-related states in this class.
// 1. _selection: This is the "input" / locator of the selection, what other
//    parts of the codebase specify (e.g., a tuple of trackUri + eventId) to say
//    "please select this object if it exists".
// 2. _selected{Slice,ThreadState}: This is the resolved selection, that is, the
//    rich details about the object that has been selected. If the input
//    `_selection` is valid, this is filled in the near future. Doing so
//    requires querying the SQL engine, which is an async operation.
class SelectionManagerImpl {
    trackManager;
    noteManager;
    scrollHelper;
    onSelectionChange;
    detailsPanelLimiter = new async_limiter_1.AsyncLimiter();
    _selection = { kind: 'empty' };
    _aggregationManager;
    // Incremented every time _selection changes.
    selectionResolvers = new Array();
    detailsPanels = new WeakMap();
    constructor(engine, trackManager, noteManager, scrollHelper, onSelectionChange) {
        this.trackManager = trackManager;
        this.noteManager = noteManager;
        this.scrollHelper = scrollHelper;
        this.onSelectionChange = onSelectionChange;
        this._aggregationManager = new selection_aggregation_manager_1.SelectionAggregationManager(engine.getProxy('SelectionAggregationManager'));
    }
    registerAreaSelectionAggregator(aggr) {
        this._aggregationManager.registerAggregator(aggr);
    }
    clear() {
        this.setSelection({ kind: 'empty' });
    }
    async selectTrackEvent(trackUri, eventId, opts) {
        this.selectTrackEventInternal(trackUri, eventId, opts);
    }
    selectTrack(trackUri, opts) {
        this.setSelection({ kind: 'track', trackUri }, opts);
    }
    selectNote(args, opts) {
        this.setSelection({
            kind: 'note',
            id: args.id,
        }, opts);
    }
    selectArea(area, opts) {
        const { start, end } = area;
        (0, logging_1.assertTrue)(start <= end);
        // In the case of area selection, the caller provides a list of trackUris.
        // However, all the consumer want to access the resolved TrackDescriptor.
        // Rather than delegating this to the various consumers, we resolve them
        // now once and for all and place them in the selection object.
        const tracks = [];
        for (const uri of area.trackUris) {
            const trackDescr = this.trackManager.getTrack(uri);
            if (trackDescr === undefined)
                continue;
            tracks.push(trackDescr);
        }
        this.setSelection({
            ...area,
            kind: 'area',
            tracks,
        }, opts);
    }
    deserialize(serialized) {
        if (serialized === undefined) {
            return;
        }
        switch (serialized.kind) {
            case 'TRACK_EVENT':
                this.selectTrackEventInternal(serialized.trackKey, parseInt(serialized.eventId), undefined, serialized.detailsPanel);
                break;
            case 'AREA':
                this.selectArea({
                    start: serialized.start,
                    end: serialized.end,
                    trackUris: serialized.trackUris,
                });
        }
    }
    toggleTrackAreaSelection(trackUri) {
        const curSelection = this._selection;
        if (curSelection.kind !== 'area')
            return;
        let trackUris = curSelection.trackUris.slice();
        if (!trackUris.includes(trackUri)) {
            trackUris.push(trackUri);
        }
        else {
            trackUris = trackUris.filter((t) => t !== trackUri);
        }
        this.selectArea({
            ...curSelection,
            trackUris,
        });
    }
    toggleGroupAreaSelection(trackUris) {
        const curSelection = this._selection;
        if (curSelection.kind !== 'area')
            return;
        const allTracksSelected = trackUris.every((t) => curSelection.trackUris.includes(t));
        let newTrackUris;
        if (allTracksSelected) {
            // Deselect all tracks in the list
            newTrackUris = curSelection.trackUris.filter((t) => !trackUris.includes(t));
        }
        else {
            newTrackUris = curSelection.trackUris.slice();
            trackUris.forEach((t) => {
                if (!newTrackUris.includes(t)) {
                    newTrackUris.push(t);
                }
            });
        }
        this.selectArea({
            ...curSelection,
            trackUris: newTrackUris,
        });
    }
    get selection() {
        return this._selection;
    }
    getDetailsPanelForSelection() {
        return this.detailsPanels.get(this._selection);
    }
    registerSqlSelectionResolver(resolver) {
        this.selectionResolvers.push(resolver);
    }
    async resolveSqlEvent(sqlTableName, id) {
        const matchingResolvers = this.selectionResolvers.filter((r) => r.sqlTableName === sqlTableName);
        for (const resolver of matchingResolvers) {
            const result = await resolver.callback(id, sqlTableName);
            if (result) {
                // If we have multiple resolvers for the same table, just return the first one.
                return result;
            }
        }
        return undefined;
    }
    selectSqlEvent(sqlTableName, id, opts) {
        this.resolveSqlEvent(sqlTableName, id).then((selection) => {
            selection &&
                this.selectTrackEvent(selection.trackUri, selection.eventId, opts);
        });
    }
    setSelection(selection, opts) {
        this._selection = selection;
        this.onSelectionChange(selection, opts ?? {});
        raf_scheduler_1.raf.scheduleFullRedraw();
        if (opts?.scrollToSelection) {
            this.scrollToCurrentSelection();
        }
        if (this._selection.kind === 'area') {
            this._aggregationManager.aggregateArea(this._selection);
        }
        else {
            this._aggregationManager.clear();
        }
    }
    selectSearchResult(searchResult) {
        const { source, eventId, trackUri } = searchResult;
        if (eventId === undefined) {
            return;
        }
        switch (source) {
            case 'track':
                this.selectTrack(trackUri, {
                    clearSearch: false,
                    scrollToSelection: true,
                });
                break;
            case 'cpu':
                this.selectSqlEvent('sched_slice', eventId, {
                    clearSearch: false,
                    scrollToSelection: true,
                    switchToCurrentSelectionTab: true,
                });
                break;
            case 'log':
                // TODO(stevegolton): Get log selection working.
                break;
            case 'slice':
                // Search results only include slices from the slice table for now.
                // When we include annotations we need to pass the correct table.
                this.selectSqlEvent('slice', eventId, {
                    clearSearch: false,
                    scrollToSelection: true,
                    switchToCurrentSelectionTab: true,
                });
                break;
            default:
                (0, logging_1.assertUnreachable)(source);
        }
    }
    scrollToCurrentSelection() {
        const uri = (() => {
            switch (this.selection.kind) {
                case 'track_event':
                case 'track':
                    return this.selection.trackUri;
                // TODO(stevegolton): Handle scrolling to area and note selections.
                default:
                    return undefined;
            }
        })();
        const range = this.findFocusRangeOfSelection();
        this.scrollHelper.scrollTo({
            time: range ? { ...range } : undefined,
            track: uri ? { uri: uri, expandGroup: true } : undefined,
        });
    }
    // Finds the time range range that we should actually focus on - using dummy
    // values for instant and incomplete slices, so we don't end up super zoomed
    // in.
    findFocusRangeOfSelection() {
        const sel = this.selection;
        if (sel.kind === 'track_event') {
            // The focus range of slices is different to that of the actual span
            if (sel.dur === -1n) {
                return time_1.TimeSpan.fromTimeAndDuration(sel.ts, INCOMPLETE_SLICE_DURATION);
            }
            else if (sel.dur === 0n) {
                return time_1.TimeSpan.fromTimeAndDuration(sel.ts, INSTANT_FOCUS_DURATION);
            }
            else {
                return time_1.TimeSpan.fromTimeAndDuration(sel.ts, sel.dur);
            }
        }
        else {
            return this.findTimeRangeOfSelection();
        }
    }
    async selectTrackEventInternal(trackUri, eventId, opts, serializedDetailsPanel) {
        const details = await this.trackManager
            .getTrack(trackUri)
            ?.track.getSelectionDetails?.(eventId);
        if (!(0, utils_1.exists)(details)) {
            throw new Error('Unable to resolve selection details');
        }
        const selection = {
            ...details,
            kind: 'track_event',
            trackUri,
            eventId,
        };
        this.createTrackEventDetailsPanel(selection, serializedDetailsPanel);
        this.setSelection(selection, opts);
    }
    createTrackEventDetailsPanel(selection, serializedState) {
        const td = this.trackManager.getTrack(selection.trackUri);
        if (!td) {
            return;
        }
        const panel = td.track.detailsPanel?.(selection);
        if (!panel) {
            return;
        }
        if (panel.serialization && serializedState !== undefined) {
            const res = panel.serialization.schema.safeParse(serializedState);
            if (res.success) {
                panel.serialization.state = res.data;
            }
        }
        const detailsPanel = {
            render: () => panel.render(),
            serializatonState: () => panel.serialization?.state,
            isLoading: true,
        };
        // Associate this details panel with this selection object
        this.detailsPanels.set(selection, detailsPanel);
        this.detailsPanelLimiter.schedule(async () => {
            await panel?.load?.(selection);
            detailsPanel.isLoading = false;
            raf_scheduler_1.raf.scheduleFullRedraw();
        });
    }
    findTimeRangeOfSelection() {
        const sel = this.selection;
        if (sel.kind === 'area') {
            return new time_1.TimeSpan(sel.start, sel.end);
        }
        else if (sel.kind === 'note') {
            const selectedNote = this.noteManager.getNote(sel.id);
            if (selectedNote !== undefined) {
                const kind = selectedNote.noteType;
                switch (kind) {
                    case 'SPAN':
                        return new time_1.TimeSpan(selectedNote.start, selectedNote.end);
                    case 'DEFAULT':
                        return time_1.TimeSpan.fromTimeAndDuration(selectedNote.timestamp, INSTANT_FOCUS_DURATION);
                    default:
                        (0, logging_1.assertUnreachable)(kind);
                }
            }
        }
        else if (sel.kind === 'track_event') {
            return time_1.TimeSpan.fromTimeAndDuration(sel.ts, sel.dur);
        }
        return undefined;
    }
    get aggregation() {
        return this._aggregationManager;
    }
}
exports.SelectionManagerImpl = SelectionManagerImpl;
//# sourceMappingURL=selection_manager.js.map