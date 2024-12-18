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
exports.TagInput = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const icon_1 = require("./icon");
const dom_utils_1 = require("../base/dom_utils");
const INPUT_REF = 'input';
/**
 * TagInput displays Tag elements inside an input, followed by an interactive
 * text input. The container is styled to look like a TextInput, but the actual
 * editable element appears after the last tag. Clicking anywhere on the
 * container will focus the text input.
 *
 * To use this widget, the user must provide the tags as a list of strings, and
 * provide callbacks which are called when the user modifies the list of tags,
 * either adding a new tag by typing and pressing enter, or removing a tag by
 * clicking the close button on a tag.
 *
 * The text value can be optionally be controlled, which allows access to this
 * value from outside the widget.
 *
 * Uncontrolled example:
 *
 * In this example, we only have access to the list of tags from outside.
 *
 * ```
 * const tags = [];
 *
 * m(TagInput, {
 *   tags,
 *   onTagAdd: (tag) => tags.push(tag),
 *   onTagRemove: (index) => tags.splice(index),
 * });
 * ```
 *
 * Controlled example:
 *
 * In this example we have complete control over the value in the text field.
 *
 * ```
 * const tags = [];
 * let value = '';
 *
 * m(TagInput, {
 *   tags,
 *   onTagAdd: (tag) => {
 *     tags.push(tag);
 *     value = ''; // The value is controlled so we must manually clear it here
 *   },
 *   onTagRemove: (index) => tags.splice(index),
 *   value,
 *   onChange: (x) => value = x,
 * });
 * ```
 *
 */
class TagInput {
    view({ attrs }) {
        const { value, onChange, tags, onTagAdd, onTagRemove, onfocus, onblur, placeholder, ...htmlAttrs } = attrs;
        const valueIsControlled = value !== undefined;
        return (0, mithril_1.default)('.pf-tag-input', {
            onclick: (ev) => {
                const target = ev.currentTarget;
                const inputElement = (0, dom_utils_1.findRef)(target, INPUT_REF);
                if (inputElement) {
                    inputElement.focus();
                }
            },
            ...htmlAttrs,
        }, tags.map((tag, index) => renderTag(tag, () => onTagRemove(index))), (0, mithril_1.default)('input', {
            ref: INPUT_REF,
            value,
            placeholder,
            onkeydown: (ev) => {
                if (ev.key === 'Enter') {
                    const el = ev.target;
                    if (el.value.trim() !== '') {
                        onTagAdd(el.value);
                        if (!valueIsControlled) {
                            el.value = '';
                        }
                    }
                }
                else if (ev.key === 'Backspace') {
                    const el = ev.target;
                    if (el.value !== '')
                        return;
                    if (tags.length === 0)
                        return;
                    const lastTagIndex = tags.length - 1;
                    onTagRemove(lastTagIndex);
                }
            },
            oninput: (ev) => {
                const el = ev.target;
                onChange?.(el.value);
            },
            onfocus,
            onblur,
        }));
    }
}
exports.TagInput = TagInput;
function renderTag(text, onRemove) {
    return (0, mithril_1.default)('span.pf-tag', text, (0, mithril_1.default)(icon_1.Icon, {
        icon: 'close',
        onclick: () => {
            onRemove();
        },
    }));
}
//# sourceMappingURL=tag_input.js.map