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
exports.BaseCounterTrack = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const binary_search_1 = require("../../base/binary_search");
const logging_1 = require("../../base/logging");
const time_1 = require("../../base/time");
const uuid_1 = require("../../base/uuid");
const canvas_utils_1 = require("../../base/canvas_utils");
const raf_scheduler_1 = require("../../core/raf_scheduler");
const timeline_cache_1 = require("./timeline_cache");
const button_1 = require("../../widgets/button");
const menu_1 = require("../../widgets/menu");
const query_result_1 = require("../../trace_processor/query_result");
const checkerboard_1 = require("../checkerboard");
const disposable_stack_1 = require("../../base/disposable_stack");
function roundAway(n) {
    const exp = Math.ceil(Math.log10(Math.max(Math.abs(n), 1)));
    const pow10 = Math.pow(10, exp);
    return Math.sign(n) * (Math.ceil(Math.abs(n) / (pow10 / 20)) * (pow10 / 20));
}
function toLabel(n) {
    if (n === 0) {
        return '0';
    }
    const units = [
        [0.000000001, 'n'],
        [0.000001, 'u'],
        [0.001, 'm'],
        [1, ''],
        [1000, 'K'],
        [1000 * 1000, 'M'],
        [1000 * 1000 * 1000, 'G'],
        [1000 * 1000 * 1000 * 1000, 'T'],
    ];
    let largestMultiplier;
    let largestUnit;
    [largestMultiplier, largestUnit] = units[0];
    const absN = Math.abs(n);
    for (const [multiplier, unit] of units) {
        if (multiplier > absN) {
            break;
        }
        [largestMultiplier, largestUnit] = [multiplier, unit];
    }
    return `${Math.round(n / largestMultiplier)}${largestUnit}`;
}
class RangeSharer {
    static singleton;
    static get() {
        if (RangeSharer.singleton === undefined) {
            RangeSharer.singleton = new RangeSharer();
        }
        return RangeSharer.singleton;
    }
    tagToRange;
    keyToEnabled;
    constructor() {
        this.tagToRange = new Map();
        this.keyToEnabled = new Map();
    }
    isEnabled(key) {
        const value = this.keyToEnabled.get(key);
        if (value === undefined) {
            return true;
        }
        return value;
    }
    setEnabled(key, enabled) {
        this.keyToEnabled.set(key, enabled);
    }
    share(options, [min, max]) {
        const key = options.yRangeSharingKey;
        if (key === undefined || !this.isEnabled(key)) {
            return [min, max];
        }
        const tag = `${options.yRangeSharingKey}-${options.yMode}-${options.yDisplay}-${!!options.enlarge}`;
        const cachedRange = this.tagToRange.get(tag);
        if (cachedRange === undefined) {
            this.tagToRange.set(tag, [min, max]);
            return [min, max];
        }
        cachedRange[0] = Math.min(min, cachedRange[0]);
        cachedRange[1] = Math.max(max, cachedRange[1]);
        return [cachedRange[0], cachedRange[1]];
    }
}
// 0.5 Makes the horizontal lines sharp.
const MARGIN_TOP = 3.5;
class BaseCounterTrack {
    trace;
    uri;
    defaultOptions;
    trackUuid = (0, uuid_1.uuidv4Sql)();
    // This is the over-skirted cached bounds:
    countersKey = timeline_cache_1.CacheKey.zero();
    counters = {
        timestamps: new BigInt64Array(0),
        minDisplayValues: new Float64Array(0),
        maxDisplayValues: new Float64Array(0),
        lastDisplayValues: new Float64Array(0),
        displayValueRange: [0, 0],
    };
    limits;
    mousePos = { x: 0, y: 0 };
    hover;
    options;
    trash;
    getCounterOptions() {
        if (this.options === undefined) {
            const options = this.getDefaultCounterOptions();
            for (const [key, value] of Object.entries(this.defaultOptions)) {
                if (value !== undefined) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    options[key] = value;
                }
            }
            this.options = options;
        }
        return this.options;
    }
    // Extension points.
    // onInit hook lets you do asynchronous set up e.g. creating a table
    // etc. We guarantee that this will be resolved before doing any
    // queries using the result of getSqlSource(). All persistent
    // state in trace_processor should be cleaned up when dispose is
    // called on the returned hook.
    async onInit() { }
    getDefaultCounterOptions() {
        return {
            yRange: 'all',
            yRangeRounding: 'human_readable',
            yMode: 'value',
            yDisplay: 'zero',
        };
    }
    constructor(trace, uri, defaultOptions = {}) {
        this.trace = trace;
        this.uri = uri;
        this.defaultOptions = defaultOptions;
        this.trash = new disposable_stack_1.AsyncDisposableStack();
    }
    getHeight() {
        const height = 40;
        return this.getCounterOptions().enlarge ? height * 4 : height;
    }
    // A method to render menu items for switching the defualt
    // rendering options.  Useful if a subclass wants to incorporate it
    // as a submenu.
    getCounterContextMenuItems() {
        const options = this.getCounterOptions();
        return [
            (0, mithril_1.default)(menu_1.MenuItem, {
                label: `Display (currently: ${options.yDisplay})`,
            }, (0, mithril_1.default)(menu_1.MenuItem, {
                label: 'Zero-based',
                icon: options.yDisplay === 'zero'
                    ? 'radio_button_checked'
                    : 'radio_button_unchecked',
                onclick: () => {
                    options.yDisplay = 'zero';
                    this.invalidate();
                },
            }), (0, mithril_1.default)(menu_1.MenuItem, {
                label: 'Min/Max',
                icon: options.yDisplay === 'minmax'
                    ? 'radio_button_checked'
                    : 'radio_button_unchecked',
                onclick: () => {
                    options.yDisplay = 'minmax';
                    this.invalidate();
                },
            }), (0, mithril_1.default)(menu_1.MenuItem, {
                label: 'Log',
                icon: options.yDisplay === 'log'
                    ? 'radio_button_checked'
                    : 'radio_button_unchecked',
                onclick: () => {
                    options.yDisplay = 'log';
                    this.invalidate();
                },
            })),
            (0, mithril_1.default)(menu_1.MenuItem, {
                label: 'Zoom on scroll',
                icon: options.yRange === 'viewport'
                    ? 'check_box'
                    : 'check_box_outline_blank',
                onclick: () => {
                    options.yRange = options.yRange === 'viewport' ? 'all' : 'viewport';
                    this.invalidate();
                },
            }),
            (0, mithril_1.default)(menu_1.MenuItem, {
                label: `Enlarge`,
                icon: options.enlarge ? 'check_box' : 'check_box_outline_blank',
                onclick: () => {
                    options.enlarge = !options.enlarge;
                    this.invalidate();
                },
            }),
            options.yRangeSharingKey &&
                (0, mithril_1.default)(menu_1.MenuItem, {
                    label: `Share y-axis scale (group: ${options.yRangeSharingKey})`,
                    icon: RangeSharer.get().isEnabled(options.yRangeSharingKey)
                        ? 'check_box'
                        : 'check_box_outline_blank',
                    onclick: () => {
                        const key = options.yRangeSharingKey;
                        if (key === undefined) {
                            return;
                        }
                        const sharer = RangeSharer.get();
                        sharer.setEnabled(key, !sharer.isEnabled(key));
                        this.invalidate();
                    },
                }),
            (0, mithril_1.default)(menu_1.MenuDivider),
            (0, mithril_1.default)(menu_1.MenuItem, {
                label: `Mode (currently: ${options.yMode})`,
            }, (0, mithril_1.default)(menu_1.MenuItem, {
                label: 'Value',
                icon: options.yMode === 'value'
                    ? 'radio_button_checked'
                    : 'radio_button_unchecked',
                onclick: () => {
                    options.yMode = 'value';
                    this.invalidate();
                },
            }), (0, mithril_1.default)(menu_1.MenuItem, {
                label: 'Delta',
                icon: options.yMode === 'delta'
                    ? 'radio_button_checked'
                    : 'radio_button_unchecked',
                onclick: () => {
                    options.yMode = 'delta';
                    this.invalidate();
                },
            }), (0, mithril_1.default)(menu_1.MenuItem, {
                label: 'Rate',
                icon: options.yMode === 'rate'
                    ? 'radio_button_checked'
                    : 'radio_button_unchecked',
                onclick: () => {
                    options.yMode = 'rate';
                    this.invalidate();
                },
            })),
            (0, mithril_1.default)(menu_1.MenuItem, {
                label: 'Round y-axis scale',
                icon: options.yRangeRounding === 'human_readable'
                    ? 'check_box'
                    : 'check_box_outline_blank',
                onclick: () => {
                    options.yRangeRounding =
                        options.yRangeRounding === 'human_readable'
                            ? 'strict'
                            : 'human_readable';
                    this.invalidate();
                },
            }),
        ];
    }
    invalidate() {
        this.limits = undefined;
        this.countersKey = timeline_cache_1.CacheKey.zero();
        this.counters = {
            timestamps: new BigInt64Array(0),
            minDisplayValues: new Float64Array(0),
            maxDisplayValues: new Float64Array(0),
            lastDisplayValues: new Float64Array(0),
            displayValueRange: [0, 0],
        };
        this.hover = undefined;
        raf_scheduler_1.raf.scheduleFullRedraw();
    }
    // A method to render a context menu corresponding to switching the rendering
    // modes. By default, getTrackShellButtons renders it, but a subclass can call
    // it manually, if they want to customise rendering track buttons.
    getCounterContextMenu() {
        return (0, mithril_1.default)(menu_1.PopupMenu2, {
            trigger: (0, mithril_1.default)(button_1.Button, { icon: 'show_chart', compact: true }),
        }, this.getCounterContextMenuItems());
    }
    getTrackShellButtons() {
        return this.getCounterContextMenu();
    }
    async onCreate() {
        const result = await this.onInit();
        result && this.trash.use(result);
        this.limits = await this.createTableAndFetchLimits(false);
    }
    async onUpdate({ visibleWindow, size }) {
        const windowSizePx = Math.max(1, size.width);
        const timespan = visibleWindow.toTimeSpan();
        const rawCountersKey = timeline_cache_1.CacheKey.create(timespan.start, timespan.end, windowSizePx);
        // If the visible time range is outside the cached area, requests
        // asynchronously new data from the SQL engine.
        await this.maybeRequestData(rawCountersKey);
    }
    render({ ctx, size, timescale }) {
        // In any case, draw whatever we have (which might be stale/incomplete).
        const limits = this.limits;
        const data = this.counters;
        if (data.timestamps.length === 0 || limits === undefined) {
            (0, checkerboard_1.checkerboardExcept)(ctx, this.getHeight(), 0, size.width, timescale.timeToPx(this.countersKey.start), timescale.timeToPx(this.countersKey.end));
            return;
        }
        (0, logging_1.assertTrue)(data.timestamps.length === data.minDisplayValues.length);
        (0, logging_1.assertTrue)(data.timestamps.length === data.maxDisplayValues.length);
        (0, logging_1.assertTrue)(data.timestamps.length === data.lastDisplayValues.length);
        const options = this.getCounterOptions();
        const timestamps = data.timestamps;
        const minValues = data.minDisplayValues;
        const maxValues = data.maxDisplayValues;
        const lastValues = data.lastDisplayValues;
        // Choose a range for the y-axis
        const { yRange, yMin, yMax, yLabel } = this.computeYRange(limits, data.displayValueRange);
        const effectiveHeight = this.getHeight() - MARGIN_TOP;
        const endPx = size.width;
        // Use hue to differentiate the scale of the counter value
        const exp = Math.ceil(Math.log10(Math.max(yMax, 1)));
        const expCapped = Math.min(exp - 3, 9);
        const hue = (180 - Math.floor(expCapped * (180 / 6)) + 360) % 360;
        ctx.fillStyle = `hsl(${hue}, 45%, 75%)`;
        ctx.strokeStyle = `hsl(${hue}, 45%, 45%)`;
        const calculateX = (ts) => {
            return Math.floor(timescale.timeToPx(ts));
        };
        const calculateY = (value) => {
            return (MARGIN_TOP +
                effectiveHeight -
                Math.round(((value - yMin) / yRange) * effectiveHeight));
        };
        let zeroY;
        if (yMin >= 0) {
            zeroY = effectiveHeight + MARGIN_TOP;
        }
        else if (yMax < 0) {
            zeroY = MARGIN_TOP;
        }
        else {
            zeroY = effectiveHeight * (yMax / (yMax - yMin)) + MARGIN_TOP;
        }
        ctx.beginPath();
        const timestamp = time_1.Time.fromRaw(timestamps[0]);
        ctx.moveTo(Math.max(0, calculateX(timestamp)), zeroY);
        let lastDrawnY = zeroY;
        for (let i = 0; i < timestamps.length; i++) {
            const timestamp = time_1.Time.fromRaw(timestamps[i]);
            const x = Math.max(0, calculateX(timestamp));
            const minY = calculateY(minValues[i]);
            const maxY = calculateY(maxValues[i]);
            const lastY = calculateY(lastValues[i]);
            ctx.lineTo(x, lastDrawnY);
            if (minY === maxY) {
                (0, logging_1.assertTrue)(lastY === minY);
                ctx.lineTo(x, lastY);
            }
            else {
                ctx.lineTo(x, minY);
                ctx.lineTo(x, maxY);
                ctx.lineTo(x, lastY);
            }
            lastDrawnY = lastY;
        }
        ctx.lineTo(endPx, lastDrawnY);
        ctx.lineTo(endPx, zeroY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        if (yMin < 0 && yMax > 0) {
            // Draw the Y=0 dashed line.
            ctx.strokeStyle = `hsl(${hue}, 10%, 71%)`;
            ctx.beginPath();
            ctx.setLineDash([2, 4]);
            ctx.moveTo(0, zeroY);
            ctx.lineTo(endPx, zeroY);
            ctx.closePath();
            ctx.stroke();
            ctx.setLineDash([]);
        }
        ctx.font = '10px Roboto Condensed';
        const hover = this.hover;
        if (hover !== undefined) {
            let text = `${hover.lastDisplayValue.toLocaleString()}`;
            const unit = this.unit;
            switch (options.yMode) {
                case 'value':
                    text = `${text} ${unit}`;
                    break;
                case 'delta':
                    text = `${text} \u0394${unit}`;
                    break;
                case 'rate':
                    text = `${text} \u0394${unit}/s`;
                    break;
                default:
                    (0, logging_1.assertUnreachable)(options.yMode);
                    break;
            }
            ctx.fillStyle = `hsl(${hue}, 45%, 75%)`;
            ctx.strokeStyle = `hsl(${hue}, 45%, 45%)`;
            const rawXStart = calculateX(hover.ts);
            const xStart = Math.max(0, rawXStart);
            const xEnd = hover.tsEnd === undefined
                ? endPx
                : Math.floor(timescale.timeToPx(hover.tsEnd));
            const y = MARGIN_TOP +
                effectiveHeight -
                Math.round(((hover.lastDisplayValue - yMin) / yRange) * effectiveHeight);
            // Highlight line.
            ctx.beginPath();
            ctx.moveTo(xStart, y);
            ctx.lineTo(xEnd, y);
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.lineWidth = 1;
            // Draw change marker if it would be visible.
            if (rawXStart >= -6) {
                ctx.beginPath();
                ctx.arc(xStart, y, 3 /* r*/, 0 /* start angle*/, 2 * Math.PI /* end angle*/);
                ctx.fill();
                ctx.stroke();
            }
            // Draw the tooltip.
            (0, canvas_utils_1.drawTrackHoverTooltip)(ctx, this.mousePos, size, text);
        }
        // Write the Y scale on the top left corner.
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillRect(0, 0, 42, 13);
        ctx.fillStyle = '#666';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(`${yLabel}`, 5, 11);
        // TODO(hjd): Refactor this into checkerboardExcept
        {
            const counterEndPx = Infinity;
            // Grey out RHS.
            if (counterEndPx < endPx) {
                ctx.fillStyle = '#0000001f';
                ctx.fillRect(counterEndPx, 0, endPx - counterEndPx, this.getHeight());
            }
        }
        // If the cached trace slices don't fully cover the visible time range,
        // show a gray rectangle with a "Loading..." label.
        (0, checkerboard_1.checkerboardExcept)(ctx, this.getHeight(), 0, size.width, timescale.timeToPx(this.countersKey.start), timescale.timeToPx(this.countersKey.end));
    }
    onMouseMove({ x, y, timescale }) {
        const data = this.counters;
        if (data === undefined)
            return;
        this.mousePos = { x, y };
        const time = timescale.pxToHpTime(x);
        const [left, right] = (0, binary_search_1.searchSegment)(data.timestamps, time.toTime());
        if (left === -1) {
            this.hover = undefined;
            return;
        }
        const ts = time_1.Time.fromRaw(data.timestamps[left]);
        const tsEnd = right === -1 ? undefined : time_1.Time.fromRaw(data.timestamps[right]);
        const lastDisplayValue = data.lastDisplayValues[left];
        this.hover = {
            ts,
            tsEnd,
            lastDisplayValue,
        };
    }
    onMouseOut() {
        this.hover = undefined;
    }
    async onDestroy() {
        await this.trash.asyncDispose();
    }
    // Compute the range of values to display and range label.
    computeYRange(limits, dataLimits) {
        const options = this.getCounterOptions();
        let yMin = limits.minDisplayValue;
        let yMax = limits.maxDisplayValue;
        if (options.yRange === 'viewport') {
            [yMin, yMax] = dataLimits;
        }
        if (options.yDisplay === 'zero') {
            yMin = Math.min(0, yMin);
            yMax = Math.max(0, yMax);
        }
        if (options.yOverrideMaximum !== undefined) {
            yMax = Math.max(options.yOverrideMaximum, yMax);
        }
        if (options.yOverrideMinimum !== undefined) {
            yMin = Math.min(options.yOverrideMinimum, yMin);
        }
        if (options.yRangeRounding === 'human_readable') {
            if (options.yDisplay === 'log') {
                yMax = Math.log(roundAway(Math.exp(yMax)));
                yMin = Math.log(roundAway(Math.exp(yMin)));
            }
            else {
                yMax = roundAway(yMax);
                yMin = roundAway(yMin);
            }
        }
        const sharer = RangeSharer.get();
        [yMin, yMax] = sharer.share(options, [yMin, yMax]);
        let yLabel;
        if (options.yDisplay === 'minmax') {
            yLabel = 'min - max';
        }
        else {
            let max = yMax;
            let min = yMin;
            if (options.yDisplay === 'log') {
                max = Math.exp(max);
                min = Math.exp(min);
            }
            if (max < 0) {
                yLabel = toLabel(min - max);
            }
            else {
                yLabel = toLabel(max - min);
            }
        }
        const unit = this.unit;
        switch (options.yMode) {
            case 'value':
                yLabel += ` ${unit}`;
                break;
            case 'delta':
                yLabel += `\u0394${unit}`;
                break;
            case 'rate':
                yLabel += `\u0394${unit}/s`;
                break;
            default:
                (0, logging_1.assertUnreachable)(options.yMode);
        }
        if (options.yDisplay === 'log') {
            yLabel = `log(${yLabel})`;
        }
        return {
            yMin,
            yMax,
            yLabel,
            yRange: yMax - yMin,
        };
    }
    // The underlying table has `ts` and `value` columns.
    getValueExpression() {
        const options = this.getCounterOptions();
        let valueExpr;
        switch (options.yMode) {
            case 'value':
                valueExpr = 'value';
                break;
            case 'delta':
                valueExpr = 'lead(value, 1, value) over (order by ts) - value';
                break;
            case 'rate':
                valueExpr =
                    '(lead(value, 1, value) over (order by ts) - value) / ((lead(ts, 1, 100) over (order by ts) - ts) / 1e9)';
                break;
            default:
                (0, logging_1.assertUnreachable)(options.yMode);
        }
        if (options.yDisplay === 'log') {
            return `ifnull(ln(${valueExpr}), 0)`;
        }
        else {
            return valueExpr;
        }
    }
    getTableName() {
        return `counter_${this.trackUuid}`;
    }
    async maybeRequestData(rawCountersKey) {
        if (rawCountersKey.isCoveredBy(this.countersKey)) {
            return; // We have the data already, no need to re-query.
        }
        const countersKey = rawCountersKey.normalize();
        if (!rawCountersKey.isCoveredBy(countersKey)) {
            throw new Error(`Normalization error ${countersKey.toString()} ${rawCountersKey.toString()}`);
        }
        if (this.limits === undefined) {
            this.limits = await this.createTableAndFetchLimits(true);
        }
        const queryRes = await this.engine.query(`
      SELECT
        min_value as minDisplayValue,
        max_value as maxDisplayValue,
        last_ts as ts,
        last_value as lastDisplayValue
      FROM ${this.getTableName()}(
        ${countersKey.start},
        ${countersKey.end},
        ${countersKey.bucketSize}
      );
    `);
        const it = queryRes.iter({
            ts: query_result_1.LONG,
            minDisplayValue: query_result_1.NUM,
            maxDisplayValue: query_result_1.NUM,
            lastDisplayValue: query_result_1.NUM,
        });
        const numRows = queryRes.numRows();
        const data = {
            timestamps: new BigInt64Array(numRows),
            minDisplayValues: new Float64Array(numRows),
            maxDisplayValues: new Float64Array(numRows),
            lastDisplayValues: new Float64Array(numRows),
            displayValueRange: [0, 0],
        };
        let min = 0;
        let max = 0;
        for (let row = 0; it.valid(); it.next(), row++) {
            data.timestamps[row] = time_1.Time.fromRaw(it.ts);
            data.minDisplayValues[row] = it.minDisplayValue;
            data.maxDisplayValues[row] = it.maxDisplayValue;
            data.lastDisplayValues[row] = it.lastDisplayValue;
            min = Math.min(min, it.minDisplayValue);
            max = Math.max(max, it.maxDisplayValue);
        }
        data.displayValueRange = [min, max];
        this.countersKey = countersKey;
        this.counters = data;
        raf_scheduler_1.raf.scheduleCanvasRedraw();
    }
    async createTableAndFetchLimits(dropTable) {
        const dropQuery = dropTable ? `drop table ${this.getTableName()};` : '';
        const displayValueQuery = await this.engine.query(`
      ${dropQuery}
      create virtual table ${this.getTableName()}
      using __intrinsic_counter_mipmap((
        select
          ts,
          ${this.getValueExpression()} as value
        from (${this.getSqlSource()})
      ));
      select
        min_value as minDisplayValue,
        max_value as maxDisplayValue
      from ${this.getTableName()}(
        trace_start(), trace_end(), trace_dur()
      );
    `);
        this.trash.defer(async () => {
            this.engine.tryQuery(`drop table if exists ${this.getTableName()}`);
        });
        const { minDisplayValue, maxDisplayValue } = displayValueQuery.firstRow({
            minDisplayValue: query_result_1.NUM,
            maxDisplayValue: query_result_1.NUM,
        });
        return {
            minDisplayValue,
            maxDisplayValue,
        };
    }
    get unit() {
        return this.getCounterOptions().unit ?? '';
    }
    get engine() {
        return this.trace.engine;
    }
}
exports.BaseCounterTrack = BaseCounterTrack;
//# sourceMappingURL=base_counter_track.js.map