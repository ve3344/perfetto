"use strict";
// Copyright (C) 2019 The Android Open Source Project
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
exports.RpcConsumerPort = void 0;
const trace_1 = require("../../public/trace");
class RpcConsumerPort {
    // The responses of the call invocations should be sent through this listener.
    // This is done by the 3 "send" methods in this abstract class.
    consumerPortListener;
    constructor(consumerPortListener) {
        this.consumerPortListener = consumerPortListener;
    }
    sendMessage(data) {
        this.consumerPortListener.onConsumerPortResponse(data);
    }
    sendErrorMessage(message) {
        this.consumerPortListener.onError(message);
    }
    sendStatus(status) {
        this.consumerPortListener.onStatus(status);
    }
    // Allows the recording controller to customise the suffix added to recorded
    // traces when they are downloaded. In the general case this will be
    // .perfetto-trace however if the trace is recorded compressed if could be
    // .perfetto-trace.gz etc.
    getRecordedTraceSuffix() {
        return trace_1.TRACE_SUFFIX;
    }
}
exports.RpcConsumerPort = RpcConsumerPort;
//# sourceMappingURL=record_controller_interfaces.js.map