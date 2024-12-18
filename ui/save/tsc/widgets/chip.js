"use strict";
// Copyright (C) 2024 The Android Open Source Project
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
exports.ChipBar = exports.Chip = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const classnames_1 = require("../base/classnames");
const common_1 = require("./common");
const icon_1 = require("./icon");
const spinner_1 = require("./spinner");
class Chip {
    view({ attrs }) {
        const { icon, compact, rightIcon, className, iconFilled, intent = common_1.Intent.None, rounded, ...htmlAttrs } = attrs;
        const label = 'label' in attrs ? attrs.label : undefined;
        const classes = (0, classnames_1.classNames)(compact && 'pf-compact', (0, common_1.classForIntent)(intent), icon && !label && 'pf-icon-only', className, rounded && 'pf-rounded');
        return (0, mithril_1.default)('.pf-chip', {
            ...htmlAttrs,
            className: classes,
        }, this.renderIcon(attrs), rightIcon &&
            (0, mithril_1.default)(icon_1.Icon, {
                className: 'pf-right-icon',
                icon: rightIcon,
                filled: iconFilled,
            }), label || '\u200B');
    }
    renderIcon(attrs) {
        const { icon, iconFilled } = attrs;
        const className = 'pf-left-icon';
        if (attrs.loading) {
            return (0, mithril_1.default)(spinner_1.Spinner, { className });
        }
        else if (icon) {
            return (0, mithril_1.default)(icon_1.Icon, { className, icon, filled: iconFilled });
        }
        else {
            return undefined;
        }
    }
}
exports.Chip = Chip;
/**
 * Space chips out with a little gap between each one.
 */
class ChipBar {
    view({ attrs, children }) {
        return (0, mithril_1.default)('.pf-chip-bar', attrs, children);
    }
}
exports.ChipBar = ChipBar;
//# sourceMappingURL=chip.js.map