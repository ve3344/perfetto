"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expandProcessName = expandProcessName;
/**
 * Expand process name for specific system processes
 *
 * @param {string} metricProcessName Name of the processes
 * @returns {string} Either the same or expanded name for abbreviated process names
 */
function expandProcessName(metricProcessName) {
    if (metricProcessName.includes('systemui')) {
        return 'com.android.systemui';
    }
    else if (metricProcessName.includes('launcher')) {
        return 'com.google.android.apps.nexuslauncher';
    }
    else if (metricProcessName.includes('surfaceflinger')) {
        return '/system/bin/surfaceflinger';
    }
    else {
        return metricProcessName;
    }
}
//# sourceMappingURL=metricUtils.js.map