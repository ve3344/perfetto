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
exports.AsyncDisposableStack = exports.DisposableStack = void 0;
/**
 * Implementations of DisposableStack and AsyncDisposableStack.
 *
 * These are defined in the "ECMAScript Explicit Resource Management" proposal
 * which is currently at stage 3, which means "No changes to the proposal are
 * expected, but some necessary changes may still occur due to web
 * incompatibilities or feedback from production-grade implementations."
 *
 * Reference
 * - https://github.com/tc39/proposal-explicit-resource-management
 * - https://tc39.es/process-document/
 *
 * These classes are purposely not polyfilled to avoid confusion and aid
 * debug-ability and traceability.
 */
class DisposableStack {
    resources;
    isDisposed = false;
    constructor() {
        this.resources = [];
    }
    use(res) {
        if (res == null)
            return res;
        this.resources.push(res);
        return res;
    }
    defer(onDispose) {
        this.resources.push({
            [Symbol.dispose]: onDispose,
        });
    }
    // TODO(stevegolton): Handle error suppression properly
    // https://github.com/tc39/proposal-explicit-resource-management?tab=readme-ov-file#aggregation
    [Symbol.dispose]() {
        this.isDisposed = true;
        while (true) {
            const res = this.resources.pop();
            if (res === undefined) {
                break;
            }
            res[Symbol.dispose]();
        }
    }
    dispose() {
        this[Symbol.dispose]();
    }
    adopt(value, onDispose) {
        this.resources.push({
            [Symbol.dispose]: () => onDispose(value),
        });
        return value;
    }
    move() {
        const other = new DisposableStack();
        for (const res of this.resources) {
            other.resources.push(res);
        }
        this.resources.length = 0;
        return other;
    }
    [Symbol.toStringTag] = 'DisposableStack';
    get disposed() {
        return this.isDisposed;
    }
}
exports.DisposableStack = DisposableStack;
class AsyncDisposableStack {
    resources;
    isDisposed = false;
    constructor() {
        this.resources = [];
    }
    use(res) {
        if (res == null)
            return res;
        if (Symbol.asyncDispose in res) {
            this.resources.push(res);
        }
        else if (Symbol.dispose in res) {
            this.resources.push({
                [Symbol.asyncDispose]: async () => {
                    res[Symbol.dispose]();
                },
            });
        }
        return res;
    }
    defer(onDispose) {
        this.resources.push({
            [Symbol.asyncDispose]: onDispose,
        });
    }
    // TODO(stevegolton): Handle error suppression properly
    // https://github.com/tc39/proposal-explicit-resource-management?tab=readme-ov-file#aggregation
    async [Symbol.asyncDispose]() {
        this.isDisposed = true;
        while (true) {
            const res = this.resources.pop();
            if (res === undefined) {
                break;
            }
            const timerId = setTimeout(() => {
                throw new Error('asyncDispose timed out. This might be due to a Disposable ' +
                    'resource  trying to issue cleanup queries on trace unload, ' +
                    'while the Wasm module was already destroyed ');
            }, 10_000);
            await res[Symbol.asyncDispose]();
            clearTimeout(timerId);
        }
    }
    asyncDispose() {
        return this[Symbol.asyncDispose]();
    }
    adopt(value, onDispose) {
        this.resources.push({
            [Symbol.asyncDispose]: async () => onDispose(value),
        });
        return value;
    }
    move() {
        const other = new AsyncDisposableStack();
        for (const res of this.resources) {
            other.resources.push(res);
        }
        this.resources.length = 0;
        return other;
    }
    [Symbol.toStringTag] = 'AsyncDisposableStack';
    get disposed() {
        return this.isDisposed;
    }
}
exports.AsyncDisposableStack = AsyncDisposableStack;
//# sourceMappingURL=disposable_stack.js.map