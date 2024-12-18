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
const store_1 = require("../../base/store");
const utils_1 = require("../../base/utils");
const query_result_tab_1 = require("../../components/query_table/query_result_tab");
// This example plugin shows using state that is persisted in the
// permalink.
class default_1 {
    static id = 'com.example.ExampleState';
    store = (0, store_1.createStore)({ counter: 0 });
    migrate(initialState) {
        if ((0, utils_1.exists)(initialState) &&
            typeof initialState === 'object' &&
            'counter' in initialState &&
            typeof initialState.counter === 'number') {
            return { counter: initialState.counter };
        }
        else {
            return { counter: 0 };
        }
    }
    async onTraceLoad(ctx) {
        this.store = ctx.mountStore((init) => this.migrate(init));
        ctx.trash.use(this.store);
        ctx.commands.registerCommand({
            id: 'com.example.ExampleState#ShowCounter',
            name: 'Show ExampleState counter',
            callback: () => {
                const counter = this.store.state.counter;
                (0, query_result_tab_1.addQueryResultsTab)(ctx, {
                    query: `SELECT ${counter} as counter;`,
                    title: `Show counter ${counter}`,
                });
                this.store.edit((draft) => {
                    ++draft.counter;
                });
            },
        });
    }
}
exports.default = default_1;
//# sourceMappingURL=index.js.map