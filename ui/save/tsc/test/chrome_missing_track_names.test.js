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
const test_1 = require("@playwright/test");
const perfetto_ui_test_helper_1 = require("./perfetto_ui_test_helper");
test_1.test.describe.configure({ mode: 'serial' });
let pth;
let page;
test_1.test.beforeAll(async ({ browser }, _testInfo) => {
    page = await browser.newPage();
    pth = new perfetto_ui_test_helper_1.PerfettoTestHelper(page);
    await pth.openTraceFile('chrome_missing_track_names.pb.gz');
});
(0, test_1.test)('trace loaded', async () => {
    await pth.waitForIdleAndScreenshot('trace_loaded.png');
});
(0, test_1.test)('expand all tracks', async () => {
    await page.click('.header-panel-container button[title="Expand all"]');
    await pth.waitForIdleAndScreenshot('all_tracks_expanded.png');
});
//# sourceMappingURL=chrome_missing_track_names.test.js.map