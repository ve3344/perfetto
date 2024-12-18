"use strict";
// Copyright (C) 2019 The Android Open Source Project
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
exports.LogsFilters = exports.LOG_PRIORITIES = exports.LogPanel = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const time_1 = require("../../base/time");
const details_shell_1 = require("../../widgets/details_shell");
const timestamp_1 = require("../../components/widgets/timestamp");
const query_result_1 = require("../../trace_processor/query_result");
const monitor_1 = require("../../base/monitor");
const async_limiter_1 = require("../../base/async_limiter");
const query_utils_1 = require("../../trace_processor/query_utils");
const select_1 = require("../../widgets/select");
const button_1 = require("../../widgets/button");
const text_input_1 = require("../../widgets/text_input");
const virtual_table_1 = require("../../widgets/virtual_table");
const classnames_1 = require("../../base/classnames");
const tag_input_1 = require("../../widgets/tag_input");
const ROW_H = 20;
class LogPanel {
    entries;
    pagination = {
        offset: 0,
        count: 0,
    };
    rowsMonitor;
    filterMonitor;
    queryLimiter = new async_limiter_1.AsyncLimiter();
    constructor({ attrs }) {
        this.rowsMonitor = new monitor_1.Monitor([
            () => attrs.filterStore.state,
            () => attrs.trace.timeline.visibleWindow.toTimeSpan().start,
            () => attrs.trace.timeline.visibleWindow.toTimeSpan().end,
        ]);
        this.filterMonitor = new monitor_1.Monitor([() => attrs.filterStore.state]);
    }
    view({ attrs }) {
        if (this.rowsMonitor.ifStateChanged()) {
            this.reloadData(attrs);
        }
        const hasProcessNames = this.entries &&
            this.entries.processName.filter((name) => name).length > 0;
        const totalEvents = this.entries?.totalEvents ?? 0;
        return (0, mithril_1.default)(details_shell_1.DetailsShell, {
            title: 'Android Logs',
            description: `Total messages: ${totalEvents}`,
            buttons: (0, mithril_1.default)(LogsFilters, { trace: attrs.trace, store: attrs.filterStore }),
        }, (0, mithril_1.default)(virtual_table_1.VirtualTable, {
            className: 'pf-android-logs-table',
            columns: [
                { header: 'Timestamp', width: '13em' },
                { header: 'Level', width: '4em' },
                { header: 'Tag', width: '13em' },
                ...(hasProcessNames ? [{ header: 'Process', width: '18em' }] : []),
                // '' means column width can vary depending on the content.
                // This works as this is the last column, but using this for other
                // columns will pull the columns to the right out of line.
                { header: 'Message', width: '' },
            ],
            rows: this.renderRows(hasProcessNames),
            firstRowOffset: this.entries?.offset ?? 0,
            numRows: this.entries?.totalEvents ?? 0,
            rowHeight: ROW_H,
            onReload: (offset, count) => {
                this.pagination = { offset, count };
                this.reloadData(attrs);
            },
            onRowHover: (id) => {
                const timestamp = this.entries?.timestamps[id];
                if (timestamp !== undefined) {
                    attrs.trace.timeline.hoverCursorTimestamp = timestamp;
                }
            },
            onRowOut: () => {
                attrs.trace.timeline.hoverCursorTimestamp = undefined;
            },
        }));
    }
    reloadData(attrs) {
        this.queryLimiter.schedule(async () => {
            const visibleSpan = attrs.trace.timeline.visibleWindow.toTimeSpan();
            if (this.filterMonitor.ifStateChanged()) {
                await updateLogView(attrs.trace.engine, attrs.filterStore.state);
            }
            this.entries = await updateLogEntries(attrs.trace.engine, visibleSpan, this.pagination);
            attrs.trace.scheduleFullRedraw();
        });
    }
    renderRows(hasProcessNames) {
        if (!this.entries) {
            return [];
        }
        const timestamps = this.entries.timestamps;
        const priorities = this.entries.priorities;
        const tags = this.entries.tags;
        const messages = this.entries.messages;
        const processNames = this.entries.processName;
        const rows = [];
        for (let i = 0; i < this.entries.timestamps.length; i++) {
            const priorityLetter = exports.LOG_PRIORITIES[priorities[i]][0];
            const ts = timestamps[i];
            const prioClass = priorityLetter ?? '';
            rows.push({
                id: i,
                className: (0, classnames_1.classNames)(prioClass, this.entries.isHighlighted[i] && 'pf-highlighted'),
                cells: [
                    (0, mithril_1.default)(timestamp_1.Timestamp, { ts }),
                    priorityLetter || '?',
                    tags[i],
                    ...(hasProcessNames ? [processNames[i]] : []),
                    messages[i],
                ],
            });
        }
        return rows;
    }
}
exports.LogPanel = LogPanel;
exports.LOG_PRIORITIES = [
    '-',
    '-',
    'Verbose',
    'Debug',
    'Info',
    'Warn',
    'Error',
    'Fatal',
];
const IGNORED_STATES = 2;
class LogPriorityWidget {
    view(vnode) {
        const attrs = vnode.attrs;
        const optionComponents = [];
        for (let i = IGNORED_STATES; i < attrs.options.length; i++) {
            const selected = i === attrs.selectedIndex;
            optionComponents.push((0, mithril_1.default)('option', { value: i, selected }, attrs.options[i]));
        }
        return (0, mithril_1.default)(select_1.Select, {
            onchange: (e) => {
                const selectionValue = e.target.value;
                attrs.onSelect(Number(selectionValue));
                attrs.trace.scheduleFullRedraw();
            },
        }, optionComponents);
    }
}
class LogTextWidget {
    view({ attrs }) {
        return (0, mithril_1.default)(text_input_1.TextInput, {
            placeholder: 'Search logs...',
            onkeyup: (e) => {
                // We want to use the value of the input field after it has been
                // updated with the latest key (onkeyup).
                const htmlElement = e.target;
                attrs.onChange(htmlElement.value);
                attrs.trace.scheduleFullRedraw();
            },
        });
    }
}
class FilterByTextWidget {
    view({ attrs }) {
        const icon = attrs.hideNonMatching ? 'unfold_less' : 'unfold_more';
        const tooltip = attrs.hideNonMatching
            ? 'Expand all and view highlighted'
            : 'Collapse all';
        return (0, mithril_1.default)(button_1.Button, {
            icon,
            title: tooltip,
            disabled: attrs.disabled,
            onclick: attrs.onClick,
        });
    }
}
class LogsFilters {
    view({ attrs }) {
        return [
            (0, mithril_1.default)('.log-label', 'Log Level'),
            (0, mithril_1.default)(LogPriorityWidget, {
                trace: attrs.trace,
                options: exports.LOG_PRIORITIES,
                selectedIndex: attrs.store.state.minimumLevel,
                onSelect: (minimumLevel) => {
                    attrs.store.edit((draft) => {
                        draft.minimumLevel = minimumLevel;
                    });
                },
            }),
            (0, mithril_1.default)(tag_input_1.TagInput, {
                placeholder: 'Filter by tag...',
                tags: attrs.store.state.tags,
                onTagAdd: (tag) => {
                    attrs.store.edit((draft) => {
                        draft.tags.push(tag);
                    });
                },
                onTagRemove: (index) => {
                    attrs.store.edit((draft) => {
                        draft.tags.splice(index, 1);
                    });
                },
            }),
            (0, mithril_1.default)(LogTextWidget, {
                trace: attrs.trace,
                onChange: (text) => {
                    attrs.store.edit((draft) => {
                        draft.textEntry = text;
                    });
                },
            }),
            (0, mithril_1.default)(FilterByTextWidget, {
                hideNonMatching: attrs.store.state.hideNonMatching,
                onClick: () => {
                    attrs.store.edit((draft) => {
                        draft.hideNonMatching = !draft.hideNonMatching;
                    });
                },
                disabled: attrs.store.state.textEntry === '',
            }),
        ];
    }
}
exports.LogsFilters = LogsFilters;
async function updateLogEntries(engine, span, pagination) {
    const rowsResult = await engine.query(`
        select
          ts,
          prio,
          ifnull(tag, '[NULL]') as tag,
          ifnull(msg, '[NULL]') as msg,
          is_msg_highlighted as isMsgHighlighted,
          is_process_highlighted as isProcessHighlighted,
          ifnull(process_name, '') as processName
        from filtered_logs
        where ts >= ${span.start} and ts <= ${span.end}
        order by ts
        limit ${pagination.offset}, ${pagination.count}
    `);
    const timestamps = [];
    const priorities = [];
    const tags = [];
    const messages = [];
    const isHighlighted = [];
    const processName = [];
    const it = rowsResult.iter({
        ts: query_result_1.LONG,
        prio: query_result_1.NUM,
        tag: query_result_1.STR,
        msg: query_result_1.STR,
        isMsgHighlighted: query_result_1.NUM_NULL,
        isProcessHighlighted: query_result_1.NUM,
        processName: query_result_1.STR,
    });
    for (; it.valid(); it.next()) {
        timestamps.push(time_1.Time.fromRaw(it.ts));
        priorities.push(it.prio);
        tags.push(it.tag);
        messages.push(it.msg);
        isHighlighted.push(it.isMsgHighlighted === 1 || it.isProcessHighlighted === 1);
        processName.push(it.processName);
    }
    const queryRes = await engine.query(`
    select
      count(*) as totalEvents
    from filtered_logs
    where ts >= ${span.start} and ts <= ${span.end}
  `);
    const { totalEvents } = queryRes.firstRow({ totalEvents: query_result_1.NUM });
    return {
        offset: pagination.offset,
        timestamps,
        priorities,
        tags,
        messages,
        isHighlighted,
        processName,
        totalEvents,
    };
}
async function updateLogView(engine, filter) {
    await engine.query('drop view if exists filtered_logs');
    const globMatch = composeGlobMatch(filter.hideNonMatching, filter.textEntry);
    let selectedRows = `select prio, ts, tag, msg,
      process.name as process_name, ${globMatch}
      from android_logs
      left join thread using(utid)
      left join process using(upid)
      where prio >= ${filter.minimumLevel}`;
    if (filter.tags.length) {
        selectedRows += ` and tag in (${serializeTags(filter.tags)})`;
    }
    // We extract only the rows which will be visible.
    await engine.query(`create view filtered_logs as select *
    from (${selectedRows})
    where is_msg_chosen is 1 or is_process_chosen is 1`);
}
function serializeTags(tags) {
    return tags.map((tag) => (0, query_utils_1.escapeQuery)(tag)).join();
}
function composeGlobMatch(isCollaped, textEntry) {
    if (isCollaped) {
        // If the entries are collapsed, we won't highlight any lines.
        return `msg glob ${(0, query_utils_1.escapeGlob)(textEntry)} as is_msg_chosen,
      (process.name is not null and process.name glob ${(0, query_utils_1.escapeGlob)(textEntry)}) as is_process_chosen,
      0 as is_msg_highlighted,
      0 as is_process_highlighted`;
    }
    else if (!textEntry) {
        // If there is no text entry, we will show all lines, but won't highlight.
        // any.
        return `1 as is_msg_chosen,
      1 as is_process_chosen,
      0 as is_msg_highlighted,
      0 as is_process_highlighted`;
    }
    else {
        return `1 as is_msg_chosen,
      1 as is_process_chosen,
      msg glob ${(0, query_utils_1.escapeGlob)(textEntry)} as is_msg_highlighted,
      (process.name is not null and process.name glob ${(0, query_utils_1.escapeGlob)(textEntry)}) as is_process_highlighted`;
    }
}
//# sourceMappingURL=logs_panel.js.map