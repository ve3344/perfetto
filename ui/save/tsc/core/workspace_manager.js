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
exports.WorkspaceManagerImpl = void 0;
const logging_1 = require("../base/logging");
const workspace_1 = require("../public/workspace");
const raf_scheduler_1 = require("./raf_scheduler");
const DEFAULT_WORKSPACE_NAME = 'Default Workspace';
class WorkspaceManagerImpl {
    _workspaces = [];
    _currentWorkspace;
    constructor() {
        // TS compiler cannot see that we are indirectly initializing
        // _currentWorkspace via resetWorkspaces(), hence the re-assignment.
        this._currentWorkspace = this.createEmptyWorkspace(DEFAULT_WORKSPACE_NAME);
    }
    createEmptyWorkspace(title) {
        const workspace = new workspace_1.Workspace();
        workspace.title = title;
        workspace.onchange = () => raf_scheduler_1.raf.scheduleFullRedraw();
        this._workspaces.push(workspace);
        return workspace;
    }
    switchWorkspace(workspace) {
        // If this fails the workspace doesn't come from createEmptyWorkspace().
        (0, logging_1.assertTrue)(this._workspaces.includes(workspace));
        this._currentWorkspace = workspace;
    }
    get all() {
        return this._workspaces;
    }
    get currentWorkspace() {
        return this._currentWorkspace;
    }
}
exports.WorkspaceManagerImpl = WorkspaceManagerImpl;
//# sourceMappingURL=workspace_manager.js.map