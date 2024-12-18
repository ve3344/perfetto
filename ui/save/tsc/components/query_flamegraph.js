"use strict";
// Copyright (C) 2024 The Android Open Source Project
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
exports.QueryFlamegraph = void 0;
exports.metricsFromTableOrSubquery = metricsFromTableOrSubquery;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const async_limiter_1 = require("../base/async_limiter");
const disposable_stack_1 = require("../base/disposable_stack");
const logging_1 = require("../base/logging");
const monitor_1 = require("../base/monitor");
const uuid_1 = require("../base/uuid");
const sql_utils_1 = require("../trace_processor/sql_utils");
const query_result_1 = require("../trace_processor/query_result");
const flamegraph_1 = require("../widgets/flamegraph");
// Given a table and columns on those table (corresponding to metrics),
// returns an array of `QueryFlamegraphMetric` structs which can be passed
// in QueryFlamegraph's attrs.
//
// `tableOrSubquery` should have the columns `id`, `parentId`, `name` and all
// columns specified by `tableMetrics[].name`, `unaggregatableProperties` and
// `aggregatableProperties`.
function metricsFromTableOrSubquery(tableOrSubquery, tableMetrics, dependencySql, unaggregatableProperties, aggregatableProperties) {
    const metrics = [];
    for (const { name, unit, columnName } of tableMetrics) {
        metrics.push({
            name,
            unit,
            dependencySql,
            statement: `
        select *, ${columnName} as value
        from ${tableOrSubquery}
      `,
            unaggregatableProperties,
            aggregatableProperties,
        });
    }
    return metrics;
}
// A Perfetto UI component which wraps the `Flamegraph` widget and fetches the
// data for the widget by querying an `Engine`.
class QueryFlamegraph {
    trace;
    metrics;
    state;
    data;
    selMonitor = new monitor_1.Monitor([() => this.state.state]);
    queryLimiter = new async_limiter_1.AsyncLimiter();
    constructor(trace, metrics, state) {
        this.trace = trace;
        this.metrics = metrics;
        this.state = state;
    }
    render() {
        if (this.selMonitor.ifStateChanged()) {
            const metric = (0, logging_1.assertExists)(this.metrics.find((x) => this.state.state.selectedMetricName === x.name));
            const engine = this.trace.engine;
            const state = this.state;
            this.data = undefined;
            this.queryLimiter.schedule(async () => {
                this.data = undefined;
                this.data = await computeFlamegraphTree(engine, metric, state.state);
            });
        }
        return (0, mithril_1.default)(flamegraph_1.Flamegraph, {
            metrics: this.metrics,
            data: this.data,
            state: this.state.state,
            onStateChange: (state) => {
                this.state.state = state;
                this.trace.scheduleFullRedraw();
            },
        });
    }
}
exports.QueryFlamegraph = QueryFlamegraph;
async function computeFlamegraphTree(engine, { dependencySql, statement, unaggregatableProperties, aggregatableProperties, }, { filters, view }) {
    const env_1 = { stack: [], error: void 0, hasError: false };
    try {
        const showStack = filters
            .filter((x) => x.kind === 'SHOW_STACK')
            .map((x) => x.filter);
        const hideStack = filters
            .filter((x) => x.kind === 'HIDE_STACK')
            .map((x) => x.filter);
        const showFromFrame = filters
            .filter((x) => x.kind === 'SHOW_FROM_FRAME')
            .map((x) => x.filter);
        const hideFrame = filters
            .filter((x) => x.kind === 'HIDE_FRAME')
            .map((x) => x.filter);
        // Pivot also essentially acts as a "show stack" filter so treat it like one.
        const showStackAndPivot = [...showStack];
        if (view.kind === 'PIVOT') {
            showStackAndPivot.push(view.pivot);
        }
        const showStackFilter = showStackAndPivot.length === 0
            ? '0'
            : showStackAndPivot
                .map((x, i) => `((name like '${makeSqlFilter(x)}' escape '\\') << ${i})`)
                .join(' | ');
        const showStackBits = (1 << showStackAndPivot.length) - 1;
        const hideStackFilter = hideStack.length === 0
            ? 'false'
            : hideStack
                .map((x) => `name like '${makeSqlFilter(x)}' escape '\\'`)
                .join(' OR ');
        const showFromFrameFilter = showFromFrame.length === 0
            ? '0'
            : showFromFrame
                .map((x, i) => `((name like '${makeSqlFilter(x)}' escape '\\') << ${i})`)
                .join(' | ');
        const showFromFrameBits = (1 << showFromFrame.length) - 1;
        const hideFrameFilter = hideFrame.length === 0
            ? 'false'
            : hideFrame
                .map((x) => `name like '${makeSqlFilter(x)}' escape '\\'`)
                .join(' OR ');
        const pivotFilter = getPivotFilter(view);
        const unagg = unaggregatableProperties ?? [];
        const unaggCols = unagg.map((x) => x.name);
        const agg = aggregatableProperties ?? [];
        const aggCols = agg.map((x) => x.name);
        const groupingColumns = `(${(unaggCols.length === 0 ? ['groupingColumn'] : unaggCols).join()})`;
        const groupedColumns = `(${(aggCols.length === 0 ? ['groupedColumn'] : aggCols).join()})`;
        if (dependencySql !== undefined) {
            await engine.query(dependencySql);
        }
        await engine.query(`include perfetto module viz.flamegraph;`);
        const uuid = (0, uuid_1.uuidv4Sql)();
        const disposable = tslib_1.__addDisposableResource(env_1, new disposable_stack_1.AsyncDisposableStack(), true);
        disposable.use(await (0, sql_utils_1.createPerfettoTable)(engine, `_flamegraph_materialized_statement_${uuid}`, statement));
        disposable.use(await (0, sql_utils_1.createPerfettoIndex)(engine, `_flamegraph_materialized_statement_${uuid}_index`, `_flamegraph_materialized_statement_${uuid}(parentId)`));
        // TODO(lalitm): this doesn't need to be called unless we have
        // a non-empty set of filters.
        disposable.use(await (0, sql_utils_1.createPerfettoTable)(engine, `_flamegraph_source_${uuid}`, `
        select *
        from _viz_flamegraph_prepare_filter!(
          (
            select
              s.id,
              s.parentId,
              s.name,
              s.value,
              ${(unaggCols.length === 0
            ? [`'' as groupingColumn`]
            : unaggCols.map((x) => `s.${x}`)).join()},
              ${(aggCols.length === 0
            ? [`'' as groupedColumn`]
            : aggCols.map((x) => `s.${x}`)).join()}
            from _flamegraph_materialized_statement_${uuid} s
          ),
          (${showStackFilter}),
          (${hideStackFilter}),
          (${showFromFrameFilter}),
          (${hideFrameFilter}),
          (${pivotFilter}),
          ${1 << showStackAndPivot.length},
          ${groupingColumns}
        )
      `));
        // TODO(lalitm): this doesn't need to be called unless we have
        // a non-empty set of filters.
        disposable.use(await (0, sql_utils_1.createPerfettoTable)(engine, `_flamegraph_filtered_${uuid}`, `
        select *
        from _viz_flamegraph_filter_frames!(
          _flamegraph_source_${uuid},
          ${showFromFrameBits}
        )
      `));
        disposable.use(await (0, sql_utils_1.createPerfettoTable)(engine, `_flamegraph_accumulated_${uuid}`, `
        select *
        from _viz_flamegraph_accumulate!(
          _flamegraph_filtered_${uuid},
          ${showStackBits}
        )
      `));
        disposable.use(await (0, sql_utils_1.createPerfettoTable)(engine, `_flamegraph_hash_${uuid}`, `
        select *
        from _viz_flamegraph_downwards_hash!(
          _flamegraph_source_${uuid},
          _flamegraph_filtered_${uuid},
          _flamegraph_accumulated_${uuid},
          ${groupingColumns},
          ${groupedColumns},
          ${view.kind === 'BOTTOM_UP' ? 'FALSE' : 'TRUE'}
        )
        union all
        select *
        from _viz_flamegraph_upwards_hash!(
          _flamegraph_source_${uuid},
          _flamegraph_filtered_${uuid},
          _flamegraph_accumulated_${uuid},
          ${groupingColumns},
          ${groupedColumns}
        )
        order by hash
      `));
        disposable.use(await (0, sql_utils_1.createPerfettoTable)(engine, `_flamegraph_merged_${uuid}`, `
        select *
        from _viz_flamegraph_merge_hashes!(
          _flamegraph_hash_${uuid},
          ${groupingColumns},
          ${computeGroupedAggExprs(agg)}
        )
      `));
        disposable.use(await (0, sql_utils_1.createPerfettoTable)(engine, `_flamegraph_layout_${uuid}`, `
        select *
        from _viz_flamegraph_local_layout!(
          _flamegraph_merged_${uuid}
        );
      `));
        const res = await engine.query(`
    select *
    from _viz_flamegraph_global_layout!(
      _flamegraph_merged_${uuid},
      _flamegraph_layout_${uuid},
      ${groupingColumns},
      ${groupedColumns}
    )
  `);
        const it = res.iter({
            id: query_result_1.NUM,
            parentId: query_result_1.NUM,
            depth: query_result_1.NUM,
            name: query_result_1.STR,
            selfValue: query_result_1.NUM,
            cumulativeValue: query_result_1.NUM,
            parentCumulativeValue: query_result_1.NUM_NULL,
            xStart: query_result_1.NUM,
            xEnd: query_result_1.NUM,
            ...Object.fromEntries(unaggCols.map((m) => [m, query_result_1.STR_NULL])),
            ...Object.fromEntries(aggCols.map((m) => [m, query_result_1.UNKNOWN])),
        });
        let postiveRootsValue = 0;
        let negativeRootsValue = 0;
        let minDepth = 0;
        let maxDepth = 0;
        const nodes = [];
        for (; it.valid(); it.next()) {
            const properties = new Map();
            for (const a of [...agg, ...unagg]) {
                const r = it.get(a.name);
                if (r !== null) {
                    properties.set(a.displayName, r);
                }
            }
            nodes.push({
                id: it.id,
                parentId: it.parentId,
                depth: it.depth,
                name: it.name,
                selfValue: it.selfValue,
                cumulativeValue: it.cumulativeValue,
                parentCumulativeValue: it.parentCumulativeValue ?? undefined,
                xStart: it.xStart,
                xEnd: it.xEnd,
                properties,
            });
            if (it.depth === 1) {
                postiveRootsValue += it.cumulativeValue;
            }
            else if (it.depth === -1) {
                negativeRootsValue += it.cumulativeValue;
            }
            minDepth = Math.min(minDepth, it.depth);
            maxDepth = Math.max(maxDepth, it.depth);
        }
        const sumQuery = await engine.query(`select sum(value) v from _flamegraph_source_${uuid}`);
        const unfilteredCumulativeValue = sumQuery.firstRow({ v: query_result_1.NUM_NULL }).v ?? 0;
        return {
            nodes,
            allRootsCumulativeValue: view.kind === 'BOTTOM_UP' ? negativeRootsValue : postiveRootsValue,
            unfilteredCumulativeValue,
            minDepth,
            maxDepth,
        };
    }
    catch (e_1) {
        env_1.error = e_1;
        env_1.hasError = true;
    }
    finally {
        const result_1 = tslib_1.__disposeResources(env_1);
        if (result_1)
            await result_1;
    }
}
function makeSqlFilter(x) {
    if (x.startsWith('^') && x.endsWith('$')) {
        return x.slice(1, -1);
    }
    return `%${x}%`;
}
function getPivotFilter(view) {
    if (view.kind === 'PIVOT') {
        return `name like '${makeSqlFilter(view.pivot)}'`;
    }
    if (view.kind === 'BOTTOM_UP') {
        return 'value > 0';
    }
    return '0';
}
function computeGroupedAggExprs(agg) {
    const aggFor = (x) => {
        switch (x.mergeAggregation) {
            case 'ONE_OR_NULL':
                return `IIF(COUNT() = 1, ${x.name}, NULL) AS ${x.name}`;
            case 'SUM':
                return `SUM(${x.name}) AS ${x.name}`;
        }
    };
    return `(${agg.length === 0 ? 'groupedColumn' : agg.map((x) => aggFor(x)).join(',')})`;
}
//# sourceMappingURL=query_flamegraph.js.map