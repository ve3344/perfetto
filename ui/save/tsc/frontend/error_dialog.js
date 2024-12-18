"use strict";
// Copyright (C) 2019 The Android Open Source Project
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
exports.maybeShowErrorDialog = maybeShowErrorDialog;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const gcs_uploader_1 = require("../base/gcs_uploader");
const raf_scheduler_1 = require("../core/raf_scheduler");
const perfetto_version_1 = require("../gen/perfetto_version");
const modal_1 = require("../widgets/modal");
const globals_1 = require("./globals");
const app_impl_1 = require("../core/app_impl");
const router_1 = require("../core/router");
const MODAL_KEY = 'crash_modal';
// Never show more than one dialog per 10s.
const MIN_REPORT_PERIOD_MS = 10000;
let timeLastReport = 0;
function maybeShowErrorDialog(err) {
    const now = performance.now();
    // Here we rely on the exception message from onCannotGrowMemory function
    if (err.message.includes('Cannot enlarge memory') ||
        err.stack.some((entry) => entry.name.includes('OutOfMemoryHandler')) ||
        err.stack.some((entry) => entry.name.includes('_emscripten_resize_heap')) ||
        err.stack.some((entry) => entry.name.includes('sbrk')) ||
        /^out of memory$/m.exec(err.message)) {
        showOutOfMemoryDialog();
        // Refresh timeLastReport to prevent a different error showing a dialog
        timeLastReport = now;
        return;
    }
    if (err.message.includes('Unable to claim interface')) {
        showWebUSBError();
        timeLastReport = now;
        return;
    }
    if (err.message.includes('A transfer error has occurred') ||
        err.message.includes('The device was disconnected') ||
        err.message.includes('The transfer was cancelled')) {
        showConnectionLostError();
        timeLastReport = now;
        return;
    }
    if (err.message.includes('(ERR:fmt)')) {
        showUnknownFileError();
        return;
    }
    if (err.message.includes('(ERR:rpc_seq)')) {
        showRpcSequencingError();
        return;
    }
    if (err.message.includes('(ERR:ws)')) {
        showWebsocketConnectionIssue(err.message);
        return;
    }
    // This is only for older version of the UI and for ease of tracking across
    // cherry-picks. Newer versions don't have this exception anymore.
    if (err.message.includes('State hash does not match')) {
        showNewerStateError();
        return;
    }
    if (timeLastReport > 0 && now - timeLastReport <= MIN_REPORT_PERIOD_MS) {
        console.log('Suppressing crash dialog, last error notified too soon.');
        return;
    }
    timeLastReport = now;
    // If we are already showing a crash dialog, don't overwrite it with a newer
    // crash. Usually the first crash matters, the rest avalanching effects.
    if ((0, modal_1.getCurrentModalKey)() === MODAL_KEY) {
        return;
    }
    (0, modal_1.showModal)({
        key: MODAL_KEY,
        title: 'Oops, something went wrong. Please file a bug.',
        content: () => (0, mithril_1.default)(ErrorDialogComponent, err),
    });
}
class ErrorDialogComponent {
    traceState;
    traceType = 'No trace loaded';
    traceData;
    traceUrl;
    attachTrace = false;
    uploadStatus = '';
    userDescription = '';
    errorMessage = '';
    uploader;
    constructor() {
        this.traceState = 'NOT_AVAILABLE';
        const traceSource = app_impl_1.AppImpl.instance.trace?.traceInfo.source;
        if (traceSource === undefined)
            return;
        this.traceType = traceSource.type;
        // If the trace is either already uploaded, or comes from a postmessage+url
        // we don't need any re-upload.
        if ('url' in traceSource && traceSource.url !== undefined) {
            this.traceUrl = traceSource.url;
            this.traceState = 'UPLOADED';
            // The trace is already uploaded, so assume the user is fine attaching to
            // the bugreport (this make the checkbox ticked by default).
            this.attachTrace = true;
            return;
        }
        // If the user is not a googler, don't even offer the option to upload it.
        if (!globals_1.globals.isInternalUser)
            return;
        if (traceSource.type === 'FILE') {
            this.traceState = 'NOT_UPLOADED';
            this.traceData = traceSource.file;
            // this.traceSize = this.traceData.size;
        }
        else if (traceSource.type === 'ARRAY_BUFFER') {
            this.traceData = traceSource.buffer;
            // this.traceSize = this.traceData.byteLength;
        }
        else {
            return; // Can't upload HTTP+RPC.
        }
        this.traceState = 'NOT_UPLOADED';
    }
    view(vnode) {
        const err = vnode.attrs;
        let msg = `UI: ${location.protocol}//${location.host}/${perfetto_version_1.VERSION}\n\n`;
        // Append the trace stack.
        msg += `${err.message}\n`;
        for (const entry of err.stack) {
            msg += ` - ${entry.name} (${entry.location})\n`;
        }
        msg += '\n';
        // Append the trace URL.
        if (this.attachTrace && this.traceUrl) {
            msg += `Trace: ${this.traceUrl}\n`;
        }
        else if (this.attachTrace && this.traceState === 'UPLOADING') {
            msg += `Trace: uploading...\n`;
        }
        else {
            msg += `Trace: not available (${this.traceType}). Provide repro steps.\n`;
        }
        msg += `UA: ${navigator.userAgent}\n`;
        msg += `Referrer: ${document.referrer}\n`;
        this.errorMessage = msg;
        let shareTraceSection = null;
        if (this.traceState !== 'NOT_AVAILABLE') {
            shareTraceSection = (0, mithril_1.default)('div', (0, mithril_1.default)('label', (0, mithril_1.default)(`input[type=checkbox]`, {
                checked: this.attachTrace,
                oninput: (ev) => {
                    const checked = ev.target.checked;
                    this.onUploadCheckboxChange(checked);
                },
            }), this.traceState === 'UPLOADING'
                ? `Uploading trace... ${this.uploadStatus}`
                : 'Tick to share the current trace and help debugging'), // m('label')
            (0, mithril_1.default)('div.modal-small', `This will upload the trace and attach a link to the bug.
          You may leave it unchecked and attach the trace manually to the bug
          if preferred.`));
        } // if (this.traceState !== 'NOT_AVAILABLE')
        return [
            (0, mithril_1.default)('div', (0, mithril_1.default)('.modal-logs', msg), (0, mithril_1.default)('span', `Please provide any additional details describing
        how the crash occurred:`), (0, mithril_1.default)('textarea.modal-textarea', {
                rows: 3,
                maxlength: 1000,
                oninput: (ev) => {
                    this.userDescription = ev.target.value;
                },
                onkeydown: (e) => e.stopPropagation(),
                onkeyup: (e) => e.stopPropagation(),
            }), shareTraceSection),
            (0, mithril_1.default)('footer', (0, mithril_1.default)('button.modal-btn.modal-btn-primary', { onclick: () => this.fileBug(err) }, 'File a bug (Googlers only)')),
        ];
    }
    onUploadCheckboxChange(checked) {
        raf_scheduler_1.raf.scheduleFullRedraw();
        this.attachTrace = checked;
        if (checked &&
            this.traceData !== undefined &&
            this.traceState === 'NOT_UPLOADED') {
            this.traceState = 'UPLOADING';
            this.uploadStatus = '';
            const uploader = new gcs_uploader_1.GcsUploader(this.traceData, {
                onProgress: () => {
                    raf_scheduler_1.raf.scheduleFullRedraw('force');
                    this.uploadStatus = uploader.getEtaString();
                    if (uploader.state === 'UPLOADED') {
                        this.traceState = 'UPLOADED';
                        this.traceUrl = uploader.uploadedUrl;
                    }
                    else if (uploader.state === 'ERROR') {
                        this.traceState = 'NOT_UPLOADED';
                        this.uploadStatus = uploader.error;
                    }
                },
            });
            this.uploader = uploader;
        }
        else if (!checked && this.uploader) {
            this.uploader.abort();
        }
    }
    fileBug(err) {
        const errTitle = err.message.split('\n', 1)[0].substring(0, 80);
        let url = 'https://goto.google.com/perfetto-ui-bug';
        url += '?title=' + encodeURIComponent(`UI Error: ${errTitle}`);
        url += '&description=';
        if (this.userDescription !== '') {
            url += encodeURIComponent('User description:\n' + this.userDescription + '\n\n');
        }
        url += encodeURIComponent(this.errorMessage);
        // 8kb is common limit on request size so restrict links to that long:
        url = url.substring(0, 8000);
        window.open(url, '_blank');
    }
}
function showOutOfMemoryDialog() {
    const url = 'https://perfetto.dev/docs/quickstart/trace-analysis#get-trace-processor';
    const tpCmd = 'curl -LO https://get.perfetto.dev/trace_processor\n' +
        'chmod +x ./trace_processor\n' +
        'trace_processor --httpd /path/to/trace.pftrace\n' +
        '# Reload the UI, it will prompt to use the HTTP+RPC interface';
    (0, modal_1.showModal)({
        title: 'Oops! Your WASM trace processor ran out of memory',
        content: (0, mithril_1.default)('div', (0, mithril_1.default)('span', 'The in-memory representation of the trace is too big ' +
            'for the browser memory limits (typically 2GB per tab).'), (0, mithril_1.default)('br'), (0, mithril_1.default)('span', 'You can work around this problem by using the trace_processor ' +
            'native binary as an accelerator for the UI as follows:'), (0, mithril_1.default)('br'), (0, mithril_1.default)('br'), (0, mithril_1.default)('.modal-bash', tpCmd), (0, mithril_1.default)('br'), (0, mithril_1.default)('span', 'For details see '), (0, mithril_1.default)('a', { href: url, target: '_blank' }, url)),
    });
}
function showUnknownFileError() {
    (0, modal_1.showModal)({
        title: 'Cannot open this file',
        content: (0, mithril_1.default)('div', (0, mithril_1.default)('p', "The file opened doesn't look like a Perfetto trace or any " +
            'other format recognized by the Perfetto TraceProcessor.'), (0, mithril_1.default)('p', 'Formats supported:'), (0, mithril_1.default)('ul', (0, mithril_1.default)('li', 'Perfetto protobuf trace'), (0, mithril_1.default)('li', 'chrome://tracing JSON'), (0, mithril_1.default)('li', 'Android systrace'), (0, mithril_1.default)('li', 'Fuchsia trace'), (0, mithril_1.default)('li', 'Ninja build log'))),
    });
}
function showWebUSBError() {
    (0, modal_1.showModal)({
        title: 'A WebUSB error occurred',
        content: (0, mithril_1.default)('div', (0, mithril_1.default)('span', `Is adb already running on the host? Run this command and
      try again.`), (0, mithril_1.default)('br'), (0, mithril_1.default)('.modal-bash', '> adb kill-server'), (0, mithril_1.default)('br'), (0, mithril_1.default)('span', 'For details see '), (0, mithril_1.default)('a', { href: 'http://b/159048331', target: '_blank' }, 'b/159048331')),
    });
}
function showRpcSequencingError() {
    (0, modal_1.showModal)({
        title: 'A TraceProcessor RPC error occurred',
        content: (0, mithril_1.default)('div', (0, mithril_1.default)('p', 'The trace processor RPC sequence ID was broken'), (0, mithril_1.default)('p', `This can happen when using a HTTP trace processor instance and
either accidentally sharing this between multiple tabs or
restarting the trace processor while still in use by UI.`), (0, mithril_1.default)('p', `Please refresh this tab and ensure that trace processor is used
at most one tab at a time.`)),
    });
}
function showNewerStateError() {
    (0, modal_1.showModal)({
        title: 'Cannot deserialize the permalink',
        content: (0, mithril_1.default)('div', (0, mithril_1.default)('p', "The state hash doesn't match."), (0, mithril_1.default)('p', 'This usually happens when the permalink is generated by a version ' +
            'the UI that is newer than the current version, e.g., when a ' +
            'colleague created the permalink using the Canary or Autopush ' +
            'channel and you are trying to open it using Stable channel.'), (0, mithril_1.default)('p', 'Try switching to Canary or Autopush channel from the Flags page ' +
            ' and try again.')),
        buttons: [
            {
                text: 'Take me to the flags page',
                primary: true,
                action: () => router_1.Router.navigate('#!/flags/releaseChannel'),
            },
        ],
    });
}
function showWebsocketConnectionIssue(message) {
    (0, modal_1.showModal)({
        title: 'Unable to connect to the device via websocket',
        content: (0, mithril_1.default)('div', (0, mithril_1.default)('div', 'trace_processor_shell --httpd is unreachable or crashed.'), (0, mithril_1.default)('pre', message)),
    });
}
function showConnectionLostError() {
    (0, modal_1.showModal)({
        title: 'Connection with the ADB device lost',
        content: (0, mithril_1.default)('div', (0, mithril_1.default)('span', `Please connect the device again to restart the recording.`), (0, mithril_1.default)('br')),
    });
}
//# sourceMappingURL=error_dialog.js.map