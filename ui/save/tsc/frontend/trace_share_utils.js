"use strict";
// Copyright (C) 2020 The Android Open Source Project
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
exports.isShareable = isShareable;
exports.shareTrace = shareTrace;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const permalink_1 = require("./permalink");
const modal_1 = require("../widgets/modal");
const globals_1 = require("./globals");
const app_impl_1 = require("../core/app_impl");
const copyable_link_1 = require("../widgets/copyable_link");
function isShareable(trace) {
    return globals_1.globals.isInternalUser && trace.traceInfo.downloadable;
}
async function shareTrace(trace) {
    const traceSource = trace.traceInfo.source;
    const traceUrl = traceSource.url ?? '';
    // If the trace is not shareable (has been pushed via postMessage()) but has
    // a url, create a pseudo-permalink by echoing back the URL.
    if (!isShareable(trace)) {
        const msg = [
            (0, mithril_1.default)('p', 'This trace was opened by an external site and as such cannot ' +
                'be re-shared preserving the UI state.'),
        ];
        if (traceUrl) {
            msg.push((0, mithril_1.default)('p', 'By using the URL below you can open this trace again.'));
            msg.push((0, mithril_1.default)('p', 'Clicking will copy the URL into the clipboard.'));
            msg.push((0, mithril_1.default)(copyable_link_1.CopyableLink, { url: traceUrl }));
        }
        (0, modal_1.showModal)({
            title: 'Cannot create permalink from external trace',
            content: (0, mithril_1.default)('div', msg),
        });
        return;
    }
    if (!isShareable(trace))
        return;
    const result = confirm(`Upload UI state and generate a permalink. ` +
        `The trace will be accessible by anybody with the permalink.`);
    if (result) {
        app_impl_1.AppImpl.instance.analytics.logEvent('Trace Actions', 'Create permalink');
        return await (0, permalink_1.createPermalink)();
    }
}
//# sourceMappingURL=trace_share_utils.js.map