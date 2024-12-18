"use strict";
// Copyright (C) 2023 The Android Open Source Project
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use size file except in compliance with the License.
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
exports.value = value;
exports.maybeValue = maybeValue;
exports.dict = dict;
exports.array = array;
exports.isArray = isArray;
exports.isDict = isDict;
exports.isStringValue = isStringValue;
exports.renderDict = renderDict;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const tree_1 = require("../widgets/tree");
const menu_1 = require("../widgets/menu");
const button_1 = require("../widgets/button");
// Helper function to create a StringValue from string together with optional
// parameters.
function value(value, params) {
    return {
        kind: 'STRING',
        value,
        ...params,
    };
}
// Helper function to convert a potentially undefined value to StringValue or
// null.
function maybeValue(v, params) {
    if (!v) {
        return null;
    }
    return value(v, params);
}
// Helper function to simplify creation of a dictionary.
// This function accepts and filters out nulls as values in the passed
// dictionary (useful for simplifying the code to render optional values).
function dict(items, params) {
    const result = {};
    for (const [name, value] of Object.entries(items)) {
        if (value !== null) {
            result[name] = value;
        }
    }
    return {
        kind: 'DICT',
        items: result,
        ...params,
    };
}
// Helper function to simplify creation of an array.
// This function accepts and filters out nulls in the passed array (useful for
// simplifying the code to render optional values).
function array(items, params) {
    return {
        kind: 'ARRAY',
        items: items.filter((item) => item !== null),
        ...params,
    };
}
function isArray(value) {
    return value.kind === 'ARRAY';
}
function isDict(value) {
    return value.kind === 'DICT';
}
function isStringValue(value) {
    return !isArray(value) && !isDict(value);
}
// Recursively render the given value and its children, returning a list of
// vnodes corresponding to the nodes of the table.
function renderValue(name, value) {
    const left = [
        name,
        value.contextMenu
            ? (0, mithril_1.default)(menu_1.PopupMenu2, {
                trigger: (0, mithril_1.default)(button_1.Button, {
                    icon: 'arrow_drop_down',
                }),
            }, value.contextMenu)
            : null,
    ];
    if (isArray(value)) {
        const nodes = value.items.map((value, index) => {
            return renderValue(`[${index}]`, value);
        });
        return (0, mithril_1.default)(tree_1.TreeNode, { left, right: `array[${nodes.length}]` }, nodes);
    }
    else if (isDict(value)) {
        const nodes = [];
        for (const key of Object.keys(value.items)) {
            nodes.push(renderValue(key, value.items[key]));
        }
        return (0, mithril_1.default)(tree_1.TreeNode, { left, right: `dict` }, nodes);
    }
    else {
        const renderButton = (button) => {
            if (!button) {
                return null;
            }
            return (0, mithril_1.default)('i.material-icons.grey', {
                onclick: button.action,
                title: button.hoverText,
            }, button.icon ?? 'call_made');
        };
        if (value.kind === 'STRING') {
            const right = [
                renderButton(value.leftButton),
                (0, mithril_1.default)('span', value.value),
                renderButton(value.rightButton),
            ];
            return (0, mithril_1.default)(tree_1.TreeNode, { left, right });
        }
        else {
            return null;
        }
    }
}
// Render a given dictionary to a tree.
function renderDict(dict) {
    const rows = [];
    for (const key of Object.keys(dict.items)) {
        rows.push(renderValue(key, dict.items[key]));
    }
    return (0, mithril_1.default)(tree_1.Tree, rows);
}
//# sourceMappingURL=value.js.map