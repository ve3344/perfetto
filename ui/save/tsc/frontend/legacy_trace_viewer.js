"use strict";
// Copyright (C) 2018 The Android Open Source Project
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
exports.isLegacyTrace = isLegacyTrace;
exports.openFileWithLegacyTraceViewer = openFileWithLegacyTraceViewer;
exports.openInOldUIWithSizeCheck = openInOldUIWithSizeCheck;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const pako_1 = require("pako");
const logging_1 = require("../base/logging");
const object_utils_1 = require("../base/object_utils");
const modal_1 = require("../widgets/modal");
const string_utils_1 = require("../base/string_utils");
const trace_converter_1 = require("./trace_converter");
const assets_1 = require("../base/assets");
const CTRACE_HEADER = 'TRACE:\n';
async function isCtrace(file) {
    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.ctrace')) {
        return true;
    }
    // .ctrace files sometimes end with .txt. We can detect these via
    // the presence of TRACE: near the top of the file.
    if (fileName.endsWith('.txt')) {
        const header = await readText(file.slice(0, 128));
        if (header.includes(CTRACE_HEADER)) {
            return true;
        }
    }
    return false;
}
function readText(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if ((0, object_utils_1.isString)(reader.result)) {
                return resolve(reader.result);
            }
        };
        reader.onerror = (err) => {
            reject(err);
        };
        reader.readAsText(blob);
    });
}
async function isLegacyTrace(file) {
    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.json') ||
        fileName.endsWith('.json.gz') ||
        fileName.endsWith('.zip') ||
        fileName.endsWith('.html')) {
        return true;
    }
    if (await isCtrace(file)) {
        return true;
    }
    // Sometimes systrace formatted traces end with '.trace'. This is a
    // little generic to assume all such traces are systrace format though
    // so we read the beginning of the file and check to see if is has the
    // systrace header (several comment lines):
    if (fileName.endsWith('.trace')) {
        const header = await readText(file.slice(0, 512));
        const lines = header.split('\n');
        let commentCount = 0;
        for (const line of lines) {
            if (line.startsWith('#')) {
                commentCount++;
            }
        }
        if (commentCount > 5) {
            return true;
        }
    }
    return false;
}
async function openFileWithLegacyTraceViewer(file) {
    const reader = new FileReader();
    reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
            return openBufferWithLegacyTraceViewer(file.name, reader.result, reader.result.byteLength);
        }
        else {
            const str = reader.result;
            return openBufferWithLegacyTraceViewer(file.name, str, str.length);
        }
    };
    reader.onerror = (err) => {
        console.error(err);
    };
    if (file.name.endsWith('.gz') ||
        file.name.endsWith('.zip') ||
        (await isCtrace(file))) {
        reader.readAsArrayBuffer(file);
    }
    else {
        reader.readAsText(file);
    }
}
function openBufferWithLegacyTraceViewer(name, data, size) {
    if (data instanceof ArrayBuffer) {
        (0, logging_1.assertTrue)(size <= data.byteLength);
        if (size !== data.byteLength) {
            data = data.slice(0, size);
        }
        // Handle .ctrace files.
        const header = (0, string_utils_1.utf8Decode)(data.slice(0, 128));
        if (header.includes(CTRACE_HEADER)) {
            const offset = header.indexOf(CTRACE_HEADER) + CTRACE_HEADER.length;
            data = (0, pako_1.inflate)(new Uint8Array(data.slice(offset)), { to: 'string' });
        }
    }
    // The location.pathname mangling is to make this code work also when hosted
    // in a non-root sub-directory, for the case of CI artifacts.
    const catapultUrl = (0, assets_1.assetSrc)('assets/catapult_trace_viewer.html');
    const newWin = window.open(catapultUrl);
    if (newWin) {
        // Popup succeedeed.
        newWin.addEventListener('load', (e) => {
            const doc = e.target;
            const ctl = doc.querySelector('x-profiling-view');
            ctl.setActiveTrace(name, data);
        });
        return;
    }
    // Popup blocker detected.
    (0, modal_1.showModal)({
        title: 'Open trace in the legacy Catapult Trace Viewer',
        content: (0, mithril_1.default)('div', (0, mithril_1.default)('div', 'You are seeing this interstitial because popups are blocked'), (0, mithril_1.default)('div', 'Enable popups to skip this dialog next time.')),
        buttons: [
            {
                text: 'Open legacy UI',
                primary: true,
                action: () => openBufferWithLegacyTraceViewer(name, data, size),
            },
        ],
    });
}
async function openInOldUIWithSizeCheck(trace) {
    // Perfetto traces smaller than 50mb can be safely opened in the legacy UI.
    if (trace.size < 1024 * 1024 * 50) {
        return await (0, trace_converter_1.convertToJson)(trace, openBufferWithLegacyTraceViewer);
    }
    // Give the user the option to truncate larger perfetto traces.
    const size = Math.round(trace.size / (1024 * 1024));
    // If the user presses one of the buttons below, remember the promise that
    // they trigger, so we await for it before returning.
    let nextPromise;
    const setNextPromise = (p) => (nextPromise = p);
    await (0, modal_1.showModal)({
        title: 'Legacy UI may fail to open this trace',
        content: (0, mithril_1.default)('div', (0, mithril_1.default)('p', `This trace is ${size}mb, opening it in the legacy UI ` + `may fail.`), (0, mithril_1.default)('p', 'More options can be found at ', (0, mithril_1.default)('a', {
            href: 'https://goto.google.com/opening-large-traces',
            target: '_blank',
        }, 'go/opening-large-traces'), '.')),
        buttons: [
            {
                text: 'Open full trace (not recommended)',
                action: () => setNextPromise((0, trace_converter_1.convertToJson)(trace, openBufferWithLegacyTraceViewer)),
            },
            {
                text: 'Open beginning of trace',
                action: () => setNextPromise((0, trace_converter_1.convertToJson)(trace, openBufferWithLegacyTraceViewer, 
                /* truncate*/ 'start')),
            },
            {
                text: 'Open end of trace',
                primary: true,
                action: () => setNextPromise((0, trace_converter_1.convertToJson)(trace, openBufferWithLegacyTraceViewer, 
                /* truncate*/ 'end')),
            },
        ],
    });
    // nextPromise is undefined if the user just dimisses the dialog with ESC.
    if (nextPromise !== undefined) {
        await nextPromise;
    }
}
//# sourceMappingURL=legacy_trace_viewer.js.map