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
exports.SIDEBAR_SECTIONS = void 0;
// For now sections are fixed and cannot be extended by plugins.
exports.SIDEBAR_SECTIONS = {
    navigation: {
        title: 'Navigation',
        summary: 'Open or record a new trace',
    },
    current_trace: {
        title: 'Current Trace',
        summary: 'Actions on the current trace',
    },
    convert_trace: {
        title: 'Convert trace',
        summary: 'Convert to other formats',
    },
    example_traces: {
        title: 'Example Traces',
        summary: 'Open an example trace',
    },
    support: {
        title: 'Support',
        summary: 'Documentation & Bugs',
    },
};
//# sourceMappingURL=sidebar.js.map