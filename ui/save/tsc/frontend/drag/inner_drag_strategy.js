"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InnerDragStrategy = void 0;
const drag_strategy_1 = require("./drag_strategy");
class InnerDragStrategy extends drag_strategy_1.DragStrategy {
    pixelBounds;
    dragStartPx = 0;
    constructor(timeScale, pixelBounds, updateVizTime) {
        super(timeScale, updateVizTime);
        this.pixelBounds = pixelBounds;
    }
    onDrag(x) {
        const move = x - this.dragStartPx;
        const tStart = this.map.pxToHpTime(this.pixelBounds[0] + move);
        const tEnd = this.map.pxToHpTime(this.pixelBounds[1] + move);
        super.updateGlobals(tStart, tEnd);
    }
    onDragStart(x) {
        this.dragStartPx = x;
    }
}
exports.InnerDragStrategy = InnerDragStrategy;
//# sourceMappingURL=inner_drag_strategy.js.map