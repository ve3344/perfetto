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
exports.addLegacyTableTab = addLegacyTableTab;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const clipboard_1 = require("../../base/clipboard");
const semantic_icons_1 = require("../../base/semantic_icons");
const utils_1 = require("../../base/utils");
const button_1 = require("../../widgets/button");
const details_shell_1 = require("../../widgets/details_shell");
const popup_1 = require("../../widgets/popup");
const add_debug_track_menu_1 = require("../tracks/add_debug_track_menu");
const state_1 = require("../widgets/sql/legacy_table/state");
const table_1 = require("../widgets/sql/legacy_table/table");
const menu_1 = require("../../widgets/menu");
const add_ephemeral_tab_1 = require("./add_ephemeral_tab");
const chart_tab_1 = require("../widgets/charts/chart_tab");
const chart_1 = require("../widgets/charts/chart");
const add_chart_menu_1 = require("../widgets/charts/add_chart_menu");
function addLegacyTableTab(trace, config) {
    addSqlTableTabWithState(new state_1.SqlTableState(trace, config.table, {
        filters: config.filters,
        imports: config.imports,
    }));
}
function addSqlTableTabWithState(state) {
    (0, add_ephemeral_tab_1.addEphemeralTab)('sqlTable', new LegacySqlTableTab(state));
}
class LegacySqlTableTab {
    state;
    constructor(state) {
        this.state = state;
    }
    render() {
        const range = this.state.getDisplayedRange();
        const rowCount = this.state.getTotalRowCount();
        const navigation = [
            (0, utils_1.exists)(range) &&
                (0, utils_1.exists)(rowCount) &&
                `Showing rows ${range.from}-${range.to} of ${rowCount}`,
            (0, mithril_1.default)(button_1.Button, {
                icon: semantic_icons_1.Icons.GoBack,
                disabled: !this.state.canGoBack(),
                onclick: () => this.state.goBack(),
            }),
            (0, mithril_1.default)(button_1.Button, {
                icon: semantic_icons_1.Icons.GoForward,
                disabled: !this.state.canGoForward(),
                onclick: () => this.state.goForward(),
            }),
        ];
        const { selectStatement, columns } = this.state.getCurrentRequest();
        const debugTrackColumns = Object.values(columns).filter((c) => !c.startsWith('__'));
        const addDebugTrack = (0, mithril_1.default)(popup_1.Popup, {
            trigger: (0, mithril_1.default)(button_1.Button, { label: 'Show debug track' }),
            position: popup_1.PopupPosition.Top,
        }, (0, mithril_1.default)(add_debug_track_menu_1.AddDebugTrackMenu, {
            trace: this.state.trace,
            dataSource: {
                sqlSource: `SELECT ${debugTrackColumns.join(', ')} FROM (${selectStatement})`,
                columns: debugTrackColumns,
            },
        }));
        return (0, mithril_1.default)(details_shell_1.DetailsShell, {
            title: 'Table',
            description: this.getDisplayName(),
            buttons: [
                ...navigation,
                addDebugTrack,
                (0, mithril_1.default)(menu_1.PopupMenu2, {
                    trigger: (0, mithril_1.default)(button_1.Button, {
                        icon: semantic_icons_1.Icons.Menu,
                    }),
                }, (0, mithril_1.default)(menu_1.MenuItem, {
                    label: 'Duplicate',
                    icon: 'tab_duplicate',
                    onclick: () => addSqlTableTabWithState(this.state.clone()),
                }), (0, mithril_1.default)(menu_1.MenuItem, {
                    label: 'Copy SQL query',
                    icon: semantic_icons_1.Icons.Copy,
                    onclick: () => (0, clipboard_1.copyToClipboard)(this.state.getNonPaginatedSQLQuery()),
                })),
            ],
        }, (0, mithril_1.default)(table_1.SqlTable, {
            state: this.state,
            addColumnMenuItems: (column, columnAlias) => (0, mithril_1.default)(add_chart_menu_1.AddChartMenuItem, {
                chartConfig: (0, chart_1.createChartConfigFromSqlTableState)(column, columnAlias, this.state),
                chartOptions: [chart_1.ChartOption.HISTOGRAM],
                addChart: (chart) => (0, chart_tab_1.addChartTab)(chart),
            }),
        }));
    }
    getTitle() {
        const rowCount = this.state.getTotalRowCount();
        const rows = rowCount === undefined ? '' : ` (${rowCount})`;
        return `Table ${this.getDisplayName()}${rows}`;
    }
    getDisplayName() {
        return this.state.config.displayName ?? this.state.config.name;
    }
    isLoading() {
        return this.state.isLoading();
    }
}
//# sourceMappingURL=sql_table_tab.js.map