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
exports.RecordPage = exports.ConfigTitleState = exports.RECORDING_SECTIONS = void 0;
exports.loadedConfigEqual = loadedConfigEqual;
exports.loadConfigButton = loadConfigButton;
exports.displayRecordConfigs = displayRecordConfigs;
exports.Configurations = Configurations;
exports.ErrorLabel = ErrorLabel;
exports.maybeGetActiveCss = maybeGetActiveCss;
exports.uploadRecordingConfig = uploadRecordingConfig;
exports.loadRecordConfig = loadRecordConfig;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const state_1 = require("./state");
const adb_1 = require("./adb");
const record_config_types_1 = require("./record_config_types");
const record_config_1 = require("./record_config");
const record_widgets_1 = require("./record_widgets");
const advanced_settings_1 = require("./advanced_settings");
const android_settings_1 = require("./android_settings");
const chrome_settings_1 = require("./chrome_settings");
const cpu_settings_1 = require("./cpu_settings");
const gpu_settings_1 = require("./gpu_settings");
const linux_perf_settings_1 = require("./linux_perf_settings");
const memory_settings_1 = require("./memory_settings");
const power_settings_1 = require("./power_settings");
const recording_settings_1 = require("./recording_settings");
const etw_settings_1 = require("./etw_settings");
const raf_1 = require("../../widgets/raf");
const gcs_uploader_1 = require("../../base/gcs_uploader");
const modal_1 = require("../../widgets/modal");
const copyable_link_1 = require("../../widgets/copyable_link");
exports.RECORDING_SECTIONS = [
    'buffers',
    'instructions',
    'config',
    'cpu',
    'etw',
    'gpu',
    'power',
    'memory',
    'android',
    'chrome',
    'tracePerf',
    'advanced',
];
function RecordHeader(recMgr) {
    return (0, mithril_1.default)('.record-header', (0, mithril_1.default)('.top-part', (0, mithril_1.default)('.target-and-status', RecordingPlatformSelection(recMgr), RecordingStatusLabel(recMgr), ErrorLabel(recMgr)), recordingButtons(recMgr)), RecordingNotes(recMgr));
}
function RecordingPlatformSelection(recMgr) {
    if (recMgr.state.recordingInProgress)
        return [];
    const availableAndroidDevices = recMgr.state.availableAdbDevices;
    const recordingTarget = recMgr.state.recordingTarget;
    const targets = [];
    for (const { os, name } of (0, state_1.getDefaultRecordingTargets)()) {
        targets.push((0, mithril_1.default)('option', { value: os }, name));
    }
    for (const d of availableAndroidDevices) {
        targets.push((0, mithril_1.default)('option', { value: d.serial }, d.name));
    }
    const selectedIndex = (0, state_1.isAdbTarget)(recordingTarget)
        ? targets.findIndex((node) => node.attrs.value === recordingTarget.serial)
        : targets.findIndex((node) => node.attrs.value === recordingTarget.os);
    return (0, mithril_1.default)('.target', (0, mithril_1.default)('label', 'Target platform:', (0, mithril_1.default)('select', {
        selectedIndex,
        onchange: (e) => {
            onTargetChange(recMgr, e.target.value);
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
    }, ...targets)), (0, mithril_1.default)('.chip', { onclick: () => addAndroidDevice(recMgr) }, (0, mithril_1.default)('button', 'Add ADB Device'), (0, mithril_1.default)('i.material-icons', 'add')));
}
// |target| can be the TargetOs or the android serial.
function onTargetChange(recMgr, target) {
    const recordingTarget = recMgr.state.availableAdbDevices.find((d) => d.serial === target) ||
        (0, state_1.getDefaultRecordingTargets)().find((t) => t.os === target) ||
        (0, state_1.getDefaultRecordingTargets)()[0];
    if ((0, state_1.isChromeTarget)(recordingTarget)) {
        recMgr.setFetchChromeCategories(true);
    }
    recMgr.setRecordingTarget(recordingTarget);
    record_config_1.recordTargetStore.save(target);
    (0, raf_1.scheduleFullRedraw)();
}
function Instructions(recMgr, cssClass) {
    return (0, mithril_1.default)(`.record-section.instructions${cssClass}`, (0, mithril_1.default)('header', 'Recording command'), (0, mithril_1.default)('button.permalinkconfig', {
        onclick: () => uploadRecordingConfig(recMgr.state.recordConfig),
    }, 'Share recording settings'), RecordingSnippet(recMgr), BufferUsageProgressBar(recMgr), (0, mithril_1.default)('.buttons', StopCancelButtons(recMgr)), recordingLog(recMgr));
}
function loadedConfigEqual(cfg1, cfg2) {
    return cfg1.type === 'NAMED' && cfg2.type === 'NAMED'
        ? cfg1.name === cfg2.name
        : cfg1.type === cfg2.type;
}
function loadConfigButton(recMgr, config, configType) {
    return (0, mithril_1.default)('button', {
        class: 'config-button',
        title: 'Apply configuration settings',
        disabled: loadedConfigEqual(configType, recMgr.state.lastLoadedConfig),
        onclick: () => {
            recMgr.setRecordConfig(config, configType);
            (0, raf_1.scheduleFullRedraw)();
        },
    }, (0, mithril_1.default)('i.material-icons', 'file_upload'));
}
function displayRecordConfigs(recMgr) {
    const configs = [];
    if (record_config_1.autosaveConfigStore.hasSavedConfig) {
        configs.push((0, mithril_1.default)('.config', [
            (0, mithril_1.default)('span.title-config', (0, mithril_1.default)('strong', 'Latest started recording')),
            loadConfigButton(recMgr, record_config_1.autosaveConfigStore.get(), {
                type: 'AUTOMATIC',
            }),
        ]));
    }
    for (const item of record_config_1.recordConfigStore.recordConfigs) {
        configs.push((0, mithril_1.default)('.config', [
            (0, mithril_1.default)('span.title-config', item.title),
            loadConfigButton(recMgr, item.config, {
                type: 'NAMED',
                name: item.title,
            }),
            (0, mithril_1.default)('button', {
                class: 'config-button',
                title: 'Overwrite configuration with current settings',
                onclick: () => {
                    if (confirm(`Overwrite config "${item.title}" with current settings?`)) {
                        record_config_1.recordConfigStore.overwrite(recMgr.state.recordConfig, item.key);
                        recMgr.setRecordConfig(item.config, {
                            type: 'NAMED',
                            name: item.title,
                        });
                        (0, raf_1.scheduleFullRedraw)();
                    }
                },
            }, (0, mithril_1.default)('i.material-icons', 'save')),
            (0, mithril_1.default)('button', {
                class: 'config-button',
                title: 'Remove configuration',
                onclick: () => {
                    record_config_1.recordConfigStore.delete(item.key);
                    (0, raf_1.scheduleFullRedraw)();
                },
            }, (0, mithril_1.default)('i.material-icons', 'delete')),
        ]));
    }
    return configs;
}
exports.ConfigTitleState = {
    title: '',
    getTitle: () => {
        return exports.ConfigTitleState.title;
    },
    setTitle: (value) => {
        exports.ConfigTitleState.title = value;
    },
    clearTitle: () => {
        exports.ConfigTitleState.title = '';
    },
};
function Configurations(recMgr, cssClass) {
    const canSave = record_config_1.recordConfigStore.canSave(exports.ConfigTitleState.getTitle());
    return (0, mithril_1.default)(`.record-section${cssClass}`, (0, mithril_1.default)('header', 'Save and load configurations'), (0, mithril_1.default)('.input-config', [
        (0, mithril_1.default)('input', {
            value: exports.ConfigTitleState.title,
            placeholder: 'Title for config',
            oninput() {
                exports.ConfigTitleState.setTitle(this.value);
                (0, raf_1.scheduleFullRedraw)();
            },
        }),
        (0, mithril_1.default)('button', {
            class: 'config-button',
            disabled: !canSave,
            title: canSave
                ? 'Save current config'
                : 'Duplicate name, saving disabled',
            onclick: () => {
                record_config_1.recordConfigStore.save(recMgr.state.recordConfig, exports.ConfigTitleState.getTitle());
                (0, raf_1.scheduleFullRedraw)();
                exports.ConfigTitleState.clearTitle();
            },
        }, (0, mithril_1.default)('i.material-icons', 'save')),
        (0, mithril_1.default)('button', {
            class: 'config-button',
            title: 'Clear current configuration',
            onclick: () => {
                if (confirm('Current configuration will be cleared. ' + 'Are you sure?')) {
                    recMgr.clearRecordConfig();
                    (0, raf_1.scheduleFullRedraw)();
                }
            },
        }, (0, mithril_1.default)('i.material-icons', 'delete_forever')),
    ]), displayRecordConfigs(recMgr));
}
function BufferUsageProgressBar(recMgr) {
    if (!recMgr.state.recordingInProgress)
        return [];
    const bufferUsage = recMgr.state.bufferUsage;
    // Buffer usage is not available yet on Android.
    if (bufferUsage === 0)
        return [];
    return (0, mithril_1.default)('label', 'Buffer usage: ', (0, mithril_1.default)('progress', { max: 100, value: bufferUsage * 100 }));
}
function RecordingNotes(recMgr) {
    const sideloadUrl = 'https://perfetto.dev/docs/contributing/build-instructions#get-the-code';
    const linuxUrl = 'https://perfetto.dev/docs/quickstart/linux-tracing';
    const cmdlineUrl = 'https://perfetto.dev/docs/quickstart/android-tracing#perfetto-cmdline';
    const extensionURL = `https://chrome.google.com/webstore/detail/perfetto-ui/lfmkphfpdbjijhpomgecfikhfohaoine`;
    const notes = [];
    const msgFeatNotSupported = (0, mithril_1.default)('span', `Some probes are only supported in Perfetto versions running
      on Android Q+. `);
    const msgPerfettoNotSupported = (0, mithril_1.default)('span', `Perfetto is not supported natively before Android P. `);
    const msgSideload = (0, mithril_1.default)('span', `If you have a rooted device you can `, (0, mithril_1.default)('a', { href: sideloadUrl, target: '_blank' }, `sideload the latest version of
         Perfetto.`));
    const msgRecordingNotSupported = (0, mithril_1.default)('.note', `Recording Perfetto traces from the UI is not supported natively
     before Android Q. If you are using a P device, please select 'Android P'
     as the 'Target Platform' and `, (0, mithril_1.default)('a', { href: cmdlineUrl, target: '_blank' }, `collect the trace using ADB.`));
    const msgChrome = (0, mithril_1.default)('.note', `To trace Chrome from the Perfetto UI, you need to install our `, (0, mithril_1.default)('a', { href: extensionURL, target: '_blank' }, 'Chrome extension'), ' and then reload this page. ');
    const msgWinEtw = (0, mithril_1.default)('.note', `To trace with Etw on Windows from the Perfetto UI, you to run chrome with`, ` administrator permission and you need to install our `, (0, mithril_1.default)('a', { href: extensionURL, target: '_blank' }, 'Chrome extension'), ' and then reload this page.');
    const msgLinux = (0, mithril_1.default)('.note', `Use this `, (0, mithril_1.default)('a', { href: linuxUrl, target: '_blank' }, `quickstart guide`), ` to get started with tracing on Linux.`);
    const msgLongTraces = (0, mithril_1.default)('.note', `Recording in long trace mode through the UI is not supported. Please copy
    the command and `, (0, mithril_1.default)('a', { href: cmdlineUrl, target: '_blank' }, `collect the trace using ADB.`));
    const msgZeroProbes = (0, mithril_1.default)('.note', "It looks like you didn't add any probes. " +
        'Please add at least one to get a non-empty trace.');
    if (!(0, state_1.hasActiveProbes)(recMgr.state.recordConfig)) {
        notes.push(msgZeroProbes);
    }
    if ((0, state_1.isAdbTarget)(recMgr.state.recordingTarget)) {
        notes.push(msgRecordingNotSupported);
    }
    switch (recMgr.state.recordingTarget.os) {
        case 'Q':
            break;
        case 'P':
            notes.push((0, mithril_1.default)('.note', msgFeatNotSupported, msgSideload));
            break;
        case 'O':
            notes.push((0, mithril_1.default)('.note', msgPerfettoNotSupported, msgSideload));
            break;
        case 'L':
            notes.push(msgLinux);
            break;
        case 'C':
            if (!recMgr.state.extensionInstalled)
                notes.push(msgChrome);
            break;
        case 'CrOS':
            if (!recMgr.state.extensionInstalled)
                notes.push(msgChrome);
            break;
        case 'Win':
            if (!recMgr.state.extensionInstalled)
                notes.push(msgWinEtw);
            break;
        default:
    }
    if (recMgr.state.recordConfig.mode === 'LONG_TRACE') {
        notes.unshift(msgLongTraces);
    }
    return notes.length > 0 ? (0, mithril_1.default)('div', notes) : [];
}
function RecordingSnippet(recMgr) {
    const target = recMgr.state.recordingTarget;
    // We don't need commands to start tracing on chrome
    if ((0, state_1.isChromeTarget)(target)) {
        return recMgr.state.extensionInstalled && !recMgr.state.recordingInProgress
            ? (0, mithril_1.default)('div', (0, mithril_1.default)('label', `To trace Chrome from the Perfetto UI you just have to press
         'Start Recording'.`))
            : [];
    }
    return (0, mithril_1.default)(record_widgets_1.CodeSnippet, { text: getRecordCommand(recMgr, target) });
}
function getRecordCommand(recMgr, target) {
    const data = recMgr.state.recordCmd;
    const cfg = recMgr.state.recordConfig;
    let time = cfg.durationMs / 1000;
    if (time > state_1.MAX_TIME) {
        time = state_1.MAX_TIME;
    }
    const pbBase64 = data ? data.pbBase64 : '';
    const pbtx = data ? data.pbtxt : '';
    let cmd = '';
    if ((0, state_1.isAndroidP)(target)) {
        cmd += `echo '${pbBase64}' | \n`;
        cmd += 'base64 --decode | \n';
        cmd += 'adb shell "perfetto -c - -o /data/misc/perfetto-traces/trace"\n';
    }
    else {
        cmd += (0, state_1.isAndroidTarget)(target)
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
function recordingButtons(recMgr) {
    const state = recMgr.state;
    const target = state.recordingTarget;
    const recInProgress = state.recordingInProgress;
    const start = (0, mithril_1.default)(`button`, {
        class: recInProgress ? '' : 'selected',
        onclick: () => onStartRecordingPressed(recMgr),
    }, 'Start Recording');
    const buttons = [];
    if ((0, state_1.isAndroidTarget)(target)) {
        if (!recInProgress &&
            (0, state_1.isAdbTarget)(target) &&
            recMgr.state.recordConfig.mode !== 'LONG_TRACE') {
            buttons.push(start);
        }
    }
    else if (((0, state_1.isWindowsTarget)(target) || (0, state_1.isChromeTarget)(target)) &&
        state.extensionInstalled) {
        buttons.push(start);
    }
    return (0, mithril_1.default)('.button', buttons);
}
function StopCancelButtons(recMgr) {
    if (!recMgr.state.recordingInProgress)
        return [];
    const stop = (0, mithril_1.default)(`button.selected`, { onclick: () => recMgr.stopRecording() }, 'Stop');
    const cancel = (0, mithril_1.default)(`button`, { onclick: () => recMgr.cancelRecording() }, 'Cancel');
    return [stop, cancel];
}
function onStartRecordingPressed(recMgr) {
    location.href = '#!/record/instructions';
    (0, raf_1.scheduleFullRedraw)();
    record_config_1.autosaveConfigStore.save(recMgr.state.recordConfig);
    const target = recMgr.state.recordingTarget;
    if ((0, state_1.isAndroidTarget)(target) ||
        (0, state_1.isChromeTarget)(target) ||
        (0, state_1.isWindowsTarget)(target)) {
        recMgr.app.analytics.logEvent('Record Trace', `Record trace (${target.os})`);
        recMgr.startRecording();
    }
}
function RecordingStatusLabel(recMgr) {
    const recordingStatus = recMgr.state.recordingStatus;
    if (!recordingStatus)
        return [];
    return (0, mithril_1.default)('label', recordingStatus);
}
function ErrorLabel(recMgr) {
    const lastRecordingError = recMgr.state.lastRecordingError;
    if (!lastRecordingError)
        return [];
    return (0, mithril_1.default)('label.error-label', `Error:  ${lastRecordingError}`);
}
function recordingLog(recMgr) {
    const logs = recMgr.state.recordingLog;
    if (logs === undefined)
        return [];
    return (0, mithril_1.default)('.code-snippet.no-top-bar', (0, mithril_1.default)('code', logs));
}
// The connection must be done in the frontend. After it, the serial ID will
// be inserted in the state, and the worker will be able to connect to the
// correct device.
async function addAndroidDevice(recMgr) {
    let device;
    try {
        device = await new adb_1.AdbOverWebUsb().findDevice();
    }
    catch (e) {
        const err = `No device found: ${e.name}: ${e.message}`;
        console.error(err, e);
        alert(err);
        return;
    }
    if (!device.serialNumber) {
        console.error('serial number undefined');
        return;
    }
    // After the user has selected a device with the chrome UI, it will be
    // available when listing all the available device from WebUSB. Therefore,
    // we update the list of available devices.
    await recMgr.updateAvailableAdbDevices(device.serialNumber);
}
function recordMenu(recMgr, routePage) {
    const target = recMgr.state.recordingTarget;
    const chromeProbe = (0, mithril_1.default)('a[href="#!/record/chrome"]', (0, mithril_1.default)(`li${routePage === 'chrome' ? '.active' : ''}`, (0, mithril_1.default)('i.material-icons', 'laptop_chromebook'), (0, mithril_1.default)('.title', 'Chrome'), (0, mithril_1.default)('.sub', 'Chrome traces')));
    const cpuProbe = (0, mithril_1.default)('a[href="#!/record/cpu"]', (0, mithril_1.default)(`li${routePage === 'cpu' ? '.active' : ''}`, (0, mithril_1.default)('i.material-icons', 'subtitles'), (0, mithril_1.default)('.title', 'CPU'), (0, mithril_1.default)('.sub', 'CPU usage, scheduling, wakeups')));
    const gpuProbe = (0, mithril_1.default)('a[href="#!/record/gpu"]', (0, mithril_1.default)(`li${routePage === 'gpu' ? '.active' : ''}`, (0, mithril_1.default)('i.material-icons', 'aspect_ratio'), (0, mithril_1.default)('.title', 'GPU'), (0, mithril_1.default)('.sub', 'GPU frequency, memory')));
    const powerProbe = (0, mithril_1.default)('a[href="#!/record/power"]', (0, mithril_1.default)(`li${routePage === 'power' ? '.active' : ''}`, (0, mithril_1.default)('i.material-icons', 'battery_charging_full'), (0, mithril_1.default)('.title', 'Power'), (0, mithril_1.default)('.sub', 'Battery and other energy counters')));
    const memoryProbe = (0, mithril_1.default)('a[href="#!/record/memory"]', (0, mithril_1.default)(`li${routePage === 'memory' ? '.active' : ''}`, (0, mithril_1.default)('i.material-icons', 'memory'), (0, mithril_1.default)('.title', 'Memory'), (0, mithril_1.default)('.sub', 'Physical mem, VM, LMK')));
    const androidProbe = (0, mithril_1.default)('a[href="#!/record/android"]', (0, mithril_1.default)(`li${routePage === 'android' ? '.active' : ''}`, (0, mithril_1.default)('i.material-icons', 'android'), (0, mithril_1.default)('.title', 'Android apps & svcs'), (0, mithril_1.default)('.sub', 'atrace and logcat')));
    const advancedProbe = (0, mithril_1.default)('a[href="#!/record/advanced"]', (0, mithril_1.default)(`li${routePage === 'advanced' ? '.active' : ''}`, (0, mithril_1.default)('i.material-icons', 'settings'), (0, mithril_1.default)('.title', 'Advanced settings'), (0, mithril_1.default)('.sub', 'Complicated stuff for wizards')));
    const tracePerfProbe = (0, mithril_1.default)('a[href="#!/record/tracePerf"]', (0, mithril_1.default)(`li${routePage === 'tracePerf' ? '.active' : ''}`, (0, mithril_1.default)('i.material-icons', 'full_stacked_bar_chart'), (0, mithril_1.default)('.title', 'Stack Samples'), (0, mithril_1.default)('.sub', 'Lightweight stack polling')));
    const etwProbe = (0, mithril_1.default)('a[href="#!/record/etw"]', (0, mithril_1.default)(`li${routePage === 'etw' ? '.active' : ''}`, (0, mithril_1.default)('i.material-icons', 'subtitles'), (0, mithril_1.default)('.title', 'ETW Tracing Config'), (0, mithril_1.default)('.sub', 'Context switch, Thread state')));
    const recInProgress = recMgr.state.recordingInProgress;
    const probes = [];
    if ((0, state_1.isLinuxTarget)(target)) {
        probes.push(cpuProbe, powerProbe, memoryProbe, chromeProbe, advancedProbe);
    }
    else if ((0, state_1.isChromeTarget)(target) && !(0, state_1.isCrOSTarget)(target)) {
        probes.push(chromeProbe);
    }
    else if ((0, state_1.isWindowsTarget)(target)) {
        probes.push(chromeProbe, etwProbe);
    }
    else {
        probes.push(cpuProbe, gpuProbe, powerProbe, memoryProbe, androidProbe, chromeProbe, tracePerfProbe, advancedProbe);
    }
    return (0, mithril_1.default)('.record-menu', {
        class: recInProgress ? 'disabled' : '',
        onclick: () => (0, raf_1.scheduleFullRedraw)(),
    }, (0, mithril_1.default)('header', 'Trace config'), (0, mithril_1.default)('ul', (0, mithril_1.default)('a[href="#!/record/buffers"]', (0, mithril_1.default)(`li${routePage === 'buffers' ? '.active' : ''}`, (0, mithril_1.default)('i.material-icons', 'tune'), (0, mithril_1.default)('.title', 'Recording settings'), (0, mithril_1.default)('.sub', 'Buffer mode, size and duration'))), (0, mithril_1.default)('a[href="#!/record/instructions"]', (0, mithril_1.default)(`li${routePage === 'instructions' ? '.active' : ''}`, (0, mithril_1.default)('i.material-icons-filled.rec', 'fiber_manual_record'), (0, mithril_1.default)('.title', 'Recording command'), (0, mithril_1.default)('.sub', 'Manually record trace'))), (0, mithril_1.default)('a[href="#!/record/config"]', {
        onclick: () => {
            record_config_1.recordConfigStore.reloadFromLocalStorage();
        },
    }, (0, mithril_1.default)(`li${routePage === 'config' ? '.active' : ''}`, (0, mithril_1.default)('i.material-icons', 'save'), (0, mithril_1.default)('.title', 'Saved configs'), (0, mithril_1.default)('.sub', 'Manage local configs')))), (0, mithril_1.default)('header', 'Probes'), (0, mithril_1.default)('ul', probes));
}
function maybeGetActiveCss(routePage, section) {
    return routePage === section ? '.active' : '';
}
class RecordPage {
    recMgr;
    lastSubpage = undefined;
    constructor({ attrs }) {
        this.recMgr = attrs.recMgr;
    }
    oninit({ attrs }) {
        this.lastSubpage = attrs.subpage;
        if (attrs.subpage !== undefined && attrs.subpage.startsWith('/share/')) {
            const hash = attrs.subpage.substring(7);
            loadRecordConfig(this.recMgr, hash);
            attrs.app.navigate('#!/record/instructions');
        }
    }
    view({ attrs }) {
        if (attrs.subpage !== this.lastSubpage) {
            this.lastSubpage = attrs.subpage;
            // TODO(primiano): this is a hack necesasry to retrigger the generation of
            // the record cmdline. Refactor this code once record v1 vs v2 is gone.
            this.recMgr.setRecordConfig(this.recMgr.state.recordConfig);
        }
        const pages = [];
        // we need to remove the `/` character from the route
        let routePage = attrs.subpage ? attrs.subpage.substr(1) : '';
        if (!exports.RECORDING_SECTIONS.includes(routePage)) {
            routePage = 'buffers';
        }
        pages.push(recordMenu(this.recMgr, routePage));
        pages.push((0, mithril_1.default)(recording_settings_1.RecordingSettings, {
            dataSources: [],
            cssClass: maybeGetActiveCss(routePage, 'buffers'),
            recState: this.recMgr.state,
        }));
        pages.push(Instructions(this.recMgr, maybeGetActiveCss(routePage, 'instructions')));
        pages.push(Configurations(this.recMgr, maybeGetActiveCss(routePage, 'config')));
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
                dataSources: [],
                cssClass: maybeGetActiveCss(routePage, section),
                recState: this.recMgr.state,
            }));
        }
        if ((0, state_1.isChromeTarget)(this.recMgr.state.recordingTarget)) {
            this.recMgr.setFetchChromeCategories(true);
        }
        return (0, mithril_1.default)('.record-page', this.recMgr.state.recordingInProgress ? (0, mithril_1.default)('.hider') : [], (0, mithril_1.default)('.record-container', RecordHeader(this.recMgr), (0, mithril_1.default)('.record-container-content', recordMenu(this.recMgr, routePage), pages)));
    }
}
exports.RecordPage = RecordPage;
async function uploadRecordingConfig(recordConfig) {
    const json = JSON.stringify(recordConfig);
    const uploader = new gcs_uploader_1.GcsUploader(json, {
        mimeType: gcs_uploader_1.MIME_JSON,
    });
    await uploader.waitForCompletion();
    const hash = uploader.uploadedFileName;
    const url = `${self.location.origin}/#!/record/share/${hash}`;
    (0, modal_1.showModal)({
        title: 'Shareable record settings',
        content: (0, mithril_1.default)(copyable_link_1.CopyableLink, { url }),
    });
}
async function loadRecordConfig(recMgr, hash) {
    const url = `https://storage.googleapis.com/${gcs_uploader_1.BUCKET_NAME}/${hash}`;
    const response = await fetch(url);
    if (!response.ok) {
        (0, modal_1.showModal)({ title: 'Load failed', content: `Could not fetch ${url}` });
        return;
    }
    const text = await response.text();
    const json = JSON.parse(text);
    const res = record_config_types_1.RECORD_CONFIG_SCHEMA.safeParse(json);
    if (!res.success) {
        throw new Error('Failed to deserialize record settings ' + res.error.toString());
    }
    recMgr.setRecordConfig(res.data);
}
//# sourceMappingURL=record_page.js.map