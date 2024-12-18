"use strict";
// Copyright (C) 2020 The Android Open Source Project
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
exports.ThreadStateSelectionAggregator = void 0;
const query_result_1 = require("../../trace_processor/query_result");
const dataset_1 = require("../../trace_processor/dataset");
const thread_state_1 = require("../../components/sql_utils/thread_state");
class ThreadStateSelectionAggregator {
    id = 'thread_state_aggregation';
    async createAggregateView(engine, area) {
        const dataset = this.getDatasetFromTracks(area.tracks);
        if (dataset === undefined)
            return false;
        await engine.query(`
      create or replace perfetto table ${this.id} as
      select
        process.name as process_name,
        process.pid,
        thread.name as thread_name,
        thread.tid,
        tstate.state || ',' || ifnull(tstate.io_wait, 'NULL') as concat_state,
        sum(tstate.dur) AS total_dur,
        sum(tstate.dur) / count() as avg_dur,
        count() as occurrences
      from (${dataset.query()}) tstate
      join thread using (utid)
      left join process using (upid)
      where
        ts + dur > ${area.start}
        and ts < ${area.end}
      group by utid, concat_state
    `);
        return true;
    }
    async getExtra(engine, area) {
        const dataset = this.getDatasetFromTracks(area.tracks);
        if (dataset === undefined)
            return;
        const query = `
      select
        state,
        io_wait as ioWait,
        sum(dur) as totalDur
      from (${dataset.query()}) tstate
      join thread using (utid)
      where tstate.ts + tstate.dur > ${area.start}
        and tstate.ts < ${area.end}
      group by state, io_wait
    `;
        const result = await engine.query(query);
        const it = result.iter({
            state: query_result_1.STR_NULL,
            ioWait: query_result_1.NUM_NULL,
            totalDur: query_result_1.NUM,
        });
        let totalMs = 0;
        const values = new Float64Array(result.numRows());
        const states = [];
        for (let i = 0; it.valid(); ++i, it.next()) {
            const state = it.state == null ? undefined : it.state;
            const ioWait = it.ioWait === null ? undefined : it.ioWait > 0;
            states.push((0, thread_state_1.translateState)(state, ioWait));
            const ms = it.totalDur / 1000000;
            values[i] = ms;
            totalMs += ms;
        }
        return {
            kind: 'THREAD_STATE',
            states,
            values,
            totalMs,
        };
    }
    getColumnDefinitions() {
        return [
            {
                title: 'Process',
                kind: 'STRING',
                columnConstructor: Uint16Array,
                columnId: 'process_name',
            },
            {
                title: 'PID',
                kind: 'NUMBER',
                columnConstructor: Uint16Array,
                columnId: 'pid',
            },
            {
                title: 'Thread',
                kind: 'STRING',
                columnConstructor: Uint16Array,
                columnId: 'thread_name',
            },
            {
                title: 'TID',
                kind: 'NUMBER',
                columnConstructor: Uint16Array,
                columnId: 'tid',
            },
            {
                title: 'State',
                kind: 'STATE',
                columnConstructor: Uint16Array,
                columnId: 'concat_state',
            },
            {
                title: 'Wall duration (ms)',
                kind: 'TIMESTAMP_NS',
                columnConstructor: Float64Array,
                columnId: 'total_dur',
                sum: true,
            },
            {
                title: 'Avg Wall duration (ms)',
                kind: 'TIMESTAMP_NS',
                columnConstructor: Float64Array,
                columnId: 'avg_dur',
            },
            {
                title: 'Occurrences',
                kind: 'NUMBER',
                columnConstructor: Uint16Array,
                columnId: 'occurrences',
                sum: true,
            },
        ];
    }
    getTabName() {
        return 'Thread States';
    }
    getDefaultSorting() {
        return { column: 'total_dur', direction: 'DESC' };
    }
    // Creates an optimized dataset containing the thread state events within a
    // given list of tracks, or returns undefined if no compatible tracks are
    // present in the list.
    getDatasetFromTracks(tracks) {
        const desiredSchema = {
            dur: query_result_1.LONG,
            io_wait: query_result_1.NUM_NULL,
            state: query_result_1.STR,
            utid: query_result_1.NUM,
        };
        const validDatasets = tracks
            .map((track) => track.track.getDataset?.())
            .filter((ds) => ds !== undefined)
            .filter((ds) => ds.implements(desiredSchema));
        if (validDatasets.length === 0) {
            return undefined;
        }
        return new dataset_1.UnionDataset(validDatasets).optimize();
    }
}
exports.ThreadStateSelectionAggregator = ThreadStateSelectionAggregator;
//# sourceMappingURL=thread_state_selection_aggregator.js.map