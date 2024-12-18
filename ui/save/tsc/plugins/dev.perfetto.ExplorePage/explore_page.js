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
exports.ExplorePage = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const state_1 = require("../../components/widgets/sql/legacy_table/state");
const table_1 = require("../../components/widgets/sql/legacy_table/table");
const utils_1 = require("../../base/utils");
const menu_1 = require("../../widgets/menu");
const button_1 = require("../../widgets/button");
const semantic_icons_1 = require("../../base/semantic_icons");
const details_shell_1 = require("../../widgets/details_shell");
const chart_1 = require("../../components/widgets/charts/chart");
const add_chart_menu_1 = require("../../components/widgets/charts/add_chart_menu");
const split_panel_1 = require("../../widgets/split_panel");
const dev_perfetto_SqlModules_1 = tslib_1.__importDefault(require("../dev.perfetto.SqlModules"));
const raf_1 = require("../../widgets/raf");
class ExplorePage {
    visibility = split_panel_1.SplitPanelDrawerVisibility.VISIBLE;
    // Show menu with standard library tables
    renderSelectableTablesMenuItems(trace, state) {
        const sqlModules = trace.plugins
            .getPlugin(dev_perfetto_SqlModules_1.default)
            .getSqlModules();
        return sqlModules.listTables().map((tableName) => {
            const sqlTable = sqlModules
                .getModuleForTable(tableName)
                ?.getTable(tableName);
            const sqlTableViewDescription = sqlModules
                .getModuleForTable(tableName)
                ?.getSqlTableDescription(tableName);
            return (0, mithril_1.default)(menu_1.MenuItem, {
                label: tableName,
                onclick: () => {
                    if ((state.selectedTableName &&
                        tableName === state.selectedTableName) ||
                        sqlTable === undefined ||
                        sqlTableViewDescription === undefined) {
                        return;
                    }
                    state.selectedTableName = sqlTable.name;
                    state.sqlTableViewState = new state_1.SqlTableState(trace, {
                        name: tableName,
                        columns: sqlTable.getTableColumns(),
                    }, { imports: sqlTableViewDescription.imports });
                },
            });
        });
    }
    renderSqlTable(state, charts) {
        const sqlTableViewState = state.sqlTableViewState;
        if (sqlTableViewState === undefined)
            return;
        const range = sqlTableViewState.getDisplayedRange();
        const rowCount = sqlTableViewState.getTotalRowCount();
        const navigation = [
            (0, utils_1.exists)(range) &&
                (0, utils_1.exists)(rowCount) &&
                `Showing rows ${range.from}-${range.to} of ${rowCount}`,
            (0, mithril_1.default)(button_1.Button, {
                icon: semantic_icons_1.Icons.GoBack,
                disabled: !sqlTableViewState.canGoBack(),
                onclick: () => sqlTableViewState.goBack(),
            }),
            (0, mithril_1.default)(button_1.Button, {
                icon: semantic_icons_1.Icons.GoForward,
                disabled: !sqlTableViewState.canGoForward(),
                onclick: () => sqlTableViewState.goForward(),
            }),
        ];
        return (0, mithril_1.default)(details_shell_1.DetailsShell, {
            title: 'Explore Table',
            buttons: navigation,
            fillParent: false,
        }, (0, mithril_1.default)(table_1.SqlTable, {
            state: sqlTableViewState,
            addColumnMenuItems: (column, columnAlias) => (0, mithril_1.default)(add_chart_menu_1.AddChartMenuItem, {
                chartConfig: (0, chart_1.createChartConfigFromSqlTableState)(column, columnAlias, sqlTableViewState),
                chartOptions: [chart_1.ChartOption.HISTOGRAM],
                addChart: (chart) => charts.add(chart),
            }),
        }));
    }
    renderRemovableChart(chart, charts) {
        return (0, mithril_1.default)('.chart-card', {
            key: `${chart.option}-${chart.config.columnTitle}`,
        }, (0, mithril_1.default)(button_1.Button, {
            icon: semantic_icons_1.Icons.Close,
            onclick: () => {
                charts.delete(chart);
                (0, raf_1.scheduleFullRedraw)();
            },
        }), (0, chart_1.renderChartComponent)(chart));
    }
    view({ attrs }) {
        const { trace, state, charts } = attrs;
        return (0, mithril_1.default)('.page.explore-page', (0, mithril_1.default)(split_panel_1.SplitPanel, {
            visibility: this.visibility,
            onVisibilityChange: (visibility) => {
                this.visibility = visibility;
            },
            drawerContent: this.renderSqlTable(state, charts),
        }, (0, mithril_1.default)('.chart-container', (0, mithril_1.default)(menu_1.Menu, this.renderSelectableTablesMenuItems(trace, state))), (0, mithril_1.default)('.chart-container', Array.from(charts.values()).map((chart) => this.renderRemovableChart(chart, charts)))));
    }
}
exports.ExplorePage = ExplorePage;
//# sourceMappingURL=explore_page.js.map