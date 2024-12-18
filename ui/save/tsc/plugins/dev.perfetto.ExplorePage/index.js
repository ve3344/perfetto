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
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const explore_page_1 = require("./explore_page");
const dev_perfetto_SqlModules_1 = tslib_1.__importDefault(require("../dev.perfetto.SqlModules"));
class default_1 {
    static id = 'dev.perfetto.ExplorePage';
    static dependencies = [dev_perfetto_SqlModules_1.default];
    // The following allows us to have persistent
    // state/charts for the lifecycle of a single
    // trace.
    state = {};
    charts = new Set();
    async onTraceLoad(trace) {
        trace.pages.registerPage({
            route: '/explore',
            page: {
                view: ({ attrs }) => (0, mithril_1.default)(explore_page_1.ExplorePage, {
                    ...attrs,
                    state: this.state,
                    charts: this.charts,
                }),
            },
        });
        trace.sidebar.addMenuItem({
            section: 'current_trace',
            text: 'Explore',
            href: '#!/explore',
            icon: 'data_exploration',
        });
    }
}
exports.default = default_1;
//# sourceMappingURL=index.js.map