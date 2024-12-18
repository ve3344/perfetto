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
const store_1 = require("./store");
const utils_1 = require("./utils");
function migrateFoo(init) {
    const migrated = {
        counter: 123,
        nested: {
            value: 456,
        },
    };
    if ((0, utils_1.exists)(init) && typeof init === 'object') {
        if ('counter' in init && typeof init.counter === 'number') {
            migrated.counter = init.counter;
        }
        if ('nested' in init && typeof init.nested === 'object' && init.nested) {
            if ('value' in init.nested && typeof init.nested.value === 'number') {
                migrated.nested.value = init.nested.value;
            }
        }
    }
    console.log('migrating', init);
    return migrated;
}
const initialState = {
    foo: {
        counter: 0,
        nested: {
            value: 42,
        },
    },
};
describe('root store', () => {
    test('edit', () => {
        const store = (0, store_1.createStore)(initialState);
        store.edit((draft) => {
            draft.foo.counter += 123;
        });
        expect(store.state).toEqual({
            foo: {
                counter: 123,
                nested: {
                    value: 42,
                },
            },
        });
    });
    test('state [in]equality', () => {
        const store = (0, store_1.createStore)(initialState);
        store.edit((draft) => {
            draft.foo.counter = 88;
        });
        expect(store.state).not.toBe(initialState);
        expect(store.state.foo).not.toBe(initialState.foo);
        expect(store.state.foo.nested).toBe(initialState.foo.nested);
    });
    it('can take multiple edits at once', () => {
        const store = (0, store_1.createStore)(initialState);
        const callback = jest.fn();
        store.subscribe(callback);
        store.edit([
            (draft) => {
                draft.foo.counter += 10;
            },
            (draft) => {
                draft.foo.counter += 10;
            },
        ]);
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(store, initialState);
        expect(store.state).toEqual({
            foo: {
                counter: 20,
                nested: {
                    value: 42,
                },
            },
        });
    });
    it('can support a huge number of edits', () => {
        const store = (0, store_1.createStore)(initialState);
        const N = 100_000;
        const edits = Array(N).fill((draft) => {
            draft.foo.counter++;
        });
        store.edit(edits);
        expect(store.state.foo.counter).toEqual(N);
    });
    it('notifies subscribers', () => {
        const store = (0, store_1.createStore)(initialState);
        const callback = jest.fn();
        store.subscribe(callback);
        store.edit((draft) => {
            draft.foo.counter += 1;
        });
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(store, initialState);
    });
    it('does not notify unsubscribed subscribers', () => {
        const store = (0, store_1.createStore)(initialState);
        const callback = jest.fn();
        // Subscribe then immediately unsubscribe
        store.subscribe(callback)[Symbol.dispose]();
        // Make an arbitrary edit
        store.edit((draft) => {
            draft.foo.counter += 1;
        });
        expect(callback).not.toHaveBeenCalled();
    });
});
describe('sub-store', () => {
    test('edit', () => {
        const store = (0, store_1.createStore)(initialState);
        const subStore = store.createSubStore(['foo'], (x) => x);
        subStore.edit((draft) => {
            draft.counter += 1;
        });
        expect(subStore.state).toEqual({
            counter: 1,
            nested: {
                value: 42,
            },
        });
        expect(store.state).toEqual({
            foo: {
                counter: 1,
                nested: {
                    value: 42,
                },
            },
        });
    });
    test('edit from root store', () => {
        const store = (0, store_1.createStore)(initialState);
        const subStore = store.createSubStore(['foo'], (x) => x);
        store.edit((draft) => {
            draft.foo.counter += 1;
        });
        expect(subStore.state).toEqual({
            counter: 1,
            nested: {
                value: 42,
            },
        });
    });
    it('can create more substores and edit', () => {
        const store = (0, store_1.createStore)(initialState);
        const fooState = store.createSubStore(['foo'], (x) => x);
        const nestedStore = fooState.createSubStore(['nested'], (x) => x);
        nestedStore.edit((draft) => {
            draft.value += 1;
        });
        expect(nestedStore.state).toEqual({
            value: 43,
        });
    });
    it('notifies subscribers', () => {
        const store = (0, store_1.createStore)(initialState);
        const subStore = store.createSubStore(['foo'], (x) => x);
        const callback = jest.fn();
        subStore.subscribe(callback);
        subStore.edit((draft) => {
            draft.counter += 1;
        });
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(subStore, initialState.foo);
    });
    it('does not notify unsubscribed subscribers', () => {
        const store = (0, store_1.createStore)(initialState);
        const subStore = store.createSubStore(['foo'], (x) => x);
        const callback = jest.fn();
        // Subscribe then immediately unsubscribe
        subStore.subscribe(callback)[Symbol.dispose]();
        // Make an arbitrary edit
        subStore.edit((draft) => {
            draft.counter += 1;
        });
        expect(callback).not.toHaveBeenCalled();
    });
    it('handles reading when path doesn\t exist in root store', () => {
        const store = (0, store_1.createStore)(initialState);
        // This target node is missing - baz doesn't exist in State
        const subStore = store.createSubStore(['baz'], (x) => x);
        expect(subStore.state).toBe(undefined);
    });
    it("handles edit when path doesn't exist in root store", () => {
        const store = (0, store_1.createStore)(initialState);
        const value = {
            counter: 123,
            nested: {
                value: 456,
            },
        };
        // This target node is missing - baz doesn't exist in State
        const subStore = store.createSubStore(['baz', 'quux'], () => value);
        // Edits should work just fine, but the root store will not be modified.
        subStore.edit((draft) => {
            draft.counter += 1;
        });
    });
    it('check subscriber only called once when edits made to undefined root path', () => {
        const store = (0, store_1.createStore)(initialState);
        const value = {
            counter: 123,
            nested: {
                value: 456,
            },
        };
        const callback = jest.fn();
        // This target node is missing - baz doesn't exist in State
        const subStore = store.createSubStore(['baz', 'quux'], () => value);
        subStore.subscribe(callback);
        // Edits should work just fine, but the root store will not be modified.
        subStore.edit((draft) => {
            draft.counter += 1;
        });
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(subStore, value);
    });
    it("notifies subscribers even when path doesn't exist in root store", () => {
        const store = (0, store_1.createStore)(initialState);
        const value = {
            counter: 123,
            nested: {
                value: 456,
            },
        };
        const subStore = store.createSubStore(['baz', 'quux'], () => value);
        const callback = jest.fn();
        subStore.subscribe(callback);
        subStore.edit((draft) => {
            draft.counter += 1;
        });
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(subStore, value);
    });
    it('notifies when relevant edits are made from root store', () => {
        const store = (0, store_1.createStore)(initialState);
        const subStore = store.createSubStore(['foo'], (x) => x);
        const callback = jest.fn();
        // Subscribe on the proxy store
        subStore.subscribe(callback);
        // Edit the subtree from the root store
        store.edit((draft) => {
            draft.foo.counter++;
        });
        // Expect proxy callback called with correct subtree
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(subStore, initialState.foo);
    });
    it('ignores irrelevant edits from the root store', () => {
        const store = (0, store_1.createStore)(initialState);
        const nestedStore = store.createSubStore(['foo', 'nested'], (x) => x);
        const callback = jest.fn();
        // Subscribe on the proxy store
        nestedStore.subscribe(callback);
        // Edit an irrelevant subtree on the root store
        store.edit((draft) => {
            draft.foo.counter++;
        });
        // Ensure proxy callback hasn't been called
        expect(callback).not.toHaveBeenCalled();
    });
    it('immutable [in]equality works', () => {
        const store = (0, store_1.createStore)(initialState);
        const subStore = store.createSubStore(['foo'], migrateFoo);
        const before = subStore.state;
        subStore.edit((draft) => {
            draft.counter += 1;
        });
        const after = subStore.state;
        // something has changed so root should not equal
        expect(before).not.toBe(after);
        // nested has not changed and so should be the before version.
        expect(before.nested).toBe(after.nested);
    });
    // This test depends on the migrate function - if it attempts to preserve
    // equality then we might have a chance, but our migrate function here does
    // not, and I'm not sure we can expect people do provide one that does.
    // TODO(stevegolton): See if we can get this working, regardless of migrate
    // function implementation.
    it.skip('unrelated state refs are still equal when modified from root store', () => {
        const store = (0, store_1.createStore)(initialState);
        const subStore = store.createSubStore(['foo'], migrateFoo);
        const before = subStore.state;
        // Check that unrelated state is still the same even though subtree is
        // modified from the root store
        store.edit((draft) => {
            draft.foo.counter = 1234;
        });
        expect(before.nested).toBe(subStore.state.nested);
        expect(subStore.state.counter).toBe(1234);
    });
    it('works when underlying state is undefined', () => {
        const store = (0, store_1.createStore)({ dict: {} });
        const migrate = (init) => (init ?? { bar: 'bar' });
        const subStore = store.createSubStore(['dict', 'foo'], migrate);
        // Check initial migration works, yet underlying store is untouched
        expect(subStore.state.bar).toBe('bar');
        expect(store.state.dict['foo']).toBe(undefined);
        // Check updates work
        subStore.edit((draft) => {
            draft.bar = 'baz';
        });
        expect(subStore.state.bar).toBe('baz');
        expect(store.state.dict['foo'].bar).toBe('baz');
    });
    test('chained substores', () => {
        const store = (0, store_1.createStore)({ dict: {} });
        const DEFAULT_FOO_STATE = { bar: { baz: 'abc' } };
        const fooStore = store.createSubStore(['dict', 'foo'], (init) => init ?? DEFAULT_FOO_STATE);
        const subFooStore = fooStore.createSubStore(['bar'], (x) => x);
        // Since the entry for 'foo' will be undefined in the dict, we expect the
        // migrate function on fooStore to return DEFAULT_FOO_STATE, and thus the
        // state of the subFooStore will be DEFAULT_FOO_STATE.bar.
        expect(subFooStore.state).toEqual({ baz: 'abc' });
    });
});
//# sourceMappingURL=store_unittest.js.map