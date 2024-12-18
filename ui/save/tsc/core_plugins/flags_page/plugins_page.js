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
exports.PluginsPage = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const button_1 = require("../../widgets/button");
const utils_1 = require("../../base/utils");
const default_plugins_1 = require("../../core/default_plugins");
const common_1 = require("../../widgets/common");
const app_impl_1 = require("../../core/app_impl");
const raf_scheduler_1 = require("../../core/raf_scheduler");
// This flag indicated whether we need to restart the UI to apply plugin
// changes. It is purposely a global as we want it to outlive the Mithril
// component, and it'll be reset we restart anyway.
let needsRestart = false;
class PluginsPage {
    view() {
        const pluginManager = app_impl_1.AppImpl.instance.plugins;
        const registeredPlugins = pluginManager.getAllPlugins();
        return (0, mithril_1.default)('.pf-plugins-page', (0, mithril_1.default)('h1', 'Plugins'), needsRestart &&
            (0, mithril_1.default)('h3.restart_needed', 'Some plugins have been disabled. ' +
                'Please reload your page to apply the changes.'), (0, mithril_1.default)('.pf-plugins-topbar', (0, mithril_1.default)(button_1.Button, {
            intent: common_1.Intent.Primary,
            label: 'Disable All',
            onclick: async () => {
                for (const plugin of registeredPlugins) {
                    plugin.enableFlag.set(false);
                }
                needsRestart = true;
                raf_scheduler_1.raf.scheduleFullRedraw();
            },
        }), (0, mithril_1.default)(button_1.Button, {
            intent: common_1.Intent.Primary,
            label: 'Enable All',
            onclick: async () => {
                for (const plugin of registeredPlugins) {
                    plugin.enableFlag.set(true);
                }
                needsRestart = true;
                raf_scheduler_1.raf.scheduleFullRedraw();
            },
        }), (0, mithril_1.default)(button_1.Button, {
            intent: common_1.Intent.Primary,
            label: 'Restore Defaults',
            onclick: async () => {
                for (const plugin of registeredPlugins) {
                    plugin.enableFlag.reset();
                }
                needsRestart = true;
                raf_scheduler_1.raf.scheduleFullRedraw();
            },
        })), (0, mithril_1.default)('.pf-plugins-grid', (0, mithril_1.default)('span', 'Plugin'), (0, mithril_1.default)('span', 'Default?'), (0, mithril_1.default)('span', 'Enabled?'), (0, mithril_1.default)('span', 'Active?'), (0, mithril_1.default)('span', 'Control'), (0, mithril_1.default)('span', 'Load Time'), registeredPlugins.map((plugin) => this.renderPluginRow(plugin))));
    }
    renderPluginRow(plugin) {
        const pluginId = plugin.desc.id;
        const isDefault = default_plugins_1.defaultPlugins.includes(pluginId);
        const isActive = plugin.active;
        const isEnabled = plugin.enableFlag.get();
        const loadTime = plugin.traceContext?.loadTimeMs;
        return [
            (0, mithril_1.default)('span', pluginId),
            (0, mithril_1.default)('span', isDefault ? 'Yes' : 'No'),
            isEnabled
                ? (0, mithril_1.default)('.pf-tag.pf-active', 'Enabled')
                : (0, mithril_1.default)('.pf-tag.pf-inactive', 'Disabled'),
            isActive
                ? (0, mithril_1.default)('.pf-tag.pf-active', 'Active')
                : (0, mithril_1.default)('.pf-tag.pf-inactive', 'Inactive'),
            (0, mithril_1.default)(button_1.Button, {
                label: isEnabled ? 'Disable' : 'Enable',
                intent: common_1.Intent.Primary,
                onclick: () => {
                    if (isEnabled) {
                        plugin.enableFlag.set(false);
                    }
                    else {
                        plugin.enableFlag.set(true);
                    }
                    needsRestart = true;
                    raf_scheduler_1.raf.scheduleFullRedraw();
                },
            }),
            (0, utils_1.exists)(loadTime)
                ? (0, mithril_1.default)('span', `${loadTime.toFixed(1)} ms`)
                : (0, mithril_1.default)('span', `-`),
        ];
    }
}
exports.PluginsPage = PluginsPage;
//# sourceMappingURL=plugins_page.js.map