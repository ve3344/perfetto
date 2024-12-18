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
exports.drawBezierArrow = drawBezierArrow;
const geom_1 = require("../geom");
const logging_1 = require("../logging");
/**
 * Renders an curved arrow using a bezier curve.
 *
 * This arrow is comprised of a line and the arrow caps are filled shapes, so
 * the arrow's colour and width will be dictated by the current canvas
 * strokeStyle, lineWidth, and fillStyle, so adjust these accordingly before
 * calling this function.
 *
 * @param ctx - The canvas to draw on.
 * @param start - Start point of the arrow.
 * @param end - End point of the arrow.
 * @param controlPointOffset - The distance in pixels of the control points from
 * the start and end points, in the direction of the start and end orientation
 * values above.
 * @param startStyle - The style of the start of the arrow.
 * @param endStyle - The style of the end of the arrow.
 */
function drawBezierArrow(ctx, start, end, controlPointOffset = 30, startStyle = {
    shape: 'none',
    orientation: 'auto',
}, endStyle = {
    shape: 'none',
    orientation: 'auto',
}) {
    const startOri = getOri(start, end, startStyle.orientation);
    const endOri = getOri(end, start, endStyle.orientation);
    const startRetreat = drawArrowEnd(ctx, start, startOri, startStyle);
    const endRetreat = drawArrowEnd(ctx, end, endOri, endStyle);
    const startRetreatVec = orientationToUnitVector(startOri).scale(startRetreat);
    const endRetreatVec = orientationToUnitVector(endOri).scale(endRetreat);
    const startVec = new geom_1.Vector2D(start).add(startRetreatVec);
    const endVec = new geom_1.Vector2D(end).add(endRetreatVec);
    const startOffset = orientationToUnitVector(startOri).scale(controlPointOffset);
    const endOffset = orientationToUnitVector(endOri).scale(controlPointOffset);
    const cp1 = startVec.add(startOffset);
    const cp2 = endVec.add(endOffset);
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);
    ctx.stroke();
}
function getOri(pos, other, ori) {
    switch (ori) {
        case 'auto_vertical':
            return other.y > pos.y ? 'south' : 'north';
        case 'auto_horizontal':
            return other.x > pos.x ? 'east' : 'west';
        case 'auto':
            const verticalDelta = Math.abs(other.y - pos.y);
            const horizontalDelta = Math.abs(other.x - pos.x);
            if (verticalDelta > horizontalDelta) {
                return other.y > pos.y ? 'south' : 'north';
            }
            else {
                return other.x > pos.x ? 'east' : 'west';
            }
        default:
            return ori;
    }
}
function drawArrowEnd(ctx, pos, orientation, style) {
    switch (style.shape) {
        case 'triangle':
            const size = style.size ?? 5;
            drawTriangle(ctx, pos, orientation, size);
            return size;
        case 'circle':
            drawCircle(ctx, pos, style.size ?? 3);
            return 0;
        case 'none':
            return 0;
        default:
            (0, logging_1.assertUnreachable)(style.shape);
    }
}
function orientationToAngle(orientation) {
    switch (orientation) {
        case 'north':
            return 0;
        case 'east':
            return Math.PI / 2;
        case 'south':
            return Math.PI;
        case 'west':
            return (3 * Math.PI) / 2;
        default:
            (0, logging_1.assertUnreachable)(orientation);
    }
}
function orientationToUnitVector(orientation) {
    switch (orientation) {
        case 'north':
            return new geom_1.Vector2D({ x: 0, y: -1 });
        case 'east':
            return new geom_1.Vector2D({ x: 1, y: 0 });
        case 'south':
            return new geom_1.Vector2D({ x: 0, y: 1 });
        case 'west':
            return new geom_1.Vector2D({ x: -1, y: 0 });
        default:
            (0, logging_1.assertUnreachable)(orientation);
    }
}
function drawTriangle(ctx, pos, orientation, size) {
    // Calculate the transformed coordinates directly
    const angle = orientationToAngle(orientation);
    const cosAngle = Math.cos(angle);
    const sinAngle = Math.sin(angle);
    const transformedPoints = [
        { x: 0, y: 0 },
        { x: -1, y: -1 },
        { x: 1, y: -1 },
    ].map((point) => {
        const scaledX = point.x * size;
        const scaledY = point.y * size;
        const rotatedX = scaledX * cosAngle - scaledY * sinAngle;
        const rotatedY = scaledX * sinAngle + scaledY * cosAngle;
        return {
            x: rotatedX + pos.x,
            y: rotatedY + pos.y,
        };
    });
    ctx.beginPath();
    ctx.moveTo(transformedPoints[0].x, transformedPoints[0].y);
    ctx.lineTo(transformedPoints[1].x, transformedPoints[1].y);
    ctx.lineTo(transformedPoints[2].x, transformedPoints[2].y);
    ctx.closePath();
    ctx.fill();
}
function drawCircle(ctx, pos, radius) {
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
}
//# sourceMappingURL=bezier_arrow.js.map