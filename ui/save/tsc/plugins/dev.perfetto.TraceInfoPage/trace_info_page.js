"use strict";
// Copyright (C) 2020 The Android Open Source Project
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
exports.TraceInfoPage = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const query_result_1 = require("../../trace_processor/query_result");
const logging_1 = require("../../base/logging");
/**
 * Extracts and copies fields from a source object based on the keys present in
 * a spec object, effectively creating a new object that includes only the
 * fields that are present in the spec object.
 *
 * @template S - A type representing the spec object, a subset of T.
 * @template T - A type representing the source object, a superset of S.
 *
 * @param {T} source - The source object containing the full set of properties.
 * @param {S} spec - The specification object whose keys determine which fields
 * should be extracted from the source object.
 *
 * @returns {S} A new object containing only the fields from the source object
 * that are also present in the specification object.
 *
 * @example
 * const fullObject = { foo: 123, bar: '123', baz: true };
 * const spec = { foo: 0, bar: '' };
 * const result = pickFields(fullObject, spec);
 * console.log(result); // Output: { foo: 123, bar: '123' }
 */
function pickFields(source, spec) {
    const result = {};
    for (const key of Object.keys(spec)) {
        result[key] = source[key];
    }
    return result;
}
const statsSpec = {
    name: query_result_1.UNKNOWN,
    value: query_result_1.UNKNOWN,
    description: query_result_1.UNKNOWN,
    idx: query_result_1.UNKNOWN,
    severity: query_result_1.UNKNOWN,
    source: query_result_1.UNKNOWN,
};
// Generic class that generate a <section> + <table> from the stats table.
// The caller defines the query constraint, title and styling.
// Used for errors, data losses and debugging sections.
class StatsSection {
    data;
    constructor({ attrs }) {
        const engine = attrs.engine;
        if (engine === undefined) {
            return;
        }
        const query = `
      select
        name,
        value,
        cast(ifnull(idx, '') as text) as idx,
        description,
        severity,
        source from stats
      where ${attrs.sqlConstraints || '1=1'}
      order by name, idx
    `;
        engine.query(query).then((resp) => {
            const data = [];
            const it = resp.iter(statsSpec);
            for (; it.valid(); it.next()) {
                data.push(pickFields(it, statsSpec));
            }
            this.data = data;
        });
    }
    view({ attrs }) {
        const data = this.data;
        if (data === undefined || data.length === 0) {
            return (0, mithril_1.default)('');
        }
        const tableRows = data.map((row) => {
            const help = [];
            if (Boolean(row.description)) {
                help.push((0, mithril_1.default)('i.material-icons.contextual-help', 'help_outline'));
            }
            const idx = row.idx !== '' ? `[${row.idx}]` : '';
            return (0, mithril_1.default)('tr', (0, mithril_1.default)('td.name', { title: row.description }, `${row.name}${idx}`, help), (0, mithril_1.default)('td', `${row.value}`), (0, mithril_1.default)('td', `${row.severity} (${row.source})`));
        });
        return (0, mithril_1.default)(`section${attrs.cssClass}`, (0, mithril_1.default)('h2', attrs.title), (0, mithril_1.default)('h3', attrs.subTitle), (0, mithril_1.default)('table', (0, mithril_1.default)('thead', (0, mithril_1.default)('tr', (0, mithril_1.default)('td', 'Name'), (0, mithril_1.default)('td', 'Value'), (0, mithril_1.default)('td', 'Type'))), (0, mithril_1.default)('tbody', tableRows)));
    }
}
class LoadingErrors {
    view({ attrs }) {
        const errors = attrs.trace.loadingErrors;
        if (errors.length === 0)
            return;
        return (0, mithril_1.default)(`section.errors`, (0, mithril_1.default)('h2', `Loading errors`), (0, mithril_1.default)('h3', `The following errors were encountered while loading the trace:`), (0, mithril_1.default)('pre.metric-error', errors.join('\n')));
    }
}
const traceMetadataRowSpec = { name: query_result_1.UNKNOWN, value: query_result_1.UNKNOWN };
class TraceMetadata {
    data;
    oncreate({ attrs }) {
        const engine = attrs.engine;
        const query = `
      with metadata_with_priorities as (
        select
          name,
          ifnull(str_value, cast(int_value as text)) as value,
          name in (
            "trace_size_bytes",
            "cr-os-arch",
            "cr-os-name",
            "cr-os-version",
            "cr-physical-memory",
            "cr-product-version",
            "cr-hardware-class"
          ) as priority
        from metadata
      )
      select
        name,
        value
      from metadata_with_priorities
      order by
        priority desc,
        name
    `;
        engine.query(query).then((resp) => {
            const tableRows = [];
            const it = resp.iter(traceMetadataRowSpec);
            for (; it.valid(); it.next()) {
                tableRows.push(pickFields(it, traceMetadataRowSpec));
            }
            this.data = tableRows;
        });
    }
    view() {
        const data = this.data;
        if (data === undefined || data.length === 0) {
            return (0, mithril_1.default)('');
        }
        const tableRows = data.map((row) => {
            return (0, mithril_1.default)('tr', (0, mithril_1.default)('td.name', `${row.name}`), (0, mithril_1.default)('td', `${row.value}`));
        });
        return (0, mithril_1.default)('section', (0, mithril_1.default)('h2', 'System info and metadata'), (0, mithril_1.default)('table', (0, mithril_1.default)('thead', (0, mithril_1.default)('tr', (0, mithril_1.default)('td', 'Name'), (0, mithril_1.default)('td', 'Value'))), (0, mithril_1.default)('tbody', tableRows)));
    }
}
const androidGameInterventionRowSpec = {
    package_name: query_result_1.UNKNOWN,
    uid: query_result_1.UNKNOWN,
    current_mode: query_result_1.UNKNOWN,
    standard_mode_supported: query_result_1.UNKNOWN,
    standard_mode_downscale: query_result_1.UNKNOWN,
    standard_mode_use_angle: query_result_1.UNKNOWN,
    standard_mode_fps: query_result_1.UNKNOWN,
    perf_mode_supported: query_result_1.UNKNOWN,
    perf_mode_downscale: query_result_1.UNKNOWN,
    perf_mode_use_angle: query_result_1.UNKNOWN,
    perf_mode_fps: query_result_1.UNKNOWN,
    battery_mode_supported: query_result_1.UNKNOWN,
    battery_mode_downscale: query_result_1.UNKNOWN,
    battery_mode_use_angle: query_result_1.UNKNOWN,
    battery_mode_fps: query_result_1.UNKNOWN,
};
class AndroidGameInterventionList {
    data;
    oncreate({ attrs }) {
        const engine = attrs.engine;
        const query = `
      select
        package_name,
        uid,
        current_mode,
        standard_mode_supported,
        standard_mode_downscale,
        standard_mode_use_angle,
        standard_mode_fps,
        perf_mode_supported,
        perf_mode_downscale,
        perf_mode_use_angle,
        perf_mode_fps,
        battery_mode_supported,
        battery_mode_downscale,
        battery_mode_use_angle,
        battery_mode_fps
      from android_game_intervention_list
    `;
        engine.query(query).then((resp) => {
            const data = [];
            const it = resp.iter(androidGameInterventionRowSpec);
            for (; it.valid(); it.next()) {
                data.push(pickFields(it, androidGameInterventionRowSpec));
            }
            this.data = data;
        });
    }
    view() {
        const data = this.data;
        if (data === undefined || data.length === 0) {
            return (0, mithril_1.default)('');
        }
        const tableRows = [];
        let standardInterventions = '';
        let perfInterventions = '';
        let batteryInterventions = '';
        for (const row of data) {
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            if (row.standard_mode_supported) {
                standardInterventions = `angle=${row.standard_mode_use_angle},downscale=${row.standard_mode_downscale},fps=${row.standard_mode_fps}`;
            }
            else {
                standardInterventions = 'Not supported';
            }
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            if (row.perf_mode_supported) {
                perfInterventions = `angle=${row.perf_mode_use_angle},downscale=${row.perf_mode_downscale},fps=${row.perf_mode_fps}`;
            }
            else {
                perfInterventions = 'Not supported';
            }
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            if (row.battery_mode_supported) {
                batteryInterventions = `angle=${row.battery_mode_use_angle},downscale=${row.battery_mode_downscale},fps=${row.battery_mode_fps}`;
            }
            else {
                batteryInterventions = 'Not supported';
            }
            // Game mode numbers are defined in
            // https://cs.android.com/android/platform/superproject/+/main:frameworks/base/core/java/android/app/GameManager.java;l=68
            if (row.current_mode === 1) {
                row.current_mode = 'Standard';
            }
            else if (row.current_mode === 2) {
                row.current_mode = 'Performance';
            }
            else if (row.current_mode === 3) {
                row.current_mode = 'Battery';
            }
            tableRows.push((0, mithril_1.default)('tr', (0, mithril_1.default)('td.name', `${row.package_name}`), (0, mithril_1.default)('td', `${row.current_mode}`), (0, mithril_1.default)('td', standardInterventions), (0, mithril_1.default)('td', perfInterventions), (0, mithril_1.default)('td', batteryInterventions)));
        }
        return (0, mithril_1.default)('section', (0, mithril_1.default)('h2', 'Game Intervention List'), (0, mithril_1.default)('table', (0, mithril_1.default)('thead', (0, mithril_1.default)('tr', (0, mithril_1.default)('td', 'Name'), (0, mithril_1.default)('td', 'Current mode'), (0, mithril_1.default)('td', 'Standard mode interventions'), (0, mithril_1.default)('td', 'Performance mode interventions'), (0, mithril_1.default)('td', 'Battery mode interventions'))), (0, mithril_1.default)('tbody', tableRows)));
    }
}
const packageDataSpec = {
    packageName: query_result_1.UNKNOWN,
    versionCode: query_result_1.UNKNOWN,
    debuggable: query_result_1.UNKNOWN,
    profileableFromShell: query_result_1.UNKNOWN,
};
class PackageListSection {
    packageList;
    oncreate({ attrs }) {
        const engine = attrs.engine;
        this.loadData(engine);
    }
    async loadData(engine) {
        const query = `
      select
        package_name as packageName,
        version_code as versionCode,
        debuggable,
        profileable_from_shell as profileableFromShell
      from package_list
    `;
        const packageList = [];
        const result = await engine.query(query);
        const it = result.iter(packageDataSpec);
        for (; it.valid(); it.next()) {
            packageList.push(pickFields(it, packageDataSpec));
        }
        this.packageList = packageList;
    }
    view() {
        const packageList = this.packageList;
        if (packageList === undefined || packageList.length === 0) {
            return undefined;
        }
        const tableRows = packageList.map((it) => {
            return (0, mithril_1.default)('tr', (0, mithril_1.default)('td.name', `${it.packageName}`), (0, mithril_1.default)('td', `${it.versionCode}`), 
            /* eslint-disable @typescript-eslint/strict-boolean-expressions */
            (0, mithril_1.default)('td', `${it.debuggable ? 'debuggable' : ''} ${it.profileableFromShell ? 'profileable' : ''}`));
        });
        return (0, mithril_1.default)('section', (0, mithril_1.default)('h2', 'Package list'), (0, mithril_1.default)('table', (0, mithril_1.default)('thead', (0, mithril_1.default)('tr', (0, mithril_1.default)('td', 'Name'), (0, mithril_1.default)('td', 'Version code'), (0, mithril_1.default)('td', 'Flags'))), (0, mithril_1.default)('tbody', tableRows)));
    }
}
class TraceInfoPage {
    engine;
    oninit({ attrs }) {
        this.engine = attrs.trace.engine.getProxy('TraceInfoPage');
    }
    view({ attrs }) {
        const engine = (0, logging_1.assertExists)(this.engine);
        return (0, mithril_1.default)('.trace-info-page', (0, mithril_1.default)(LoadingErrors, { trace: attrs.trace }), (0, mithril_1.default)(StatsSection, {
            engine,
            queryId: 'info_errors',
            title: 'Import errors',
            cssClass: '.errors',
            subTitle: `The following errors have been encountered while importing
               the trace. These errors are usually non-fatal but indicate that
               one or more tracks might be missing or showing erroneous data.`,
            sqlConstraints: `severity = 'error' and value > 0`,
        }), (0, mithril_1.default)(StatsSection, {
            engine,
            queryId: 'info_data_losses',
            title: 'Data losses',
            cssClass: '.errors',
            subTitle: `These counters are collected at trace recording time. The
               trace data for one or more data sources was dropped and hence
               some track contents will be incomplete.`,
            sqlConstraints: `severity = 'data_loss' and value > 0`,
        }), (0, mithril_1.default)(TraceMetadata, { engine }), (0, mithril_1.default)(PackageListSection, { engine }), (0, mithril_1.default)(AndroidGameInterventionList, { engine }), (0, mithril_1.default)(StatsSection, {
            engine,
            queryId: 'info_all',
            title: 'Debugging stats',
            cssClass: '',
            subTitle: `Debugging statistics such as trace buffer usage and metrics
                     coming from the TraceProcessor importer stages.`,
            sqlConstraints: '',
        }));
    }
}
exports.TraceInfoPage = TraceInfoPage;
//# sourceMappingURL=trace_info_page.js.map