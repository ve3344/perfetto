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
exports.isTrustedOrigin = isTrustedOrigin;
exports.postMessageHandler = postMessageHandler;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const time_1 = require("../base/time");
const modal_1 = require("../widgets/modal");
const css_constants_1 = require("./css_constants");
const help_modal_1 = require("./help_modal");
const scroll_helper_1 = require("../public/scroll_helper");
const app_impl_1 = require("../core/app_impl");
const TRUSTED_ORIGINS_KEY = 'trustedOrigins';
// Returns whether incoming traces should be opened automatically or should
// instead require a user interaction.
function isTrustedOrigin(origin) {
    const TRUSTED_ORIGINS = [
        'https://chrometto.googleplex.com',
        'https://uma.googleplex.com',
        'https://android-build.googleplex.com',
    ];
    if (origin === window.origin)
        return true;
    if (origin === 'null')
        return false;
    if (TRUSTED_ORIGINS.includes(origin))
        return true;
    if (isUserTrustedOrigin(origin))
        return true;
    const hostname = new URL(origin).hostname;
    if (hostname.endsWith('.corp.google.com'))
        return true;
    if (hostname.endsWith('.c.googlers.com'))
        return true;
    if (hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '[::1]') {
        return true;
    }
    return false;
}
// Returns whether the user saved this as an always-trusted origin.
function isUserTrustedOrigin(hostname) {
    const trustedOrigins = window.localStorage.getItem(TRUSTED_ORIGINS_KEY);
    if (trustedOrigins === null)
        return false;
    try {
        return JSON.parse(trustedOrigins).includes(hostname);
    }
    catch {
        return false;
    }
}
// Saves the given hostname as a trusted origin.
// This is used for user convenience: if it fails for any reason, it's not a
// big deal.
function saveUserTrustedOrigin(hostname) {
    const s = window.localStorage.getItem(TRUSTED_ORIGINS_KEY);
    let origins;
    try {
        origins = JSON.parse(s ?? '[]');
        if (origins.includes(hostname))
            return;
        origins.push(hostname);
        window.localStorage.setItem(TRUSTED_ORIGINS_KEY, JSON.stringify(origins));
    }
    catch (e) {
        console.warn('unable to save trusted origins to localStorage', e);
    }
}
// Returns whether we should ignore a given message based on the value of
// the 'perfettoIgnore' field in the event data.
function shouldGracefullyIgnoreMessage(messageEvent) {
    return messageEvent.data.perfettoIgnore === true;
}
// The message handler supports loading traces from an ArrayBuffer.
// There is no other requirement than sending the ArrayBuffer as the |data|
// property. However, since this will happen across different origins, it is not
// possible for the source website to inspect whether the message handler is
// ready, so the message handler always replies to a 'PING' message with 'PONG',
// which indicates it is ready to receive a trace.
function postMessageHandler(messageEvent) {
    if (shouldGracefullyIgnoreMessage(messageEvent)) {
        // This message should not be handled in this handler,
        // because it will be handled elsewhere.
        return;
    }
    if (messageEvent.origin === 'https://tagassistant.google.com') {
        // The GA debugger, does a window.open() and sends messages to the GA
        // script. Ignore them.
        return;
    }
    if (document.readyState !== 'complete') {
        console.error('Ignoring message - document not ready yet.');
        return;
    }
    const fromOpener = messageEvent.source === window.opener;
    const fromIframeHost = messageEvent.source === window.parent;
    // This adds support for the folowing flow:
    // * A (page that whats to open a trace in perfetto) opens B
    // * B (does something to get the traceBuffer)
    // * A is navigated to Perfetto UI
    // * B sends the traceBuffer to A
    // * closes itself
    const fromOpenee = messageEvent.source.opener === window;
    if (messageEvent.source === null ||
        !(fromOpener || fromIframeHost || fromOpenee)) {
        // This can happen if an extension tries to postMessage.
        return;
    }
    if (!('data' in messageEvent)) {
        throw new Error('Incoming message has no data property');
    }
    if (messageEvent.data === 'PING') {
        // Cross-origin messaging means we can't read |messageEvent.source|, but
        // it still needs to be of the correct type to be able to invoke the
        // correct version of postMessage(...).
        const windowSource = messageEvent.source;
        // Use '*' for the reply because in cases of cross-domain isolation, we
        // see the messageEvent.origin as 'null'. PONG doen't disclose any
        // interesting information, so there is no harm sending that to the wrong
        // origin in the worst case.
        windowSource.postMessage('PONG', '*');
        return;
    }
    if (messageEvent.data === 'SHOW-HELP') {
        (0, help_modal_1.toggleHelp)();
        return;
    }
    if (messageEvent.data === 'RELOAD-CSS-CONSTANTS') {
        (0, css_constants_1.initCssConstants)();
        return;
    }
    let postedScrollToRange;
    if (isPostedScrollToRange(messageEvent.data)) {
        postedScrollToRange = messageEvent.data.perfetto;
        scrollToTimeRange(postedScrollToRange);
        return;
    }
    let postedTrace;
    let keepApiOpen = false;
    if (isPostedTraceWrapped(messageEvent.data)) {
        postedTrace = sanitizePostedTrace(messageEvent.data.perfetto);
        if (postedTrace.keepApiOpen) {
            keepApiOpen = true;
        }
    }
    else if (messageEvent.data instanceof ArrayBuffer) {
        postedTrace = { title: 'External trace', buffer: messageEvent.data };
    }
    else {
        console.warn('Unknown postMessage() event received. If you are trying to open a ' +
            'trace via postMessage(), this is a bug in your code. If not, this ' +
            'could be due to some Chrome extension.');
        console.log('origin:', messageEvent.origin, 'data:', messageEvent.data);
        return;
    }
    if (postedTrace.buffer.byteLength === 0) {
        throw new Error('Incoming message trace buffer is empty');
    }
    if (!keepApiOpen) {
        /* Removing this event listener to avoid callers posting the trace multiple
         * times. If the callers add an event listener which upon receiving 'PONG'
         * posts the trace to ui.perfetto.dev, the callers can receive multiple
         * 'PONG' messages and accidentally post the trace multiple times. This was
         * part of the cause of b/182502595.
         */
        window.removeEventListener('message', postMessageHandler);
    }
    const openTrace = () => {
        // For external traces, we need to disable other features such as
        // downloading and sharing a trace.
        postedTrace.localOnly = true;
        app_impl_1.AppImpl.instance.openTraceFromBuffer(postedTrace);
    };
    const trustAndOpenTrace = () => {
        saveUserTrustedOrigin(messageEvent.origin);
        openTrace();
    };
    // If the origin is trusted open the trace directly.
    if (isTrustedOrigin(messageEvent.origin)) {
        openTrace();
        return;
    }
    // If not ask the user if they expect this and trust the origin.
    let originTxt = messageEvent.origin;
    let originUnknown = false;
    if (originTxt === 'null') {
        originTxt = 'An unknown origin';
        originUnknown = true;
    }
    (0, modal_1.showModal)({
        title: 'Open trace?',
        content: (0, mithril_1.default)('div', (0, mithril_1.default)('div', `${originTxt} is trying to open a trace file.`), (0, mithril_1.default)('div', 'Do you trust the origin and want to proceed?')),
        buttons: [
            { text: 'No', primary: true },
            { text: 'Yes', primary: false, action: openTrace },
        ].concat(originUnknown
            ? []
            : { text: 'Always trust', primary: false, action: trustAndOpenTrace }),
    });
}
function sanitizePostedTrace(postedTrace) {
    const result = {
        title: sanitizeString(postedTrace.title),
        buffer: postedTrace.buffer,
        keepApiOpen: postedTrace.keepApiOpen,
    };
    if (postedTrace.url !== undefined) {
        result.url = sanitizeString(postedTrace.url);
    }
    result.pluginArgs = postedTrace.pluginArgs;
    return result;
}
function sanitizeString(str) {
    return str.replace(/[^A-Za-z0-9.\-_#:/?=&;%+$ ]/g, ' ');
}
const _maxScrollToRangeAttempts = 20;
async function scrollToTimeRange(postedScrollToRange, maxAttempts) {
    const ready = app_impl_1.AppImpl.instance.trace && !app_impl_1.AppImpl.instance.isLoadingTrace;
    if (!ready) {
        if (maxAttempts === undefined) {
            maxAttempts = 0;
        }
        if (maxAttempts > _maxScrollToRangeAttempts) {
            console.warn('Could not scroll to time range. Trace viewer not ready.');
            return;
        }
        setTimeout(scrollToTimeRange, 200, postedScrollToRange, maxAttempts + 1);
    }
    else {
        const start = time_1.Time.fromSeconds(postedScrollToRange.timeStart);
        const end = time_1.Time.fromSeconds(postedScrollToRange.timeEnd);
        (0, scroll_helper_1.scrollTo)({
            time: { start, end, viewPercentage: postedScrollToRange.viewPercentage },
        });
    }
}
function isPostedScrollToRange(obj) {
    const wrapped = obj;
    if (wrapped.perfetto === undefined) {
        return false;
    }
    return (wrapped.perfetto.timeStart !== undefined ||
        wrapped.perfetto.timeEnd !== undefined);
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isPostedTraceWrapped(obj) {
    const wrapped = obj;
    if (wrapped.perfetto === undefined) {
        return false;
    }
    return (wrapped.perfetto.buffer !== undefined &&
        wrapped.perfetto.title !== undefined);
}
//# sourceMappingURL=post_message_handler.js.map