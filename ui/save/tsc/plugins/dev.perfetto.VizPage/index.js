"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
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
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const viz_page_1 = require("./viz_page");
class default_1 {
    static id = 'dev.perfetto.VizPage';
    spec = '';
    async onTraceLoad(trace) {
        trace.pages.registerPage({
            route: '/viz',
            page: {
                view: ({ attrs }) => (0, mithril_1.default)(viz_page_1.VizPage, {
                    ...attrs,
                    spec: this.spec,
                    setSpec: (spec) => {
                        this.spec = spec;
                    },
                }),
            },
        });
        trace.sidebar.addMenuItem({
            section: 'current_trace',
            text: 'Viz',
            href: '#!/viz',
            icon: 'area_chart',
            sortOrder: 2,
        });
    }
}
exports.default = default_1;
//# sourceMappingURL=index.js.map