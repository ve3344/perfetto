"use strict";
// Copyright (C) 2021 The Android Open Source Project
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
const tslib_1 = require("tslib");
const deferred_1 = require("../base/deferred");
const logging_1 = require("../base/logging");
const traceconv_1 = tslib_1.__importDefault(require("../gen/traceconv"));
const selfWorker = self;
function updateStatus(status) {
    selfWorker.postMessage({
        kind: 'updateStatus',
        status,
    });
}
function notifyJobCompleted() {
    selfWorker.postMessage({ kind: 'jobCompleted' });
}
function downloadFile(buffer, name) {
    selfWorker.postMessage({
        kind: 'downloadFile',
        buffer,
        name,
    }, [buffer.buffer]);
}
function openTraceInLegacy(buffer) {
    selfWorker.postMessage({
        kind: 'openTraceInLegacy',
        buffer,
    });
}
function forwardError(error) {
    selfWorker.postMessage({
        kind: 'error',
        error,
    });
}
function fsNodeToBuffer(fsNode) {
    const fileSize = (0, logging_1.assertExists)(fsNode.usedBytes);
    return new Uint8Array(fsNode.contents.buffer, 0, fileSize);
}
async function runTraceconv(trace, args) {
    const deferredRuntimeInitialized = (0, deferred_1.defer)();
    const module = (0, traceconv_1.default)({
        noInitialRun: true,
        locateFile: (s) => s,
        print: updateStatus,
        printErr: updateStatus,
        onRuntimeInitialized: () => deferredRuntimeInitialized.resolve(),
    });
    await deferredRuntimeInitialized;
    module.FS.mkdir('/fs');
    module.FS.mount((0, logging_1.assertExists)(module.FS.filesystems.WORKERFS), { blobs: [{ name: 'trace.proto', data: trace }] }, '/fs');
    updateStatus('Converting trace');
    module.callMain(args);
    updateStatus('Trace conversion completed');
    return module;
}
function isConvertTraceAndDownload(msg) {
    if (msg.kind !== 'ConvertTraceAndDownload') {
        return false;
    }
    if (msg.trace === undefined) {
        throw new Error('ConvertTraceAndDownloadArgs missing trace');
    }
    if (msg.format !== 'json' && msg.format !== 'systrace') {
        throw new Error('ConvertTraceAndDownloadArgs has bad format');
    }
    return true;
}
async function ConvertTraceAndDownload(trace, format, truncate) {
    const outPath = '/trace.json';
    const args = [format];
    if (truncate !== undefined) {
        args.push('--truncate', truncate);
    }
    args.push('/fs/trace.proto', outPath);
    try {
        const module = await runTraceconv(trace, args);
        const fsNode = module.FS.lookupPath(outPath).node;
        downloadFile(fsNodeToBuffer(fsNode), `trace.${format}`);
        module.FS.unlink(outPath);
    }
    finally {
        notifyJobCompleted();
    }
}
function isConvertTraceAndOpenInLegacy(msg) {
    if (msg.kind !== 'ConvertTraceAndOpenInLegacy') {
        return false;
    }
    return true;
}
async function ConvertTraceAndOpenInLegacy(trace, truncate) {
    const outPath = '/trace.json';
    const args = ['json'];
    if (truncate !== undefined) {
        args.push('--truncate', truncate);
    }
    args.push('/fs/trace.proto', outPath);
    try {
        const module = await runTraceconv(trace, args);
        const fsNode = module.FS.lookupPath(outPath).node;
        const data = fsNode.contents.buffer;
        const size = fsNode.usedBytes;
        const buffer = new Uint8Array(data, 0, size);
        openTraceInLegacy(buffer);
        module.FS.unlink(outPath);
    }
    finally {
        notifyJobCompleted();
    }
}
function isConvertTraceToPprof(msg) {
    if (msg.kind !== 'ConvertTraceToPprof') {
        return false;
    }
    return true;
}
async function ConvertTraceToPprof(trace, pid, ts) {
    const args = [
        'profile',
        `--pid`,
        `${pid}`,
        `--timestamps`,
        `${ts}`,
        '/fs/trace.proto',
    ];
    try {
        const module = await runTraceconv(trace, args);
        const heapDirName = Object.keys(module.FS.lookupPath('/tmp/').node.contents)[0];
        const heapDirContents = module.FS.lookupPath(`/tmp/${heapDirName}`).node
            .contents;
        const heapDumpFiles = Object.keys(heapDirContents);
        for (let i = 0; i < heapDumpFiles.length; ++i) {
            const heapDump = heapDumpFiles[i];
            const fileNode = module.FS.lookupPath(`/tmp/${heapDirName}/${heapDump}`).node;
            const fileName = `/heap_dump.${i}.${pid}.pb`;
            downloadFile(fsNodeToBuffer(fileNode), fileName);
        }
    }
    finally {
        notifyJobCompleted();
    }
}
selfWorker.onmessage = (msg) => {
    self.addEventListener('error', (e) => (0, logging_1.reportError)(e));
    self.addEventListener('unhandledrejection', (e) => (0, logging_1.reportError)(e));
    (0, logging_1.addErrorHandler)((error) => forwardError(error));
    const args = msg.data;
    if (isConvertTraceAndDownload(args)) {
        ConvertTraceAndDownload(args.trace, args.format, args.truncate);
    }
    else if (isConvertTraceAndOpenInLegacy(args)) {
        ConvertTraceAndOpenInLegacy(args.trace, args.truncate);
    }
    else if (isConvertTraceToPprof(args)) {
        ConvertTraceToPprof(args.trace, args.pid, args.ts);
    }
    else {
        throw new Error(`Unknown method call ${JSON.stringify(args)}`);
    }
};
//# sourceMappingURL=index.js.map