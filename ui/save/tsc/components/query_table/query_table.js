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
exports.QueryTable = void 0;
exports.isSliceish = isSliceish;
exports.getSliceId = getSliceId;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const bigint_math_1 = require("../../base/bigint_math");
const clipboard_1 = require("../../base/clipboard");
const object_utils_1 = require("../../base/object_utils");
const time_1 = require("../../base/time");
const anchor_1 = require("../../widgets/anchor");
const button_1 = require("../../widgets/button");
const callout_1 = require("../../widgets/callout");
const details_shell_1 = require("../../widgets/details_shell");
const download_utils_1 = require("../../base/download_utils");
const router_1 = require("../../core/router");
const scroll_helper_1 = require("../../public/scroll_helper");
const app_impl_1 = require("../../core/app_impl");
function isIntegral(x) {
    return (typeof x === 'bigint' || (typeof x === 'number' && Number.isInteger(x)));
}
function hasTs(row) {
    return 'ts' in row && isIntegral(row.ts);
}
function hasDur(row) {
    return 'dur' in row && isIntegral(row.dur);
}
function hasTrackId(row) {
    return 'track_id' in row && isIntegral(row.track_id);
}
function hasType(row) {
    return 'type' in row && (0, object_utils_1.isString)(row.type);
}
function hasId(row) {
    return 'id' in row && isIntegral(row.id);
}
function hasSliceId(row) {
    return 'slice_id' in row && isIntegral(row.slice_id);
}
function isSliceish(row) {
    return hasTs(row) && hasDur(row) && hasTrackId(row);
}
// Attempts to extract a slice ID from a row, or undefined if none can be found
function getSliceId(row) {
    if (hasType(row) && row.type.includes('slice')) {
        if (hasId(row)) {
            return Number(row.id);
        }
    }
    else {
        if (hasSliceId(row)) {
            return Number(row.slice_id);
        }
    }
    return undefined;
}
class QueryTableRow {
    trace;
    constructor({ attrs }) {
        this.trace = attrs.trace;
    }
    view(vnode) {
        const { row, columns } = vnode.attrs;
        const cells = columns.map((col) => this.renderCell(col, row[col]));
        // TODO(dproy): Make click handler work from analyze page.
        if (router_1.Router.parseUrl(window.location.href).page === '/viewer' &&
            isSliceish(row)) {
            return (0, mithril_1.default)('tr', {
                onclick: () => this.selectAndRevealSlice(row, false),
                // TODO(altimin): Consider improving the logic here (e.g. delay?) to
                // account for cases when dblclick fires late.
                ondblclick: () => this.selectAndRevealSlice(row, true),
                clickable: true,
                title: 'Go to slice',
            }, cells);
        }
        else {
            return (0, mithril_1.default)('tr', cells);
        }
    }
    renderCell(name, value) {
        if (value instanceof Uint8Array) {
            return (0, mithril_1.default)('td', this.renderBlob(name, value));
        }
        else {
            return (0, mithril_1.default)('td', `${value}`);
        }
    }
    renderBlob(name, value) {
        return (0, mithril_1.default)(anchor_1.Anchor, {
            onclick: () => (0, download_utils_1.downloadData)(`${name}.blob`, value),
        }, `Blob (${value.length} bytes)`);
    }
    selectAndRevealSlice(row, switchToCurrentSelectionTab) {
        const trackId = Number(row.track_id);
        const sliceStart = time_1.Time.fromRaw(BigInt(row.ts));
        // row.dur can be negative. Clamp to 1ns.
        const sliceDur = bigint_math_1.BigintMath.max(BigInt(row.dur), 1n);
        const trackUri = this.trace.tracks.findTrack((td) => td.tags?.trackIds?.includes(trackId))?.uri;
        if (trackUri !== undefined) {
            (0, scroll_helper_1.scrollTo)({
                track: { uri: trackUri, expandGroup: true },
                time: { start: sliceStart, end: time_1.Time.add(sliceStart, sliceDur) },
            });
            const sliceId = getSliceId(row);
            if (sliceId !== undefined) {
                this.selectSlice(sliceId, switchToCurrentSelectionTab);
            }
        }
    }
    selectSlice(sliceId, switchToCurrentSelectionTab) {
        this.trace.selection.selectSqlEvent('slice', sliceId, {
            switchToCurrentSelectionTab,
            scrollToSelection: true,
        });
    }
}
class QueryTableContent {
    previousResponse;
    onbeforeupdate(vnode) {
        return vnode.attrs.resp !== this.previousResponse;
    }
    view(vnode) {
        const resp = vnode.attrs.resp;
        this.previousResponse = resp;
        const cols = [];
        for (const col of resp.columns) {
            cols.push((0, mithril_1.default)('td', col));
        }
        const tableHeader = (0, mithril_1.default)('tr', cols);
        const rows = resp.rows.map((row) => (0, mithril_1.default)(QueryTableRow, { trace: vnode.attrs.trace, row, columns: resp.columns }));
        if (resp.error) {
            return (0, mithril_1.default)('.query-error', `SQL error: ${resp.error}`);
        }
        else {
            return (0, mithril_1.default)('table.pf-query-table', (0, mithril_1.default)('thead', tableHeader), (0, mithril_1.default)('tbody', rows));
        }
    }
}
class QueryTable {
    trace;
    constructor({ attrs }) {
        this.trace = attrs.trace;
    }
    view({ attrs }) {
        const { resp, query, contextButtons = [], fillParent } = attrs;
        return (0, mithril_1.default)(details_shell_1.DetailsShell, {
            title: this.renderTitle(resp),
            description: query,
            buttons: this.renderButtons(query, contextButtons, resp),
            fillParent,
        }, resp && this.renderTableContent(resp));
    }
    renderTitle(resp) {
        if (!resp) {
            return 'Query - running';
        }
        const result = resp.error ? 'error' : `${resp.rows.length} rows`;
        if (app_impl_1.AppImpl.instance.testingMode) {
            // Omit the duration in tests, they cause screenshot diff failures.
            return `Query result (${result})`;
        }
        return `Query result (${result}) - ${resp.durationMs.toLocaleString()}ms`;
    }
    renderButtons(query, contextButtons, resp) {
        return [
            contextButtons,
            (0, mithril_1.default)(button_1.Button, {
                label: 'Copy query',
                onclick: () => {
                    (0, clipboard_1.copyToClipboard)(query);
                },
            }),
            resp &&
                resp.error === undefined &&
                (0, mithril_1.default)(button_1.Button, {
                    label: 'Copy result (.tsv)',
                    onclick: () => {
                        queryResponseToClipboard(resp);
                    },
                }),
        ];
    }
    renderTableContent(resp) {
        return (0, mithril_1.default)('.pf-query-panel', resp.statementWithOutputCount > 1 &&
            (0, mithril_1.default)('.pf-query-warning', (0, mithril_1.default)(callout_1.Callout, { icon: 'warning' }, `${resp.statementWithOutputCount} out of ${resp.statementCount} `, 'statements returned a result. ', 'Only the results for the last statement are displayed.')), (0, mithril_1.default)(QueryTableContent, { trace: this.trace, resp }));
    }
}
exports.QueryTable = QueryTable;
async function queryResponseToClipboard(resp) {
    const lines = [];
    lines.push(resp.columns);
    for (const row of resp.rows) {
        const line = [];
        for (const col of resp.columns) {
            const value = row[col];
            line.push(value === null ? 'NULL' : `${value}`);
        }
        lines.push(line);
    }
    (0, clipboard_1.copyToClipboard)(lines.map((line) => line.join('\t')).join('\n'));
}
//# sourceMappingURL=query_table.js.map