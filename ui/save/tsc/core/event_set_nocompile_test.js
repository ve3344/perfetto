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
exports.eventMustHaveAllKeys = eventMustHaveAllKeys;
exports.eventMustNotHaveExtraKeys = eventMustNotHaveExtraKeys;
exports.eventsCanBeWellFormed = eventsCanBeWellFormed;
exports.badMaterialisation = badMaterialisation;
const event_set_1 = require("./event_set");
function eventMustHaveAllKeys() {
    const ks = {
        id: event_set_1.Id,
        foo: event_set_1.Str,
    };
    // @ts-expect-error
    const event = {
        id: 'myid',
    };
    return event;
}
function eventMustNotHaveExtraKeys() {
    const ks = {
        id: event_set_1.Id,
        foo: event_set_1.Str,
        bar: event_set_1.Num,
        baz: event_set_1.Bool,
        xyzzy: event_set_1.Null,
    };
    const event = {
        id: 'myid',
        foo: 'foo',
        bar: 32,
        baz: false,
        xyzzy: null,
        // @ts-expect-error
        plugh: 42,
    };
    return event;
}
function eventsCanBeWellFormed() {
    const ks = {
        id: event_set_1.Id,
        foo: event_set_1.Str,
        bar: event_set_1.Num,
        baz: event_set_1.Bool,
        xyzzy: event_set_1.Null,
    };
    const event = {
        id: 'myid',
        foo: 'foo',
        bar: 32,
        baz: false,
        xyzzy: null,
    };
    return event;
}
const lettersKeySet = {
    num: event_set_1.Num,
    char: event_set_1.Str,
};
async function badMaterialisation(input) {
    {
        const a = await input.materialise({
            baz: event_set_1.Num,
        });
        // @ts-expect-error
        a.events;
    }
    {
        // This is fine:
        const a = await input.materialise(lettersKeySet);
        a.events;
    }
    {
        // So is this:
        const a = await input.materialise({
            num: event_set_1.Num,
            char: event_set_1.Str,
        });
        a.events;
    }
    return input;
}
//# sourceMappingURL=event_set_nocompile_test.js.map