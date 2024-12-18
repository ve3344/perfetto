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
exports.Sidebar = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const channels_1 = require("../core/channels");
const trace_1 = require("../public/trace");
const metatracing_1 = require("../core/metatracing");
const feature_flags_1 = require("../core/feature_flags");
const raf_scheduler_1 = require("../core/raf_scheduler");
const perfetto_version_1 = require("../gen/perfetto_version");
const modal_1 = require("../widgets/modal");
const animation_1 = require("./animation");
const download_utils_1 = require("../base/download_utils");
const globals_1 = require("./globals");
const help_modal_1 = require("./help_modal");
const trace_share_utils_1 = require("./trace_share_utils");
const trace_converter_1 = require("./trace_converter");
const legacy_trace_viewer_1 = require("./legacy_trace_viewer");
const sidebar_1 = require("../public/sidebar");
const app_impl_1 = require("../core/app_impl");
const utils_1 = require("../base/utils");
const clipboard_1 = require("../base/clipboard");
const classnames_1 = require("../base/classnames");
const hotkeys_1 = require("../base/hotkeys");
const assets_1 = require("../base/assets");
const GITILES_URL = 'https://android.googlesource.com/platform/external/perfetto';
function getBugReportUrl() {
    if (globals_1.globals.isInternalUser) {
        return 'https://goto.google.com/perfetto-ui-bug';
    }
    else {
        return 'https://github.com/google/perfetto/issues/new';
    }
}
const HIRING_BANNER_FLAG = feature_flags_1.featureFlags.register({
    id: 'showHiringBanner',
    name: 'Show hiring banner',
    description: 'Show the "We\'re hiring" banner link in the side bar.',
    defaultValue: false,
});
function shouldShowHiringBanner() {
    return globals_1.globals.isInternalUser && HIRING_BANNER_FLAG.get();
}
async function openCurrentTraceWithOldUI(trace) {
    app_impl_1.AppImpl.instance.analytics.logEvent('Trace Actions', 'Open current trace in legacy UI');
    const file = await trace.getTraceFile();
    await (0, legacy_trace_viewer_1.openInOldUIWithSizeCheck)(file);
}
async function convertTraceToSystrace(trace) {
    app_impl_1.AppImpl.instance.analytics.logEvent('Trace Actions', 'Convert to .systrace');
    const file = await trace.getTraceFile();
    await (0, trace_converter_1.convertTraceToSystraceAndDownload)(file);
}
async function convertTraceToJson(trace) {
    app_impl_1.AppImpl.instance.analytics.logEvent('Trace Actions', 'Convert to .json');
    const file = await trace.getTraceFile();
    await (0, trace_converter_1.convertTraceToJsonAndDownload)(file);
}
function downloadTrace(trace) {
    if (!trace.traceInfo.downloadable)
        return;
    app_impl_1.AppImpl.instance.analytics.logEvent('Trace Actions', 'Download trace');
    let url = '';
    let fileName = `trace${trace_1.TRACE_SUFFIX}`;
    const src = trace.traceInfo.source;
    if (src.type === 'URL') {
        url = src.url;
        fileName = url.split('/').slice(-1)[0];
    }
    else if (src.type === 'ARRAY_BUFFER') {
        const blob = new Blob([src.buffer], { type: 'application/octet-stream' });
        const inputFileName = window.prompt('Please enter a name for your file or leave blank');
        if (inputFileName) {
            fileName = `${inputFileName}.perfetto_trace.gz`;
        }
        else if (src.fileName) {
            fileName = src.fileName;
        }
        url = URL.createObjectURL(blob);
    }
    else if (src.type === 'FILE') {
        const file = src.file;
        url = URL.createObjectURL(file);
        fileName = file.name;
    }
    else {
        throw new Error(`Download from ${JSON.stringify(src)} is not supported`);
    }
    (0, download_utils_1.downloadUrl)(fileName, url);
}
function highPrecisionTimersAvailable() {
    // High precision timers are available either when the page is cross-origin
    // isolated or when the trace processor is a standalone binary.
    return (window.crossOriginIsolated ||
        app_impl_1.AppImpl.instance.trace?.engine.mode === 'HTTP_RPC');
}
function recordMetatrace(engine) {
    app_impl_1.AppImpl.instance.analytics.logEvent('Trace Actions', 'Record metatrace');
    if (!highPrecisionTimersAvailable()) {
        const PROMPT = `High-precision timers are not available to WASM trace processor yet.

Modern browsers restrict high-precision timers to cross-origin-isolated pages.
As Perfetto UI needs to open traces via postMessage, it can't be cross-origin
isolated until browsers ship support for
'Cross-origin-opener-policy: restrict-properties'.

Do you still want to record a metatrace?
Note that events under timer precision (1ms) will dropped.
Alternatively, connect to a trace_processor_shell --httpd instance.
`;
        (0, modal_1.showModal)({
            title: `Trace processor doesn't have high-precision timers`,
            content: (0, mithril_1.default)('.modal-pre', PROMPT),
            buttons: [
                {
                    text: 'YES, record metatrace',
                    primary: true,
                    action: () => {
                        (0, metatracing_1.enableMetatracing)();
                        engine.enableMetatrace();
                    },
                },
                {
                    text: 'NO, cancel',
                },
            ],
        });
    }
    else {
        engine.enableMetatrace();
    }
}
async function toggleMetatrace(e) {
    return (0, metatracing_1.isMetatracingEnabled)() ? finaliseMetatrace(e) : recordMetatrace(e);
}
async function finaliseMetatrace(engine) {
    app_impl_1.AppImpl.instance.analytics.logEvent('Trace Actions', 'Finalise metatrace');
    const jsEvents = (0, metatracing_1.disableMetatracingAndGetTrace)();
    const result = await engine.stopAndGetMetatrace();
    if (result.error.length !== 0) {
        throw new Error(`Failed to read metatrace: ${result.error}`);
    }
    (0, download_utils_1.downloadData)('metatrace', result.metatrace, jsEvents);
}
class EngineRPCWidget {
    view({ attrs }) {
        let cssClass = '';
        let title = 'Number of pending SQL queries';
        let label;
        let failed = false;
        let mode;
        const engine = attrs.trace?.engine;
        if (engine !== undefined) {
            mode = engine.mode;
            if (engine.failed !== undefined) {
                cssClass += '.red';
                title = 'Query engine crashed\n' + engine.failed;
                failed = true;
            }
        }
        // If we don't have an engine yet, guess what will be the mode that will
        // be used next time we'll create one. Even if we guess it wrong (somehow
        // trace_controller.ts takes a different decision later, e.g. because the
        // RPC server is shut down after we load the UI and cached httpRpcState)
        // this will eventually become  consistent once the engine is created.
        if (mode === undefined) {
            if (app_impl_1.AppImpl.instance.httpRpc.httpRpcAvailable &&
                app_impl_1.AppImpl.instance.httpRpc.newEngineMode === 'USE_HTTP_RPC_IF_AVAILABLE') {
                mode = 'HTTP_RPC';
            }
            else {
                mode = 'WASM';
            }
        }
        if (mode === 'HTTP_RPC') {
            cssClass += '.green';
            label = 'RPC';
            title += '\n(Query engine: native accelerator over HTTP+RPC)';
        }
        else {
            label = 'WSM';
            title += '\n(Query engine: built-in WASM)';
        }
        const numReqs = attrs.trace?.engine.numRequestsPending ?? 0;
        return (0, mithril_1.default)(`.dbg-info-square${cssClass}`, { title }, (0, mithril_1.default)('div', label), (0, mithril_1.default)('div', `${failed ? 'FAIL' : numReqs}`));
    }
}
const ServiceWorkerWidget = {
    view() {
        let cssClass = '';
        let title = 'Service Worker: ';
        let label = 'N/A';
        const ctl = app_impl_1.AppImpl.instance.serviceWorkerController;
        if (!('serviceWorker' in navigator)) {
            label = 'N/A';
            title += 'not supported by the browser (requires HTTPS)';
        }
        else if (ctl.bypassed) {
            label = 'OFF';
            cssClass = '.red';
            title += 'Bypassed, using live network. Double-click to re-enable';
        }
        else if (ctl.installing) {
            label = 'UPD';
            cssClass = '.amber';
            title += 'Installing / updating ...';
        }
        else if (!navigator.serviceWorker.controller) {
            label = 'N/A';
            title += 'Not available, using network';
        }
        else {
            label = 'ON';
            cssClass = '.green';
            title += 'Serving from cache. Ready for offline use';
        }
        const toggle = async () => {
            if (ctl.bypassed) {
                ctl.setBypass(false);
                return;
            }
            (0, modal_1.showModal)({
                title: 'Disable service worker?',
                content: (0, mithril_1.default)('div', (0, mithril_1.default)('p', `If you continue the service worker will be disabled until
                      manually re-enabled.`), (0, mithril_1.default)('p', `All future requests will be served from the network and the
                    UI won't be available offline.`), (0, mithril_1.default)('p', `You should do this only if you are debugging the UI
                    or if you are experiencing caching-related problems.`), (0, mithril_1.default)('p', `Disabling will cause a refresh of the UI, the current state
                    will be lost.`)),
                buttons: [
                    {
                        text: 'Disable and reload',
                        primary: true,
                        action: () => ctl.setBypass(true).then(() => location.reload()),
                    },
                    { text: 'Cancel' },
                ],
            });
        };
        return (0, mithril_1.default)(`.dbg-info-square${cssClass}`, { title, ondblclick: toggle }, (0, mithril_1.default)('div', 'SW'), (0, mithril_1.default)('div', label));
    },
};
class SidebarFooter {
    view({ attrs }) {
        return (0, mithril_1.default)('.sidebar-footer', (0, mithril_1.default)(EngineRPCWidget, attrs), (0, mithril_1.default)(ServiceWorkerWidget), (0, mithril_1.default)('.version', (0, mithril_1.default)('a', {
            href: `${GITILES_URL}/+/${perfetto_version_1.SCM_REVISION}/ui`,
            title: `Channel: ${(0, channels_1.getCurrentChannel)()}`,
            target: '_blank',
        }, perfetto_version_1.VERSION)));
    }
}
class HiringBanner {
    view() {
        return (0, mithril_1.default)('.hiring-banner', (0, mithril_1.default)('a', {
            href: 'http://go/perfetto-open-roles',
            target: '_blank',
        }, "We're hiring!"));
    }
}
class Sidebar {
    _redrawWhileAnimating = new animation_1.Animation(() => raf_scheduler_1.raf.scheduleFullRedraw('force'));
    _asyncJobPending = new Set();
    _sectionExpanded = new Map();
    constructor() {
        registerMenuItems();
    }
    view({ attrs }) {
        const sidebar = app_impl_1.AppImpl.instance.sidebar;
        if (!sidebar.enabled)
            return null;
        return (0, mithril_1.default)('nav.sidebar', {
            class: sidebar.visible ? 'show-sidebar' : 'hide-sidebar',
            // 150 here matches --sidebar-timing in the css.
            // TODO(hjd): Should link to the CSS variable.
            ontransitionstart: (e) => {
                if (e.target !== e.currentTarget)
                    return;
                this._redrawWhileAnimating.start(150);
            },
            ontransitionend: (e) => {
                if (e.target !== e.currentTarget)
                    return;
                this._redrawWhileAnimating.stop();
            },
        }, shouldShowHiringBanner() ? (0, mithril_1.default)(HiringBanner) : null, (0, mithril_1.default)(`header.${(0, channels_1.getCurrentChannel)()}`, (0, mithril_1.default)(`img[src=${(0, assets_1.assetSrc)('assets/brand.png')}].brand`), (0, mithril_1.default)('button.sidebar-button', {
            onclick: () => sidebar.toggleVisibility(),
        }, (0, mithril_1.default)('i.material-icons', {
            title: sidebar.visible ? 'Hide menu' : 'Show menu',
        }, 'menu'))), (0, mithril_1.default)('.sidebar-scroll', (0, mithril_1.default)('.sidebar-scroll-container', ...Object.keys(sidebar_1.SIDEBAR_SECTIONS).map((s) => this.renderSection(s)), (0, mithril_1.default)(SidebarFooter, attrs))));
    }
    renderSection(sectionId) {
        const section = sidebar_1.SIDEBAR_SECTIONS[sectionId];
        const menuItems = app_impl_1.AppImpl.instance.sidebar.menuItems
            .valuesAsArray()
            .filter((item) => item.section === sectionId)
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
            .map((item) => this.renderItem(item));
        // Don't render empty sections.
        if (menuItems.length === 0)
            return undefined;
        const expanded = (0, utils_1.getOrCreate)(this._sectionExpanded, sectionId, () => true);
        return (0, mithril_1.default)(`section${expanded ? '.expanded' : ''}`, (0, mithril_1.default)('.section-header', {
            onclick: () => {
                this._sectionExpanded.set(sectionId, !expanded);
                raf_scheduler_1.raf.scheduleFullRedraw();
            },
        }, (0, mithril_1.default)('h1', { title: section.title }, section.title), (0, mithril_1.default)('h2', section.summary)), (0, mithril_1.default)('.section-content', (0, mithril_1.default)('ul', menuItems)));
    }
    renderItem(item) {
        let href = '#';
        let disabled = false;
        let target = null;
        let command = undefined;
        let tooltip = valueOrCallback(item.tooltip);
        let onclick = undefined;
        const commandId = 'commandId' in item ? item.commandId : undefined;
        const action = 'action' in item ? item.action : undefined;
        let text = valueOrCallback(item.text);
        const disabReason = valueOrCallback(item.disabled);
        if (disabReason === true || typeof disabReason === 'string') {
            disabled = true;
            onclick = () => typeof disabReason === 'string' && alert(disabReason);
        }
        else if (action !== undefined) {
            onclick = action;
        }
        else if (commandId !== undefined) {
            const cmdMgr = app_impl_1.AppImpl.instance.commands;
            command = cmdMgr.hasCommand(commandId ?? '')
                ? cmdMgr.getCommand(commandId)
                : undefined;
            if (command === undefined) {
                disabled = true;
            }
            else {
                text = text !== undefined ? text : command.name;
                if (command.defaultHotkey !== undefined) {
                    tooltip =
                        `${tooltip ?? command.name}` +
                            ` [${(0, hotkeys_1.formatHotkey)(command.defaultHotkey)}]`;
                }
                onclick = () => cmdMgr.runCommand(commandId);
            }
        }
        // This is not an else if because in some rare cases the user might want
        // to have both an href and onclick, with different behaviors. The only case
        // today is the trace name / URL, where we want the URL in the href to
        // support right-click -> copy URL, but the onclick does copyToClipboard().
        if ('href' in item && item.href !== undefined) {
            href = item.href;
            target = href.startsWith('#') ? null : '_blank';
        }
        return (0, mithril_1.default)('li', (0, mithril_1.default)('a', {
            className: (0, classnames_1.classNames)(valueOrCallback(item.cssClass), this._asyncJobPending.has(item.id) && 'pending'),
            onclick: onclick && this.wrapClickHandler(item.id, onclick),
            href,
            target,
            disabled,
            title: tooltip,
        }, (0, utils_1.exists)(item.icon) && (0, mithril_1.default)('i.material-icons', valueOrCallback(item.icon)), text));
    }
    // Creates the onClick handlers for the items which provided a function in the
    // `action` member. The function can be either sync or async.
    // What we want to achieve here is the following:
    // - If the action is async (returns a Promise), we want to render a spinner,
    //   next to the menu item, until the promise is resolved.
    // - [Minor] we want to call e.preventDefault() to override the behaviour of
    //   the <a href='#'> which gets rendered for accessibility reasons.
    wrapClickHandler(itemId, itemAction) {
        return (e) => {
            e.preventDefault(); // Make the <a href="#"> a no-op.
            const res = itemAction();
            if (!(res instanceof Promise))
                return;
            if (this._asyncJobPending.has(itemId)) {
                return; // Don't queue up another action if not yet finished.
            }
            this._asyncJobPending.add(itemId);
            raf_scheduler_1.raf.scheduleFullRedraw();
            res.finally(() => {
                this._asyncJobPending.delete(itemId);
                raf_scheduler_1.raf.scheduleFullRedraw('force');
            });
        };
    }
}
exports.Sidebar = Sidebar;
// TODO(primiano): The registrations below should be moved to dedicated
// plugins (most of this really belongs to core_plugins/commads/index.ts).
// For now i'm keeping everything here as splitting these require moving some
// functions like share_trace() out of core, splitting out permalink, etc.
let globalItemsRegistered = false;
const traceItemsRegistered = new WeakSet();
function registerMenuItems() {
    if (!globalItemsRegistered) {
        globalItemsRegistered = true;
        registerGlobalSidebarEntries();
    }
    const trace = app_impl_1.AppImpl.instance.trace;
    if (trace !== undefined && !traceItemsRegistered.has(trace)) {
        traceItemsRegistered.add(trace);
        registerTraceMenuItems(trace);
    }
}
function registerGlobalSidebarEntries() {
    const app = app_impl_1.AppImpl.instance;
    // TODO(primiano): The Open file / Open with legacy entries are registered by
    // the 'perfetto.CoreCommands' plugins. Make things consistent.
    app.sidebar.addMenuItem({
        section: 'support',
        text: 'Keyboard shortcuts',
        action: help_modal_1.toggleHelp,
        icon: 'help',
    });
    app.sidebar.addMenuItem({
        section: 'support',
        text: 'Documentation',
        href: 'https://perfetto.dev/docs',
        icon: 'find_in_page',
    });
    app.sidebar.addMenuItem({
        section: 'support',
        sortOrder: 4,
        text: 'Report a bug',
        href: getBugReportUrl(),
        icon: 'bug_report',
    });
}
function registerTraceMenuItems(trace) {
    const downloadDisabled = trace.traceInfo.downloadable
        ? false
        : 'Cannot download external trace';
    const traceTitle = trace?.traceInfo.traceTitle;
    traceTitle &&
        trace.sidebar.addMenuItem({
            section: 'current_trace',
            text: traceTitle,
            href: trace.traceInfo.traceUrl,
            action: () => (0, clipboard_1.copyToClipboard)(trace.traceInfo.traceUrl),
            tooltip: 'Click to copy the URL',
            cssClass: 'trace-file-name',
        });
    trace.sidebar.addMenuItem({
        section: 'current_trace',
        text: 'Show timeline',
        href: '#!/viewer',
        icon: 'line_style',
    });
    globals_1.globals.isInternalUser &&
        trace.sidebar.addMenuItem({
            section: 'current_trace',
            text: 'Share',
            action: async () => await (0, trace_share_utils_1.shareTrace)(trace),
            icon: 'share',
        });
    trace.sidebar.addMenuItem({
        section: 'current_trace',
        text: 'Download',
        action: () => downloadTrace(trace),
        icon: 'file_download',
        disabled: downloadDisabled,
    });
    trace.sidebar.addMenuItem({
        section: 'convert_trace',
        text: 'Switch to legacy UI',
        action: async () => await openCurrentTraceWithOldUI(trace),
        icon: 'filter_none',
        disabled: downloadDisabled,
    });
    trace.sidebar.addMenuItem({
        section: 'convert_trace',
        text: 'Convert to .json',
        action: async () => await convertTraceToJson(trace),
        icon: 'file_download',
        disabled: downloadDisabled,
    });
    trace.traceInfo.hasFtrace &&
        trace.sidebar.addMenuItem({
            section: 'convert_trace',
            text: 'Convert to .systrace',
            action: async () => await convertTraceToSystrace(trace),
            icon: 'file_download',
            disabled: downloadDisabled,
        });
    trace.sidebar.addMenuItem({
        section: 'support',
        sortOrder: 5,
        text: () => (0, metatracing_1.isMetatracingEnabled)() ? 'Finalize metatrace' : 'Record metatrace',
        action: () => toggleMetatrace(trace.engine),
        icon: () => ((0, metatracing_1.isMetatracingEnabled)() ? 'download' : 'fiber_smart_record'),
    });
}
function valueOrCallback(value) {
    if (value === undefined)
        return undefined;
    return value instanceof Function ? value() : value;
}
//# sourceMappingURL=sidebar.js.map