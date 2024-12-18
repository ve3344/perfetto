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
const feature_flags_1 = require("../core/feature_flags");
class TestFlagStore {
    o = {};
    load() {
        return this.o;
    }
    save(o) {
        this.o = o;
    }
}
test('create flag', () => {
    const flags = new feature_flags_1.FlagsForTesting(new TestFlagStore());
    const myFlag = flags.register({
        id: 'myFlag',
        defaultValue: false,
        description: '',
    });
    expect(myFlag.get()).toEqual(false);
    expect(myFlag.isOverridden()).toEqual(false);
});
test('registering the same flag twice is an error', () => {
    const flags = new feature_flags_1.FlagsForTesting(new TestFlagStore());
    flags.register({
        id: 'foo',
        defaultValue: false,
        description: '',
    });
    expect(() => flags.register({
        id: 'foo',
        defaultValue: false,
        description: '',
    })).toThrow('Flag with id "foo" is already registered.');
});
test('can override', () => {
    const flags = new feature_flags_1.FlagsForTesting(new TestFlagStore());
    const foo = flags.register({
        id: 'foo',
        defaultValue: false,
        description: '',
    });
    foo.set(true);
    expect(foo.isOverridden()).toEqual(true);
    expect(foo.get()).toEqual(true);
});
test('overrides are persisted', () => {
    const store = new TestFlagStore();
    const flagsA = new feature_flags_1.FlagsForTesting(store);
    const fooA = flagsA.register({
        id: 'foo',
        defaultValue: true,
        description: 'some description',
    });
    fooA.set(true);
    const flagsB = new feature_flags_1.FlagsForTesting(store);
    const fooB = flagsB.register({
        id: 'foo',
        defaultValue: false,
        description: 'a new description',
    });
    expect(fooB.get()).toEqual(true);
    expect(fooB.isOverridden()).toEqual(true);
});
test('flags can be reset', () => {
    const flags = new feature_flags_1.FlagsForTesting(new TestFlagStore());
    const foo = flags.register({
        id: 'foo',
        defaultValue: false,
        description: 'some description',
    });
    foo.set(false);
    foo.reset();
    expect(foo.get()).toEqual(false);
    expect(foo.isOverridden()).toEqual(false);
});
test('corrupt store is ignored', () => {
    class Store {
        load() {
            return { foo: 'bad state' };
        }
        save(_) { }
    }
    const flags = new feature_flags_1.FlagsForTesting(new Store());
    const foo = flags.register({
        id: 'foo',
        defaultValue: false,
        description: 'some description',
    });
    expect(foo.isOverridden()).toEqual(false);
});
//# sourceMappingURL=feature_flags_unittest.js.map