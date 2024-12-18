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
exports.maybeOpenTraceFromRoute = maybeOpenTraceFromRoute;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const cache_manager_1 = require("../core/cache_manager");
const modal_1 = require("../widgets/modal");
const permalink_1 = require("./permalink");
const android_bug_tool_1 = require("./android_bug_tool");
const router_1 = require("../core/router");
const task_tracker_1 = require("./task_tracker");
const app_impl_1 = require("../core/app_impl");
function getCurrentTraceUrl() {
    const source = app_impl_1.AppImpl.instance.trace?.traceInfo.source;
    if (source && source.type === 'URL') {
        return source.url;
    }
    return undefined;
}
function maybeOpenTraceFromRoute(route) {
    if (route.args.s) {
        // /?s=xxxx for permalinks.
        (0, permalink_1.loadPermalink)(route.args.s);
        return;
    }
    const url = route.args.url;
    if (url && url !== getCurrentTraceUrl()) {
        // /?url=https://commondatastorage.googleapis.com/bucket/trace
        // This really works only for GCS because the Content Security Policy
        // forbids any other url.
        loadTraceFromUrl(url);
        return;
    }
    if (route.args.openFromAndroidBugTool) {
        // Handles interaction with the Android Bug Tool extension. See b/163421158.
        openTraceFromAndroidBugTool();
        return;
    }
    if (route.args.p && route.page === '/record') {
        // Handles backwards compatibility for old URLs (linked from various docs),
        // generated before we switched URL scheme. e.g., 'record?p=power' vs
        // 'record/power'. See b/191255021#comment2.
        router_1.Router.navigate(`#!/record/${route.args.p}`);
        return;
    }
    if (route.args.local_cache_key) {
        // Handles the case of loading traces from the cache storage.
        maybeOpenCachedTrace(route.args.local_cache_key);
        return;
    }
}
/*
 * openCachedTrace(uuid) is called: (1) on startup, from frontend/index.ts; (2)
 * every time the fragment changes (from Router.onRouteChange).
 * This function must be idempotent (imagine this is called on every frame).
 * It must take decision based on the app state, not on URL change events.
 * Fragment changes are handled by the union of Router.onHashChange() and this
 * function, as follows:
 * 1. '' -> URL without a ?local_cache_key=xxx arg:
 *  - no effect (except redrawing)
 * 2. URL without local_cache_key -> URL with local_cache_key:
 *  - Load cached trace (without prompting any dialog).
 *  - Show a (graceful) error dialog in the case of cache misses.
 * 3. '' -> URL with a ?local_cache_key=xxx arg:
 *  - Same as case 2.
 * 4. URL with local_cache_key=1 -> URL with local_cache_key=2:
 *  a) If 2 != uuid of the trace currently loaded (TraceImpl.traceInfo.uuid):
 *  - Ask the user if they intend to switch trace and load 2.
 *  b) If 2 == uuid of current trace (e.g., after a new trace has loaded):
 *  - no effect (except redrawing).
 * 5. URL with local_cache_key -> URL without local_cache_key:
 *  - Redirect to ?local_cache_key=1234 where 1234 is the UUID of the previous
 *    URL (this might or might not match traceInfo.uuid).
 *
 * Backward navigation cases:
 * 6. URL without local_cache_key <- URL with local_cache_key:
 *  - Same as case 5.
 * 7. URL with local_cache_key=1 <- URL with local_cache_key=2:
 *  - Same as case 4a: go back to local_cache_key=1 but ask the user to confirm.
 * 8. landing page <- URL with local_cache_key:
 *  - Same as case 5: re-append the local_cache_key.
 */
async function maybeOpenCachedTrace(traceUuid) {
    const curTrace = app_impl_1.AppImpl.instance.trace?.traceInfo;
    const curCacheUuid = curTrace?.cached ? curTrace.uuid : '';
    if (traceUuid === curCacheUuid) {
        // Do nothing, matches the currently loaded trace.
        return;
    }
    if (traceUuid === '') {
        // This can happen if we switch from an empty UI state to an invalid UUID
        // (e.g. due to a cache miss, below). This can also happen if the user just
        // types /#!/viewer?local_cache_key=.
        return;
    }
    // This handles the case when a trace T1 is loaded and then the url is set to
    // ?local_cache_key=T2. In that case globals.state.traceUuid remains set to T1
    // until T2 has been loaded by the trace processor (can take several seconds).
    // This early out prevents to re-trigger the openTraceFromXXX() action if the
    // URL changes (e.g. if the user navigates back/fwd) while the new trace is
    // being loaded.
    if (curTrace !== undefined &&
        curTrace.source.type === 'ARRAY_BUFFER' &&
        curTrace.source.uuid === traceUuid) {
        return;
    }
    // Fetch the trace from the cache storage. If available load it. If not, show
    // a dialog informing the user about the cache miss.
    const maybeTrace = await (0, cache_manager_1.tryGetTrace)(traceUuid);
    const navigateToOldTraceUuid = () => router_1.Router.navigate(`#!/viewer?local_cache_key=${curCacheUuid}`);
    if (!maybeTrace) {
        (0, modal_1.showModal)({
            title: 'Could not find the trace in the cache storage',
            content: (0, mithril_1.default)('div', (0, mithril_1.default)('p', 'You are trying to load a cached trace by setting the ' +
                '?local_cache_key argument in the URL.'), (0, mithril_1.default)('p', "Unfortunately the trace wasn't in the cache storage."), (0, mithril_1.default)('p', "This can happen if a tab was discarded and wasn't opened " +
                'for too long, or if you just mis-pasted the URL.'), (0, mithril_1.default)('pre', `Trace UUID: ${traceUuid}`)),
        });
        navigateToOldTraceUuid();
        return;
    }
    // If the UI is in a blank state (no trace has been ever opened), just load
    // the trace without showing any further dialog. This is the case of tab
    // discarding, reloading or pasting a url with a local_cache_key in an empty
    // instance.
    if (curTrace === undefined) {
        app_impl_1.AppImpl.instance.openTraceFromBuffer(maybeTrace);
        return;
    }
    // If, instead, another trace is loaded, ask confirmation to the user.
    // Switching to another trace clears the UI state. It can be quite annoying to
    // lose the UI state by accidentally navigating back too much.
    let hasOpenedNewTrace = false;
    await (0, modal_1.showModal)({
        title: 'You are about to load a different trace and reset the UI state',
        content: (0, mithril_1.default)('div', (0, mithril_1.default)('p', 'You are seeing this because you either pasted a URL with ' +
            'a different ?local_cache_key=xxx argument or because you hit ' +
            'the history back/fwd button and reached a different trace.'), (0, mithril_1.default)('p', 'If you continue another trace will be loaded and the UI ' +
            'state will be cleared.'), (0, mithril_1.default)('pre', `Old trace: ${curTrace !== undefined ? curCacheUuid : '<no trace>'}\n` +
            `New trace: ${traceUuid}`)),
        buttons: [
            {
                text: 'Continue',
                id: 'trace_id_open', // Used by tests.
                primary: true,
                action: () => {
                    hasOpenedNewTrace = true;
                    app_impl_1.AppImpl.instance.openTraceFromBuffer(maybeTrace);
                },
            },
            { text: 'Cancel' },
        ],
    });
    if (!hasOpenedNewTrace) {
        // We handle this after the modal await rather than in the cancel button
        // action so this has effect even if the user clicks Esc or clicks outside
        // of the modal dialog and dismisses it.
        navigateToOldTraceUuid();
    }
}
function loadTraceFromUrl(url) {
    const isLocalhostTraceUrl = ['127.0.0.1', 'localhost'].includes(new URL(url).hostname);
    if (isLocalhostTraceUrl) {
        // This handles the special case of tools/record_android_trace serving the
        // traces from a local webserver and killing it immediately after having
        // seen the HTTP GET request. In those cases store the trace as a file, so
        // when users click on share we don't fail the re-fetch().
        const fileName = url.split('/').pop() ?? 'local_trace.pftrace';
        const request = fetch(url)
            .then((response) => response.blob())
            .then((b) => app_impl_1.AppImpl.instance.openTraceFromFile(new File([b], fileName)))
            .catch((e) => alert(`Could not load local trace ${e}`));
        task_tracker_1.taskTracker.trackPromise(request, 'Downloading local trace');
    }
    else {
        app_impl_1.AppImpl.instance.openTraceFromUrl(url);
    }
}
function openTraceFromAndroidBugTool() {
    const msg = 'Loading trace from ABT extension';
    app_impl_1.AppImpl.instance.omnibox.showStatusMessage(msg);
    const loadInfo = (0, android_bug_tool_1.loadAndroidBugToolInfo)();
    task_tracker_1.taskTracker.trackPromise(loadInfo, msg);
    loadInfo
        .then((info) => app_impl_1.AppImpl.instance.openTraceFromFile(info.file))
        .catch((e) => console.error(e));
}
//# sourceMappingURL=trace_url_handler.js.map