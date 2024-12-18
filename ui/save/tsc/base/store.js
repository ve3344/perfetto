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
exports.createStore = createStore;
const immer_1 = require("immer");
const object_utils_1 = require("./object_utils");
/**
 * Create a new root-level store.
 *
 * @template T The type of this store's state.
 * @param {T} initialState Initial state of the store.
 * @returns {Store<T>} The newly created store.
 */
function createStore(initialState) {
    return new RootStore(initialState);
}
/**
 * This class implements a standalone store (i.e. one that does not depend on a
 * subtree of another store).
 * @template T The type of the store's state.
 */
class RootStore {
    internalState;
    subscriptions = new Set();
    constructor(initialState) {
        // Run initial state through immer to take advantage of auto-freezing
        this.internalState = (0, immer_1.produce)(initialState, () => { });
    }
    get state() {
        return this.internalState;
    }
    edit(edit) {
        if (Array.isArray(edit)) {
            this.applyEdits(edit);
        }
        else {
            this.applyEdits([edit]);
        }
    }
    applyEdits(edits) {
        const originalState = this.internalState;
        const newState = edits.reduce((state, edit) => {
            return (0, immer_1.produce)(state, edit);
        }, originalState);
        this.internalState = newState;
        // Notify subscribers
        this.subscriptions.forEach((sub) => {
            sub(this, originalState);
        });
    }
    createSubStore(path, migrate) {
        return new SubStore(this, path, migrate);
    }
    subscribe(callback) {
        this.subscriptions.add(callback);
        return {
            [Symbol.dispose]: () => {
                this.subscriptions.delete(callback);
            },
        };
    }
    [Symbol.dispose]() {
        // No-op
    }
}
/**
 * This class implements a sub-store, one that is based on a subtree of another
 * store. The parent store can be a root level store or another sub-store.
 *
 * This particular implementation of a sub-tree implements a write-through cache
 * style implementation. The sub-store's state is cached internally and all
 * edits are written through to the parent store as with a best-effort approach.
 * If the subtree does not exist in the parent store, an error is printed to
 * the console but the operation is still treated as a success.
 *
 * @template T The type of the sub-store's state.
 * @template ParentT The type of the parent store's state.
 */
class SubStore {
    parentStore;
    path;
    migrate;
    parentState;
    cachedState;
    parentStoreSubscription;
    subscriptions = new Set();
    constructor(parentStore, path, migrate) {
        this.parentStore = parentStore;
        this.path = path;
        this.migrate = migrate;
        this.parentState = (0, object_utils_1.getPath)(this.parentStore.state, this.path);
        // Run initial state through immer to take advantage of auto-freezing
        this.cachedState = (0, immer_1.produce)(migrate(this.parentState), () => { });
        // Subscribe to parent store changes.
        this.parentStoreSubscription = this.parentStore.subscribe(() => {
            const newRootState = (0, object_utils_1.getPath)(this.parentStore.state, this.path);
            if (newRootState !== this.parentState) {
                this.subscriptions.forEach((callback) => {
                    callback(this, this.cachedState);
                });
            }
        });
    }
    get state() {
        const parentState = (0, object_utils_1.getPath)(this.parentStore.state, this.path);
        if (this.parentState === parentState) {
            return this.cachedState;
        }
        else {
            this.parentState = parentState;
            return (this.cachedState = (0, immer_1.produce)(this.cachedState, () => {
                return this.migrate(parentState);
            }));
        }
    }
    edit(edit) {
        if (Array.isArray(edit)) {
            this.applyEdits(edit);
        }
        else {
            this.applyEdits([edit]);
        }
    }
    applyEdits(edits) {
        const originalState = this.cachedState;
        const newState = edits.reduce((state, edit) => {
            return (0, immer_1.produce)(state, edit);
        }, originalState);
        this.parentState = newState;
        try {
            this.parentStore.edit((draft) => {
                (0, object_utils_1.setPath)(draft, this.path, newState);
            });
        }
        catch (error) {
            if (error instanceof TypeError) {
                console.warn('Failed to update parent store at ', this.path);
            }
            else {
                throw error;
            }
        }
        this.cachedState = newState;
        this.subscriptions.forEach((sub) => {
            sub(this, originalState);
        });
    }
    createSubStore(path, migrate) {
        return new SubStore(this, path, migrate);
    }
    subscribe(callback) {
        this.subscriptions.add(callback);
        return {
            [Symbol.dispose]: () => {
                this.subscriptions.delete(callback);
            },
        };
    }
    [Symbol.dispose]() {
        this.parentStoreSubscription[Symbol.dispose]();
    }
}
//# sourceMappingURL=store.js.map