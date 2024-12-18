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
const array_utils_1 = require("../../base/array_utils");
const workspace_1 = require("../../public/workspace");
const track_kinds_1 = require("../../public/track_kinds");
const utils_1 = require("../../public/utils");
const query_result_1 = require("../../trace_processor/query_result");
const async_slice_track_1 = require("./async_slice_track");
const utils_2 = require("../../base/utils");
const logging_1 = require("../../base/logging");
const slice_selection_aggregator_1 = require("./slice_selection_aggregator");
const dev_perfetto_ProcessThreadGroups_1 = tslib_1.__importDefault(require("../dev.perfetto.ProcessThreadGroups"));
class default_1 {
    static id = 'dev.perfetto.AsyncSlices';
    static dependencies = [dev_perfetto_ProcessThreadGroups_1.default];
    async onTraceLoad(ctx) {
        const trackIdsToUris = new Map();
        await this.addGlobalAsyncTracks(ctx, trackIdsToUris);
        await this.addProcessAsyncSliceTracks(ctx, trackIdsToUris);
        await this.addThreadAsyncSliceTracks(ctx, trackIdsToUris);
        ctx.selection.registerSqlSelectionResolver({
            sqlTableName: 'slice',
            callback: async (id) => {
                // Locate the track for a given id in the slice table
                const result = await ctx.engine.query(`
          select
            track_id as trackId
          from
            slice
          where slice.id = ${id}
        `);
                if (result.numRows() === 0) {
                    return undefined;
                }
                const { trackId } = result.firstRow({
                    trackId: query_result_1.NUM,
                });
                const trackUri = trackIdsToUris.get(trackId);
                if (!trackUri) {
                    return undefined;
                }
                return {
                    trackUri,
                    eventId: id,
                };
            },
        });
        ctx.selection.registerAreaSelectionAggregator(new slice_selection_aggregator_1.SliceSelectionAggregator());
    }
    async addGlobalAsyncTracks(ctx, trackIdsToUris) {
        const { engine } = ctx;
        const rawGlobalAsyncTracks = await engine.query(`
      include perfetto module graphs.search;
      include perfetto module viz.summary.tracks;

      with global_tracks_grouped as (
        select
          t.parent_id,
          t.name,
          group_concat(t.id) as trackIds,
          count() as trackCount,
          ifnull(min(a.order_id), 0) as order_id
        from track t
        join _slice_track_summary s using (id)
        left join _track_event_tracks_ordered a USING (id)
        where
          s.is_legacy_global
          and (name != 'Suspend/Resume Latency' or name is null)
        group by parent_id, name
        order by parent_id, order_id
      ),
      intermediate_groups as (
        select
          t.name,
          t.id,
          t.parent_id,
          ifnull(a.order_id, 0) as order_id
        from graph_reachable_dfs!(
          (
            select id as source_node_id, parent_id as dest_node_id
            from track
            where parent_id is not null
          ),
          (
            select distinct parent_id as node_id
            from global_tracks_grouped
            where parent_id is not null
          )
        ) g
        join track t on g.node_id = t.id
        left join _track_event_tracks_ordered a USING (id)
      )
      select
        t.name as name,
        t.parent_id as parentId,
        t.trackIds as trackIds,
        t.order_id as orderId,
        __max_layout_depth(t.trackCount, t.trackIds) as maxDepth
      from global_tracks_grouped t
      union all
      select
        t.name as name,
        t.parent_id as parentId,
        cast_string!(t.id) as trackIds,
        t.order_id as orderId,
        NULL as maxDepth
      from intermediate_groups t
      left join _slice_track_summary s using (id)
      where s.id is null
      order by parentId, orderId
    `);
        const it = rawGlobalAsyncTracks.iter({
            name: query_result_1.STR_NULL,
            parentId: query_result_1.NUM_NULL,
            trackIds: query_result_1.STR,
            orderId: query_result_1.NUM,
            maxDepth: query_result_1.NUM_NULL,
        });
        // Create a map of track nodes by id
        const trackMap = new Map();
        for (; it.valid(); it.next()) {
            const rawName = it.name === null ? undefined : it.name;
            const title = (0, utils_1.getTrackName)({
                name: rawName,
                kind: track_kinds_1.SLICE_TRACK_KIND,
            });
            const rawTrackIds = it.trackIds;
            const trackIds = rawTrackIds.split(',').map((v) => Number(v));
            const maxDepth = it.maxDepth;
            if (maxDepth === null) {
                (0, logging_1.assertTrue)(trackIds.length == 1);
                const trackNode = new workspace_1.TrackNode({ title, sortOrder: -25 });
                trackMap.set(trackIds[0], { parentId: it.parentId, trackNode });
            }
            else {
                const uri = `/async_slices_${rawName}_${it.parentId}`;
                ctx.tracks.registerTrack({
                    uri,
                    title,
                    tags: {
                        trackIds,
                        kind: track_kinds_1.SLICE_TRACK_KIND,
                        scope: 'global',
                    },
                    track: new async_slice_track_1.AsyncSliceTrack(ctx, uri, maxDepth, trackIds),
                });
                const trackNode = new workspace_1.TrackNode({
                    uri,
                    title,
                    sortOrder: it.orderId,
                });
                trackIds.forEach((id) => {
                    trackMap.set(id, { parentId: it.parentId, trackNode });
                    trackIdsToUris.set(id, uri);
                });
            }
        }
        // Attach track nodes to parents / or the workspace if they have no parent
        trackMap.forEach(({ parentId, trackNode }) => {
            if ((0, utils_2.exists)(parentId)) {
                const parent = (0, logging_1.assertExists)(trackMap.get(parentId));
                parent.trackNode.addChildInOrder(trackNode);
            }
            else {
                ctx.workspace.addChildInOrder(trackNode);
            }
        });
    }
    async addCpuTracks(ctx, trackIdsToUris) {
        const { engine } = ctx;
        const res = await engine.query(`
      include perfetto module viz.summary.tracks;

      with global_tracks_grouped as (
        select
          t.name,
          group_concat(t.id) as trackIds,
          count() as trackCount
        from cpu_track t
        join _slice_track_summary using (id)
        group by name
      )
      select
        t.name as name,
        t.trackIds as trackIds,
        __max_layout_depth(t.trackCount, t.trackIds) as maxDepth
      from global_tracks_grouped t
    `);
        const it = res.iter({
            name: query_result_1.STR_NULL,
            trackIds: query_result_1.STR,
            maxDepth: query_result_1.NUM,
        });
        for (; it.valid(); it.next()) {
            const rawName = it.name === null ? undefined : it.name;
            const title = (0, utils_1.getTrackName)({
                name: rawName,
                kind: track_kinds_1.SLICE_TRACK_KIND,
            });
            const rawTrackIds = it.trackIds;
            const trackIds = rawTrackIds.split(',').map((v) => Number(v));
            const maxDepth = it.maxDepth;
            const uri = `/cpu_slices_${rawName}`;
            ctx.tracks.registerTrack({
                uri,
                title,
                tags: {
                    trackIds,
                    kind: track_kinds_1.SLICE_TRACK_KIND,
                    scope: 'global',
                },
                track: new async_slice_track_1.AsyncSliceTrack(ctx, uri, maxDepth, trackIds),
            });
            const trackNode = new workspace_1.TrackNode({
                uri,
                title,
            });
            ctx.workspace.addChildInOrder(trackNode);
            trackIds.forEach((id) => {
                trackIdsToUris.set(id, uri);
            });
        }
    }
    async addProcessAsyncSliceTracks(ctx, trackIdsToUris) {
        const result = await ctx.engine.query(`
      select
        upid,
        t.name as trackName,
        t.track_ids as trackIds,
        process.name as processName,
        process.pid as pid,
        t.parent_id as parentId,
        __max_layout_depth(t.track_count, t.track_ids) as maxDepth
      from _process_track_summary_by_upid_and_parent_id_and_name t
      join process using (upid)
      where t.name is null or t.name not glob "* Timeline"
    `);
        const it = result.iter({
            upid: query_result_1.NUM,
            parentId: query_result_1.NUM_NULL,
            trackName: query_result_1.STR_NULL,
            trackIds: query_result_1.STR,
            processName: query_result_1.STR_NULL,
            pid: query_result_1.NUM_NULL,
            maxDepth: query_result_1.NUM,
        });
        const trackMap = new Map();
        for (; it.valid(); it.next()) {
            const upid = it.upid;
            const trackName = it.trackName;
            const rawTrackIds = it.trackIds;
            const trackIds = rawTrackIds.split(',').map((v) => Number(v));
            const processName = it.processName;
            const pid = it.pid;
            const maxDepth = it.maxDepth;
            const kind = track_kinds_1.SLICE_TRACK_KIND;
            const title = (0, utils_1.getTrackName)({
                name: trackName,
                upid,
                pid,
                processName,
                kind,
            });
            const uri = `/process_${upid}/async_slices_${rawTrackIds}`;
            ctx.tracks.registerTrack({
                uri,
                title,
                tags: {
                    trackIds,
                    kind: track_kinds_1.SLICE_TRACK_KIND,
                    scope: 'process',
                    upid,
                },
                track: new async_slice_track_1.AsyncSliceTrack(ctx, uri, maxDepth, trackIds),
            });
            const track = new workspace_1.TrackNode({ uri, title, sortOrder: 30 });
            trackIds.forEach((id) => {
                trackMap.set(id, { trackNode: track, parentId: it.parentId, upid });
                trackIdsToUris.set(id, uri);
            });
        }
        // Attach track nodes to parents / or the workspace if they have no parent
        trackMap.forEach((t) => {
            const parent = (0, utils_2.exists)(t.parentId) && trackMap.get(t.parentId);
            if (parent !== false && parent !== undefined) {
                parent.trackNode.addChildInOrder(t.trackNode);
            }
            else {
                const processGroup = ctx.plugins
                    .getPlugin(dev_perfetto_ProcessThreadGroups_1.default)
                    .getGroupForProcess(t.upid);
                processGroup?.addChildInOrder(t.trackNode);
            }
        });
    }
    async addThreadAsyncSliceTracks(ctx, trackIdsToUris) {
        const result = await ctx.engine.query(`
      include perfetto module viz.summary.slices;
      include perfetto module viz.summary.threads;
      include perfetto module viz.threads;

      select
        t.utid,
        t.parent_id as parentId,
        thread.upid,
        t.name as trackName,
        thread.name as threadName,
        thread.tid as tid,
        t.track_ids as trackIds,
        __max_layout_depth(t.track_count, t.track_ids) as maxDepth,
        k.is_main_thread as isMainThread,
        k.is_kernel_thread AS isKernelThread
      from _thread_track_summary_by_utid_and_name t
      join _threads_with_kernel_flag k using(utid)
      join thread using (utid)
    `);
        const it = result.iter({
            utid: query_result_1.NUM,
            parentId: query_result_1.NUM_NULL,
            upid: query_result_1.NUM_NULL,
            trackName: query_result_1.STR_NULL,
            trackIds: query_result_1.STR,
            maxDepth: query_result_1.NUM,
            isMainThread: query_result_1.NUM_NULL,
            isKernelThread: query_result_1.NUM,
            threadName: query_result_1.STR_NULL,
            tid: query_result_1.NUM_NULL,
        });
        const trackMap = new Map();
        for (; it.valid(); it.next()) {
            const { utid, parentId, upid, trackName, isMainThread, isKernelThread, maxDepth, threadName, tid, } = it;
            const rawTrackIds = it.trackIds;
            const trackIds = rawTrackIds.split(',').map((v) => Number(v));
            const title = (0, utils_1.getTrackName)({
                name: trackName,
                utid,
                tid,
                threadName,
                kind: 'Slices',
            });
            const uri = `/${(0, utils_1.getThreadUriPrefix)(upid, utid)}_slice_${rawTrackIds}`;
            ctx.tracks.registerTrack({
                uri,
                title,
                tags: {
                    trackIds,
                    kind: track_kinds_1.SLICE_TRACK_KIND,
                    scope: 'thread',
                    utid,
                    upid: upid ?? undefined,
                    ...(isKernelThread === 1 && { kernelThread: true }),
                },
                chips: (0, array_utils_1.removeFalsyValues)([
                    isKernelThread === 0 && isMainThread === 1 && 'main thread',
                ]),
                track: new async_slice_track_1.AsyncSliceTrack(ctx, uri, maxDepth, trackIds),
            });
            const track = new workspace_1.TrackNode({ uri, title, sortOrder: 20 });
            trackIds.forEach((id) => {
                trackMap.set(id, { trackNode: track, parentId, utid });
                trackIdsToUris.set(id, uri);
            });
        }
        // Attach track nodes to parents / or the workspace if they have no parent
        trackMap.forEach((t) => {
            const parent = (0, utils_2.exists)(t.parentId) && trackMap.get(t.parentId);
            if (parent !== false && parent !== undefined) {
                parent.trackNode.addChildInOrder(t.trackNode);
            }
            else {
                const group = ctx.plugins
                    .getPlugin(dev_perfetto_ProcessThreadGroups_1.default)
                    .getGroupForThread(t.utid);
                group?.addChildInOrder(t.trackNode);
            }
        });
    }
}
exports.default = default_1;
//# sourceMappingURL=index.js.map