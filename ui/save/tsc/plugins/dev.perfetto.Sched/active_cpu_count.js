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
exports.ActiveCPUCountTrack = exports.CPUType = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const semantic_icons_1 = require("../../base/semantic_icons");
const string_utils_1 = require("../../base/string_utils");
const base_counter_track_1 = require("../../components/tracks/base_counter_track");
const button_1 = require("../../widgets/button");
var CPUType;
(function (CPUType) {
    CPUType["Big"] = "big";
    CPUType["Mid"] = "mid";
    CPUType["Little"] = "little";
})(CPUType || (exports.CPUType = CPUType = {}));
class ActiveCPUCountTrack extends base_counter_track_1.BaseCounterTrack {
    cpuType;
    constructor(ctx, trace, cpuType) {
        super(trace, ctx.trackUri);
        this.cpuType = cpuType;
    }
    getTrackShellButtons() {
        return (0, mithril_1.default)(button_1.Button, {
            onclick: () => {
                this.trace.workspace.findTrackByUri(this.uri)?.remove();
            },
            icon: semantic_icons_1.Icons.Close,
            title: 'Close',
            compact: true,
        });
    }
    getDefaultCounterOptions() {
        const options = super.getDefaultCounterOptions();
        options.yRangeRounding = 'strict';
        options.yRange = 'viewport';
        return options;
    }
    async onInit() {
        await this.engine.query(`
      INCLUDE PERFETTO MODULE sched.thread_level_parallelism;
      INCLUDE PERFETTO MODULE android.cpu.cluster_type;
    `);
    }
    getSqlSource() {
        const sourceTable = this.cpuType === undefined
            ? 'sched_active_cpu_count'
            : `_active_cpu_count_for_cluster_type(${(0, string_utils_1.sqliteString)(this.cpuType)})`;
        return `
      select
        ts,
        active_cpu_count as value
      from ${sourceTable}
    `;
    }
}
exports.ActiveCPUCountTrack = ActiveCPUCountTrack;
//# sourceMappingURL=active_cpu_count.js.map