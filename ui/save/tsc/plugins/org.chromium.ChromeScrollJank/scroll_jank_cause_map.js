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
exports.ScrollJankCauseMap = exports.CauseThread = exports.CauseProcess = void 0;
const utils_1 = require("../../base/utils");
const query_result_1 = require("../../trace_processor/query_result");
var CauseProcess;
(function (CauseProcess) {
    CauseProcess[CauseProcess["UNKNOWN"] = 0] = "UNKNOWN";
    CauseProcess["BROWSER"] = "Browser";
    CauseProcess["RENDERER"] = "Renderer";
    CauseProcess["GPU"] = "GPU";
})(CauseProcess || (exports.CauseProcess = CauseProcess = {}));
var CauseThread;
(function (CauseThread) {
    CauseThread[CauseThread["UNKNOWN"] = 0] = "UNKNOWN";
    CauseThread["BROWSER_MAIN"] = "CrBrowserMain";
    CauseThread["RENDERER_MAIN"] = "CrRendererMain";
    CauseThread["COMPOSITOR"] = "Compositor";
    CauseThread["CHROME_CHILD_IO_THREAD"] = "Chrome_ChildIOThread";
    CauseThread["VIZ_COMPOSITOR"] = "VizCompositorThread";
    CauseThread["SURFACE_FLINGER"] = "surfaceflinger";
})(CauseThread || (exports.CauseThread = CauseThread = {}));
function getScrollJankProcess(process) {
    switch (process) {
        case CauseProcess.BROWSER:
            return CauseProcess.BROWSER;
        case CauseProcess.RENDERER:
            return CauseProcess.RENDERER;
        case CauseProcess.GPU:
            return CauseProcess.GPU;
        default:
            return CauseProcess.UNKNOWN;
    }
}
function getScrollJankThread(thread) {
    switch (thread) {
        case CauseThread.BROWSER_MAIN:
            return CauseThread.BROWSER_MAIN;
        case CauseThread.RENDERER_MAIN:
            return CauseThread.RENDERER_MAIN;
        case CauseThread.CHROME_CHILD_IO_THREAD:
            return CauseThread.CHROME_CHILD_IO_THREAD;
        case CauseThread.COMPOSITOR:
            return CauseThread.COMPOSITOR;
        case CauseThread.VIZ_COMPOSITOR:
            return CauseThread.VIZ_COMPOSITOR;
        case CauseThread.SURFACE_FLINGER:
            return CauseThread.SURFACE_FLINGER;
        default:
            return CauseThread.UNKNOWN;
    }
}
class ScrollJankCauseMap {
    static instance;
    causes;
    constructor() {
        this.causes = {};
    }
    async initializeCauseMap(engine) {
        const queryResult = await engine.query(`
      INCLUDE PERFETTO MODULE chrome.scroll_jank.scroll_jank_cause_map;

      SELECT
        IFNULL(name, '') AS name,
        IFNULL(description, '') AS description,
        IFNULL(cause_process, '') AS causeProcess,
        IFNULL(cause_thread, '') AS causeThread,
        IFNULL(cause_description, '') AS causeDescription
      FROM chrome_scroll_jank_causes_with_event_latencies;
    `);
        const iter = queryResult.iter({
            name: query_result_1.STR,
            description: query_result_1.STR,
            causeProcess: query_result_1.STR,
            causeThread: query_result_1.STR,
            causeDescription: query_result_1.STR,
        });
        for (; iter.valid(); iter.next()) {
            const eventLatencyStage = iter.name;
            if (!(eventLatencyStage in this.causes)) {
                this.causes[eventLatencyStage] = {
                    description: iter.description,
                    jankCauses: [],
                };
            }
            const causeProcess = getScrollJankProcess(iter.causeProcess);
            const causeThread = getScrollJankThread(iter.causeThread);
            this.causes[eventLatencyStage].jankCauses.push({
                description: iter.causeDescription,
                process: causeProcess,
                thread: causeThread,
            });
        }
    }
    // Must be called before this item is accessed, as the object is populated
    // from SQL data.
    static async initialize(engine) {
        if (!(0, utils_1.exists)(ScrollJankCauseMap.instance)) {
            ScrollJankCauseMap.instance = new ScrollJankCauseMap();
            await ScrollJankCauseMap.instance.initializeCauseMap(engine);
        }
    }
    static getEventLatencyDetails(eventLatency) {
        if (eventLatency in ScrollJankCauseMap.instance.causes) {
            return ScrollJankCauseMap.instance.causes[eventLatency];
        }
        return undefined;
    }
}
exports.ScrollJankCauseMap = ScrollJankCauseMap;
//# sourceMappingURL=scroll_jank_cause_map.js.map