"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const commands_1 = tslib_1.__importDefault(require("../core_plugins/commands"));
const example_traces_1 = tslib_1.__importDefault(require("../core_plugins/example_traces"));
const flags_page_1 = tslib_1.__importDefault(require("../core_plugins/flags_page"));
const global_groups_1 = tslib_1.__importDefault(require("../core_plugins/global_groups"));
const track_utils_1 = tslib_1.__importDefault(require("../core_plugins/track_utils"));
exports.default = [
    commands_1.default,
    example_traces_1.default,
    flags_page_1.default,
    global_groups_1.default,
    track_utils_1.default,
];
//# sourceMappingURL=all_core_plugins.js.map