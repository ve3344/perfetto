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
exports.TabbedSplitPanel = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const split_panel_1 = require("./split_panel");
const mithril_utils_1 = require("../base/mithril_utils");
const button_1 = require("./button");
/**
 * An extended SplitPanel with tabs which are displayed in a tab strip along the
 * handle, and the active tab's content in shown in the drawer.
 */
class TabbedSplitPanel {
    currentTabKey;
    view({ attrs, children }) {
        const { currentTabKey = this.currentTabKey, onTabChange, leftHandleContent: leftContent, startingHeight, tabs, visibility, onVisibilityChange, className, } = attrs;
        return (0, mithril_1.default)(split_panel_1.SplitPanel, {
            className,
            drawerContent: tabs.map((tab) => (0, mithril_1.default)(mithril_utils_1.Gate, { open: tab.key === currentTabKey }, tab.content)),
            startingHeight,
            visibility,
            onVisibilityChange,
            handleContent: (0, mithril_1.default)('.pf-tab-handle', leftContent, (0, mithril_1.default)('.pf-tab-handle__tabs', tabs.map((tab) => {
                const { key, hasCloseButton = false } = tab;
                return (0, mithril_1.default)('.pf-tab-handle__tab', {
                    active: currentTabKey === key,
                    key,
                    // Click tab to switch to it
                    onclick: () => {
                        onTabChange?.(tab.key);
                        this.currentTabKey = tab.key;
                    },
                    // Middle click to close
                    onauxclick: () => {
                        tab.onClose?.();
                    },
                }, (0, mithril_1.default)('span.pf-tab-handle__tab-title', tab.title), hasCloseButton &&
                    (0, mithril_1.default)(button_1.Button, {
                        onclick: (e) => {
                            tab.onClose?.();
                            e.stopPropagation();
                        },
                        compact: true,
                        icon: 'close',
                    }));
            }))),
        }, children);
    }
}
exports.TabbedSplitPanel = TabbedSplitPanel;
//# sourceMappingURL=tabbed_split_panel.js.map