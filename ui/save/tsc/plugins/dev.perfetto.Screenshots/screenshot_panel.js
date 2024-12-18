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
exports.ScreenshotDetailsPanel = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const logging_1 = require("../../base/logging");
const utils_1 = require("../../base/utils");
const slice_1 = require("../../components/sql_utils/slice");
const core_types_1 = require("../../components/sql_utils/core_types");
class ScreenshotDetailsPanel {
    engine;
    sliceDetails;
    constructor(engine) {
        this.engine = engine;
    }
    async load(selection) {
        this.sliceDetails = await (0, slice_1.getSlice)(this.engine, (0, core_types_1.asSliceSqlId)(selection.eventId));
    }
    render() {
        if (!(0, utils_1.exists)(this.sliceDetails) ||
            !(0, utils_1.exists)(this.sliceDetails.args) ||
            this.sliceDetails.args.length == 0) {
            return (0, mithril_1.default)('h2', 'Loading Screenshot');
        }
        (0, logging_1.assertTrue)(this.sliceDetails.args[0].key == 'screenshot.jpg_image');
        return (0, mithril_1.default)('.screenshot-panel', (0, mithril_1.default)('img', {
            src: 'data:image/png;base64, ' + this.sliceDetails.args[0].displayValue,
        }));
    }
}
exports.ScreenshotDetailsPanel = ScreenshotDetailsPanel;
//# sourceMappingURL=screenshot_panel.js.map