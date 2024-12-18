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
exports.ROUTE_SCHEMA = void 0;
const zod_1 = require("zod");
// We use .catch(undefined) on every field below to make sure that passing an
// invalid value doesn't invalidate the other keys which might be valid.
// Zod default behaviour is atomic: either everything validates correctly or
// the whole parsing fails.
exports.ROUTE_SCHEMA = zod_1.z
    .object({
    // The local_cache_key is special and is persisted across navigations.
    local_cache_key: zod_1.z.string().optional().catch(undefined),
    // These are transient and are really set only on startup.
    // Are we loading a trace via ABT.
    openFromAndroidBugTool: zod_1.z.boolean().optional().catch(undefined),
    // For permalink hash.
    s: zod_1.z.string().optional().catch(undefined),
    // DEPRECATED: for #!/record?p=cpu subpages (b/191255021).
    p: zod_1.z.string().optional().catch(undefined),
    // For fetching traces from Cloud Storage or local servers
    // as with record_android_trace.
    url: zod_1.z.string().optional().catch(undefined),
    // For connecting to a trace_processor_shell --httpd instance running on a
    // non-standard port. This requires the CSP_WS_PERMISSIVE_PORT flag to relax
    // the Content Security Policy.
    rpc_port: zod_1.z.string().regex(/\d+/).optional().catch(undefined),
    // Override the referrer. Useful for scripts such as
    // record_android_trace to record where the trace is coming from.
    referrer: zod_1.z.string().optional().catch(undefined),
    // For the 'mode' of the UI. For example when the mode is 'embedded'
    // some features are disabled.
    mode: zod_1.z.enum(['embedded']).optional().catch(undefined),
    // Should we hide the sidebar?
    hideSidebar: zod_1.z.boolean().optional().catch(undefined),
    // A comma-separated list of plugins to enable for the current session.
    enablePlugins: zod_1.z.string().optional().catch(undefined),
    // Deep link support
    table: zod_1.z.string().optional().catch(undefined),
    ts: zod_1.z.string().optional().catch(undefined),
    dur: zod_1.z.string().optional().catch(undefined),
    tid: zod_1.z.string().optional().catch(undefined),
    pid: zod_1.z.string().optional().catch(undefined),
    query: zod_1.z.string().optional().catch(undefined),
    visStart: zod_1.z.string().optional().catch(undefined),
    visEnd: zod_1.z.string().optional().catch(undefined),
})
    // default({}) ensures at compile-time that every entry is either optional or
    // has a default value.
    .default({});
//# sourceMappingURL=route_schema.js.map