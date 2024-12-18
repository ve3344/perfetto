"use strict";
// Copyright (C) 2018 The Android Open Source Project
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
const tslib_1 = require("tslib");
/**
 * This file actas as a namespace alias. It allows to import protos as follows
 * import protos from '../protos';
 * const x = new protos.TraceConfig.
 *
 * Rather than using the longer protos.perfetto.protos namespace that comes from
 * ProtobufJS's gen/protos.
 */
const protos_1 = tslib_1.__importDefault(require("../gen/protos"));
exports.default = protos_1.default.perfetto.protos;
//# sourceMappingURL=index.js.map