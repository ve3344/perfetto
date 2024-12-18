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
exports.SysStatsConfig = exports.StatusResult = exports.StatsdTracingConfig = exports.StatsdPullAtomConfig = exports.StatCounters = exports.ResetTraceProcessorArgs = exports.RegisterSqlPackageResult = exports.RegisterSqlPackageArgs = exports.ReadBuffersResponse = exports.ReadBuffersRequest = exports.QueryServiceStateResponse = exports.QueryServiceStateRequest = exports.QueryResult = exports.QueryArgs = exports.ProcessStatsConfig = exports.PerfEvents = exports.PerfEventConfig = exports.PerfettoMetatrace = exports.NetworkPacketTraceConfig = exports.NativeContinuousDumpConfig = exports.MetatraceCategories = exports.MeminfoCounters = exports.JavaHprofConfig = exports.JavaContinuousDumpConfig = exports.IPCFrame = exports.HeapprofdConfig = exports.GetTraceStatsResponse = exports.GetTraceStatsRequest = exports.FtraceConfig = exports.FreeBuffersResponse = exports.FreeBuffersRequest = exports.EtwConfig = exports.EnableTracingResponse = exports.EnableTracingRequest = exports.EnableMetatraceArgs = exports.DisableTracingResponse = exports.DisableTracingRequest = exports.DisableAndReadMetatraceResult = exports.DataSourceDescriptor = exports.DataSourceConfig = exports.ConsumerPort = exports.ComputeMetricResult = exports.ComputeMetricArgs = exports.ChromeConfig = exports.BufferConfig = exports.BatteryCounters = exports.AtomId = exports.AndroidPowerConfig = exports.AndroidLogId = exports.AndroidLogConfig = void 0;
exports.VmstatCounters = exports.TrackEventConfig = exports.TraceProcessorRpcStream = exports.TraceProcessorRpc = exports.TraceProcessorApiVersion = exports.TraceConfig = void 0;
const tslib_1 = require("tslib");
// TODO(primiano): this file is temporary. It's just to avoid rewriting all the
// protos import in Recording V1, which is going to go away soon.
const protos_1 = tslib_1.__importDefault(require("../../gen/protos"));
// Aliases protos to avoid the super nested namespaces.
// See https://www.typescriptlang.org/docs/handbook/namespaces.html#aliases
var AndroidLogConfig = protos_1.default.perfetto.protos.AndroidLogConfig;
exports.AndroidLogConfig = AndroidLogConfig;
var AndroidLogId = protos_1.default.perfetto.protos.AndroidLogId;
exports.AndroidLogId = AndroidLogId;
var AndroidPowerConfig = protos_1.default.perfetto.protos.AndroidPowerConfig;
exports.AndroidPowerConfig = AndroidPowerConfig;
var AtomId = protos_1.default.perfetto.protos.AtomId;
exports.AtomId = AtomId;
var BatteryCounters = protos_1.default.perfetto.protos.AndroidPowerConfig.BatteryCounters;
exports.BatteryCounters = BatteryCounters;
var BufferConfig = protos_1.default.perfetto.protos.TraceConfig.BufferConfig;
exports.BufferConfig = BufferConfig;
var ChromeConfig = protos_1.default.perfetto.protos.ChromeConfig;
exports.ChromeConfig = ChromeConfig;
var ComputeMetricArgs = protos_1.default.perfetto.protos.ComputeMetricArgs;
exports.ComputeMetricArgs = ComputeMetricArgs;
var ComputeMetricResult = protos_1.default.perfetto.protos.ComputeMetricResult;
exports.ComputeMetricResult = ComputeMetricResult;
var ConsumerPort = protos_1.default.perfetto.protos.ConsumerPort;
exports.ConsumerPort = ConsumerPort;
var DataSourceConfig = protos_1.default.perfetto.protos.DataSourceConfig;
exports.DataSourceConfig = DataSourceConfig;
var DataSourceDescriptor = protos_1.default.perfetto.protos.DataSourceDescriptor;
exports.DataSourceDescriptor = DataSourceDescriptor;
var DisableAndReadMetatraceResult = protos_1.default.perfetto.protos.DisableAndReadMetatraceResult;
exports.DisableAndReadMetatraceResult = DisableAndReadMetatraceResult;
var DisableTracingRequest = protos_1.default.perfetto.protos.DisableTracingRequest;
exports.DisableTracingRequest = DisableTracingRequest;
var DisableTracingResponse = protos_1.default.perfetto.protos.DisableTracingResponse;
exports.DisableTracingResponse = DisableTracingResponse;
var EnableMetatraceArgs = protos_1.default.perfetto.protos.EnableMetatraceArgs;
exports.EnableMetatraceArgs = EnableMetatraceArgs;
var EnableTracingRequest = protos_1.default.perfetto.protos.EnableTracingRequest;
exports.EnableTracingRequest = EnableTracingRequest;
var EnableTracingResponse = protos_1.default.perfetto.protos.EnableTracingResponse;
exports.EnableTracingResponse = EnableTracingResponse;
var EtwConfig = protos_1.default.perfetto.protos.EtwConfig;
exports.EtwConfig = EtwConfig;
var FreeBuffersRequest = protos_1.default.perfetto.protos.FreeBuffersRequest;
exports.FreeBuffersRequest = FreeBuffersRequest;
var FreeBuffersResponse = protos_1.default.perfetto.protos.FreeBuffersResponse;
exports.FreeBuffersResponse = FreeBuffersResponse;
var FtraceConfig = protos_1.default.perfetto.protos.FtraceConfig;
exports.FtraceConfig = FtraceConfig;
var GetTraceStatsRequest = protos_1.default.perfetto.protos.GetTraceStatsRequest;
exports.GetTraceStatsRequest = GetTraceStatsRequest;
var GetTraceStatsResponse = protos_1.default.perfetto.protos.GetTraceStatsResponse;
exports.GetTraceStatsResponse = GetTraceStatsResponse;
var HeapprofdConfig = protos_1.default.perfetto.protos.HeapprofdConfig;
exports.HeapprofdConfig = HeapprofdConfig;
var IPCFrame = protos_1.default.perfetto.protos.IPCFrame;
exports.IPCFrame = IPCFrame;
var JavaContinuousDumpConfig = protos_1.default.perfetto.protos.JavaHprofConfig.ContinuousDumpConfig;
exports.JavaContinuousDumpConfig = JavaContinuousDumpConfig;
var JavaHprofConfig = protos_1.default.perfetto.protos.JavaHprofConfig;
exports.JavaHprofConfig = JavaHprofConfig;
var MeminfoCounters = protos_1.default.perfetto.protos.MeminfoCounters;
exports.MeminfoCounters = MeminfoCounters;
var MetatraceCategories = protos_1.default.perfetto.protos.MetatraceCategories;
exports.MetatraceCategories = MetatraceCategories;
var NativeContinuousDumpConfig = protos_1.default.perfetto.protos.HeapprofdConfig.ContinuousDumpConfig;
exports.NativeContinuousDumpConfig = NativeContinuousDumpConfig;
var NetworkPacketTraceConfig = protos_1.default.perfetto.protos.NetworkPacketTraceConfig;
exports.NetworkPacketTraceConfig = NetworkPacketTraceConfig;
var PerfEventConfig = protos_1.default.perfetto.protos.PerfEventConfig;
exports.PerfEventConfig = PerfEventConfig;
var PerfEvents = protos_1.default.perfetto.protos.PerfEvents;
exports.PerfEvents = PerfEvents;
var PerfettoMetatrace = protos_1.default.perfetto.protos.PerfettoMetatrace;
exports.PerfettoMetatrace = PerfettoMetatrace;
var ProcessStatsConfig = protos_1.default.perfetto.protos.ProcessStatsConfig;
exports.ProcessStatsConfig = ProcessStatsConfig;
var QueryArgs = protos_1.default.perfetto.protos.QueryArgs;
exports.QueryArgs = QueryArgs;
var QueryResult = protos_1.default.perfetto.protos.QueryResult;
exports.QueryResult = QueryResult;
var QueryServiceStateRequest = protos_1.default.perfetto.protos.QueryServiceStateRequest;
exports.QueryServiceStateRequest = QueryServiceStateRequest;
var QueryServiceStateResponse = protos_1.default.perfetto.protos.QueryServiceStateResponse;
exports.QueryServiceStateResponse = QueryServiceStateResponse;
var ReadBuffersRequest = protos_1.default.perfetto.protos.ReadBuffersRequest;
exports.ReadBuffersRequest = ReadBuffersRequest;
var ReadBuffersResponse = protos_1.default.perfetto.protos.ReadBuffersResponse;
exports.ReadBuffersResponse = ReadBuffersResponse;
var RegisterSqlPackageArgs = protos_1.default.perfetto.protos.RegisterSqlPackageArgs;
exports.RegisterSqlPackageArgs = RegisterSqlPackageArgs;
var RegisterSqlPackageResult = protos_1.default.perfetto.protos.RegisterSqlPackageResult;
exports.RegisterSqlPackageResult = RegisterSqlPackageResult;
var ResetTraceProcessorArgs = protos_1.default.perfetto.protos.ResetTraceProcessorArgs;
exports.ResetTraceProcessorArgs = ResetTraceProcessorArgs;
var StatCounters = protos_1.default.perfetto.protos.SysStatsConfig.StatCounters;
exports.StatCounters = StatCounters;
var StatsdPullAtomConfig = protos_1.default.perfetto.protos.StatsdPullAtomConfig;
exports.StatsdPullAtomConfig = StatsdPullAtomConfig;
var StatsdTracingConfig = protos_1.default.perfetto.protos.StatsdTracingConfig;
exports.StatsdTracingConfig = StatsdTracingConfig;
var StatusResult = protos_1.default.perfetto.protos.StatusResult;
exports.StatusResult = StatusResult;
var SysStatsConfig = protos_1.default.perfetto.protos.SysStatsConfig;
exports.SysStatsConfig = SysStatsConfig;
var TraceConfig = protos_1.default.perfetto.protos.TraceConfig;
exports.TraceConfig = TraceConfig;
var TraceProcessorApiVersion = protos_1.default.perfetto.protos.TraceProcessorApiVersion;
exports.TraceProcessorApiVersion = TraceProcessorApiVersion;
var TraceProcessorRpc = protos_1.default.perfetto.protos.TraceProcessorRpc;
exports.TraceProcessorRpc = TraceProcessorRpc;
var TraceProcessorRpcStream = protos_1.default.perfetto.protos.TraceProcessorRpcStream;
exports.TraceProcessorRpcStream = TraceProcessorRpcStream;
var TrackEventConfig = protos_1.default.perfetto.protos.TrackEventConfig;
exports.TrackEventConfig = TrackEventConfig;
var VmstatCounters = protos_1.default.perfetto.protos.VmstatCounters;
exports.VmstatCounters = VmstatCounters;
//# sourceMappingURL=protos.js.map