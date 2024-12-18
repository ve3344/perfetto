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
const logging_1 = require("../base/logging");
const time_1 = require("../base/time");
const time_scale_1 = require("../base/time_scale");
const high_precision_time_1 = require("../base/high_precision_time");
const high_precision_time_span_1 = require("../base/high_precision_time_span");
const track_manager_1 = require("../core/track_manager");
function makeMockTrack() {
    return {
        onCreate: jest.fn(),
        onUpdate: jest.fn(),
        onDestroy: jest.fn(),
        render: jest.fn(),
        onFullRedraw: jest.fn(),
        getSliceVerticalBounds: jest.fn(),
        getHeight: jest.fn(),
        getTrackShellButtons: jest.fn(),
        onMouseMove: jest.fn(),
        onMouseClick: jest.fn(),
        onMouseOut: jest.fn(),
    };
}
async function settle() {
    await new Promise((r) => setTimeout(r, 0));
}
let mockTrack;
let td;
let trackManager;
const visibleWindow = new high_precision_time_span_1.HighPrecisionTimeSpan(high_precision_time_1.HighPrecisionTime.ZERO, 0);
const dummyCtx = {
    trackUri: 'foo',
    ctx: new CanvasRenderingContext2D(),
    size: { width: 123, height: 123 },
    visibleWindow,
    resolution: time_1.Duration.ZERO,
    timescale: new time_scale_1.TimeScale(visibleWindow, { left: 0, right: 0 }),
};
beforeEach(() => {
    mockTrack = makeMockTrack();
    td = {
        uri: 'test',
        title: 'foo',
        track: mockTrack,
    };
    trackManager = new track_manager_1.TrackManagerImpl();
    trackManager.registerTrack(td);
});
describe('TrackManager', () => {
    it('calls track lifecycle hooks', async () => {
        const entry = (0, logging_1.assertExists)(trackManager.getTrackRenderer(td.uri));
        entry.render(dummyCtx);
        await settle();
        expect(mockTrack.onCreate).toHaveBeenCalledTimes(1);
        expect(mockTrack.onUpdate).toHaveBeenCalledTimes(1);
        // Double flush should destroy all tracks
        trackManager.flushOldTracks();
        trackManager.flushOldTracks();
        await settle();
        expect(mockTrack.onDestroy).toHaveBeenCalledTimes(1);
    });
    it('calls onCrate lazily', async () => {
        // Check we wait until the first call to render before calling onCreate
        const entry = (0, logging_1.assertExists)(trackManager.getTrackRenderer(td.uri));
        await settle();
        expect(mockTrack.onCreate).not.toHaveBeenCalled();
        entry.render(dummyCtx);
        await settle();
        expect(mockTrack.onCreate).toHaveBeenCalledTimes(1);
    });
    it('reuses tracks', async () => {
        const first = (0, logging_1.assertExists)(trackManager.getTrackRenderer(td.uri));
        trackManager.flushOldTracks();
        first.render(dummyCtx);
        await settle();
        const second = (0, logging_1.assertExists)(trackManager.getTrackRenderer(td.uri));
        trackManager.flushOldTracks();
        second.render(dummyCtx);
        await settle();
        expect(first).toBe(second);
        // Ensure onCreate called only once
        expect(mockTrack.onCreate).toHaveBeenCalledTimes(1);
    });
    it('destroys tracks when they are not resolved for one cycle', async () => {
        const entry = (0, logging_1.assertExists)(trackManager.getTrackRenderer(td.uri));
        entry.render(dummyCtx);
        // Double flush should destroy all tracks
        trackManager.flushOldTracks();
        trackManager.flushOldTracks();
        await settle();
        expect(mockTrack.onDestroy).toHaveBeenCalledTimes(1);
    });
    it('contains crash inside onCreate()', async () => {
        const entry = (0, logging_1.assertExists)(trackManager.getTrackRenderer(td.uri));
        const e = new Error();
        // Mock crash inside onCreate
        mockTrack.onCreate.mockImplementationOnce(() => {
            throw e;
        });
        entry.render(dummyCtx);
        await settle();
        expect(mockTrack.onCreate).toHaveBeenCalledTimes(1);
        expect(mockTrack.onUpdate).not.toHaveBeenCalled();
        expect(entry.getError()).toBe(e);
    });
    it('contains crash inside onUpdate()', async () => {
        const entry = (0, logging_1.assertExists)(trackManager.getTrackRenderer(td.uri));
        const e = new Error();
        // Mock crash inside onUpdate
        mockTrack.onUpdate.mockImplementationOnce(() => {
            throw e;
        });
        entry.render(dummyCtx);
        await settle();
        expect(mockTrack.onCreate).toHaveBeenCalledTimes(1);
        expect(mockTrack.onUpdate).toHaveBeenCalledTimes(1);
        expect(entry.getError()).toBe(e);
    });
    it('handles dispose after crash', async () => {
        const entry = (0, logging_1.assertExists)(trackManager.getTrackRenderer(td.uri));
        const e = new Error();
        // Mock crash inside onUpdate
        mockTrack.onUpdate.mockImplementationOnce(() => {
            throw e;
        });
        entry.render(dummyCtx);
        await settle();
        // Ensure we don't crash during the next render cycle
        entry.render(dummyCtx);
        await settle();
    });
});
//# sourceMappingURL=track_manager_unittest.js.map