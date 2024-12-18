"use strict";
// Copyright (C) 2019 The Android Open Source Project
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
exports.EXPANDED_BACKGROUND = exports.COLLAPSED_BACKGROUND = exports.FOREGROUND_COLOR = exports.BACKGROUND_COLOR = exports.DEFAULT_DETAILS_CONTENT_HEIGHT = exports.OVERVIEW_TIMELINE_NON_VISIBLE_COLOR = exports.SELECTION_FILL_COLOR = exports.SELECTION_STROKE_COLOR = exports.TOPBAR_HEIGHT = exports.TRACK_BORDER_COLOR = exports.SIDEBAR_WIDTH = exports.TRACK_SHELL_WIDTH = void 0;
exports.initCssConstants = initCssConstants;
// This code can be used in unittests where we can't read CSS variables.
// Also we cannot have global constructors beacause when the javascript is
// loaded, the CSS might not be ready yet.
exports.TRACK_SHELL_WIDTH = 100;
exports.SIDEBAR_WIDTH = 100;
exports.TRACK_BORDER_COLOR = '#ffc0cb';
exports.TOPBAR_HEIGHT = 48;
exports.SELECTION_STROKE_COLOR = '#00344596';
exports.SELECTION_FILL_COLOR = '#8398e64d';
exports.OVERVIEW_TIMELINE_NON_VISIBLE_COLOR = '#c8c8c8cc';
exports.DEFAULT_DETAILS_CONTENT_HEIGHT = 308;
exports.BACKGROUND_COLOR = '#ffffff';
exports.FOREGROUND_COLOR = '#222';
exports.COLLAPSED_BACKGROUND = '#ffffff';
exports.EXPANDED_BACKGROUND = '#ffffff';
function initCssConstants() {
    exports.TRACK_SHELL_WIDTH = getCssNum('--track-shell-width') ?? exports.TRACK_SHELL_WIDTH;
    exports.SIDEBAR_WIDTH = getCssNum('--sidebar-width') ?? exports.SIDEBAR_WIDTH;
    exports.TRACK_BORDER_COLOR = getCssStr('--track-border-color') ?? exports.TRACK_BORDER_COLOR;
    exports.TOPBAR_HEIGHT = getCssNum('--topbar-height') ?? exports.TOPBAR_HEIGHT;
    exports.SELECTION_STROKE_COLOR =
        getCssStr('--selection-stroke-color') ?? exports.SELECTION_STROKE_COLOR;
    exports.SELECTION_FILL_COLOR =
        getCssStr('--selection-fill-color') ?? exports.SELECTION_FILL_COLOR;
    exports.OVERVIEW_TIMELINE_NON_VISIBLE_COLOR =
        getCssStr('--overview-timeline-non-visible-color') ??
            exports.OVERVIEW_TIMELINE_NON_VISIBLE_COLOR;
    exports.DEFAULT_DETAILS_CONTENT_HEIGHT =
        getCssNum('--details-content-height') ?? exports.DEFAULT_DETAILS_CONTENT_HEIGHT;
    exports.BACKGROUND_COLOR = getCssStr('--main-background-color') ?? exports.BACKGROUND_COLOR;
    exports.FOREGROUND_COLOR = getCssStr('--main-foreground-color') ?? exports.FOREGROUND_COLOR;
    exports.COLLAPSED_BACKGROUND =
        getCssStr('--collapsed-background') ?? exports.COLLAPSED_BACKGROUND;
    exports.EXPANDED_BACKGROUND =
        getCssStr('--expanded-background') ?? exports.EXPANDED_BACKGROUND;
}
function getCssStr(prop) {
    if (typeof window === 'undefined')
        return undefined;
    const body = window.document.body;
    const value = window.getComputedStyle(body).getPropertyValue(prop);
    // Note: getPropertyValue() returns an empty string if not set
    // https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/getPropertyValue#return_value
    return value === '' ? undefined : value;
}
function getCssNum(prop) {
    const str = getCssStr(prop);
    if (str === undefined)
        return undefined;
    const match = str.match(/^\W*(\d+)px(|\!important')$/);
    if (!match)
        throw Error(`Could not parse CSS property "${str}" as a number`);
    return Number(match[1]);
}
//# sourceMappingURL=css_constants.js.map