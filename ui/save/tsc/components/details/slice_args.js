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
exports.renderArguments = renderArguments;
exports.hasArgs = hasArgs;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const object_utils_1 = require("../../base/object_utils");
const semantic_icons_1 = require("../../base/semantic_icons");
const string_utils_1 = require("../../base/string_utils");
const utils_1 = require("../../base/utils");
const slice_args_parser_1 = require("./slice_args_parser");
const anchor_1 = require("../../widgets/anchor");
const menu_1 = require("../../widgets/menu");
const tree_1 = require("../../widgets/tree");
const logging_1 = require("../../base/logging");
const sql_table_registry_1 = require("../widgets/sql/legacy_table/sql_table_registry");
const extensions_1 = require("../extensions");
// Renders slice arguments (key/value pairs) as a subtree.
function renderArguments(trace, args) {
    if (args.length > 0) {
        const tree = (0, slice_args_parser_1.convertArgsToTree)(args);
        return renderArgTreeNodes(trace, tree);
    }
    else {
        return undefined;
    }
}
function hasArgs(args) {
    return (0, utils_1.exists)(args) && args.length > 0;
}
function renderArgTreeNodes(trace, args) {
    return args.map((arg) => {
        const { key, value, children } = arg;
        if (children && children.length === 1) {
            // If we only have one child, collapse into self and combine keys
            const child = children[0];
            const compositeArg = {
                ...child,
                key: stringifyKey(key, child.key),
            };
            return renderArgTreeNodes(trace, [compositeArg]);
        }
        else {
            return (0, mithril_1.default)(tree_1.TreeNode, {
                left: renderArgKey(trace, stringifyKey(key), value),
                right: (0, utils_1.exists)(value) && renderArgValue(value),
                summary: children && renderSummary(children),
            }, children && renderArgTreeNodes(trace, children));
        }
    });
}
function renderArgKey(trace, key, value) {
    if (value === undefined) {
        return key;
    }
    else {
        const { key: fullKey, displayValue } = value;
        return (0, mithril_1.default)(menu_1.PopupMenu2, { trigger: (0, mithril_1.default)(anchor_1.Anchor, { icon: semantic_icons_1.Icons.ContextMenu }, key) }, (0, mithril_1.default)(menu_1.MenuItem, {
            label: 'Copy full key',
            icon: 'content_copy',
            onclick: () => navigator.clipboard.writeText(fullKey),
        }), (0, mithril_1.default)(menu_1.MenuItem, {
            label: 'Find slices with same arg value',
            icon: 'search',
            onclick: () => {
                extensions_1.extensions.addLegacySqlTableTab(trace, {
                    table: (0, logging_1.assertExists)((0, sql_table_registry_1.getSqlTableDescription)('slice')),
                    filters: [
                        {
                            op: (cols) => `${cols[0]} = ${(0, string_utils_1.sqliteString)(displayValue)}`,
                            columns: [
                                {
                                    column: 'display_value',
                                    source: {
                                        table: 'args',
                                        joinOn: {
                                            arg_set_id: 'arg_set_id',
                                            key: (0, string_utils_1.sqliteString)(fullKey),
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                });
            },
        }), (0, mithril_1.default)(menu_1.MenuItem, {
            label: 'Visualize argument values',
            icon: 'query_stats',
            onclick: () => {
                extensions_1.extensions.addVisualizedArgTracks(trace, fullKey);
            },
        }));
    }
}
function renderArgValue({ value }) {
    if (isWebLink(value)) {
        return renderWebLink(value);
    }
    else {
        return `${value}`;
    }
}
function renderSummary(children) {
    const summary = children
        .slice(0, 2)
        .map(({ key }) => key)
        .join(', ');
    const remaining = children.length - 2;
    if (remaining > 0) {
        return `{${summary}, ... (${remaining} more items)}`;
    }
    else {
        return `{${summary}}`;
    }
}
function stringifyKey(...key) {
    return key
        .map((element, index) => {
        if (typeof element === 'number') {
            return `[${element}]`;
        }
        else {
            return (index === 0 ? '' : '.') + element;
        }
    })
        .join('');
}
function isWebLink(value) {
    return ((0, object_utils_1.isString)(value) &&
        (value.startsWith('http://') || value.startsWith('https://')));
}
function renderWebLink(url) {
    return (0, mithril_1.default)(anchor_1.Anchor, { href: url, target: '_blank', icon: 'open_in_new' }, url);
}
//# sourceMappingURL=slice_args.js.map