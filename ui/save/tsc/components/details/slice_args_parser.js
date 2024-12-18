"use strict";
// Copyright (C) 2021 The Android Open Source Project
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
exports.convertArgsToTree = convertArgsToTree;
exports.convertArgsToObject = convertArgsToObject;
const object_utils_1 = require("../../base/object_utils");
const utils_1 = require("../../base/utils");
// Arranges a flat list of arg-like objects (objects with a string "key" value
// indicating their path) into a nested tree.
//
// This process is relatively forgiving as it allows nodes with both values and
// child nodes as well as children with mixed key types in the same node.
//
// When duplicate nodes exist, the latest one is picked.
//
// If you want to convert args to a POJO, try convertArgsToObject().
//
// Key should be a path seperated by periods (.) or indexes specified using a
// number inside square brackets.
// e.g. foo.bar[0].x
//
// See unit tests for examples.
function convertArgsToTree(input) {
    const result = [];
    for (const arg of input) {
        const { key } = arg;
        const nestedKey = getNestedKey(key);
        insert(result, nestedKey, key, arg);
    }
    return result;
}
function getNestedKey(key) {
    const result = [];
    let match;
    const re = /([^\.\[\]]+)|\[(\d+)\]/g;
    while ((match = re.exec(key)) !== null) {
        result.push(match[2] ? parseInt(match[2]) : match[1]);
    }
    return result;
}
function insert(args, keys, path, value) {
    const currentKey = keys.shift();
    let node = args.find((x) => x.key === currentKey);
    if (!node) {
        node = { key: currentKey };
        args.push(node);
    }
    if (keys.length > 0) {
        if (node.children === undefined) {
            node.children = [];
        }
        insert(node.children, keys, path, value);
    }
    else {
        node.value = value;
    }
}
// Converts a list of argument-like objects (i.e. objects with key and value
// fields) to a POJO.
//
// This function cannot handle cases where nodes contain mixed node types (i.e.
// both number and string types) as nodes cannot be both an object and an array,
// and will throw when this situation arises.
//
// Key should be a path seperated by periods (.) or indexes specified using a
// number inside square brackets.
// e.g. foo.bar[0].x
//
// See unit tests for examples.
function convertArgsToObject(input) {
    const nested = convertArgsToTree(input);
    return parseNodes(nested);
}
function parseNodes(nodes) {
    if (nodes.every(({ key }) => (0, object_utils_1.isString)(key))) {
        const dict = {};
        for (const node of nodes) {
            if (node.key in dict) {
                throw new Error(`Duplicate key ${node.key}`);
            }
            dict[node.key] = parseNode(node);
        }
        return dict;
    }
    else if (nodes.every(({ key }) => typeof key === 'number')) {
        const array = [];
        for (const node of nodes) {
            const index = node.key;
            if (index in array) {
                throw new Error(`Duplicate array index ${index}`);
            }
            array[index] = parseNode(node);
        }
        return array;
    }
    else {
        throw new Error('Invalid mix of node key types');
    }
}
function parseNode({ value, children, }) {
    if ((0, utils_1.exists)(value) && !(0, utils_1.exists)(children)) {
        return value.value;
    }
    else if (!(0, utils_1.exists)(value) && (0, utils_1.exists)(children)) {
        return parseNodes(children);
    }
    else {
        throw new Error('Invalid node type');
    }
}
//# sourceMappingURL=slice_args_parser.js.map