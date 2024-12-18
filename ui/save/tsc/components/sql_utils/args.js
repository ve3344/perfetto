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
exports.getArgs = getArgs;
const query_result_1 = require("../../trace_processor/query_result");
const core_types_1 = require("./core_types");
async function getArgs(engine, argSetId) {
    const query = await engine.query(`
    SELECT
      id,
      type,
      flat_key as flatKey,
      key,
      int_value as intValue,
      string_value as stringValue,
      real_value as realValue,
      value_type as valueType,
      display_value as displayValue
    FROM args
    WHERE arg_set_id = ${argSetId}
    ORDER BY id`);
    const it = query.iter({
        id: query_result_1.NUM,
        type: query_result_1.STR,
        flatKey: query_result_1.STR,
        key: query_result_1.STR,
        intValue: query_result_1.LONG_NULL,
        stringValue: query_result_1.STR_NULL,
        realValue: query_result_1.NUM_NULL,
        valueType: query_result_1.STR,
        displayValue: query_result_1.STR_NULL,
    });
    const result = [];
    for (; it.valid(); it.next()) {
        const value = parseValue(it.valueType, it);
        result.push({
            id: (0, core_types_1.asArgId)(it.id),
            type: it.type,
            flatKey: it.flatKey,
            key: it.key,
            value,
            displayValue: it.displayValue ?? 'NULL',
        });
    }
    return result;
}
function parseValue(valueType, value) {
    switch (valueType) {
        case 'int':
        case 'uint':
            return value.intValue;
        case 'pointer':
            return value.intValue === null
                ? null
                : `0x${value.intValue.toString(16)}`;
        case 'string':
            return value.stringValue;
        case 'bool':
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            return !!value.intValue;
        case 'real':
            return value.realValue;
        case 'null':
            return null;
        default:
            const x = valueType;
            throw new Error(`Unable to process arg of type ${x}`);
    }
}
//# sourceMappingURL=args.js.map