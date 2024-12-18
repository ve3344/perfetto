"use strict";
// Copyright (C) 2021 The Android Open Source Project
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
exports.featureFlags = exports.FlagsForTesting = void 0;
// This file should not import anything else. Since the flags will be used from
// ~everywhere and the are "statically" initialized (i.e. files construct Flags
// at import time) if this file starts importing anything we will quickly run
// into issues with initialization order which will be a pain.
const zod_1 = require("zod");
const feature_flag_1 = require("../public/feature_flag");
class Flags {
    store;
    flags;
    overrides;
    constructor(store) {
        this.store = store;
        this.flags = new Map();
        this.overrides = {};
        this.load();
    }
    register(settings) {
        const id = settings.id;
        if (this.flags.has(id)) {
            throw new Error(`Flag with id "${id}" is already registered.`);
        }
        const saved = this.overrides[id];
        const state = saved === undefined ? feature_flag_1.OverrideState.DEFAULT : saved;
        const flag = new FlagImpl(this, state, settings);
        this.flags.set(id, flag);
        return flag;
    }
    allFlags() {
        const includeDevFlags = ['127.0.0.1', '::1', 'localhost'].includes(window.location.hostname);
        let flags = [...this.flags.values()];
        flags = flags.filter((flag) => includeDevFlags || !flag.devOnly);
        flags.sort((a, b) => a.name.localeCompare(b.name));
        return flags;
    }
    resetAll() {
        for (const flag of this.flags.values()) {
            flag.state = feature_flag_1.OverrideState.DEFAULT;
        }
        this.save();
    }
    load() {
        const o = this.store.load();
        // Check if the given object is a valid FlagOverrides.
        // This is necessary since someone could modify the persisted flags
        // behind our backs.
        const flagsSchema = zod_1.z.record(zod_1.z.string(), zod_1.z.union([zod_1.z.literal(feature_flag_1.OverrideState.TRUE), zod_1.z.literal(feature_flag_1.OverrideState.FALSE)]));
        const { success, data } = flagsSchema.safeParse(o);
        if (success) {
            this.overrides = data;
        }
    }
    save() {
        for (const flag of this.flags.values()) {
            if (flag.isOverridden()) {
                this.overrides[flag.id] = flag.state;
            }
            else {
                delete this.overrides[flag.id];
            }
        }
        this.store.save(this.overrides);
    }
}
class FlagImpl {
    registry;
    state;
    id;
    name;
    description;
    defaultValue;
    devOnly;
    constructor(registry, state, settings) {
        this.registry = registry;
        this.id = settings.id;
        this.state = state;
        this.description = settings.description;
        this.defaultValue = settings.defaultValue;
        this.name = settings.name ?? settings.id;
        this.devOnly = settings.devOnly || false;
    }
    get() {
        switch (this.state) {
            case feature_flag_1.OverrideState.TRUE:
                return true;
            case feature_flag_1.OverrideState.FALSE:
                return false;
            case feature_flag_1.OverrideState.DEFAULT:
            default:
                return this.defaultValue;
        }
    }
    set(value) {
        const next = value ? feature_flag_1.OverrideState.TRUE : feature_flag_1.OverrideState.FALSE;
        if (this.state === next) {
            return;
        }
        this.state = next;
        this.registry.save();
    }
    overriddenState() {
        return this.state;
    }
    reset() {
        this.state = feature_flag_1.OverrideState.DEFAULT;
        this.registry.save();
    }
    isOverridden() {
        return this.state !== feature_flag_1.OverrideState.DEFAULT;
    }
}
class LocalStorageStore {
    static KEY = 'perfettoFeatureFlags';
    load() {
        const s = localStorage.getItem(LocalStorageStore.KEY);
        let parsed;
        try {
            parsed = JSON.parse(s ?? '{}');
        }
        catch (e) {
            return {};
        }
        if (typeof parsed !== 'object' || parsed === null) {
            return {};
        }
        return parsed;
    }
    save(o) {
        const s = JSON.stringify(o);
        localStorage.setItem(LocalStorageStore.KEY, s);
    }
}
exports.FlagsForTesting = Flags;
exports.featureFlags = new Flags(new LocalStorageStore());
//# sourceMappingURL=feature_flags.js.map