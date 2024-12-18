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
exports.LazyTreeNode = exports.TreeNode = exports.Tree = void 0;
exports.dictToTreeNodes = dictToTreeNodes;
exports.dictToTree = dictToTree;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const classnames_1 = require("../base/classnames");
const mithril_utils_1 = require("../base/mithril_utils");
const raf_1 = require("./raf");
class Tree {
    view({ attrs, children }) {
        const { className = '' } = attrs;
        const classes = (0, classnames_1.classNames)(className);
        return (0, mithril_1.default)('.pf-tree', { class: classes }, children);
    }
}
exports.Tree = Tree;
class TreeNode {
    collapsed;
    constructor({ attrs }) {
        this.collapsed = attrs.startsCollapsed ?? false;
    }
    view(vnode) {
        const { children, attrs, attrs: { left, onCollapseChanged = () => { } }, } = vnode;
        return [
            (0, mithril_1.default)('.pf-tree-node', {
                class: (0, classnames_1.classNames)(this.getClassNameForNode(vnode)),
            }, (0, mithril_1.default)('.pf-tree-left', (0, mithril_1.default)('span.pf-tree-gutter', {
                onclick: () => {
                    this.collapsed = !this.isCollapsed(vnode);
                    onCollapseChanged(this.collapsed, attrs);
                    (0, raf_1.scheduleFullRedraw)();
                },
            }), left), this.renderRight(vnode)),
            (0, mithril_utils_1.hasChildren)(vnode) && (0, mithril_1.default)('.pf-tree-children', children),
        ];
    }
    getClassNameForNode(vnode) {
        const { loading = false, showCaret = false } = vnode.attrs;
        if (loading) {
            return 'pf-loading';
        }
        else if ((0, mithril_utils_1.hasChildren)(vnode) || showCaret) {
            if (this.isCollapsed(vnode)) {
                return 'pf-collapsed';
            }
            else {
                return 'pf-expanded';
            }
        }
        else {
            return undefined;
        }
    }
    renderRight(vnode) {
        const { attrs: { right, summary }, } = vnode;
        if ((0, mithril_utils_1.hasChildren)(vnode) && this.isCollapsed(vnode)) {
            return (0, mithril_1.default)('.pf-tree-right', summary ?? right);
        }
        else {
            return (0, mithril_1.default)('.pf-tree-right', right);
        }
    }
    isCollapsed({ attrs }) {
        // If collapsed is omitted, use our local collapsed state instead.
        const { collapsed = this.collapsed } = attrs;
        return collapsed;
    }
}
exports.TreeNode = TreeNode;
function dictToTreeNodes(dict) {
    const children = [];
    for (const key of Object.keys(dict)) {
        if (dict[key] == undefined) {
            continue;
        }
        children.push((0, mithril_1.default)(TreeNode, {
            left: key,
            right: dict[key],
        }));
    }
    return children;
}
// Create a flat tree from a POJO
function dictToTree(dict) {
    return (0, mithril_1.default)(Tree, dictToTreeNodes(dict));
}
// This component is a TreeNode which only loads child nodes when it's expanded.
// This allows us to represent huge trees without having to load all the data
// up front, and even allows us to represent infinite or recursive trees.
class LazyTreeNode {
    collapsed = true;
    loading = false;
    renderChildren;
    view({ attrs }) {
        const { left, right, icon, summary, fetchData, unloadOnCollapse = false, } = attrs;
        return (0, mithril_1.default)(TreeNode, {
            left,
            right,
            icon,
            summary,
            showCaret: true,
            loading: this.loading,
            collapsed: this.collapsed,
            onCollapseChanged: (collapsed) => {
                if (collapsed) {
                    if (unloadOnCollapse) {
                        this.renderChildren = undefined;
                    }
                }
                else {
                    // Expanding
                    if (this.renderChildren) {
                        this.collapsed = false;
                        (0, raf_1.scheduleFullRedraw)();
                    }
                    else {
                        this.loading = true;
                        fetchData().then((result) => {
                            this.loading = false;
                            this.collapsed = false;
                            this.renderChildren = result;
                            (0, raf_1.scheduleFullRedraw)();
                        });
                    }
                }
                this.collapsed = collapsed;
                (0, raf_1.scheduleFullRedraw)();
            },
        }, this.renderChildren && this.renderChildren());
    }
}
exports.LazyTreeNode = LazyTreeNode;
//# sourceMappingURL=tree.js.map