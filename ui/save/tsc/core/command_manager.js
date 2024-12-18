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
exports.CommandManagerImpl = void 0;
const fuzzy_1 = require("../base/fuzzy");
const registry_1 = require("../base/registry");
const raf_scheduler_1 = require("./raf_scheduler");
class CommandManagerImpl {
    registry = new registry_1.Registry((cmd) => cmd.id);
    getCommand(commandId) {
        return this.registry.get(commandId);
    }
    hasCommand(commandId) {
        return this.registry.has(commandId);
    }
    get commands() {
        return Array.from(this.registry.values());
    }
    registerCommand(cmd) {
        return this.registry.register(cmd);
    }
    runCommand(id, ...args) {
        const cmd = this.registry.get(id);
        const res = cmd.callback(...args);
        Promise.resolve(res).finally(() => raf_scheduler_1.raf.scheduleFullRedraw('force'));
        return res;
    }
    // Returns a list of commands that match the search term, along with a list
    // of segments which describe which parts of the command name match and
    // which don't.
    fuzzyFilterCommands(searchTerm) {
        const finder = new fuzzy_1.FuzzyFinder(this.commands, ({ name }) => name);
        return finder.find(searchTerm).map((result) => {
            return { segments: result.segments, ...result.item };
        });
    }
}
exports.CommandManagerImpl = CommandManagerImpl;
//# sourceMappingURL=command_manager.js.map