"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BorderDragStrategy = void 0;
const drag_strategy_1 = require("./drag_strategy");
class BorderDragStrategy extends drag_strategy_1.DragStrategy {
    pixelBounds;
    moveStart = false;
    constructor(map, pixelBounds, updateVizTime) {
        super(map, updateVizTime);
        this.pixelBounds = pixelBounds;
    }
    onDrag(x) {
        const moveStartPx = this.moveStart ? x : this.pixelBounds[0];
        const moveEndPx = !this.moveStart ? x : this.pixelBounds[1];
        const tStart = this.map.pxToHpTime(Math.min(moveStartPx, moveEndPx));
        const tEnd = this.map.pxToHpTime(Math.max(moveStartPx, moveEndPx));
        if (moveStartPx > moveEndPx) {
            this.moveStart = !this.moveStart;
        }
        super.updateGlobals(tStart, tEnd);
        this.pixelBounds = [this.map.hpTimeToPx(tStart), this.map.hpTimeToPx(tEnd)];
    }
    onDragStart(x) {
        this.moveStart =
            Math.abs(x - this.pixelBounds[0]) < Math.abs(x - this.pixelBounds[1]);
    }
}
exports.BorderDragStrategy = BorderDragStrategy;
//# sourceMappingURL=border_drag_strategy.js.map