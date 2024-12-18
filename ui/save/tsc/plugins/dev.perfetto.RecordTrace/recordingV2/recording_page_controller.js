"use strict";
// Copyright (C) 2022 The Android Open Source Project
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
exports.RecordingPageController = exports.RecordingState = void 0;
const logging_1 = require("../../../base/logging");
const time_1 = require("../../../base/time");
const record_config_1 = require("../record_config");
const recording_ui_utils_1 = require("../recording_ui_utils");
const reset_interface_modal_1 = require("../reset_interface_modal");
const trace_1 = require("../../../public/trace");
const recording_config_utils_1 = require("./recording_config_utils");
const recording_error_handling_1 = require("./recording_error_handling");
const recording_utils_1 = require("./recording_utils");
const android_websocket_target_factory_1 = require("./target_factories/android_websocket_target_factory");
const android_webusb_target_factory_1 = require("./target_factories/android_webusb_target_factory");
const host_os_target_factory_1 = require("./target_factories/host_os_target_factory");
const target_factory_registry_1 = require("./target_factory_registry");
const raf_1 = require("../../../widgets/raf");
// The recording page can be in any of these states. It can transition between
// states:
// a) because of a user actions - pressing a UI button ('Start', 'Stop',
//    'Cancel', 'Force reset' of the target), selecting a different target in
//    the UI, authorizing authentication on an Android device,
//    pulling the cable which connects an Android device.
// b) automatically - if there is no need to reset the device or if the user
//    has previously authorised the device to be debugged via USB.
//
// Recording state machine: https://screenshot.googleplex.com/BaX5EGqQMajgV7G
var RecordingState;
(function (RecordingState) {
    RecordingState[RecordingState["NO_TARGET"] = 0] = "NO_TARGET";
    RecordingState[RecordingState["TARGET_SELECTED"] = 1] = "TARGET_SELECTED";
    // P1 stands for 'Part 1', where we first connect to the device in order to
    // obtain target information.
    RecordingState[RecordingState["ASK_TO_FORCE_P1"] = 2] = "ASK_TO_FORCE_P1";
    RecordingState[RecordingState["AUTH_P1"] = 3] = "AUTH_P1";
    RecordingState[RecordingState["TARGET_INFO_DISPLAYED"] = 4] = "TARGET_INFO_DISPLAYED";
    // P2 stands for 'Part 2', where we connect to device for the 2nd+ times, to
    // record a tracing session.
    RecordingState[RecordingState["ASK_TO_FORCE_P2"] = 5] = "ASK_TO_FORCE_P2";
    RecordingState[RecordingState["AUTH_P2"] = 6] = "AUTH_P2";
    RecordingState[RecordingState["RECORDING"] = 7] = "RECORDING";
    RecordingState[RecordingState["WAITING_FOR_TRACE_DISPLAY"] = 8] = "WAITING_FOR_TRACE_DISPLAY";
})(RecordingState || (exports.RecordingState = RecordingState = {}));
// Wraps a tracing session promise while the promise is being resolved (e.g.
// while we are awaiting for ADB auth).
class TracingSessionWrapper {
    tracingSession = undefined;
    isCancelled = false;
    // We only execute the logic in the callbacks if this TracingSessionWrapper
    // is the one referenced by the controller. Otherwise this can hold a
    // tracing session which the user has already cancelled, so it shouldn't
    // influence the UI.
    tracingSessionListener = {
        onTraceData: (trace) => this.controller.maybeOnTraceData(this, trace),
        onStatus: (message) => this.controller.maybeOnStatus(this, message),
        onDisconnect: (errorMessage) => this.controller.maybeOnDisconnect(this, errorMessage),
        onError: (errorMessage) => this.controller.maybeOnError(this, errorMessage),
    };
    target;
    controller;
    constructor(target, controller) {
        this.target = target;
        this.controller = controller;
    }
    async start(traceConfig) {
        let stateGeneratioNr = this.controller.getStateGeneration();
        const createSession = async () => {
            try {
                this.controller.maybeSetState(this, RecordingState.AUTH_P2, stateGeneratioNr);
                stateGeneratioNr += 1;
                const session = await this.target.createTracingSession(this.tracingSessionListener);
                // We check the `isCancelled` to see if the user has cancelled the
                // tracing session before it becomes available in TracingSessionWrapper.
                if (this.isCancelled) {
                    session.cancel();
                    return;
                }
                this.tracingSession = session;
                this.controller.maybeSetState(this, RecordingState.RECORDING, stateGeneratioNr);
                // When the session is resolved, the traceConfig has been instantiated.
                this.tracingSession.start((0, logging_1.assertExists)(traceConfig));
            }
            catch (e) {
                this.tracingSessionListener.onError(e.message);
            }
        };
        if (await this.target.canConnectWithoutContention()) {
            await createSession();
        }
        else {
            // If we need to reset the connection to be able to connect, we ask
            // the user if they want to reset the connection.
            this.controller.maybeSetState(this, RecordingState.ASK_TO_FORCE_P2, stateGeneratioNr);
            stateGeneratioNr += 1;
            (0, reset_interface_modal_1.couldNotClaimInterface)(createSession, () => this.controller.maybeClearRecordingState(this));
        }
    }
    async fetchTargetInfo() {
        let stateGeneratioNr = this.controller.getStateGeneration();
        const createSession = async () => {
            try {
                this.controller.maybeSetState(this, RecordingState.AUTH_P1, stateGeneratioNr);
                stateGeneratioNr += 1;
                await this.target.fetchTargetInfo(this.tracingSessionListener);
                this.controller.maybeSetState(this, RecordingState.TARGET_INFO_DISPLAYED, stateGeneratioNr);
            }
            catch (e) {
                this.tracingSessionListener.onError(e.message);
            }
        };
        if (await this.target.canConnectWithoutContention()) {
            await createSession();
        }
        else {
            // If we need to reset the connection to be able to connect, we ask
            // the user if they want to reset the connection.
            this.controller.maybeSetState(this, RecordingState.ASK_TO_FORCE_P1, stateGeneratioNr);
            stateGeneratioNr += 1;
            (0, reset_interface_modal_1.couldNotClaimInterface)(createSession, () => this.controller.maybeSetState(this, RecordingState.TARGET_SELECTED, stateGeneratioNr));
        }
    }
    cancel() {
        if (this.tracingSession) {
            this.tracingSession.cancel();
        }
        else {
            // In some cases, the tracingSession may not be available to the
            // TracingSessionWrapper when the user cancels it.
            // For instance:
            //  1. The user clicked 'Start'.
            //  2. They clicked 'Stop' without authorizing on the device.
            //  3. They clicked 'Start'.
            //  4. They authorized on the device.
            // In these cases, we want to cancel the tracing session as soon as it
            // becomes available. Therefore, we keep the `isCancelled` boolean and
            // check it when we receive the tracing session.
            this.isCancelled = true;
        }
        this.controller.maybeClearRecordingState(this);
    }
    stop() {
        const stateGeneratioNr = this.controller.getStateGeneration();
        if (this.tracingSession) {
            this.tracingSession.stop();
            this.controller.maybeSetState(this, RecordingState.WAITING_FOR_TRACE_DISPLAY, stateGeneratioNr);
        }
        else {
            // In some cases, the tracingSession may not be available to the
            // TracingSessionWrapper when the user stops it.
            // For instance:
            //  1. The user clicked 'Start'.
            //  2. They clicked 'Stop' without authorizing on the device.
            //  3. They clicked 'Start'.
            //  4. They authorized on the device.
            // In these cases, we want to cancel the tracing session as soon as it
            // becomes available. Therefore, we keep the `isCancelled` boolean and
            // check it when we receive the tracing session.
            this.isCancelled = true;
            this.controller.maybeClearRecordingState(this);
        }
    }
    getTraceBufferUsage() {
        if (!this.tracingSession) {
            throw new recording_error_handling_1.RecordingError(recording_utils_1.BUFFER_USAGE_NOT_ACCESSIBLE);
        }
        return this.tracingSession.getTraceBufferUsage();
    }
}
// Keeps track of the state the Ui is in. Has methods which are executed on
// user actions such as starting/stopping/cancelling a tracing session.
class RecordingPageController {
    app;
    recMgr;
    // State of the recording page. This is set by user actions and/or automatic
    // transitions. This is queried by the UI in order to
    state = RecordingState.NO_TARGET;
    // Currently selected target.
    target = undefined;
    // We wrap the tracing session in an object, because for some targets
    // (Ex: Android) it is only created after we have succesfully authenticated
    // with the target.
    tracingSessionWrapper = undefined;
    // How much of the buffer is used for the current tracing session.
    bufferUsagePercentage = 0;
    // A counter for state modifications. We use this to ensure that state
    // transitions don't override one another in async functions.
    stateGeneration = 0;
    constructor(app, recMgr) {
        this.app = app;
        this.recMgr = recMgr;
    }
    getBufferUsagePercentage() {
        return this.bufferUsagePercentage;
    }
    getState() {
        return this.state;
    }
    getStateGeneration() {
        return this.stateGeneration;
    }
    maybeSetState(tracingSessionWrapper, state, stateGeneration) {
        if (this.tracingSessionWrapper !== tracingSessionWrapper) {
            return;
        }
        if (stateGeneration !== this.stateGeneration) {
            throw new recording_error_handling_1.RecordingError('Recording page state transition out of order.');
        }
        this.setState(state);
        this.recMgr.setRecordingStatus(undefined);
        (0, raf_1.scheduleFullRedraw)();
    }
    maybeClearRecordingState(tracingSessionWrapper) {
        if (this.tracingSessionWrapper === tracingSessionWrapper) {
            this.clearRecordingState();
        }
    }
    maybeOnTraceData(tracingSessionWrapper, trace) {
        if (this.tracingSessionWrapper !== tracingSessionWrapper) {
            return;
        }
        this.app.openTraceFromBuffer({
            title: 'Recorded trace',
            buffer: trace.buffer,
            fileName: `trace_${(0, time_1.currentDateHourAndMinute)()}${trace_1.TRACE_SUFFIX}`,
        });
        this.clearRecordingState();
    }
    maybeOnStatus(tracingSessionWrapper, message) {
        if (this.tracingSessionWrapper !== tracingSessionWrapper) {
            return;
        }
        // For the 'Recording in progress for 7000ms we don't show a
        // modal.'
        if (message.startsWith(recording_utils_1.RECORDING_IN_PROGRESS)) {
            this.recMgr.setRecordingStatus(message);
        }
        else {
            // For messages such as 'Please allow USB debugging on your
            // device, which require a user action, we show a modal.
            (0, recording_error_handling_1.showRecordingModal)(message);
        }
    }
    maybeOnDisconnect(tracingSessionWrapper, errorMessage) {
        if (this.tracingSessionWrapper !== tracingSessionWrapper) {
            return;
        }
        if (errorMessage) {
            (0, recording_error_handling_1.showRecordingModal)(errorMessage);
        }
        this.clearRecordingState();
        this.onTargetChange();
    }
    maybeOnError(tracingSessionWrapper, errorMessage) {
        if (this.tracingSessionWrapper !== tracingSessionWrapper) {
            return;
        }
        (0, recording_error_handling_1.showRecordingModal)(errorMessage);
        this.clearRecordingState();
    }
    getTargetInfo() {
        if (!this.target) {
            return undefined;
        }
        return this.target.getInfo();
    }
    canCreateTracingSession() {
        if (!this.target) {
            return false;
        }
        return this.target.canCreateTracingSession();
    }
    selectTarget(selectedTarget) {
        (0, logging_1.assertTrue)(RecordingState.NO_TARGET <= this.state &&
            this.state < RecordingState.RECORDING);
        // If the selected target exists and is the same as the previous one, we
        // don't need to do anything.
        if (selectedTarget && selectedTarget === this.target) {
            return;
        }
        // We assign the new target and redraw the page.
        this.target = selectedTarget;
        if (!this.target) {
            this.setState(RecordingState.NO_TARGET);
            (0, raf_1.scheduleFullRedraw)();
            return;
        }
        this.setState(RecordingState.TARGET_SELECTED);
        (0, raf_1.scheduleFullRedraw)();
        this.tracingSessionWrapper = this.createTracingSessionWrapper(this.target);
        this.tracingSessionWrapper.fetchTargetInfo();
    }
    async addAndroidDevice() {
        try {
            const target = await target_factory_registry_1.targetFactoryRegistry
                .get(android_webusb_target_factory_1.ANDROID_WEBUSB_TARGET_FACTORY)
                .connectNewTarget();
            this.selectTarget(target);
        }
        catch (e) {
            if (e instanceof recording_error_handling_1.RecordingError) {
                (0, recording_error_handling_1.showRecordingModal)(e.message);
            }
            else {
                throw e;
            }
        }
    }
    onTargetSelection(targetName) {
        (0, logging_1.assertTrue)(RecordingState.NO_TARGET <= this.state &&
            this.state < RecordingState.RECORDING);
        const allTargets = target_factory_registry_1.targetFactoryRegistry.listTargets();
        this.selectTarget(allTargets.find((t) => t.getInfo().name === targetName));
    }
    onStartRecordingPressed() {
        (0, logging_1.assertTrue)(RecordingState.TARGET_INFO_DISPLAYED === this.state);
        location.href = '#!/record/instructions';
        record_config_1.autosaveConfigStore.save(this.recMgr.state.recordConfig);
        const target = this.getTarget();
        const targetInfo = target.getInfo();
        this.app.analytics.logEvent('Record Trace', `Record trace (${targetInfo.targetType})`);
        const traceConfig = (0, recording_config_utils_1.genTraceConfig)(this.recMgr.state.recordConfig, targetInfo);
        this.tracingSessionWrapper = this.createTracingSessionWrapper(target);
        this.tracingSessionWrapper.start(traceConfig);
    }
    onCancel() {
        (0, logging_1.assertTrue)(RecordingState.AUTH_P2 <= this.state &&
            this.state <= RecordingState.RECORDING);
        // The 'Cancel' button will only be shown after a `tracingSessionWrapper`
        // is created.
        this.getTracingSessionWrapper().cancel();
    }
    onStop() {
        (0, logging_1.assertTrue)(RecordingState.AUTH_P2 <= this.state &&
            this.state <= RecordingState.RECORDING);
        // The 'Stop' button will only be shown after a `tracingSessionWrapper`
        // is created.
        this.getTracingSessionWrapper().stop();
    }
    async fetchBufferUsage() {
        (0, logging_1.assertTrue)(this.state >= RecordingState.AUTH_P2);
        if (!this.tracingSessionWrapper)
            return;
        const session = this.tracingSessionWrapper;
        try {
            const usage = await session.getTraceBufferUsage();
            if (this.tracingSessionWrapper === session) {
                this.bufferUsagePercentage = usage;
            }
        }
        catch (e) {
            // We ignore RecordingErrors because they are not necessary for the trace
            // to be successfully collected.
            if (!(e instanceof recording_error_handling_1.RecordingError)) {
                throw e;
            }
        }
        // We redraw if:
        // 1. We received a correct buffer usage value.
        // 2. We receive a RecordingError.
        (0, raf_1.scheduleFullRedraw)();
    }
    initFactories() {
        (0, logging_1.assertTrue)(this.state <= RecordingState.TARGET_INFO_DISPLAYED);
        for (const targetFactory of target_factory_registry_1.targetFactoryRegistry.listTargetFactories()) {
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            if (targetFactory) {
                targetFactory.setOnTargetChange(this.onTargetChange.bind(this));
            }
        }
        if (target_factory_registry_1.targetFactoryRegistry.has(android_websocket_target_factory_1.ANDROID_WEBSOCKET_TARGET_FACTORY)) {
            const websocketTargetFactory = target_factory_registry_1.targetFactoryRegistry.get(android_websocket_target_factory_1.ANDROID_WEBSOCKET_TARGET_FACTORY);
            websocketTargetFactory.tryEstablishWebsocket(recording_ui_utils_1.DEFAULT_ADB_WEBSOCKET_URL);
        }
        if (target_factory_registry_1.targetFactoryRegistry.has(host_os_target_factory_1.HOST_OS_TARGET_FACTORY)) {
            const websocketTargetFactory = target_factory_registry_1.targetFactoryRegistry.get(host_os_target_factory_1.HOST_OS_TARGET_FACTORY);
            websocketTargetFactory.tryEstablishWebsocket(recording_ui_utils_1.DEFAULT_TRACED_WEBSOCKET_URL);
        }
    }
    shouldShowTargetSelection() {
        return (RecordingState.NO_TARGET <= this.state &&
            this.state < RecordingState.RECORDING);
    }
    shouldShowStopCancelButtons() {
        return (RecordingState.AUTH_P2 <= this.state &&
            this.state <= RecordingState.RECORDING);
    }
    onTargetChange() {
        const allTargets = target_factory_registry_1.targetFactoryRegistry.listTargets();
        // If the change happens for an existing target, the controller keeps the
        // currently selected target in focus.
        if (this.target && allTargets.includes(this.target)) {
            (0, raf_1.scheduleFullRedraw)();
            return;
        }
        // If the change happens to a new target or the controller does not have a
        // defined target, the selection process again is run again.
        this.selectTarget();
    }
    createTracingSessionWrapper(target) {
        return new TracingSessionWrapper(target, this);
    }
    clearRecordingState() {
        this.bufferUsagePercentage = 0;
        this.tracingSessionWrapper = undefined;
        this.setState(RecordingState.TARGET_INFO_DISPLAYED);
        this.recMgr.setRecordingStatus(undefined);
        // Redrawing because this method has changed the RecordingState, which will
        // affect the display of the record_page.
        (0, raf_1.scheduleFullRedraw)();
    }
    setState(state) {
        this.state = state;
        this.stateGeneration += 1;
    }
    getTarget() {
        (0, logging_1.assertTrue)(RecordingState.TARGET_INFO_DISPLAYED === this.state);
        return (0, logging_1.assertExists)(this.target);
    }
    getTracingSessionWrapper() {
        (0, logging_1.assertTrue)(RecordingState.ASK_TO_FORCE_P2 <= this.state &&
            this.state <= RecordingState.RECORDING);
        return (0, logging_1.assertExists)(this.tracingSessionWrapper);
    }
}
exports.RecordingPageController = RecordingPageController;
//# sourceMappingURL=recording_page_controller.js.map