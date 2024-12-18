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
exports.Modal = void 0;
exports.maybeRenderFullscreenModalDialog = maybeRenderFullscreenModalDialog;
exports.showModal = showModal;
exports.redrawModal = redrawModal;
exports.closeModal = closeModal;
exports.getCurrentModalKey = getCurrentModalKey;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const deferred_1 = require("../base/deferred");
const icon_1 = require("./icon");
const raf_1 = require("./raf");
// Usually users don't need to care about this class, as this is instantiated
// by showModal. The only case when users should depend on this is when they
// want to nest a modal dialog in a <div> they control (i.e. when the modal
// is scoped to a mithril component, not fullscreen).
class Modal {
    onbeforeremove(vnode) {
        const removePromise = (0, deferred_1.defer)();
        vnode.dom.addEventListener('animationend', () => {
            (0, raf_1.scheduleFullRedraw)('force');
            removePromise.resolve();
        });
        vnode.dom.classList.add('modal-fadeout');
        // Retuning `removePromise` will cause Mithril to defer the actual component
        // removal until the fade-out animation is done. onremove() will be invoked
        // after this.
        return removePromise;
    }
    onremove(vnode) {
        if (vnode.attrs.onClose !== undefined) {
            // The onClose here is the promise wrapper created by showModal(), which
            // in turn will: (1) call the user's original attrs.onClose; (2) resolve
            // the promise returned by showModal().
            vnode.attrs.onClose();
        }
    }
    oncreate(vnode) {
        if (vnode.dom instanceof HTMLElement) {
            // Focus the newly created dialog, so that we react to Escape keydown
            // even if the user has not clicked yet on any element.
            // If there is a primary button, focus that, so Enter does the default
            // action. If not just focus the whole dialog.
            const primaryBtn = vnode.dom.querySelector('.modal-btn-primary');
            if (primaryBtn) {
                primaryBtn.focus();
            }
            else {
                vnode.dom.focus();
            }
            // If the modal dialog is instantiated in a tall scrollable container,
            // make sure to scroll it into the view.
            vnode.dom.scrollIntoView({ block: 'center' });
        }
    }
    view(vnode) {
        const attrs = vnode.attrs;
        const buttons = [];
        for (const button of attrs.buttons || []) {
            buttons.push((0, mithril_1.default)('button.modal-btn', {
                class: button.primary ? 'modal-btn-primary' : '',
                id: button.id,
                onclick: () => {
                    closeModal(attrs.key);
                    if (button.action !== undefined)
                        button.action();
                },
            }, button.text));
        }
        const aria = '[aria-labelledby=mm-title][aria-model][role=dialog]';
        const align = attrs.vAlign === 'TOP' ? '.modal-dialog-valign-top' : '';
        return (0, mithril_1.default)('.modal-backdrop', {
            onclick: this.onBackdropClick.bind(this, attrs),
            onkeyup: this.onBackdropKeyupdown.bind(this, attrs),
            onkeydown: this.onBackdropKeyupdown.bind(this, attrs),
            tabIndex: 0,
        }, (0, mithril_1.default)(`.modal-dialog${align}${aria}`, (0, mithril_1.default)('header', (0, mithril_1.default)('h2', { id: 'mm-title' }, attrs.title), (0, mithril_1.default)('button[aria-label=Close Modal]', { onclick: () => closeModal(attrs.key) }, (0, mithril_1.default)(icon_1.Icon, { icon: 'close' }))), (0, mithril_1.default)('main', vnode.children), buttons.length > 0 ? (0, mithril_1.default)('footer', buttons) : null));
    }
    onBackdropClick(attrs, e) {
        e.stopPropagation();
        // Only react when clicking on the backdrop. Don't close if the user clicks
        // on the dialog itself.
        const t = e.target;
        if (t instanceof Element && t.classList.contains('modal-backdrop')) {
            closeModal(attrs.key);
        }
    }
    onBackdropKeyupdown(attrs, e) {
        e.stopPropagation();
        if (e.key === 'Escape' && e.type !== 'keyup') {
            closeModal(attrs.key);
        }
    }
}
exports.Modal = Modal;
// Set by showModal().
let currentModal = undefined;
let generationCounter = 0;
// This should be called only by app.ts and nothing else.
// This generates the modal dialog at the root of the DOM, so it can overlay
// on top of everything else.
function maybeRenderFullscreenModalDialog() {
    // We use the generation counter as key to distinguish between: (1) two render
    // passes for the same dialog vs (2) rendering a new dialog that has been
    // created invoking showModal() while another modal dialog was already being
    // shown.
    if (currentModal === undefined)
        return [];
    let children;
    if (currentModal.content === undefined) {
        children = null;
    }
    else if (typeof currentModal.content === 'function') {
        children = currentModal.content();
    }
    else {
        children = currentModal.content;
    }
    return [(0, mithril_1.default)(Modal, currentModal, children)];
}
// Shows a full-screen modal dialog.
async function showModal(userAttrs) {
    const returnedClosePromise = (0, deferred_1.defer)();
    const userOnClose = userAttrs.onClose ?? (() => { });
    // If the user doesn't specify a key (to match the closeModal), generate a
    // random key to distinguish two showModal({key:undefined}) calls.
    const key = userAttrs.key ?? `${++generationCounter}`;
    const attrs = {
        ...userAttrs,
        key,
        onClose: () => {
            userOnClose();
            returnedClosePromise.resolve();
        },
    };
    currentModal = attrs;
    redrawModal();
    return returnedClosePromise;
}
// Technically we don't need to redraw the whole app, but it's the more
// pragmatic option. This is exposed to keep the plugin code more clear, so it's
// evident why a redraw is requested.
function redrawModal() {
    if (currentModal !== undefined) {
        (0, raf_1.scheduleFullRedraw)('force');
    }
}
// Closes the full-screen modal dialog (if any).
// `key` is optional: if provided it will close the modal dialog only if the key
// matches. This is to avoid accidentally closing another dialog that popped
// in the meanwhile. If undefined, it closes whatever modal dialog is currently
// open (if any).
function closeModal(key) {
    if (currentModal === undefined ||
        (key !== undefined && currentModal.key !== key)) {
        // Somebody else closed the modal dialog already, or opened a new one with
        // a different key.
        return;
    }
    currentModal = undefined;
    (0, raf_1.scheduleFullRedraw)('force');
}
function getCurrentModalKey() {
    return currentModal?.key;
}
//# sourceMappingURL=modal.js.map