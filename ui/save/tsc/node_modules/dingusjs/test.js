// Copyright (C) 2018 The Android Open Source Project
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const o = require('ospec');
const { dingus } = require('dingusjs');

o('it reports no calls initially', () => {
  const d = dingus();
  o(d.calls).deepEquals([]);
});

o('it reports a call with no arguments', () => {
  const d = dingus();
  const result = d();
  o(d.calls).deepEquals([['()', [], result]]);
});

o('it reports a call with arguments', () => {
  const d = dingus();
  const result = d('hello', 'world');
  o(d.calls).deepEquals([['()', ['hello', 'world'], result]]);
});

o('it reports calls in order', () => {
  const d = dingus();
  const one = d(1);
  const two = d(2);
  o(d.calls).deepEquals([
    ['()', [1], one],
    ['()', [2], two],
  ]);
});

o('it always returns the same thing when called', () => {
  const d = dingus();
  o(d(1)).equals(d(2));
});

o('it returns a dingus when called', () => {
  const d1 = dingus();
  const d2 = d1();
  const d3 = d2();
  o(d1.calls).deepEquals([['()', [], d2]]);
  o(d2.calls).deepEquals([['()', [], d3]]);
});

o('it returns a dingus on property access', () => {
  const parent = dingus();
  const child = parent.child;
  const result = child();
  o(parent.calls).deepEquals([['child()', [], result]]);
  o(child.calls).deepEquals([['()', [], result]]);
});

o('it gets a good name by default', () => {
  o('' + dingus()).equals('<Dingus()>');
});

o('it can be given a name', () => {
  o('' + dingus('foo')).equals('<Dingus(foo)>');
  o('' + dingus('bar')).equals('<Dingus(bar)>');
});

o('it gives children useful names', () => {
  o('' + dingus('foo')().bar()).equals('<Dingus(foo().bar())>');
});


