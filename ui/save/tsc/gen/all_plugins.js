"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const com_android_GpuWorkPeriod_1 = tslib_1.__importDefault(require("../plugins/com.android.GpuWorkPeriod"));
const com_android_InputEvents_1 = tslib_1.__importDefault(require("../plugins/com.android.InputEvents"));
const com_example_ExampleNestedTracks_1 = tslib_1.__importDefault(require("../plugins/com.example.ExampleNestedTracks"));
const com_example_ExampleSimpleCommand_1 = tslib_1.__importDefault(require("../plugins/com.example.ExampleSimpleCommand"));
const com_example_ExampleState_1 = tslib_1.__importDefault(require("../plugins/com.example.ExampleState"));
const com_example_Skeleton_1 = tslib_1.__importDefault(require("../plugins/com.example.Skeleton"));
const com_google_PixelCpmTrace_1 = tslib_1.__importDefault(require("../plugins/com.google.PixelCpmTrace"));
const com_google_PixelMemory_1 = tslib_1.__importDefault(require("../plugins/com.google.PixelMemory"));
const com_google_android_GoogleCamera_1 = tslib_1.__importDefault(require("../plugins/com.google.android.GoogleCamera"));
const dev_perfetto_AndroidBinderViz_1 = tslib_1.__importDefault(require("../plugins/dev.perfetto.AndroidBinderViz"));
const dev_perfetto_AndroidClientServer_1 = tslib_1.__importDefault(require("../plugins/dev.perfetto.AndroidClientServer"));
const dev_perfetto_AndroidCujs_1 = tslib_1.__importDefault(require("../plugins/dev.perfetto.AndroidCujs"));
const dev_perfetto_AndroidDesktopMode_1 = tslib_1.__importDefault(require("../plugins/dev.perfetto.AndroidDesktopMode"));
const dev_perfetto_AndroidDmabuf_1 = tslib_1.__importDefault(require("../plugins/dev.perfetto.AndroidDmabuf"));
const dev_perfetto_AndroidLog_1 = tslib_1.__importDefault(require("../plugins/dev.perfetto.AndroidLog"));
const dev_perfetto_AndroidLongBatteryTracing_1 = tslib_1.__importDefault(require("../plugins/dev.perfetto.AndroidLongBatteryTracing"));
const dev_perfetto_AndroidNetwork_1 = tslib_1.__importDefault(require("../plugins/dev.perfetto.AndroidNetwork"));
const dev_perfetto_AndroidPerf_1 = tslib_1.__importDefault(require("../plugins/dev.perfetto.AndroidPerf"));
const dev_perfetto_AndroidPerfTraceCounters_1 = tslib_1.__importDefault(require("../plugins/dev.perfetto.AndroidPerfTraceCounters"));
const dev_perfetto_AndroidStartup_1 = tslib_1.__importDefault(require("../plugins/dev.perfetto.AndroidStartup"));
const dev_perfetto_AsyncSlices_1 = tslib_1.__importDefault(require("../plugins/dev.perfetto.AsyncSlices"));
const dev_perfetto_BookmarkletApi_1 = tslib_1.__importDefault(require("../plugins/dev.perfetto.BookmarkletApi"));
const dev_perfetto_Chaos_1 = tslib_1.__importDefault(require("../plugins/dev.perfetto.Chaos"));
const dev_perfetto_Counter_1 = tslib_1.__importDefault(require("../plugins/dev.perfetto.Counter"));
const dev_perfetto_CpuFreq_1 = tslib_1.__importDefault(require("../plugins/dev.perfetto.CpuFreq"));
const dev_perfetto_CpuProfile_1 = tslib_1.__importDefault(require("../plugins/dev.perfetto.CpuProfile"));
const dev_perfetto_CpuSlices_1 = tslib_1.__importDefault(require("../plugins/dev.perfetto.CpuSlices"));
const dev_perfetto_CpuidleTimeInState_1 = tslib_1.__importDefault(require("../plugins/dev.perfetto.CpuidleTimeInState"));
const dev_perfetto_CriticalPath_1 = tslib_1.__importDefault(require("../plugins/dev.perfetto.CriticalPath"));
const dev_perfetto_Debug_1 = tslib_1.__importDefault(require("../plugins/dev.perfetto.Debug"));
const dev_perfetto_DeeplinkQuerystring_1 = tslib_1.__importDefault(require("../plugins/dev.perfetto.DeeplinkQuerystring"));
const dev_perfetto_ExplorePage_1 = tslib_1.__importDefault(require("../plugins/dev.perfetto.ExplorePage"));
const dev_perfetto_Frames_1 = tslib_1.__importDefault(require("../plugins/dev.perfetto.Frames"));
const dev_perfetto_Ftrace_1 = tslib_1.__importDefault(require("../plugins/dev.perfetto.Ftrace"));
const dev_perfetto_GpuByProcess_1 = tslib_1.__importDefault(require("../plugins/dev.perfetto.GpuByProcess"));
const dev_perfetto_HeapProfile_1 = tslib_1.__importDefault(require("../plugins/dev.perfetto.HeapProfile"));
const dev_perfetto_InsightsPage_1 = tslib_1.__importDefault(require("../plugins/dev.perfetto.InsightsPage"));
const dev_perfetto_Io_1 = tslib_1.__importDefault(require("../plugins/dev.perfetto.Io"));
const dev_perfetto_LargeScreensPerf_1 = tslib_1.__importDefault(require("../plugins/dev.perfetto.LargeScreensPerf"));
const dev_perfetto_MetricsPage_1 = tslib_1.__importDefault(require("../plugins/dev.perfetto.MetricsPage"));
const dev_perfetto_PerfSamplesProfile_1 = tslib_1.__importDefault(require("../plugins/dev.perfetto.PerfSamplesProfile"));
const dev_perfetto_PinAndroidPerfMetrics_1 = tslib_1.__importDefault(require("../plugins/dev.perfetto.PinAndroidPerfMetrics"));
const dev_perfetto_PinSysUITracks_1 = tslib_1.__importDefault(require("../plugins/dev.perfetto.PinSysUITracks"));
const dev_perfetto_ProcessSummary_1 = tslib_1.__importDefault(require("../plugins/dev.perfetto.ProcessSummary"));
const dev_perfetto_ProcessThreadGroups_1 = tslib_1.__importDefault(require("../plugins/dev.perfetto.ProcessThreadGroups"));
const dev_perfetto_QueryPage_1 = tslib_1.__importDefault(require("../plugins/dev.perfetto.QueryPage"));
const dev_perfetto_RecordTrace_1 = tslib_1.__importDefault(require("../plugins/dev.perfetto.RecordTrace"));
const dev_perfetto_RestorePinnedTracks_1 = tslib_1.__importDefault(require("../plugins/dev.perfetto.RestorePinnedTracks"));
const dev_perfetto_Sched_1 = tslib_1.__importDefault(require("../plugins/dev.perfetto.Sched"));
const dev_perfetto_Screenshots_1 = tslib_1.__importDefault(require("../plugins/dev.perfetto.Screenshots"));
const dev_perfetto_SqlModules_1 = tslib_1.__importDefault(require("../plugins/dev.perfetto.SqlModules"));
const dev_perfetto_Thread_1 = tslib_1.__importDefault(require("../plugins/dev.perfetto.Thread"));
const dev_perfetto_ThreadState_1 = tslib_1.__importDefault(require("../plugins/dev.perfetto.ThreadState"));
const dev_perfetto_TimelineSync_1 = tslib_1.__importDefault(require("../plugins/dev.perfetto.TimelineSync"));
const dev_perfetto_TraceInfoPage_1 = tslib_1.__importDefault(require("../plugins/dev.perfetto.TraceInfoPage"));
const dev_perfetto_TraceMetadata_1 = tslib_1.__importDefault(require("../plugins/dev.perfetto.TraceMetadata"));
const dev_perfetto_VizPage_1 = tslib_1.__importDefault(require("../plugins/dev.perfetto.VizPage"));
const dev_perfetto_WidgetsPage_1 = tslib_1.__importDefault(require("../plugins/dev.perfetto.WidgetsPage"));
const org_chromium_ChromeCriticalUserInteractions_1 = tslib_1.__importDefault(require("../plugins/org.chromium.ChromeCriticalUserInteractions"));
const org_chromium_ChromeScrollJank_1 = tslib_1.__importDefault(require("../plugins/org.chromium.ChromeScrollJank"));
const org_chromium_ChromeTasks_1 = tslib_1.__importDefault(require("../plugins/org.chromium.ChromeTasks"));
const org_chromium_OpenTableCommands_1 = tslib_1.__importDefault(require("../plugins/org.chromium.OpenTableCommands"));
const org_kernel_LinuxKernelSubsystems_1 = tslib_1.__importDefault(require("../plugins/org.kernel.LinuxKernelSubsystems"));
const org_kernel_SuspendResumeLatency_1 = tslib_1.__importDefault(require("../plugins/org.kernel.SuspendResumeLatency"));
const org_kernel_Wattson_1 = tslib_1.__importDefault(require("../plugins/org.kernel.Wattson"));
exports.default = [
    com_android_GpuWorkPeriod_1.default,
    com_android_InputEvents_1.default,
    com_example_ExampleNestedTracks_1.default,
    com_example_ExampleSimpleCommand_1.default,
    com_example_ExampleState_1.default,
    com_example_Skeleton_1.default,
    com_google_PixelCpmTrace_1.default,
    com_google_PixelMemory_1.default,
    com_google_android_GoogleCamera_1.default,
    dev_perfetto_AndroidBinderViz_1.default,
    dev_perfetto_AndroidClientServer_1.default,
    dev_perfetto_AndroidCujs_1.default,
    dev_perfetto_AndroidDesktopMode_1.default,
    dev_perfetto_AndroidDmabuf_1.default,
    dev_perfetto_AndroidLog_1.default,
    dev_perfetto_AndroidLongBatteryTracing_1.default,
    dev_perfetto_AndroidNetwork_1.default,
    dev_perfetto_AndroidPerf_1.default,
    dev_perfetto_AndroidPerfTraceCounters_1.default,
    dev_perfetto_AndroidStartup_1.default,
    dev_perfetto_AsyncSlices_1.default,
    dev_perfetto_BookmarkletApi_1.default,
    dev_perfetto_Chaos_1.default,
    dev_perfetto_Counter_1.default,
    dev_perfetto_CpuFreq_1.default,
    dev_perfetto_CpuProfile_1.default,
    dev_perfetto_CpuSlices_1.default,
    dev_perfetto_CpuidleTimeInState_1.default,
    dev_perfetto_CriticalPath_1.default,
    dev_perfetto_Debug_1.default,
    dev_perfetto_DeeplinkQuerystring_1.default,
    dev_perfetto_ExplorePage_1.default,
    dev_perfetto_Frames_1.default,
    dev_perfetto_Ftrace_1.default,
    dev_perfetto_GpuByProcess_1.default,
    dev_perfetto_HeapProfile_1.default,
    dev_perfetto_InsightsPage_1.default,
    dev_perfetto_Io_1.default,
    dev_perfetto_LargeScreensPerf_1.default,
    dev_perfetto_MetricsPage_1.default,
    dev_perfetto_PerfSamplesProfile_1.default,
    dev_perfetto_PinAndroidPerfMetrics_1.default,
    dev_perfetto_PinSysUITracks_1.default,
    dev_perfetto_ProcessSummary_1.default,
    dev_perfetto_ProcessThreadGroups_1.default,
    dev_perfetto_QueryPage_1.default,
    dev_perfetto_RecordTrace_1.default,
    dev_perfetto_RestorePinnedTracks_1.default,
    dev_perfetto_Sched_1.default,
    dev_perfetto_Screenshots_1.default,
    dev_perfetto_SqlModules_1.default,
    dev_perfetto_Thread_1.default,
    dev_perfetto_ThreadState_1.default,
    dev_perfetto_TimelineSync_1.default,
    dev_perfetto_TraceInfoPage_1.default,
    dev_perfetto_TraceMetadata_1.default,
    dev_perfetto_VizPage_1.default,
    dev_perfetto_WidgetsPage_1.default,
    org_chromium_ChromeCriticalUserInteractions_1.default,
    org_chromium_ChromeScrollJank_1.default,
    org_chromium_ChromeTasks_1.default,
    org_chromium_OpenTableCommands_1.default,
    org_kernel_LinuxKernelSubsystems_1.default,
    org_kernel_SuspendResumeLatency_1.default,
    org_kernel_Wattson_1.default,
];
//# sourceMappingURL=all_plugins.js.map