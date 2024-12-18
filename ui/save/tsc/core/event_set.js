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
exports.ConcreteEventSet = exports.EmptyEventSet = exports.NaiveIntersectionEventSet = exports.NaiveUnionEventSet = exports.OptimisingEventSet = exports.Direction = exports.Bool = exports.Id = exports.Str = exports.BigInt = exports.Num = exports.Null = void 0;
exports.optimise = optimise;
exports.eq = eq;
exports.ne = ne;
exports.gt = gt;
exports.ge = ge;
exports.lt = lt;
exports.le = le;
exports.and = and;
exports.or = or;
exports.c = c;
exports.v = v;
exports.isEmptyEventSet = isEmptyEventSet;
exports.isConcreteEventSet = isConcreteEventSet;
exports.isUnionEventSet = isUnionEventSet;
exports.isIntersectionEventSet = isIntersectionEventSet;
exports.isFilterEventSet = isFilterEventSet;
exports.isSortEventSet = isSortEventSet;
exports.cmpFromExpr = cmpFromExpr;
exports.cmpFromSort = cmpFromSort;
const array_utils_1 = require("../base/array_utils");
const object_utils_1 = require("../base/object_utils");
const set_utils_1 = require("../base/set_utils");
exports.Null = 'null';
exports.Num = 'num';
exports.BigInt = 'bigint';
exports.Str = 'str';
exports.Id = 'id';
exports.Bool = 'bool';
// Sorting direction.
var Direction;
(function (Direction) {
    Direction[Direction["ASC"] = 0] = "ASC";
    Direction[Direction["DESC"] = 1] = "DESC";
})(Direction || (exports.Direction = Direction = {}));
// EVENT_SET_IMPLS ====================================================
// OptimisingEventSet is what makes it a) tractable to write EventSet
// implementations and b) have those implementations be fast.
// The EventSet interface has two kinds of methods:
// 1. Synchronous refinement methods which produce an EventSet and
//    often take a second EventSet as an argument
// 2. Asynchronous 'analysis' methods
//
// Together this means in the minimal case subclasses only *have* to
// implement the single abstract method: materialise(). Everything else
// is handled for you.
class OptimisingEventSet {
    // OptimisingEventSet provides the synchronous refinement methods.
    // The basic pattern is to construct a 'NaiveFoo' EventSet which will
    // do the given operation (filter, sort, union, intersection) in
    // JavaScript then call optimise(). Optimse then tries to improve the
    // EventSet tree - and avoid having to use the fallback naive
    // implementaion.
    // Optimise does 'tree rewriting' of the EventSet tree. For example
    // considering a tree: 'union(A, 0)' where 0 is the empty set and
    // A is some arbitrary EventSet, optimise(union(A, 0)) returns A.
    // For more detail see optimise() below.
    filter(...filters) {
        const result = new NaiveFilterEventSet(this, filters);
        const optimised = optimise(result);
        return optimised;
    }
    sort(...sorts) {
        const result = new NaiveSortEventSet(this, sorts);
        const optimised = optimise(result);
        return optimised;
    }
    union(other) {
        const merged = mergeKeys(this.keys, other.keys);
        const result = new NaiveUnionEventSet(merged, this, other);
        const optimised = optimise(result);
        return optimised;
    }
    intersect(other) {
        const merged = mergeKeys(this.keys, other.keys);
        const result = new NaiveIntersectionEventSet(merged, this, other);
        const optimised = optimise(result);
        return optimised;
    }
    // We provide a default implementation of count() on top of
    // materialise(). It's likely the subclass can provide a more
    // performant implementation.
    async count() {
        const materialised = await this.materialise({});
        return materialised.events.length;
    }
    // We provide a default implementation of empty() on top of
    // materialise(). It's likely the subclass can provide a more
    // performant implementation.
    async isEmpty() {
        const materialised = await this.materialise({}, 0 /* offset */, 1 /* limit */);
        return materialised.events.length === 0;
    }
}
exports.OptimisingEventSet = OptimisingEventSet;
class NaiveFilterEventSet extends OptimisingEventSet {
    isFilter = true;
    parent;
    filters;
    keys;
    constructor(parent, filters) {
        super();
        this.parent = parent;
        this.keys = this.parent.keys;
        this.filters = filters;
    }
    async count() {
        const keys = freeVariablesFromFilters(this.filters);
        const concreteParent = await this.parent.materialise(keys);
        const events = concreteParent.events;
        let total = 0;
        for (const e of events) {
            if (this.filters.every((f) => f.execute(e))) {
                total += 1;
            }
        }
        return total;
    }
    async isEmpty() {
        const keys = freeVariablesFromFilters(this.filters);
        const concreateParent = await this.parent.materialise(keys);
        const events = concreateParent.events;
        for (const e of events) {
            if (this.filters.every((f) => f.execute(e))) {
                return false;
            }
        }
        return true;
    }
    async materialise(keys, offset, limit) {
        const combined = freeVariablesFromFilters(this.filters, keys);
        const concreateParent = await this.parent.materialise(combined);
        let events = concreateParent.events;
        for (const filter of this.filters) {
            events = events.filter((e) => filter.execute(e));
        }
        return new ConcreteEventSet(combined, events).materialise(keys, offset, limit);
    }
}
class NaiveSortEventSet extends OptimisingEventSet {
    isSort = true;
    parent;
    sorts;
    keys;
    constructor(parent, sorts) {
        super();
        this.parent = parent;
        this.keys = this.parent.keys;
        this.sorts = sorts;
    }
    async count() {
        return this.parent.count();
    }
    async isEmpty() {
        return this.parent.isEmpty();
    }
    async materialise(keys, offset, limit) {
        const combined = freeVariablesFromSorts(this.sorts, keys);
        const concreateParent = await this.parent.materialise(combined);
        let events = concreateParent.events;
        for (const sort of this.sorts) {
            events = events.sort(cmpFromSort(sort));
        }
        return new ConcreteEventSet(combined, events).materialise(keys, offset, limit);
    }
}
class NaiveUnionEventSet extends OptimisingEventSet {
    isUnion = true;
    parents;
    keys;
    constructor(keys, ...parents) {
        super();
        this.keys = keys;
        this.parents = parents;
    }
    create(...parents) {
        return new NaiveUnionEventSet(this.keys, ...parents);
    }
    // TODO(hjd): We could implement a more efficient dedicated count().
    // TODO(hjd): We could implement a more efficient dedicated isEmpty().
    async materialise(keys, offset, limit) {
        const promises = this.parents.map((p) => p.materialise(keys));
        const materialisedParents = (await Promise.all(promises));
        const seen = new Set();
        let events = [];
        // TODO(hjd): There are various options for doing this in faster
        // way and we should do one of them.
        for (const parent of materialisedParents) {
            for (const e of parent.events) {
                if (!seen.has(e.id)) {
                    events.push(e);
                    seen.add(e.id);
                }
            }
        }
        events = applyLimitOffset(events, limit, offset);
        return ConcreteEventSet.from(keys, events);
    }
}
exports.NaiveUnionEventSet = NaiveUnionEventSet;
class NaiveIntersectionEventSet extends OptimisingEventSet {
    isIntersection = true;
    parents;
    keys;
    constructor(keys, ...parents) {
        super();
        this.keys = keys;
        this.parents = parents;
    }
    create(...parents) {
        return new NaiveIntersectionEventSet(this.keys, ...parents);
    }
    // TODO(hjd): We could implement a more efficient dedicated count().
    // TODO(hjd): We could implement a more efficient dedicated isEmpty().
    async materialise(keys, offset, limit) {
        if (this.parents.length === 0) {
            return ConcreteEventSet.from(keys, []);
        }
        const parents = this.parents.slice();
        const firstParent = parents.pop();
        const promises = parents.map((p) => p.materialise({}));
        const firstPromise = firstParent.materialise(keys);
        const materialised = await Promise.all(promises);
        const firstMaterialised = await firstPromise;
        let ids = new Set();
        for (const e of firstMaterialised.events) {
            ids.add(e.id);
        }
        for (const m of materialised) {
            const newIds = new Set();
            for (const e of m.events) {
                newIds.add(e.id);
            }
            ids = (0, set_utils_1.intersect)(ids, newIds);
        }
        let events = firstMaterialised.events.filter((e) => ids.has(e.id));
        events = applyLimitOffset(events, limit, offset);
        return ConcreteEventSet.from(keys, events);
    }
}
exports.NaiveIntersectionEventSet = NaiveIntersectionEventSet;
// A completely empty EventSet.
class EmptyEventSet extends OptimisingEventSet {
    isEmptyEventSet = true;
    keys;
    constructor(keys) {
        super();
        this.keys = keys;
    }
    static get() {
        return new EmptyEventSet({});
    }
    count() {
        return Promise.resolve(0);
    }
    isEmpty() {
        return Promise.resolve(true);
    }
    async materialise(keys, _offset, _limit) {
        return Promise.resolve(new ConcreteEventSet(keys, []));
    }
}
exports.EmptyEventSet = EmptyEventSet;
class ConcreteEventSet extends OptimisingEventSet {
    isConcreteEventSet = true;
    events;
    keys;
    static from(keys, events) {
        return new ConcreteEventSet(keys, events);
    }
    constructor(keys, events) {
        super();
        // TODO(hjd): Add some paranoid mode where we crash here if
        // `events` and `keys` mismatch?
        this.events = events;
        this.keys = keys;
    }
    count() {
        return Promise.resolve(this.events.length);
    }
    isEmpty() {
        return Promise.resolve(this.events.length === 0);
    }
    materialise(keys, offset, limit) {
        const actualOffset = offset === undefined ? 0 : offset;
        const actualEnd = limit === undefined ? this.events.length : actualOffset + limit;
        const shouldFilter = !isEqualKeySet(keys, this.keys);
        const shouldSlice = actualOffset !== 0 || actualEnd !== this.events.length;
        if (!shouldFilter && !shouldSlice) {
            return Promise.resolve(this);
        }
        let events = this.events;
        if (shouldFilter) {
            events = events.map((e) => {
                const result = {
                    id: e.id,
                };
                for (const [k, v] of Object.entries(keys)) {
                    // While the static typing prevents folks from hitting
                    // this in the common case people can still on purpose pass
                    // keysets and lie about the types.
                    result[k] = e[k] ?? getKeyDefault(k, v);
                }
                return result;
            });
        }
        if (shouldSlice) {
            events = events.slice(actualOffset, actualEnd);
        }
        return Promise.resolve(new ConcreteEventSet(keys, events));
    }
}
exports.ConcreteEventSet = ConcreteEventSet;
// Optimse:
// We have a couple major kinds of optimisation:
// 1. Pushing down filters.
// 2. Set optimisations (e.g union(empty, A) == A)
// 3. Merging EventSets of the same kind
//
// In more detail:
// 1. Pushing down filters. For example:
//    filter(union(A, B), pred) ==
//      union(filter(A, pred), filter(B, pred))
//    This is more useful than it seems since if we manage to push down
//    filters all the may to SQL they can be implemented very
//    efficiently in C++.
// 2. Classic set optimisations. e.g.
//      union(A, empty) == A
//      union(A, A) == A
//      intersect(A, empty) == empty
//      etc
// 3. Merging EventSets of the same type. For example:
//    union(concrete(a, b), concrete(b, c)) == concrete(a, b, c)
//    Similarly the combinations of two SQL EventSets can be converted
//    into a single SQL EventSet with a more complicated query -
//    avoiding doing the processing in TypeScript.
//
// A critical pre-condition of this function is that EventSets are
// immutable - this allows us to reuse parts of the input event set tree
// in the output.
function optimise(eventSet) {
    // Empty EventSet can't be futher optimised.
    if (isEmptyEventSet(eventSet)) {
        return eventSet;
    }
    if (isConcreteEventSet(eventSet)) {
        // A concrete events with zero elements is the empty events.
        if (eventSet.events.length === 0) {
            return new EmptyEventSet(eventSet.keys);
        }
        // ...but otherwise can not be optimised further.
        return eventSet;
    }
    if (isUnionEventSet(eventSet)) {
        const keys = eventSet.keys;
        let newParents = eventSet.parents.slice();
        // Empty sets don't contribute to the union.
        newParents = newParents.filter((p) => !isEmptyEventSet(p));
        // union([]) is empty.
        if (newParents.length === 0) {
            return new EmptyEventSet(keys);
        }
        if (newParents.length === 1) {
            return newParents[0];
        }
        // The union of concrete EventSets is a concrete EventSets with all
        // the events in.
        if ((0, array_utils_1.isArrayOf)(isConcreteEventSet, newParents)) {
            const seen = new Set();
            const events = [];
            for (const p of newParents) {
                for (const e of p.events) {
                    if (!seen.has(e.id)) {
                        events.push(e);
                        seen.add(e.id);
                    }
                }
            }
            return ConcreteEventSet.from(eventSet.keys, events);
        }
        if ((0, array_utils_1.arrayEquals)(newParents, eventSet.parents)) {
            return eventSet;
        }
        else {
            return eventSet.create(...newParents);
        }
    }
    if (isIntersectionEventSet(eventSet)) {
        // For any x: intersect([x, 0]) is 0
        for (const parent of eventSet.parents) {
            if (isEmptyEventSet(parent)) {
                return parent;
            }
        }
        return eventSet;
    }
    if (isFilterEventSet(eventSet)) {
        const parent = eventSet.parent;
        if (isEmptyEventSet(parent)) {
            return parent;
        }
        return eventSet;
    }
    if (isSortEventSet(eventSet)) {
        const parent = eventSet.parent;
        if (isEmptyEventSet(parent)) {
            return parent;
        }
        return eventSet;
    }
    // TODO(hjd): Re-add the optimisations from the prototype.
    // TODO(hjd): Union([a, a]) === a but maybe not worth optimising.
    return eventSet;
}
// EXPR ===============================================================
class BinOp {
    left;
    right;
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }
    buildQueryFragment(binding) {
        const a = this.left.buildQueryFragment(binding);
        const b = this.right.buildQueryFragment(binding);
        const op = this.sqlOp();
        return `(${a} ${op} ${b})`;
    }
    execute(event) {
        const a = this.left.execute(event);
        const b = this.right.execute(event);
        return this.evaluate(a, b);
    }
    freeVariables() {
        const a = this.left.freeVariables();
        const b = this.right.freeVariables();
        return mergeKeys(a, b);
    }
}
class Le extends BinOp {
    sqlOp() {
        return '<=';
    }
    evaluate(lhs, rhs) {
        return lhs <= rhs;
    }
}
class Lt extends BinOp {
    sqlOp() {
        return '<';
    }
    evaluate(lhs, rhs) {
        return lhs < rhs;
    }
}
class Ge extends BinOp {
    sqlOp() {
        return '>=';
    }
    evaluate(lhs, rhs) {
        return lhs >= rhs;
    }
}
class Gt extends BinOp {
    sqlOp() {
        return '>';
    }
    evaluate(lhs, rhs) {
        return lhs > rhs;
    }
}
class Eq extends BinOp {
    sqlOp() {
        return '=';
    }
    evaluate(lhs, rhs) {
        return lhs === rhs;
    }
}
class And extends BinOp {
    sqlOp() {
        return 'AND';
    }
    evaluate(lhs, rhs) {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        return lhs && rhs;
    }
}
class Or extends BinOp {
    sqlOp() {
        return 'OR';
    }
    evaluate(lhs, rhs) {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        return lhs || rhs;
    }
}
class Ne extends BinOp {
    sqlOp() {
        return '!=';
    }
    evaluate(lhs, rhs) {
        return lhs !== rhs;
    }
}
class Var {
    name;
    constructor(name) {
        this.name = name;
    }
    buildQueryFragment(binding) {
        // TODO(hjd): wrap in try catch?
        return binding.get(this.name);
    }
    execute(event) {
        return event[this.name];
    }
    freeVariables() {
        return {
            [this.name]: exports.Null,
        };
    }
}
class Constant {
    value;
    constructor(value) {
        this.value = value;
    }
    buildQueryFragment(_) {
        const value = this.value;
        if (value === null) {
            return 'NULL';
        }
        else if ((0, object_utils_1.isString)(value)) {
            return `'${value}'`;
        }
        else if (typeof value === 'boolean') {
            return value ? 'TRUE' : 'FALSE';
        }
        else {
            return `${value}`;
        }
    }
    execute(_) {
        return this.value;
    }
    freeVariables() {
        return {};
    }
}
function eq(left, right) {
    return new Eq(left, right);
}
function ne(left, right) {
    return new Ne(left, right);
}
function gt(left, right) {
    return new Gt(left, right);
}
function ge(left, right) {
    return new Ge(left, right);
}
function lt(left, right) {
    return new Lt(left, right);
}
function le(left, right) {
    return new Le(left, right);
}
function and(left, right) {
    return new And(left, right);
}
function or(left, right) {
    return new Or(left, right);
}
function c(value) {
    return new Constant(value);
}
function v(name) {
    return new Var(name);
}
// Type guards:
function isEmptyEventSet(s) {
    return !!s.isEmptyEventSet;
}
function isConcreteEventSet(s) {
    return !!s.isConcreteEventSet;
}
function isUnionEventSet(s) {
    return (s.isUnion &&
        Array.isArray(s.parents));
}
function isIntersectionEventSet(s) {
    return (s.isIntersection &&
        Array.isArray(s.parents));
}
function isFilterEventSet(s) {
    return (s.isFilter &&
        Array.isArray(s.filters));
}
function isSortEventSet(s) {
    return (s.isSort && Array.isArray(s.sorts));
}
// HELPERS ============================================================
function applyLimitOffset(arr, limit, offset) {
    const actualOffset = offset === undefined ? 0 : offset;
    const actualEnd = limit === undefined ? arr.length : actualOffset + limit;
    const shouldSlice = actualOffset !== 0 || actualEnd !== arr.length;
    return shouldSlice ? arr.slice(actualOffset, actualEnd) : arr;
}
function mergeKeys(left, right) {
    return Object.assign({}, left, right);
}
function getKeyDefault(keyName, keyType) {
    switch (keyType) {
        case exports.Id:
            throw new Error(`Can't create default for key '${keyName}' with type '${keyType}'`);
        case exports.Num:
            return 0;
        case exports.Null:
            return null;
        case exports.Str:
            return '';
        case exports.Bool:
            return false;
        case exports.BigInt:
            return 0n;
        default:
            const _exhaustiveCheck = keyType;
            return _exhaustiveCheck;
    }
}
function isEqualKeySet(a, b) {
    for (const k in a) {
        if (a[k] !== b[k]) {
            return false;
        }
    }
    for (const k in b) {
        if (b[k] !== a[k]) {
            return false;
        }
    }
    return true;
}
function freeVariablesFromFilters(filters, initialKeySet) {
    let result = {};
    if (initialKeySet !== undefined) {
        result = mergeKeys(result, initialKeySet);
    }
    for (const filter of filters) {
        result = mergeKeys(result, filter.freeVariables());
    }
    return result;
}
function freeVariablesFromSorts(sorts, initialKeySet) {
    let result = {};
    if (initialKeySet !== undefined) {
        result = mergeKeys(result, initialKeySet);
    }
    for (const sort of sorts) {
        result = mergeKeys(result, sort.expression.freeVariables());
    }
    return result;
}
function primativeToRank(p) {
    if (p === null) {
        return 0;
    }
    else if ((0, object_utils_1.isString)(p)) {
        return 2;
    }
    else {
        return 1;
    }
}
// TODO(hjd): test for bignums
// Convert an expression into a sort style comparison function.
// Exported for testing.
function cmpFromExpr(expr) {
    return (l, r) => {
        const lhs = expr.execute(l);
        const rhs = expr.execute(r);
        const lhsRank = primativeToRank(lhs);
        const rhsRank = primativeToRank(rhs);
        if (lhsRank < rhsRank) {
            return -1;
        }
        else if (lhsRank > rhsRank) {
            return 1;
        }
        else {
            // Double equals on purpose so 0 == false and 1 == true are true
            if (lhs == rhs) {
                return 0;
            }
            else if (lhs < rhs) {
                return -1;
            }
            else {
                return 1;
            }
        }
    };
}
// Convert a 'sort' into a sort() style comparison function.
// Exported for testing.
function cmpFromSort(sort) {
    const cmp = cmpFromExpr(sort.expression);
    if (sort.direction === Direction.ASC) {
        return cmp;
    }
    else {
        // cmp(r, l) is better than -cmp(l, r) since JS distinguishes
        // between -0 and 0.
        return (l, r) => cmp(r, l);
    }
}
//# sourceMappingURL=event_set.js.map