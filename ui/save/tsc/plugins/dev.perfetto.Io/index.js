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
const workspace_1 = require("../../public/workspace");
const query_counter_track_1 = require("../../components/tracks/query_counter_track");
const query_result_1 = require("../../trace_processor/query_result");
class default_1 {
    static id = 'dev.perfetto.Io';
    async onTraceLoad(ctx) {
        await ctx.engine.query(`INCLUDE PERFETTO MODULE linux.block_io`);
        const devices = await this.lookupDevices(ctx.engine);
        const group = new workspace_1.TrackNode({
            title: 'Queued IO requests',
            sortOrder: -5,
            isSummary: true,
        });
        for (const device of devices) {
            const uri = `/queued_io_request_count/device_${device['id']}`;
            const title = `dev major:${device['major']} minor:${device['minor']}`;
            const track = await (0, query_counter_track_1.createQueryCounterTrack)({
                trace: ctx,
                uri,
                data: {
                    sqlSource: `SELECT ts, ops_in_queue_or_device as value
            FROM linux_active_block_io_operations_by_device
            WHERE dev = ${String(device['id'])}`
                },
            });
            ctx.tracks.registerTrack({
                uri,
                title,
                tags: {
                    device: device['id'],
                    groupName: 'Queued IO requests',
                },
                track,
            });
            const node = new workspace_1.TrackNode({ uri, title });
            group.addChildInOrder(node);
        }
        if (group.children.length) {
            ctx.workspace.addChildInOrder(group);
        }
    }
    async lookupDevices(engine) {
        const query = `
      SELECT DISTINCT dev, linux_device_major_id(dev) as major, linux_device_minor_id(dev) as minor
      FROM linux_active_block_io_operations_by_device ORDER BY dev`;
        const result = await engine.query(query);
        const it = result.iter({ dev: query_result_1.NUM, major: query_result_1.NUM, minor: query_result_1.NUM });
        const devs = [];
        for (; it.valid(); it.next()) {
            devs.push({ 'id': it.dev, 'major': it.major, 'minor': it.minor });
        }
        return devs;
    }
}
exports.default = default_1;
//# sourceMappingURL=index.js.map