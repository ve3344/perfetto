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
exports.Portal = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
// A portal renders children into a a div outside of the normal hierarchy of the
// parent component, usually in order to stack elements on top of others.
// Useful for creating overlays, dialogs, and popups.
class Portal {
    portalElement;
    containerElement;
    contentComponent;
    constructor({ children }) {
        // Create a temporary component that we can mount in oncreate, and unmount
        // in onremove, but inject the new portal content (children) into it each
        // render cycle. This is initialized here rather than in oncreate to avoid
        // having to make it optional or use assertExists().
        this.contentComponent = { view: () => children };
    }
    view() {
        // Dummy element renders nothing but permits DOM access in lifecycle hooks.
        return (0, mithril_1.default)('span', { style: { display: 'none' } });
    }
    oncreate({ attrs, dom }) {
        const { onContentMount = () => { }, onBeforeContentMount = () => ({}), } = attrs;
        const { container = document.body } = onBeforeContentMount(dom);
        this.containerElement = container;
        this.portalElement = document.createElement('div');
        container.appendChild(this.portalElement);
        this.applyPortalProps(attrs);
        mithril_1.default.mount(this.portalElement, this.contentComponent);
        onContentMount(this.portalElement);
    }
    onbeforeupdate({ children }) {
        // Update the mounted content's view function to return the latest portal
        // content passed in via children, without changing the component itself.
        this.contentComponent.view = () => children;
    }
    onupdate({ attrs }) {
        const { onContentUpdate = () => { } } = attrs;
        if (this.portalElement) {
            this.applyPortalProps(attrs);
            onContentUpdate(this.portalElement);
        }
    }
    applyPortalProps(attrs) {
        if (this.portalElement) {
            this.portalElement.className = attrs.className ?? '';
            Object.assign(this.portalElement.style, attrs.style);
        }
    }
    onremove({ attrs }) {
        const { onContentUnmount = () => { } } = attrs;
        const container = this.containerElement ?? document.body;
        if (this.portalElement) {
            if (container.contains(this.portalElement)) {
                onContentUnmount(this.portalElement);
                // Rendering null ensures previous vnodes are removed properly.
                mithril_1.default.mount(this.portalElement, null);
                container.removeChild(this.portalElement);
            }
        }
    }
}
exports.Portal = Portal;
//# sourceMappingURL=portal.js.map