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
exports.HSLuvColor = exports.HSLColor = void 0;
exports.hslToRgb = hslToRgb;
exports.hexToRgb = hexToRgb;
exports.rgbToHsl = rgbToHsl;
exports.colorCompare = colorCompare;
const hsluv_1 = require("hsluv");
const math_utils_1 = require("../base/math_utils");
// This file contains a library for working with colors in various color spaces
// and formats.
const LIGHTNESS_MIN = 0;
const LIGHTNESS_MAX = 100;
const SATURATION_MIN = 0;
const SATURATION_MAX = 100;
// Common base class for HSL colors. Avoids code duplication.
class HSLColorBase {
    hsl;
    alpha;
    // Values are in the range:
    // Hue:        0-360
    // Saturation: 0-100
    // Lightness:  0-100
    // Alpha:      0-1
    constructor(init, alpha) {
        if (Array.isArray(init)) {
            this.hsl = init;
        }
        else if (typeof init === 'string') {
            const rgb = hexToRgb(init);
            this.hsl = rgbToHsl(rgb);
        }
        else {
            this.hsl = [init.h, init.s, init.l];
        }
        this.alpha = alpha;
    }
    lighten(amount, max = LIGHTNESS_MAX) {
        const [h, s, l] = this.hsl;
        const newLightness = (0, math_utils_1.clamp)(l + amount, LIGHTNESS_MIN, max);
        return this.create([h, s, newLightness], this.alpha);
    }
    darken(amount, min = LIGHTNESS_MIN) {
        const [h, s, l] = this.hsl;
        const newLightness = (0, math_utils_1.clamp)(l - amount, min, LIGHTNESS_MAX);
        return this.create([h, s, newLightness], this.alpha);
    }
    saturate(amount, max = SATURATION_MAX) {
        const [h, s, l] = this.hsl;
        const newSaturation = (0, math_utils_1.clamp)(s + amount, SATURATION_MIN, max);
        return this.create([h, newSaturation, l], this.alpha);
    }
    desaturate(amount, min = SATURATION_MIN) {
        const [h, s, l] = this.hsl;
        const newSaturation = (0, math_utils_1.clamp)(s - amount, min, SATURATION_MAX);
        return this.create([h, newSaturation, l], this.alpha);
    }
    setHSL(hsl) {
        const [h, s, l] = this.hsl;
        return this.create({ h, s, l, ...hsl }, this.alpha);
    }
    setAlpha(alpha) {
        return this.create(this.hsl, alpha);
    }
}
// Describes a color defined in standard HSL color space.
class HSLColor extends HSLColorBase {
    cssString;
    perceivedBrightness;
    // Values are in the range:
    // Hue:        0-360
    // Saturation: 0-100
    // Lightness:  0-100
    // Alpha:      0-1
    constructor(hsl, alpha) {
        super(hsl, alpha);
        const [r, g, b] = hslToRgb(...this.hsl);
        this.perceivedBrightness = perceivedBrightness(r, g, b);
        if (this.alpha === undefined) {
            this.cssString = `rgb(${r} ${g} ${b})`;
        }
        else {
            this.cssString = `rgb(${r} ${g} ${b} / ${this.alpha})`;
        }
    }
    create(values, alpha) {
        return new HSLColor(values, alpha);
    }
}
exports.HSLColor = HSLColor;
// Describes a color defined in HSLuv color space.
// See: https://www.hsluv.org/
class HSLuvColor extends HSLColorBase {
    cssString;
    perceivedBrightness;
    constructor(hsl, alpha) {
        super(hsl, alpha);
        const rgb = (0, hsluv_1.hsluvToRgb)(this.hsl);
        const r = Math.floor(rgb[0] * 255);
        const g = Math.floor(rgb[1] * 255);
        const b = Math.floor(rgb[2] * 255);
        this.perceivedBrightness = perceivedBrightness(r, g, b);
        if (this.alpha === undefined) {
            this.cssString = `rgb(${r} ${g} ${b})`;
        }
        else {
            this.cssString = `rgb(${r} ${g} ${b} / ${this.alpha})`;
        }
    }
    create(raw, alpha) {
        return new HSLuvColor(raw, alpha);
    }
}
exports.HSLuvColor = HSLuvColor;
// Hue: 0-360
// Saturation: 0-100
// Lightness: 0-100
// RGB: 0-255
function hslToRgb(h, s, l) {
    h = h;
    s = s / SATURATION_MAX;
    l = l / LIGHTNESS_MAX;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let [r, g, b] = [0, 0, 0];
    if (0 <= h && h < 60) {
        [r, g, b] = [c, x, 0];
    }
    else if (60 <= h && h < 120) {
        [r, g, b] = [x, c, 0];
    }
    else if (120 <= h && h < 180) {
        [r, g, b] = [0, c, x];
    }
    else if (180 <= h && h < 240) {
        [r, g, b] = [0, x, c];
    }
    else if (240 <= h && h < 300) {
        [r, g, b] = [x, 0, c];
    }
    else if (300 <= h && h < 360) {
        [r, g, b] = [c, 0, x];
    }
    // Convert to 0-255 range
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    return [r, g, b];
}
function hexToRgb(hex) {
    // Convert hex to RGB first
    let r = 0;
    let g = 0;
    let b = 0;
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    }
    else if (hex.length === 7) {
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
    }
    return [r, g, b];
}
function rgbToHsl(rgb) {
    let [r, g, b] = rgb;
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = (max + min) / 2;
    let s = (max + min) / 2;
    const l = (max + min) / 2;
    if (max === min) {
        h = s = 0; // achromatic
    }
    else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }
    return [h * 360, s * 100, l * 100];
}
// Return the perceived brightness of a color using a weighted average of the
// r, g and b channels based on human perception.
function perceivedBrightness(r, g, b) {
    // YIQ calculation from https://24ways.org/2010/calculating-color-contrast
    return (r * 299 + g * 587 + b * 114) / 1000;
}
// Comparison function used for sorting colors.
function colorCompare(a, b) {
    return a.cssString.localeCompare(b.cssString);
}
//# sourceMappingURL=color.js.map