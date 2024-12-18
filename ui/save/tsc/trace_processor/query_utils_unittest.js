"use strict";
// Copyright (C) 2022 The Android Open Source Project
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
const query_utils_1 = require("./query_utils");
test('escapeQuery', () => {
    expect((0, query_utils_1.escapeQuery)(``)).toEqual(`''`);
    expect((0, query_utils_1.escapeQuery)(`'`)).toEqual(`''''`);
    expect((0, query_utils_1.escapeQuery)(`hello`)).toEqual(`'hello'`);
    expect((0, query_utils_1.escapeQuery)("foo'bar")).toEqual(`'foo''bar'`);
    expect((0, query_utils_1.escapeQuery)('*_*')).toEqual(`'[*]_[*]'`);
    expect((0, query_utils_1.escapeQuery)('[]?')).toEqual(`'[[]][?]'`);
});
test('escapeSearchQuery', () => {
    expect((0, query_utils_1.escapeSearchQuery)(``)).toEqual(`'**'`);
    expect((0, query_utils_1.escapeSearchQuery)(`hello`)).toEqual(`'*[hH][eE][lL][lL][oO]*'`);
    expect((0, query_utils_1.escapeSearchQuery)("a'b")).toEqual(`'*[aA]''[bB]*'`);
    expect((0, query_utils_1.escapeSearchQuery)('*_*')).toEqual(`'*[*]_[*]*'`);
    expect((0, query_utils_1.escapeSearchQuery)('[]?')).toEqual(`'*[[]][?]*'`);
});
test('escapeGlob', () => {
    expect((0, query_utils_1.escapeGlob)(``)).toEqual(`'**'`);
    expect((0, query_utils_1.escapeGlob)(`'`)).toEqual(`'*''*'`);
    expect((0, query_utils_1.escapeGlob)(`hello`)).toEqual(`'*hello*'`);
    expect((0, query_utils_1.escapeGlob)("foo'bar")).toEqual(`'*foo''bar*'`);
    expect((0, query_utils_1.escapeGlob)('*_*')).toEqual(`'**_**'`);
    expect((0, query_utils_1.escapeGlob)('[]?')).toEqual(`'*[]?*'`);
});
//# sourceMappingURL=query_utils_unittest.js.map