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
const deferred_1 = require("./deferred");
const disposable_stack_1 = require("./disposable_stack");
const events_1 = require("./events");
describe('Events', () => {
    test('voidEvent', () => {
        const ev = new events_1.EvtSource();
        const calls = [];
        ev.addListener(() => calls.push('listener1'));
        ev.addListener(() => calls.push('listener2'));
        ev.notify();
        expect(calls).toEqual(['listener1', 'listener2']);
        ev.notify();
        expect(calls).toEqual(['listener1', 'listener2', 'listener1', 'listener2']);
    });
    test('eventWithArgs', () => {
        const ev = new events_1.EvtSource();
        const argsReceived = new Array();
        ev.addListener((n) => argsReceived.push(n));
        ev.notify(1);
        ev.notify(2);
        expect(argsReceived).toEqual([1, 2]);
    });
    test('asyncEvent', async () => {
        const ev = new events_1.EvtSource();
        const argsReceived = new Array();
        ev.addListener((n) => {
            const promise = (0, deferred_1.defer)();
            setTimeout(() => {
                argsReceived.push(n);
                promise.resolve();
            }, 0);
            return promise;
        });
        await ev.notify(1);
        await ev.notify(2);
        await ev.notify(3);
        expect(argsReceived).toEqual([1, 2, 3]);
    });
    test('dispose', () => {
        const ev = new events_1.EvtSource();
        const calls = [];
        const trash = new disposable_stack_1.DisposableStack();
        trash.use(ev.addListener(() => calls.push('listener1')));
        trash.use(ev.addListener(() => calls.push('listener2')));
        ev.notify();
        expect(calls).toEqual(['listener1', 'listener2']);
        calls.splice(0);
        trash.dispose();
        ev.notify();
        expect(calls).toEqual([]);
        trash.use(ev.addListener(() => calls.push('listener3')));
        ev.notify();
        expect(calls).toEqual(['listener3']);
    });
});
//# sourceMappingURL=events_unittest.js.map