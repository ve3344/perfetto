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
exports.AppImpl = exports.AppContext = void 0;
const logging_1 = require("../base/logging");
const command_manager_1 = require("./command_manager");
const omnibox_manager_1 = require("./omnibox_manager");
const raf_scheduler_1 = require("./raf_scheduler");
const sidebar_manager_1 = require("./sidebar_manager");
const plugin_manager_1 = require("./plugin_manager");
const load_trace_1 = require("./load_trace");
const plugin_manager_2 = require("./plugin_manager");
const router_1 = require("./router");
const analytics_impl_1 = require("./analytics_impl");
const utils_1 = require("../base/utils");
const page_manager_1 = require("./page_manager");
const perf_manager_1 = require("./perf_manager");
const service_worker_controller_1 = require("../frontend/service_worker_controller");
const feature_flags_1 = require("./feature_flags");
/**
 * Handles the global state of the ui, for anything that is not related to a
 * specific trace. This is always available even before a trace is loaded (in
 * contrast to TraceContext, which is bound to the lifetime of a trace).
 * There is only one instance in total of this class (see instance()).
 * This class is only exposed to TraceImpl, nobody else should refer to this
 * and should use AppImpl instead.
 */
class AppContext {
    // The per-plugin instances of AppImpl (including the CORE_PLUGIN one).
    pluginInstances = new Map();
    commandMgr = new command_manager_1.CommandManagerImpl();
    omniboxMgr = new omnibox_manager_1.OmniboxManagerImpl();
    pageMgr = new page_manager_1.PageManagerImpl();
    sidebarMgr;
    pluginMgr;
    perfMgr = new perf_manager_1.PerfManager();
    analytics;
    serviceWorkerController;
    httpRpc = {
        newEngineMode: 'USE_HTTP_RPC_IF_AVAILABLE',
        httpRpcAvailable: false,
    };
    initialRouteArgs;
    isLoadingTrace = false; // Set when calling openTrace().
    initArgs;
    embeddedMode;
    testingMode;
    // This is normally empty and is injected with extra google-internal packages
    // via is_internal_user.js
    extraSqlPackages = [];
    // The currently open trace.
    currentTrace;
    static _instance;
    static initialize(initArgs) {
        (0, logging_1.assertTrue)(AppContext._instance === undefined);
        return (AppContext._instance = new AppContext(initArgs));
    }
    static get instance() {
        return (0, logging_1.assertExists)(AppContext._instance);
    }
    // This constructor is invoked only once, when frontend/index.ts invokes
    // AppMainImpl.initialize().
    constructor(initArgs) {
        this.initArgs = initArgs;
        this.initialRouteArgs = initArgs.initialRouteArgs;
        this.serviceWorkerController = new service_worker_controller_1.ServiceWorkerController();
        this.embeddedMode = this.initialRouteArgs.mode === 'embedded';
        this.testingMode =
            self.location !== undefined &&
                self.location.search.indexOf('testing=1') >= 0;
        this.sidebarMgr = new sidebar_manager_1.SidebarManagerImpl({
            disabled: this.embeddedMode,
            hidden: this.initialRouteArgs.hideSidebar,
        });
        this.analytics = (0, analytics_impl_1.initAnalytics)(this.testingMode, this.embeddedMode);
        this.pluginMgr = new plugin_manager_1.PluginManagerImpl({
            forkForPlugin: (pluginId) => this.forPlugin(pluginId),
            get trace() {
                return AppImpl.instance.trace;
            },
        });
    }
    // Gets or creates an instance of AppImpl backed by the current AppContext
    // for the given plugin.
    forPlugin(pluginId) {
        return (0, utils_1.getOrCreate)(this.pluginInstances, pluginId, () => {
            return new AppImpl(this, pluginId);
        });
    }
    closeCurrentTrace() {
        this.omniboxMgr.reset(/* focus= */ false);
        if (this.currentTrace !== undefined) {
            // This will trigger the unregistration of trace-scoped commands and
            // sidebar menuitems (and few similar things).
            this.currentTrace[Symbol.dispose]();
            this.currentTrace = undefined;
        }
    }
    // Called by trace_loader.ts soon after it has created a new TraceImpl.
    setActiveTrace(traceCtx) {
        // In 99% this closeCurrentTrace() call is not needed because the real one
        // is performed by openTrace() in this file. However in some rare cases we
        // might end up loading a trace while another one is still loading, and this
        // covers races in that case.
        this.closeCurrentTrace();
        this.currentTrace = traceCtx;
    }
}
exports.AppContext = AppContext;
/*
 * Every plugin gets its own instance. This is how we keep track
 * what each plugin is doing and how we can blame issues on particular
 * plugins.
 * The instance exists for the whole duration a plugin is active.
 */
class AppImpl {
    pluginId;
    appCtx;
    pageMgrProxy;
    // Invoked by frontend/index.ts.
    static initialize(args) {
        AppContext.initialize(args).forPlugin(plugin_manager_2.CORE_PLUGIN_ID);
    }
    // Gets access to the one instance that the core can use. Note that this is
    // NOT the only instance, as other AppImpl instance will be created for each
    // plugin.
    static get instance() {
        return AppContext.instance.forPlugin(plugin_manager_2.CORE_PLUGIN_ID);
    }
    // Only called by AppContext.forPlugin().
    constructor(appCtx, pluginId) {
        this.appCtx = appCtx;
        this.pluginId = pluginId;
        this.pageMgrProxy = (0, utils_1.createProxy)(this.appCtx.pageMgr, {
            registerPage(pageHandler) {
                return appCtx.pageMgr.registerPage({
                    ...pageHandler,
                    pluginId,
                });
            },
        });
    }
    forPlugin(pluginId) {
        return this.appCtx.forPlugin(pluginId);
    }
    get commands() {
        return this.appCtx.commandMgr;
    }
    get sidebar() {
        return this.appCtx.sidebarMgr;
    }
    get omnibox() {
        return this.appCtx.omniboxMgr;
    }
    get plugins() {
        return this.appCtx.pluginMgr;
    }
    get analytics() {
        return this.appCtx.analytics;
    }
    get pages() {
        return this.pageMgrProxy;
    }
    get trace() {
        return this.appCtx.currentTrace?.forPlugin(this.pluginId);
    }
    scheduleFullRedraw(force) {
        raf_scheduler_1.raf.scheduleFullRedraw(force);
    }
    get httpRpc() {
        return this.appCtx.httpRpc;
    }
    get initialRouteArgs() {
        return this.appCtx.initialRouteArgs;
    }
    get featureFlags() {
        return {
            register: (settings) => feature_flags_1.featureFlags.register(settings),
        };
    }
    openTraceFromFile(file) {
        this.openTrace({ type: 'FILE', file });
    }
    openTraceFromUrl(url, serializedAppState) {
        this.openTrace({ type: 'URL', url, serializedAppState });
    }
    openTraceFromBuffer(postMessageArgs) {
        this.openTrace({ type: 'ARRAY_BUFFER', ...postMessageArgs });
    }
    openTraceFromHttpRpc() {
        this.openTrace({ type: 'HTTP_RPC' });
    }
    async openTrace(src) {
        this.appCtx.closeCurrentTrace();
        this.appCtx.isLoadingTrace = true;
        try {
            // loadTrace() in trace_loader.ts will do the following:
            // - Create a new engine.
            // - Pump the data from the TraceSource into the engine.
            // - Do the initial queries to build the TraceImpl object
            // - Call AppImpl.setActiveTrace(TraceImpl)
            // - Continue with the trace loading logic (track decider, plugins, etc)
            // - Resolve the promise when everything is done.
            await (0, load_trace_1.loadTrace)(this, src);
            this.omnibox.reset(/* focus= */ false);
            // loadTrace() internally will call setActiveTrace() and change our
            // _currentTrace in the middle of its ececution. We cannot wait for
            // loadTrace to be finished before setting it because some internal
            // implementation details of loadTrace() rely on that trace to be current
            // to work properly (mainly the router hash uuid).
        }
        catch (err) {
            this.omnibox.showStatusMessage(`${err}`);
            throw err;
        }
        finally {
            this.appCtx.isLoadingTrace = false;
            raf_scheduler_1.raf.scheduleFullRedraw();
        }
    }
    // Called by trace_loader.ts soon after it has created a new TraceImpl.
    setActiveTrace(traceImpl) {
        this.appCtx.setActiveTrace(traceImpl.__traceCtxForApp);
    }
    get embeddedMode() {
        return this.appCtx.embeddedMode;
    }
    get testingMode() {
        return this.appCtx.testingMode;
    }
    get isLoadingTrace() {
        return this.appCtx.isLoadingTrace;
    }
    get extraSqlPackages() {
        return this.appCtx.extraSqlPackages;
    }
    get perfDebugging() {
        return this.appCtx.perfMgr;
    }
    get serviceWorkerController() {
        return this.appCtx.serviceWorkerController;
    }
    // Nothing other than TraceImpl's constructor should ever refer to this.
    // This is necessary to avoid circular dependencies between trace_impl.ts
    // and app_impl.ts.
    get __appCtxForTrace() {
        return this.appCtx;
    }
    navigate(newHash) {
        router_1.Router.navigate(newHash);
    }
}
exports.AppImpl = AppImpl;
//# sourceMappingURL=app_impl.js.map