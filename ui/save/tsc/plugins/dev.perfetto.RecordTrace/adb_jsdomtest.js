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
const adb_1 = require("./adb");
const string_utils_1 = require("../../base/string_utils");
test('startAuthentication', async () => {
    const adb = new adb_1.AdbOverWebUsb();
    const sendRaw = jest.fn();
    adb.sendRaw = sendRaw;
    const recvRaw = jest.fn();
    adb.recvRaw = recvRaw;
    const expectedAuthMessage = adb_1.AdbMsgImpl.create({
        cmd: 'CNXN',
        arg0: adb_1.VERSION_WITH_CHECKSUM,
        arg1: adb_1.DEFAULT_MAX_PAYLOAD_BYTES,
        data: 'host:1:UsbADB',
        useChecksum: true,
    });
    await adb.startAuthentication();
    expect(sendRaw).toHaveBeenCalledTimes(2);
    expect(sendRaw).toBeCalledWith(expectedAuthMessage.encodeHeader());
    expect(sendRaw).toBeCalledWith(expectedAuthMessage.data);
});
test('connectedMessage', async () => {
    const adb = new adb_1.AdbOverWebUsb();
    adb.key = {};
    adb.state = adb_1.AdbState.AUTH_STEP2;
    const onConnected = jest.fn();
    adb.onConnected = onConnected;
    const expectedMaxPayload = 42;
    const connectedMsg = adb_1.AdbMsgImpl.create({
        cmd: 'CNXN',
        arg0: adb_1.VERSION_WITH_CHECKSUM,
        arg1: expectedMaxPayload,
        data: (0, string_utils_1.utf8Encode)('device'),
        useChecksum: true,
    });
    await adb.onMessage(connectedMsg);
    expect(adb.state).toBe(adb_1.AdbState.CONNECTED);
    expect(adb.maxPayload).toBe(expectedMaxPayload);
    expect(adb.devProps).toBe('device');
    expect(adb.useChecksum).toBe(true);
    expect(onConnected).toHaveBeenCalledTimes(1);
});
test('shellOpening', () => {
    const adb = new adb_1.AdbOverWebUsb();
    const openStream = jest.fn();
    adb.openStream = openStream;
    adb.shell('test');
    expect(openStream).toBeCalledWith('shell:test');
});
//# sourceMappingURL=adb_jsdomtest.js.map