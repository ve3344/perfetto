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
exports.HomePage = exports.Hints = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const channels_1 = require("../core/channels");
const anchor_1 = require("../widgets/anchor");
const hotkey_glyphs_1 = require("../widgets/hotkey_glyphs");
const assets_1 = require("../base/assets");
class Hints {
    view() {
        return (0, mithril_1.default)('.home-page-hints', (0, mithril_1.default)('.tagline', 'New!'), (0, mithril_1.default)('ul', (0, mithril_1.default)('li', 'New updated ', (0, mithril_1.default)(anchor_1.Anchor, {
            href: 'https://perfetto.dev/docs/visualization/perfetto-ui#tabs-v2',
        }, 'tabs'), ' are extensible and user friendly.'), (0, mithril_1.default)('li', 'Use ', (0, mithril_1.default)(hotkey_glyphs_1.HotkeyGlyphs, { hotkey: 'W' }), (0, mithril_1.default)(hotkey_glyphs_1.HotkeyGlyphs, { hotkey: 'A' }), (0, mithril_1.default)(hotkey_glyphs_1.HotkeyGlyphs, { hotkey: 'S' }), (0, mithril_1.default)(hotkey_glyphs_1.HotkeyGlyphs, { hotkey: 'D' }), ' to navigate the trace.'), (0, mithril_1.default)('li', 'Try the ', (0, mithril_1.default)(anchor_1.Anchor, {
            href: 'https://perfetto.dev/docs/visualization/perfetto-ui#command-palette',
        }, 'command palette,'), ' press ', (0, mithril_1.default)(hotkey_glyphs_1.HotkeyGlyphs, { hotkey: '!Mod+Shift+P' }), '.')));
    }
}
exports.Hints = Hints;
class HomePage {
    view() {
        return (0, mithril_1.default)('.page.home-page', (0, mithril_1.default)('.home-page-center', (0, mithril_1.default)('.home-page-title', (0, mithril_1.default)(`img.logo[src=${(0, assets_1.assetSrc)('assets/logo-3d.png')}]`), 'Perfetto'), (0, mithril_1.default)(Hints), (0, mithril_1.default)('.channel-select', (0, mithril_1.default)('', 'Feeling adventurous? Try our bleeding edge Canary version'), (0, mithril_1.default)('fieldset', mkChan('stable'), mkChan('canary'), (0, mithril_1.default)('.highlight')), (0, mithril_1.default)(`.home-page-reload${(0, channels_1.channelChanged)() ? '.show' : ''}`, 'You need to reload the page for the changes to have effect'))), (0, mithril_1.default)('a.privacy', { href: 'https://policies.google.com/privacy', target: '_blank' }, 'Privacy policy'));
    }
}
exports.HomePage = HomePage;
function mkChan(chan) {
    const checked = (0, channels_1.getNextChannel)() === chan ? '[checked=true]' : '';
    return [
        (0, mithril_1.default)(`input[type=radio][name=chan][id=chan_${chan}]${checked}`, {
            onchange: () => {
                (0, channels_1.setChannel)(chan);
            },
        }),
        (0, mithril_1.default)(`label[for=chan_${chan}]`, chan),
    ];
}
//# sourceMappingURL=home_page.js.map