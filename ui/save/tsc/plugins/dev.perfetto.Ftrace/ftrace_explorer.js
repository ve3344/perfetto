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
exports.FtraceExplorer = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const time_1 = require("../../base/time");
const colorizer_1 = require("../../components/colorizer");
const details_shell_1 = require("../../widgets/details_shell");
const multiselect_1 = require("../../widgets/multiselect");
const popup_1 = require("../../widgets/popup");
const timestamp_1 = require("../../components/widgets/timestamp");
const query_result_1 = require("../../trace_processor/query_result");
const async_limiter_1 = require("../../base/async_limiter");
const monitor_1 = require("../../base/monitor");
const button_1 = require("../../widgets/button");
const virtual_table_1 = require("../../widgets/virtual_table");
const ROW_H = 20;
async function getFtraceCounters(engine) {
    // TODO(stevegolton): this is an extraordinarily slow query on large traces
    // as it goes through every ftrace event which can be a lot on big traces.
    // Consider if we can have some different UX which avoids needing these
    // counts
    // TODO(mayzner): the +name below is an awful hack to workaround
    // extraordinarily slow sorting of strings. However, even with this hack,
    // this is just a slow query. There are various ways we can improve this
    // (e.g. with using the vtab_distinct APIs of SQLite).
    const result = await engine.query(`
    select
      name,
      count(1) as cnt
    from ftrace_event
    group by name
    order by cnt desc
  `);
    const counters = [];
    const it = result.iter({ name: query_result_1.STR, cnt: query_result_1.NUM });
    for (let row = 0; it.valid(); it.next(), row++) {
        counters.push({ name: it.name, count: it.cnt });
    }
    return counters;
}
class FtraceExplorer {
    pagination = {
        offset: 0,
        count: 0,
    };
    monitor;
    queryLimiter = new async_limiter_1.AsyncLimiter();
    // A cache of the data we have most recently loaded from our store
    data;
    constructor({ attrs }) {
        this.monitor = new monitor_1.Monitor([
            () => attrs.trace.timeline.visibleWindow.toTimeSpan().start,
            () => attrs.trace.timeline.visibleWindow.toTimeSpan().end,
            () => attrs.filterStore.state,
        ]);
        if (attrs.cache.state === 'blank') {
            getFtraceCounters(attrs.trace.engine)
                .then((counters) => {
                attrs.cache.counters = counters;
                attrs.cache.state = 'valid';
            })
                .catch(() => {
                attrs.cache.state = 'blank';
            });
            attrs.cache.state = 'loading';
        }
    }
    view({ attrs }) {
        this.monitor.ifStateChanged(() => {
            this.reloadData(attrs);
        });
        return (0, mithril_1.default)(details_shell_1.DetailsShell, {
            title: this.renderTitle(),
            buttons: this.renderFilterPanel(attrs),
            fillParent: true,
        }, (0, mithril_1.default)(virtual_table_1.VirtualTable, {
            className: 'pf-ftrace-explorer',
            columns: [
                { header: 'ID', width: '5em' },
                { header: 'Timestamp', width: '13em' },
                { header: 'Name', width: '24em' },
                { header: 'CPU', width: '3em' },
                { header: 'Process', width: '24em' },
                { header: 'Args', width: '200em' },
            ],
            firstRowOffset: this.data?.offset ?? 0,
            numRows: this.data?.numEvents ?? 0,
            rowHeight: ROW_H,
            rows: this.renderData(),
            onReload: (offset, count) => {
                this.pagination = { offset, count };
                this.reloadData(attrs);
            },
            onRowHover: (id) => {
                const event = this.data?.events.find((event) => event.id === id);
                if (event) {
                    attrs.trace.timeline.hoverCursorTimestamp = event.ts;
                }
            },
            onRowOut: () => {
                attrs.trace.timeline.hoverCursorTimestamp = undefined;
            },
        }));
    }
    reloadData(attrs) {
        this.queryLimiter.schedule(async () => {
            this.data = await lookupFtraceEvents(attrs.trace, this.pagination.offset, this.pagination.count, attrs.filterStore.state);
            attrs.trace.scheduleFullRedraw();
        });
    }
    renderData() {
        if (!this.data) {
            return [];
        }
        return this.data.events.map((event) => {
            const { ts, name, cpu, process, args, id } = event;
            const timestamp = (0, mithril_1.default)(timestamp_1.Timestamp, { ts });
            const color = (0, colorizer_1.colorForFtrace)(name).base.cssString;
            return {
                id,
                cells: [
                    id,
                    timestamp,
                    (0, mithril_1.default)('.pf-ftrace-namebox', (0, mithril_1.default)('.pf-ftrace-colorbox', { style: { background: color } }), name),
                    cpu,
                    process,
                    args,
                ],
            };
        });
    }
    renderTitle() {
        if (this.data) {
            const { numEvents } = this.data;
            return `Ftrace Events (${numEvents})`;
        }
        else {
            return 'Ftrace Events';
        }
    }
    renderFilterPanel(attrs) {
        if (attrs.cache.state !== 'valid') {
            return (0, mithril_1.default)(button_1.Button, {
                label: 'Filter',
                disabled: true,
                loading: true,
            });
        }
        const excludeList = attrs.filterStore.state.excludeList;
        const options = attrs.cache.counters.map(({ name, count }) => {
            return {
                id: name,
                name: `${name} (${count})`,
                checked: !excludeList.some((excluded) => excluded === name),
            };
        });
        return (0, mithril_1.default)(multiselect_1.PopupMultiSelect, {
            label: 'Filter',
            icon: 'filter_list_alt',
            popupPosition: popup_1.PopupPosition.Top,
            options,
            onChange: (diffs) => {
                const newList = new Set(excludeList);
                diffs.forEach(({ checked, id }) => {
                    if (checked) {
                        newList.delete(id);
                    }
                    else {
                        newList.add(id);
                    }
                });
                attrs.filterStore.edit((draft) => {
                    draft.excludeList = Array.from(newList);
                });
            },
        });
    }
}
exports.FtraceExplorer = FtraceExplorer;
async function lookupFtraceEvents(trace, offset, count, filter) {
    const { start, end } = trace.timeline.visibleWindow.toTimeSpan();
    const excludeList = filter.excludeList;
    const excludeListSql = excludeList.map((s) => `'${s}'`).join(',');
    // TODO(stevegolton): This query can be slow when traces are huge.
    // The number of events is only used for correctly sizing the panel's
    // scroll container so that the scrollbar works as if the panel were fully
    // populated.
    // Perhaps we could work out some UX that doesn't need this.
    let queryRes = await trace.engine.query(`
    select count(id) as numEvents
    from ftrace_event
    where
      ftrace_event.name not in (${excludeListSql}) and
      ts >= ${start} and ts <= ${end}
    `);
    const { numEvents } = queryRes.firstRow({ numEvents: query_result_1.NUM });
    queryRes = await trace.engine.query(`
    select
      ftrace_event.id as id,
      ftrace_event.ts as ts,
      ftrace_event.name as name,
      ftrace_event.cpu as cpu,
      thread.name as thread,
      process.name as process,
      to_ftrace(ftrace_event.id) as args
    from ftrace_event
    join thread using (utid)
    left join process on thread.upid = process.upid
    where
      ftrace_event.name not in (${excludeListSql}) and
      ts >= ${start} and ts <= ${end}
    order by id
    limit ${count} offset ${offset};`);
    const events = [];
    const it = queryRes.iter({
        id: query_result_1.NUM,
        ts: query_result_1.LONG,
        name: query_result_1.STR,
        cpu: query_result_1.NUM,
        thread: query_result_1.STR_NULL,
        process: query_result_1.STR_NULL,
        args: query_result_1.STR,
    });
    for (let row = 0; it.valid(); it.next(), row++) {
        events.push({
            id: it.id,
            ts: time_1.Time.fromRaw(it.ts),
            name: it.name,
            cpu: it.cpu,
            thread: it.thread,
            process: it.process,
            args: it.args,
        });
    }
    return { events, offset, numEvents };
}
//# sourceMappingURL=ftrace_explorer.js.map