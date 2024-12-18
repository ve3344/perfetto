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
exports.createPermalink = createPermalink;
exports.loadPermalink = loadPermalink;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const logging_1 = require("../base/logging");
const state_serialization_1 = require("../core/state_serialization");
const gcs_uploader_1 = require("../base/gcs_uploader");
const state_serialization_schema_1 = require("../core/state_serialization_schema");
const zod_1 = require("zod");
const modal_1 = require("../widgets/modal");
const app_impl_1 = require("../core/app_impl");
const copyable_link_1 = require("../widgets/copyable_link");
// Permalink serialization has two layers:
// 1. Serialization of the app state (state_serialization.ts):
//    This is a JSON object that represents the visual app state (pinned tracks,
//    visible viewport bounds, etc) BUT not the trace source.
// 2. An outer layer that contains the app state AND a link to the trace file.
//    (This file)
//
// In a nutshell:
//   AppState:  {viewport: {...}, pinnedTracks: {...}, notes: {...}}
//   Permalink: {appState: {see above}, traceUrl: 'https://gcs/trace/file'}
//
// This file deals with the outer layer, state_serialization.ts with the inner.
const PERMALINK_SCHEMA = zod_1.z.object({
    traceUrl: zod_1.z.string().optional(),
    // We don't want to enforce validation at this level but want to delegate it
    // to parseAppState(), for two reasons:
    // 1. parseAppState() does further semantic checks (e.g. version checking).
    // 2. We want to still load the traceUrl even if the app state is invalid.
    appState: zod_1.z.any().optional(),
});
async function createPermalink() {
    const hash = await createPermalinkInternal();
    showPermalinkDialog(hash);
}
// Returns the file name, not the full url (i.e. the name of the GCS object).
async function createPermalinkInternal() {
    const permalinkData = {};
    // Check if we need to upload the trace file, before serializing the app
    // state.
    let alreadyUploadedUrl = '';
    const trace = (0, logging_1.assertExists)(app_impl_1.AppImpl.instance.trace);
    const traceSource = trace.traceInfo.source;
    let dataToUpload = undefined;
    let traceName = trace.traceInfo.traceTitle || 'trace';
    if (traceSource.type === 'FILE') {
        dataToUpload = traceSource.file;
        traceName = dataToUpload.name;
    }
    else if (traceSource.type === 'ARRAY_BUFFER') {
        dataToUpload = traceSource.buffer;
    }
    else if (traceSource.type === 'URL') {
        alreadyUploadedUrl = traceSource.url;
    }
    else {
        throw new Error(`Cannot share trace ${JSON.stringify(traceSource)}`);
    }
    // Upload the trace file, unless it's already uploaded (type == 'URL').
    // Internally TraceGcsUploader will skip the upload if an object with the
    // same hash exists already.
    if (alreadyUploadedUrl) {
        permalinkData.traceUrl = alreadyUploadedUrl;
    }
    else if (dataToUpload !== undefined) {
        updateStatus(`Uploading ${traceName}`);
        const uploader = new gcs_uploader_1.GcsUploader(dataToUpload, {
            mimeType: gcs_uploader_1.MIME_BINARY,
            onProgress: () => reportUpdateProgress(uploader),
        });
        await uploader.waitForCompletion();
        permalinkData.traceUrl = uploader.uploadedUrl;
    }
    permalinkData.appState = (0, state_serialization_1.serializeAppState)(trace);
    // Serialize the permalink with the app state (or recording state) and upload.
    updateStatus(`Creating permalink...`);
    const permalinkJson = (0, state_serialization_1.JsonSerialize)(permalinkData);
    const uploader = new gcs_uploader_1.GcsUploader(permalinkJson, {
        mimeType: gcs_uploader_1.MIME_JSON,
        onProgress: () => reportUpdateProgress(uploader),
    });
    await uploader.waitForCompletion();
    return uploader.uploadedFileName;
}
/**
 * Loads a permalink from Google Cloud Storage.
 * This is invoked when passing !#?s=fileName to URL.
 * @param gcsFileName the file name of the cloud storage object. This is
 * expected to be a JSON file that respects the schema defined by
 * PERMALINK_SCHEMA.
 */
async function loadPermalink(gcsFileName) {
    // Otherwise, this is a request to load the permalink.
    const url = `https://storage.googleapis.com/${gcs_uploader_1.BUCKET_NAME}/${gcsFileName}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Could not fetch permalink.\n URL: ${url}`);
    }
    const text = await response.text();
    const permalinkJson = JSON.parse(text);
    let permalink;
    let error = '';
    // Try to recover permalinks generated by older versions of the UI before
    // r.android.com/3119920 .
    const convertedLegacyPermalink = tryLoadLegacyPermalink(permalinkJson);
    if (convertedLegacyPermalink !== undefined) {
        permalink = convertedLegacyPermalink;
    }
    else {
        const res = PERMALINK_SCHEMA.safeParse(permalinkJson);
        if (res.success) {
            permalink = res.data;
        }
        else {
            error = res.error.toString();
            permalink = {};
        }
    }
    let serializedAppState = undefined;
    if (permalink.appState !== undefined) {
        // This is the most common case where the permalink contains the app state
        // (and optionally a traceUrl, below).
        const parseRes = (0, state_serialization_1.parseAppState)(permalink.appState);
        if (parseRes.success) {
            serializedAppState = parseRes.data;
        }
        else {
            error = parseRes.error;
        }
    }
    if (permalink.traceUrl) {
        app_impl_1.AppImpl.instance.openTraceFromUrl(permalink.traceUrl, serializedAppState);
    }
    if (error) {
        (0, modal_1.showModal)({
            title: 'Failed to restore the serialized app state',
            content: (0, mithril_1.default)('div', (0, mithril_1.default)('p', 'Something went wrong when restoring the app state.' +
                'This is due to some backwards-incompatible change ' +
                'when the permalink is generated and then opened using ' +
                'two different UI versions.'), (0, mithril_1.default)('p', "I'm going to try to open the trace file anyways, but " +
                'the zoom level, pinned tracks and other UI ' +
                "state wont't be recovered"), (0, mithril_1.default)('p', 'Error details:'), (0, mithril_1.default)('.modal-logs', error)),
            buttons: [
                {
                    text: 'Open only the trace file',
                    primary: true,
                },
            ],
        });
    }
}
// Tries to recover a previous permalink, before the split in two layers,
// where the permalink JSON contains the app state, which contains inside it
// the trace URL.
// If we suceed, convert it to a new-style JSON object preserving some minimal
// information (really just vieport and pinned tracks).
function tryLoadLegacyPermalink(data) {
    const legacyData = data;
    if (legacyData.version === undefined)
        return undefined;
    const vizState = legacyData.frontendLocalState?.visibleState;
    return {
        traceUrl: legacyData.engine?.source?.url,
        appState: {
            version: state_serialization_schema_1.SERIALIZED_STATE_VERSION,
            pinnedTracks: legacyData.pinnedTracks ?? [],
            viewport: vizState
                ? { start: vizState.start?.value, end: vizState.end?.value }
                : undefined,
        },
    };
}
function reportUpdateProgress(uploader) {
    switch (uploader.state) {
        case 'UPLOADING':
            const statusTxt = `Uploading ${uploader.getEtaString()}`;
            updateStatus(statusTxt);
            break;
        case 'ERROR':
            updateStatus(`Upload failed ${uploader.error}`);
            break;
        default:
            break;
    } // switch (state)
}
function updateStatus(msg) {
    app_impl_1.AppImpl.instance.omnibox.showStatusMessage(msg);
}
function showPermalinkDialog(hash) {
    (0, modal_1.showModal)({
        title: 'Permalink',
        content: (0, mithril_1.default)(copyable_link_1.CopyableLink, { url: `${self.location.origin}/#!/?s=${hash}` }),
    });
}
//# sourceMappingURL=permalink.js.map