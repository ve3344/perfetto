"use strict";
// Copyright (C) 2022 The Android Open Source Project
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
exports.escapeQuery = escapeQuery;
exports.escapeSearchQuery = escapeSearchQuery;
exports.escapeGlob = escapeGlob;
var EscapeFlag;
(function (EscapeFlag) {
    EscapeFlag[EscapeFlag["CaseInsensitive"] = 1] = "CaseInsensitive";
    EscapeFlag[EscapeFlag["MatchAny"] = 2] = "MatchAny";
})(EscapeFlag || (EscapeFlag = {}));
function escape(s, flags) {
    flags = flags === undefined ? 0 : flags;
    // See https://www.sqlite.org/lang_expr.html#:~:text=A%20string%20constant
    s = s.replaceAll("'", "''");
    s = s.replaceAll('[', '[[]');
    if (flags & EscapeFlag.CaseInsensitive) {
        s = s.replace(/[a-zA-Z]/g, (m) => {
            const lower = m.toLowerCase();
            const upper = m.toUpperCase();
            return `[${lower}${upper}]`;
        });
    }
    s = s.replaceAll('?', '[?]');
    s = s.replaceAll('*', '[*]');
    if (flags & EscapeFlag.MatchAny) {
        s = `*${s}*`;
    }
    s = `'${s}'`;
    return s;
}
function escapeQuery(s) {
    return escape(s);
}
function escapeSearchQuery(s) {
    return escape(s, EscapeFlag.CaseInsensitive | EscapeFlag.MatchAny);
}
function escapeGlob(s) {
    // For globs we are only preoccupied by mismatching single quotes.
    s = s.replaceAll("'", "''");
    return `'*${s}*'`;
}
//# sourceMappingURL=query_utils.js.map