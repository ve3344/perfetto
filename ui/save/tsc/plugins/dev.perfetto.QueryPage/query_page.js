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
exports.QueryPage = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const resize_observer_1 = require("../../base/resize_observer");
const string_utils_1 = require("../../base/string_utils");
const queries_1 = require("../../components/query_table/queries");
const callout_1 = require("../../widgets/callout");
const editor_1 = require("../../widgets/editor");
const query_history_1 = require("./query_history");
const query_result_tab_1 = require("../../components/query_table/query_result_tab");
const query_table_1 = require("../../components/query_table/query_table");
const state = {
    enteredText: '',
    heightPx: '100px',
    generation: 0,
};
function runManualQuery(trace, query) {
    state.executedQuery = query;
    state.queryResult = undefined;
    (0, queries_1.runQuery)((0, string_utils_1.undoCommonChatAppReplacements)(query), trace.engine).then((resp) => {
        (0, query_result_tab_1.addQueryResultsTab)(trace, {
            query: query,
            title: 'Standalone Query',
            prefetchedResponse: resp,
        }, 'analyze_page_query');
        // We might have started to execute another query. Ignore it in that
        // case.
        if (state.executedQuery !== query) {
            return;
        }
        state.queryResult = resp;
        trace.scheduleFullRedraw();
    });
}
class QueryInput {
    resize;
    oncreate({ dom }) {
        this.resize = new resize_observer_1.SimpleResizeObserver(dom, () => {
            state.heightPx = dom.style.height;
        });
        dom.style.height = state.heightPx;
    }
    onremove() {
        if (this.resize) {
            this.resize[Symbol.dispose]();
            this.resize = undefined;
        }
    }
    view({ attrs }) {
        return (0, mithril_1.default)(editor_1.Editor, {
            generation: state.generation,
            initialText: state.enteredText,
            onExecute: (text) => {
                if (!text) {
                    return;
                }
                query_history_1.queryHistoryStorage.saveQuery(text);
                runManualQuery(attrs.trace, text);
            },
            onUpdate: (text) => {
                state.enteredText = text;
                attrs.trace.scheduleFullRedraw();
            },
        });
    }
}
class QueryPage {
    view({ attrs }) {
        return (0, mithril_1.default)('.query-page', (0, mithril_1.default)(callout_1.Callout, 'Enter query and press Cmd/Ctrl + Enter'), state.enteredText.includes('"') &&
            (0, mithril_1.default)(callout_1.Callout, { icon: 'warning' }, `" (double quote) character observed in query; if this is being used to ` +
                `define a string, please use ' (single quote) instead. Using double quotes ` +
                `can cause subtle problems which are very hard to debug.`), (0, mithril_1.default)(QueryInput, attrs), state.executedQuery === undefined
            ? null
            : (0, mithril_1.default)(query_table_1.QueryTable, {
                trace: attrs.trace,
                query: state.executedQuery,
                resp: state.queryResult,
                fillParent: false,
            }), (0, mithril_1.default)(query_history_1.QueryHistoryComponent, {
            trace: attrs.trace,
            runQuery: (q) => runManualQuery(attrs.trace, q),
            setQuery: (q) => {
                state.enteredText = q;
                state.generation++;
                attrs.trace.scheduleFullRedraw();
            },
        }));
    }
}
exports.QueryPage = QueryPage;
//# sourceMappingURL=query_page.js.map