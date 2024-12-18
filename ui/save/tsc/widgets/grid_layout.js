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
exports.GridLayoutColumn = exports.GridLayout = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
// GridLayout is a container that arranges elements into a two-column grid when
// the screen is wide, and a single column when the screen is narrow.
// Consider the following layout (where A, B, C, and D are arbitrary components)
//   m(GridLayout, A, B, C, D)
//
// On a wide screen we get:
// ┌─────────┐ ┌─────────┐
// │    A    │ │    B    │
// │         │ └─────────┘
// │         │
// └─────────┘
// ┌─────────┐ ┌─────────┐
// │    C    │ │    D    │
// │         │ │         │
// │         │ └─────────┘
// └─────────┘
//
// And on a narrow screen we get:
// ┌─────┐
// │  A  │
// │     │
// │     │
// └─────┘
// ┌─────┐
// │  B  │
// └────-┘
// ┌─────┐
// │  C  │
// │     │
// │     │
// └─────┘
// ┌─────┐
// │  D  │
// │     │
// └─────┘
class GridLayout {
    view({ children }) {
        return (0, mithril_1.default)('div.pf-grid-layout', children);
    }
}
exports.GridLayout = GridLayout;
// ColumnLayouts can be used inside a GridLayout to group elements together
// vertically and to acheive a more aesthetically pleasing vertical spacing of
// elements in the same column.
// Consider the same example from above but instead the elements are placed
// inside columns.
//   m(GridLayout, m(Column, A, C), m(Column, B, D))
//
// On a wide screen we get:
// ┌─────────┐ ┌─────────┐
// │    A    │ │    B    │
// │         │ └─────────┘
// │         │ ┌─────────┐ <- This gap has disappeared
// └─────────┘ │    D    │
// ┌─────────┐ │         │
// │    C    │ └─────────┘
// │         │
// │         │
// └─────────┘
//
// And on a narrow screen we get:
// ┌─────┐
// │  A  │
// │     │
// │     │
// └─────┘
// ┌─────┐
// │  C  │
// │     │
// │     │
// └─────┘
// ┌─────┐
// │  B  │
// └────-┘
// ┌─────┐
// │  D  │
// │     │
// └─────┘
//
// The gap between column elements are the same size as the gaps in the grid
// layout, so we get keep spacing between all elements in the grid.
class GridLayoutColumn {
    view({ children }) {
        return (0, mithril_1.default)('div.pf-grid-layout-column', children);
    }
}
exports.GridLayoutColumn = GridLayoutColumn;
//# sourceMappingURL=grid_layout.js.map