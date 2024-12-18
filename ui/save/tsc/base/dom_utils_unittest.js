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
const dom_utils_1 = require("./dom_utils");
describe('isOrContains', () => {
    const parent = document.createElement('div');
    const child = document.createElement('div');
    parent.appendChild(child);
    it('finds child in parent', () => {
        expect((0, dom_utils_1.isOrContains)(parent, child)).toBeTruthy();
    });
    it('finds child in child', () => {
        expect((0, dom_utils_1.isOrContains)(child, child)).toBeTruthy();
    });
    it('does not find parent in child', () => {
        expect((0, dom_utils_1.isOrContains)(child, parent)).toBeFalsy();
    });
});
describe('findRef', () => {
    const parent = document.createElement('div');
    const fooChild = document.createElement('div');
    fooChild.setAttribute('ref', 'foo');
    parent.appendChild(fooChild);
    const barChild = document.createElement('div');
    barChild.setAttribute('ref', 'bar');
    parent.appendChild(barChild);
    it('should find refs in parent divs', () => {
        expect((0, dom_utils_1.findRef)(parent, 'foo')).toEqual(fooChild);
        expect((0, dom_utils_1.findRef)(parent, 'bar')).toEqual(barChild);
    });
    it('should find refs in self divs', () => {
        expect((0, dom_utils_1.findRef)(fooChild, 'foo')).toEqual(fooChild);
        expect((0, dom_utils_1.findRef)(barChild, 'bar')).toEqual(barChild);
    });
    it('should fail to find ref in unrelated divs', () => {
        const unrelated = document.createElement('div');
        expect((0, dom_utils_1.findRef)(unrelated, 'foo')).toBeNull();
        expect((0, dom_utils_1.findRef)(fooChild, 'bar')).toBeNull();
        expect((0, dom_utils_1.findRef)(barChild, 'foo')).toBeNull();
    });
});
describe('toHTMLElement', () => {
    it('should convert a div to an HTMLElement', () => {
        const divElement = document.createElement('div');
        expect((0, dom_utils_1.toHTMLElement)(divElement)).toEqual(divElement);
    });
    it('should fail to convert an svg element to an HTMLElement', () => {
        const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        expect(() => (0, dom_utils_1.toHTMLElement)(svgElement)).toThrow(Error);
    });
});
describe('elementIsEditable', () => {
    test('text input', () => {
        const el = document.createElement('input');
        el.setAttribute('type', 'text');
        expect((0, dom_utils_1.elementIsEditable)(el)).toBeTruthy();
    });
    test('radio input', () => {
        const el = document.createElement('input');
        el.setAttribute('type', 'radio');
        expect((0, dom_utils_1.elementIsEditable)(el)).toBeFalsy();
    });
    test('checkbox input', () => {
        const el = document.createElement('input');
        el.setAttribute('type', 'checkbox');
        expect((0, dom_utils_1.elementIsEditable)(el)).toBeFalsy();
    });
    test('button input', () => {
        const el = document.createElement('input');
        el.setAttribute('type', 'button');
        expect((0, dom_utils_1.elementIsEditable)(el)).toBeFalsy();
    });
    test('div', () => {
        const el = document.createElement('div');
        expect((0, dom_utils_1.elementIsEditable)(el)).toBeFalsy();
    });
    test('textarea', () => {
        const el = document.createElement('textarea');
        expect((0, dom_utils_1.elementIsEditable)(el)).toBeTruthy();
    });
    test('nested', () => {
        const el = document.createElement('textarea');
        const nested = document.createElement('div');
        el.appendChild(nested);
        expect((0, dom_utils_1.elementIsEditable)(nested)).toBeTruthy();
    });
});
describe('bindEventListener', () => {
    let element;
    let handler;
    beforeEach(() => {
        element = document.createElement('div');
        handler = jest.fn();
    });
    test('adds the event listener and triggers the handler', () => {
        const disposable = (0, dom_utils_1.bindEventListener)(element, 'click', handler);
        // Simulate a click event
        const event = new Event('click');
        element.dispatchEvent(event);
        // Ensure the handler was called
        expect(handler).toHaveBeenCalledWith(event);
        // Dispose of the event listener
        disposable[Symbol.dispose]();
        // Reset the mock and dispatch the event again
        handler.mockReset();
        element.dispatchEvent(event);
        // Ensure the handler was not called after disposing
        expect(handler).not.toHaveBeenCalled();
    });
    test('does not throw when disposing multiple times', () => {
        const disposable = (0, dom_utils_1.bindEventListener)(element, 'click', handler);
        expect(() => {
            disposable[Symbol.dispose]();
            disposable[Symbol.dispose]();
        }).not.toThrow();
    });
});
//# sourceMappingURL=dom_utils_unittest.js.map