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
exports.serializeAppState = serializeAppState;
exports.parseAppState = parseAppState;
exports.deserializeAppStatePhase1 = deserializeAppStatePhase1;
exports.deserializeAppStatePhase2 = deserializeAppStatePhase2;
exports.JsonSerialize = JsonSerialize;
const state_serialization_schema_1 = require("./state_serialization_schema");
const time_1 = require("../base/time");
// When it comes to serialization & permalinks there are two different use cases
// 1. Uploading the current trace in a Cloud Storage (GCS) file AND serializing
//    the app state into a different GCS JSON file. This is what happens when
//    clicking on "share trace" on a local file manually opened.
// 2. [future use case] Uploading the current state in a GCS JSON file, but
//    letting the trace file come from a deep-link via postMessage().
//    This is the case when traces are opened via Dashboards (e.g. APC) and we
//    want to persist only the state itself, not the trace file.
//
// In order to do so, we have two layers of serialization
// 1. Serialization of the app state (This file):
//    This is a JSON object that represents the visual app state (pinned tracks,
//    visible viewport bounds, etc) BUT not the trace source.
// 2. An outer layer that contains the app state AND a link to the trace file.
//    (permalink.ts)
//
// In a nutshell:
//   AppState:  {viewport: {...}, pinnedTracks: {...}, notes: {...}}
//   Permalink: {appState: {see above}, traceUrl: 'https://gcs/trace/file'}
//
// This file deals with the app state. permalink.ts deals with the outer layer.
/**
 * Serializes the current app state into a JSON-friendly POJO that can be stored
 * in a permalink (@see permalink.ts).
 * @returns A @type {SerializedAppState} object, @see state_serialization_schema.ts
 */
function serializeAppState(trace) {
    const vizWindow = trace.timeline.visibleWindow.toTimeSpan();
    const notes = new Array();
    for (const [id, note] of trace.notes.notes.entries()) {
        if (note.noteType === 'DEFAULT') {
            notes.push({
                noteType: 'DEFAULT',
                id,
                start: note.timestamp,
                color: note.color,
                text: note.text,
            });
        }
        else if (note.noteType === 'SPAN') {
            notes.push({
                noteType: 'SPAN',
                id,
                start: note.start,
                end: note.end,
                color: note.color,
                text: note.text,
            });
        }
    }
    const selection = new Array();
    const stateSel = trace.selection.selection;
    if (stateSel.kind === 'track_event') {
        selection.push({
            kind: 'TRACK_EVENT',
            trackKey: stateSel.trackUri,
            eventId: stateSel.eventId.toString(),
            detailsPanel: trace.selection
                .getDetailsPanelForSelection()
                ?.serializatonState(),
        });
    }
    else if (stateSel.kind === 'area') {
        selection.push({
            kind: 'AREA',
            trackUris: stateSel.trackUris,
            start: stateSel.start,
            end: stateSel.end,
        });
    }
    const plugins = new Array();
    const pluginsStore = trace.getPluginStoreForSerialization();
    for (const [id, pluginState] of Object.entries(pluginsStore)) {
        plugins.push({ id, state: pluginState });
    }
    return {
        version: state_serialization_schema_1.SERIALIZED_STATE_VERSION,
        pinnedTracks: trace.workspace.pinnedTracks
            .map((t) => t.uri)
            .filter((uri) => uri !== undefined),
        viewport: {
            start: vizWindow.start,
            end: vizWindow.end,
        },
        notes,
        selection,
        plugins,
    };
}
/**
 * Parses the app state from a JSON blob.
 * @param jsonDecodedObj the output of JSON.parse() that needs validation
 * @returns Either a @type {SerializedAppState} object or an error.
 */
function parseAppState(jsonDecodedObj) {
    const parseRes = state_serialization_schema_1.APP_STATE_SCHEMA.safeParse(jsonDecodedObj);
    if (parseRes.success) {
        if (parseRes.data.version == state_serialization_schema_1.SERIALIZED_STATE_VERSION) {
            return { success: true, data: parseRes.data };
        }
        else {
            return {
                success: false,
                error: `SERIALIZED_STATE_VERSION mismatch ` +
                    `(actual: ${parseRes.data.version}, ` +
                    `expected: ${state_serialization_schema_1.SERIALIZED_STATE_VERSION})`,
            };
        }
    }
    return { success: false, error: parseRes.error.toString() };
}
/**
 * This function gets invoked after the trace is loaded, but before plugins,
 * track decider and initial selections are run.
 * @param appState the .data object returned by parseAppState() when successful.
 */
function deserializeAppStatePhase1(appState, trace) {
    // Restore the plugin state.
    trace.getPluginStoreForSerialization().edit((draft) => {
        for (const p of appState.plugins ?? []) {
            draft[p.id] = p.state ?? {};
        }
    });
}
/**
 * This function gets invoked after the trace controller has run and all plugins
 * have executed.
 * @param appState the .data object returned by parseAppState() when successful.
 * @param trace the target trace object to manipulate.
 */
function deserializeAppStatePhase2(appState, trace) {
    if (appState.viewport !== undefined) {
        trace.timeline.updateVisibleTime(new time_1.TimeSpan(appState.viewport.start, appState.viewport.end));
    }
    // Restore the pinned tracks, if they exist.
    for (const uri of appState.pinnedTracks) {
        const track = trace.workspace.findTrackByUri(uri);
        if (track) {
            track.pin();
        }
    }
    // Restore notes.
    for (const note of appState.notes) {
        const commonArgs = {
            id: note.id,
            timestamp: note.start,
            color: note.color,
            text: note.text,
        };
        if (note.noteType === 'DEFAULT') {
            trace.notes.addNote({ ...commonArgs });
        }
        else if (note.noteType === 'SPAN') {
            trace.notes.addSpanNote({
                ...commonArgs,
                start: commonArgs.timestamp,
                end: note.end,
            });
        }
    }
    // Restore the selection
    trace.selection.deserialize(appState.selection[0]);
}
/**
 * Performs JSON serialization, taking care of also serializing BigInt->string.
 * For the matching deserializer see zType in state_serialization_schema.ts.
 * @param obj A POJO, typically a SerializedAppState or PermalinkState.
 * @returns JSON-encoded string.
 */
function JsonSerialize(obj) {
    return JSON.stringify(obj, (_key, value) => {
        if (typeof value === 'bigint') {
            return value.toString();
        }
        return value;
    });
}
//# sourceMappingURL=state_serialization.js.map