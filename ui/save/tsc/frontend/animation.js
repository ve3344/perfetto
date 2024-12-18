"use strict";
// Copyright (C) 2018 The Android Open Source Project
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
exports.Animation = void 0;
const raf_scheduler_1 = require("../core/raf_scheduler");
class Animation {
    onAnimationStep;
    startMs = 0;
    endMs = 0;
    boundOnAnimationFrame = this.onAnimationFrame.bind(this);
    constructor(onAnimationStep) {
        this.onAnimationStep = onAnimationStep;
    }
    start(durationMs) {
        const nowMs = performance.now();
        // If the animation is already happening, just update its end time.
        if (nowMs <= this.endMs) {
            this.endMs = nowMs + durationMs;
            return;
        }
        this.startMs = nowMs;
        this.endMs = nowMs + durationMs;
        raf_scheduler_1.raf.startAnimation(this.boundOnAnimationFrame);
    }
    stop() {
        this.endMs = 0;
        raf_scheduler_1.raf.stopAnimation(this.boundOnAnimationFrame);
    }
    get startTimeMs() {
        return this.startMs;
    }
    onAnimationFrame(nowMs) {
        if (nowMs >= this.endMs) {
            raf_scheduler_1.raf.stopAnimation(this.boundOnAnimationFrame);
            return;
        }
        this.onAnimationStep(Math.max(Math.round(nowMs - this.startMs), 0));
    }
}
exports.Animation = Animation;
//# sourceMappingURL=animation.js.map