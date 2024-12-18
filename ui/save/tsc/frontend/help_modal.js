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
exports.toggleHelp = toggleHelp;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const logging_1 = require("../base/logging");
const app_impl_1 = require("../core/app_impl");
const hotkey_glyphs_1 = require("../widgets/hotkey_glyphs");
const modal_1 = require("../widgets/modal");
const spinner_1 = require("../widgets/spinner");
const keyboard_layout_map_1 = require("../base/keyboard_layout_map");
const pan_and_zoom_handler_1 = require("./viewer_page/pan_and_zoom_handler");
function toggleHelp() {
    app_impl_1.AppImpl.instance.analytics.logEvent('User Actions', 'Show help');
    (0, modal_1.showModal)({
        title: 'Perfetto Help',
        content: () => (0, mithril_1.default)(KeyMappingsHelp),
        buttons: [],
    });
}
function keycap(glyph) {
    return (0, mithril_1.default)('.keycap', glyph);
}
// A fallback keyboard map based on the QWERTY keymap. Converts keyboard event
// codes to their associated glyphs on an English QWERTY keyboard.
class EnglishQwertyKeyboardLayoutMap {
    get(code) {
        // Converts 'KeyX' -> 'x'
        return code.replace(/^Key([A-Z])$/, '$1').toLowerCase();
    }
}
class KeyMappingsHelp {
    keyMap;
    oninit() {
        (0, keyboard_layout_map_1.nativeKeyboardLayoutMap)()
            .then((keyMap) => {
            this.keyMap = keyMap;
            app_impl_1.AppImpl.instance.scheduleFullRedraw('force');
        })
            .catch((e) => {
            if (e instanceof keyboard_layout_map_1.NotSupportedError ||
                String(e).includes('SecurityError')) {
                // Keyboard layout is unavailable. Since showing the keyboard
                // mappings correct for the user's keyboard layout is a nice-to-
                // have, and users with non-QWERTY layouts are usually aware of the
                // fact that the are using non-QWERTY layouts, we resort to showing
                // English QWERTY mappings as a best-effort approach.
                // The alternative would be to show key mappings for all keyboard
                // layouts which is not feasible.
                this.keyMap = new EnglishQwertyKeyboardLayoutMap();
                app_impl_1.AppImpl.instance.scheduleFullRedraw('force');
            }
            else {
                // Something unexpected happened. Either the browser doesn't conform
                // to the keyboard API spec, or the keyboard API spec has changed!
                throw e;
            }
        });
    }
    view() {
        return (0, mithril_1.default)('.help', (0, mithril_1.default)('h2', 'Navigation'), (0, mithril_1.default)('table', (0, mithril_1.default)('tr', (0, mithril_1.default)('td', this.codeToKeycap(pan_and_zoom_handler_1.KeyMapping.KEY_ZOOM_IN), '/', this.codeToKeycap(pan_and_zoom_handler_1.KeyMapping.KEY_ZOOM_OUT)), (0, mithril_1.default)('td', 'Zoom in/out')), (0, mithril_1.default)('tr', (0, mithril_1.default)('td', this.codeToKeycap(pan_and_zoom_handler_1.KeyMapping.KEY_PAN_LEFT), '/', this.codeToKeycap(pan_and_zoom_handler_1.KeyMapping.KEY_PAN_RIGHT)), (0, mithril_1.default)('td', 'Pan left/right'))), (0, mithril_1.default)('h2', 'Mouse Controls'), (0, mithril_1.default)('table', (0, mithril_1.default)('tr', (0, mithril_1.default)('td', 'Click'), (0, mithril_1.default)('td', 'Select event')), (0, mithril_1.default)('tr', (0, mithril_1.default)('td', 'Ctrl + Scroll wheel'), (0, mithril_1.default)('td', 'Zoom in/out')), (0, mithril_1.default)('tr', (0, mithril_1.default)('td', 'Click + Drag'), (0, mithril_1.default)('td', 'Select area')), (0, mithril_1.default)('tr', (0, mithril_1.default)('td', 'Shift + Click + Drag'), (0, mithril_1.default)('td', 'Pan left/right'))), (0, mithril_1.default)('h2', 'Running commands from the viewer page'), (0, mithril_1.default)('table', (0, mithril_1.default)('tr', (0, mithril_1.default)('td', keycap('>'), ' in the (empty) search box'), (0, mithril_1.default)('td', 'Switch to command mode'))), (0, mithril_1.default)('h2', 'Making SQL queries from the viewer page'), (0, mithril_1.default)('table', (0, mithril_1.default)('tr', (0, mithril_1.default)('td', keycap(':'), ' in the (empty) search box'), (0, mithril_1.default)('td', 'Switch to query mode')), (0, mithril_1.default)('tr', (0, mithril_1.default)('td', keycap('Enter')), (0, mithril_1.default)('td', 'Execute query')), (0, mithril_1.default)('tr', (0, mithril_1.default)('td', keycap('Ctrl'), ' + ', keycap('Enter')), (0, mithril_1.default)('td', 'Execute query and pin output ' +
            '(output will not be replaced by regular query input)'))), (0, mithril_1.default)('h2', 'Making SQL queries from the query page'), (0, mithril_1.default)('table', (0, mithril_1.default)('tr', (0, mithril_1.default)('td', keycap('Ctrl'), ' + ', keycap('Enter')), (0, mithril_1.default)('td', 'Execute query')), (0, mithril_1.default)('tr', (0, mithril_1.default)('td', keycap('Ctrl'), ' + ', keycap('Enter'), ' (with selection)'), (0, mithril_1.default)('td', 'Execute selection'))), (0, mithril_1.default)('h2', 'Command Hotkeys'), (0, mithril_1.default)('table', app_impl_1.AppImpl.instance.commands.commands
            .filter(({ defaultHotkey }) => defaultHotkey)
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(({ defaultHotkey, name }) => {
            return (0, mithril_1.default)('tr', (0, mithril_1.default)('td', (0, mithril_1.default)(hotkey_glyphs_1.HotkeyGlyphs, { hotkey: (0, logging_1.assertExists)(defaultHotkey) })), (0, mithril_1.default)('td', name));
        })));
    }
    codeToKeycap(code) {
        if (this.keyMap) {
            return keycap(this.keyMap.get(code));
        }
        else {
            return keycap((0, mithril_1.default)(spinner_1.Spinner));
        }
    }
}
//# sourceMappingURL=help_modal.js.map