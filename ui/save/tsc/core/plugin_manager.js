"use strict";
// Copyright (C) 2022 The Android Open Source Project
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
exports.PluginManagerImpl = exports.CORE_PLUGIN_ID = void 0;
const logging_1 = require("../base/logging");
const registry_1 = require("../base/registry");
const default_plugins_1 = require("./default_plugins");
const feature_flags_1 = require("./feature_flags");
// The pseudo plugin id used for the core instance of AppImpl.
exports.CORE_PLUGIN_ID = '__core__';
function makePlugin(desc, trace) {
    const PluginClass = desc;
    return new PluginClass(trace);
}
class PluginManagerImpl {
    app;
    registry = new registry_1.Registry((x) => x.desc.id);
    orderedPlugins = [];
    constructor(app) {
        this.app = app;
    }
    registerPlugin(desc) {
        const flagId = `plugin_${desc.id}`;
        const name = `Plugin: ${desc.id}`;
        const flag = feature_flags_1.featureFlags.register({
            id: flagId,
            name,
            description: `Overrides '${desc.id}' plugin.`,
            defaultValue: default_plugins_1.defaultPlugins.includes(desc.id),
        });
        this.registry.register({
            desc,
            enableFlag: flag,
        });
    }
    /**
     * Activates all registered plugins that have not already been registered.
     *
     * @param enableOverrides - The list of plugins that are enabled regardless of
     * the current flag setting.
     */
    activatePlugins(enableOverrides = []) {
        const enabledPlugins = this.registry
            .valuesAsArray()
            .filter((p) => p.enableFlag.get() || enableOverrides.includes(p.desc.id));
        this.orderedPlugins = this.sortPluginsTopologically(enabledPlugins);
        this.orderedPlugins.forEach((p) => {
            if (p.active)
                return;
            const app = this.app.forkForPlugin(p.desc.id);
            p.desc.onActivate?.(app);
            p.active = true;
        });
    }
    async onTraceLoad(traceCore, beforeEach) {
        // Awaiting all plugins in parallel will skew timing data as later plugins
        // will spend most of their time waiting for earlier plugins to load.
        // Running in parallel will have very little performance benefit assuming
        // most plugins use the same engine, which can only process one query at a
        // time.
        for (const p of this.orderedPlugins) {
            if (p.active) {
                beforeEach?.(p.desc.id);
                const trace = traceCore.forkForPlugin(p.desc.id);
                const before = performance.now();
                const instance = makePlugin(p.desc, trace);
                await instance.onTraceLoad?.(trace);
                const loadTimeMs = performance.now() - before;
                p.traceContext = {
                    instance,
                    loadTimeMs,
                };
                traceCore.trash.defer(() => {
                    p.traceContext = undefined;
                });
            }
        }
    }
    metricVisualisations() {
        return this.registry.valuesAsArray().flatMap((plugin) => {
            if (!plugin.active)
                return [];
            return plugin.desc.metricVisualisations?.() ?? [];
        });
    }
    getAllPlugins() {
        return this.registry.valuesAsArray();
    }
    getPluginContainer(id) {
        return this.registry.tryGet(id);
    }
    getPlugin(pluginDescriptor) {
        const plugin = this.registry.get(pluginDescriptor.id);
        return (0, logging_1.assertExists)(plugin.traceContext).instance;
    }
    /**
     * Sort plugins in dependency order, ensuring that if a plugin depends on
     * other plugins, those plugins will appear fist in the list.
     */
    sortPluginsTopologically(plugins) {
        const orderedPlugins = new Array();
        const visiting = new Set();
        const visit = (p) => {
            // Continue if we've already added this plugin, there's no need to add it
            // again
            if (orderedPlugins.includes(p)) {
                return;
            }
            // Detect circular dependencies
            if (visiting.has(p.desc.id)) {
                const cycle = Array.from(visiting).concat(p.desc.id);
                throw new Error(`Cyclic plugin dependency detected: ${cycle.join(' -> ')}`);
            }
            // Temporarily push this plugin onto the visiting stack while visiting
            // dependencies, to allow circular dependencies to be detected
            visiting.add(p.desc.id);
            // Recursively visit dependencies
            p.desc.dependencies?.forEach((d) => {
                visit(this.registry.get(d.id));
            });
            visiting.delete(p.desc.id);
            // Finally add this plugin to the ordered list
            orderedPlugins.push(p);
        };
        plugins.forEach((p) => visit(p));
        return orderedPlugins;
    }
}
exports.PluginManagerImpl = PluginManagerImpl;
//# sourceMappingURL=plugin_manager.js.map