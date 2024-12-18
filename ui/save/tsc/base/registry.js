"use strict";
// Copyright (C) 2018 The Android Open Source Project
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
exports.Registry = exports.RegistryError = void 0;
class RegistryError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}
exports.RegistryError = RegistryError;
class Registry {
    key;
    registry;
    static kindRegistry() {
        return new Registry((t) => t.kind);
    }
    constructor(key) {
        this.registry = new Map();
        this.key = key;
    }
    register(registrant) {
        const kind = this.key(registrant);
        if (this.registry.has(kind)) {
            throw new RegistryError(`Registrant ${kind} already exists in the registry`);
        }
        this.registry.set(kind, registrant);
        return {
            [Symbol.dispose]: () => this.registry.delete(kind),
        };
    }
    has(kind) {
        return this.registry.has(kind);
    }
    get(kind) {
        const registrant = this.registry.get(kind);
        if (registrant === undefined) {
            throw new RegistryError(`${kind} has not been registered.`);
        }
        return registrant;
    }
    tryGet(kind) {
        return this.registry.get(kind);
    }
    // Support iteration: for (const foo of fooRegistry.values()) { ... }
    *values() {
        yield* this.registry.values();
    }
    valuesAsArray() {
        return Array.from(this.values());
    }
    unregisterAllForTesting() {
        this.registry.clear();
    }
}
exports.Registry = Registry;
//# sourceMappingURL=registry.js.map