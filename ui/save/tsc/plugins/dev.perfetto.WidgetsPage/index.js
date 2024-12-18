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
const widgets_page_1 = require("./widgets_page");
class default_1 {
    static id = 'dev.perfetto.WidgetsPage';
    static onActivate(app) {
        app.pages.registerPage({
            route: '/widgets',
            page: widgets_page_1.WidgetsPage,
            traceless: true,
        });
        app.sidebar.addMenuItem({
            section: 'navigation',
            text: 'Widgets',
            href: '#!/widgets',
            icon: 'widgets',
            sortOrder: 99,
        });
    }
}
exports.default = default_1;
//# sourceMappingURL=index.js.map