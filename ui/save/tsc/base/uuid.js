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
exports.uuidv4 = void 0;
exports.uuidv4Sql = uuidv4Sql;
const uuid_1 = require("uuid");
const string_utils_1 = require("./string_utils");
exports.uuidv4 = uuid_1.v4;
/**
 * Get a SQL friendly UUID, or convert a pre-existing one.
 * @param uuid Optional: Pre-existing uuid to format.
 * @returns string The resulting uuid.
 */
function uuidv4Sql(uuid) {
    const str = uuid ?? (0, exports.uuidv4)();
    return (0, string_utils_1.sqlNameSafe)(str);
}
//# sourceMappingURL=uuid.js.map