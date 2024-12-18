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
exports.CookieConsent = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const raf_scheduler_1 = require("./raf_scheduler");
const app_impl_1 = require("./app_impl");
const COOKIE_ACK_KEY = 'cookieAck';
class CookieConsent {
    showCookieConsent = true;
    oninit() {
        this.showCookieConsent = true;
        if (!app_impl_1.AppImpl.instance.analytics.isEnabled() ||
            localStorage.getItem(COOKIE_ACK_KEY) === 'true') {
            this.showCookieConsent = false;
        }
    }
    view() {
        if (!this.showCookieConsent)
            return;
        return (0, mithril_1.default)('.cookie-consent', (0, mithril_1.default)('.cookie-text', `This site uses cookies from Google to deliver its services and to
          analyze traffic.`), (0, mithril_1.default)('.buttons', (0, mithril_1.default)('button', (0, mithril_1.default)('a', {
            href: 'https://policies.google.com/technologies/cookies',
            target: '_blank',
        }, 'More details')), (0, mithril_1.default)('button', {
            onclick: () => {
                this.showCookieConsent = false;
                localStorage.setItem(COOKIE_ACK_KEY, 'true');
                raf_scheduler_1.raf.scheduleFullRedraw();
            },
        }, 'OK')));
    }
}
exports.CookieConsent = CookieConsent;
//# sourceMappingURL=cookie_consent.js.map