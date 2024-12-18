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
const event_set_1 = require("./event_set");
describe('EventSet', () => {
    test('Event', () => {
        {
            const keyset = {};
            const event = {
                id: 'foo',
            };
            void event;
        }
        {
            const keyset = {
                bar: event_set_1.Num,
            };
            const event = {
                id: 'foo',
                bar: 42,
            };
            void event;
        }
    });
    describe('EmptyEventSet', () => {
        test('isEmpty', async () => {
            const events = event_set_1.EmptyEventSet.get();
            expect(await events.isEmpty()).toEqual(true);
            expect(await events.count()).toEqual(0);
        });
        test('isEmptyEventSet', () => {
            const events = event_set_1.EmptyEventSet.get();
            expect((0, event_set_1.isEmptyEventSet)(events)).toEqual(true);
        });
        test('materialise', async () => {
            const events = event_set_1.EmptyEventSet.get();
            const materialised = await events.materialise({});
            expect(await materialised.isEmpty()).toEqual(true);
            expect(await materialised.count()).toEqual(0);
            expect(materialised.events).toEqual([]);
            expect((0, event_set_1.isConcreteEventSet)(materialised)).toEqual(true);
        });
        test('union', async () => {
            const a = event_set_1.EmptyEventSet.get();
            const b = event_set_1.EmptyEventSet.get();
            const aUnionB = a.union(b);
            expect(await aUnionB.isEmpty()).toEqual(true);
            expect(await aUnionB.count()).toEqual(0);
        });
        test('intersect', async () => {
            const a = event_set_1.EmptyEventSet.get();
            const b = event_set_1.EmptyEventSet.get();
            const aIntersectB = a.intersect(b);
            expect(await aIntersectB.isEmpty()).toEqual(true);
            expect(await aIntersectB.count()).toEqual(0);
        });
        test('filter', async () => {
            const events = event_set_1.EmptyEventSet.get();
            const filtered = await events.filter((0, event_set_1.c)(true));
            expect(filtered).toBe(events);
            expect(await filtered.isEmpty()).toEqual(true);
            expect(await filtered.count()).toEqual(0);
        });
        test('sort', async () => {
            const events = event_set_1.EmptyEventSet.get();
            const sorted = await events.sort({
                direction: event_set_1.Direction.ASC,
                expression: (0, event_set_1.c)(0),
            });
            expect(sorted).toBe(events);
            expect(await sorted.isEmpty()).toEqual(true);
            expect(await sorted.count()).toEqual(0);
        });
    });
    describe('ConcreteEventSet', () => {
        test('isEmpty', async () => {
            const event = {
                id: 'foo',
            };
            const empty = new event_set_1.ConcreteEventSet({}, []);
            const events = new event_set_1.ConcreteEventSet({}, [event]);
            expect(await empty.isEmpty()).toEqual(true);
            expect(await empty.count()).toEqual(0);
            expect(await events.isEmpty()).toEqual(false);
            expect(await events.count()).toEqual(1);
        });
        test('isConcreteEventSet', () => {
            expect((0, event_set_1.isConcreteEventSet)(new event_set_1.ConcreteEventSet({}, []))).toEqual(true);
            expect((0, event_set_1.isConcreteEventSet)(event_set_1.EmptyEventSet.get())).toEqual(false);
        });
        test('materialise', async () => {
            const keys = {
                num: event_set_1.Num,
                char: event_set_1.Str,
            };
            const a = {
                id: 'a',
                num: 97,
                char: 'a',
            };
            const b = {
                id: 'b',
                num: 98,
                char: 'b',
            };
            const d = {
                id: 'd',
                num: 100,
                char: 'd',
            };
            const events = new event_set_1.ConcreteEventSet(keys, [a, b, d]);
            expect((await events.materialise(keys)).events).toEqual([a, b, d]);
            expect((await events.materialise(keys, 1)).events).toEqual([b, d]);
            expect((await events.materialise(keys, 1, 1)).events).toEqual([b]);
            expect((await events.materialise(keys, 99)).events).toEqual([]);
            expect((await events.materialise(keys, 99, 0)).events).toEqual([]);
            expect((await events.materialise({ num: event_set_1.Num })).events).toEqual([
                { id: 'a', num: 97 },
                { id: 'b', num: 98 },
                { id: 'd', num: 100 },
            ]);
            expect((await events.materialise({ char: event_set_1.Str }, 1, 1)).events).toEqual([
                { id: 'b', char: 'b' },
            ]);
        });
        test('union', async () => {
            const a = {
                id: 'a',
            };
            const b = {
                id: 'b',
            };
            const d = {
                id: 'd',
            };
            const empty = event_set_1.EmptyEventSet.get();
            const justA = new event_set_1.ConcreteEventSet({}, [a]);
            const justB = new event_set_1.ConcreteEventSet({}, [b]);
            const justD = new event_set_1.ConcreteEventSet({}, [d]);
            const aAndB = justA.union(justB);
            const aAndA = justA.union(justA);
            const aAndD = justA.union(justD);
            const aAndBAndEmpty = aAndB.union(empty);
            const aAndDAndAAndB = aAndD.union(aAndB);
            expect((await aAndB.materialise({})).events).toEqual([a, b]);
            expect((await aAndA.materialise({})).events).toEqual([a]);
            expect((await aAndD.materialise({})).events).toEqual([a, d]);
            expect((await aAndBAndEmpty.materialise({})).events).toEqual([a, b]);
            expect((await aAndDAndAAndB.materialise({})).events).toEqual([a, d, b]);
            expect(await aAndB.isEmpty()).toEqual(false);
            expect(await aAndA.isEmpty()).toEqual(false);
            expect(await aAndD.isEmpty()).toEqual(false);
            expect(await aAndBAndEmpty.isEmpty()).toEqual(false);
            expect(await aAndDAndAAndB.isEmpty()).toEqual(false);
            expect(await aAndB.count()).toEqual(2);
            expect(await aAndA.count()).toEqual(1);
            expect(await aAndD.count()).toEqual(2);
            expect(await aAndBAndEmpty.count()).toEqual(2);
            expect(await aAndDAndAAndB.count()).toEqual(3);
        });
        test('intersection', async () => {
            const a = {
                id: 'a',
            };
            const b = {
                id: 'b',
            };
            const d = {
                id: 'd',
            };
            const empty = event_set_1.EmptyEventSet.get();
            const justA = new event_set_1.ConcreteEventSet({}, [a]);
            const justB = new event_set_1.ConcreteEventSet({}, [b]);
            const justD = new event_set_1.ConcreteEventSet({}, [d]);
            const aAndB = justA.intersect(justB);
            const aAndA = justA.intersect(justA);
            const aAndD = justA.intersect(justD);
            const aBAndEmpty = justA.union(justB).intersect(empty);
            const aDAndAB = justA.union(justB).intersect(justA.union(justD));
            expect((await aAndB.materialise({})).events).toEqual([]);
            expect((await aAndA.materialise({})).events).toEqual([a]);
            expect((await aAndD.materialise({})).events).toEqual([]);
            expect((await aBAndEmpty.materialise({})).events).toEqual([]);
            expect((await aDAndAB.materialise({})).events).toEqual([a]);
            expect(await aAndB.isEmpty()).toEqual(true);
            expect(await aAndA.isEmpty()).toEqual(false);
            expect(await aAndD.isEmpty()).toEqual(true);
            expect(await aBAndEmpty.isEmpty()).toEqual(true);
            expect(await aDAndAB.isEmpty()).toEqual(false);
            expect(await aAndB.count()).toEqual(0);
            expect(await aAndA.count()).toEqual(1);
            expect(await aAndD.count()).toEqual(0);
            expect(await aBAndEmpty.count()).toEqual(0);
            expect(await aDAndAB.count()).toEqual(1);
        });
        test('filter', async () => {
            const keys = {
                num: event_set_1.Num,
                char: event_set_1.Str,
            };
            const a = {
                id: 'a',
                num: 97,
                char: 'a',
            };
            const b = {
                id: 'b',
                num: 98,
                char: 'b',
            };
            const d = {
                id: 'd',
                num: 100,
                char: 'd',
            };
            const events = new event_set_1.ConcreteEventSet(keys, [a, b, d]);
            const justA = events.filter((0, event_set_1.eq)((0, event_set_1.v)('id'), (0, event_set_1.c)('a')));
            const justD = events.filter((0, event_set_1.eq)((0, event_set_1.v)('num'), (0, event_set_1.c)(100)));
            expect((await justA.materialise(keys)).events).toEqual([a]);
            expect((await justD.materialise(keys)).events).toEqual([d]);
        });
        test('sort', async () => {
            const keys = {
                num: event_set_1.Num,
                char: event_set_1.Str,
            };
            const a = {
                id: 'a',
                num: 97,
                char: 'a',
            };
            const b = {
                id: 'b',
                num: 98,
                char: 'b',
            };
            const d = {
                id: 'd',
                num: 100,
                char: 'd',
            };
            const events = new event_set_1.ConcreteEventSet(keys, [a, b, d]);
            const byNum = events.sort({
                expression: (0, event_set_1.v)('num'),
                direction: event_set_1.Direction.ASC,
            });
            const byStr = events.sort({
                expression: (0, event_set_1.v)('char'),
                direction: event_set_1.Direction.ASC,
            });
            expect((await byNum.materialise(keys)).events).toEqual([a, b, d]);
            expect((await byStr.materialise(keys)).events).toEqual([a, b, d]);
        });
        test('sort desc', async () => {
            const keys = {
                num: event_set_1.Num,
                char: event_set_1.Str,
            };
            const a = {
                id: 'a',
                num: 97,
                char: 'a',
            };
            const b = {
                id: 'b',
                num: 98,
                char: 'b',
            };
            const d = {
                id: 'd',
                num: 100,
                char: 'd',
            };
            const events = new event_set_1.ConcreteEventSet(keys, [a, b, d]);
            const byNum = events.sort({
                expression: (0, event_set_1.v)('num'),
                direction: event_set_1.Direction.DESC,
            });
            const byStr = events.sort({
                expression: (0, event_set_1.v)('char'),
                direction: event_set_1.Direction.DESC,
            });
            expect((await byNum.materialise(keys)).events).toEqual([d, b, a]);
            expect((await byStr.materialise(keys)).events).toEqual([d, b, a]);
        });
    });
});
describe('cmpFromExpr', () => {
    test('simple', () => {
        const a = {
            id: 'a',
            x: 0,
        };
        const b = {
            id: 'b',
            x: 42,
        };
        const c = {
            id: 'c',
            x: 0,
        };
        const cmp = (0, event_set_1.cmpFromExpr)((0, event_set_1.v)('x'));
        expect(cmp(a, b)).toEqual(-1);
        expect(cmp(a, a)).toEqual(0);
        expect(cmp(b, a)).toEqual(1);
        expect(cmp(a, c)).toEqual(0);
    });
    test('kinds', () => {
        const nullEvent = {
            id: 'nullEvent',
            x: null,
        };
        const sevenEvent = {
            id: 'sevenEvent',
            x: 7,
        };
        const oneEvent = {
            id: 'oneEvent',
            x: 1,
        };
        const zeroEvent = {
            id: 'zeroEvent',
            x: 0,
        };
        const trueEvent = {
            id: 'trueEvent',
            x: true,
        };
        const falseEvent = {
            id: 'falseEvent',
            x: false,
        };
        const aardvarkEvent = {
            id: 'aardvarkEvent',
            x: 'aardvark',
        };
        const zigguratEvent = {
            id: 'zigguratEvent',
            x: 'ziggurat',
        };
        const bigZeroEvent = {
            id: 'bigZeroEvent',
            x: 0n,
        };
        const bigOneEvent = {
            id: 'bigOneEvent',
            x: 1n,
        };
        const bigTwoEvent = {
            id: 'bigTwoEvent',
            x: 2n,
        };
        const cmp = (0, event_set_1.cmpFromExpr)((0, event_set_1.v)('x'));
        // Everything is equal to itself:
        expect(cmp(nullEvent, nullEvent)).toEqual(0);
        expect(cmp(sevenEvent, sevenEvent)).toEqual(0);
        expect(cmp(oneEvent, oneEvent)).toEqual(0);
        expect(cmp(zeroEvent, zeroEvent)).toEqual(0);
        expect(cmp(falseEvent, falseEvent)).toEqual(0);
        expect(cmp(trueEvent, trueEvent)).toEqual(0);
        expect(cmp(aardvarkEvent, aardvarkEvent)).toEqual(0);
        expect(cmp(zigguratEvent, zigguratEvent)).toEqual(0);
        expect(cmp(bigZeroEvent, bigZeroEvent)).toEqual(0);
        expect(cmp(bigOneEvent, bigOneEvent)).toEqual(0);
        expect(cmp(bigTwoEvent, bigTwoEvent)).toEqual(0);
        // BigInt(x) == x
        expect(cmp(bigZeroEvent, zeroEvent)).toEqual(0);
        expect(cmp(bigOneEvent, oneEvent)).toEqual(0);
        // one = true, zero = false:
        expect(cmp(oneEvent, trueEvent)).toEqual(0);
        expect(cmp(zeroEvent, falseEvent)).toEqual(0);
        expect(cmp(bigOneEvent, trueEvent)).toEqual(0);
        expect(cmp(bigZeroEvent, falseEvent)).toEqual(0);
        // 0 < 1 < 7
        expect(cmp(zeroEvent, oneEvent)).toEqual(-1);
        expect(cmp(sevenEvent, oneEvent)).toEqual(1);
        // 0n < 1n < 2n
        expect(cmp(bigZeroEvent, bigOneEvent)).toEqual(-1);
        expect(cmp(bigTwoEvent, bigOneEvent)).toEqual(1);
        // 0 < 1n < 7
        expect(cmp(zeroEvent, bigOneEvent)).toEqual(-1);
        expect(cmp(sevenEvent, bigOneEvent)).toEqual(1);
        // aardvark < ziggurat
        expect(cmp(aardvarkEvent, zigguratEvent)).toEqual(-1);
        // null < {bools, numbers, BigInt} < strings
        expect(cmp(nullEvent, falseEvent)).toEqual(-1);
        expect(cmp(aardvarkEvent, sevenEvent)).toEqual(1);
        expect(cmp(nullEvent, bigZeroEvent)).toEqual(-1);
        expect(cmp(bigZeroEvent, sevenEvent)).toEqual(-1);
        expect(cmp(nullEvent, falseEvent)).toEqual(-1);
        expect(cmp(falseEvent, sevenEvent)).toEqual(-1);
    });
});
describe('cmpFromSort', () => {
    test('simple asc', () => {
        const a = {
            id: 'a',
            x: 0,
        };
        const b = {
            id: 'b',
            x: 42,
        };
        const c = {
            id: 'c',
            x: 0,
        };
        const cmp = (0, event_set_1.cmpFromSort)({
            expression: (0, event_set_1.v)('x'),
            direction: event_set_1.Direction.ASC,
        });
        expect(cmp(a, b)).toEqual(-1);
        expect(cmp(a, a)).toEqual(0);
        expect(cmp(b, a)).toEqual(1);
        expect(cmp(a, c)).toEqual(0);
    });
    test('kinds asc', () => {
        const nullEvent = {
            id: 'nullEvent',
            x: null,
        };
        const sevenEvent = {
            id: 'sevenEvent',
            x: 7,
        };
        const oneEvent = {
            id: 'oneEvent',
            x: 1,
        };
        const zeroEvent = {
            id: 'zeroEvent',
            x: 0,
        };
        const trueEvent = {
            id: 'trueEvent',
            x: true,
        };
        const falseEvent = {
            id: 'falseEvent',
            x: false,
        };
        const aardvarkEvent = {
            id: 'aardvarkEvent',
            x: 'aardvark',
        };
        const zigguratEvent = {
            id: 'zigguratEvent',
            x: 'ziggurat',
        };
        const bigZeroEvent = {
            id: 'bigZeroEvent',
            x: 0n,
        };
        const bigOneEvent = {
            id: 'bigOneEvent',
            x: 1n,
        };
        const bigTwoEvent = {
            id: 'bigTwoEvent',
            x: 2n,
        };
        const cmp = (0, event_set_1.cmpFromSort)({
            expression: (0, event_set_1.v)('x'),
            direction: event_set_1.Direction.ASC,
        });
        // Everything is equal to itself:
        expect(cmp(nullEvent, nullEvent)).toEqual(0);
        expect(cmp(sevenEvent, sevenEvent)).toEqual(0);
        expect(cmp(oneEvent, oneEvent)).toEqual(0);
        expect(cmp(zeroEvent, zeroEvent)).toEqual(0);
        expect(cmp(falseEvent, falseEvent)).toEqual(0);
        expect(cmp(trueEvent, trueEvent)).toEqual(0);
        expect(cmp(aardvarkEvent, aardvarkEvent)).toEqual(0);
        expect(cmp(zigguratEvent, zigguratEvent)).toEqual(0);
        expect(cmp(bigZeroEvent, bigZeroEvent)).toEqual(0);
        expect(cmp(bigOneEvent, bigOneEvent)).toEqual(0);
        expect(cmp(bigTwoEvent, bigTwoEvent)).toEqual(0);
        // BigInt(x) == x
        expect(cmp(bigZeroEvent, zeroEvent)).toEqual(0);
        expect(cmp(bigOneEvent, oneEvent)).toEqual(0);
        // one = true, zero = false:
        expect(cmp(oneEvent, trueEvent)).toEqual(0);
        expect(cmp(zeroEvent, falseEvent)).toEqual(0);
        expect(cmp(bigOneEvent, trueEvent)).toEqual(0);
        expect(cmp(bigZeroEvent, falseEvent)).toEqual(0);
        // 0 < 1 < 7
        expect(cmp(zeroEvent, oneEvent)).toEqual(-1);
        expect(cmp(sevenEvent, oneEvent)).toEqual(1);
        // 0n < 1n < 2n
        expect(cmp(bigZeroEvent, bigOneEvent)).toEqual(-1);
        expect(cmp(bigTwoEvent, bigOneEvent)).toEqual(1);
        // 0 < 1n < 7
        expect(cmp(zeroEvent, bigOneEvent)).toEqual(-1);
        expect(cmp(sevenEvent, bigOneEvent)).toEqual(1);
        // aardvark < ziggurat
        expect(cmp(aardvarkEvent, zigguratEvent)).toEqual(-1);
        // null < {bools, numbers, BigInt} < strings
        expect(cmp(nullEvent, falseEvent)).toEqual(-1);
        expect(cmp(aardvarkEvent, sevenEvent)).toEqual(1);
        expect(cmp(nullEvent, bigZeroEvent)).toEqual(-1);
        expect(cmp(bigZeroEvent, sevenEvent)).toEqual(-1);
        expect(cmp(nullEvent, falseEvent)).toEqual(-1);
        expect(cmp(falseEvent, sevenEvent)).toEqual(-1);
    });
    test('simple desc', () => {
        const a = {
            id: 'a',
            x: 0,
        };
        const b = {
            id: 'b',
            x: 42,
        };
        const c = {
            id: 'c',
            x: 0,
        };
        const cmp = (0, event_set_1.cmpFromSort)({
            expression: (0, event_set_1.v)('x'),
            direction: event_set_1.Direction.DESC,
        });
        expect(cmp(a, b)).toEqual(1);
        expect(cmp(a, a)).toEqual(0);
        expect(cmp(b, a)).toEqual(-1);
        expect(cmp(a, c)).toEqual(0);
    });
    test('kinds desc', () => {
        const nullEvent = {
            id: 'nullEvent',
            x: null,
        };
        const sevenEvent = {
            id: 'sevenEvent',
            x: 7,
        };
        const oneEvent = {
            id: 'oneEvent',
            x: 1,
        };
        const zeroEvent = {
            id: 'zeroEvent',
            x: 0,
        };
        const trueEvent = {
            id: 'trueEvent',
            x: true,
        };
        const falseEvent = {
            id: 'falseEvent',
            x: false,
        };
        const aardvarkEvent = {
            id: 'aardvarkEvent',
            x: 'aardvark',
        };
        const zigguratEvent = {
            id: 'zigguratEvent',
            x: 'ziggurat',
        };
        const bigZeroEvent = {
            id: 'bigZeroEvent',
            x: 0n,
        };
        const bigOneEvent = {
            id: 'bigOneEvent',
            x: 1n,
        };
        const bigTwoEvent = {
            id: 'bigTwoEvent',
            x: 2n,
        };
        const cmp = (0, event_set_1.cmpFromSort)({
            expression: (0, event_set_1.v)('x'),
            direction: event_set_1.Direction.DESC,
        });
        // Everything is equal to itself:
        expect(cmp(nullEvent, nullEvent)).toEqual(0);
        expect(cmp(sevenEvent, sevenEvent)).toEqual(0);
        expect(cmp(oneEvent, oneEvent)).toEqual(0);
        expect(cmp(zeroEvent, zeroEvent)).toEqual(0);
        expect(cmp(falseEvent, falseEvent)).toEqual(0);
        expect(cmp(trueEvent, trueEvent)).toEqual(0);
        expect(cmp(aardvarkEvent, aardvarkEvent)).toEqual(0);
        expect(cmp(zigguratEvent, zigguratEvent)).toEqual(0);
        expect(cmp(bigZeroEvent, bigZeroEvent)).toEqual(0);
        expect(cmp(bigOneEvent, bigOneEvent)).toEqual(0);
        expect(cmp(bigTwoEvent, bigTwoEvent)).toEqual(0);
        // BigInt(x) == x
        expect(cmp(bigZeroEvent, zeroEvent)).toEqual(0);
        expect(cmp(bigOneEvent, oneEvent)).toEqual(0);
        // one = true, zero = false:
        expect(cmp(oneEvent, trueEvent)).toEqual(0);
        expect(cmp(zeroEvent, falseEvent)).toEqual(0);
        expect(cmp(bigOneEvent, trueEvent)).toEqual(0);
        expect(cmp(bigZeroEvent, falseEvent)).toEqual(0);
        // 0 < 1 < 7
        expect(cmp(zeroEvent, oneEvent)).toEqual(1);
        expect(cmp(sevenEvent, oneEvent)).toEqual(-1);
        // 0n < 1n < 2n
        expect(cmp(bigZeroEvent, bigOneEvent)).toEqual(1);
        expect(cmp(bigTwoEvent, bigOneEvent)).toEqual(-1);
        // 0 < 1n < 7
        expect(cmp(zeroEvent, bigOneEvent)).toEqual(1);
        expect(cmp(sevenEvent, bigOneEvent)).toEqual(-1);
        // aardvark < ziggurat
        expect(cmp(aardvarkEvent, zigguratEvent)).toEqual(1);
        // null < {bools, numbers, BigInt} < strings
        expect(cmp(nullEvent, falseEvent)).toEqual(1);
        expect(cmp(aardvarkEvent, sevenEvent)).toEqual(-1);
        expect(cmp(nullEvent, bigZeroEvent)).toEqual(1);
        expect(cmp(bigZeroEvent, sevenEvent)).toEqual(1);
        expect(cmp(nullEvent, falseEvent)).toEqual(1);
        expect(cmp(falseEvent, sevenEvent)).toEqual(1);
    });
});
//# sourceMappingURL=event_set_unittest.js.map