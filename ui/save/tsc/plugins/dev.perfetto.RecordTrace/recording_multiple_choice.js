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
exports.RecordingMultipleChoice = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const recording_utils_1 = require("./recordingV2/recording_utils");
const modal_1 = require("../../widgets/modal");
class RecordingMultipleChoice {
    selectedIndex = -1;
    targetSelection(targets, controller) {
        const targetInfo = controller.getTargetInfo();
        const targetNames = [];
        this.selectedIndex = -1;
        for (let i = 0; i < targets.length; i++) {
            const targetName = targets[i].getInfo().name;
            targetNames.push((0, mithril_1.default)('option', targetName));
            if (targetInfo && targetName === targetInfo.name) {
                this.selectedIndex = i;
            }
        }
        const selectedIndex = this.selectedIndex;
        return (0, mithril_1.default)('label', (0, mithril_1.default)('select', {
            selectedIndex,
            onchange: (e) => {
                controller.onTargetSelection(e.target.value);
            },
            onupdate: (select) => {
                // Work around mithril bug
                // (https://github.com/MithrilJS/mithril.js/issues/2107): We
                // may update the select's options while also changing the
                // selectedIndex at the same time. The update of selectedIndex
                // may be applied before the new options are added to the
                // select element. Because the new selectedIndex may be
                // outside of the select's options at that time, we have to
                // reselect the correct index here after any new children were
                // added.
                select.dom.selectedIndex =
                    this.selectedIndex;
            },
            ...{ size: targets.length, multiple: 'multiple' },
        }, ...targetNames));
    }
    view({ attrs }) {
        const controller = attrs.controller;
        if (!controller.shouldShowTargetSelection()) {
            return undefined;
        }
        const targets = [];
        for (const targetFactory of attrs.targetFactories) {
            for (const target of targetFactory.listTargets()) {
                targets.push(target);
            }
        }
        if (targets.length === 0) {
            return undefined;
        }
        return [
            (0, mithril_1.default)('text', 'Select target:'),
            (0, mithril_1.default)('.record-modal-command', this.targetSelection(targets, controller), (0, mithril_1.default)('button.record-modal-button-high', {
                disabled: this.selectedIndex === -1,
                onclick: () => {
                    (0, modal_1.closeModal)(recording_utils_1.RECORDING_MODAL_DIALOG_KEY);
                    controller.onStartRecordingPressed();
                },
            }, 'Connect')),
        ];
    }
}
exports.RecordingMultipleChoice = RecordingMultipleChoice;
//# sourceMappingURL=recording_multiple_choice.js.map