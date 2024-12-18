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
exports.CategoriesCheckboxList = exports.CodeSnippet = exports.Textarea = exports.Dropdown = exports.Slider = exports.Toggle = exports.Probe = void 0;
exports.CompactProbe = CompactProbe;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const clipboard_1 = require("../../base/clipboard");
const logging_1 = require("../../base/logging");
const assets_1 = require("../../base/assets");
const raf_1 = require("../../widgets/raf");
function defaultSort(a, b) {
    return a.localeCompare(b);
}
class DocsChip {
    view({ attrs }) {
        return (0, mithril_1.default)('a.inline-chip', { href: attrs.href, title: 'Open docs in new tab', target: '_blank' }, (0, mithril_1.default)('i.material-icons', 'info'), ' Docs');
    }
}
class Probe {
    view({ attrs, children }) {
        const onToggle = (enabled) => {
            attrs.setEnabled(attrs.recCfg, enabled);
            (0, raf_1.scheduleFullRedraw)();
        };
        const enabled = attrs.isEnabled(attrs.recCfg);
        return (0, mithril_1.default)(`.probe${attrs.compact ? '.compact' : ''}${enabled ? '.enabled' : ''}`, attrs.img &&
            (0, mithril_1.default)('img', {
                src: (0, assets_1.assetSrc)(`assets/${attrs.img}`),
                onclick: () => onToggle(!enabled),
            }), (0, mithril_1.default)('label', (0, mithril_1.default)(`input[type=checkbox]`, {
            checked: enabled,
            oninput: (e) => {
                onToggle(e.target.checked);
            },
        }), (0, mithril_1.default)('span', attrs.title)), attrs.compact
            ? ''
            : (0, mithril_1.default)(`div${attrs.img ? '' : '.extended-desc'}`, (0, mithril_1.default)('div', attrs.descr), (0, mithril_1.default)('.probe-config', children)));
    }
}
exports.Probe = Probe;
function CompactProbe(args) {
    return (0, mithril_1.default)(Probe, {
        recCfg: args.recCfg,
        title: args.title,
        img: null,
        compact: true,
        descr: '',
        isEnabled: args.isEnabled,
        setEnabled: args.setEnabled,
    });
}
class Toggle {
    view({ attrs }) {
        const onToggle = (enabled) => {
            attrs.setEnabled(attrs.recCfg, enabled);
            (0, raf_1.scheduleFullRedraw)();
        };
        const enabled = attrs.isEnabled(attrs.recCfg);
        return (0, mithril_1.default)(`.toggle${enabled ? '.enabled' : ''}${attrs.cssClass ?? ''}`, (0, mithril_1.default)('label', (0, mithril_1.default)(`input[type=checkbox]`, {
            checked: enabled,
            oninput: (e) => {
                onToggle(e.target.checked);
            },
        }), (0, mithril_1.default)('span', attrs.title)), (0, mithril_1.default)('.descr', attrs.descr));
    }
}
exports.Toggle = Toggle;
class Slider {
    onValueChange(attrs, newVal) {
        attrs.set(attrs.recCfg, newVal);
        (0, raf_1.scheduleFullRedraw)();
    }
    onTimeValueChange(attrs, hms) {
        try {
            const date = new Date(`1970-01-01T${hms}.000Z`);
            if (isNaN(date.getTime()))
                return;
            this.onValueChange(attrs, date.getTime());
        }
        catch { }
    }
    onSliderChange(attrs, newIdx) {
        this.onValueChange(attrs, attrs.values[newIdx]);
    }
    view({ attrs }) {
        const id = attrs.title.replace(/[^a-z0-9]/gim, '_').toLowerCase();
        const maxIdx = attrs.values.length - 1;
        const val = attrs.get(attrs.recCfg);
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        let min = attrs.min || 1;
        if (attrs.zeroIsDefault) {
            min = Math.min(0, min);
        }
        const description = attrs.description;
        const disabled = attrs.disabled;
        // Find the index of the closest value in the slider.
        let idx = 0;
        for (; idx < attrs.values.length && attrs.values[idx] < val; idx++) { }
        let spinnerCfg = {};
        if (attrs.isTime) {
            spinnerCfg = {
                type: 'text',
                pattern: '(0[0-9]|1[0-9]|2[0-3])(:[0-5][0-9]){2}', // hh:mm:ss
                value: new Date(val).toISOString().substr(11, 8),
                oninput: (e) => {
                    this.onTimeValueChange(attrs, e.target.value);
                },
            };
        }
        else {
            const isDefault = attrs.zeroIsDefault && val === 0;
            spinnerCfg = {
                type: 'number',
                value: isDefault ? '' : val,
                placeholder: isDefault ? '(default)' : '',
                oninput: (e) => {
                    this.onValueChange(attrs, +e.target.value);
                },
            };
        }
        return (0, mithril_1.default)('.slider' + (attrs.cssClass ?? ''), (0, mithril_1.default)('header', attrs.title), description ? (0, mithril_1.default)('header.descr', attrs.description) : '', attrs.icon !== undefined ? (0, mithril_1.default)('i.material-icons', attrs.icon) : [], (0, mithril_1.default)(`input[id="${id}"][type=range][min=0][max=${maxIdx}][value=${idx}]`, {
            disabled,
            oninput: (e) => {
                this.onSliderChange(attrs, +e.target.value);
            },
        }), (0, mithril_1.default)(`input.spinner[min=${min}][for=${id}]`, spinnerCfg), (0, mithril_1.default)('.unit', attrs.unit));
    }
}
exports.Slider = Slider;
class Dropdown {
    resetScroll(dom) {
        // Chrome seems to override the scroll offset on creationa, b without this,
        // even though we call it after having marked the options as selected.
        setTimeout(() => {
            // Don't reset the scroll position if the element is still focused.
            if (dom !== document.activeElement)
                dom.scrollTop = 0;
        }, 0);
    }
    onChange(attrs, e) {
        const dom = e.target;
        const selKeys = [];
        for (let i = 0; i < dom.selectedOptions.length; i++) {
            const item = (0, logging_1.assertExists)(dom.selectedOptions.item(i));
            selKeys.push(item.value);
        }
        attrs.set(attrs.recCfg, selKeys);
        (0, raf_1.scheduleFullRedraw)();
    }
    view({ attrs }) {
        const options = [];
        const selItems = attrs.get(attrs.recCfg);
        let numSelected = 0;
        const entries = [...attrs.options.entries()];
        const f = attrs.sort === undefined ? defaultSort : attrs.sort;
        entries.sort((a, b) => f(a[1], b[1]));
        for (const [key, label] of entries) {
            const opts = { value: key, selected: false };
            if (selItems.includes(key)) {
                opts.selected = true;
                numSelected++;
            }
            options.push((0, mithril_1.default)('option', opts, label));
        }
        const label = `${attrs.title} ${numSelected ? `(${numSelected})` : ''}`;
        return (0, mithril_1.default)(`select.dropdown${attrs.cssClass ?? ''}[multiple=multiple]`, {
            onblur: (e) => this.resetScroll(e.target),
            onmouseleave: (e) => this.resetScroll(e.target),
            oninput: (e) => this.onChange(attrs, e),
            oncreate: (vnode) => this.resetScroll(vnode.dom),
        }, (0, mithril_1.default)('optgroup', { label }, options));
    }
}
exports.Dropdown = Dropdown;
class Textarea {
    onChange(attrs, dom) {
        attrs.set(attrs.recCfg, dom.value);
        (0, raf_1.scheduleFullRedraw)();
    }
    view({ attrs }) {
        return (0, mithril_1.default)('.textarea-holder', (0, mithril_1.default)('header', attrs.title, attrs.docsLink && [' ', (0, mithril_1.default)(DocsChip, { href: attrs.docsLink })]), (0, mithril_1.default)(`textarea.extra-input${attrs.cssClass ?? ''}`, {
            onchange: (e) => this.onChange(attrs, e.target),
            placeholder: attrs.placeholder,
            value: attrs.get(attrs.recCfg),
        }));
    }
}
exports.Textarea = Textarea;
class CodeSnippet {
    view({ attrs }) {
        return (0, mithril_1.default)('.code-snippet', (0, mithril_1.default)('button', {
            title: 'Copy to clipboard',
            onclick: () => (0, clipboard_1.copyToClipboard)(attrs.text),
        }, (0, mithril_1.default)('i.material-icons', 'assignment')), (0, mithril_1.default)('code', attrs.text));
    }
}
exports.CodeSnippet = CodeSnippet;
class CategoriesCheckboxList {
    updateValue(attrs, value, enabled) {
        const values = attrs.get(attrs.recCfg);
        const index = values.indexOf(value);
        if (enabled && index === -1) {
            values.push(value);
        }
        if (!enabled && index !== -1) {
            values.splice(index, 1);
        }
        (0, raf_1.scheduleFullRedraw)();
    }
    view({ attrs }) {
        const enabled = new Set(attrs.get(attrs.recCfg));
        return (0, mithril_1.default)('.categories-list', (0, mithril_1.default)('h3', attrs.title, (0, mithril_1.default)('button.config-button', {
            onclick: () => {
                attrs.set(attrs.recCfg, Array.from(attrs.categories.keys()));
            },
        }, 'All'), (0, mithril_1.default)('button.config-button', {
            onclick: () => {
                attrs.set(attrs.recCfg, []);
            },
        }, 'None')), (0, mithril_1.default)('ul.checkboxes', Array.from(attrs.categories.entries()).map(([key, value]) => {
            const id = `category-checkbox-${key}`;
            return (0, mithril_1.default)('label', { for: id }, (0, mithril_1.default)('li', (0, mithril_1.default)('input[type=checkbox]', {
                id,
                checked: enabled.has(key),
                onclick: (e) => {
                    const target = e.target;
                    this.updateValue(attrs, key, target.checked);
                },
            }), value));
        })));
    }
}
exports.CategoriesCheckboxList = CategoriesCheckboxList;
//# sourceMappingURL=record_widgets.js.map