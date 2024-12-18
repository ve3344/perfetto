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
exports.VizPage = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const editor_1 = require("../../widgets/editor");
const vega_view_1 = require("../../components/widgets/vega_view");
class VizPage {
    engine;
    constructor({ attrs }) {
        this.engine = attrs.trace.engine.getProxy('VizPage');
    }
    view({ attrs }) {
        return (0, mithril_1.default)('.page.viz-page', (0, mithril_1.default)(vega_view_1.VegaView, {
            spec: attrs.spec,
            engine: this.engine,
            data: {},
        }), (0, mithril_1.default)(editor_1.Editor, {
            initialText: attrs.spec,
            onUpdate: (text) => {
                attrs.setSpec(text);
                attrs.trace.scheduleFullRedraw();
            },
        }));
    }
}
exports.VizPage = VizPage;
//# sourceMappingURL=viz_page.js.map