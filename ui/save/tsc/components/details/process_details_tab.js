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
exports.ProcessDetailsTab = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const details_shell_1 = require("../../widgets/details_shell");
const grid_layout_1 = require("../../widgets/grid_layout");
const section_1 = require("../../widgets/section");
const details_1 = require("../widgets/sql/details/details");
var d = details_1.DetailsSchema;
class ProcessDetailsTab {
    args;
    data;
    // TODO(altimin): Ideally, we would not require the pid to be passed in, but
    // fetch it from the underlying data instead.
    //
    // However, the only place which creates `ProcessDetailsTab` currently is `renderProcessRef`,
    // which already has `pid` available (note that Details is already fetching the data, including
    // the `pid` from the trace processor, but it doesn't expose it for now).
    constructor(args) {
        this.args = args;
        this.data = new details_1.Details(args.trace, 'process', args.upid, {
            'pid': d.Value('pid'),
            'Name': d.Value('name'),
            'Start time': d.Timestamp('start_ts', { skipIfNull: true }),
            'End time': d.Timestamp('end_ts', { skipIfNull: true }),
            'Parent process': d.SqlIdRef('process', 'parent_upid', {
                skipIfNull: true,
            }),
            'User ID': d.Value('uid', { skipIfNull: true }),
            'Android app ID': d.Value('android_appid', { skipIfNull: true }),
            'Command line': d.Value('cmdline', { skipIfNull: true }),
            'Machine id': d.Value('machine_id', { skipIfNull: true }),
            'Args': d.ArgSetId('arg_set_id'),
        });
    }
    render() {
        return (0, mithril_1.default)(details_shell_1.DetailsShell, {
            title: this.getTitle(),
        }, (0, mithril_1.default)(grid_layout_1.GridLayout, (0, mithril_1.default)(grid_layout_1.GridLayoutColumn, (0, mithril_1.default)(section_1.Section, { title: 'Details' }, this.data.render()))));
    }
    getTitle() {
        if (this.args.pid !== undefined) {
            return `Process ${this.args.pid}`;
        }
        return `Process upid:${this.args.upid}`;
    }
}
exports.ProcessDetailsTab = ProcessDetailsTab;
//# sourceMappingURL=process_details_tab.js.map