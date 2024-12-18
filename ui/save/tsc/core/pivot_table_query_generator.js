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
exports.QueryGeneratorError = exports.tables = exports.sliceAggregationColumns = void 0;
exports.areaFilters = areaFilters;
exports.aggregationIndex = aggregationIndex;
exports.generateQueryFromState = generateQueryFromState;
const string_utils_1 = require("../base/string_utils");
const track_kinds_1 = require("../public/track_kinds");
const sliceTable = {
    name: '_slice_with_thread_and_process_info',
    displayName: 'slice',
    columns: [
        'type',
        'ts',
        'dur',
        'category',
        'name',
        'depth',
        'pid',
        'process_name',
        'tid',
        'thread_name',
    ],
};
// Columns of `slice` table available for aggregation.
exports.sliceAggregationColumns = [
    'ts',
    'dur',
    'depth',
    'thread_ts',
    'thread_dur',
    'thread_instruction_count',
    'thread_instruction_delta',
];
// List of available tables to query, used to populate selectors of pivot
// columns in the UI.
exports.tables = [sliceTable];
// Exception thrown by query generator in case incoming parameters are not
// suitable in order to build a correct query; these are caught by the UI and
// displayed to the user.
class QueryGeneratorError extends Error {
}
exports.QueryGeneratorError = QueryGeneratorError;
// Internal column name for different rollover levels of aggregate columns.
function aggregationAlias(aggregationIndex) {
    return `agg_${aggregationIndex}`;
}
function areaFilters(area) {
    return [
        {
            op: (cols) => `${cols[0]} + ${cols[1]} > ${area.start}`,
            columns: ['ts', 'dur'],
        },
        { op: (cols) => `${cols[0]} < ${area.end}`, columns: ['ts'] },
        {
            op: (cols) => `${cols[0]} in (${getSelectedTrackSqlIds(area).join(', ')})`,
            columns: ['track_id'],
        },
    ];
}
function expression(column) {
    switch (column.kind) {
        case 'regular':
            return `${column.table}.${column.column}`;
        case 'argument':
            return extractArgumentExpression(column.argument, sliceTable.name);
    }
}
function aggregationExpression(aggregation) {
    if (aggregation.aggregationFunction === 'COUNT') {
        return 'COUNT()';
    }
    return `${aggregation.aggregationFunction}(${expression(aggregation.column)})`;
}
function extractArgumentExpression(argument, table) {
    const prefix = table === undefined ? '' : `${table}.`;
    return `extract_arg(${prefix}arg_set_id, ${(0, string_utils_1.sqliteString)(argument)})`;
}
function aggregationIndex(pivotColumns, aggregationNo) {
    return pivotColumns + aggregationNo;
}
function generateQueryFromState(state) {
    if (state.selectionArea === undefined) {
        throw new QueryGeneratorError('Should not be called without area');
    }
    const sliceTableAggregations = [...state.selectedAggregations.values()];
    if (sliceTableAggregations.length === 0) {
        throw new QueryGeneratorError('No aggregations selected');
    }
    const pivots = state.selectedPivots;
    const aggregations = sliceTableAggregations.map((agg, index) => `${aggregationExpression(agg)} as ${aggregationAlias(index)}`);
    const countIndex = aggregations.length;
    // Extra count aggregation, needed in order to compute combined averages.
    aggregations.push('COUNT() as hidden_count');
    const renderedPivots = pivots.map(expression);
    const sortClauses = [];
    for (let i = 0; i < sliceTableAggregations.length; i++) {
        const sortDirection = sliceTableAggregations[i].sortDirection;
        if (sortDirection !== undefined) {
            sortClauses.push(`${aggregationAlias(i)} ${sortDirection}`);
        }
    }
    const whereClause = state.constrainToArea
        ? `where ${areaFilters(state.selectionArea)
            .map((f) => f.op(f.columns))
            .join(' and\n')}`
        : '';
    const text = `
    INCLUDE PERFETTO MODULE slices.slices;

    select
      ${renderedPivots.concat(aggregations).join(',\n')}
    from ${sliceTable.name}
    ${whereClause}
    group by ${renderedPivots.join(', ')}
    ${sortClauses.length > 0 ? 'order by ' + sortClauses.join(', ') : ''}
  `;
    return {
        text,
        metadata: {
            pivotColumns: pivots,
            aggregationColumns: sliceTableAggregations,
            countIndex,
        },
    };
}
function getSelectedTrackSqlIds(area) {
    const selectedTrackKeys = [];
    for (const trackInfo of area.tracks) {
        if (trackInfo?.tags?.kind === track_kinds_1.SLICE_TRACK_KIND) {
            trackInfo.tags.trackIds &&
                selectedTrackKeys.push(...trackInfo.tags.trackIds);
        }
    }
    return selectedTrackKeys;
}
//# sourceMappingURL=pivot_table_query_generator.js.map