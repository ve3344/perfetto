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
const tslib_1 = require("tslib");
const query_result_1 = require("../../trace_processor/query_result");
const track_kinds_1 = require("../../public/track_kinds");
const utils_1 = require("../../public/utils");
const trace_processor_counter_track_1 = require("./trace_processor_counter_track");
const utils_2 = require("../../base/utils");
const workspace_1 = require("../../public/workspace");
const counter_selection_aggregator_1 = require("./counter_selection_aggregator");
const dev_perfetto_ProcessThreadGroups_1 = tslib_1.__importDefault(require("../dev.perfetto.ProcessThreadGroups"));
const NETWORK_TRACK_REGEX = new RegExp('^.* (Received|Transmitted)( KB)?$');
const ENTITY_RESIDENCY_REGEX = new RegExp('^Entity residency:');
// Sets the default 'mode' for counter tracks. If the regex matches
// then the paired mode is used. Entries are in priority order so the
// first match wins.
const COUNTER_REGEX = [
    // Power counters make more sense in rate mode since you're typically
    // interested in the slope of the graph rather than the absolute
    // value.
    [new RegExp('^power..*$'), 'rate'],
    // Same for cumulative PSI stall time counters, e.g., psi.cpu.some.
    [new RegExp('^psi..*$'), 'rate'],
    // Same for network counters.
    [NETWORK_TRACK_REGEX, 'rate'],
    // Entity residency
    [ENTITY_RESIDENCY_REGEX, 'rate'],
];
function getCounterMode(name) {
    for (const [re, mode] of COUNTER_REGEX) {
        if (name.match(re)) {
            return mode;
        }
    }
    return undefined;
}
function getDefaultCounterOptions(name) {
    const options = {};
    options.yMode = getCounterMode(name);
    if (name.endsWith('_pct')) {
        options.yOverrideMinimum = 0;
        options.yOverrideMaximum = 100;
        options.unit = '%';
    }
    if (name.startsWith('power.')) {
        options.yRangeSharingKey = 'power';
    }
    // TODO(stevegolton): We need to rethink how this works for virtual memory.
    // The problem is we can easily have > 10GB virtual memory which dwarfs
    // physical memory making other memory tracks difficult to read.
    // if (name.startsWith('mem.')) {
    //   options.yRangeSharingKey = 'mem';
    // }
    // All 'Entity residency: foo bar1234' tracks should share a y-axis
    // with 'Entity residency: foo baz5678' etc tracks:
    {
        const r = new RegExp('Entity residency: ([^ ]+) ');
        const m = r.exec(name);
        if (m) {
            options.yRangeSharingKey = `entity-residency-${m[1]}`;
        }
    }
    {
        const r = new RegExp('GPU .* Frequency');
        const m = r.exec(name);
        if (m) {
            options.yRangeSharingKey = 'gpu-frequency';
        }
    }
    return options;
}
class default_1 {
    static id = 'dev.perfetto.Counter';
    static dependencies = [dev_perfetto_ProcessThreadGroups_1.default];
    async onTraceLoad(ctx) {
        await this.addCounterTracks(ctx);
        await this.addGpuFrequencyTracks(ctx);
        await this.addCpuFreqLimitCounterTracks(ctx);
        await this.addCpuTimeCounterTracks(ctx);
        await this.addCpuPerfCounterTracks(ctx);
        await this.addThreadCounterTracks(ctx);
        await this.addProcessCounterTracks(ctx);
        ctx.selection.registerAreaSelectionAggregator(new counter_selection_aggregator_1.CounterSelectionAggregator());
    }
    async addCounterTracks(ctx) {
        const result = await ctx.engine.query(`
      select name, id, unit
      from (
        select name, id, unit
        from counter_track
        join _counter_track_summary using (id)
        where is_legacy_global
        union
        select name, id, unit
        from gpu_counter_track
        join _counter_track_summary using (id)
        where name != 'gpufreq'
      )
      order by name
    `);
        // Add global or GPU counter tracks that are not bound to any pid/tid.
        const it = result.iter({
            name: query_result_1.STR,
            unit: query_result_1.STR_NULL,
            id: query_result_1.NUM,
        });
        for (; it.valid(); it.next()) {
            const trackId = it.id;
            const title = it.name;
            const unit = it.unit ?? undefined;
            const uri = `/counter_${trackId}`;
            ctx.tracks.registerTrack({
                uri,
                title,
                tags: {
                    kind: track_kinds_1.COUNTER_TRACK_KIND,
                    trackIds: [trackId],
                },
                track: new trace_processor_counter_track_1.TraceProcessorCounterTrack(ctx, uri, {
                    ...getDefaultCounterOptions(title),
                    unit,
                }, trackId, title),
            });
            const track = new workspace_1.TrackNode({ uri, title });
            ctx.workspace.addChildInOrder(track);
        }
    }
    async addCpuFreqLimitCounterTracks(ctx) {
        const cpuFreqLimitCounterTracksSql = `
      select name, id
      from cpu_counter_track
      join _counter_track_summary using (id)
      where name glob "Cpu * Freq Limit"
      order by name asc
    `;
        this.addCpuCounterTracks(ctx, cpuFreqLimitCounterTracksSql, 'cpuFreqLimit');
    }
    async addCpuTimeCounterTracks(ctx) {
        const cpuTimeCounterTracksSql = `
      select name, id
      from cpu_counter_track
      join _counter_track_summary using (id)
      where name glob "cpu.times.*"
      order by name asc
    `;
        this.addCpuCounterTracks(ctx, cpuTimeCounterTracksSql, 'cpuTime');
    }
    async addCpuPerfCounterTracks(ctx) {
        // Perf counter tracks are bound to CPUs, follow the scheduling and
        // frequency track naming convention ("Cpu N ...").
        // Note: we might not have a track for a given cpu if no data was seen from
        // it. This might look surprising in the UI, but placeholder tracks are
        // wasteful as there's no way of collapsing global counter tracks at the
        // moment.
        const addCpuPerfCounterTracksSql = `
      select printf("Cpu %u %s", cpu, name) as name, id
      from perf_counter_track as pct
      join _counter_track_summary using (id)
      order by perf_session_id asc, pct.name asc, cpu asc
    `;
        this.addCpuCounterTracks(ctx, addCpuPerfCounterTracksSql, 'cpuPerf');
    }
    async addCpuCounterTracks(ctx, sql, scope) {
        const result = await ctx.engine.query(sql);
        const it = result.iter({
            name: query_result_1.STR,
            id: query_result_1.NUM,
        });
        for (; it.valid(); it.next()) {
            const name = it.name;
            const trackId = it.id;
            const uri = `counter.cpu.${trackId}`;
            ctx.tracks.registerTrack({
                uri,
                title: name,
                tags: {
                    kind: track_kinds_1.COUNTER_TRACK_KIND,
                    trackIds: [trackId],
                    scope,
                },
                track: new trace_processor_counter_track_1.TraceProcessorCounterTrack(ctx, uri, getDefaultCounterOptions(name), trackId, name),
            });
            const trackNode = new workspace_1.TrackNode({ uri, title: name, sortOrder: -20 });
            ctx.workspace.addChildInOrder(trackNode);
        }
    }
    async addThreadCounterTracks(ctx) {
        const result = await ctx.engine.query(`
      select
        thread_counter_track.name as trackName,
        utid,
        upid,
        tid,
        thread.name as threadName,
        thread_counter_track.id as trackId,
        thread.start_ts as startTs,
        thread.end_ts as endTs
      from thread_counter_track
      join _counter_track_summary using (id)
      join thread using(utid)
      where thread_counter_track.name != 'thread_time'
    `);
        const it = result.iter({
            startTs: query_result_1.LONG_NULL,
            trackId: query_result_1.NUM,
            endTs: query_result_1.LONG_NULL,
            trackName: query_result_1.STR_NULL,
            utid: query_result_1.NUM,
            upid: query_result_1.NUM_NULL,
            tid: query_result_1.NUM_NULL,
            threadName: query_result_1.STR_NULL,
        });
        for (; it.valid(); it.next()) {
            const utid = it.utid;
            const upid = it.upid;
            const tid = it.tid;
            const trackId = it.trackId;
            const trackName = it.trackName;
            const threadName = it.threadName;
            const kind = track_kinds_1.COUNTER_TRACK_KIND;
            const name = (0, utils_1.getTrackName)({
                name: trackName,
                utid,
                tid,
                kind,
                threadName,
                threadTrack: true,
            });
            const uri = `${(0, utils_1.getThreadUriPrefix)(upid, utid)}_counter_${trackId}`;
            ctx.tracks.registerTrack({
                uri,
                title: name,
                tags: {
                    kind,
                    trackIds: [trackId],
                    utid,
                    upid: upid ?? undefined,
                    scope: 'thread',
                },
                track: new trace_processor_counter_track_1.TraceProcessorCounterTrack(ctx, uri, getDefaultCounterOptions(name), trackId, name),
            });
            const group = ctx.plugins
                .getPlugin(dev_perfetto_ProcessThreadGroups_1.default)
                .getGroupForThread(utid);
            const track = new workspace_1.TrackNode({ uri, title: name, sortOrder: 30 });
            group?.addChildInOrder(track);
        }
    }
    async addProcessCounterTracks(ctx) {
        const result = await ctx.engine.query(`
      select
        process_counter_track.id as trackId,
        process_counter_track.name as trackName,
        upid,
        process.pid,
        process.name as processName
      from process_counter_track
      join _counter_track_summary using (id)
      join process using(upid)
      order by trackName;
    `);
        const it = result.iter({
            trackId: query_result_1.NUM,
            trackName: query_result_1.STR_NULL,
            upid: query_result_1.NUM,
            pid: query_result_1.NUM_NULL,
            processName: query_result_1.STR_NULL,
        });
        for (let i = 0; it.valid(); ++i, it.next()) {
            const trackId = it.trackId;
            const pid = it.pid;
            const trackName = it.trackName;
            const upid = it.upid;
            const processName = it.processName;
            const kind = track_kinds_1.COUNTER_TRACK_KIND;
            const name = (0, utils_1.getTrackName)({
                name: trackName,
                upid,
                pid,
                kind,
                processName,
                ...((0, utils_2.exists)(trackName) && { trackName }),
            });
            const uri = `/process_${upid}/counter_${trackId}`;
            ctx.tracks.registerTrack({
                uri,
                title: name,
                tags: {
                    kind,
                    trackIds: [trackId],
                    upid,
                    scope: 'process',
                },
                track: new trace_processor_counter_track_1.TraceProcessorCounterTrack(ctx, uri, getDefaultCounterOptions(name), trackId, name),
            });
            const group = ctx.plugins
                .getPlugin(dev_perfetto_ProcessThreadGroups_1.default)
                .getGroupForProcess(upid);
            const track = new workspace_1.TrackNode({ uri, title: name, sortOrder: 20 });
            group?.addChildInOrder(track);
        }
    }
    async addGpuFrequencyTracks(ctx) {
        const engine = ctx.engine;
        const result = await engine.query(`
      select id, gpu_id as gpuId
      from gpu_counter_track
      join _counter_track_summary using (id)
      where name = 'gpufreq'
    `);
        const it = result.iter({ id: query_result_1.NUM, gpuId: query_result_1.NUM });
        for (; it.valid(); it.next()) {
            const uri = `/gpu_frequency_${it.gpuId}`;
            const name = `Gpu ${it.gpuId} Frequency`;
            ctx.tracks.registerTrack({
                uri,
                title: name,
                tags: {
                    kind: track_kinds_1.COUNTER_TRACK_KIND,
                    trackIds: [it.id],
                    scope: 'gpuFreq',
                },
                track: new trace_processor_counter_track_1.TraceProcessorCounterTrack(ctx, uri, getDefaultCounterOptions(name), it.id, name),
            });
            const track = new workspace_1.TrackNode({ uri, title: name, sortOrder: -20 });
            ctx.workspace.addChildInOrder(track);
        }
    }
}
exports.default = default_1;
//# sourceMappingURL=index.js.map