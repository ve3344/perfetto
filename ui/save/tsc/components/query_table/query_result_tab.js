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
exports.QueryResultTab = void 0;
exports.addQueryResultsTab = addQueryResultsTab;
exports.uuidToViewName = uuidToViewName;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const uuid_1 = require("uuid");
const logging_1 = require("../../base/logging");
const queries_1 = require("./queries");
const query_result_1 = require("../../trace_processor/query_result");
const add_debug_track_menu_1 = require("../tracks/add_debug_track_menu");
const button_1 = require("../../widgets/button");
const menu_1 = require("../../widgets/menu");
const popup_1 = require("../../widgets/popup");
const query_table_1 = require("./query_table");
// External interface for adding a new query results tab
// Automatically decided whether to add v1 or v2 tab
function addQueryResultsTab(trace, config, tag) {
    const queryResultsTab = new QueryResultTab(trace, config);
    const uri = 'queryResults#' + (tag ?? (0, uuid_1.v4)());
    trace.tabs.registerTab({
        uri,
        content: queryResultsTab,
        isEphemeral: true,
    });
    trace.tabs.showTab(uri);
}
class QueryResultTab {
    trace;
    args;
    queryResponse;
    sqlViewName;
    constructor(trace, args) {
        this.trace = trace;
        this.args = args;
        this.initTrack();
    }
    async initTrack() {
        if (this.args.prefetchedResponse !== undefined) {
            this.queryResponse = this.args.prefetchedResponse;
        }
        else {
            const result = await (0, queries_1.runQuery)(this.args.query, this.trace.engine);
            this.queryResponse = result;
            if (result.error !== undefined) {
                return;
            }
        }
        // TODO(stevegolton): Do we really need to create this view upfront?
        this.sqlViewName = await this.createViewForDebugTrack((0, uuid_1.v4)());
        if (this.sqlViewName) {
            this.trace.scheduleFullRedraw();
        }
    }
    getTitle() {
        const suffix = this.queryResponse
            ? ` (${this.queryResponse.rows.length})`
            : '';
        return `${this.args.title}${suffix}`;
    }
    render() {
        return (0, mithril_1.default)(query_table_1.QueryTable, {
            trace: this.trace,
            query: this.args.query,
            resp: this.queryResponse,
            fillParent: true,
            contextButtons: [
                this.sqlViewName === undefined
                    ? null
                    : (0, mithril_1.default)(menu_1.PopupMenu2, {
                        trigger: (0, mithril_1.default)(button_1.Button, { label: 'Show debug track' }),
                        popupPosition: popup_1.PopupPosition.Top,
                    }, (0, mithril_1.default)(add_debug_track_menu_1.AddDebugTrackMenu, {
                        trace: this.trace,
                        dataSource: {
                            sqlSource: `select * from ${this.sqlViewName}`,
                            columns: (0, logging_1.assertExists)(this.queryResponse).columns,
                        },
                    })),
            ],
        });
    }
    isLoading() {
        return this.queryResponse === undefined;
    }
    async createViewForDebugTrack(uuid) {
        const viewId = uuidToViewName(uuid);
        // Assuming that the query results come from a SELECT query, try creating a
        // view to allow us to reuse it for further queries.
        const hasValidQueryResponse = this.queryResponse && this.queryResponse.error === undefined;
        const sqlQuery = hasValidQueryResponse
            ? this.queryResponse.lastStatementSql
            : this.args.query;
        try {
            const createViewResult = await this.trace.engine.query(`create view ${viewId} as ${sqlQuery}`);
            if (createViewResult.error()) {
                // If it failed, do nothing.
                return '';
            }
        }
        catch (e) {
            if (e instanceof query_result_1.QueryError) {
                // If it failed, do nothing.
                return '';
            }
            throw e;
        }
        return viewId;
    }
}
exports.QueryResultTab = QueryResultTab;
function uuidToViewName(uuid) {
    return `view_${uuid.split('-').join('_')}`;
}
//# sourceMappingURL=query_result_tab.js.map