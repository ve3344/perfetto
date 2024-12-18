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
exports.parseHotkey = parseHotkey;
exports.formatHotkey = formatHotkey;
exports.checkHotkey = checkHotkey;
exports.getPlatform = getPlatform;
exports.hasModKey = hasModKey;
exports.modKey = modKey;
// This module provides hotkey detection using type-safe human-readable strings.
//
// The basic premise is this: Let's say you have a KeyboardEvent |event|, and
// you wanted to check whether it contains the hotkey 'Ctrl+O', you can execute
// the following function:
//
//   checkHotkey('Shift+O', event);
//
// ...which will evaluate to true if 'Shift+O' is discovered in the event.
//
// This will only trigger when O is pressed while the Shift key is held, not O
// on it's own, and not if other modifiers such as Alt or Ctrl were also held.
//
// Modifiers include 'Shift', 'Ctrl', 'Alt', and 'Mod':
// - 'Shift' and 'Ctrl' are fairly self explanatory.
// - 'Alt' is 'option' on Macs.
// - 'Mod' is a special modifier which means 'Ctrl' on PC and 'Cmd' on Mac.
// Modifiers may be combined in various ways - check the |Modifier| type.
//
// By default hotkeys will not register when the event target is inside an
// editable element, such as <textarea> and some <input>s.
// Prefixing a hotkey with a bang '!' relaxes is requirement, meaning the hotkey
// will register inside editable fields.
// E.g. '!Mod+Shift+P' will register when pressed when a text box has focus but
// 'Mod+Shift+P' (no bang) will not.
// Warning: Be careful using this with single key hotkeys, e.g. '!P' is usually
// never what you want!
//
// Some single-key hotkeys like '?' and '!' normally cannot be activated in
// without also pressing shift key, so the shift requirement is relaxed for
// these keys.
const dom_utils_1 = require("./dom_utils");
// The following list of keys cannot be pressed wither with or without the
// presence of the Shift modifier on most keyboard layouts. Thus we should
// ignore shift in these cases.
const shiftExceptions = [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '/',
    '?',
    '!',
    '[',
    ']',
];
const macModifierStrings = new Map([
    ['', ''],
    ['Mod+', '⌘'],
    ['Shift+', '⇧'],
    ['Ctrl+', '⌃'],
    ['Alt+', '⌥'],
    ['Mod+Shift+', '⌘⇧'],
    ['Mod+Alt+', '⌘⌥'],
    ['Mod+Shift+Alt+', '⌘⇧⌥'],
    ['Ctrl+Shift+', '⌃⇧'],
    ['Ctrl+Alt', '⌃⌥'],
    ['Ctrl+Shift+Alt', '⌃⇧⌥'],
]);
const pcModifierStrings = new Map([
    ['', ''],
    ['Mod+', 'Ctrl+'],
    ['Mod+Shift+', 'Ctrl+Shift+'],
    ['Mod+Alt+', 'Ctrl+Alt+'],
    ['Mod+Shift+Alt+', 'Ctrl+Shift+Alt+'],
]);
// Deconstruct a hotkey from its string representation into its constituent
// parts.
function parseHotkey(hotkey) {
    const regex = /^(!?)((?:Mod\+|Shift\+|Alt\+|Ctrl\+)*)(.*)$/;
    const result = hotkey.match(regex);
    if (!result) {
        return undefined;
    }
    return {
        allowInEditable: result[1] === '!',
        modifier: result[2],
        key: result[3],
    };
}
// Print the hotkey in a human readable format.
function formatHotkey(hotkey, spoof) {
    const parsed = parseHotkey(hotkey);
    return parsed && formatHotkeyParts(parsed, spoof);
}
function formatHotkeyParts({ modifier, key }, spoof) {
    return `${formatModifier(modifier, spoof)}${key}`;
}
function formatModifier(modifier, spoof) {
    const platform = spoof || getPlatform();
    const strings = platform === 'Mac' ? macModifierStrings : pcModifierStrings;
    return strings.get(modifier) ?? modifier;
}
// Check whether |hotkey| is present in the keyboard event |event|.
function checkHotkey(hotkey, event, spoofPlatform) {
    const result = parseHotkey(hotkey);
    if (!result) {
        return false;
    }
    const { key, allowInEditable } = result;
    const { target = null } = event;
    const inEditable = (0, dom_utils_1.elementIsEditable)(target);
    if (inEditable && !allowInEditable) {
        return false;
    }
    return compareKeys(event, key) && checkMods(event, result, spoofPlatform);
}
// Return true if |key| matches the event's key.
function compareKeys(e, key) {
    return e.key.toLowerCase() === key.toLowerCase();
}
// Return true if modifiers specified in |mods| match those in the event.
function checkMods(event, hotkey, spoofPlatform) {
    const platform = spoofPlatform ?? getPlatform();
    const { key, modifier } = hotkey;
    const { ctrlKey = false, altKey = false, shiftKey = false, metaKey = false, } = event;
    const wantShift = modifier.includes('Shift');
    const wantAlt = modifier.includes('Alt');
    const wantCtrl = platform === 'Mac'
        ? modifier.includes('Ctrl')
        : modifier.includes('Ctrl') || modifier.includes('Mod');
    const wantMeta = platform === 'Mac' && modifier.includes('Mod');
    // For certain keys we relax the shift requirement, as they usually cannot be
    // pressed without the shift key on English keyboards.
    const shiftOk = shiftExceptions.includes(key) || shiftKey === wantShift;
    return (metaKey === wantMeta &&
        Boolean(shiftOk) &&
        altKey === wantAlt &&
        ctrlKey === wantCtrl);
}
// Get the current platform (PC or Mac).
function getPlatform() {
    return window.navigator.platform.indexOf('Mac') !== -1 ? 'Mac' : 'PC';
}
// Returns a cross-platform check for whether the event has "Mod" key pressed
// (e.g. as a part of Mod-Click UX pattern).
// On Mac, Mod-click is actually Command-click and on PC it's Control-click,
// so this function handles this for all platforms.
function hasModKey(event) {
    if (getPlatform() === 'Mac') {
        return event.metaKey;
    }
    else {
        return event.ctrlKey;
    }
}
function modKey() {
    if (getPlatform() === 'Mac') {
        return { metaKey: true };
    }
    else {
        return { ctrlKey: true };
    }
}
//# sourceMappingURL=hotkeys.js.map