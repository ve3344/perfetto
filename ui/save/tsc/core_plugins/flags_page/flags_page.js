"use strict";
// Copyright (C) 2020 The Android Open Source Project
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
exports.FlagsPage = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const channels_1 = require("../../core/channels");
const feature_flags_1 = require("../../core/feature_flags");
const feature_flag_1 = require("../../public/feature_flag");
const raf_scheduler_1 = require("../../core/raf_scheduler");
const router_1 = require("../../core/router");
const RELEASE_PROCESS_URL = 'https://perfetto.dev/docs/visualization/perfetto-ui-release-process';
class SelectWidget {
    view(vnode) {
        const route = router_1.Router.parseUrl(window.location.href);
        const attrs = vnode.attrs;
        const cssClass = route.subpage === `/${attrs.id}` ? '.focused' : '';
        return (0, mithril_1.default)('.flag-widget' + cssClass, { id: attrs.id }, (0, mithril_1.default)('label', attrs.label), (0, mithril_1.default)('select', {
            onchange: (e) => {
                const value = e.target.value;
                attrs.onSelect(value);
                raf_scheduler_1.raf.scheduleFullRedraw();
            },
        }, attrs.options.map((o) => {
            const selected = o.id === attrs.selected;
            return (0, mithril_1.default)('option', { value: o.id, selected }, o.name);
        })), (0, mithril_1.default)('.description', attrs.description));
    }
}
class FlagWidget {
    view(vnode) {
        const flag = vnode.attrs.flag;
        const defaultState = flag.defaultValue ? 'Enabled' : 'Disabled';
        return (0, mithril_1.default)(SelectWidget, {
            label: flag.name,
            id: flag.id,
            description: flag.description,
            options: [
                { id: feature_flag_1.OverrideState.DEFAULT, name: `Default (${defaultState})` },
                { id: feature_flag_1.OverrideState.TRUE, name: 'Enabled' },
                { id: feature_flag_1.OverrideState.FALSE, name: 'Disabled' },
            ],
            selected: flag.overriddenState(),
            onSelect: (value) => {
                switch (value) {
                    case feature_flag_1.OverrideState.TRUE:
                        flag.set(true);
                        break;
                    case feature_flag_1.OverrideState.FALSE:
                        flag.set(false);
                        break;
                    default:
                    case feature_flag_1.OverrideState.DEFAULT:
                        flag.reset();
                        break;
                }
            },
        });
    }
}
class FlagsPage {
    view() {
        const needsReload = (0, channels_1.channelChanged)();
        return (0, mithril_1.default)('.flags-page', (0, mithril_1.default)('.flags-content', (0, mithril_1.default)('h1', 'Feature flags'), needsReload && [
            (0, mithril_1.default)('h2', 'Please reload for your changes to take effect'),
        ], (0, mithril_1.default)(SelectWidget, {
            label: 'Release channel',
            id: 'releaseChannel',
            description: [
                'Which release channel of the UI to use. See ',
                (0, mithril_1.default)('a', {
                    href: RELEASE_PROCESS_URL,
                }, 'Release Process'),
                ' for more information.',
            ],
            options: [
                { id: 'stable', name: 'Stable (default)' },
                { id: 'canary', name: 'Canary' },
                { id: 'autopush', name: 'Autopush' },
            ],
            selected: (0, channels_1.getNextChannel)(),
            onSelect: (id) => (0, channels_1.setChannel)(id),
        }), (0, mithril_1.default)('button', {
            onclick: () => {
                feature_flags_1.featureFlags.resetAll();
                raf_scheduler_1.raf.scheduleFullRedraw();
            },
        }, 'Reset all below'), feature_flags_1.featureFlags.allFlags().map((flag) => (0, mithril_1.default)(FlagWidget, { flag }))));
    }
    oncreate(vnode) {
        const flagId = /[/](\w+)/.exec(vnode.attrs.subpage ?? '')?.slice(1, 2)[0];
        if (flagId) {
            const flag = vnode.dom.querySelector(`#${flagId}`);
            if (flag) {
                flag.scrollIntoView({ block: 'center' });
            }
        }
    }
}
exports.FlagsPage = FlagsPage;
//# sourceMappingURL=flags_page.js.map