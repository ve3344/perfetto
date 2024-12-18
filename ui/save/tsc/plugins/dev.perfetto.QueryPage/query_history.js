"use strict";
// Copyright (C) 2022 The Android Open Source Project
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
exports.queryHistoryStorage = exports.HistoryItemComponent = exports.QueryHistoryComponent = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const semantic_icons_1 = require("../../base/semantic_icons");
const logging_1 = require("../../base/logging");
const icon_1 = require("../../widgets/icon");
const zod_1 = require("zod");
const QUERY_HISTORY_KEY = 'queryHistory';
class QueryHistoryComponent {
    view({ attrs }) {
        const runQuery = attrs.runQuery;
        const setQuery = attrs.setQuery;
        const unstarred = [];
        const starred = [];
        for (let i = exports.queryHistoryStorage.data.length - 1; i >= 0; i--) {
            const entry = exports.queryHistoryStorage.data[i];
            const arr = entry.starred ? starred : unstarred;
            arr.push({ trace: attrs.trace, index: i, entry, runQuery, setQuery });
        }
        return (0, mithril_1.default)('.query-history', (0, mithril_1.default)('header.overview', `Query history (${exports.queryHistoryStorage.data.length} queries)`), starred.map((attrs) => (0, mithril_1.default)(HistoryItemComponent, attrs)), unstarred.map((attrs) => (0, mithril_1.default)(HistoryItemComponent, attrs)));
    }
}
exports.QueryHistoryComponent = QueryHistoryComponent;
class HistoryItemComponent {
    view(vnode) {
        const query = vnode.attrs.entry.query;
        return (0, mithril_1.default)('.history-item', (0, mithril_1.default)('.history-item-buttons', (0, mithril_1.default)('button', {
            onclick: () => {
                exports.queryHistoryStorage.setStarred(vnode.attrs.index, !vnode.attrs.entry.starred);
                vnode.attrs.trace.scheduleFullRedraw();
            },
        }, (0, mithril_1.default)(icon_1.Icon, { icon: semantic_icons_1.Icons.Star, filled: vnode.attrs.entry.starred })), (0, mithril_1.default)('button', {
            onclick: () => vnode.attrs.setQuery(query),
        }, (0, mithril_1.default)(icon_1.Icon, { icon: 'edit' })), (0, mithril_1.default)('button', {
            onclick: () => vnode.attrs.runQuery(query),
        }, (0, mithril_1.default)(icon_1.Icon, { icon: 'play_arrow' })), (0, mithril_1.default)('button', {
            onclick: () => {
                exports.queryHistoryStorage.remove(vnode.attrs.index);
                vnode.attrs.trace.scheduleFullRedraw();
            },
        }, (0, mithril_1.default)(icon_1.Icon, { icon: 'delete' }))), (0, mithril_1.default)('pre', {
            onclick: () => vnode.attrs.setQuery(query),
            ondblclick: () => vnode.attrs.runQuery(query),
        }, query));
    }
}
exports.HistoryItemComponent = HistoryItemComponent;
class HistoryStorage {
    data;
    maxItems = 50;
    constructor() {
        this.data = this.load();
    }
    saveQuery(query) {
        const items = this.data;
        let firstUnstarred = -1;
        let countUnstarred = 0;
        for (let i = 0; i < items.length; i++) {
            if (!items[i].starred) {
                countUnstarred++;
                if (firstUnstarred === -1) {
                    firstUnstarred = i;
                }
            }
            if (items[i].query === query) {
                // Query is already in the history, no need to save
                return;
            }
        }
        if (countUnstarred >= this.maxItems) {
            (0, logging_1.assertTrue)(firstUnstarred !== -1);
            items.splice(firstUnstarred, 1);
        }
        items.push({ query, starred: false });
        this.save();
    }
    setStarred(index, starred) {
        (0, logging_1.assertTrue)(index >= 0 && index < this.data.length);
        this.data[index].starred = starred;
        this.save();
    }
    remove(index) {
        (0, logging_1.assertTrue)(index >= 0 && index < this.data.length);
        this.data.splice(index, 1);
        this.save();
    }
    load() {
        const value = window.localStorage.getItem(QUERY_HISTORY_KEY);
        if (value === null) {
            return [];
        }
        const res = QUERY_HISTORY_SCHEMA.safeParse(JSON.parse(value));
        return res.success ? res.data : [];
    }
    save() {
        window.localStorage.setItem(QUERY_HISTORY_KEY, JSON.stringify(this.data));
    }
}
const QUERY_HISTORY_ENTRY_SCHEMA = zod_1.z.object({
    query: zod_1.z.string(),
    starred: zod_1.z.boolean().default(false),
});
const QUERY_HISTORY_SCHEMA = zod_1.z.array(QUERY_HISTORY_ENTRY_SCHEMA);
exports.queryHistoryStorage = new HistoryStorage();
//# sourceMappingURL=query_history.js.map