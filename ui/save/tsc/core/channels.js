"use strict";
// Copyright (C) 2021 The Android Open Source Project
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
exports.DEFAULT_CHANNEL = void 0;
exports.getCurrentChannel = getCurrentChannel;
exports.getNextChannel = getNextChannel;
exports.channelChanged = channelChanged;
exports.setChannel = setChannel;
const raf_scheduler_1 = require("./raf_scheduler");
exports.DEFAULT_CHANNEL = 'stable';
const CHANNEL_KEY = 'perfettoUiChannel';
let currentChannel = undefined;
let nextChannel = undefined;
// This is the channel the UI is currently running. It doesn't change once the
// UI has been loaded.
function getCurrentChannel() {
    if (currentChannel === undefined) {
        currentChannel = localStorage.getItem(CHANNEL_KEY) ?? exports.DEFAULT_CHANNEL;
    }
    return currentChannel;
}
// This is the channel that will be applied on reload.
function getNextChannel() {
    if (nextChannel !== undefined) {
        return nextChannel;
    }
    return getCurrentChannel();
}
function channelChanged() {
    return getCurrentChannel() !== getNextChannel();
}
function setChannel(channel) {
    getCurrentChannel(); // Cache the current channel before mangling next one.
    nextChannel = channel;
    localStorage.setItem(CHANNEL_KEY, channel);
    raf_scheduler_1.raf.scheduleFullRedraw();
}
//# sourceMappingURL=channels.js.map