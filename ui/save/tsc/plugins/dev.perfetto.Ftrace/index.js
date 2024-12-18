"use strict";
// Copyright (C) 2023 The Android Open Source Project
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
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const ftrace_explorer_1 = require("./ftrace_explorer");
const query_result_1 = require("../../trace_processor/query_result");
const ftrace_track_1 = require("./ftrace_track");
const workspace_1 = require("../../public/workspace");
const VERSION = 1;
const DEFAULT_STATE = {
    version: VERSION,
    filter: {
        excludeList: [],
    },
};
class default_1 {
    static id = 'dev.perfetto.Ftrace';
    async onTraceLoad(ctx) {
        const store = ctx.mountStore((init) => {
            if (typeof init === 'object' &&
                init !== null &&
                'version' in init &&
                init.version === VERSION) {
                return init;
            }
            else {
                return DEFAULT_STATE;
            }
        });
        ctx.trash.use(store);
        const filterStore = store.createSubStore(['filter'], (x) => x);
        ctx.trash.use(filterStore);
        const cpus = await this.lookupCpuCores(ctx.engine);
        const group = new workspace_1.TrackNode({
            title: 'Ftrace Events',
            sortOrder: -5,
            isSummary: true,
        });
        for (const cpuNum of cpus) {
            const uri = `/ftrace/cpu${cpuNum}`;
            const title = `Ftrace Track for CPU ${cpuNum}`;
            ctx.tracks.registerTrack({
                uri,
                title,
                tags: {
                    cpu: cpuNum,
                    groupName: 'Ftrace Events',
                },
                track: new ftrace_track_1.FtraceRawTrack(ctx.engine, cpuNum, filterStore),
            });
            const track = new workspace_1.TrackNode({ uri, title });
            group.addChildInOrder(track);
        }
        if (group.children.length) {
            ctx.workspace.addChildInOrder(group);
        }
        const cache = {
            state: 'blank',
            counters: [],
        };
        const ftraceTabUri = 'perfetto.FtraceRaw#FtraceEventsTab';
        ctx.tabs.registerTab({
            uri: ftraceTabUri,
            isEphemeral: false,
            content: {
                render: () => (0, mithril_1.default)(ftrace_explorer_1.FtraceExplorer, {
                    filterStore,
                    cache,
                    trace: ctx,
                }),
                getTitle: () => 'Ftrace Events',
            },
        });
        ctx.commands.registerCommand({
            id: 'perfetto.FtraceRaw#ShowFtraceTab',
            name: 'Show ftrace tab',
            callback: () => {
                ctx.tabs.showTab(ftraceTabUri);
            },
        });
    }
    async lookupCpuCores(engine) {
        const query = 'select distinct cpu from ftrace_event order by cpu';
        const result = await engine.query(query);
        const it = result.iter({ cpu: query_result_1.NUM });
        const cpuCores = [];
        for (; it.valid(); it.next()) {
            cpuCores.push(it.cpu);
        }
        return cpuCores;
    }
}
exports.default = default_1;
//# sourceMappingURL=index.js.map