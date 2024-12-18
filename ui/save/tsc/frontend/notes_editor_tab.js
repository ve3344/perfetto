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
exports.NotesEditorTab = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const logging_1 = require("../base/logging");
const semantic_icons_1 = require("../base/semantic_icons");
const timestamp_1 = require("../components/widgets/timestamp");
const button_1 = require("../widgets/button");
function getStartTimestamp(note) {
    const noteType = note.noteType;
    switch (noteType) {
        case 'SPAN':
            return note.start;
        case 'DEFAULT':
            return note.timestamp;
        default:
            (0, logging_1.assertUnreachable)(noteType);
    }
}
class NotesEditorTab {
    trace;
    constructor(trace) {
        this.trace = trace;
    }
    render(selection) {
        if (selection.kind !== 'note') {
            return undefined;
        }
        const id = selection.id;
        const note = this.trace.notes.getNote(id);
        if (note === undefined) {
            return (0, mithril_1.default)('.', `No Note with id ${id}`);
        }
        const startTime = getStartTimestamp(note);
        return (0, mithril_1.default)('.notes-editor-panel', {
            key: id, // Every note shoul get its own brand new DOM.
        }, (0, mithril_1.default)('.notes-editor-panel-heading-bar', (0, mithril_1.default)('.notes-editor-panel-heading', `Annotation at `, (0, mithril_1.default)(timestamp_1.Timestamp, { ts: startTime })), (0, mithril_1.default)('input[type=text]', {
            oncreate: (v) => {
                // NOTE: due to bad design decisions elsewhere this component is
                // rendered every time the mouse moves on the canvas. We cannot set
                // `value: note.text` as an input as that will clobber the input
                // value as we move the mouse.
                const inputElement = v.dom;
                inputElement.value = note.text;
            },
            onchange: (e) => {
                const newText = e.target.value;
                this.trace.notes.changeNote(id, { text: newText });
            },
        }), (0, mithril_1.default)('span.color-change', `Change color: `, (0, mithril_1.default)('input[type=color]', {
            value: note.color,
            onchange: (e) => {
                const newColor = e.target.value;
                this.trace.notes.changeNote(id, { color: newColor });
            },
        })), (0, mithril_1.default)(button_1.Button, {
            label: 'Remove',
            icon: semantic_icons_1.Icons.Delete,
            onclick: () => this.trace.notes.removeNote(id),
        })));
    }
}
exports.NotesEditorTab = NotesEditorTab;
//# sourceMappingURL=notes_editor_tab.js.map