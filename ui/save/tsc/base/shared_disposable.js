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
exports.SharedAsyncDisposable = void 0;
const logging_1 = require("./logging");
/**
 * Adds reference counting to an AsyncDisposable.
 *
 * Allows you to share a disposable amongst multiple different entities which
 * may have differing lifecycles, and only have the resource cleared up once all
 * components have called dispose on it.
 *
 * @example
 * ```ts
 * {
 *   // Create a shared disposable around an arbitrary disposable resource
 *   await using sharedResource = SharedAsyncDisposable.wrap(resource);
 *
 *   // Pass a the shared resource somewhere else (notice we don't await here,
 *   // which detaches their lifecycle from ours - i.e. we don't know which task
 *   // will finish first, us or them)
 *   doStuff(sharedResource);
 *
 *   // Do something with the resource
 *   await sharedResource.get().doStuff(...);
 *
 *   // Our shard resource is disposed here, but the underlying resource will
 *   // only be disposed once doStuff() is done with it too
 * }
 *
 * // --cut--
 *
 * async function doStuff(shared) {
 *   await using res = shared.clone();
 *
 *   // Do stuff with the resource
 *   await res.get().doStuff(...);
 *
 *   // res is automatically disposed here
 * }
 * ```
 */
class SharedAsyncDisposable {
    // A shared core which is referenced by al instances of this class used to
    // store the reference count
    sharedCore;
    // This is our underlying disposable
    disposable;
    // Record of whether this instance is disposed (not whether the underlying
    // instance is disposed)
    _isDisposed = false;
    /**
     * Create a new shared disposable object from an arbitrary disposable.
     *
     * @param disposable The disposable object to wrap.
     * @returns A new SharedAsyncDisposable object.
     */
    static wrap(disposable) {
        return new SharedAsyncDisposable(disposable);
    }
    constructor(disposable, sharedCore) {
        this.disposable = disposable;
        if (!sharedCore) {
            this.sharedCore = { refCount: 1 };
        }
        else {
            this.sharedCore = sharedCore;
        }
    }
    /**
     * Check whether this is disposed. If true, clone() and
     * [Symbol.asyncDispose]() will return throw. Can be used to check state
     * before cloning.
     */
    get isDisposed() {
        return this._isDisposed;
    }
    /**
     * @returns The underlying disposable.
     */
    get() {
        return this.disposable;
    }
    /**
     * Create a clone of this object, incrementing the reference count.
     *
     * @returns A new shared disposable instance.
     */
    clone() {
        // Cloning again after dispose indicates invalid usage
        (0, logging_1.assertFalse)(this._isDisposed);
        this.sharedCore.refCount++;
        return new SharedAsyncDisposable(this.disposable, this.sharedCore);
    }
    /**
     * Dispose of this object, decrementing the reference count. If the reference
     * count drops to 0, the underlying disposable is disposed.
     */
    async [Symbol.asyncDispose]() {
        // Disposing multiple times indicates invalid usage
        (0, logging_1.assertFalse)(this._isDisposed);
        this._isDisposed = true;
        this.sharedCore.refCount--;
        if (this.sharedCore.refCount === 0) {
            await this.disposable[Symbol.asyncDispose]();
        }
    }
}
exports.SharedAsyncDisposable = SharedAsyncDisposable;
//# sourceMappingURL=shared_disposable.js.map