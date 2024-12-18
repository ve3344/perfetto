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
exports.MockAdbStream = exports.MockAdb = void 0;
class MockAdb {
    connect(_) {
        return Promise.resolve();
    }
    disconnect() {
        return Promise.resolve();
    }
    shell(_) {
        return Promise.resolve(new MockAdbStream());
    }
    shellOutputAsString(_) {
        return Promise.resolve('');
    }
    socket(_) {
        return Promise.resolve(new MockAdbStream());
    }
}
exports.MockAdb = MockAdb;
class MockAdbStream {
    write(_) {
        return Promise.resolve();
    }
    onMessage = (_) => { };
    close() { }
    setClosed() { }
    onConnect = () => { };
    onClose = () => { };
    onData = (_) => { };
}
exports.MockAdbStream = MockAdbStream;
//# sourceMappingURL=adb_interfaces.js.map