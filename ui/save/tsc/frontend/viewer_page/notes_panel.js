"use strict";
// Copyright (C) 2019 The Android Open Source Project
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use size file except in compliance with the License.
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
exports.NotesPanel = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const canvas_utils_1 = require("../../base/canvas_utils");
const dom_utils_1 = require("../../base/dom_utils");
const logging_1 = require("../../base/logging");
const time_scale_1 = require("../../base/time_scale");
const colorizer_1 = require("../../components/colorizer");
const raf_scheduler_1 = require("../../core/raf_scheduler");
const button_1 = require("../../widgets/button");
const css_constants_1 = require("../css_constants");
const gridline_helper_1 = require("./gridline_helper");
const FLAG_WIDTH = 16;
const AREA_TRIANGLE_WIDTH = 10;
const FLAG = `\uE153`;
function toSummary(s) {
    const newlineIndex = s.indexOf('\n') > 0 ? s.indexOf('\n') : s.length;
    return s.slice(0, Math.min(newlineIndex, s.length, 16));
}
function getStartTimestamp(note) {
    const noteType = note.noteType;
    switch (noteType) {
        case 'SPAN':
            return note.start;
        case 'DEFAULT':
            return note.timestamp;
        default:
            (0, logging_1.assertUnreachable)(noteType);
    }
}
class NotesPanel {
    kind = 'panel';
    selectable = false;
    trace;
    timescale; // The timescale from the last render()
    hoveredX = null;
    mouseDragging = false;
    constructor(trace) {
        this.trace = trace;
    }
    render() {
        const allCollapsed = this.trace.workspace.flatTracks.every((n) => n.collapsed);
        return (0, mithril_1.default)('.notes-panel', {
            onmousedown: () => {
                // If the user clicks & drags, very likely they just want to measure
                // the time horizontally, not set a flag. This debouncing is done to
                // avoid setting accidental flags like measuring the time on the brush
                // timeline.
                this.mouseDragging = false;
            },
            onclick: (e) => {
                if (!this.mouseDragging) {
                    const x = (0, dom_utils_1.currentTargetOffset)(e).x - css_constants_1.TRACK_SHELL_WIDTH;
                    this.onClick(x);
                    e.stopPropagation();
                }
            },
            onmousemove: (e) => {
                this.mouseDragging = true;
                this.hoveredX = (0, dom_utils_1.currentTargetOffset)(e).x - css_constants_1.TRACK_SHELL_WIDTH;
                raf_scheduler_1.raf.scheduleCanvasRedraw();
            },
            onmouseenter: (e) => {
                this.hoveredX = (0, dom_utils_1.currentTargetOffset)(e).x - css_constants_1.TRACK_SHELL_WIDTH;
                raf_scheduler_1.raf.scheduleCanvasRedraw();
            },
            onmouseout: () => {
                this.hoveredX = null;
                this.trace.timeline.hoveredNoteTimestamp = undefined;
            },
        }, (0, mithril_1.default)(button_1.ButtonBar, { className: 'pf-toolbar' }, (0, mithril_1.default)(button_1.Button, {
            onclick: (e) => {
                e.preventDefault();
                if (allCollapsed) {
                    this.trace.commands.runCommand('perfetto.CoreCommands#ExpandAllGroups');
                }
                else {
                    this.trace.commands.runCommand('perfetto.CoreCommands#CollapseAllGroups');
                }
            },
            title: allCollapsed ? 'Expand all' : 'Collapse all',
            icon: allCollapsed ? 'unfold_more' : 'unfold_less',
            compact: true,
        }), (0, mithril_1.default)(button_1.Button, {
            onclick: (e) => {
                e.preventDefault();
                this.trace.workspace.pinnedTracks.forEach((t) => this.trace.workspace.unpinTrack(t));
                raf_scheduler_1.raf.scheduleFullRedraw();
            },
            title: 'Clear all pinned tracks',
            icon: 'clear_all',
            compact: true,
        })));
    }
    renderCanvas(ctx, size) {
        ctx.fillStyle = '#999';
        ctx.fillRect(css_constants_1.TRACK_SHELL_WIDTH - 2, 0, 2, size.height);
        const trackSize = { ...size, width: size.width - css_constants_1.TRACK_SHELL_WIDTH };
        ctx.save();
        ctx.translate(css_constants_1.TRACK_SHELL_WIDTH, 0);
        (0, canvas_utils_1.canvasClip)(ctx, 0, 0, trackSize.width, trackSize.height);
        this.renderPanel(ctx, trackSize);
        ctx.restore();
    }
    renderPanel(ctx, size) {
        let aNoteIsHovered = false;
        const visibleWindow = this.trace.timeline.visibleWindow;
        const timescale = new time_scale_1.TimeScale(visibleWindow, {
            left: 0,
            right: size.width,
        });
        const timespan = visibleWindow.toTimeSpan();
        this.timescale = timescale;
        if (size.width > 0 && timespan.duration > 0n) {
            const maxMajorTicks = (0, gridline_helper_1.getMaxMajorTicks)(size.width);
            const offset = this.trace.timeline.timestampOffset();
            const tickGen = (0, gridline_helper_1.generateTicks)(timespan, maxMajorTicks, offset);
            for (const { type, time } of tickGen) {
                const px = Math.floor(timescale.timeToPx(time));
                if (type === gridline_helper_1.TickType.MAJOR) {
                    ctx.fillRect(px, 0, 1, size.height);
                }
            }
        }
        ctx.textBaseline = 'bottom';
        ctx.font = '10px Helvetica';
        for (const note of this.trace.notes.notes.values()) {
            const timestamp = getStartTimestamp(note);
            // TODO(hjd): We should still render area selection marks in viewport is
            // *within* the area (e.g. both lhs and rhs are out of bounds).
            if ((note.noteType === 'DEFAULT' &&
                !visibleWindow.contains(note.timestamp)) ||
                (note.noteType === 'SPAN' &&
                    !visibleWindow.overlaps(note.start, note.end))) {
                continue;
            }
            const currentIsHovered = this.hoveredX !== null && this.hitTestNote(this.hoveredX, note);
            if (currentIsHovered)
                aNoteIsHovered = true;
            const selection = this.trace.selection.selection;
            const isSelected = selection.kind === 'note' && selection.id === note.id;
            const x = timescale.timeToPx(timestamp);
            const left = Math.floor(x);
            // Draw flag or marker.
            if (note.noteType === 'SPAN') {
                this.drawAreaMarker(ctx, left, Math.floor(timescale.timeToPx(note.end)), note.color, isSelected);
            }
            else {
                this.drawFlag(ctx, left, size.height, note.color, isSelected);
            }
            if (note.text) {
                const summary = toSummary(note.text);
                const measured = ctx.measureText(summary);
                // Add a white semi-transparent background for the text.
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.fillRect(left + FLAG_WIDTH + 2, size.height + 2, measured.width + 2, -12);
                ctx.fillStyle = '#3c4b5d';
                ctx.fillText(summary, left + FLAG_WIDTH + 3, size.height + 1);
            }
        }
        // A real note is hovered so we don't need to see the preview line.
        // TODO(hjd): Change cursor to pointer here.
        if (aNoteIsHovered) {
            this.trace.timeline.hoveredNoteTimestamp = undefined;
        }
        // View preview note flag when hovering on notes panel.
        if (!aNoteIsHovered && this.hoveredX !== null) {
            const timestamp = timescale.pxToHpTime(this.hoveredX).toTime();
            if (visibleWindow.contains(timestamp)) {
                this.trace.timeline.hoveredNoteTimestamp = timestamp;
                const x = timescale.timeToPx(timestamp);
                const left = Math.floor(x);
                this.drawFlag(ctx, left, size.height, '#aaa', /* fill */ true);
            }
        }
        ctx.restore();
    }
    drawAreaMarker(ctx, x, xEnd, color, fill) {
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        const topOffset = 10;
        // Don't draw in the track shell section.
        if (x >= 0) {
            // Draw left triangle.
            ctx.beginPath();
            ctx.moveTo(x, topOffset);
            ctx.lineTo(x, topOffset + AREA_TRIANGLE_WIDTH);
            ctx.lineTo(x + AREA_TRIANGLE_WIDTH, topOffset);
            ctx.lineTo(x, topOffset);
            if (fill)
                ctx.fill();
            ctx.stroke();
        }
        // Draw right triangle.
        ctx.beginPath();
        ctx.moveTo(xEnd, topOffset);
        ctx.lineTo(xEnd, topOffset + AREA_TRIANGLE_WIDTH);
        ctx.lineTo(xEnd - AREA_TRIANGLE_WIDTH, topOffset);
        ctx.lineTo(xEnd, topOffset);
        if (fill)
            ctx.fill();
        ctx.stroke();
        // Start line after track shell section, join triangles.
        const startDraw = Math.max(x, 0);
        ctx.beginPath();
        ctx.moveTo(startDraw, topOffset);
        ctx.lineTo(xEnd, topOffset);
        ctx.stroke();
    }
    drawFlag(ctx, x, height, color, fill) {
        const prevFont = ctx.font;
        const prevBaseline = ctx.textBaseline;
        ctx.textBaseline = 'alphabetic';
        // Adjust height for icon font.
        ctx.font = '24px Material Symbols Sharp';
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        // The ligatures have padding included that means the icon is not drawn
        // exactly at the x value. This adjusts for that.
        const iconPadding = 6;
        if (fill) {
            ctx.fillText(FLAG, x - iconPadding, height + 2);
        }
        else {
            ctx.strokeText(FLAG, x - iconPadding, height + 2.5);
        }
        ctx.font = prevFont;
        ctx.textBaseline = prevBaseline;
    }
    onClick(x) {
        if (!this.timescale) {
            return;
        }
        // Select the hovered note, or create a new single note & select it
        if (x < 0)
            return;
        for (const note of this.trace.notes.notes.values()) {
            if (this.hoveredX !== null && this.hitTestNote(this.hoveredX, note)) {
                this.trace.selection.selectNote({ id: note.id });
                return;
            }
        }
        const timestamp = this.timescale.pxToHpTime(x).toTime();
        const color = (0, colorizer_1.randomColor)();
        const noteId = this.trace.notes.addNote({ timestamp, color });
        this.trace.selection.selectNote({ id: noteId });
    }
    hitTestNote(x, note) {
        if (!this.timescale) {
            return false;
        }
        const timescale = this.timescale;
        const noteX = timescale.timeToPx(getStartTimestamp(note));
        if (note.noteType === 'SPAN') {
            return ((noteX <= x && x < noteX + AREA_TRIANGLE_WIDTH) ||
                (timescale.timeToPx(note.end) > x &&
                    x > timescale.timeToPx(note.end) - AREA_TRIANGLE_WIDTH));
        }
        else {
            const width = FLAG_WIDTH;
            return noteX <= x && x < noteX + width;
        }
    }
}
exports.NotesPanel = NotesPanel;
//# sourceMappingURL=notes_panel.js.map