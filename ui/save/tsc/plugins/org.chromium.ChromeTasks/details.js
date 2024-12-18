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
exports.ChromeTasksDetailsPanel = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const details_1 = require("../../components/widgets/sql/details/details");
const details_shell_1 = require("../../widgets/details_shell");
const grid_layout_1 = require("../../widgets/grid_layout");
var d = details_1.DetailsSchema;
class ChromeTasksDetailsPanel {
    data;
    constructor(trace, eventId) {
        this.data = new details_1.Details(trace, 'chrome_tasks', eventId, {
            'Task name': 'name',
            'Start time': d.Timestamp('ts'),
            'Duration': d.Interval('ts', 'dur'),
            'Process': d.SqlIdRef('process', 'upid'),
            'Thread': d.SqlIdRef('thread', 'utid'),
            'Slice': d.SqlIdRef('slice', 'id'),
        });
    }
    render() {
        return (0, mithril_1.default)(details_shell_1.DetailsShell, {
            title: 'Chrome Tasks',
        }, (0, mithril_1.default)(grid_layout_1.GridLayout, (0, mithril_1.default)(grid_layout_1.GridLayoutColumn, this.data.render())));
    }
}
exports.ChromeTasksDetailsPanel = ChromeTasksDetailsPanel;
//# sourceMappingURL=details.js.map