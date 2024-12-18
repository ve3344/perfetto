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
exports.CheckHttpRpcConnection = CheckHttpRpcConnection;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const protos_1 = tslib_1.__importDefault(require("../protos"));
const logging_1 = require("../base/logging");
const perfetto_version_1 = require("../gen/perfetto_version");
const http_rpc_engine_1 = require("../trace_processor/http_rpc_engine");
const modal_1 = require("../widgets/modal");
const app_impl_1 = require("../core/app_impl");
const CURRENT_API_VERSION = protos_1.default.TraceProcessorApiVersion.TRACE_PROCESSOR_CURRENT_API_VERSION;
function getPromptMessage(tpStatus) {
    return `Trace Processor detected on ${http_rpc_engine_1.HttpRpcEngine.hostAndPort} with:
${tpStatus.loadedTraceName}

YES, use loaded trace:
Will load from the current state of Trace Processor. If you did run
trace_processor_shell --httpd file.pftrace this is likely what you want.

YES, but reset state:
Use this if you want to open another trace but still use the
accelerator. This is the equivalent of killing and restarting
trace_processor_shell --httpd.

NO, Use builtin WASM:
Will not use the accelerator in this tab.

Using the native accelerator has some minor caveats:
- Only one tab can be using the accelerator.
- Sharing, downloading and conversion-to-legacy aren't supported.
`;
}
function getIncompatibleRpcMessage(tpStatus) {
    return `The Trace Processor instance on ${http_rpc_engine_1.HttpRpcEngine.hostAndPort} is too old.

This UI requires TraceProcessor features that are not present in the
Trace Processor native accelerator you are currently running.
If you continue, this is almost surely going to cause UI failures.

Please update your local Trace Processor binary:

curl -LO https://get.perfetto.dev/trace_processor
chmod +x ./trace_processor
./trace_processor --httpd

UI version code: ${perfetto_version_1.VERSION}
UI RPC API: ${CURRENT_API_VERSION}

Trace processor version: ${tpStatus.humanReadableVersion}
Trace processor version code: ${tpStatus.versionCode}
Trace processor RPC API: ${tpStatus.apiVersion}
`;
}
function getVersionMismatchMessage(tpStatus) {
    return `The Trace Processor instance on ${http_rpc_engine_1.HttpRpcEngine.hostAndPort} is a different build from the UI.

This may cause problems. Where possible it is better to use the matched version of the UI.
You can do this by clicking the button below.

UI version code: ${perfetto_version_1.VERSION}
UI RPC API: ${CURRENT_API_VERSION}

Trace processor version: ${tpStatus.humanReadableVersion}
Trace processor version code: ${tpStatus.versionCode}
Trace processor RPC API: ${tpStatus.apiVersion}
`;
}
// The flow is fairly complicated:
// +-----------------------------------+
// |        User loads the UI          |
// +-----------------+-----------------+
//                   |
// +-----------------+-----------------+
// |   Is trace_processor present at   |
// |   HttpRpcEngine.hostAndPort?      |
// +--------------------------+--------+
//    |No                     |Yes
//    |        +--------------+-------------------------------+
//    |        |  Does version code of UI and TP match?       |
//    |        +--------------+----------------------------+--+
//    |                       |No                          |Yes
//    |                       |                            |
//    |                       |                            |
//    |         +-------------+-------------+              |
//    |         |Is a build of the UI at the|              |
//    |         |TP version code existant   |              |
//    |         |and reachable?             |              |
//    |         +---+----------------+------+              |
//    |             | No             | Yes                 |
//    |             |                |                     |
//    |             |       +--------+-------+             |
//    |             |       |Dialog: Mismatch|             |
//    |             |       |Load matched UI +-------------------------------+
//    |             |       |Continue        +-+           |                 |
//    |             |       +----------------+ |           |                 |
//    |             |                          |           |                 |
//    |      +------+--------------------------+----+      |                 |
//    |      |TP RPC version >= UI RPC version      |      |                 |
//    |      +----+-------------------+-------------+      |                 |
//    |           | No                |Yes                 |                 |
//    |      +----+--------------+    |                    |                 |
//    |      |Dialog: Bad RPC    |    |                    |                 |
//    |  +---+Use built-in WASM  |    |                    |                 |
//    |  |   |Continue anyway    +----|                    |                 |
//    |  |   +-------------------+    |        +-----------+-----------+     |
//    |  |                            +--------+TP has preloaded trace?|     |
//    |  |                                     +-+---------------+-----+     |
//    |  |                                       |No             |Yes        |
//    |  |                                       |  +---------------------+  |
//    |  |                                       |  | Dialog: Preloaded?  |  |
//    |  |                                       |  + YES, use loaded trace  |
//    |  |                                 +--------| YES, but reset state|  |
//    |  |  +---------------------------------------| NO, Use builtin Wasm|  |
//    |  |  |                              |     |  +---------------------+  |
//    |  |  |                              |     |                           |
//    |  |  |                           Reset TP |                           |
//    |  |  |                              |     |                           |
//    |  |  |                              |     |                           |
//  Show the UI                         Show the UI                  Link to
//  (WASM mode)                         (RPC mode)                   matched UI
// There are three options in the end:
// - Show the UI (WASM mode)
// - Show the UI (RPC mode)
// - Redirect to a matched version of the UI
// Try to connect to the external Trace Processor HTTP RPC accelerator (if
// available, often it isn't). If connected it will populate the
// |httpRpcState| in the frontend local state. In turn that will show the UI
// chip in the sidebar. trace_controller.ts will repeat this check before
// trying to load a new trace. We do this ahead of time just to have a
// consistent UX (i.e. so that the user can tell if the RPC is working without
// having to open a trace).
async function CheckHttpRpcConnection() {
    const state = await http_rpc_engine_1.HttpRpcEngine.checkConnection();
    app_impl_1.AppImpl.instance.httpRpc.httpRpcAvailable = state.connected;
    if (!state.connected) {
        // No RPC = exit immediately to the WASM UI.
        return;
    }
    const tpStatus = (0, logging_1.assertExists)(state.status);
    function forceWasm() {
        app_impl_1.AppImpl.instance.httpRpc.newEngineMode = 'FORCE_BUILTIN_WASM';
    }
    // Check short version:
    if (tpStatus.versionCode !== '' && tpStatus.versionCode !== perfetto_version_1.VERSION) {
        const url = await isVersionAvailable(tpStatus.versionCode);
        if (url !== undefined) {
            // If matched UI available show a dialog asking the user to
            // switch.
            const result = await showDialogVersionMismatch(tpStatus, url);
            switch (result) {
                case MismatchedVersionDialog.Dismissed:
                case MismatchedVersionDialog.UseMatchingUi:
                    navigateToVersion(tpStatus.versionCode);
                    return;
                case MismatchedVersionDialog.UseMismatchedRpc:
                    break;
                case MismatchedVersionDialog.UseWasm:
                    forceWasm();
                    return;
                default:
                    const x = result;
                    throw new Error(`Unsupported result ${x}`);
            }
        }
    }
    // Check the RPC version:
    if (tpStatus.apiVersion < CURRENT_API_VERSION) {
        const result = await showDialogIncompatibleRPC(tpStatus);
        switch (result) {
            case IncompatibleRpcDialogResult.Dismissed:
            case IncompatibleRpcDialogResult.UseWasm:
                forceWasm();
                return;
            case IncompatibleRpcDialogResult.UseIncompatibleRpc:
                break;
            default:
                const x = result;
                throw new Error(`Unsupported result ${x}`);
        }
    }
    // Check if pre-loaded:
    if (tpStatus.loadedTraceName) {
        // If a trace is already loaded in the trace processor (e.g., the user
        // launched trace_processor_shell -D trace_file.pftrace), prompt the user to
        // initialize the UI with the already-loaded trace.
        const result = await showDialogToUsePreloadedTrace(tpStatus);
        switch (result) {
            case PreloadedDialogResult.Dismissed:
            case PreloadedDialogResult.UseRpcWithPreloadedTrace:
                app_impl_1.AppImpl.instance.openTraceFromHttpRpc();
                return;
            case PreloadedDialogResult.UseRpc:
                // Resetting state is the default.
                return;
            case PreloadedDialogResult.UseWasm:
                forceWasm();
                return;
            default:
                const x = result;
                throw new Error(`Unsupported result ${x}`);
        }
    }
}
var MismatchedVersionDialog;
(function (MismatchedVersionDialog) {
    MismatchedVersionDialog["UseMatchingUi"] = "useMatchingUi";
    MismatchedVersionDialog["UseWasm"] = "useWasm";
    MismatchedVersionDialog["UseMismatchedRpc"] = "useMismatchedRpc";
    MismatchedVersionDialog["Dismissed"] = "dismissed";
})(MismatchedVersionDialog || (MismatchedVersionDialog = {}));
async function showDialogVersionMismatch(tpStatus, url) {
    let result = MismatchedVersionDialog.Dismissed;
    await (0, modal_1.showModal)({
        title: 'Version mismatch',
        content: (0, mithril_1.default)('.modal-pre', getVersionMismatchMessage(tpStatus)),
        buttons: [
            {
                primary: true,
                text: `Open ${url}`,
                action: () => {
                    result = MismatchedVersionDialog.UseMatchingUi;
                },
            },
            {
                text: 'Use builtin Wasm',
                action: () => {
                    result = MismatchedVersionDialog.UseWasm;
                },
            },
            {
                text: 'Use mismatched version regardless (might crash)',
                action: () => {
                    result = MismatchedVersionDialog.UseMismatchedRpc;
                },
            },
        ],
    });
    return result;
}
var IncompatibleRpcDialogResult;
(function (IncompatibleRpcDialogResult) {
    IncompatibleRpcDialogResult["UseWasm"] = "useWasm";
    IncompatibleRpcDialogResult["UseIncompatibleRpc"] = "useIncompatibleRpc";
    IncompatibleRpcDialogResult["Dismissed"] = "dismissed";
})(IncompatibleRpcDialogResult || (IncompatibleRpcDialogResult = {}));
async function showDialogIncompatibleRPC(tpStatus) {
    let result = IncompatibleRpcDialogResult.Dismissed;
    await (0, modal_1.showModal)({
        title: 'Incompatible RPC version',
        content: (0, mithril_1.default)('.modal-pre', getIncompatibleRpcMessage(tpStatus)),
        buttons: [
            {
                text: 'Use builtin Wasm',
                primary: true,
                action: () => {
                    result = IncompatibleRpcDialogResult.UseWasm;
                },
            },
            {
                text: 'Use old version regardless (will crash)',
                action: () => {
                    result = IncompatibleRpcDialogResult.UseIncompatibleRpc;
                },
            },
        ],
    });
    return result;
}
var PreloadedDialogResult;
(function (PreloadedDialogResult) {
    PreloadedDialogResult["UseRpcWithPreloadedTrace"] = "useRpcWithPreloadedTrace";
    PreloadedDialogResult["UseRpc"] = "useRpc";
    PreloadedDialogResult["UseWasm"] = "useWasm";
    PreloadedDialogResult["Dismissed"] = "dismissed";
})(PreloadedDialogResult || (PreloadedDialogResult = {}));
async function showDialogToUsePreloadedTrace(tpStatus) {
    let result = PreloadedDialogResult.Dismissed;
    await (0, modal_1.showModal)({
        title: 'Use trace processor native acceleration?',
        content: (0, mithril_1.default)('.modal-pre', getPromptMessage(tpStatus)),
        buttons: [
            {
                text: 'YES, use loaded trace',
                primary: true,
                action: () => {
                    result = PreloadedDialogResult.UseRpcWithPreloadedTrace;
                },
            },
            {
                text: 'YES, but reset state',
                action: () => {
                    result = PreloadedDialogResult.UseRpc;
                },
            },
            {
                text: 'NO, Use builtin WASM',
                action: () => {
                    result = PreloadedDialogResult.UseWasm;
                },
            },
        ],
    });
    return result;
}
function getUrlForVersion(versionCode) {
    const url = `${window.location.origin}/${versionCode}/`;
    return url;
}
async function isVersionAvailable(versionCode) {
    if (versionCode === '') {
        return undefined;
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000);
    const url = getUrlForVersion(versionCode);
    let r;
    try {
        r = await fetch(url, { signal: controller.signal });
    }
    catch (e) {
        console.error(`No UI version for ${versionCode} at ${url}. ` +
            `This is an error if ${versionCode} is a released Perfetto version`);
        return undefined;
    }
    finally {
        clearTimeout(timeoutId);
    }
    if (!r.ok) {
        return undefined;
    }
    return url;
}
function navigateToVersion(versionCode) {
    const url = getUrlForVersion(versionCode);
    if (url === undefined) {
        throw new Error(`No URL known for UI version ${versionCode}.`);
    }
    window.location.replace(url);
}
//# sourceMappingURL=rpc_http_dialog.js.map