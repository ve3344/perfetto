"use strict";
/*
 * Copyright (C) 2022 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericSet = void 0;
// ES6 Set does not allow to reasonably store compound objects; this class
// rectifies the problem by implementing generic set on top of Map and an
// injective function from objects of generic type to strings.
class GenericSet {
    interner;
    // Passed function should be injective (as in never having the same output for
    // two different inputs).
    constructor(interner) {
        this.interner = interner;
    }
    backingMap = new Map();
    has(column) {
        return this.backingMap.has(this.interner(column));
    }
    add(column) {
        this.backingMap.set(this.interner(column), column);
    }
    delete(column) {
        this.backingMap.delete(this.interner(column));
    }
    values() {
        return this.backingMap.values();
    }
}
exports.GenericSet = GenericSet;
//# sourceMappingURL=generic_set.js.map