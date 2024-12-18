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
exports.VisualizedArgsTrack = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const button_1 = require("../../widgets/button");
const semantic_icons_1 = require("../../base/semantic_icons");
const thread_slice_track_1 = require("./thread_slice_track");
const uuid_1 = require("../../base/uuid");
const sql_utils_1 = require("../../trace_processor/sql_utils");
class VisualizedArgsTrack extends thread_slice_track_1.ThreadSliceTrack {
    viewName;
    argName;
    onClose;
    constructor({ uri, trace, trackId, maxDepth, argName, onClose, }) {
        const uuid = (0, uuid_1.uuidv4Sql)();
        const escapedArgName = argName.replace(/[^a-zA-Z]/g, '_');
        const viewName = `__arg_visualisation_helper_${escapedArgName}_${uuid}_slice`;
        super(trace, uri, trackId, maxDepth, viewName);
        this.viewName = viewName;
        this.argName = argName;
        this.onClose = onClose;
    }
    async onInit() {
        return await (0, sql_utils_1.createView)(this.engine, this.viewName, `
        with slice_with_arg as (
          select
            slice.id,
            slice.track_id,
            slice.ts,
            slice.dur,
            slice.thread_dur,
            NULL as cat,
            args.display_value as name
          from slice
          join args using (arg_set_id)
          where args.key='${this.argName}'
        )
        select
          *,
          (select count()
          from ancestor_slice(s1.id) s2
          join slice_with_arg s3 on s2.id=s3.id
          ) as depth
        from slice_with_arg s1
        order by id
      `);
    }
    getTrackShellButtons() {
        return (0, mithril_1.default)(button_1.Button, {
            onclick: () => this.onClose(),
            icon: semantic_icons_1.Icons.Close,
            title: 'Close all visualised args tracks for this arg',
            compact: true,
        });
    }
}
exports.VisualizedArgsTrack = VisualizedArgsTrack;
//# sourceMappingURL=visualized_args_track.js.map