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
// Polyfill for Firefox and Safari which don't define the symbols yet.
// @ts-ignore
Symbol.dispose ??= Symbol('Symbol.dispose');
// @ts-ignore
Symbol.asyncDispose ??= Symbol('Symbol.asyncDispose');
//# sourceMappingURL=disposable_polyfill.js.map