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
exports.exists = exists;
exports.escapeCSSSelector = escapeCSSSelector;
exports.getOrCreate = getOrCreate;
exports.createProxy = createProxy;
// Return true if value is not nullish - i.e. not null or undefined
// Allows doing the following
//   exists(val) && m('div', val)
// Even if val is a non-nullish falsey value like 0 or ''
function exists(value) {
    return value !== undefined && value !== null;
}
// Escape characters that are not allowed inside a css selector
function escapeCSSSelector(selector) {
    return selector.replace(/([!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~])/g, '\\$1');
}
function getOrCreate(map, key, factory) {
    let value = map.get(key);
    if (value !== undefined)
        return value;
    value = factory();
    map.set(key, value);
    return value;
}
// Allows to take an existing class instance (`target`) and override some of its
// methods via `overrides`. We use this for cases where we want to expose a
// "manager" (e.g. TrackManager, SidebarManager) to the plugins, but we want to
// override few of its methods (e.g. to inject the pluginId in the args).
function createProxy(target, overrides) {
    return new Proxy(target, {
        get: (target, prop, receiver) => {
            // If the property is overriden, use that; otherwise, use target
            const overrideValue = overrides[prop];
            if (overrideValue !== undefined) {
                return typeof overrideValue === 'function'
                    ? overrideValue.bind(overrides)
                    : overrideValue;
            }
            const baseValue = Reflect.get(target, prop, receiver);
            return typeof baseValue === 'function'
                ? baseValue.bind(target)
                : baseValue;
        },
    });
}
//# sourceMappingURL=utils.js.map