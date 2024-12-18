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
const dingusjs_1 = require("dingusjs");
const string_utils_1 = require("../../base/string_utils");
const protos_1 = require("./protos");
const adb_interfaces_1 = require("./adb_interfaces");
const adb_shell_controller_1 = require("./adb_shell_controller");
const empty_state_1 = require("./empty_state");
function generateMockConsumer() {
    return {
        onConsumerPortResponse: jest.fn(),
        onError: jest.fn(),
        onStatus: jest.fn(),
    };
}
const mainCallback = generateMockConsumer();
const adbMock = new adb_interfaces_1.MockAdb();
const adbController = new adb_shell_controller_1.AdbConsumerPort(adbMock, mainCallback, (0, empty_state_1.createEmptyState)());
const mockIntArray = new Uint8Array();
const enableTracingRequest = new protos_1.EnableTracingRequest();
enableTracingRequest.traceConfig = new protos_1.TraceConfig();
const enableTracingRequestProto = protos_1.EnableTracingRequest.encode(enableTracingRequest).finish();
test('handleCommand', async () => {
    adbController.findDevice = () => {
        return Promise.resolve((0, dingusjs_1.dingus)());
    };
    const enableTracing = jest.fn();
    adbController.enableTracing = enableTracing;
    await adbController.invoke('EnableTracing', mockIntArray);
    expect(enableTracing).toHaveBeenCalledTimes(1);
    const readBuffers = jest.fn();
    adbController.readBuffers = readBuffers;
    adbController.invoke('ReadBuffers', mockIntArray);
    expect(readBuffers).toHaveBeenCalledTimes(1);
    const sendErrorMessage = jest.fn();
    adbController.sendErrorMessage = sendErrorMessage;
    adbController.invoke('unknown', mockIntArray);
    expect(sendErrorMessage).toBeCalledWith('Method not recognized: unknown');
});
test('enableTracing', async () => {
    const mainCallback = generateMockConsumer();
    const adbMock = new adb_interfaces_1.MockAdb();
    const adbController = new adb_shell_controller_1.AdbConsumerPort(adbMock, mainCallback, (0, empty_state_1.createEmptyState)());
    adbController.sendErrorMessage = jest
        .fn()
        .mockImplementation((s) => console.error(s));
    const findDevice = jest.fn().mockImplementation(() => {
        return Promise.resolve({});
    });
    adbController.findDevice = findDevice;
    const connectToDevice = jest
        .fn()
        .mockImplementation((_) => Promise.resolve());
    adbMock.connect = connectToDevice;
    const stream = new adb_interfaces_1.MockAdbStream();
    const adbShell = jest
        .fn()
        .mockImplementation((_) => Promise.resolve(stream));
    adbMock.shell = adbShell;
    const sendMessage = jest.fn();
    adbController.sendMessage = sendMessage;
    adbController.generateStartTracingCommand = (_) => 'CMD';
    await adbController.enableTracing(enableTracingRequestProto);
    expect(adbShell).toBeCalledWith('CMD');
    expect(sendMessage).toHaveBeenCalledTimes(0);
    stream.onData((0, string_utils_1.utf8Encode)('starting tracing Wrote 123 bytes'));
    stream.onClose();
    expect(adbController.sendErrorMessage).toHaveBeenCalledTimes(0);
    expect(sendMessage).toBeCalledWith({ type: 'EnableTracingResponse' });
});
test('generateStartTracing', () => {
    adbController.traceDestFile = 'DEST';
    const testArray = new Uint8Array(1);
    testArray[0] = 65;
    const generatedCmd = adbController.generateStartTracingCommand(testArray);
    expect(generatedCmd).toBe(`echo '${btoa('A')}' | base64 -d | perfetto -c - -o DEST`);
});
test('tracingEndedSuccessfully', () => {
    expect(adbController.tracingEndedSuccessfully('Connected to the Perfetto traced service, starting tracing for 10000 ms\nWrote 564 bytes into /data/misc/perfetto-traces/trace')).toBe(true);
    expect(adbController.tracingEndedSuccessfully('Connected to the Perfetto traced service, starting tracing for 10000 ms')).toBe(false);
    expect(adbController.tracingEndedSuccessfully('Connected to the Perfetto traced service, starting tracing for 0 ms')).toBe(false);
});
//# sourceMappingURL=adb_record_controller_jsdomtest.js.map