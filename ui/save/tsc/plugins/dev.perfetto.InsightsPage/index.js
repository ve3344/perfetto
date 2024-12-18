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
const insights_page_1 = require("./insights_page");
class default_1 {
    static id = 'dev.perfetto.InsightsPage';
    async onTraceLoad(trace) {
        trace.pages.registerPage({ route: '/insights', page: insights_page_1.InsightsPage });
        trace.sidebar.addMenuItem({
            section: 'current_trace',
            text: 'Insights',
            href: '#!/insights',
            icon: 'insights',
        });
    }
}
exports.default = default_1;
//# sourceMappingURL=index.js.map