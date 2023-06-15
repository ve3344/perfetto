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

import {EngineProxy} from '../../common/engine';
import {
  LONG_NULL,
  NUM,
  NUM_NULL,
  STR,
  STR_NULL,
} from '../../common/query_result';
import {
  ArgSetId,
  ArgsId,
  asArgId,
} from '../sql_types';

export type ArgValue = bigint|string|number|boolean|null;
type ArgValueType = 'int'|'uint'|'string'|'bool'|'real'|'null';

export interface Arg {
  id: ArgsId;
  type: string;
  flatKey: string;
  key: string;
  value: ArgValue;
  displayValue: string;
}

export async function getArgs(
    engine: EngineProxy, argSetId: ArgSetId): Promise<Arg[]> {
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
    WHERE arg_set_id = ${argSetId}`);
  const it = query.iter({
    id: NUM,
    type: STR,
    flatKey: STR,
    key: STR,
    intValue: LONG_NULL,
    stringValue: STR_NULL,
    realValue: NUM_NULL,
    valueType: STR,
    displayValue: STR,
  });

  const result: Arg[] = [];
  for (; it.valid(); it.next()) {
    const value = parseValue(it.valueType as ArgValueType, it);
    result.push({
      id: asArgId(it.id),
      type: it.type,
      flatKey: it.flatKey,
      key: it.key,
      value,
      displayValue: it.displayValue,
    });
  }

  return result;
}

function parseValue(valueType: ArgValueType, value: {
  intValue: bigint|null,
  stringValue: string|null,
  realValue: number|null
}): ArgValue {
  switch (valueType) {
    case 'int':
    case 'uint':
      return value.intValue;
    case 'string':
      return value.stringValue;
    case 'bool':
      return !!value.intValue;
    case 'real':
      return value.realValue;
    case 'null':
      return null;
    default:
      const x: number = valueType;
      throw new Error(`Unable to process arg of type ${x}`);
  }
}