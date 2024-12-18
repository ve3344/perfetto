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
exports.EvtSource = void 0;
/**
 * Example usage:
 *
 * interface OnLoadArgs {loadTime: number};
 *
 * class MyClass {
 *  readonly onLoad = new EvtSource<OnLoadArgs>();
 *
 *  private doLoad() {
 *   this.onLoad.notify({loadTime: 42});
 *  }
 * }
 *
 * const myClass = new MyClass();
 * const listener = (args) => console.log('Load time', args.loadTime);
 * trash = new DisposableStack();
 * trash.use(myClass.onLoad.listen(listener));
 * ...
 * trash.dispose();
 */
class EvtSource {
    listeners = [];
    /**
     * Registers a new event listener.
     * @param listener The listener to be called when the event is fired.
     * @returns a Disposable object that will remove the listener on dispose.
     */
    addListener(listener) {
        const listeners = this.listeners;
        listeners.push(listener);
        return {
            [Symbol.dispose]() {
                // Erase the handler from the array. (splice(length, 1) is a no-op).
                const pos = listeners.indexOf(listener);
                listeners.splice(pos >= 0 ? pos : listeners.length, 1);
            },
        };
    }
    /**
     * Fires the event, invoking all registered listeners with the provided data.
     * @param args The data to be passed to the listeners.
     * @returns a promise that resolves when all the listeners have fulfilled
     * their promise - if they returned one - otherwise resolves immediately.
     */
    async notify(args) {
        const promises = [];
        for (const listener of this.listeners) {
            promises.push(Promise.resolve(listener(args)));
        }
        await Promise.allSettled(promises);
    }
}
exports.EvtSource = EvtSource;
//# sourceMappingURL=events.js.map