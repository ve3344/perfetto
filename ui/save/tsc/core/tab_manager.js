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
exports.TabManagerImpl = void 0;
const split_panel_1 = require("../widgets/split_panel");
const raf_scheduler_1 = require("./raf_scheduler");
/**
 * Stores tab & current selection section registries.
 * Keeps track of tab lifecycles.
 */
class TabManagerImpl {
    _registry = new Map();
    _defaultTabs = new Set();
    _detailsPanelRegistry = new Set();
    _instantiatedTabs = new Map();
    _openTabs = []; // URIs of the tabs open.
    _currentTab = 'current_selection';
    _tabPanelVisibility = split_panel_1.SplitPanelDrawerVisibility.COLLAPSED;
    _tabPanelVisibilityChanged = false;
    [Symbol.dispose]() {
        // Dispose of all tabs that are currently alive
        for (const tab of this._instantiatedTabs.values()) {
            this.disposeTab(tab);
        }
        this._instantiatedTabs.clear();
    }
    registerTab(desc) {
        this._registry.set(desc.uri, desc);
        return {
            [Symbol.dispose]: () => this._registry.delete(desc.uri),
        };
    }
    addDefaultTab(uri) {
        this._defaultTabs.add(uri);
        return {
            [Symbol.dispose]: () => this._defaultTabs.delete(uri),
        };
    }
    registerDetailsPanel(section) {
        this._detailsPanelRegistry.add(section);
        return {
            [Symbol.dispose]: () => this._detailsPanelRegistry.delete(section),
        };
    }
    resolveTab(uri) {
        return this._registry.get(uri);
    }
    showCurrentSelectionTab() {
        this.showTab('current_selection');
    }
    showTab(uri) {
        // Add tab, unless we're talking about the special current_selection tab
        if (uri !== 'current_selection') {
            // Add tab to tab list if not already
            if (!this._openTabs.some((x) => x === uri)) {
                this._openTabs.push(uri);
            }
        }
        this._currentTab = uri;
        // The first time that we show a tab, auto-expand the tab bottom panel.
        // However, if the user has later collapsed the panel (hence if
        // _tabPanelVisibilityChanged == true), don't insist and leave things as
        // they are.
        if (!this._tabPanelVisibilityChanged &&
            this._tabPanelVisibility === split_panel_1.SplitPanelDrawerVisibility.COLLAPSED) {
            this.setTabPanelVisibility(split_panel_1.SplitPanelDrawerVisibility.VISIBLE);
        }
        raf_scheduler_1.raf.scheduleFullRedraw();
    }
    // Hide a tab in the tab bar pick a new tab to show.
    // Note: Attempting to hide the "current_selection" tab doesn't work. This tab
    // is special and cannot be removed.
    hideTab(uri) {
        // If the removed tab is the "current" tab, we must find a new tab to focus
        if (uri === this._currentTab) {
            // Remember the index of the current tab
            const currentTabIdx = this._openTabs.findIndex((x) => x === uri);
            // Remove the tab
            this._openTabs = this._openTabs.filter((x) => x !== uri);
            if (currentTabIdx !== -1) {
                if (this._openTabs.length === 0) {
                    // No more tabs, use current selection
                    this._currentTab = 'current_selection';
                }
                else if (currentTabIdx < this._openTabs.length - 1) {
                    // Pick the tab to the right
                    this._currentTab = this._openTabs[currentTabIdx];
                }
                else {
                    // Pick the last tab
                    const lastTab = this._openTabs[this._openTabs.length - 1];
                    this._currentTab = lastTab;
                }
            }
        }
        else {
            // Otherwise just remove the tab
            this._openTabs = this._openTabs.filter((x) => x !== uri);
        }
        raf_scheduler_1.raf.scheduleFullRedraw();
    }
    toggleTab(uri) {
        return this.isOpen(uri) ? this.hideTab(uri) : this.showTab(uri);
    }
    isOpen(uri) {
        return this._openTabs.find((x) => x == uri) !== undefined;
    }
    get currentTabUri() {
        return this._currentTab;
    }
    get openTabsUri() {
        return this._openTabs;
    }
    get tabs() {
        return Array.from(this._registry.values());
    }
    get defaultTabs() {
        return Array.from(this._defaultTabs);
    }
    get detailsPanels() {
        return Array.from(this._detailsPanelRegistry);
    }
    /**
     * Resolves a list of URIs to tabs and manages tab lifecycles.
     * @param tabUris List of tabs.
     * @returns List of resolved tabs.
     */
    resolveTabs(tabUris) {
        // Refresh the list of old tabs
        const newTabs = new Map();
        const tabs = [];
        tabUris.forEach((uri) => {
            const newTab = this._registry.get(uri);
            tabs.push({ uri, tab: newTab });
            if (newTab) {
                newTabs.set(uri, newTab);
            }
        });
        // Call onShow() on any new tabs.
        for (const [uri, tab] of newTabs) {
            const oldTab = this._instantiatedTabs.get(uri);
            if (!oldTab) {
                this.initTab(tab);
            }
        }
        // Call onHide() on any tabs that have been removed.
        for (const [uri, tab] of this._instantiatedTabs) {
            const newTab = newTabs.get(uri);
            if (!newTab) {
                this.disposeTab(tab);
            }
        }
        this._instantiatedTabs = newTabs;
        return tabs;
    }
    setTabPanelVisibility(visibility) {
        this._tabPanelVisibility = visibility;
        this._tabPanelVisibilityChanged = true;
    }
    toggleTabPanelVisibility() {
        this.setTabPanelVisibility((0, split_panel_1.toggleVisibility)(this._tabPanelVisibility));
    }
    get tabPanelVisibility() {
        return this._tabPanelVisibility;
    }
    /**
     * Call onShow() on this tab.
     * @param tab The tab to initialize.
     */
    initTab(tab) {
        tab.onShow?.();
    }
    /**
     * Call onHide() and maybe remove from registry if tab is ephemeral.
     * @param tab The tab to dispose.
     */
    disposeTab(tab) {
        // Attempt to call onHide
        tab.onHide?.();
        // If ephemeral, also unregister the tab
        if (tab.isEphemeral) {
            this._registry.delete(tab.uri);
        }
    }
}
exports.TabManagerImpl = TabManagerImpl;
//# sourceMappingURL=tab_manager.js.map