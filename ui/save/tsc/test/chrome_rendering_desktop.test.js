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
    await pth.openTraceFile('chrome_rendering_desktop.pftrace');
});
(0, test_1.test)('load trace', async () => {
    await pth.waitForIdleAndScreenshot('loaded.png');
});
(0, test_1.test)('expand browser', async () => {
    const grp = pth.locateTrackGroup('Browser 12685');
    grp.scrollIntoViewIfNeeded();
    await pth.toggleTrackGroup(grp);
    await pth.waitForIdleAndScreenshot('browser_expanded.png');
    await pth.toggleTrackGroup(grp);
});
(0, test_1.test)('slice with flows', async () => {
    await pth.searchSlice('GenerateRenderPass');
    await pth.resetFocus();
    await page.keyboard.press('f');
    await pth.waitForPerfettoIdle();
    await pth.waitForIdleAndScreenshot('slice_with_flows.png');
});
//# sourceMappingURL=chrome_rendering_desktop.test.js.map