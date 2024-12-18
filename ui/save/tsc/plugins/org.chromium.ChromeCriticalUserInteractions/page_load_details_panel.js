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
exports.PageLoadDetailsPanel = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const details_1 = require("../../components/widgets/sql/details/details");
const details_shell_1 = require("../../widgets/details_shell");
const grid_layout_1 = require("../../widgets/grid_layout");
var d = details_1.DetailsSchema;
class PageLoadDetailsPanel {
    trace;
    data;
    constructor(trace, id) {
        this.trace = trace;
        this.data = new details_1.Details(this.trace, 'chrome_page_loads', id, {
            'Navigation start': d.Timestamp('navigation_start_ts'),
            'FCP event': d.Timestamp('fcp_ts'),
            'FCP': d.Interval('navigation_start_ts', 'fcp'),
            'LCP event': d.Timestamp('lcp_ts', { skipIfNull: true }),
            'LCP': d.Interval('navigation_start_ts', 'lcp', { skipIfNull: true }),
            'DOMContentLoaded': d.Timestamp('dom_content_loaded_event_ts', {
                skipIfNull: true,
            }),
            'onload timestamp': d.Timestamp('load_event_ts', { skipIfNull: true }),
            'performance.mark timings': d.Dict({
                data: {
                    'Fully loaded': d.Timestamp('mark_fully_loaded_ts', {
                        skipIfNull: true,
                    }),
                    'Fully visible': d.Timestamp('mark_fully_visible_ts', {
                        skipIfNull: true,
                    }),
                    'Interactive': d.Timestamp('mark_interactive_ts', {
                        skipIfNull: true,
                    }),
                },
                skipIfEmpty: true,
            }),
            'Navigation ID': 'navigation_id',
            'Browser process': d.SqlIdRef('process', 'browser_upid'),
            'URL': d.URLValue('url'),
        });
    }
    render() {
        return (0, mithril_1.default)(details_shell_1.DetailsShell, {
            title: 'Chrome Page Load',
        }, (0, mithril_1.default)(grid_layout_1.GridLayout, (0, mithril_1.default)(grid_layout_1.GridLayoutColumn, this.data.render())));
    }
}
exports.PageLoadDetailsPanel = PageLoadDetailsPanel;
//# sourceMappingURL=page_load_details_panel.js.map