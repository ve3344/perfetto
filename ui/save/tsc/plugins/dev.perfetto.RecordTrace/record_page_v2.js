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
exports.RecordPageV2 = void 0;
exports.targetSelection = targetSelection;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const logging_1 = require("../../base/logging");
const recording_config_utils_1 = require("./recordingV2/recording_config_utils");
const recording_page_controller_1 = require("./recordingV2/recording_page_controller");
const recording_utils_1 = require("./recordingV2/recording_utils");
const target_factory_registry_1 = require("./recordingV2/target_factory_registry");
const record_config_1 = require("./record_config");
const record_page_1 = require("./record_page");
const record_widgets_1 = require("./record_widgets");
const advanced_settings_1 = require("./advanced_settings");
const android_settings_1 = require("./android_settings");
const chrome_settings_1 = require("./chrome_settings");
const cpu_settings_1 = require("./cpu_settings");
const etw_settings_1 = require("./etw_settings");
const gpu_settings_1 = require("./gpu_settings");
const linux_perf_settings_1 = require("./linux_perf_settings");
const memory_settings_1 = require("./memory_settings");
const power_settings_1 = require("./power_settings");
const recording_settings_1 = require("./recording_settings");
const recording_ui_utils_1 = require("./recording_ui_utils");
const reset_target_modal_1 = require("./reset_target_modal");
const raf_1 = require("../../widgets/raf");
const START_RECORDING_MESSAGE = 'Start Recording';
// TODO(primiano): this is needs to be rewritten, but then i'm going to rewrite
// the whole record_page_v2 so not worth cleaning up now.
let controller;
let recordConfigUtils;
function isChromeTargetInfo(targetInfo) {
    return ['CHROME', 'CHROME_OS', 'WINDOWS'].includes(targetInfo.targetType);
}
function RecordHeader(recMgr) {
    const platformSelection = RecordingPlatformSelection();
    const statusLabel = RecordingStatusLabel(recMgr);
    const buttons = RecordingButton(recMgr.state.recordConfig);
    const notes = RecordingNotes(recMgr.state.recordConfig);
    if (!platformSelection && !statusLabel && !buttons && !notes) {
        // The header should not be displayed when it has no content.
        return undefined;
    }
    return (0, mithril_1.default)('.record-header', (0, mithril_1.default)('.top-part', (0, mithril_1.default)('.target-and-status', platformSelection, statusLabel), buttons), notes);
}
function RecordingPlatformSelection() {
    // Don't show the platform selector while we are recording a trace.
    if (controller.getState() >= recording_page_controller_1.RecordingState.RECORDING)
        return undefined;
    return (0, mithril_1.default)('.target', (0, mithril_1.default)('.chip', { onclick: () => (0, reset_target_modal_1.showAddNewTargetModal)(controller) }, (0, mithril_1.default)('button', 'Add new recording target'), (0, mithril_1.default)('i.material-icons', 'add')), targetSelection());
}
function targetSelection() {
    if (!controller.shouldShowTargetSelection()) {
        return undefined;
    }
    const targets = target_factory_registry_1.targetFactoryRegistry.listTargets();
    const targetNames = [];
    const targetInfo = controller.getTargetInfo();
    if (!targetInfo) {
        targetNames.push((0, mithril_1.default)('option', 'PLEASE_SELECT_TARGET'));
    }
    let selectedIndex = 0;
    for (let i = 0; i < targets.length; i++) {
        const targetName = targets[i].getInfo().name;
        targetNames.push((0, mithril_1.default)('option', targetName));
        if (targetInfo && targetName === targetInfo.name) {
            selectedIndex = i;
        }
    }
    return (0, mithril_1.default)('label', 'Target platform:', (0, mithril_1.default)('select', {
        selectedIndex,
        onchange: (e) => {
            controller.onTargetSelection(e.target.value);
        },
        onupdate: (select) => {
            // Work around mithril bug
            // (https://github.com/MithrilJS/mithril.js/issues/2107): We may
            // update the select's options while also changing the
            // selectedIndex at the same time. The update of selectedIndex
            // may be applied before the new options are added to the select
            // element. Because the new selectedIndex may be outside of the
            // select's options at that time, we have to reselect the
            // correct index here after any new children were added.
            select.dom.selectedIndex = selectedIndex;
        },
    }, ...targetNames));
}
// This will display status messages which are informative, but do not require
// user action, such as: "Recording in progress for X seconds" in the recording
// page header.
function RecordingStatusLabel(recMgr) {
    const recordingStatus = recMgr.state.recordingStatus;
    if (!recordingStatus)
        return undefined;
    return (0, mithril_1.default)('label', recordingStatus);
}
function Instructions(recCfg, cssClass) {
    if (controller.getState() < recording_page_controller_1.RecordingState.TARGET_SELECTED) {
        return undefined;
    }
    // We will have a valid target at this step because we checked the state.
    const targetInfo = (0, logging_1.assertExists)(controller.getTargetInfo());
    return (0, mithril_1.default)(`.record-section.instructions${cssClass}`, (0, mithril_1.default)('header', 'Recording command'), (0, mithril_1.default)('button.permalinkconfig', {
        onclick: () => (0, record_page_1.uploadRecordingConfig)(recCfg),
    }, 'Share recording settings'), RecordingSnippet(recCfg, targetInfo), BufferUsageProgressBar(), (0, mithril_1.default)('.buttons', StopCancelButtons()));
}
function BufferUsageProgressBar() {
    // Show the Buffer Usage bar only after we start recording a trace.
    if (controller.getState() !== recording_page_controller_1.RecordingState.RECORDING) {
        return undefined;
    }
    controller.fetchBufferUsage();
    const bufferUsage = controller.getBufferUsagePercentage();
    // Buffer usage is not available yet on Android.
    if (bufferUsage === 0)
        return undefined;
    return (0, mithril_1.default)('label', 'Buffer usage: ', (0, mithril_1.default)('progress', { max: 100, value: bufferUsage * 100 }));
}
function RecordingNotes(recCfg) {
    if (controller.getState() !== recording_page_controller_1.RecordingState.TARGET_INFO_DISPLAYED) {
        return undefined;
    }
    // We will have a valid target at this step because we checked the state.
    const targetInfo = (0, logging_1.assertExists)(controller.getTargetInfo());
    const linuxUrl = 'https://perfetto.dev/docs/quickstart/linux-tracing';
    const cmdlineUrl = 'https://perfetto.dev/docs/quickstart/android-tracing#perfetto-cmdline';
    const notes = [];
    const msgFeatNotSupported = (0, mithril_1.default)('span', `Some probes are only supported in Perfetto versions running
      on Android Q+. Therefore, Perfetto will sideload the latest version onto
      the device.`);
    const msgPerfettoNotSupported = (0, mithril_1.default)('span', `Perfetto is not supported natively before Android P. Therefore, Perfetto
       will sideload the latest version onto the device.`);
    const msgLinux = (0, mithril_1.default)('.note', `Use this `, (0, mithril_1.default)('a', { href: linuxUrl, target: '_blank' }, `quickstart guide`), ` to get started with tracing on Linux.`);
    const msgLongTraces = (0, mithril_1.default)('.note', `Recording in long trace mode through the UI is not supported. Please copy
    the command and `, (0, mithril_1.default)('a', { href: cmdlineUrl, target: '_blank' }, `collect the trace using ADB.`));
    if (!recordConfigUtils.fetchLatestRecordCommand(recCfg, targetInfo)
        .hasDataSources) {
        notes.push((0, mithril_1.default)('.note', "It looks like you didn't add any probes. " +
            'Please add at least one to get a non-empty trace.'));
    }
    target_factory_registry_1.targetFactoryRegistry.listRecordingProblems().map((recordingProblem) => {
        if (recordingProblem.includes(recording_utils_1.EXTENSION_URL)) {
            // Special case for rendering the link to the Chrome extension.
            const parts = recordingProblem.split(recording_utils_1.EXTENSION_URL);
            notes.push((0, mithril_1.default)('.note', parts[0], (0, mithril_1.default)('a', { href: recording_utils_1.EXTENSION_URL, target: '_blank' }, recording_utils_1.EXTENSION_NAME), parts[1]));
        }
    });
    switch (targetInfo.targetType) {
        case 'LINUX':
            notes.push(msgLinux);
            break;
        case 'ANDROID': {
            const androidApiLevel = targetInfo.androidApiLevel;
            if (androidApiLevel === 28) {
                notes.push((0, mithril_1.default)('.note', msgFeatNotSupported));
                /* eslint-disable @typescript-eslint/strict-boolean-expressions */
            }
            else if (androidApiLevel && androidApiLevel <= 27) {
                /* eslint-enable */
                notes.push((0, mithril_1.default)('.note', msgPerfettoNotSupported));
            }
            break;
        }
        default:
    }
    if (recCfg.mode === 'LONG_TRACE') {
        notes.unshift(msgLongTraces);
    }
    return notes.length > 0 ? (0, mithril_1.default)('div', notes) : undefined;
}
function RecordingSnippet(recCfg, targetInfo) {
    // We don't need commands to start tracing on chrome
    if (isChromeTargetInfo(targetInfo)) {
        if (controller.getState() > recording_page_controller_1.RecordingState.AUTH_P2) {
            // If the UI has started tracing, don't display a message guiding the user
            // to start recording.
            return undefined;
        }
        return (0, mithril_1.default)('div', (0, mithril_1.default)('label', `To trace Chrome from the Perfetto UI you just have to press
         '${START_RECORDING_MESSAGE}'.`));
    }
    return (0, mithril_1.default)(record_widgets_1.CodeSnippet, { text: getRecordCommand(recCfg, targetInfo) });
}
function getRecordCommand(recCfg, targetInfo) {
    const recordCommand = recordConfigUtils.fetchLatestRecordCommand(recCfg, targetInfo);
    const pbBase64 = recordCommand?.configProtoBase64 ?? '';
    const pbtx = recordCommand?.configProtoText ?? '';
    let cmd = '';
    if (targetInfo.targetType === 'ANDROID' &&
        targetInfo.androidApiLevel === 28) {
        cmd += `echo '${pbBase64}' | \n`;
        cmd += 'base64 --decode | \n';
        cmd += 'adb shell "perfetto -c - -o /data/misc/perfetto-traces/trace"\n';
    }
    else {
        cmd +=
            targetInfo.targetType === 'ANDROID'
                ? 'adb shell perfetto \\\n'
                : 'perfetto \\\n';
        cmd += '  -c - --txt \\\n';
        cmd += '  -o /data/misc/perfetto-traces/trace \\\n';
        cmd += '<<EOF\n\n';
        cmd += pbtx;
        cmd += '\nEOF\n';
    }
    return cmd;
}
function RecordingButton(recCfg) {
    if (controller.getState() !== recording_page_controller_1.RecordingState.TARGET_INFO_DISPLAYED ||
        !controller.canCreateTracingSession()) {
        return undefined;
    }
    // We know we have a target because we checked the state.
    const targetInfo = (0, logging_1.assertExists)(controller.getTargetInfo());
    const hasDataSources = recordConfigUtils.fetchLatestRecordCommand(recCfg, targetInfo).hasDataSources;
    if (!hasDataSources) {
        return undefined;
    }
    return (0, mithril_1.default)('.button', (0, mithril_1.default)('button', {
        class: 'selected',
        onclick: () => controller.onStartRecordingPressed(),
    }, START_RECORDING_MESSAGE));
}
function StopCancelButtons() {
    // Show the Stop/Cancel buttons only while we are recording a trace.
    if (!controller.shouldShowStopCancelButtons()) {
        return undefined;
    }
    const stop = (0, mithril_1.default)(`button.selected`, { onclick: () => controller.onStop() }, 'Stop');
    const cancel = (0, mithril_1.default)(`button`, { onclick: () => controller.onCancel() }, 'Cancel');
    return [stop, cancel];
}
function recordMenu(routePage) {
    const chromeProbe = (0, mithril_1.default)('a[href="#!/record/chrome"]', (0, mithril_1.default)(`li${routePage === 'chrome' ? '.active' : ''}`, (0, mithril_1.default)('i.material-icons', 'laptop_chromebook'), (0, mithril_1.default)('.title', 'Chrome'), (0, mithril_1.default)('.sub', 'Chrome traces')));
    const cpuProbe = (0, mithril_1.default)('a[href="#!/record/cpu"]', (0, mithril_1.default)(`li${routePage === 'cpu' ? '.active' : ''}`, (0, mithril_1.default)('i.material-icons', 'subtitles'), (0, mithril_1.default)('.title', 'CPU'), (0, mithril_1.default)('.sub', 'CPU usage, scheduling, wakeups')));
    const gpuProbe = (0, mithril_1.default)('a[href="#!/record/gpu"]', (0, mithril_1.default)(`li${routePage === 'gpu' ? '.active' : ''}`, (0, mithril_1.default)('i.material-icons', 'aspect_ratio'), (0, mithril_1.default)('.title', 'GPU'), (0, mithril_1.default)('.sub', 'GPU frequency, memory')));
    const powerProbe = (0, mithril_1.default)('a[href="#!/record/power"]', (0, mithril_1.default)(`li${routePage === 'power' ? '.active' : ''}`, (0, mithril_1.default)('i.material-icons', 'battery_charging_full'), (0, mithril_1.default)('.title', 'Power'), (0, mithril_1.default)('.sub', 'Battery and other energy counters')));
    const memoryProbe = (0, mithril_1.default)('a[href="#!/record/memory"]', (0, mithril_1.default)(`li${routePage === 'memory' ? '.active' : ''}`, (0, mithril_1.default)('i.material-icons', 'memory'), (0, mithril_1.default)('.title', 'Memory'), (0, mithril_1.default)('.sub', 'Physical mem, VM, LMK')));
    const androidProbe = (0, mithril_1.default)('a[href="#!/record/android"]', (0, mithril_1.default)(`li${routePage === 'android' ? '.active' : ''}`, (0, mithril_1.default)('i.material-icons', 'android'), (0, mithril_1.default)('.title', 'Android apps & svcs'), (0, mithril_1.default)('.sub', 'atrace and logcat')));
    const advancedProbe = (0, mithril_1.default)('a[href="#!/record/advanced"]', (0, mithril_1.default)(`li${routePage === 'advanced' ? '.active' : ''}`, (0, mithril_1.default)('i.material-icons', 'settings'), (0, mithril_1.default)('.title', 'Advanced settings'), (0, mithril_1.default)('.sub', 'Complicated stuff for wizards')));
    const tracePerfProbe = (0, mithril_1.default)('a[href="#!/record/tracePerf"]', (0, mithril_1.default)(`li${routePage === 'tracePerf' ? '.active' : ''}`, (0, mithril_1.default)('i.material-icons', 'full_stacked_bar_chart'), (0, mithril_1.default)('.title', 'Stack Samples'), (0, mithril_1.default)('.sub', 'Lightweight stack polling')));
    const etwProbe = (0, mithril_1.default)('a[href="#!/record/etw"]', (0, mithril_1.default)(`li${routePage === 'etw' ? '.active' : ''}`, (0, mithril_1.default)('i.material-icons', 'subtitles'), (0, mithril_1.default)('.title', 'ETW Tracing Config'), (0, mithril_1.default)('.sub', 'Context switch, Thread state')));
    // We only display the probes when we have a valid target, so it's not
    // possible for the target to be undefined here.
    const targetType = (0, logging_1.assertExists)(controller.getTargetInfo()).targetType;
    const probes = [];
    if (targetType === 'LINUX') {
        probes.push(cpuProbe, powerProbe, memoryProbe, chromeProbe, advancedProbe);
    }
    else if (targetType === 'WINDOWS') {
        probes.push(chromeProbe, etwProbe);
    }
    else if (targetType === 'CHROME') {
        probes.push(chromeProbe);
    }
    else {
        probes.push(cpuProbe, gpuProbe, powerProbe, memoryProbe, androidProbe, chromeProbe, tracePerfProbe, advancedProbe);
    }
    return (0, mithril_1.default)('.record-menu', {
        class: controller.getState() > recording_page_controller_1.RecordingState.TARGET_INFO_DISPLAYED
            ? 'disabled'
            : '',
        onclick: () => (0, raf_1.scheduleFullRedraw)(),
    }, (0, mithril_1.default)('header', 'Trace config'), (0, mithril_1.default)('ul', (0, mithril_1.default)('a[href="#!/record/buffers"]', (0, mithril_1.default)(`li${routePage === 'buffers' ? '.active' : ''}`, (0, mithril_1.default)('i.material-icons', 'tune'), (0, mithril_1.default)('.title', 'Recording settings'), (0, mithril_1.default)('.sub', 'Buffer mode, size and duration'))), (0, mithril_1.default)('a[href="#!/record/instructions"]', (0, mithril_1.default)(`li${routePage === 'instructions' ? '.active' : ''}`, (0, mithril_1.default)('i.material-icons-filled.rec', 'fiber_manual_record'), (0, mithril_1.default)('.title', 'Recording command'), (0, mithril_1.default)('.sub', 'Manually record trace'))), (0, mithril_1.default)('a[href="#!/record/config"]', {
        onclick: () => {
            record_config_1.recordConfigStore.reloadFromLocalStorage();
        },
    }, (0, mithril_1.default)(`li${routePage === 'config' ? '.active' : ''}`, (0, mithril_1.default)('i.material-icons', 'save'), (0, mithril_1.default)('.title', 'Saved configs'), (0, mithril_1.default)('.sub', 'Manage local configs')))), (0, mithril_1.default)('header', 'Probes'), (0, mithril_1.default)('ul', probes));
}
function getRecordContainer(recMgr, subpage) {
    const recCfg = recMgr.state.recordConfig;
    const components = [RecordHeader(recMgr)];
    if (controller.getState() === recording_page_controller_1.RecordingState.NO_TARGET) {
        components.push((0, mithril_1.default)('.full-centered', 'Please connect a valid target.'));
        return (0, mithril_1.default)('.record-container', components);
    }
    else if (controller.getState() <= recording_page_controller_1.RecordingState.ASK_TO_FORCE_P1) {
        components.push((0, mithril_1.default)('.full-centered', 'Can not access the device without resetting the ' +
            `connection. Please refresh the page, then click ` +
            `'${recording_ui_utils_1.FORCE_RESET_MESSAGE}.'`));
        return (0, mithril_1.default)('.record-container', components);
    }
    else if (controller.getState() === recording_page_controller_1.RecordingState.AUTH_P1) {
        components.push((0, mithril_1.default)('.full-centered', 'Please allow USB debugging on the device.'));
        return (0, mithril_1.default)('.record-container', components);
    }
    else if (controller.getState() === recording_page_controller_1.RecordingState.WAITING_FOR_TRACE_DISPLAY) {
        components.push((0, mithril_1.default)('.full-centered', 'Waiting for the trace to be collected.'));
        return (0, mithril_1.default)('.record-container', components);
    }
    const pages = [];
    // we need to remove the `/` character from the route
    let routePage = subpage ? subpage.substr(1) : '';
    if (!record_page_1.RECORDING_SECTIONS.includes(routePage)) {
        routePage = 'buffers';
    }
    pages.push(recordMenu(routePage));
    pages.push((0, mithril_1.default)(recording_settings_1.RecordingSettings, {
        dataSources: [],
        cssClass: (0, record_page_1.maybeGetActiveCss)(routePage, 'buffers'),
        recState: recMgr.state,
    }));
    pages.push(Instructions(recCfg, (0, record_page_1.maybeGetActiveCss)(routePage, 'instructions')));
    pages.push((0, record_page_1.Configurations)(recMgr, (0, record_page_1.maybeGetActiveCss)(routePage, 'config')));
    const settingsSections = new Map([
        ['cpu', cpu_settings_1.CpuSettings],
        ['gpu', gpu_settings_1.GpuSettings],
        ['power', power_settings_1.PowerSettings],
        ['memory', memory_settings_1.MemorySettings],
        ['android', android_settings_1.AndroidSettings],
        ['chrome', chrome_settings_1.ChromeSettings],
        ['tracePerf', linux_perf_settings_1.LinuxPerfSettings],
        ['advanced', advanced_settings_1.AdvancedSettings],
        ['etw', etw_settings_1.EtwSettings],
    ]);
    for (const [section, component] of settingsSections.entries()) {
        pages.push((0, mithril_1.default)(component, {
            dataSources: controller.getTargetInfo()?.dataSources || [],
            cssClass: (0, record_page_1.maybeGetActiveCss)(routePage, section),
            recState: recMgr.state,
        }));
    }
    components.push((0, mithril_1.default)('.record-container-content', pages));
    return (0, mithril_1.default)('.record-container', components);
}
class RecordPageV2 {
    lastSubpage = undefined;
    constructor({ attrs }) {
        controller ??= attrs.recCtl;
        recordConfigUtils ??= new recording_config_utils_1.RecordingConfigUtils();
    }
    oninit({ attrs }) {
        this.lastSubpage = attrs.subpage;
        if (attrs.subpage !== undefined && attrs.subpage.startsWith('/share/')) {
            const hash = attrs.subpage.substring(7);
            (0, record_page_1.loadRecordConfig)(attrs.recMgr, hash);
            attrs.app.navigate('#!/record/instructions');
        }
    }
    view({ attrs }) {
        if (attrs.subpage !== this.lastSubpage) {
            this.lastSubpage = attrs.subpage;
            // TODO(primiano): this is a hack necesasry to retrigger the generation of
            // the record cmdline. Refactor this code once record v1 vs v2 is gone.
            attrs.recMgr.setRecordConfig(attrs.recMgr.state.recordConfig);
        }
        return (0, mithril_1.default)('.record-page', controller.getState() > recording_page_controller_1.RecordingState.TARGET_INFO_DISPLAYED
            ? (0, mithril_1.default)('.hider')
            : [], getRecordContainer(attrs.recMgr, attrs.subpage));
    }
}
exports.RecordPageV2 = RecordPageV2;
//# sourceMappingURL=record_page_v2.js.map