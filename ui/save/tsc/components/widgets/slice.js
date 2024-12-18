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
exports.SliceRef = void 0;
exports.sliceRef = sliceRef;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const core_types_1 = require("../sql_utils/core_types");
const anchor_1 = require("../../widgets/anchor");
const semantic_icons_1 = require("../../base/semantic_icons");
const slice_1 = require("../sql_utils/slice");
const sql_ref_renderer_registry_1 = require("./sql/details/sql_ref_renderer_registry");
const app_impl_1 = require("../../core/app_impl");
class SliceRef {
    view(vnode) {
        return (0, mithril_1.default)(anchor_1.Anchor, {
            icon: semantic_icons_1.Icons.UpdateSelection,
            onclick: () => {
                // TODO(primiano): the Trace object should be properly injected here.
                app_impl_1.AppImpl.instance.trace?.selection.selectSqlEvent('slice', vnode.attrs.id, {
                    switchToCurrentSelectionTab: vnode.attrs.switchToCurrentSelectionTab,
                    scrollToSelection: true,
                });
            },
        }, vnode.attrs.name);
    }
}
exports.SliceRef = SliceRef;
function sliceRef(slice, name) {
    return (0, mithril_1.default)(SliceRef, {
        id: slice.id,
        name: name ?? slice.name,
    });
}
sql_ref_renderer_registry_1.sqlIdRegistry['slice'] = (0, sql_ref_renderer_registry_1.createSqlIdRefRenderer)(async (engine, id) => {
    return {
        id,
        slice: await (0, slice_1.getSlice)(engine, (0, core_types_1.asSliceSqlId)(Number(id))),
    };
}, ({ id, slice }) => ({
    value: slice !== undefined ? sliceRef(slice) : `Unknown slice ${id}`,
}));
//# sourceMappingURL=slice.js.map