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
exports.APP_STATE_SCHEMA = exports.SERIALIZED_STATE_VERSION = void 0;
const zod_1 = require("zod");
const time_1 = require("../base/time");
// This should be bumped only in case of breaking changes that cannot be
// addressed using zod's z.optional(), z.default() or z.coerce.xxx().
// Ideally these cases should be extremely rare.
exports.SERIALIZED_STATE_VERSION = 1;
// At deserialization time this takes a string as input and converts it into a
// BigInt. The serialization side of this is handled by JsonSerialize(), which
// converts BigInt into strings when invoking JSON.stringify.
const zTime = zod_1.z
    .string()
    .regex(/[-]?\d+/)
    .transform((s) => time_1.Time.fromRaw(BigInt(s)));
const SELECTION_SCHEMA = zod_1.z.discriminatedUnion('kind', [
    zod_1.z.object({
        kind: zod_1.z.literal('TRACK_EVENT'),
        // This is actually the track URI but let's not rename for backwards compat
        trackKey: zod_1.z.string(),
        eventId: zod_1.z.string(),
        detailsPanel: zod_1.z.unknown(),
    }),
    zod_1.z.object({
        kind: zod_1.z.literal('AREA'),
        start: zTime,
        end: zTime,
        trackUris: zod_1.z.array(zod_1.z.string()),
    }),
]);
const NOTE_SCHEMA = zod_1.z
    .object({
    id: zod_1.z.string(),
    start: zTime,
    color: zod_1.z.string(),
    text: zod_1.z.string(),
})
    .and(zod_1.z.discriminatedUnion('noteType', [
    zod_1.z.object({ noteType: zod_1.z.literal('DEFAULT') }),
    zod_1.z.object({ noteType: zod_1.z.literal('SPAN'), end: zTime }),
]));
const PLUGIN_SCHEMA = zod_1.z.object({
    id: zod_1.z.string(),
    state: zod_1.z.any(),
});
exports.APP_STATE_SCHEMA = zod_1.z.object({
    version: zod_1.z.number(),
    pinnedTracks: zod_1.z.array(zod_1.z.string()).default([]),
    viewport: zod_1.z
        .object({
        start: zTime,
        end: zTime,
    })
        .optional(),
    selection: zod_1.z.array(SELECTION_SCHEMA).default([]),
    notes: zod_1.z.array(NOTE_SCHEMA).default([]),
    plugins: zod_1.z.array(PLUGIN_SCHEMA).default([]),
});
//# sourceMappingURL=state_serialization_schema.js.map