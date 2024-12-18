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
exports.NotesListEditor = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const button_1 = require("../widgets/button");
const semantic_icons_1 = require("../base/semantic_icons");
class NotesListEditor {
    view({ attrs }) {
        const notes = attrs.trace.notes.notes;
        if (notes.size === 0) {
            return 'No notes found';
        }
        return (0, mithril_1.default)('table', (0, mithril_1.default)('thead', (0, mithril_1.default)('tr', (0, mithril_1.default)('td', 'ID'), (0, mithril_1.default)('td', 'Color'), (0, mithril_1.default)('td', 'Type'), (0, mithril_1.default)('td', 'Text'), (0, mithril_1.default)('td', 'Delete'))), (0, mithril_1.default)('tbody', Array.from(notes.entries()).map(([id, note]) => {
            return (0, mithril_1.default)('tr', (0, mithril_1.default)('td', id), (0, mithril_1.default)('td', note.color), (0, mithril_1.default)('td', note.noteType), (0, mithril_1.default)('td', note.text), (0, mithril_1.default)('td', (0, mithril_1.default)(button_1.Button, {
                icon: semantic_icons_1.Icons.Delete,
                onclick: () => {
                    attrs.trace.notes.removeNote(id);
                },
            })));
        })));
    }
}
exports.NotesListEditor = NotesListEditor;
//# sourceMappingURL=notes_list_editor.js.map