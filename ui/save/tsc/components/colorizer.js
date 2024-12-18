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
exports.UNEXPECTED_PINK = void 0;
exports.makeColorScheme = makeColorScheme;
exports.colorForState = colorForState;
exports.colorForTid = colorForTid;
exports.colorForThread = colorForThread;
exports.colorForCpu = colorForCpu;
exports.randomColor = randomColor;
exports.getColorForSlice = getColorForSlice;
exports.colorForFtrace = colorForFtrace;
exports.getColorForSample = getColorForSample;
const color_convert_1 = require("color-convert");
const hash_1 = require("../base/hash");
const feature_flags_1 = require("../core/feature_flags");
const color_1 = require("../public/color");
const rand_1 = require("../base/rand");
// 128 would provide equal weighting between dark and light text.
// However, we want to prefer light text for stylistic reasons.
// A higher value means color must be brighter before switching to dark text.
const PERCEIVED_BRIGHTNESS_LIMIT = 180;
// This file defines some opinionated colors and provides functions to access
// random but predictable colors based on a seed, as well as standardized ways
// to access colors for core objects such as slices and thread states.
// We have, over the years, accumulated a number of different color palettes
// which are used for different parts of the UI.
// It would be nice to combine these into a single palette in the future, but
// changing colors is difficult especially for slice colors, as folks get used
// to certain slices being certain colors and are resistant to change.
// However we do it, we should make it possible for folks to switch back the a
// previous palette, or define their own.
const USE_CONSISTENT_COLORS = feature_flags_1.featureFlags.register({
    id: 'useConsistentColors',
    name: 'Use common color palette for timeline elements',
    description: 'Use the same color palette for all timeline elements.',
    defaultValue: false,
});
const randColourState = { seed: 0 };
const MD_PALETTE_RAW = [
    new color_1.HSLColor({ h: 4, s: 90, l: 58 }),
    new color_1.HSLColor({ h: 340, s: 82, l: 52 }),
    new color_1.HSLColor({ h: 291, s: 64, l: 42 }),
    new color_1.HSLColor({ h: 262, s: 52, l: 47 }),
    new color_1.HSLColor({ h: 231, s: 48, l: 48 }),
    new color_1.HSLColor({ h: 207, s: 90, l: 54 }),
    new color_1.HSLColor({ h: 199, s: 98, l: 48 }),
    new color_1.HSLColor({ h: 187, s: 100, l: 42 }),
    new color_1.HSLColor({ h: 174, s: 100, l: 29 }),
    new color_1.HSLColor({ h: 122, s: 39, l: 49 }),
    new color_1.HSLColor({ h: 88, s: 50, l: 53 }),
    new color_1.HSLColor({ h: 66, s: 70, l: 54 }),
    new color_1.HSLColor({ h: 45, s: 100, l: 51 }),
    new color_1.HSLColor({ h: 36, s: 100, l: 50 }),
    new color_1.HSLColor({ h: 14, s: 100, l: 57 }),
    new color_1.HSLColor({ h: 16, s: 25, l: 38 }),
    new color_1.HSLColor({ h: 200, s: 18, l: 46 }),
    new color_1.HSLColor({ h: 54, s: 100, l: 62 }),
];
const WHITE_COLOR = new color_1.HSLColor([0, 0, 100]);
const BLACK_COLOR = new color_1.HSLColor([0, 0, 0]);
const GRAY_COLOR = new color_1.HSLColor([0, 0, 90]);
const MD_PALETTE = MD_PALETTE_RAW.map((color) => {
    const base = color.lighten(10, 60).desaturate(20);
    const variant = base.lighten(30, 80).desaturate(20);
    return {
        base,
        variant,
        disabled: GRAY_COLOR,
        textBase: WHITE_COLOR, // White text suits MD colors quite well
        textVariant: WHITE_COLOR,
        textDisabled: WHITE_COLOR, // Low contrast is on purpose
    };
});
// Create a color scheme based on a single color, which defines the variant
// color as a slightly darker and more saturated version of the base color.
function makeColorScheme(base, variant) {
    variant = variant ?? base.darken(15).saturate(15);
    return {
        base,
        variant,
        disabled: GRAY_COLOR,
        textBase: base.perceivedBrightness >= PERCEIVED_BRIGHTNESS_LIMIT
            ? BLACK_COLOR
            : WHITE_COLOR,
        textVariant: variant.perceivedBrightness >= PERCEIVED_BRIGHTNESS_LIMIT
            ? BLACK_COLOR
            : WHITE_COLOR,
        textDisabled: WHITE_COLOR, // Low contrast is on purpose
    };
}
const GRAY = makeColorScheme(new color_1.HSLColor([0, 0, 62]));
const DESAT_RED = makeColorScheme(new color_1.HSLColor([3, 30, 49]));
const DARK_GREEN = makeColorScheme(new color_1.HSLColor([120, 44, 34]));
const LIME_GREEN = makeColorScheme(new color_1.HSLColor([75, 55, 47]));
const TRANSPARENT_WHITE = makeColorScheme(new color_1.HSLColor([0, 1, 97], 0.55));
const ORANGE = makeColorScheme(new color_1.HSLColor([36, 100, 50]));
const INDIGO = makeColorScheme(new color_1.HSLColor([231, 48, 48]));
// A piece of wisdom from a long forgotten blog post: "Don't make
// colors you want to change something normal like grey."
exports.UNEXPECTED_PINK = makeColorScheme(new color_1.HSLColor([330, 100, 70]));
// Selects a predictable color scheme from a palette of material design colors,
// based on a string seed.
function materialColorScheme(seed) {
    const colorIdx = (0, hash_1.hash)(seed, MD_PALETTE.length);
    return MD_PALETTE[colorIdx];
}
const proceduralColorCache = new Map();
// Procedurally generates a predictable color scheme based on a string seed.
function proceduralColorScheme(seed) {
    const colorScheme = proceduralColorCache.get(seed);
    if (colorScheme) {
        return colorScheme;
    }
    else {
        const hue = (0, hash_1.hash)(seed, 360);
        // Saturation 100 would give the most differentiation between colors, but
        // it's garish.
        const saturation = 80;
        // Prefer using HSLuv, not the browser's built-in vanilla HSL handling. This
        // is because this function chooses hue/lightness uniform at random, but HSL
        // is not perceptually uniform.
        // See https://www.boronine.com/2012/03/26/Color-Spaces-for-Human-Beings/.
        const base = new color_1.HSLuvColor({
            h: hue,
            s: saturation,
            l: (0, hash_1.hash)(seed + 'x', 40) + 40,
        });
        const variant = new color_1.HSLuvColor({ h: hue, s: saturation, l: 30 });
        const colorScheme = makeColorScheme(base, variant);
        proceduralColorCache.set(seed, colorScheme);
        return colorScheme;
    }
}
function colorForState(state) {
    if (state === 'Running') {
        return DARK_GREEN;
    }
    else if (state.startsWith('Runnable')) {
        return LIME_GREEN;
    }
    else if (state.includes('Uninterruptible Sleep')) {
        if (state.includes('non-IO')) {
            return DESAT_RED;
        }
        return ORANGE;
    }
    else if (state.includes('Dead')) {
        return GRAY;
    }
    else if (state.includes('Sleeping') || state.includes('Idle')) {
        return TRANSPARENT_WHITE;
    }
    return INDIGO;
}
function colorForTid(tid) {
    return materialColorScheme(tid.toString());
}
function colorForThread(thread) {
    if (thread === undefined) {
        return GRAY;
    }
    const tid = thread.pid ?? thread.tid;
    return colorForTid(tid);
}
function colorForCpu(cpu) {
    if (USE_CONSISTENT_COLORS.get()) {
        return materialColorScheme(cpu.toString()).base;
    }
    else {
        const hue = (128 + 32 * cpu) % 256;
        return new color_1.HSLColor({ h: hue, s: 50, l: 50 });
    }
}
function randomColor() {
    const rand = (0, rand_1.pseudoRand)(randColourState);
    if (USE_CONSISTENT_COLORS.get()) {
        return materialColorScheme(rand.toString()).base.cssString;
    }
    else {
        // 40 different random hues 9 degrees apart.
        const hue = Math.floor(rand * 40) * 9;
        return '#' + color_convert_1.hsl.hex([hue, 90, 30]);
    }
}
function getColorForSlice(sliceName) {
    const name = sliceName.replace(/( )?\d+/g, '');
    if (USE_CONSISTENT_COLORS.get()) {
        return materialColorScheme(name);
    }
    else {
        return proceduralColorScheme(name);
    }
}
function colorForFtrace(name) {
    return materialColorScheme(name);
}
function getColorForSample(callsiteId) {
    if (USE_CONSISTENT_COLORS.get()) {
        return materialColorScheme(String(callsiteId));
    }
    else {
        return proceduralColorScheme(String(callsiteId));
    }
}
//# sourceMappingURL=colorizer.js.map