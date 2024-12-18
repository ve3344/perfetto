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
exports.EngineProxy = exports.EngineBase = void 0;
const tslib_1 = require("tslib");
const protos_1 = tslib_1.__importDefault(require("../protos"));
const deferred_1 = require("../base/deferred");
const logging_1 = require("../base/logging");
const proto_ring_buffer_1 = require("./proto_ring_buffer");
const query_result_1 = require("./query_result");
var TPM = protos_1.default.TraceProcessorRpc.TraceProcessorMethod;
const utils_1 = require("../base/utils");
const result_1 = require("../base/result");
// Abstract interface of a trace proccessor.
// This is the TypeScript equivalent of src/trace_processor/rpc.h.
// There are two concrete implementations:
//   1. WasmEngineProxy: creates a Wasm module and interacts over postMessage().
//   2. HttpRpcEngine: connects to an external `trace_processor_shell --httpd`.
//      and interacts via fetch().
// In both cases, we have a byte-oriented pipe to interact with TraceProcessor.
// The derived class is only expected to deal with these two functions:
// 1. Implement the abstract rpcSendRequestBytes() function, sending the
//    proto-encoded TraceProcessorRpc requests to the TraceProcessor instance.
// 2. Call onRpcResponseBytes() when response data is received.
class EngineBase {
    txSeqId = 0;
    rxSeqId = 0;
    rxBuf = new proto_ring_buffer_1.ProtoRingBuffer();
    pendingParses = new Array();
    pendingEOFs = new Array();
    pendingResetTraceProcessors = new Array();
    pendingQueries = new Array();
    pendingRestoreTables = new Array();
    pendingComputeMetrics = new Array();
    pendingReadMetatrace;
    pendingRegisterSqlPackage;
    _isMetatracingEnabled = false;
    _numRequestsPending = 0;
    _failed = undefined;
    // TraceController sets this to raf.scheduleFullRedraw().
    onResponseReceived;
    // Called when an inbound message is received by the Engine implementation
    // (e.g. onmessage for the Wasm case, on when HTTP replies are received for
    // the HTTP+RPC case).
    onRpcResponseBytes(dataWillBeRetained) {
        // Note: when hitting the fastpath inside ProtoRingBuffer, the |data| buffer
        // is returned back by readMessage() (% subarray()-ing it) and held onto by
        // other classes (e.g., QueryResult). For both fetch() and Wasm we are fine
        // because every response creates a new buffer.
        this.rxBuf.append(dataWillBeRetained);
        for (;;) {
            const msg = this.rxBuf.readMessage();
            if (msg === undefined)
                break;
            this.onRpcResponseMessage(msg);
        }
    }
    // Parses a response message.
    // |rpcMsgEncoded| is a sub-array to to the start of a TraceProcessorRpc
    // proto-encoded message (without the proto preamble and varint size).
    onRpcResponseMessage(rpcMsgEncoded) {
        // Here we override the protobufjs-generated code to skip the parsing of the
        // new streaming QueryResult and instead passing it through like a buffer.
        // This is the overall problem: All trace processor responses are wrapped
        // into a TraceProcessorRpc proto message. In all cases %
        // TPM_QUERY_STREAMING, we want protobufjs to decode the proto bytes and
        // give us a structured object. In the case of TPM_QUERY_STREAMING, instead,
        // we want to deal with the proto parsing ourselves using the new
        // QueryResult.appendResultBatch() method, because that handled streaming
        // results more efficiently and skips several copies.
        // By overriding the decode method below, we achieve two things:
        // 1. We avoid protobufjs decoding the TraceProcessorRpc.query_result field.
        // 2. We stash (a view of) the original buffer into the |rawQueryResult| so
        //    the `case TPM_QUERY_STREAMING` below can take it.
        protos_1.default.QueryResult.decode = (reader, length) => {
            const res = protos_1.default.QueryResult.create();
            res.rawQueryResult = reader.buf.subarray(reader.pos, reader.pos + length);
            // All this works only if protobufjs returns the original ArrayBuffer
            // from |rpcMsgEncoded|. It should be always the case given the
            // current implementation. This check mainly guards against future
            // behavioral changes of protobufjs. We don't want to accidentally
            // hold onto some internal protobufjs buffer. We are fine holding
            // onto |rpcMsgEncoded| because those come from ProtoRingBuffer which
            // is buffer-retention-friendly.
            (0, logging_1.assertTrue)(res.rawQueryResult.buffer === rpcMsgEncoded.buffer);
            reader.pos += length;
            return res;
        };
        const rpc = protos_1.default.TraceProcessorRpc.decode(rpcMsgEncoded);
        if (rpc.fatalError !== undefined && rpc.fatalError.length > 0) {
            this.fail(`${rpc.fatalError}`);
        }
        // Allow restarting sequences from zero (when reloading the browser).
        if (rpc.seq !== this.rxSeqId + 1 && this.rxSeqId !== 0 && rpc.seq !== 0) {
            // "(ERR:rpc_seq)" is intercepted by error_dialog.ts to show a more
            // graceful and actionable error.
            this.fail(`RPC sequence id mismatch ` +
                `cur=${rpc.seq} last=${this.rxSeqId} (ERR:rpc_seq)`);
        }
        this.rxSeqId = rpc.seq;
        let isFinalResponse = true;
        switch (rpc.response) {
            case TPM.TPM_APPEND_TRACE_DATA: {
                const appendResult = (0, logging_1.assertExists)(rpc.appendResult);
                const pendingPromise = (0, logging_1.assertExists)(this.pendingParses.shift());
                if ((0, utils_1.exists)(appendResult.error) && appendResult.error.length > 0) {
                    pendingPromise.reject(appendResult.error);
                }
                else {
                    pendingPromise.resolve();
                }
                break;
            }
            case TPM.TPM_FINALIZE_TRACE_DATA: {
                const finalizeResult = (0, logging_1.assertExists)(rpc.finalizeDataResult);
                const pendingPromise = (0, logging_1.assertExists)(this.pendingEOFs.shift());
                if ((0, utils_1.exists)(finalizeResult.error) && finalizeResult.error.length > 0) {
                    pendingPromise.reject(finalizeResult.error);
                }
                else {
                    pendingPromise.resolve();
                }
                break;
            }
            case TPM.TPM_RESET_TRACE_PROCESSOR:
                (0, logging_1.assertExists)(this.pendingResetTraceProcessors.shift()).resolve();
                break;
            case TPM.TPM_RESTORE_INITIAL_TABLES:
                (0, logging_1.assertExists)(this.pendingRestoreTables.shift()).resolve();
                break;
            case TPM.TPM_QUERY_STREAMING:
                const qRes = (0, logging_1.assertExists)(rpc.queryResult);
                const pendingQuery = (0, logging_1.assertExists)(this.pendingQueries[0]);
                pendingQuery.appendResultBatch(qRes.rawQueryResult);
                if (pendingQuery.isComplete()) {
                    this.pendingQueries.shift();
                }
                else {
                    isFinalResponse = false;
                }
                break;
            case TPM.TPM_COMPUTE_METRIC:
                const metricRes = (0, logging_1.assertExists)(rpc.metricResult);
                const pendingComputeMetric = (0, logging_1.assertExists)(this.pendingComputeMetrics.shift());
                if ((0, utils_1.exists)(metricRes.error) && metricRes.error.length > 0) {
                    const error = new query_result_1.QueryError(`ComputeMetric() error: ${metricRes.error}`, {
                        query: 'COMPUTE_METRIC',
                    });
                    pendingComputeMetric.reject(error);
                }
                else {
                    const result = metricRes.metricsAsPrototext ??
                        metricRes.metricsAsJson ??
                        metricRes.metrics ??
                        '';
                    pendingComputeMetric.resolve(result);
                }
                break;
            case TPM.TPM_DISABLE_AND_READ_METATRACE:
                const metatraceRes = (0, logging_1.assertExists)(rpc.metatrace);
                (0, logging_1.assertExists)(this.pendingReadMetatrace).resolve(metatraceRes);
                this.pendingReadMetatrace = undefined;
                break;
            case TPM.TPM_REGISTER_SQL_PACKAGE:
                const registerResult = (0, logging_1.assertExists)(rpc.registerSqlPackageResult);
                const res = (0, logging_1.assertExists)(this.pendingRegisterSqlPackage);
                if ((0, utils_1.exists)(registerResult.error) && registerResult.error.length > 0) {
                    res.reject(registerResult.error);
                }
                else {
                    res.resolve();
                }
                break;
            default:
                console.log('Unexpected TraceProcessor response received: ', rpc.response);
                break;
        } // switch(rpc.response);
        if (isFinalResponse) {
            --this._numRequestsPending;
        }
        this.onResponseReceived?.();
    }
    // TraceProcessor methods below this point.
    // The methods below are called by the various controllers in the UI and
    // deal with marshalling / unmarshaling requests to/from TraceProcessor.
    // Push trace data into the engine. The engine is supposed to automatically
    // figure out the type of the trace (JSON vs Protobuf).
    parse(data) {
        const asyncRes = (0, deferred_1.defer)();
        this.pendingParses.push(asyncRes);
        const rpc = protos_1.default.TraceProcessorRpc.create();
        rpc.request = TPM.TPM_APPEND_TRACE_DATA;
        rpc.appendTraceData = data;
        this.rpcSendRequest(rpc);
        return asyncRes; // Linearize with the worker.
    }
    // Notify the engine that we reached the end of the trace.
    // Called after the last parse() call.
    notifyEof() {
        const asyncRes = (0, deferred_1.defer)();
        this.pendingEOFs.push(asyncRes);
        const rpc = protos_1.default.TraceProcessorRpc.create();
        rpc.request = TPM.TPM_FINALIZE_TRACE_DATA;
        this.rpcSendRequest(rpc);
        return asyncRes; // Linearize with the worker.
    }
    // Updates the TraceProcessor Config. This method creates a new
    // TraceProcessor instance, so it should be called before passing any trace
    // data.
    resetTraceProcessor({ cropTrackEvents, ingestFtraceInRawTable, analyzeTraceProtoContent, ftraceDropUntilAllCpusValid, }) {
        const asyncRes = (0, deferred_1.defer)();
        this.pendingResetTraceProcessors.push(asyncRes);
        const rpc = protos_1.default.TraceProcessorRpc.create();
        rpc.request = TPM.TPM_RESET_TRACE_PROCESSOR;
        const args = (rpc.resetTraceProcessorArgs =
            new protos_1.default.ResetTraceProcessorArgs());
        args.dropTrackEventDataBefore = cropTrackEvents
            ? protos_1.default.ResetTraceProcessorArgs.DropTrackEventDataBefore
                .TRACK_EVENT_RANGE_OF_INTEREST
            : protos_1.default.ResetTraceProcessorArgs.DropTrackEventDataBefore.NO_DROP;
        args.ingestFtraceInRawTable = ingestFtraceInRawTable;
        args.analyzeTraceProtoContent = analyzeTraceProtoContent;
        args.ftraceDropUntilAllCpusValid = ftraceDropUntilAllCpusValid;
        this.rpcSendRequest(rpc);
        return asyncRes;
    }
    // Resets the trace processor state by destroying any table/views created by
    // the UI after loading.
    restoreInitialTables() {
        const asyncRes = (0, deferred_1.defer)();
        this.pendingRestoreTables.push(asyncRes);
        const rpc = protos_1.default.TraceProcessorRpc.create();
        rpc.request = TPM.TPM_RESTORE_INITIAL_TABLES;
        this.rpcSendRequest(rpc);
        return asyncRes; // Linearize with the worker.
    }
    // Shorthand for sending a compute metrics request to the engine.
    async computeMetric(metrics, format) {
        const asyncRes = (0, deferred_1.defer)();
        this.pendingComputeMetrics.push(asyncRes);
        const rpc = protos_1.default.TraceProcessorRpc.create();
        rpc.request = TPM.TPM_COMPUTE_METRIC;
        const args = (rpc.computeMetricArgs = new protos_1.default.ComputeMetricArgs());
        args.metricNames = metrics;
        if (format === 'json') {
            args.format = protos_1.default.ComputeMetricArgs.ResultFormat.JSON;
        }
        else if (format === 'prototext') {
            args.format = protos_1.default.ComputeMetricArgs.ResultFormat.TEXTPROTO;
        }
        else if (format === 'proto') {
            args.format = protos_1.default.ComputeMetricArgs.ResultFormat.BINARY_PROTOBUF;
        }
        else {
            throw new Error(`Unknown compute metric format ${format}`);
        }
        this.rpcSendRequest(rpc);
        return asyncRes;
    }
    // Issues a streaming query and retrieve results in batches.
    // The returned QueryResult object will be populated over time with batches
    // of rows (each batch conveys ~128KB of data and a variable number of rows).
    // The caller can decide whether to wait that all batches have been received
    // (by awaiting the returned object or calling result.waitAllRows()) or handle
    // the rows incrementally.
    //
    // Example usage:
    // const res = engine.execute('SELECT foo, bar FROM table');
    // console.log(res.numRows());  // Will print 0 because we didn't await.
    // await(res.waitAllRows());
    // console.log(res.numRows());  // Will print the total number of rows.
    //
    // for (const it = res.iter({foo: NUM, bar:STR}); it.valid(); it.next()) {
    //   console.log(it.foo, it.bar);
    // }
    //
    // Optional |tag| (usually a component name) can be provided to allow
    // attributing trace processor workload to different UI components.
    streamingQuery(sqlQuery, tag) {
        const rpc = protos_1.default.TraceProcessorRpc.create();
        rpc.request = TPM.TPM_QUERY_STREAMING;
        rpc.queryArgs = new protos_1.default.QueryArgs();
        rpc.queryArgs.sqlQuery = sqlQuery;
        if (tag) {
            rpc.queryArgs.tag = tag;
        }
        const result = (0, query_result_1.createQueryResult)({
            query: sqlQuery,
        });
        this.pendingQueries.push(result);
        this.rpcSendRequest(rpc);
        return result;
    }
    // Wraps .streamingQuery(), captures errors and re-throws with current stack.
    //
    // Note: This function is less flexible than .execute() as it only returns a
    // promise which must be unwrapped before the QueryResult may be accessed.
    async query(sqlQuery, tag) {
        try {
            return await this.streamingQuery(sqlQuery, tag);
        }
        catch (e) {
            // Replace the error's stack trace with the one from here
            // Note: It seems only V8 can trace the stack up the promise chain, so its
            // likely this stack won't be useful on !V8.
            // See
            // https://docs.google.com/document/d/13Sy_kBIJGP0XT34V1CV3nkWya4TwYx9L3Yv45LdGB6Q
            captureStackTrace(e);
            throw e;
        }
    }
    async tryQuery(sql, tag) {
        try {
            const result = await this.query(sql, tag);
            return (0, result_1.okResult)(result);
        }
        catch (error) {
            const msg = 'message' in error ? `${error.message}` : `${error}`;
            return (0, result_1.errResult)(msg);
        }
    }
    isMetatracingEnabled() {
        return this._isMetatracingEnabled;
    }
    enableMetatrace(categories) {
        const rpc = protos_1.default.TraceProcessorRpc.create();
        rpc.request = TPM.TPM_ENABLE_METATRACE;
        if (categories !== undefined &&
            categories !== protos_1.default.MetatraceCategories.NONE) {
            rpc.enableMetatraceArgs = new protos_1.default.EnableMetatraceArgs();
            rpc.enableMetatraceArgs.categories = categories;
        }
        this._isMetatracingEnabled = true;
        this.rpcSendRequest(rpc);
    }
    stopAndGetMetatrace() {
        // If we are already finalising a metatrace, ignore the request.
        if (this.pendingReadMetatrace) {
            return Promise.reject(new Error('Already finalising a metatrace'));
        }
        const result = (0, deferred_1.defer)();
        const rpc = protos_1.default.TraceProcessorRpc.create();
        rpc.request = TPM.TPM_DISABLE_AND_READ_METATRACE;
        this._isMetatracingEnabled = false;
        this.pendingReadMetatrace = result;
        this.rpcSendRequest(rpc);
        return result;
    }
    registerSqlPackages(pkg) {
        if (this.pendingRegisterSqlPackage) {
            return Promise.reject(new Error('Already finalising a metatrace'));
        }
        const result = (0, deferred_1.defer)();
        const rpc = protos_1.default.TraceProcessorRpc.create();
        rpc.request = TPM.TPM_REGISTER_SQL_PACKAGE;
        const args = (rpc.registerSqlPackageArgs =
            new protos_1.default.RegisterSqlPackageArgs());
        args.packageName = pkg.name;
        args.modules = pkg.modules;
        args.allowOverride = true;
        this.pendingRegisterSqlPackage = result;
        this.rpcSendRequest(rpc);
        return result;
    }
    // Marshals the TraceProcessorRpc request arguments and sends the request
    // to the concrete Engine (Wasm or HTTP).
    rpcSendRequest(rpc) {
        rpc.seq = this.txSeqId++;
        // Each message is wrapped in a TraceProcessorRpcStream to add the varint
        // preamble with the size, which allows tokenization on the other end.
        const outerProto = protos_1.default.TraceProcessorRpcStream.create();
        outerProto.msg.push(rpc);
        const buf = protos_1.default.TraceProcessorRpcStream.encode(outerProto).finish();
        ++this._numRequestsPending;
        this.rpcSendRequestBytes(buf);
    }
    get engineId() {
        return this.id;
    }
    get numRequestsPending() {
        return this._numRequestsPending;
    }
    getProxy(tag) {
        return new EngineProxy(this, tag);
    }
    fail(reason) {
        this._failed = reason;
        throw new Error(reason);
    }
    get failed() {
        return this._failed;
    }
}
exports.EngineBase = EngineBase;
// Lightweight engine proxy which annotates all queries with a tag
class EngineProxy {
    engine;
    tag;
    _isAlive;
    constructor(engine, tag) {
        this.engine = engine;
        this.tag = tag;
        this._isAlive = true;
    }
    async query(query, tag) {
        if (!this._isAlive) {
            throw new Error(`EngineProxy ${this.tag} was disposed.`);
        }
        return await this.engine.query(query, tag);
    }
    async tryQuery(query, tag) {
        if (!this._isAlive) {
            return (0, result_1.errResult)(`EngineProxy ${this.tag} was disposed`);
        }
        return await this.engine.tryQuery(query, tag);
    }
    async computeMetric(metrics, format) {
        if (!this._isAlive) {
            return Promise.reject(new Error(`EngineProxy ${this.tag} was disposed.`));
        }
        return this.engine.computeMetric(metrics, format);
    }
    enableMetatrace(categories) {
        this.engine.enableMetatrace(categories);
    }
    stopAndGetMetatrace() {
        return this.engine.stopAndGetMetatrace();
    }
    get engineId() {
        return this.engine.id;
    }
    getProxy(tag) {
        return this.engine.getProxy(`${this.tag}/${tag}`);
    }
    get numRequestsPending() {
        return this.engine.numRequestsPending;
    }
    get mode() {
        return this.engine.mode;
    }
    get failed() {
        return this.engine.failed;
    }
    [Symbol.dispose]() {
        this._isAlive = false;
    }
}
exports.EngineProxy = EngineProxy;
// Capture stack trace and attach to the given error object
function captureStackTrace(e) {
    const stack = new Error().stack;
    if ('captureStackTrace' in Error) {
        // V8 specific
        Error.captureStackTrace(e, captureStackTrace);
    }
    else {
        // Generic
        Object.defineProperty(e, 'stack', {
            value: stack,
            writable: true,
            configurable: true,
        });
    }
}
//# sourceMappingURL=engine.js.map