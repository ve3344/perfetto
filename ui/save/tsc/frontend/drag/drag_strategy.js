"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DragStrategy = void 0;
const high_precision_time_span_1 = require("../../base/high_precision_time_span");
class DragStrategy {
    map;
    updateVizTime;
    constructor(map, updateVizTime) {
        this.map = map;
        this.updateVizTime = updateVizTime;
    }
    updateGlobals(tStart, tEnd) {
        const vizTime = new high_precision_time_span_1.HighPrecisionTimeSpan(tStart, tEnd.sub(tStart).toNumber());
        this.updateVizTime(vizTime);
    }
}
exports.DragStrategy = DragStrategy;
//# sourceMappingURL=drag_strategy.js.map