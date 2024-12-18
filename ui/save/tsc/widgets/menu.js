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
exports.PopupMenu2 = exports.Menu = exports.MenuDivider = exports.MenuItem = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const classnames_1 = require("../base/classnames");
const mithril_utils_1 = require("../base/mithril_utils");
const icon_1 = require("./icon");
const popup_1 = require("./popup");
// An interactive menu element with an icon.
// If this node has children, a nested popup menu will be rendered.
class MenuItem {
    view(vnode) {
        if ((0, mithril_utils_1.hasChildren)(vnode)) {
            return this.renderNested(vnode);
        }
        else {
            return this.renderSingle(vnode);
        }
    }
    renderNested({ attrs, children }) {
        const { rightIcon = 'chevron_right', closePopupOnClick = false, ...rest } = attrs;
        return (0, mithril_1.default)(PopupMenu2, {
            popupPosition: popup_1.PopupPosition.RightStart,
            trigger: (0, mithril_1.default)(MenuItem, {
                rightIcon: rightIcon,
                closePopupOnClick,
                ...rest,
            }),
            showArrow: false,
            createNewGroup: false,
            edgeOffset: 5, // Adjust for popup padding & border.
        }, children);
    }
    renderSingle({ attrs }) {
        const { label, icon, rightIcon, disabled, active, closePopupOnClick = true, className, ...htmlAttrs } = attrs;
        const classes = (0, classnames_1.classNames)(active && 'pf-active', !disabled && closePopupOnClick && popup_1.Popup.DISMISS_POPUP_GROUP_CLASS, className);
        return (0, mithril_1.default)('button.pf-menu-item' + (disabled ? '[disabled]' : ''), {
            ...htmlAttrs,
            className: classes,
        }, icon && (0, mithril_1.default)(icon_1.Icon, { className: 'pf-left-icon', icon }), rightIcon && (0, mithril_1.default)(icon_1.Icon, { className: 'pf-right-icon', icon: rightIcon }), label);
    }
}
exports.MenuItem = MenuItem;
// An element which shows a dividing line between menu items.
class MenuDivider {
    view() {
        return (0, mithril_1.default)('.pf-menu-divider');
    }
}
exports.MenuDivider = MenuDivider;
// A siple container for a menu.
// The menu contents are passed in as children, and are typically MenuItems or
// MenuDividers, but really they can be any Mithril component.
class Menu {
    view({ attrs, children }) {
        return (0, mithril_1.default)('.pf-menu', attrs, children);
    }
}
exports.Menu = Menu;
// A combination of a Popup and a Menu component.
// The menu contents are passed in as children, and are typically MenuItems or
// MenuDividers, but really they can be any Mithril component.
class PopupMenu2 {
    view({ attrs, children }) {
        const { trigger, popupPosition = popup_1.PopupPosition.Bottom, ...popupAttrs } = attrs;
        return (0, mithril_1.default)(popup_1.Popup, {
            trigger,
            position: popupPosition,
            className: 'pf-popup-menu',
            ...popupAttrs,
        }, (0, mithril_1.default)(Menu, children));
    }
}
exports.PopupMenu2 = PopupMenu2;
//# sourceMappingURL=menu.js.map