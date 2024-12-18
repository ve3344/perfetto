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
exports.TabPanel = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const button_1 = require("../../widgets/button");
const menu_1 = require("../../widgets/menu");
const tabbed_split_panel_1 = require("../../widgets/tabbed_split_panel");
const css_constants_1 = require("../css_constants");
const current_selection_tab_1 = require("./current_selection_tab");
class TabPanel {
    view({ attrs, children, }) {
        const tabs = this.gatherTabs(attrs.trace);
        return (0, mithril_1.default)(tabbed_split_panel_1.TabbedSplitPanel, {
            className: attrs.className,
            startingHeight: css_constants_1.DEFAULT_DETAILS_CONTENT_HEIGHT,
            leftHandleContent: this.renderDropdownMenu(attrs.trace),
            tabs,
            visibility: attrs.trace.tabs.tabPanelVisibility,
            onVisibilityChange: (visibility) => attrs.trace.tabs.setTabPanelVisibility(visibility),
            onTabChange: (key) => attrs.trace.tabs.showTab(key),
            currentTabKey: attrs.trace.tabs.currentTabUri,
        }, children);
    }
    gatherTabs(trace) {
        const tabMan = trace.tabs;
        const tabList = trace.tabs.openTabsUri;
        const resolvedTabs = tabMan.resolveTabs(tabList);
        const tabs = resolvedTabs.map(({ uri, tab: tabDesc }) => {
            if (tabDesc) {
                return {
                    key: uri,
                    hasCloseButton: true,
                    title: tabDesc.content.getTitle(),
                    content: tabDesc.content.render(),
                    onClose: () => {
                        trace.tabs.hideTab(uri);
                    },
                };
            }
            else {
                return {
                    key: uri,
                    hasCloseButton: true,
                    title: 'Tab does not exist',
                    content: undefined,
                };
            }
        });
        // Add the permanent current selection tab to the front of the list of tabs
        tabs.unshift({
            key: 'current_selection',
            title: 'Current Selection',
            content: (0, mithril_1.default)(current_selection_tab_1.CurrentSelectionTab, { trace }),
        });
        return tabs;
    }
    renderDropdownMenu(trace) {
        const entries = trace.tabs.tabs
            .filter((tab) => tab.isEphemeral === false)
            .map(({ content, uri }) => {
            return {
                key: uri,
                title: content.getTitle(),
                onClick: () => trace.tabs.toggleTab(uri),
                checked: trace.tabs.isOpen(uri),
            };
        });
        return (0, mithril_1.default)(menu_1.PopupMenu2, {
            trigger: (0, mithril_1.default)(button_1.Button, {
                compact: true,
                icon: 'more_vert',
                disabled: entries.length === 0,
                title: 'More Tabs',
            }),
        }, entries.map((entry) => {
            return (0, mithril_1.default)(menu_1.MenuItem, {
                key: entry.key,
                label: entry.title,
                onclick: () => entry.onClick(),
                icon: entry.checked ? 'check_box' : 'check_box_outline_blank',
            });
        }));
    }
}
exports.TabPanel = TabPanel;
//# sourceMappingURL=tab_panel.js.map