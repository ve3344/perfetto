import * as $protobuf from "protobufjs";
import Long = require("long");
export namespace perfetto {

    namespace protos {

        class ConsumerPort extends $protobuf.rpc.Service {
            constructor(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean);
            public static create(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean): ConsumerPort;
            public enableTracing(request: perfetto.protos.IEnableTracingRequest, callback: perfetto.protos.ConsumerPort.EnableTracingCallback): void;
            public enableTracing(request: perfetto.protos.IEnableTracingRequest): Promise<perfetto.protos.EnableTracingResponse>;
            public disableTracing(request: perfetto.protos.IDisableTracingRequest, callback: perfetto.protos.ConsumerPort.DisableTracingCallback): void;
            public disableTracing(request: perfetto.protos.IDisableTracingRequest): Promise<perfetto.protos.DisableTracingResponse>;
            public readBuffers(request: perfetto.protos.IReadBuffersRequest, callback: perfetto.protos.ConsumerPort.ReadBuffersCallback): void;
            public readBuffers(request: perfetto.protos.IReadBuffersRequest): Promise<perfetto.protos.ReadBuffersResponse>;
            public freeBuffers(request: perfetto.protos.IFreeBuffersRequest, callback: perfetto.protos.ConsumerPort.FreeBuffersCallback): void;
            public freeBuffers(request: perfetto.protos.IFreeBuffersRequest): Promise<perfetto.protos.FreeBuffersResponse>;
            public flush(request: perfetto.protos.IFlushRequest, callback: perfetto.protos.ConsumerPort.FlushCallback): void;
            public flush(request: perfetto.protos.IFlushRequest): Promise<perfetto.protos.FlushResponse>;
            public startTracing(request: perfetto.protos.IStartTracingRequest, callback: perfetto.protos.ConsumerPort.StartTracingCallback): void;
            public startTracing(request: perfetto.protos.IStartTracingRequest): Promise<perfetto.protos.StartTracingResponse>;
            public changeTraceConfig(request: perfetto.protos.IChangeTraceConfigRequest, callback: perfetto.protos.ConsumerPort.ChangeTraceConfigCallback): void;
            public changeTraceConfig(request: perfetto.protos.IChangeTraceConfigRequest): Promise<perfetto.protos.ChangeTraceConfigResponse>;
            public detach(request: perfetto.protos.IDetachRequest, callback: perfetto.protos.ConsumerPort.DetachCallback): void;
            public detach(request: perfetto.protos.IDetachRequest): Promise<perfetto.protos.DetachResponse>;
            public attach(request: perfetto.protos.IAttachRequest, callback: perfetto.protos.ConsumerPort.AttachCallback): void;
            public attach(request: perfetto.protos.IAttachRequest): Promise<perfetto.protos.AttachResponse>;
            public getTraceStats(request: perfetto.protos.IGetTraceStatsRequest, callback: perfetto.protos.ConsumerPort.GetTraceStatsCallback): void;
            public getTraceStats(request: perfetto.protos.IGetTraceStatsRequest): Promise<perfetto.protos.GetTraceStatsResponse>;
            public observeEvents(request: perfetto.protos.IObserveEventsRequest, callback: perfetto.protos.ConsumerPort.ObserveEventsCallback): void;
            public observeEvents(request: perfetto.protos.IObserveEventsRequest): Promise<perfetto.protos.ObserveEventsResponse>;
            public queryServiceState(request: perfetto.protos.IQueryServiceStateRequest, callback: perfetto.protos.ConsumerPort.QueryServiceStateCallback): void;
            public queryServiceState(request: perfetto.protos.IQueryServiceStateRequest): Promise<perfetto.protos.QueryServiceStateResponse>;
            public queryCapabilities(request: perfetto.protos.IQueryCapabilitiesRequest, callback: perfetto.protos.ConsumerPort.QueryCapabilitiesCallback): void;
            public queryCapabilities(request: perfetto.protos.IQueryCapabilitiesRequest): Promise<perfetto.protos.QueryCapabilitiesResponse>;
            public saveTraceForBugreport(request: perfetto.protos.ISaveTraceForBugreportRequest, callback: perfetto.protos.ConsumerPort.SaveTraceForBugreportCallback): void;
            public saveTraceForBugreport(request: perfetto.protos.ISaveTraceForBugreportRequest): Promise<perfetto.protos.SaveTraceForBugreportResponse>;
            public cloneSession(request: perfetto.protos.ICloneSessionRequest, callback: perfetto.protos.ConsumerPort.CloneSessionCallback): void;
            public cloneSession(request: perfetto.protos.ICloneSessionRequest): Promise<perfetto.protos.CloneSessionResponse>;
        }

        namespace ConsumerPort {

            type EnableTracingCallback = (error: (Error|null), response?: perfetto.protos.EnableTracingResponse) => void;

            type DisableTracingCallback = (error: (Error|null), response?: perfetto.protos.DisableTracingResponse) => void;

            type ReadBuffersCallback = (error: (Error|null), response?: perfetto.protos.ReadBuffersResponse) => void;

            type FreeBuffersCallback = (error: (Error|null), response?: perfetto.protos.FreeBuffersResponse) => void;

            type FlushCallback = (error: (Error|null), response?: perfetto.protos.FlushResponse) => void;

            type StartTracingCallback = (error: (Error|null), response?: perfetto.protos.StartTracingResponse) => void;

            type ChangeTraceConfigCallback = (error: (Error|null), response?: perfetto.protos.ChangeTraceConfigResponse) => void;

            type DetachCallback = (error: (Error|null), response?: perfetto.protos.DetachResponse) => void;

            type AttachCallback = (error: (Error|null), response?: perfetto.protos.AttachResponse) => void;

            type GetTraceStatsCallback = (error: (Error|null), response?: perfetto.protos.GetTraceStatsResponse) => void;

            type ObserveEventsCallback = (error: (Error|null), response?: perfetto.protos.ObserveEventsResponse) => void;

            type QueryServiceStateCallback = (error: (Error|null), response?: perfetto.protos.QueryServiceStateResponse) => void;

            type QueryCapabilitiesCallback = (error: (Error|null), response?: perfetto.protos.QueryCapabilitiesResponse) => void;

            type SaveTraceForBugreportCallback = (error: (Error|null), response?: perfetto.protos.SaveTraceForBugreportResponse) => void;

            type CloneSessionCallback = (error: (Error|null), response?: perfetto.protos.CloneSessionResponse) => void;
        }

        interface IEnableTracingRequest {
            traceConfig?: (perfetto.protos.ITraceConfig|null);
            attachNotificationOnly?: (boolean|null);
        }

        class EnableTracingRequest implements IEnableTracingRequest {
            constructor(p?: perfetto.protos.IEnableTracingRequest);
            public traceConfig?: (perfetto.protos.ITraceConfig|null);
            public attachNotificationOnly: boolean;
            public static create(properties?: perfetto.protos.IEnableTracingRequest): perfetto.protos.EnableTracingRequest;
            public static encode(m: perfetto.protos.IEnableTracingRequest, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.EnableTracingRequest;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.EnableTracingRequest;
            public static toObject(m: perfetto.protos.EnableTracingRequest, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IEnableTracingResponse {
            disabled?: (boolean|null);
            error?: (string|null);
        }

        class EnableTracingResponse implements IEnableTracingResponse {
            constructor(p?: perfetto.protos.IEnableTracingResponse);
            public disabled?: (boolean|null);
            public error: string;
            public state?: "disabled";
            public static create(properties?: perfetto.protos.IEnableTracingResponse): perfetto.protos.EnableTracingResponse;
            public static encode(m: perfetto.protos.IEnableTracingResponse, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.EnableTracingResponse;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.EnableTracingResponse;
            public static toObject(m: perfetto.protos.EnableTracingResponse, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IStartTracingRequest {
        }

        class StartTracingRequest implements IStartTracingRequest {
            constructor(p?: perfetto.protos.IStartTracingRequest);
            public static create(properties?: perfetto.protos.IStartTracingRequest): perfetto.protos.StartTracingRequest;
            public static encode(m: perfetto.protos.IStartTracingRequest, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.StartTracingRequest;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.StartTracingRequest;
            public static toObject(m: perfetto.protos.StartTracingRequest, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IStartTracingResponse {
        }

        class StartTracingResponse implements IStartTracingResponse {
            constructor(p?: perfetto.protos.IStartTracingResponse);
            public static create(properties?: perfetto.protos.IStartTracingResponse): perfetto.protos.StartTracingResponse;
            public static encode(m: perfetto.protos.IStartTracingResponse, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.StartTracingResponse;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.StartTracingResponse;
            public static toObject(m: perfetto.protos.StartTracingResponse, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IChangeTraceConfigRequest {
            traceConfig?: (perfetto.protos.ITraceConfig|null);
        }

        class ChangeTraceConfigRequest implements IChangeTraceConfigRequest {
            constructor(p?: perfetto.protos.IChangeTraceConfigRequest);
            public traceConfig?: (perfetto.protos.ITraceConfig|null);
            public static create(properties?: perfetto.protos.IChangeTraceConfigRequest): perfetto.protos.ChangeTraceConfigRequest;
            public static encode(m: perfetto.protos.IChangeTraceConfigRequest, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.ChangeTraceConfigRequest;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.ChangeTraceConfigRequest;
            public static toObject(m: perfetto.protos.ChangeTraceConfigRequest, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IChangeTraceConfigResponse {
        }

        class ChangeTraceConfigResponse implements IChangeTraceConfigResponse {
            constructor(p?: perfetto.protos.IChangeTraceConfigResponse);
            public static create(properties?: perfetto.protos.IChangeTraceConfigResponse): perfetto.protos.ChangeTraceConfigResponse;
            public static encode(m: perfetto.protos.IChangeTraceConfigResponse, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.ChangeTraceConfigResponse;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.ChangeTraceConfigResponse;
            public static toObject(m: perfetto.protos.ChangeTraceConfigResponse, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IDisableTracingRequest {
        }

        class DisableTracingRequest implements IDisableTracingRequest {
            constructor(p?: perfetto.protos.IDisableTracingRequest);
            public static create(properties?: perfetto.protos.IDisableTracingRequest): perfetto.protos.DisableTracingRequest;
            public static encode(m: perfetto.protos.IDisableTracingRequest, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.DisableTracingRequest;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.DisableTracingRequest;
            public static toObject(m: perfetto.protos.DisableTracingRequest, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IDisableTracingResponse {
        }

        class DisableTracingResponse implements IDisableTracingResponse {
            constructor(p?: perfetto.protos.IDisableTracingResponse);
            public static create(properties?: perfetto.protos.IDisableTracingResponse): perfetto.protos.DisableTracingResponse;
            public static encode(m: perfetto.protos.IDisableTracingResponse, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.DisableTracingResponse;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.DisableTracingResponse;
            public static toObject(m: perfetto.protos.DisableTracingResponse, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IReadBuffersRequest {
        }

        class ReadBuffersRequest implements IReadBuffersRequest {
            constructor(p?: perfetto.protos.IReadBuffersRequest);
            public static create(properties?: perfetto.protos.IReadBuffersRequest): perfetto.protos.ReadBuffersRequest;
            public static encode(m: perfetto.protos.IReadBuffersRequest, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.ReadBuffersRequest;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.ReadBuffersRequest;
            public static toObject(m: perfetto.protos.ReadBuffersRequest, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IReadBuffersResponse {
            slices?: (perfetto.protos.ReadBuffersResponse.ISlice[]|null);
        }

        class ReadBuffersResponse implements IReadBuffersResponse {
            constructor(p?: perfetto.protos.IReadBuffersResponse);
            public slices: perfetto.protos.ReadBuffersResponse.ISlice[];
            public static create(properties?: perfetto.protos.IReadBuffersResponse): perfetto.protos.ReadBuffersResponse;
            public static encode(m: perfetto.protos.IReadBuffersResponse, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.ReadBuffersResponse;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.ReadBuffersResponse;
            public static toObject(m: perfetto.protos.ReadBuffersResponse, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace ReadBuffersResponse {

            interface ISlice {
                data?: (Uint8Array|null);
                lastSliceForPacket?: (boolean|null);
            }

            class Slice implements ISlice {
                constructor(p?: perfetto.protos.ReadBuffersResponse.ISlice);
                public data: Uint8Array;
                public lastSliceForPacket: boolean;
                public static create(properties?: perfetto.protos.ReadBuffersResponse.ISlice): perfetto.protos.ReadBuffersResponse.Slice;
                public static encode(m: perfetto.protos.ReadBuffersResponse.ISlice, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.ReadBuffersResponse.Slice;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.ReadBuffersResponse.Slice;
                public static toObject(m: perfetto.protos.ReadBuffersResponse.Slice, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }
        }

        interface IFreeBuffersRequest {
            bufferIds?: (number[]|null);
        }

        class FreeBuffersRequest implements IFreeBuffersRequest {
            constructor(p?: perfetto.protos.IFreeBuffersRequest);
            public bufferIds: number[];
            public static create(properties?: perfetto.protos.IFreeBuffersRequest): perfetto.protos.FreeBuffersRequest;
            public static encode(m: perfetto.protos.IFreeBuffersRequest, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.FreeBuffersRequest;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.FreeBuffersRequest;
            public static toObject(m: perfetto.protos.FreeBuffersRequest, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IFreeBuffersResponse {
        }

        class FreeBuffersResponse implements IFreeBuffersResponse {
            constructor(p?: perfetto.protos.IFreeBuffersResponse);
            public static create(properties?: perfetto.protos.IFreeBuffersResponse): perfetto.protos.FreeBuffersResponse;
            public static encode(m: perfetto.protos.IFreeBuffersResponse, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.FreeBuffersResponse;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.FreeBuffersResponse;
            public static toObject(m: perfetto.protos.FreeBuffersResponse, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IFlushRequest {
            timeoutMs?: (number|null);
            flags?: (number|null);
        }

        class FlushRequest implements IFlushRequest {
            constructor(p?: perfetto.protos.IFlushRequest);
            public timeoutMs: number;
            public flags: number;
            public static create(properties?: perfetto.protos.IFlushRequest): perfetto.protos.FlushRequest;
            public static encode(m: perfetto.protos.IFlushRequest, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.FlushRequest;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.FlushRequest;
            public static toObject(m: perfetto.protos.FlushRequest, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IFlushResponse {
        }

        class FlushResponse implements IFlushResponse {
            constructor(p?: perfetto.protos.IFlushResponse);
            public static create(properties?: perfetto.protos.IFlushResponse): perfetto.protos.FlushResponse;
            public static encode(m: perfetto.protos.IFlushResponse, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.FlushResponse;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.FlushResponse;
            public static toObject(m: perfetto.protos.FlushResponse, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IDetachRequest {
            key?: (string|null);
        }

        class DetachRequest implements IDetachRequest {
            constructor(p?: perfetto.protos.IDetachRequest);
            public key: string;
            public static create(properties?: perfetto.protos.IDetachRequest): perfetto.protos.DetachRequest;
            public static encode(m: perfetto.protos.IDetachRequest, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.DetachRequest;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.DetachRequest;
            public static toObject(m: perfetto.protos.DetachRequest, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IDetachResponse {
        }

        class DetachResponse implements IDetachResponse {
            constructor(p?: perfetto.protos.IDetachResponse);
            public static create(properties?: perfetto.protos.IDetachResponse): perfetto.protos.DetachResponse;
            public static encode(m: perfetto.protos.IDetachResponse, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.DetachResponse;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.DetachResponse;
            public static toObject(m: perfetto.protos.DetachResponse, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IAttachRequest {
            key?: (string|null);
        }

        class AttachRequest implements IAttachRequest {
            constructor(p?: perfetto.protos.IAttachRequest);
            public key: string;
            public static create(properties?: perfetto.protos.IAttachRequest): perfetto.protos.AttachRequest;
            public static encode(m: perfetto.protos.IAttachRequest, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.AttachRequest;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.AttachRequest;
            public static toObject(m: perfetto.protos.AttachRequest, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IAttachResponse {
            traceConfig?: (perfetto.protos.ITraceConfig|null);
        }

        class AttachResponse implements IAttachResponse {
            constructor(p?: perfetto.protos.IAttachResponse);
            public traceConfig?: (perfetto.protos.ITraceConfig|null);
            public static create(properties?: perfetto.protos.IAttachResponse): perfetto.protos.AttachResponse;
            public static encode(m: perfetto.protos.IAttachResponse, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.AttachResponse;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.AttachResponse;
            public static toObject(m: perfetto.protos.AttachResponse, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IGetTraceStatsRequest {
        }

        class GetTraceStatsRequest implements IGetTraceStatsRequest {
            constructor(p?: perfetto.protos.IGetTraceStatsRequest);
            public static create(properties?: perfetto.protos.IGetTraceStatsRequest): perfetto.protos.GetTraceStatsRequest;
            public static encode(m: perfetto.protos.IGetTraceStatsRequest, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.GetTraceStatsRequest;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.GetTraceStatsRequest;
            public static toObject(m: perfetto.protos.GetTraceStatsRequest, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IGetTraceStatsResponse {
            traceStats?: (perfetto.protos.ITraceStats|null);
        }

        class GetTraceStatsResponse implements IGetTraceStatsResponse {
            constructor(p?: perfetto.protos.IGetTraceStatsResponse);
            public traceStats?: (perfetto.protos.ITraceStats|null);
            public static create(properties?: perfetto.protos.IGetTraceStatsResponse): perfetto.protos.GetTraceStatsResponse;
            public static encode(m: perfetto.protos.IGetTraceStatsResponse, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.GetTraceStatsResponse;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.GetTraceStatsResponse;
            public static toObject(m: perfetto.protos.GetTraceStatsResponse, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IObserveEventsRequest {
            eventsToObserve?: (perfetto.protos.ObservableEvents.Type[]|null);
        }

        class ObserveEventsRequest implements IObserveEventsRequest {
            constructor(p?: perfetto.protos.IObserveEventsRequest);
            public eventsToObserve: perfetto.protos.ObservableEvents.Type[];
            public static create(properties?: perfetto.protos.IObserveEventsRequest): perfetto.protos.ObserveEventsRequest;
            public static encode(m: perfetto.protos.IObserveEventsRequest, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.ObserveEventsRequest;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.ObserveEventsRequest;
            public static toObject(m: perfetto.protos.ObserveEventsRequest, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IObserveEventsResponse {
            events?: (perfetto.protos.IObservableEvents|null);
        }

        class ObserveEventsResponse implements IObserveEventsResponse {
            constructor(p?: perfetto.protos.IObserveEventsResponse);
            public events?: (perfetto.protos.IObservableEvents|null);
            public static create(properties?: perfetto.protos.IObserveEventsResponse): perfetto.protos.ObserveEventsResponse;
            public static encode(m: perfetto.protos.IObserveEventsResponse, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.ObserveEventsResponse;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.ObserveEventsResponse;
            public static toObject(m: perfetto.protos.ObserveEventsResponse, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IQueryServiceStateRequest {
            sessionsOnly?: (boolean|null);
        }

        class QueryServiceStateRequest implements IQueryServiceStateRequest {
            constructor(p?: perfetto.protos.IQueryServiceStateRequest);
            public sessionsOnly: boolean;
            public static create(properties?: perfetto.protos.IQueryServiceStateRequest): perfetto.protos.QueryServiceStateRequest;
            public static encode(m: perfetto.protos.IQueryServiceStateRequest, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.QueryServiceStateRequest;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.QueryServiceStateRequest;
            public static toObject(m: perfetto.protos.QueryServiceStateRequest, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IQueryServiceStateResponse {
            serviceState?: (perfetto.protos.ITracingServiceState|null);
        }

        class QueryServiceStateResponse implements IQueryServiceStateResponse {
            constructor(p?: perfetto.protos.IQueryServiceStateResponse);
            public serviceState?: (perfetto.protos.ITracingServiceState|null);
            public static create(properties?: perfetto.protos.IQueryServiceStateResponse): perfetto.protos.QueryServiceStateResponse;
            public static encode(m: perfetto.protos.IQueryServiceStateResponse, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.QueryServiceStateResponse;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.QueryServiceStateResponse;
            public static toObject(m: perfetto.protos.QueryServiceStateResponse, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IQueryCapabilitiesRequest {
        }

        class QueryCapabilitiesRequest implements IQueryCapabilitiesRequest {
            constructor(p?: perfetto.protos.IQueryCapabilitiesRequest);
            public static create(properties?: perfetto.protos.IQueryCapabilitiesRequest): perfetto.protos.QueryCapabilitiesRequest;
            public static encode(m: perfetto.protos.IQueryCapabilitiesRequest, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.QueryCapabilitiesRequest;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.QueryCapabilitiesRequest;
            public static toObject(m: perfetto.protos.QueryCapabilitiesRequest, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IQueryCapabilitiesResponse {
            capabilities?: (perfetto.protos.ITracingServiceCapabilities|null);
        }

        class QueryCapabilitiesResponse implements IQueryCapabilitiesResponse {
            constructor(p?: perfetto.protos.IQueryCapabilitiesResponse);
            public capabilities?: (perfetto.protos.ITracingServiceCapabilities|null);
            public static create(properties?: perfetto.protos.IQueryCapabilitiesResponse): perfetto.protos.QueryCapabilitiesResponse;
            public static encode(m: perfetto.protos.IQueryCapabilitiesResponse, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.QueryCapabilitiesResponse;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.QueryCapabilitiesResponse;
            public static toObject(m: perfetto.protos.QueryCapabilitiesResponse, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface ISaveTraceForBugreportRequest {
        }

        class SaveTraceForBugreportRequest implements ISaveTraceForBugreportRequest {
            constructor(p?: perfetto.protos.ISaveTraceForBugreportRequest);
            public static create(properties?: perfetto.protos.ISaveTraceForBugreportRequest): perfetto.protos.SaveTraceForBugreportRequest;
            public static encode(m: perfetto.protos.ISaveTraceForBugreportRequest, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.SaveTraceForBugreportRequest;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.SaveTraceForBugreportRequest;
            public static toObject(m: perfetto.protos.SaveTraceForBugreportRequest, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface ISaveTraceForBugreportResponse {
            success?: (boolean|null);
            msg?: (string|null);
        }

        class SaveTraceForBugreportResponse implements ISaveTraceForBugreportResponse {
            constructor(p?: perfetto.protos.ISaveTraceForBugreportResponse);
            public success: boolean;
            public msg: string;
            public static create(properties?: perfetto.protos.ISaveTraceForBugreportResponse): perfetto.protos.SaveTraceForBugreportResponse;
            public static encode(m: perfetto.protos.ISaveTraceForBugreportResponse, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.SaveTraceForBugreportResponse;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.SaveTraceForBugreportResponse;
            public static toObject(m: perfetto.protos.SaveTraceForBugreportResponse, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface ICloneSessionRequest {
            sessionId?: (number|null);
            uniqueSessionName?: (string|null);
            skipTraceFilter?: (boolean|null);
            forBugreport?: (boolean|null);
            cloneTriggerName?: (string|null);
            cloneTriggerProducerName?: (string|null);
            cloneTriggerTrustedProducerUid?: (number|null);
            cloneTriggerBootTimeNs?: (number|null);
        }

        class CloneSessionRequest implements ICloneSessionRequest {
            constructor(p?: perfetto.protos.ICloneSessionRequest);
            public sessionId?: (number|null);
            public uniqueSessionName?: (string|null);
            public skipTraceFilter: boolean;
            public forBugreport: boolean;
            public cloneTriggerName: string;
            public cloneTriggerProducerName: string;
            public cloneTriggerTrustedProducerUid: number;
            public cloneTriggerBootTimeNs: number;
            public selector?: ("sessionId"|"uniqueSessionName");
            public static create(properties?: perfetto.protos.ICloneSessionRequest): perfetto.protos.CloneSessionRequest;
            public static encode(m: perfetto.protos.ICloneSessionRequest, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.CloneSessionRequest;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.CloneSessionRequest;
            public static toObject(m: perfetto.protos.CloneSessionRequest, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface ICloneSessionResponse {
            success?: (boolean|null);
            error?: (string|null);
            uuidMsb?: (number|null);
            uuidLsb?: (number|null);
        }

        class CloneSessionResponse implements ICloneSessionResponse {
            constructor(p?: perfetto.protos.ICloneSessionResponse);
            public success: boolean;
            public error: string;
            public uuidMsb: number;
            public uuidLsb: number;
            public static create(properties?: perfetto.protos.ICloneSessionResponse): perfetto.protos.CloneSessionResponse;
            public static encode(m: perfetto.protos.ICloneSessionResponse, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.CloneSessionResponse;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.CloneSessionResponse;
            public static toObject(m: perfetto.protos.CloneSessionResponse, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IObservableEvents {
            instanceStateChanges?: (perfetto.protos.ObservableEvents.IDataSourceInstanceStateChange[]|null);
            allDataSourcesStarted?: (boolean|null);
            cloneTriggerHit?: (perfetto.protos.ObservableEvents.ICloneTriggerHit|null);
        }

        class ObservableEvents implements IObservableEvents {
            constructor(p?: perfetto.protos.IObservableEvents);
            public instanceStateChanges: perfetto.protos.ObservableEvents.IDataSourceInstanceStateChange[];
            public allDataSourcesStarted: boolean;
            public cloneTriggerHit?: (perfetto.protos.ObservableEvents.ICloneTriggerHit|null);
            public static create(properties?: perfetto.protos.IObservableEvents): perfetto.protos.ObservableEvents;
            public static encode(m: perfetto.protos.IObservableEvents, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.ObservableEvents;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.ObservableEvents;
            public static toObject(m: perfetto.protos.ObservableEvents, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace ObservableEvents {

            enum Type {
                TYPE_UNSPECIFIED = 0,
                TYPE_DATA_SOURCES_INSTANCES = 1,
                TYPE_ALL_DATA_SOURCES_STARTED = 2,
                TYPE_CLONE_TRIGGER_HIT = 4
            }

            enum DataSourceInstanceState {
                DATA_SOURCE_INSTANCE_STATE_STOPPED = 1,
                DATA_SOURCE_INSTANCE_STATE_STARTED = 2
            }

            interface IDataSourceInstanceStateChange {
                producerName?: (string|null);
                dataSourceName?: (string|null);
                state?: (perfetto.protos.ObservableEvents.DataSourceInstanceState|null);
            }

            class DataSourceInstanceStateChange implements IDataSourceInstanceStateChange {
                constructor(p?: perfetto.protos.ObservableEvents.IDataSourceInstanceStateChange);
                public producerName: string;
                public dataSourceName: string;
                public state: perfetto.protos.ObservableEvents.DataSourceInstanceState;
                public static create(properties?: perfetto.protos.ObservableEvents.IDataSourceInstanceStateChange): perfetto.protos.ObservableEvents.DataSourceInstanceStateChange;
                public static encode(m: perfetto.protos.ObservableEvents.IDataSourceInstanceStateChange, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.ObservableEvents.DataSourceInstanceStateChange;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.ObservableEvents.DataSourceInstanceStateChange;
                public static toObject(m: perfetto.protos.ObservableEvents.DataSourceInstanceStateChange, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            interface ICloneTriggerHit {
                tracingSessionId?: (number|null);
                triggerName?: (string|null);
                producerName?: (string|null);
                producerUid?: (number|null);
                bootTimeNs?: (number|null);
            }

            class CloneTriggerHit implements ICloneTriggerHit {
                constructor(p?: perfetto.protos.ObservableEvents.ICloneTriggerHit);
                public tracingSessionId: number;
                public triggerName: string;
                public producerName: string;
                public producerUid: number;
                public bootTimeNs: number;
                public static create(properties?: perfetto.protos.ObservableEvents.ICloneTriggerHit): perfetto.protos.ObservableEvents.CloneTriggerHit;
                public static encode(m: perfetto.protos.ObservableEvents.ICloneTriggerHit, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.ObservableEvents.CloneTriggerHit;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.ObservableEvents.CloneTriggerHit;
                public static toObject(m: perfetto.protos.ObservableEvents.CloneTriggerHit, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }
        }

        interface ITracingServiceState {
            producers?: (perfetto.protos.TracingServiceState.IProducer[]|null);
            dataSources?: (perfetto.protos.TracingServiceState.IDataSource[]|null);
            tracingSessions?: (perfetto.protos.TracingServiceState.ITracingSession[]|null);
            supportsTracingSessions?: (boolean|null);
            numSessions?: (number|null);
            numSessionsStarted?: (number|null);
            tracingServiceVersion?: (string|null);
        }

        class TracingServiceState implements ITracingServiceState {
            constructor(p?: perfetto.protos.ITracingServiceState);
            public producers: perfetto.protos.TracingServiceState.IProducer[];
            public dataSources: perfetto.protos.TracingServiceState.IDataSource[];
            public tracingSessions: perfetto.protos.TracingServiceState.ITracingSession[];
            public supportsTracingSessions: boolean;
            public numSessions: number;
            public numSessionsStarted: number;
            public tracingServiceVersion: string;
            public static create(properties?: perfetto.protos.ITracingServiceState): perfetto.protos.TracingServiceState;
            public static encode(m: perfetto.protos.ITracingServiceState, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.TracingServiceState;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.TracingServiceState;
            public static toObject(m: perfetto.protos.TracingServiceState, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace TracingServiceState {

            interface IProducer {
                id?: (number|null);
                name?: (string|null);
                pid?: (number|null);
                uid?: (number|null);
                sdkVersion?: (string|null);
                frozen?: (boolean|null);
            }

            class Producer implements IProducer {
                constructor(p?: perfetto.protos.TracingServiceState.IProducer);
                public id: number;
                public name: string;
                public pid: number;
                public uid: number;
                public sdkVersion: string;
                public frozen: boolean;
                public static create(properties?: perfetto.protos.TracingServiceState.IProducer): perfetto.protos.TracingServiceState.Producer;
                public static encode(m: perfetto.protos.TracingServiceState.IProducer, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.TracingServiceState.Producer;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.TracingServiceState.Producer;
                public static toObject(m: perfetto.protos.TracingServiceState.Producer, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            interface IDataSource {
                dsDescriptor?: (perfetto.protos.IDataSourceDescriptor|null);
                producerId?: (number|null);
            }

            class DataSource implements IDataSource {
                constructor(p?: perfetto.protos.TracingServiceState.IDataSource);
                public dsDescriptor?: (perfetto.protos.IDataSourceDescriptor|null);
                public producerId: number;
                public static create(properties?: perfetto.protos.TracingServiceState.IDataSource): perfetto.protos.TracingServiceState.DataSource;
                public static encode(m: perfetto.protos.TracingServiceState.IDataSource, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.TracingServiceState.DataSource;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.TracingServiceState.DataSource;
                public static toObject(m: perfetto.protos.TracingServiceState.DataSource, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            interface ITracingSession {
                id?: (number|null);
                consumerUid?: (number|null);
                state?: (string|null);
                uniqueSessionName?: (string|null);
                bufferSizeKb?: (number[]|null);
                durationMs?: (number|null);
                numDataSources?: (number|null);
                startRealtimeNs?: (number|null);
                bugreportScore?: (number|null);
                bugreportFilename?: (string|null);
                isStarted?: (boolean|null);
            }

            class TracingSession implements ITracingSession {
                constructor(p?: perfetto.protos.TracingServiceState.ITracingSession);
                public id: number;
                public consumerUid: number;
                public state: string;
                public uniqueSessionName: string;
                public bufferSizeKb: number[];
                public durationMs: number;
                public numDataSources: number;
                public startRealtimeNs: number;
                public bugreportScore: number;
                public bugreportFilename: string;
                public isStarted: boolean;
                public static create(properties?: perfetto.protos.TracingServiceState.ITracingSession): perfetto.protos.TracingServiceState.TracingSession;
                public static encode(m: perfetto.protos.TracingServiceState.ITracingSession, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.TracingServiceState.TracingSession;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.TracingServiceState.TracingSession;
                public static toObject(m: perfetto.protos.TracingServiceState.TracingSession, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }
        }

        interface IDataSourceDescriptor {
            name?: (string|null);
            id?: (number|null);
            willNotifyOnStop?: (boolean|null);
            willNotifyOnStart?: (boolean|null);
            handlesIncrementalStateClear?: (boolean|null);
            noFlush?: (boolean|null);
            gpuCounterDescriptor?: (perfetto.protos.IGpuCounterDescriptor|null);
            trackEventDescriptor?: (perfetto.protos.ITrackEventDescriptor|null);
            ftraceDescriptor?: (perfetto.protos.IFtraceDescriptor|null);
        }

        class DataSourceDescriptor implements IDataSourceDescriptor {
            constructor(p?: perfetto.protos.IDataSourceDescriptor);
            public name: string;
            public id: number;
            public willNotifyOnStop: boolean;
            public willNotifyOnStart: boolean;
            public handlesIncrementalStateClear: boolean;
            public noFlush: boolean;
            public gpuCounterDescriptor?: (perfetto.protos.IGpuCounterDescriptor|null);
            public trackEventDescriptor?: (perfetto.protos.ITrackEventDescriptor|null);
            public ftraceDescriptor?: (perfetto.protos.IFtraceDescriptor|null);
            public static create(properties?: perfetto.protos.IDataSourceDescriptor): perfetto.protos.DataSourceDescriptor;
            public static encode(m: perfetto.protos.IDataSourceDescriptor, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.DataSourceDescriptor;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.DataSourceDescriptor;
            public static toObject(m: perfetto.protos.DataSourceDescriptor, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IFtraceDescriptor {
            atraceCategories?: (perfetto.protos.FtraceDescriptor.IAtraceCategory[]|null);
        }

        class FtraceDescriptor implements IFtraceDescriptor {
            constructor(p?: perfetto.protos.IFtraceDescriptor);
            public atraceCategories: perfetto.protos.FtraceDescriptor.IAtraceCategory[];
            public static create(properties?: perfetto.protos.IFtraceDescriptor): perfetto.protos.FtraceDescriptor;
            public static encode(m: perfetto.protos.IFtraceDescriptor, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.FtraceDescriptor;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.FtraceDescriptor;
            public static toObject(m: perfetto.protos.FtraceDescriptor, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace FtraceDescriptor {

            interface IAtraceCategory {
                name?: (string|null);
                description?: (string|null);
            }

            class AtraceCategory implements IAtraceCategory {
                constructor(p?: perfetto.protos.FtraceDescriptor.IAtraceCategory);
                public name: string;
                public description: string;
                public static create(properties?: perfetto.protos.FtraceDescriptor.IAtraceCategory): perfetto.protos.FtraceDescriptor.AtraceCategory;
                public static encode(m: perfetto.protos.FtraceDescriptor.IAtraceCategory, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.FtraceDescriptor.AtraceCategory;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.FtraceDescriptor.AtraceCategory;
                public static toObject(m: perfetto.protos.FtraceDescriptor.AtraceCategory, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }
        }

        interface IGpuCounterDescriptor {
            specs?: (perfetto.protos.GpuCounterDescriptor.IGpuCounterSpec[]|null);
            blocks?: (perfetto.protos.GpuCounterDescriptor.IGpuCounterBlock[]|null);
            minSamplingPeriodNs?: (number|null);
            maxSamplingPeriodNs?: (number|null);
            supportsInstrumentedSampling?: (boolean|null);
        }

        class GpuCounterDescriptor implements IGpuCounterDescriptor {
            constructor(p?: perfetto.protos.IGpuCounterDescriptor);
            public specs: perfetto.protos.GpuCounterDescriptor.IGpuCounterSpec[];
            public blocks: perfetto.protos.GpuCounterDescriptor.IGpuCounterBlock[];
            public minSamplingPeriodNs: number;
            public maxSamplingPeriodNs: number;
            public supportsInstrumentedSampling: boolean;
            public static create(properties?: perfetto.protos.IGpuCounterDescriptor): perfetto.protos.GpuCounterDescriptor;
            public static encode(m: perfetto.protos.IGpuCounterDescriptor, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.GpuCounterDescriptor;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.GpuCounterDescriptor;
            public static toObject(m: perfetto.protos.GpuCounterDescriptor, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace GpuCounterDescriptor {

            enum GpuCounterGroup {
                UNCLASSIFIED = 0,
                SYSTEM = 1,
                VERTICES = 2,
                FRAGMENTS = 3,
                PRIMITIVES = 4,
                MEMORY = 5,
                COMPUTE = 6
            }

            interface IGpuCounterSpec {
                counterId?: (number|null);
                name?: (string|null);
                description?: (string|null);
                intPeakValue?: (number|null);
                doublePeakValue?: (number|null);
                numeratorUnits?: (perfetto.protos.GpuCounterDescriptor.MeasureUnit[]|null);
                denominatorUnits?: (perfetto.protos.GpuCounterDescriptor.MeasureUnit[]|null);
                selectByDefault?: (boolean|null);
                groups?: (perfetto.protos.GpuCounterDescriptor.GpuCounterGroup[]|null);
            }

            class GpuCounterSpec implements IGpuCounterSpec {
                constructor(p?: perfetto.protos.GpuCounterDescriptor.IGpuCounterSpec);
                public counterId: number;
                public name: string;
                public description: string;
                public intPeakValue?: (number|null);
                public doublePeakValue?: (number|null);
                public numeratorUnits: perfetto.protos.GpuCounterDescriptor.MeasureUnit[];
                public denominatorUnits: perfetto.protos.GpuCounterDescriptor.MeasureUnit[];
                public selectByDefault: boolean;
                public groups: perfetto.protos.GpuCounterDescriptor.GpuCounterGroup[];
                public peakValue?: ("intPeakValue"|"doublePeakValue");
                public static create(properties?: perfetto.protos.GpuCounterDescriptor.IGpuCounterSpec): perfetto.protos.GpuCounterDescriptor.GpuCounterSpec;
                public static encode(m: perfetto.protos.GpuCounterDescriptor.IGpuCounterSpec, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.GpuCounterDescriptor.GpuCounterSpec;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.GpuCounterDescriptor.GpuCounterSpec;
                public static toObject(m: perfetto.protos.GpuCounterDescriptor.GpuCounterSpec, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            interface IGpuCounterBlock {
                blockId?: (number|null);
                blockCapacity?: (number|null);
                name?: (string|null);
                description?: (string|null);
                counterIds?: (number[]|null);
            }

            class GpuCounterBlock implements IGpuCounterBlock {
                constructor(p?: perfetto.protos.GpuCounterDescriptor.IGpuCounterBlock);
                public blockId: number;
                public blockCapacity: number;
                public name: string;
                public description: string;
                public counterIds: number[];
                public static create(properties?: perfetto.protos.GpuCounterDescriptor.IGpuCounterBlock): perfetto.protos.GpuCounterDescriptor.GpuCounterBlock;
                public static encode(m: perfetto.protos.GpuCounterDescriptor.IGpuCounterBlock, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.GpuCounterDescriptor.GpuCounterBlock;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.GpuCounterDescriptor.GpuCounterBlock;
                public static toObject(m: perfetto.protos.GpuCounterDescriptor.GpuCounterBlock, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            enum MeasureUnit {
                NONE = 0,
                BIT = 1,
                KILOBIT = 2,
                MEGABIT = 3,
                GIGABIT = 4,
                TERABIT = 5,
                PETABIT = 6,
                BYTE = 7,
                KILOBYTE = 8,
                MEGABYTE = 9,
                GIGABYTE = 10,
                TERABYTE = 11,
                PETABYTE = 12,
                HERTZ = 13,
                KILOHERTZ = 14,
                MEGAHERTZ = 15,
                GIGAHERTZ = 16,
                TERAHERTZ = 17,
                PETAHERTZ = 18,
                NANOSECOND = 19,
                MICROSECOND = 20,
                MILLISECOND = 21,
                SECOND = 22,
                MINUTE = 23,
                HOUR = 24,
                VERTEX = 25,
                PIXEL = 26,
                TRIANGLE = 27,
                PRIMITIVE = 38,
                FRAGMENT = 39,
                MILLIWATT = 28,
                WATT = 29,
                KILOWATT = 30,
                JOULE = 31,
                VOLT = 32,
                AMPERE = 33,
                CELSIUS = 34,
                FAHRENHEIT = 35,
                KELVIN = 36,
                PERCENT = 37,
                INSTRUCTION = 40
            }
        }

        interface ITrackEventCategory {
            name?: (string|null);
            description?: (string|null);
            tags?: (string[]|null);
        }

        class TrackEventCategory implements ITrackEventCategory {
            constructor(p?: perfetto.protos.ITrackEventCategory);
            public name: string;
            public description: string;
            public tags: string[];
            public static create(properties?: perfetto.protos.ITrackEventCategory): perfetto.protos.TrackEventCategory;
            public static encode(m: perfetto.protos.ITrackEventCategory, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.TrackEventCategory;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.TrackEventCategory;
            public static toObject(m: perfetto.protos.TrackEventCategory, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface ITrackEventDescriptor {
            availableCategories?: (perfetto.protos.ITrackEventCategory[]|null);
        }

        class TrackEventDescriptor implements ITrackEventDescriptor {
            constructor(p?: perfetto.protos.ITrackEventDescriptor);
            public availableCategories: perfetto.protos.ITrackEventCategory[];
            public static create(properties?: perfetto.protos.ITrackEventDescriptor): perfetto.protos.TrackEventDescriptor;
            public static encode(m: perfetto.protos.ITrackEventDescriptor, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.TrackEventDescriptor;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.TrackEventDescriptor;
            public static toObject(m: perfetto.protos.TrackEventDescriptor, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface ITracingServiceCapabilities {
            hasQueryCapabilities?: (boolean|null);
            observableEvents?: (perfetto.protos.ObservableEvents.Type[]|null);
            hasTraceConfigOutputPath?: (boolean|null);
            hasCloneSession?: (boolean|null);
        }

        class TracingServiceCapabilities implements ITracingServiceCapabilities {
            constructor(p?: perfetto.protos.ITracingServiceCapabilities);
            public hasQueryCapabilities: boolean;
            public observableEvents: perfetto.protos.ObservableEvents.Type[];
            public hasTraceConfigOutputPath: boolean;
            public hasCloneSession: boolean;
            public static create(properties?: perfetto.protos.ITracingServiceCapabilities): perfetto.protos.TracingServiceCapabilities;
            public static encode(m: perfetto.protos.ITracingServiceCapabilities, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.TracingServiceCapabilities;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.TracingServiceCapabilities;
            public static toObject(m: perfetto.protos.TracingServiceCapabilities, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface ITraceStats {
            bufferStats?: (perfetto.protos.TraceStats.IBufferStats[]|null);
            chunkPayloadHistogramDef?: (number[]|null);
            writerStats?: (perfetto.protos.TraceStats.IWriterStats[]|null);
            producersConnected?: (number|null);
            producersSeen?: (number|null);
            dataSourcesRegistered?: (number|null);
            dataSourcesSeen?: (number|null);
            tracingSessions?: (number|null);
            totalBuffers?: (number|null);
            chunksDiscarded?: (number|null);
            patchesDiscarded?: (number|null);
            invalidPackets?: (number|null);
            filterStats?: (perfetto.protos.TraceStats.IFilterStats|null);
            flushesRequested?: (number|null);
            flushesSucceeded?: (number|null);
            flushesFailed?: (number|null);
            finalFlushOutcome?: (perfetto.protos.TraceStats.FinalFlushOutcome|null);
        }

        class TraceStats implements ITraceStats {
            constructor(p?: perfetto.protos.ITraceStats);
            public bufferStats: perfetto.protos.TraceStats.IBufferStats[];
            public chunkPayloadHistogramDef: number[];
            public writerStats: perfetto.protos.TraceStats.IWriterStats[];
            public producersConnected: number;
            public producersSeen: number;
            public dataSourcesRegistered: number;
            public dataSourcesSeen: number;
            public tracingSessions: number;
            public totalBuffers: number;
            public chunksDiscarded: number;
            public patchesDiscarded: number;
            public invalidPackets: number;
            public filterStats?: (perfetto.protos.TraceStats.IFilterStats|null);
            public flushesRequested: number;
            public flushesSucceeded: number;
            public flushesFailed: number;
            public finalFlushOutcome: perfetto.protos.TraceStats.FinalFlushOutcome;
            public static create(properties?: perfetto.protos.ITraceStats): perfetto.protos.TraceStats;
            public static encode(m: perfetto.protos.ITraceStats, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.TraceStats;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.TraceStats;
            public static toObject(m: perfetto.protos.TraceStats, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace TraceStats {

            interface IBufferStats {
                bufferSize?: (number|null);
                bytesWritten?: (number|null);
                bytesOverwritten?: (number|null);
                bytesRead?: (number|null);
                paddingBytesWritten?: (number|null);
                paddingBytesCleared?: (number|null);
                chunksWritten?: (number|null);
                chunksRewritten?: (number|null);
                chunksOverwritten?: (number|null);
                chunksDiscarded?: (number|null);
                chunksRead?: (number|null);
                chunksCommittedOutOfOrder?: (number|null);
                writeWrapCount?: (number|null);
                patchesSucceeded?: (number|null);
                patchesFailed?: (number|null);
                readaheadsSucceeded?: (number|null);
                readaheadsFailed?: (number|null);
                abiViolations?: (number|null);
                traceWriterPacketLoss?: (number|null);
            }

            class BufferStats implements IBufferStats {
                constructor(p?: perfetto.protos.TraceStats.IBufferStats);
                public bufferSize: number;
                public bytesWritten: number;
                public bytesOverwritten: number;
                public bytesRead: number;
                public paddingBytesWritten: number;
                public paddingBytesCleared: number;
                public chunksWritten: number;
                public chunksRewritten: number;
                public chunksOverwritten: number;
                public chunksDiscarded: number;
                public chunksRead: number;
                public chunksCommittedOutOfOrder: number;
                public writeWrapCount: number;
                public patchesSucceeded: number;
                public patchesFailed: number;
                public readaheadsSucceeded: number;
                public readaheadsFailed: number;
                public abiViolations: number;
                public traceWriterPacketLoss: number;
                public static create(properties?: perfetto.protos.TraceStats.IBufferStats): perfetto.protos.TraceStats.BufferStats;
                public static encode(m: perfetto.protos.TraceStats.IBufferStats, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.TraceStats.BufferStats;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.TraceStats.BufferStats;
                public static toObject(m: perfetto.protos.TraceStats.BufferStats, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            interface IWriterStats {
                sequenceId?: (number|null);
                buffer?: (number|null);
                chunkPayloadHistogramCounts?: (number[]|null);
                chunkPayloadHistogramSum?: (number[]|null);
            }

            class WriterStats implements IWriterStats {
                constructor(p?: perfetto.protos.TraceStats.IWriterStats);
                public sequenceId: number;
                public buffer: number;
                public chunkPayloadHistogramCounts: number[];
                public chunkPayloadHistogramSum: number[];
                public static create(properties?: perfetto.protos.TraceStats.IWriterStats): perfetto.protos.TraceStats.WriterStats;
                public static encode(m: perfetto.protos.TraceStats.IWriterStats, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.TraceStats.WriterStats;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.TraceStats.WriterStats;
                public static toObject(m: perfetto.protos.TraceStats.WriterStats, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            interface IFilterStats {
                inputPackets?: (number|null);
                inputBytes?: (number|null);
                outputBytes?: (number|null);
                errors?: (number|null);
                timeTakenNs?: (number|null);
                bytesDiscardedPerBuffer?: (number[]|null);
            }

            class FilterStats implements IFilterStats {
                constructor(p?: perfetto.protos.TraceStats.IFilterStats);
                public inputPackets: number;
                public inputBytes: number;
                public outputBytes: number;
                public errors: number;
                public timeTakenNs: number;
                public bytesDiscardedPerBuffer: number[];
                public static create(properties?: perfetto.protos.TraceStats.IFilterStats): perfetto.protos.TraceStats.FilterStats;
                public static encode(m: perfetto.protos.TraceStats.IFilterStats, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.TraceStats.FilterStats;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.TraceStats.FilterStats;
                public static toObject(m: perfetto.protos.TraceStats.FilterStats, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            enum FinalFlushOutcome {
                FINAL_FLUSH_UNSPECIFIED = 0,
                FINAL_FLUSH_SUCCEEDED = 1,
                FINAL_FLUSH_FAILED = 2
            }
        }

        interface ITraceConfig {
            buffers?: (perfetto.protos.TraceConfig.IBufferConfig[]|null);
            dataSources?: (perfetto.protos.TraceConfig.IDataSource[]|null);
            builtinDataSources?: (perfetto.protos.TraceConfig.IBuiltinDataSource|null);
            durationMs?: (number|null);
            preferSuspendClockForDuration?: (boolean|null);
            enableExtraGuardrails?: (boolean|null);
            lockdownMode?: (perfetto.protos.TraceConfig.LockdownModeOperation|null);
            producers?: (perfetto.protos.TraceConfig.IProducerConfig[]|null);
            statsdMetadata?: (perfetto.protos.TraceConfig.IStatsdMetadata|null);
            writeIntoFile?: (boolean|null);
            outputPath?: (string|null);
            fileWritePeriodMs?: (number|null);
            maxFileSizeBytes?: (number|null);
            guardrailOverrides?: (perfetto.protos.TraceConfig.IGuardrailOverrides|null);
            deferredStart?: (boolean|null);
            flushPeriodMs?: (number|null);
            flushTimeoutMs?: (number|null);
            dataSourceStopTimeoutMs?: (number|null);
            notifyTraceur?: (boolean|null);
            bugreportScore?: (number|null);
            bugreportFilename?: (string|null);
            triggerConfig?: (perfetto.protos.TraceConfig.ITriggerConfig|null);
            activateTriggers?: (string[]|null);
            incrementalStateConfig?: (perfetto.protos.TraceConfig.IIncrementalStateConfig|null);
            allowUserBuildTracing?: (boolean|null);
            uniqueSessionName?: (string|null);
            compressionType?: (perfetto.protos.TraceConfig.CompressionType|null);
            incidentReportConfig?: (perfetto.protos.TraceConfig.IIncidentReportConfig|null);
            statsdLogging?: (perfetto.protos.TraceConfig.StatsdLogging|null);
            traceUuidMsb?: (number|null);
            traceUuidLsb?: (number|null);
            traceFilter?: (perfetto.protos.TraceConfig.ITraceFilter|null);
            androidReportConfig?: (perfetto.protos.TraceConfig.IAndroidReportConfig|null);
            cmdTraceStartDelay?: (perfetto.protos.TraceConfig.ICmdTraceStartDelay|null);
            sessionSemaphores?: (perfetto.protos.TraceConfig.ISessionSemaphore[]|null);
        }

        class TraceConfig implements ITraceConfig {
            constructor(p?: perfetto.protos.ITraceConfig);
            public buffers: perfetto.protos.TraceConfig.IBufferConfig[];
            public dataSources: perfetto.protos.TraceConfig.IDataSource[];
            public builtinDataSources?: (perfetto.protos.TraceConfig.IBuiltinDataSource|null);
            public durationMs: number;
            public preferSuspendClockForDuration: boolean;
            public enableExtraGuardrails: boolean;
            public lockdownMode: perfetto.protos.TraceConfig.LockdownModeOperation;
            public producers: perfetto.protos.TraceConfig.IProducerConfig[];
            public statsdMetadata?: (perfetto.protos.TraceConfig.IStatsdMetadata|null);
            public writeIntoFile: boolean;
            public outputPath: string;
            public fileWritePeriodMs: number;
            public maxFileSizeBytes: number;
            public guardrailOverrides?: (perfetto.protos.TraceConfig.IGuardrailOverrides|null);
            public deferredStart: boolean;
            public flushPeriodMs: number;
            public flushTimeoutMs: number;
            public dataSourceStopTimeoutMs: number;
            public notifyTraceur: boolean;
            public bugreportScore: number;
            public bugreportFilename: string;
            public triggerConfig?: (perfetto.protos.TraceConfig.ITriggerConfig|null);
            public activateTriggers: string[];
            public incrementalStateConfig?: (perfetto.protos.TraceConfig.IIncrementalStateConfig|null);
            public allowUserBuildTracing: boolean;
            public uniqueSessionName: string;
            public compressionType: perfetto.protos.TraceConfig.CompressionType;
            public incidentReportConfig?: (perfetto.protos.TraceConfig.IIncidentReportConfig|null);
            public statsdLogging: perfetto.protos.TraceConfig.StatsdLogging;
            public traceUuidMsb: number;
            public traceUuidLsb: number;
            public traceFilter?: (perfetto.protos.TraceConfig.ITraceFilter|null);
            public androidReportConfig?: (perfetto.protos.TraceConfig.IAndroidReportConfig|null);
            public cmdTraceStartDelay?: (perfetto.protos.TraceConfig.ICmdTraceStartDelay|null);
            public sessionSemaphores: perfetto.protos.TraceConfig.ISessionSemaphore[];
            public static create(properties?: perfetto.protos.ITraceConfig): perfetto.protos.TraceConfig;
            public static encode(m: perfetto.protos.ITraceConfig, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.TraceConfig;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.TraceConfig;
            public static toObject(m: perfetto.protos.TraceConfig, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace TraceConfig {

            interface IBufferConfig {
                sizeKb?: (number|null);
                fillPolicy?: (perfetto.protos.TraceConfig.BufferConfig.FillPolicy|null);
                transferOnClone?: (boolean|null);
                clearBeforeClone?: (boolean|null);
            }

            class BufferConfig implements IBufferConfig {
                constructor(p?: perfetto.protos.TraceConfig.IBufferConfig);
                public sizeKb: number;
                public fillPolicy: perfetto.protos.TraceConfig.BufferConfig.FillPolicy;
                public transferOnClone: boolean;
                public clearBeforeClone: boolean;
                public static create(properties?: perfetto.protos.TraceConfig.IBufferConfig): perfetto.protos.TraceConfig.BufferConfig;
                public static encode(m: perfetto.protos.TraceConfig.IBufferConfig, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.TraceConfig.BufferConfig;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.TraceConfig.BufferConfig;
                public static toObject(m: perfetto.protos.TraceConfig.BufferConfig, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            namespace BufferConfig {

                enum FillPolicy {
                    UNSPECIFIED = 0,
                    RING_BUFFER = 1,
                    DISCARD = 2
                }
            }

            interface IDataSource {
                config?: (perfetto.protos.IDataSourceConfig|null);
                producerNameFilter?: (string[]|null);
                producerNameRegexFilter?: (string[]|null);
            }

            class DataSource implements IDataSource {
                constructor(p?: perfetto.protos.TraceConfig.IDataSource);
                public config?: (perfetto.protos.IDataSourceConfig|null);
                public producerNameFilter: string[];
                public producerNameRegexFilter: string[];
                public static create(properties?: perfetto.protos.TraceConfig.IDataSource): perfetto.protos.TraceConfig.DataSource;
                public static encode(m: perfetto.protos.TraceConfig.IDataSource, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.TraceConfig.DataSource;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.TraceConfig.DataSource;
                public static toObject(m: perfetto.protos.TraceConfig.DataSource, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            interface IBuiltinDataSource {
                disableClockSnapshotting?: (boolean|null);
                disableTraceConfig?: (boolean|null);
                disableSystemInfo?: (boolean|null);
                disableServiceEvents?: (boolean|null);
                primaryTraceClock?: (perfetto.protos.BuiltinClock|null);
                snapshotIntervalMs?: (number|null);
                preferSuspendClockForSnapshot?: (boolean|null);
                disableChunkUsageHistograms?: (boolean|null);
            }

            class BuiltinDataSource implements IBuiltinDataSource {
                constructor(p?: perfetto.protos.TraceConfig.IBuiltinDataSource);
                public disableClockSnapshotting: boolean;
                public disableTraceConfig: boolean;
                public disableSystemInfo: boolean;
                public disableServiceEvents: boolean;
                public primaryTraceClock: perfetto.protos.BuiltinClock;
                public snapshotIntervalMs: number;
                public preferSuspendClockForSnapshot: boolean;
                public disableChunkUsageHistograms: boolean;
                public static create(properties?: perfetto.protos.TraceConfig.IBuiltinDataSource): perfetto.protos.TraceConfig.BuiltinDataSource;
                public static encode(m: perfetto.protos.TraceConfig.IBuiltinDataSource, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.TraceConfig.BuiltinDataSource;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.TraceConfig.BuiltinDataSource;
                public static toObject(m: perfetto.protos.TraceConfig.BuiltinDataSource, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            enum LockdownModeOperation {
                LOCKDOWN_UNCHANGED = 0,
                LOCKDOWN_CLEAR = 1,
                LOCKDOWN_SET = 2
            }

            interface IProducerConfig {
                producerName?: (string|null);
                shmSizeKb?: (number|null);
                pageSizeKb?: (number|null);
            }

            class ProducerConfig implements IProducerConfig {
                constructor(p?: perfetto.protos.TraceConfig.IProducerConfig);
                public producerName: string;
                public shmSizeKb: number;
                public pageSizeKb: number;
                public static create(properties?: perfetto.protos.TraceConfig.IProducerConfig): perfetto.protos.TraceConfig.ProducerConfig;
                public static encode(m: perfetto.protos.TraceConfig.IProducerConfig, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.TraceConfig.ProducerConfig;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.TraceConfig.ProducerConfig;
                public static toObject(m: perfetto.protos.TraceConfig.ProducerConfig, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            interface IStatsdMetadata {
                triggeringAlertId?: (number|null);
                triggeringConfigUid?: (number|null);
                triggeringConfigId?: (number|null);
                triggeringSubscriptionId?: (number|null);
            }

            class StatsdMetadata implements IStatsdMetadata {
                constructor(p?: perfetto.protos.TraceConfig.IStatsdMetadata);
                public triggeringAlertId: number;
                public triggeringConfigUid: number;
                public triggeringConfigId: number;
                public triggeringSubscriptionId: number;
                public static create(properties?: perfetto.protos.TraceConfig.IStatsdMetadata): perfetto.protos.TraceConfig.StatsdMetadata;
                public static encode(m: perfetto.protos.TraceConfig.IStatsdMetadata, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.TraceConfig.StatsdMetadata;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.TraceConfig.StatsdMetadata;
                public static toObject(m: perfetto.protos.TraceConfig.StatsdMetadata, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            interface IGuardrailOverrides {
                maxUploadPerDayBytes?: (number|null);
                maxTracingBufferSizeKb?: (number|null);
            }

            class GuardrailOverrides implements IGuardrailOverrides {
                constructor(p?: perfetto.protos.TraceConfig.IGuardrailOverrides);
                public maxUploadPerDayBytes: number;
                public maxTracingBufferSizeKb: number;
                public static create(properties?: perfetto.protos.TraceConfig.IGuardrailOverrides): perfetto.protos.TraceConfig.GuardrailOverrides;
                public static encode(m: perfetto.protos.TraceConfig.IGuardrailOverrides, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.TraceConfig.GuardrailOverrides;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.TraceConfig.GuardrailOverrides;
                public static toObject(m: perfetto.protos.TraceConfig.GuardrailOverrides, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            interface ITriggerConfig {
                triggerMode?: (perfetto.protos.TraceConfig.TriggerConfig.TriggerMode|null);
                useCloneSnapshotIfAvailable?: (boolean|null);
                triggers?: (perfetto.protos.TraceConfig.TriggerConfig.ITrigger[]|null);
                triggerTimeoutMs?: (number|null);
            }

            class TriggerConfig implements ITriggerConfig {
                constructor(p?: perfetto.protos.TraceConfig.ITriggerConfig);
                public triggerMode: perfetto.protos.TraceConfig.TriggerConfig.TriggerMode;
                public useCloneSnapshotIfAvailable: boolean;
                public triggers: perfetto.protos.TraceConfig.TriggerConfig.ITrigger[];
                public triggerTimeoutMs: number;
                public static create(properties?: perfetto.protos.TraceConfig.ITriggerConfig): perfetto.protos.TraceConfig.TriggerConfig;
                public static encode(m: perfetto.protos.TraceConfig.ITriggerConfig, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.TraceConfig.TriggerConfig;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.TraceConfig.TriggerConfig;
                public static toObject(m: perfetto.protos.TraceConfig.TriggerConfig, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            namespace TriggerConfig {

                enum TriggerMode {
                    UNSPECIFIED = 0,
                    START_TRACING = 1,
                    STOP_TRACING = 2,
                    CLONE_SNAPSHOT = 4
                }

                interface ITrigger {
                    name?: (string|null);
                    producerNameRegex?: (string|null);
                    stopDelayMs?: (number|null);
                    maxPer_24H?: (number|null);
                    skipProbability?: (number|null);
                }

                class Trigger implements ITrigger {
                    constructor(p?: perfetto.protos.TraceConfig.TriggerConfig.ITrigger);
                    public name: string;
                    public producerNameRegex: string;
                    public stopDelayMs: number;
                    public maxPer_24H: number;
                    public skipProbability: number;
                    public static create(properties?: perfetto.protos.TraceConfig.TriggerConfig.ITrigger): perfetto.protos.TraceConfig.TriggerConfig.Trigger;
                    public static encode(m: perfetto.protos.TraceConfig.TriggerConfig.ITrigger, w?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.TraceConfig.TriggerConfig.Trigger;
                    public static fromObject(d: { [k: string]: any }): perfetto.protos.TraceConfig.TriggerConfig.Trigger;
                    public static toObject(m: perfetto.protos.TraceConfig.TriggerConfig.Trigger, o?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }
            }

            interface IIncrementalStateConfig {
                clearPeriodMs?: (number|null);
            }

            class IncrementalStateConfig implements IIncrementalStateConfig {
                constructor(p?: perfetto.protos.TraceConfig.IIncrementalStateConfig);
                public clearPeriodMs: number;
                public static create(properties?: perfetto.protos.TraceConfig.IIncrementalStateConfig): perfetto.protos.TraceConfig.IncrementalStateConfig;
                public static encode(m: perfetto.protos.TraceConfig.IIncrementalStateConfig, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.TraceConfig.IncrementalStateConfig;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.TraceConfig.IncrementalStateConfig;
                public static toObject(m: perfetto.protos.TraceConfig.IncrementalStateConfig, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            enum CompressionType {
                COMPRESSION_TYPE_UNSPECIFIED = 0,
                COMPRESSION_TYPE_DEFLATE = 1
            }

            interface IIncidentReportConfig {
                destinationPackage?: (string|null);
                destinationClass?: (string|null);
                privacyLevel?: (number|null);
                skipIncidentd?: (boolean|null);
                skipDropbox?: (boolean|null);
            }

            class IncidentReportConfig implements IIncidentReportConfig {
                constructor(p?: perfetto.protos.TraceConfig.IIncidentReportConfig);
                public destinationPackage: string;
                public destinationClass: string;
                public privacyLevel: number;
                public skipIncidentd: boolean;
                public skipDropbox: boolean;
                public static create(properties?: perfetto.protos.TraceConfig.IIncidentReportConfig): perfetto.protos.TraceConfig.IncidentReportConfig;
                public static encode(m: perfetto.protos.TraceConfig.IIncidentReportConfig, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.TraceConfig.IncidentReportConfig;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.TraceConfig.IncidentReportConfig;
                public static toObject(m: perfetto.protos.TraceConfig.IncidentReportConfig, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            enum StatsdLogging {
                STATSD_LOGGING_UNSPECIFIED = 0,
                STATSD_LOGGING_ENABLED = 1,
                STATSD_LOGGING_DISABLED = 2
            }

            interface ITraceFilter {
                bytecode?: (Uint8Array|null);
                bytecodeV2?: (Uint8Array|null);
                stringFilterChain?: (perfetto.protos.TraceConfig.TraceFilter.IStringFilterChain|null);
            }

            class TraceFilter implements ITraceFilter {
                constructor(p?: perfetto.protos.TraceConfig.ITraceFilter);
                public bytecode: Uint8Array;
                public bytecodeV2: Uint8Array;
                public stringFilterChain?: (perfetto.protos.TraceConfig.TraceFilter.IStringFilterChain|null);
                public static create(properties?: perfetto.protos.TraceConfig.ITraceFilter): perfetto.protos.TraceConfig.TraceFilter;
                public static encode(m: perfetto.protos.TraceConfig.ITraceFilter, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.TraceConfig.TraceFilter;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.TraceConfig.TraceFilter;
                public static toObject(m: perfetto.protos.TraceConfig.TraceFilter, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            namespace TraceFilter {

                enum StringFilterPolicy {
                    SFP_UNSPECIFIED = 0,
                    SFP_MATCH_REDACT_GROUPS = 1,
                    SFP_ATRACE_MATCH_REDACT_GROUPS = 2,
                    SFP_MATCH_BREAK = 3,
                    SFP_ATRACE_MATCH_BREAK = 4,
                    SFP_ATRACE_REPEATED_SEARCH_REDACT_GROUPS = 5
                }

                interface IStringFilterRule {
                    policy?: (perfetto.protos.TraceConfig.TraceFilter.StringFilterPolicy|null);
                    regexPattern?: (string|null);
                    atracePayloadStartsWith?: (string|null);
                }

                class StringFilterRule implements IStringFilterRule {
                    constructor(p?: perfetto.protos.TraceConfig.TraceFilter.IStringFilterRule);
                    public policy: perfetto.protos.TraceConfig.TraceFilter.StringFilterPolicy;
                    public regexPattern: string;
                    public atracePayloadStartsWith: string;
                    public static create(properties?: perfetto.protos.TraceConfig.TraceFilter.IStringFilterRule): perfetto.protos.TraceConfig.TraceFilter.StringFilterRule;
                    public static encode(m: perfetto.protos.TraceConfig.TraceFilter.IStringFilterRule, w?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.TraceConfig.TraceFilter.StringFilterRule;
                    public static fromObject(d: { [k: string]: any }): perfetto.protos.TraceConfig.TraceFilter.StringFilterRule;
                    public static toObject(m: perfetto.protos.TraceConfig.TraceFilter.StringFilterRule, o?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                interface IStringFilterChain {
                    rules?: (perfetto.protos.TraceConfig.TraceFilter.IStringFilterRule[]|null);
                }

                class StringFilterChain implements IStringFilterChain {
                    constructor(p?: perfetto.protos.TraceConfig.TraceFilter.IStringFilterChain);
                    public rules: perfetto.protos.TraceConfig.TraceFilter.IStringFilterRule[];
                    public static create(properties?: perfetto.protos.TraceConfig.TraceFilter.IStringFilterChain): perfetto.protos.TraceConfig.TraceFilter.StringFilterChain;
                    public static encode(m: perfetto.protos.TraceConfig.TraceFilter.IStringFilterChain, w?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.TraceConfig.TraceFilter.StringFilterChain;
                    public static fromObject(d: { [k: string]: any }): perfetto.protos.TraceConfig.TraceFilter.StringFilterChain;
                    public static toObject(m: perfetto.protos.TraceConfig.TraceFilter.StringFilterChain, o?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }
            }

            interface IAndroidReportConfig {
                reporterServicePackage?: (string|null);
                reporterServiceClass?: (string|null);
                skipReport?: (boolean|null);
                usePipeInFrameworkForTesting?: (boolean|null);
            }

            class AndroidReportConfig implements IAndroidReportConfig {
                constructor(p?: perfetto.protos.TraceConfig.IAndroidReportConfig);
                public reporterServicePackage: string;
                public reporterServiceClass: string;
                public skipReport: boolean;
                public usePipeInFrameworkForTesting: boolean;
                public static create(properties?: perfetto.protos.TraceConfig.IAndroidReportConfig): perfetto.protos.TraceConfig.AndroidReportConfig;
                public static encode(m: perfetto.protos.TraceConfig.IAndroidReportConfig, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.TraceConfig.AndroidReportConfig;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.TraceConfig.AndroidReportConfig;
                public static toObject(m: perfetto.protos.TraceConfig.AndroidReportConfig, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            interface ICmdTraceStartDelay {
                minDelayMs?: (number|null);
                maxDelayMs?: (number|null);
            }

            class CmdTraceStartDelay implements ICmdTraceStartDelay {
                constructor(p?: perfetto.protos.TraceConfig.ICmdTraceStartDelay);
                public minDelayMs: number;
                public maxDelayMs: number;
                public static create(properties?: perfetto.protos.TraceConfig.ICmdTraceStartDelay): perfetto.protos.TraceConfig.CmdTraceStartDelay;
                public static encode(m: perfetto.protos.TraceConfig.ICmdTraceStartDelay, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.TraceConfig.CmdTraceStartDelay;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.TraceConfig.CmdTraceStartDelay;
                public static toObject(m: perfetto.protos.TraceConfig.CmdTraceStartDelay, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            interface ISessionSemaphore {
                name?: (string|null);
                maxOtherSessionCount?: (number|null);
            }

            class SessionSemaphore implements ISessionSemaphore {
                constructor(p?: perfetto.protos.TraceConfig.ISessionSemaphore);
                public name: string;
                public maxOtherSessionCount: number;
                public static create(properties?: perfetto.protos.TraceConfig.ISessionSemaphore): perfetto.protos.TraceConfig.SessionSemaphore;
                public static encode(m: perfetto.protos.TraceConfig.ISessionSemaphore, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.TraceConfig.SessionSemaphore;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.TraceConfig.SessionSemaphore;
                public static toObject(m: perfetto.protos.TraceConfig.SessionSemaphore, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }
        }

        enum BuiltinClock {
            BUILTIN_CLOCK_UNKNOWN = 0,
            BUILTIN_CLOCK_REALTIME = 1,
            BUILTIN_CLOCK_REALTIME_COARSE = 2,
            BUILTIN_CLOCK_MONOTONIC = 3,
            BUILTIN_CLOCK_MONOTONIC_COARSE = 4,
            BUILTIN_CLOCK_MONOTONIC_RAW = 5,
            BUILTIN_CLOCK_BOOTTIME = 6,
            BUILTIN_CLOCK_TSC = 9,
            BUILTIN_CLOCK_PERF = 10,
            BUILTIN_CLOCK_MAX_ID = 63
        }

        interface IDataSourceConfig {
            name?: (string|null);
            targetBuffer?: (number|null);
            traceDurationMs?: (number|null);
            preferSuspendClockForDuration?: (boolean|null);
            stopTimeoutMs?: (number|null);
            enableExtraGuardrails?: (boolean|null);
            sessionInitiator?: (perfetto.protos.DataSourceConfig.SessionInitiator|null);
            tracingSessionId?: (number|null);
            ftraceConfig?: (perfetto.protos.IFtraceConfig|null);
            inodeFileConfig?: (perfetto.protos.IInodeFileConfig|null);
            processStatsConfig?: (perfetto.protos.IProcessStatsConfig|null);
            sysStatsConfig?: (perfetto.protos.ISysStatsConfig|null);
            heapprofdConfig?: (perfetto.protos.IHeapprofdConfig|null);
            javaHprofConfig?: (perfetto.protos.IJavaHprofConfig|null);
            androidPowerConfig?: (perfetto.protos.IAndroidPowerConfig|null);
            androidLogConfig?: (perfetto.protos.IAndroidLogConfig|null);
            gpuCounterConfig?: (perfetto.protos.IGpuCounterConfig|null);
            androidGameInterventionListConfig?: (perfetto.protos.IAndroidGameInterventionListConfig|null);
            packagesListConfig?: (perfetto.protos.IPackagesListConfig|null);
            perfEventConfig?: (perfetto.protos.IPerfEventConfig|null);
            vulkanMemoryConfig?: (perfetto.protos.IVulkanMemoryConfig|null);
            trackEventConfig?: (perfetto.protos.ITrackEventConfig|null);
            androidPolledStateConfig?: (perfetto.protos.IAndroidPolledStateConfig|null);
            androidSystemPropertyConfig?: (perfetto.protos.IAndroidSystemPropertyConfig|null);
            statsdTracingConfig?: (perfetto.protos.IStatsdTracingConfig|null);
            systemInfoConfig?: (perfetto.protos.ISystemInfoConfig|null);
            chromeConfig?: (perfetto.protos.IChromeConfig|null);
            v8Config?: (perfetto.protos.IV8Config|null);
            interceptorConfig?: (perfetto.protos.IInterceptorConfig|null);
            networkPacketTraceConfig?: (perfetto.protos.INetworkPacketTraceConfig|null);
            surfaceflingerLayersConfig?: (perfetto.protos.ISurfaceFlingerLayersConfig|null);
            surfaceflingerTransactionsConfig?: (perfetto.protos.ISurfaceFlingerTransactionsConfig|null);
            androidSdkSyspropGuardConfig?: (perfetto.protos.IAndroidSdkSyspropGuardConfig|null);
            etwConfig?: (perfetto.protos.IEtwConfig|null);
            protologConfig?: (perfetto.protos.IProtoLogConfig|null);
            androidInputEventConfig?: (perfetto.protos.IAndroidInputEventConfig|null);
            pixelModemConfig?: (perfetto.protos.IPixelModemConfig|null);
            windowmanagerConfig?: (perfetto.protos.IWindowManagerConfig|null);
            chromiumSystemMetrics?: (perfetto.protos.IChromiumSystemMetricsConfig|null);
            legacyConfig?: (string|null);
            forTesting?: (perfetto.protos.ITestConfig|null);
        }

        class DataSourceConfig implements IDataSourceConfig {
            constructor(p?: perfetto.protos.IDataSourceConfig);
            public name: string;
            public targetBuffer: number;
            public traceDurationMs: number;
            public preferSuspendClockForDuration: boolean;
            public stopTimeoutMs: number;
            public enableExtraGuardrails: boolean;
            public sessionInitiator: perfetto.protos.DataSourceConfig.SessionInitiator;
            public tracingSessionId: number;
            public ftraceConfig?: (perfetto.protos.IFtraceConfig|null);
            public inodeFileConfig?: (perfetto.protos.IInodeFileConfig|null);
            public processStatsConfig?: (perfetto.protos.IProcessStatsConfig|null);
            public sysStatsConfig?: (perfetto.protos.ISysStatsConfig|null);
            public heapprofdConfig?: (perfetto.protos.IHeapprofdConfig|null);
            public javaHprofConfig?: (perfetto.protos.IJavaHprofConfig|null);
            public androidPowerConfig?: (perfetto.protos.IAndroidPowerConfig|null);
            public androidLogConfig?: (perfetto.protos.IAndroidLogConfig|null);
            public gpuCounterConfig?: (perfetto.protos.IGpuCounterConfig|null);
            public androidGameInterventionListConfig?: (perfetto.protos.IAndroidGameInterventionListConfig|null);
            public packagesListConfig?: (perfetto.protos.IPackagesListConfig|null);
            public perfEventConfig?: (perfetto.protos.IPerfEventConfig|null);
            public vulkanMemoryConfig?: (perfetto.protos.IVulkanMemoryConfig|null);
            public trackEventConfig?: (perfetto.protos.ITrackEventConfig|null);
            public androidPolledStateConfig?: (perfetto.protos.IAndroidPolledStateConfig|null);
            public androidSystemPropertyConfig?: (perfetto.protos.IAndroidSystemPropertyConfig|null);
            public statsdTracingConfig?: (perfetto.protos.IStatsdTracingConfig|null);
            public systemInfoConfig?: (perfetto.protos.ISystemInfoConfig|null);
            public chromeConfig?: (perfetto.protos.IChromeConfig|null);
            public v8Config?: (perfetto.protos.IV8Config|null);
            public interceptorConfig?: (perfetto.protos.IInterceptorConfig|null);
            public networkPacketTraceConfig?: (perfetto.protos.INetworkPacketTraceConfig|null);
            public surfaceflingerLayersConfig?: (perfetto.protos.ISurfaceFlingerLayersConfig|null);
            public surfaceflingerTransactionsConfig?: (perfetto.protos.ISurfaceFlingerTransactionsConfig|null);
            public androidSdkSyspropGuardConfig?: (perfetto.protos.IAndroidSdkSyspropGuardConfig|null);
            public etwConfig?: (perfetto.protos.IEtwConfig|null);
            public protologConfig?: (perfetto.protos.IProtoLogConfig|null);
            public androidInputEventConfig?: (perfetto.protos.IAndroidInputEventConfig|null);
            public pixelModemConfig?: (perfetto.protos.IPixelModemConfig|null);
            public windowmanagerConfig?: (perfetto.protos.IWindowManagerConfig|null);
            public chromiumSystemMetrics?: (perfetto.protos.IChromiumSystemMetricsConfig|null);
            public legacyConfig: string;
            public forTesting?: (perfetto.protos.ITestConfig|null);
            public static create(properties?: perfetto.protos.IDataSourceConfig): perfetto.protos.DataSourceConfig;
            public static encode(m: perfetto.protos.IDataSourceConfig, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.DataSourceConfig;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.DataSourceConfig;
            public static toObject(m: perfetto.protos.DataSourceConfig, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace DataSourceConfig {

            enum SessionInitiator {
                SESSION_INITIATOR_UNSPECIFIED = 0,
                SESSION_INITIATOR_TRUSTED_SYSTEM = 1
            }
        }

        interface IAndroidGameInterventionListConfig {
            packageNameFilter?: (string[]|null);
        }

        class AndroidGameInterventionListConfig implements IAndroidGameInterventionListConfig {
            constructor(p?: perfetto.protos.IAndroidGameInterventionListConfig);
            public packageNameFilter: string[];
            public static create(properties?: perfetto.protos.IAndroidGameInterventionListConfig): perfetto.protos.AndroidGameInterventionListConfig;
            public static encode(m: perfetto.protos.IAndroidGameInterventionListConfig, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.AndroidGameInterventionListConfig;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.AndroidGameInterventionListConfig;
            public static toObject(m: perfetto.protos.AndroidGameInterventionListConfig, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IAndroidInputEventConfig {
            mode?: (perfetto.protos.AndroidInputEventConfig.TraceMode|null);
            rules?: (perfetto.protos.AndroidInputEventConfig.ITraceRule[]|null);
            traceDispatcherInputEvents?: (boolean|null);
            traceDispatcherWindowDispatch?: (boolean|null);
        }

        class AndroidInputEventConfig implements IAndroidInputEventConfig {
            constructor(p?: perfetto.protos.IAndroidInputEventConfig);
            public mode: perfetto.protos.AndroidInputEventConfig.TraceMode;
            public rules: perfetto.protos.AndroidInputEventConfig.ITraceRule[];
            public traceDispatcherInputEvents: boolean;
            public traceDispatcherWindowDispatch: boolean;
            public static create(properties?: perfetto.protos.IAndroidInputEventConfig): perfetto.protos.AndroidInputEventConfig;
            public static encode(m: perfetto.protos.IAndroidInputEventConfig, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.AndroidInputEventConfig;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.AndroidInputEventConfig;
            public static toObject(m: perfetto.protos.AndroidInputEventConfig, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace AndroidInputEventConfig {

            enum TraceMode {
                TRACE_MODE_TRACE_ALL = 0,
                TRACE_MODE_USE_RULES = 1
            }

            enum TraceLevel {
                TRACE_LEVEL_NONE = 0,
                TRACE_LEVEL_REDACTED = 1,
                TRACE_LEVEL_COMPLETE = 2
            }

            interface ITraceRule {
                traceLevel?: (perfetto.protos.AndroidInputEventConfig.TraceLevel|null);
                matchAllPackages?: (string[]|null);
                matchAnyPackages?: (string[]|null);
                matchSecure?: (boolean|null);
                matchImeConnectionActive?: (boolean|null);
            }

            class TraceRule implements ITraceRule {
                constructor(p?: perfetto.protos.AndroidInputEventConfig.ITraceRule);
                public traceLevel: perfetto.protos.AndroidInputEventConfig.TraceLevel;
                public matchAllPackages: string[];
                public matchAnyPackages: string[];
                public matchSecure: boolean;
                public matchImeConnectionActive: boolean;
                public static create(properties?: perfetto.protos.AndroidInputEventConfig.ITraceRule): perfetto.protos.AndroidInputEventConfig.TraceRule;
                public static encode(m: perfetto.protos.AndroidInputEventConfig.ITraceRule, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.AndroidInputEventConfig.TraceRule;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.AndroidInputEventConfig.TraceRule;
                public static toObject(m: perfetto.protos.AndroidInputEventConfig.TraceRule, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }
        }

        interface IAndroidLogConfig {
            logIds?: (perfetto.protos.AndroidLogId[]|null);
            minPrio?: (perfetto.protos.AndroidLogPriority|null);
            filterTags?: (string[]|null);
        }

        class AndroidLogConfig implements IAndroidLogConfig {
            constructor(p?: perfetto.protos.IAndroidLogConfig);
            public logIds: perfetto.protos.AndroidLogId[];
            public minPrio: perfetto.protos.AndroidLogPriority;
            public filterTags: string[];
            public static create(properties?: perfetto.protos.IAndroidLogConfig): perfetto.protos.AndroidLogConfig;
            public static encode(m: perfetto.protos.IAndroidLogConfig, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.AndroidLogConfig;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.AndroidLogConfig;
            public static toObject(m: perfetto.protos.AndroidLogConfig, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        enum AndroidLogId {
            LID_DEFAULT = 0,
            LID_RADIO = 1,
            LID_EVENTS = 2,
            LID_SYSTEM = 3,
            LID_CRASH = 4,
            LID_STATS = 5,
            LID_SECURITY = 6,
            LID_KERNEL = 7
        }

        enum AndroidLogPriority {
            PRIO_UNSPECIFIED = 0,
            PRIO_UNUSED = 1,
            PRIO_VERBOSE = 2,
            PRIO_DEBUG = 3,
            PRIO_INFO = 4,
            PRIO_WARN = 5,
            PRIO_ERROR = 6,
            PRIO_FATAL = 7
        }

        interface IAndroidPolledStateConfig {
            pollMs?: (number|null);
        }

        class AndroidPolledStateConfig implements IAndroidPolledStateConfig {
            constructor(p?: perfetto.protos.IAndroidPolledStateConfig);
            public pollMs: number;
            public static create(properties?: perfetto.protos.IAndroidPolledStateConfig): perfetto.protos.AndroidPolledStateConfig;
            public static encode(m: perfetto.protos.IAndroidPolledStateConfig, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.AndroidPolledStateConfig;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.AndroidPolledStateConfig;
            public static toObject(m: perfetto.protos.AndroidPolledStateConfig, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IAndroidSystemPropertyConfig {
            pollMs?: (number|null);
            propertyName?: (string[]|null);
        }

        class AndroidSystemPropertyConfig implements IAndroidSystemPropertyConfig {
            constructor(p?: perfetto.protos.IAndroidSystemPropertyConfig);
            public pollMs: number;
            public propertyName: string[];
            public static create(properties?: perfetto.protos.IAndroidSystemPropertyConfig): perfetto.protos.AndroidSystemPropertyConfig;
            public static encode(m: perfetto.protos.IAndroidSystemPropertyConfig, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.AndroidSystemPropertyConfig;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.AndroidSystemPropertyConfig;
            public static toObject(m: perfetto.protos.AndroidSystemPropertyConfig, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IAndroidSdkSyspropGuardConfig {
            surfaceflingerSkiaTrackEvents?: (boolean|null);
            hwuiSkiaTrackEvents?: (boolean|null);
            hwuiPackageNameFilter?: (string[]|null);
        }

        class AndroidSdkSyspropGuardConfig implements IAndroidSdkSyspropGuardConfig {
            constructor(p?: perfetto.protos.IAndroidSdkSyspropGuardConfig);
            public surfaceflingerSkiaTrackEvents: boolean;
            public hwuiSkiaTrackEvents: boolean;
            public hwuiPackageNameFilter: string[];
            public static create(properties?: perfetto.protos.IAndroidSdkSyspropGuardConfig): perfetto.protos.AndroidSdkSyspropGuardConfig;
            public static encode(m: perfetto.protos.IAndroidSdkSyspropGuardConfig, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.AndroidSdkSyspropGuardConfig;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.AndroidSdkSyspropGuardConfig;
            public static toObject(m: perfetto.protos.AndroidSdkSyspropGuardConfig, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface INetworkPacketTraceConfig {
            pollMs?: (number|null);
            aggregationThreshold?: (number|null);
            internLimit?: (number|null);
            dropLocalPort?: (boolean|null);
            dropRemotePort?: (boolean|null);
            dropTcpFlags?: (boolean|null);
        }

        class NetworkPacketTraceConfig implements INetworkPacketTraceConfig {
            constructor(p?: perfetto.protos.INetworkPacketTraceConfig);
            public pollMs: number;
            public aggregationThreshold: number;
            public internLimit: number;
            public dropLocalPort: boolean;
            public dropRemotePort: boolean;
            public dropTcpFlags: boolean;
            public static create(properties?: perfetto.protos.INetworkPacketTraceConfig): perfetto.protos.NetworkPacketTraceConfig;
            public static encode(m: perfetto.protos.INetworkPacketTraceConfig, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.NetworkPacketTraceConfig;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.NetworkPacketTraceConfig;
            public static toObject(m: perfetto.protos.NetworkPacketTraceConfig, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IPackagesListConfig {
            packageNameFilter?: (string[]|null);
        }

        class PackagesListConfig implements IPackagesListConfig {
            constructor(p?: perfetto.protos.IPackagesListConfig);
            public packageNameFilter: string[];
            public static create(properties?: perfetto.protos.IPackagesListConfig): perfetto.protos.PackagesListConfig;
            public static encode(m: perfetto.protos.IPackagesListConfig, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.PackagesListConfig;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.PackagesListConfig;
            public static toObject(m: perfetto.protos.PackagesListConfig, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IPixelModemConfig {
            eventGroup?: (perfetto.protos.PixelModemConfig.EventGroup|null);
            pigweedHashAllowList?: (number[]|null);
            pigweedHashDenyList?: (number[]|null);
        }

        class PixelModemConfig implements IPixelModemConfig {
            constructor(p?: perfetto.protos.IPixelModemConfig);
            public eventGroup: perfetto.protos.PixelModemConfig.EventGroup;
            public pigweedHashAllowList: number[];
            public pigweedHashDenyList: number[];
            public static create(properties?: perfetto.protos.IPixelModemConfig): perfetto.protos.PixelModemConfig;
            public static encode(m: perfetto.protos.IPixelModemConfig, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.PixelModemConfig;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.PixelModemConfig;
            public static toObject(m: perfetto.protos.PixelModemConfig, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace PixelModemConfig {

            enum EventGroup {
                EVENT_GROUP_UNKNOWN = 0,
                EVENT_GROUP_LOW_BANDWIDTH = 1,
                EVENT_GROUP_HIGH_AND_LOW_BANDWIDTH = 2
            }
        }

        interface IProtoLogConfig {
            groupOverrides?: (perfetto.protos.IProtoLogGroup[]|null);
            tracingMode?: (perfetto.protos.ProtoLogConfig.TracingMode|null);
            defaultLogFromLevel?: (perfetto.protos.ProtoLogLevel|null);
        }

        class ProtoLogConfig implements IProtoLogConfig {
            constructor(p?: perfetto.protos.IProtoLogConfig);
            public groupOverrides: perfetto.protos.IProtoLogGroup[];
            public tracingMode: perfetto.protos.ProtoLogConfig.TracingMode;
            public defaultLogFromLevel: perfetto.protos.ProtoLogLevel;
            public static create(properties?: perfetto.protos.IProtoLogConfig): perfetto.protos.ProtoLogConfig;
            public static encode(m: perfetto.protos.IProtoLogConfig, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.ProtoLogConfig;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.ProtoLogConfig;
            public static toObject(m: perfetto.protos.ProtoLogConfig, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace ProtoLogConfig {

            enum TracingMode {
                DEFAULT = 0,
                ENABLE_ALL = 1
            }
        }

        interface IProtoLogGroup {
            groupName?: (string|null);
            logFrom?: (perfetto.protos.ProtoLogLevel|null);
            collectStacktrace?: (boolean|null);
        }

        class ProtoLogGroup implements IProtoLogGroup {
            constructor(p?: perfetto.protos.IProtoLogGroup);
            public groupName: string;
            public logFrom: perfetto.protos.ProtoLogLevel;
            public collectStacktrace: boolean;
            public static create(properties?: perfetto.protos.IProtoLogGroup): perfetto.protos.ProtoLogGroup;
            public static encode(m: perfetto.protos.IProtoLogGroup, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.ProtoLogGroup;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.ProtoLogGroup;
            public static toObject(m: perfetto.protos.ProtoLogGroup, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        enum ProtoLogLevel {
            PROTOLOG_LEVEL_UNDEFINED = 0,
            PROTOLOG_LEVEL_DEBUG = 1,
            PROTOLOG_LEVEL_VERBOSE = 2,
            PROTOLOG_LEVEL_INFO = 3,
            PROTOLOG_LEVEL_WARN = 4,
            PROTOLOG_LEVEL_ERROR = 5,
            PROTOLOG_LEVEL_WTF = 6
        }

        interface ISurfaceFlingerLayersConfig {
            mode?: (perfetto.protos.SurfaceFlingerLayersConfig.Mode|null);
            traceFlags?: (perfetto.protos.SurfaceFlingerLayersConfig.TraceFlag[]|null);
        }

        class SurfaceFlingerLayersConfig implements ISurfaceFlingerLayersConfig {
            constructor(p?: perfetto.protos.ISurfaceFlingerLayersConfig);
            public mode: perfetto.protos.SurfaceFlingerLayersConfig.Mode;
            public traceFlags: perfetto.protos.SurfaceFlingerLayersConfig.TraceFlag[];
            public static create(properties?: perfetto.protos.ISurfaceFlingerLayersConfig): perfetto.protos.SurfaceFlingerLayersConfig;
            public static encode(m: perfetto.protos.ISurfaceFlingerLayersConfig, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.SurfaceFlingerLayersConfig;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.SurfaceFlingerLayersConfig;
            public static toObject(m: perfetto.protos.SurfaceFlingerLayersConfig, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace SurfaceFlingerLayersConfig {

            enum Mode {
                MODE_UNSPECIFIED = 0,
                MODE_ACTIVE = 1,
                MODE_GENERATED = 2,
                MODE_DUMP = 3,
                MODE_GENERATED_BUGREPORT_ONLY = 4
            }

            enum TraceFlag {
                TRACE_FLAG_UNSPECIFIED = 0,
                TRACE_FLAG_INPUT = 2,
                TRACE_FLAG_COMPOSITION = 4,
                TRACE_FLAG_EXTRA = 8,
                TRACE_FLAG_HWC = 16,
                TRACE_FLAG_BUFFERS = 32,
                TRACE_FLAG_VIRTUAL_DISPLAYS = 64,
                TRACE_FLAG_ALL = 14
            }
        }

        interface ISurfaceFlingerTransactionsConfig {
            mode?: (perfetto.protos.SurfaceFlingerTransactionsConfig.Mode|null);
        }

        class SurfaceFlingerTransactionsConfig implements ISurfaceFlingerTransactionsConfig {
            constructor(p?: perfetto.protos.ISurfaceFlingerTransactionsConfig);
            public mode: perfetto.protos.SurfaceFlingerTransactionsConfig.Mode;
            public static create(properties?: perfetto.protos.ISurfaceFlingerTransactionsConfig): perfetto.protos.SurfaceFlingerTransactionsConfig;
            public static encode(m: perfetto.protos.ISurfaceFlingerTransactionsConfig, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.SurfaceFlingerTransactionsConfig;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.SurfaceFlingerTransactionsConfig;
            public static toObject(m: perfetto.protos.SurfaceFlingerTransactionsConfig, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace SurfaceFlingerTransactionsConfig {

            enum Mode {
                MODE_UNSPECIFIED = 0,
                MODE_CONTINUOUS = 1,
                MODE_ACTIVE = 2
            }
        }

        interface IWindowManagerConfig {
            logFrequency?: (perfetto.protos.WindowManagerConfig.LogFrequency|null);
            logLevel?: (perfetto.protos.WindowManagerConfig.LogLevel|null);
        }

        class WindowManagerConfig implements IWindowManagerConfig {
            constructor(p?: perfetto.protos.IWindowManagerConfig);
            public logFrequency: perfetto.protos.WindowManagerConfig.LogFrequency;
            public logLevel: perfetto.protos.WindowManagerConfig.LogLevel;
            public static create(properties?: perfetto.protos.IWindowManagerConfig): perfetto.protos.WindowManagerConfig;
            public static encode(m: perfetto.protos.IWindowManagerConfig, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.WindowManagerConfig;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.WindowManagerConfig;
            public static toObject(m: perfetto.protos.WindowManagerConfig, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace WindowManagerConfig {

            enum LogFrequency {
                LOG_FREQUENCY_UNSPECIFIED = 0,
                LOG_FREQUENCY_FRAME = 1,
                LOG_FREQUENCY_TRANSACTION = 2,
                LOG_FREQUENCY_SINGLE_DUMP = 3
            }

            enum LogLevel {
                LOG_LEVEL_UNSPECIFIED = 0,
                LOG_LEVEL_VERBOSE = 1,
                LOG_LEVEL_DEBUG = 2,
                LOG_LEVEL_CRITICAL = 3
            }
        }

        interface IChromeConfig {
            traceConfig?: (string|null);
            privacyFilteringEnabled?: (boolean|null);
            convertToLegacyJson?: (boolean|null);
            clientPriority?: (perfetto.protos.ChromeConfig.ClientPriority|null);
            jsonAgentLabelFilter?: (string|null);
        }

        class ChromeConfig implements IChromeConfig {
            constructor(p?: perfetto.protos.IChromeConfig);
            public traceConfig: string;
            public privacyFilteringEnabled: boolean;
            public convertToLegacyJson: boolean;
            public clientPriority: perfetto.protos.ChromeConfig.ClientPriority;
            public jsonAgentLabelFilter: string;
            public static create(properties?: perfetto.protos.IChromeConfig): perfetto.protos.ChromeConfig;
            public static encode(m: perfetto.protos.IChromeConfig, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.ChromeConfig;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.ChromeConfig;
            public static toObject(m: perfetto.protos.ChromeConfig, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace ChromeConfig {

            enum ClientPriority {
                UNKNOWN = 0,
                BACKGROUND = 1,
                USER_INITIATED = 2
            }
        }

        interface IV8Config {
            logScriptSources?: (boolean|null);
            logInstructions?: (boolean|null);
        }

        class V8Config implements IV8Config {
            constructor(p?: perfetto.protos.IV8Config);
            public logScriptSources: boolean;
            public logInstructions: boolean;
            public static create(properties?: perfetto.protos.IV8Config): perfetto.protos.V8Config;
            public static encode(m: perfetto.protos.IV8Config, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.V8Config;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.V8Config;
            public static toObject(m: perfetto.protos.V8Config, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IEtwConfig {
            kernelFlags?: (perfetto.protos.EtwConfig.KernelFlag[]|null);
        }

        class EtwConfig implements IEtwConfig {
            constructor(p?: perfetto.protos.IEtwConfig);
            public kernelFlags: perfetto.protos.EtwConfig.KernelFlag[];
            public static create(properties?: perfetto.protos.IEtwConfig): perfetto.protos.EtwConfig;
            public static encode(m: perfetto.protos.IEtwConfig, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.EtwConfig;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.EtwConfig;
            public static toObject(m: perfetto.protos.EtwConfig, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace EtwConfig {

            enum KernelFlag {
                CSWITCH = 0,
                DISPATCHER = 1
            }
        }

        interface IChromiumSystemMetricsConfig {
            samplingIntervalMs?: (number|null);
        }

        class ChromiumSystemMetricsConfig implements IChromiumSystemMetricsConfig {
            constructor(p?: perfetto.protos.IChromiumSystemMetricsConfig);
            public samplingIntervalMs: number;
            public static create(properties?: perfetto.protos.IChromiumSystemMetricsConfig): perfetto.protos.ChromiumSystemMetricsConfig;
            public static encode(m: perfetto.protos.IChromiumSystemMetricsConfig, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.ChromiumSystemMetricsConfig;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.ChromiumSystemMetricsConfig;
            public static toObject(m: perfetto.protos.ChromiumSystemMetricsConfig, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IFtraceConfig {
            ftraceEvents?: (string[]|null);
            kprobeEvents?: (perfetto.protos.FtraceConfig.IKprobeEvent[]|null);
            atraceCategories?: (string[]|null);
            atraceApps?: (string[]|null);
            atraceCategoriesPreferSdk?: (string[]|null);
            bufferSizeKb?: (number|null);
            drainPeriodMs?: (number|null);
            drainBufferPercent?: (number|null);
            compactSched?: (perfetto.protos.FtraceConfig.ICompactSchedConfig|null);
            printFilter?: (perfetto.protos.FtraceConfig.IPrintFilter|null);
            symbolizeKsyms?: (boolean|null);
            ksymsMemPolicy?: (perfetto.protos.FtraceConfig.KsymsMemPolicy|null);
            initializeKsymsSynchronouslyForTesting?: (boolean|null);
            throttleRssStat?: (boolean|null);
            disableGenericEvents?: (boolean|null);
            syscallEvents?: (string[]|null);
            enableFunctionGraph?: (boolean|null);
            functionFilters?: (string[]|null);
            functionGraphRoots?: (string[]|null);
            preserveFtraceBuffer?: (boolean|null);
            useMonotonicRawClock?: (boolean|null);
            instanceName?: (string|null);
            bufferSizeLowerBound?: (boolean|null);
        }

        class FtraceConfig implements IFtraceConfig {
            constructor(p?: perfetto.protos.IFtraceConfig);
            public ftraceEvents: string[];
            public kprobeEvents: perfetto.protos.FtraceConfig.IKprobeEvent[];
            public atraceCategories: string[];
            public atraceApps: string[];
            public atraceCategoriesPreferSdk: string[];
            public bufferSizeKb: number;
            public drainPeriodMs: number;
            public drainBufferPercent: number;
            public compactSched?: (perfetto.protos.FtraceConfig.ICompactSchedConfig|null);
            public printFilter?: (perfetto.protos.FtraceConfig.IPrintFilter|null);
            public symbolizeKsyms: boolean;
            public ksymsMemPolicy: perfetto.protos.FtraceConfig.KsymsMemPolicy;
            public initializeKsymsSynchronouslyForTesting: boolean;
            public throttleRssStat: boolean;
            public disableGenericEvents: boolean;
            public syscallEvents: string[];
            public enableFunctionGraph: boolean;
            public functionFilters: string[];
            public functionGraphRoots: string[];
            public preserveFtraceBuffer: boolean;
            public useMonotonicRawClock: boolean;
            public instanceName: string;
            public bufferSizeLowerBound: boolean;
            public static create(properties?: perfetto.protos.IFtraceConfig): perfetto.protos.FtraceConfig;
            public static encode(m: perfetto.protos.IFtraceConfig, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.FtraceConfig;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.FtraceConfig;
            public static toObject(m: perfetto.protos.FtraceConfig, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace FtraceConfig {

            interface IKprobeEvent {
                probe?: (string|null);
                type?: (perfetto.protos.FtraceConfig.KprobeEvent.KprobeType|null);
            }

            class KprobeEvent implements IKprobeEvent {
                constructor(p?: perfetto.protos.FtraceConfig.IKprobeEvent);
                public probe: string;
                public type: perfetto.protos.FtraceConfig.KprobeEvent.KprobeType;
                public static create(properties?: perfetto.protos.FtraceConfig.IKprobeEvent): perfetto.protos.FtraceConfig.KprobeEvent;
                public static encode(m: perfetto.protos.FtraceConfig.IKprobeEvent, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.FtraceConfig.KprobeEvent;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.FtraceConfig.KprobeEvent;
                public static toObject(m: perfetto.protos.FtraceConfig.KprobeEvent, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            namespace KprobeEvent {

                enum KprobeType {
                    KPROBE_TYPE_UNKNOWN = 0,
                    KPROBE_TYPE_KPROBE = 1,
                    KPROBE_TYPE_KRETPROBE = 2,
                    KPROBE_TYPE_BOTH = 3
                }
            }

            interface ICompactSchedConfig {
                enabled?: (boolean|null);
            }

            class CompactSchedConfig implements ICompactSchedConfig {
                constructor(p?: perfetto.protos.FtraceConfig.ICompactSchedConfig);
                public enabled: boolean;
                public static create(properties?: perfetto.protos.FtraceConfig.ICompactSchedConfig): perfetto.protos.FtraceConfig.CompactSchedConfig;
                public static encode(m: perfetto.protos.FtraceConfig.ICompactSchedConfig, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.FtraceConfig.CompactSchedConfig;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.FtraceConfig.CompactSchedConfig;
                public static toObject(m: perfetto.protos.FtraceConfig.CompactSchedConfig, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            interface IPrintFilter {
                rules?: (perfetto.protos.FtraceConfig.PrintFilter.IRule[]|null);
            }

            class PrintFilter implements IPrintFilter {
                constructor(p?: perfetto.protos.FtraceConfig.IPrintFilter);
                public rules: perfetto.protos.FtraceConfig.PrintFilter.IRule[];
                public static create(properties?: perfetto.protos.FtraceConfig.IPrintFilter): perfetto.protos.FtraceConfig.PrintFilter;
                public static encode(m: perfetto.protos.FtraceConfig.IPrintFilter, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.FtraceConfig.PrintFilter;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.FtraceConfig.PrintFilter;
                public static toObject(m: perfetto.protos.FtraceConfig.PrintFilter, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            namespace PrintFilter {

                interface IRule {
                    prefix?: (string|null);
                    atraceMsg?: (perfetto.protos.FtraceConfig.PrintFilter.Rule.IAtraceMessage|null);
                    allow?: (boolean|null);
                }

                class Rule implements IRule {
                    constructor(p?: perfetto.protos.FtraceConfig.PrintFilter.IRule);
                    public prefix?: (string|null);
                    public atraceMsg?: (perfetto.protos.FtraceConfig.PrintFilter.Rule.IAtraceMessage|null);
                    public allow: boolean;
                    public match?: ("prefix"|"atraceMsg");
                    public static create(properties?: perfetto.protos.FtraceConfig.PrintFilter.IRule): perfetto.protos.FtraceConfig.PrintFilter.Rule;
                    public static encode(m: perfetto.protos.FtraceConfig.PrintFilter.IRule, w?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.FtraceConfig.PrintFilter.Rule;
                    public static fromObject(d: { [k: string]: any }): perfetto.protos.FtraceConfig.PrintFilter.Rule;
                    public static toObject(m: perfetto.protos.FtraceConfig.PrintFilter.Rule, o?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                namespace Rule {

                    interface IAtraceMessage {
                        type?: (string|null);
                        prefix?: (string|null);
                    }

                    class AtraceMessage implements IAtraceMessage {
                        constructor(p?: perfetto.protos.FtraceConfig.PrintFilter.Rule.IAtraceMessage);
                        public type: string;
                        public prefix: string;
                        public static create(properties?: perfetto.protos.FtraceConfig.PrintFilter.Rule.IAtraceMessage): perfetto.protos.FtraceConfig.PrintFilter.Rule.AtraceMessage;
                        public static encode(m: perfetto.protos.FtraceConfig.PrintFilter.Rule.IAtraceMessage, w?: $protobuf.Writer): $protobuf.Writer;
                        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.FtraceConfig.PrintFilter.Rule.AtraceMessage;
                        public static fromObject(d: { [k: string]: any }): perfetto.protos.FtraceConfig.PrintFilter.Rule.AtraceMessage;
                        public static toObject(m: perfetto.protos.FtraceConfig.PrintFilter.Rule.AtraceMessage, o?: $protobuf.IConversionOptions): { [k: string]: any };
                        public toJSON(): { [k: string]: any };
                        public static getTypeUrl(typeUrlPrefix?: string): string;
                    }
                }
            }

            enum KsymsMemPolicy {
                KSYMS_UNSPECIFIED = 0,
                KSYMS_CLEANUP_ON_STOP = 1,
                KSYMS_RETAIN = 2
            }
        }

        interface IGpuCounterConfig {
            counterPeriodNs?: (number|null);
            counterIds?: (number[]|null);
            instrumentedSampling?: (boolean|null);
            fixGpuClock?: (boolean|null);
        }

        class GpuCounterConfig implements IGpuCounterConfig {
            constructor(p?: perfetto.protos.IGpuCounterConfig);
            public counterPeriodNs: number;
            public counterIds: number[];
            public instrumentedSampling: boolean;
            public fixGpuClock: boolean;
            public static create(properties?: perfetto.protos.IGpuCounterConfig): perfetto.protos.GpuCounterConfig;
            public static encode(m: perfetto.protos.IGpuCounterConfig, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.GpuCounterConfig;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.GpuCounterConfig;
            public static toObject(m: perfetto.protos.GpuCounterConfig, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IVulkanMemoryConfig {
            trackDriverMemoryUsage?: (boolean|null);
            trackDeviceMemoryUsage?: (boolean|null);
        }

        class VulkanMemoryConfig implements IVulkanMemoryConfig {
            constructor(p?: perfetto.protos.IVulkanMemoryConfig);
            public trackDriverMemoryUsage: boolean;
            public trackDeviceMemoryUsage: boolean;
            public static create(properties?: perfetto.protos.IVulkanMemoryConfig): perfetto.protos.VulkanMemoryConfig;
            public static encode(m: perfetto.protos.IVulkanMemoryConfig, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.VulkanMemoryConfig;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.VulkanMemoryConfig;
            public static toObject(m: perfetto.protos.VulkanMemoryConfig, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IInodeFileConfig {
            scanIntervalMs?: (number|null);
            scanDelayMs?: (number|null);
            scanBatchSize?: (number|null);
            doNotScan?: (boolean|null);
            scanMountPoints?: (string[]|null);
            mountPointMapping?: (perfetto.protos.InodeFileConfig.IMountPointMappingEntry[]|null);
        }

        class InodeFileConfig implements IInodeFileConfig {
            constructor(p?: perfetto.protos.IInodeFileConfig);
            public scanIntervalMs: number;
            public scanDelayMs: number;
            public scanBatchSize: number;
            public doNotScan: boolean;
            public scanMountPoints: string[];
            public mountPointMapping: perfetto.protos.InodeFileConfig.IMountPointMappingEntry[];
            public static create(properties?: perfetto.protos.IInodeFileConfig): perfetto.protos.InodeFileConfig;
            public static encode(m: perfetto.protos.IInodeFileConfig, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.InodeFileConfig;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.InodeFileConfig;
            public static toObject(m: perfetto.protos.InodeFileConfig, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace InodeFileConfig {

            interface IMountPointMappingEntry {
                mountpoint?: (string|null);
                scanRoots?: (string[]|null);
            }

            class MountPointMappingEntry implements IMountPointMappingEntry {
                constructor(p?: perfetto.protos.InodeFileConfig.IMountPointMappingEntry);
                public mountpoint: string;
                public scanRoots: string[];
                public static create(properties?: perfetto.protos.InodeFileConfig.IMountPointMappingEntry): perfetto.protos.InodeFileConfig.MountPointMappingEntry;
                public static encode(m: perfetto.protos.InodeFileConfig.IMountPointMappingEntry, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.InodeFileConfig.MountPointMappingEntry;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.InodeFileConfig.MountPointMappingEntry;
                public static toObject(m: perfetto.protos.InodeFileConfig.MountPointMappingEntry, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }
        }

        interface IInterceptorConfig {
            name?: (string|null);
            consoleConfig?: (perfetto.protos.IConsoleConfig|null);
        }

        class InterceptorConfig implements IInterceptorConfig {
            constructor(p?: perfetto.protos.IInterceptorConfig);
            public name: string;
            public consoleConfig?: (perfetto.protos.IConsoleConfig|null);
            public static create(properties?: perfetto.protos.IInterceptorConfig): perfetto.protos.InterceptorConfig;
            public static encode(m: perfetto.protos.IInterceptorConfig, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.InterceptorConfig;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.InterceptorConfig;
            public static toObject(m: perfetto.protos.InterceptorConfig, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IConsoleConfig {
            output?: (perfetto.protos.ConsoleConfig.Output|null);
            enableColors?: (boolean|null);
        }

        class ConsoleConfig implements IConsoleConfig {
            constructor(p?: perfetto.protos.IConsoleConfig);
            public output: perfetto.protos.ConsoleConfig.Output;
            public enableColors: boolean;
            public static create(properties?: perfetto.protos.IConsoleConfig): perfetto.protos.ConsoleConfig;
            public static encode(m: perfetto.protos.IConsoleConfig, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.ConsoleConfig;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.ConsoleConfig;
            public static toObject(m: perfetto.protos.ConsoleConfig, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace ConsoleConfig {

            enum Output {
                OUTPUT_UNSPECIFIED = 0,
                OUTPUT_STDOUT = 1,
                OUTPUT_STDERR = 2
            }
        }

        interface IAndroidPowerConfig {
            batteryPollMs?: (number|null);
            batteryCounters?: (perfetto.protos.AndroidPowerConfig.BatteryCounters[]|null);
            collectPowerRails?: (boolean|null);
            collectEnergyEstimationBreakdown?: (boolean|null);
            collectEntityStateResidency?: (boolean|null);
        }

        class AndroidPowerConfig implements IAndroidPowerConfig {
            constructor(p?: perfetto.protos.IAndroidPowerConfig);
            public batteryPollMs: number;
            public batteryCounters: perfetto.protos.AndroidPowerConfig.BatteryCounters[];
            public collectPowerRails: boolean;
            public collectEnergyEstimationBreakdown: boolean;
            public collectEntityStateResidency: boolean;
            public static create(properties?: perfetto.protos.IAndroidPowerConfig): perfetto.protos.AndroidPowerConfig;
            public static encode(m: perfetto.protos.IAndroidPowerConfig, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.AndroidPowerConfig;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.AndroidPowerConfig;
            public static toObject(m: perfetto.protos.AndroidPowerConfig, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace AndroidPowerConfig {

            enum BatteryCounters {
                BATTERY_COUNTER_UNSPECIFIED = 0,
                BATTERY_COUNTER_CHARGE = 1,
                BATTERY_COUNTER_CAPACITY_PERCENT = 2,
                BATTERY_COUNTER_CURRENT = 3,
                BATTERY_COUNTER_CURRENT_AVG = 4,
                BATTERY_COUNTER_VOLTAGE = 5
            }
        }

        interface IStatsdTracingConfig {
            pushAtomId?: (perfetto.protos.AtomId[]|null);
            rawPushAtomId?: (number[]|null);
            pullConfig?: (perfetto.protos.IStatsdPullAtomConfig[]|null);
        }

        class StatsdTracingConfig implements IStatsdTracingConfig {
            constructor(p?: perfetto.protos.IStatsdTracingConfig);
            public pushAtomId: perfetto.protos.AtomId[];
            public rawPushAtomId: number[];
            public pullConfig: perfetto.protos.IStatsdPullAtomConfig[];
            public static create(properties?: perfetto.protos.IStatsdTracingConfig): perfetto.protos.StatsdTracingConfig;
            public static encode(m: perfetto.protos.IStatsdTracingConfig, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.StatsdTracingConfig;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.StatsdTracingConfig;
            public static toObject(m: perfetto.protos.StatsdTracingConfig, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IStatsdPullAtomConfig {
            pullAtomId?: (perfetto.protos.AtomId[]|null);
            rawPullAtomId?: (number[]|null);
            pullFrequencyMs?: (number|null);
            packages?: (string[]|null);
        }

        class StatsdPullAtomConfig implements IStatsdPullAtomConfig {
            constructor(p?: perfetto.protos.IStatsdPullAtomConfig);
            public pullAtomId: perfetto.protos.AtomId[];
            public rawPullAtomId: number[];
            public pullFrequencyMs: number;
            public packages: string[];
            public static create(properties?: perfetto.protos.IStatsdPullAtomConfig): perfetto.protos.StatsdPullAtomConfig;
            public static encode(m: perfetto.protos.IStatsdPullAtomConfig, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.StatsdPullAtomConfig;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.StatsdPullAtomConfig;
            public static toObject(m: perfetto.protos.StatsdPullAtomConfig, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        enum AtomId {
            ATOM_UNSPECIFIED = 0,
            ATOM_BLE_SCAN_STATE_CHANGED = 2,
            ATOM_PROCESS_STATE_CHANGED = 3,
            ATOM_BLE_SCAN_RESULT_RECEIVED = 4,
            ATOM_SENSOR_STATE_CHANGED = 5,
            ATOM_GPS_SCAN_STATE_CHANGED = 6,
            ATOM_SYNC_STATE_CHANGED = 7,
            ATOM_SCHEDULED_JOB_STATE_CHANGED = 8,
            ATOM_SCREEN_BRIGHTNESS_CHANGED = 9,
            ATOM_WAKELOCK_STATE_CHANGED = 10,
            ATOM_LONG_PARTIAL_WAKELOCK_STATE_CHANGED = 11,
            ATOM_MOBILE_RADIO_POWER_STATE_CHANGED = 12,
            ATOM_WIFI_RADIO_POWER_STATE_CHANGED = 13,
            ATOM_ACTIVITY_MANAGER_SLEEP_STATE_CHANGED = 14,
            ATOM_MEMORY_FACTOR_STATE_CHANGED = 15,
            ATOM_EXCESSIVE_CPU_USAGE_REPORTED = 16,
            ATOM_CACHED_KILL_REPORTED = 17,
            ATOM_PROCESS_MEMORY_STAT_REPORTED = 18,
            ATOM_LAUNCHER_EVENT = 19,
            ATOM_BATTERY_SAVER_MODE_STATE_CHANGED = 20,
            ATOM_DEVICE_IDLE_MODE_STATE_CHANGED = 21,
            ATOM_DEVICE_IDLING_MODE_STATE_CHANGED = 22,
            ATOM_AUDIO_STATE_CHANGED = 23,
            ATOM_MEDIA_CODEC_STATE_CHANGED = 24,
            ATOM_CAMERA_STATE_CHANGED = 25,
            ATOM_FLASHLIGHT_STATE_CHANGED = 26,
            ATOM_UID_PROCESS_STATE_CHANGED = 27,
            ATOM_PROCESS_LIFE_CYCLE_STATE_CHANGED = 28,
            ATOM_SCREEN_STATE_CHANGED = 29,
            ATOM_BATTERY_LEVEL_CHANGED = 30,
            ATOM_CHARGING_STATE_CHANGED = 31,
            ATOM_PLUGGED_STATE_CHANGED = 32,
            ATOM_INTERACTIVE_STATE_CHANGED = 33,
            ATOM_TOUCH_EVENT_REPORTED = 34,
            ATOM_WAKEUP_ALARM_OCCURRED = 35,
            ATOM_KERNEL_WAKEUP_REPORTED = 36,
            ATOM_WIFI_LOCK_STATE_CHANGED = 37,
            ATOM_WIFI_SIGNAL_STRENGTH_CHANGED = 38,
            ATOM_WIFI_SCAN_STATE_CHANGED = 39,
            ATOM_PHONE_SIGNAL_STRENGTH_CHANGED = 40,
            ATOM_SETTING_CHANGED = 41,
            ATOM_ACTIVITY_FOREGROUND_STATE_CHANGED = 42,
            ATOM_ISOLATED_UID_CHANGED = 43,
            ATOM_PACKET_WAKEUP_OCCURRED = 44,
            ATOM_WALL_CLOCK_TIME_SHIFTED = 45,
            ATOM_ANOMALY_DETECTED = 46,
            ATOM_APP_BREADCRUMB_REPORTED = 47,
            ATOM_APP_START_OCCURRED = 48,
            ATOM_APP_START_CANCELED = 49,
            ATOM_APP_START_FULLY_DRAWN = 50,
            ATOM_LMK_KILL_OCCURRED = 51,
            ATOM_PICTURE_IN_PICTURE_STATE_CHANGED = 52,
            ATOM_WIFI_MULTICAST_LOCK_STATE_CHANGED = 53,
            ATOM_APP_START_MEMORY_STATE_CAPTURED = 55,
            ATOM_SHUTDOWN_SEQUENCE_REPORTED = 56,
            ATOM_BOOT_SEQUENCE_REPORTED = 57,
            ATOM_OVERLAY_STATE_CHANGED = 59,
            ATOM_FOREGROUND_SERVICE_STATE_CHANGED = 60,
            ATOM_CALL_STATE_CHANGED = 61,
            ATOM_KEYGUARD_STATE_CHANGED = 62,
            ATOM_KEYGUARD_BOUNCER_STATE_CHANGED = 63,
            ATOM_KEYGUARD_BOUNCER_PASSWORD_ENTERED = 64,
            ATOM_APP_DIED = 65,
            ATOM_RESOURCE_CONFIGURATION_CHANGED = 66,
            ATOM_BLUETOOTH_ENABLED_STATE_CHANGED = 67,
            ATOM_BLUETOOTH_CONNECTION_STATE_CHANGED = 68,
            ATOM_GPS_SIGNAL_QUALITY_CHANGED = 69,
            ATOM_USB_CONNECTOR_STATE_CHANGED = 70,
            ATOM_SPEAKER_IMPEDANCE_REPORTED = 71,
            ATOM_HARDWARE_FAILED = 72,
            ATOM_PHYSICAL_DROP_DETECTED = 73,
            ATOM_CHARGE_CYCLES_REPORTED = 74,
            ATOM_MOBILE_CONNECTION_STATE_CHANGED = 75,
            ATOM_MOBILE_RADIO_TECHNOLOGY_CHANGED = 76,
            ATOM_USB_DEVICE_ATTACHED = 77,
            ATOM_APP_CRASH_OCCURRED = 78,
            ATOM_ANR_OCCURRED = 79,
            ATOM_WTF_OCCURRED = 80,
            ATOM_LOW_MEM_REPORTED = 81,
            ATOM_GENERIC_ATOM = 82,
            ATOM_VIBRATOR_STATE_CHANGED = 84,
            ATOM_DEFERRED_JOB_STATS_REPORTED = 85,
            ATOM_THERMAL_THROTTLING = 86,
            ATOM_BIOMETRIC_ACQUIRED = 87,
            ATOM_BIOMETRIC_AUTHENTICATED = 88,
            ATOM_BIOMETRIC_ERROR_OCCURRED = 89,
            ATOM_UI_EVENT_REPORTED = 90,
            ATOM_BATTERY_HEALTH_SNAPSHOT = 91,
            ATOM_SLOW_IO = 92,
            ATOM_BATTERY_CAUSED_SHUTDOWN = 93,
            ATOM_PHONE_SERVICE_STATE_CHANGED = 94,
            ATOM_PHONE_STATE_CHANGED = 95,
            ATOM_USER_RESTRICTION_CHANGED = 96,
            ATOM_SETTINGS_UI_CHANGED = 97,
            ATOM_CONNECTIVITY_STATE_CHANGED = 98,
            ATOM_SERVICE_STATE_CHANGED = 99,
            ATOM_SERVICE_LAUNCH_REPORTED = 100,
            ATOM_FLAG_FLIP_UPDATE_OCCURRED = 101,
            ATOM_BINARY_PUSH_STATE_CHANGED = 102,
            ATOM_DEVICE_POLICY_EVENT = 103,
            ATOM_DOCS_UI_FILE_OP_CANCELED = 104,
            ATOM_DOCS_UI_FILE_OP_COPY_MOVE_MODE_REPORTED = 105,
            ATOM_DOCS_UI_FILE_OP_FAILURE = 106,
            ATOM_DOCS_UI_PROVIDER_FILE_OP = 107,
            ATOM_DOCS_UI_INVALID_SCOPED_ACCESS_REQUEST = 108,
            ATOM_DOCS_UI_LAUNCH_REPORTED = 109,
            ATOM_DOCS_UI_ROOT_VISITED = 110,
            ATOM_DOCS_UI_STARTUP_MS = 111,
            ATOM_DOCS_UI_USER_ACTION_REPORTED = 112,
            ATOM_WIFI_ENABLED_STATE_CHANGED = 113,
            ATOM_WIFI_RUNNING_STATE_CHANGED = 114,
            ATOM_APP_COMPACTED = 115,
            ATOM_NETWORK_DNS_EVENT_REPORTED = 116,
            ATOM_DOCS_UI_PICKER_LAUNCHED_FROM_REPORTED = 117,
            ATOM_DOCS_UI_PICK_RESULT_REPORTED = 118,
            ATOM_DOCS_UI_SEARCH_MODE_REPORTED = 119,
            ATOM_DOCS_UI_SEARCH_TYPE_REPORTED = 120,
            ATOM_DATA_STALL_EVENT = 121,
            ATOM_RESCUE_PARTY_RESET_REPORTED = 122,
            ATOM_SIGNED_CONFIG_REPORTED = 123,
            ATOM_GNSS_NI_EVENT_REPORTED = 124,
            ATOM_BLUETOOTH_LINK_LAYER_CONNECTION_EVENT = 125,
            ATOM_BLUETOOTH_ACL_CONNECTION_STATE_CHANGED = 126,
            ATOM_BLUETOOTH_SCO_CONNECTION_STATE_CHANGED = 127,
            ATOM_APP_DOWNGRADED = 128,
            ATOM_APP_OPTIMIZED_AFTER_DOWNGRADED = 129,
            ATOM_LOW_STORAGE_STATE_CHANGED = 130,
            ATOM_GNSS_NFW_NOTIFICATION_REPORTED = 131,
            ATOM_GNSS_CONFIGURATION_REPORTED = 132,
            ATOM_USB_PORT_OVERHEAT_EVENT_REPORTED = 133,
            ATOM_NFC_ERROR_OCCURRED = 134,
            ATOM_NFC_STATE_CHANGED = 135,
            ATOM_NFC_BEAM_OCCURRED = 136,
            ATOM_NFC_CARDEMULATION_OCCURRED = 137,
            ATOM_NFC_TAG_OCCURRED = 138,
            ATOM_NFC_HCE_TRANSACTION_OCCURRED = 139,
            ATOM_SE_STATE_CHANGED = 140,
            ATOM_SE_OMAPI_REPORTED = 141,
            ATOM_BROADCAST_DISPATCH_LATENCY_REPORTED = 142,
            ATOM_ATTENTION_MANAGER_SERVICE_RESULT_REPORTED = 143,
            ATOM_ADB_CONNECTION_CHANGED = 144,
            ATOM_SPEECH_DSP_STAT_REPORTED = 145,
            ATOM_USB_CONTAMINANT_REPORTED = 146,
            ATOM_WATCHDOG_ROLLBACK_OCCURRED = 147,
            ATOM_BIOMETRIC_SYSTEM_HEALTH_ISSUE_DETECTED = 148,
            ATOM_BUBBLE_UI_CHANGED = 149,
            ATOM_SCHEDULED_JOB_CONSTRAINT_CHANGED = 150,
            ATOM_BLUETOOTH_ACTIVE_DEVICE_CHANGED = 151,
            ATOM_BLUETOOTH_A2DP_PLAYBACK_STATE_CHANGED = 152,
            ATOM_BLUETOOTH_A2DP_CODEC_CONFIG_CHANGED = 153,
            ATOM_BLUETOOTH_A2DP_CODEC_CAPABILITY_CHANGED = 154,
            ATOM_BLUETOOTH_A2DP_AUDIO_UNDERRUN_REPORTED = 155,
            ATOM_BLUETOOTH_A2DP_AUDIO_OVERRUN_REPORTED = 156,
            ATOM_BLUETOOTH_DEVICE_RSSI_REPORTED = 157,
            ATOM_BLUETOOTH_DEVICE_FAILED_CONTACT_COUNTER_REPORTED = 158,
            ATOM_BLUETOOTH_DEVICE_TX_POWER_LEVEL_REPORTED = 159,
            ATOM_BLUETOOTH_HCI_TIMEOUT_REPORTED = 160,
            ATOM_BLUETOOTH_QUALITY_REPORT_REPORTED = 161,
            ATOM_BLUETOOTH_DEVICE_INFO_REPORTED = 162,
            ATOM_BLUETOOTH_REMOTE_VERSION_INFO_REPORTED = 163,
            ATOM_BLUETOOTH_SDP_ATTRIBUTE_REPORTED = 164,
            ATOM_BLUETOOTH_BOND_STATE_CHANGED = 165,
            ATOM_BLUETOOTH_CLASSIC_PAIRING_EVENT_REPORTED = 166,
            ATOM_BLUETOOTH_SMP_PAIRING_EVENT_REPORTED = 167,
            ATOM_SCREEN_TIMEOUT_EXTENSION_REPORTED = 168,
            ATOM_PROCESS_START_TIME = 169,
            ATOM_PERMISSION_GRANT_REQUEST_RESULT_REPORTED = 170,
            ATOM_BLUETOOTH_SOCKET_CONNECTION_STATE_CHANGED = 171,
            ATOM_DEVICE_IDENTIFIER_ACCESS_DENIED = 172,
            ATOM_BUBBLE_DEVELOPER_ERROR_REPORTED = 173,
            ATOM_ASSIST_GESTURE_STAGE_REPORTED = 174,
            ATOM_ASSIST_GESTURE_FEEDBACK_REPORTED = 175,
            ATOM_ASSIST_GESTURE_PROGRESS_REPORTED = 176,
            ATOM_TOUCH_GESTURE_CLASSIFIED = 177,
            ATOM_HIDDEN_API_USED = 178,
            ATOM_STYLE_UI_CHANGED = 179,
            ATOM_PRIVACY_INDICATORS_INTERACTED = 180,
            ATOM_APP_INSTALL_ON_EXTERNAL_STORAGE_REPORTED = 181,
            ATOM_NETWORK_STACK_REPORTED = 182,
            ATOM_APP_MOVED_STORAGE_REPORTED = 183,
            ATOM_BIOMETRIC_ENROLLED = 184,
            ATOM_SYSTEM_SERVER_WATCHDOG_OCCURRED = 185,
            ATOM_TOMB_STONE_OCCURRED = 186,
            ATOM_BLUETOOTH_CLASS_OF_DEVICE_REPORTED = 187,
            ATOM_INTELLIGENCE_EVENT_REPORTED = 188,
            ATOM_THERMAL_THROTTLING_SEVERITY_STATE_CHANGED = 189,
            ATOM_ROLE_REQUEST_RESULT_REPORTED = 190,
            ATOM_MEDIAMETRICS_AUDIOPOLICY_REPORTED = 191,
            ATOM_MEDIAMETRICS_AUDIORECORD_REPORTED = 192,
            ATOM_MEDIAMETRICS_AUDIOTHREAD_REPORTED = 193,
            ATOM_MEDIAMETRICS_AUDIOTRACK_REPORTED = 194,
            ATOM_MEDIAMETRICS_CODEC_REPORTED = 195,
            ATOM_MEDIAMETRICS_DRM_WIDEVINE_REPORTED = 196,
            ATOM_MEDIAMETRICS_EXTRACTOR_REPORTED = 197,
            ATOM_MEDIAMETRICS_MEDIADRM_REPORTED = 198,
            ATOM_MEDIAMETRICS_NUPLAYER_REPORTED = 199,
            ATOM_MEDIAMETRICS_RECORDER_REPORTED = 200,
            ATOM_MEDIAMETRICS_DRMMANAGER_REPORTED = 201,
            ATOM_CAR_POWER_STATE_CHANGED = 203,
            ATOM_GARAGE_MODE_INFO = 204,
            ATOM_TEST_ATOM_REPORTED = 205,
            ATOM_CONTENT_CAPTURE_CALLER_MISMATCH_REPORTED = 206,
            ATOM_CONTENT_CAPTURE_SERVICE_EVENTS = 207,
            ATOM_CONTENT_CAPTURE_SESSION_EVENTS = 208,
            ATOM_CONTENT_CAPTURE_FLUSHED = 209,
            ATOM_LOCATION_MANAGER_API_USAGE_REPORTED = 210,
            ATOM_REVIEW_PERMISSIONS_FRAGMENT_RESULT_REPORTED = 211,
            ATOM_RUNTIME_PERMISSIONS_UPGRADE_RESULT = 212,
            ATOM_GRANT_PERMISSIONS_ACTIVITY_BUTTON_ACTIONS = 213,
            ATOM_LOCATION_ACCESS_CHECK_NOTIFICATION_ACTION = 214,
            ATOM_APP_PERMISSION_FRAGMENT_ACTION_REPORTED = 215,
            ATOM_APP_PERMISSION_FRAGMENT_VIEWED = 216,
            ATOM_APP_PERMISSIONS_FRAGMENT_VIEWED = 217,
            ATOM_PERMISSION_APPS_FRAGMENT_VIEWED = 218,
            ATOM_TEXT_SELECTION_EVENT = 219,
            ATOM_TEXT_LINKIFY_EVENT = 220,
            ATOM_CONVERSATION_ACTIONS_EVENT = 221,
            ATOM_LANGUAGE_DETECTION_EVENT = 222,
            ATOM_EXCLUSION_RECT_STATE_CHANGED = 223,
            ATOM_BACK_GESTURE_REPORTED_REPORTED = 224,
            ATOM_UPDATE_ENGINE_UPDATE_ATTEMPT_REPORTED = 225,
            ATOM_UPDATE_ENGINE_SUCCESSFUL_UPDATE_REPORTED = 226,
            ATOM_CAMERA_ACTION_EVENT = 227,
            ATOM_APP_COMPATIBILITY_CHANGE_REPORTED = 228,
            ATOM_PERFETTO_UPLOADED = 229,
            ATOM_VMS_CLIENT_CONNECTION_STATE_CHANGED = 230,
            ATOM_MEDIA_PROVIDER_SCAN_OCCURRED = 233,
            ATOM_MEDIA_CONTENT_DELETED = 234,
            ATOM_MEDIA_PROVIDER_PERMISSION_REQUESTED = 235,
            ATOM_MEDIA_PROVIDER_SCHEMA_CHANGED = 236,
            ATOM_MEDIA_PROVIDER_IDLE_MAINTENANCE_FINISHED = 237,
            ATOM_REBOOT_ESCROW_RECOVERY_REPORTED = 238,
            ATOM_BOOT_TIME_EVENT_DURATION_REPORTED = 239,
            ATOM_BOOT_TIME_EVENT_ELAPSED_TIME_REPORTED = 240,
            ATOM_BOOT_TIME_EVENT_UTC_TIME_REPORTED = 241,
            ATOM_BOOT_TIME_EVENT_ERROR_CODE_REPORTED = 242,
            ATOM_USERSPACE_REBOOT_REPORTED = 243,
            ATOM_NOTIFICATION_REPORTED = 244,
            ATOM_NOTIFICATION_PANEL_REPORTED = 245,
            ATOM_NOTIFICATION_CHANNEL_MODIFIED = 246,
            ATOM_INTEGRITY_CHECK_RESULT_REPORTED = 247,
            ATOM_INTEGRITY_RULES_PUSHED = 248,
            ATOM_CB_MESSAGE_REPORTED = 249,
            ATOM_CB_MESSAGE_ERROR = 250,
            ATOM_WIFI_HEALTH_STAT_REPORTED = 251,
            ATOM_WIFI_FAILURE_STAT_REPORTED = 252,
            ATOM_WIFI_CONNECTION_RESULT_REPORTED = 253,
            ATOM_APP_FREEZE_CHANGED = 254,
            ATOM_SNAPSHOT_MERGE_REPORTED = 255,
            ATOM_FOREGROUND_SERVICE_APP_OP_SESSION_ENDED = 256,
            ATOM_DISPLAY_JANK_REPORTED = 257,
            ATOM_APP_STANDBY_BUCKET_CHANGED = 258,
            ATOM_SHARESHEET_STARTED = 259,
            ATOM_RANKING_SELECTED = 260,
            ATOM_TVSETTINGS_UI_INTERACTED = 261,
            ATOM_LAUNCHER_SNAPSHOT = 262,
            ATOM_PACKAGE_INSTALLER_V2_REPORTED = 263,
            ATOM_USER_LIFECYCLE_JOURNEY_REPORTED = 264,
            ATOM_USER_LIFECYCLE_EVENT_OCCURRED = 265,
            ATOM_ACCESSIBILITY_SHORTCUT_REPORTED = 266,
            ATOM_ACCESSIBILITY_SERVICE_REPORTED = 267,
            ATOM_DOCS_UI_DRAG_AND_DROP_REPORTED = 268,
            ATOM_APP_USAGE_EVENT_OCCURRED = 269,
            ATOM_AUTO_REVOKE_NOTIFICATION_CLICKED = 270,
            ATOM_AUTO_REVOKE_FRAGMENT_APP_VIEWED = 271,
            ATOM_AUTO_REVOKED_APP_INTERACTION = 272,
            ATOM_APP_PERMISSION_GROUPS_FRAGMENT_AUTO_REVOKE_ACTION = 273,
            ATOM_EVS_USAGE_STATS_REPORTED = 274,
            ATOM_AUDIO_POWER_USAGE_DATA_REPORTED = 275,
            ATOM_TV_TUNER_STATE_CHANGED = 276,
            ATOM_MEDIAOUTPUT_OP_SWITCH_REPORTED = 277,
            ATOM_CB_MESSAGE_FILTERED = 278,
            ATOM_TV_TUNER_DVR_STATUS = 279,
            ATOM_TV_CAS_SESSION_OPEN_STATUS = 280,
            ATOM_ASSISTANT_INVOCATION_REPORTED = 281,
            ATOM_DISPLAY_WAKE_REPORTED = 282,
            ATOM_CAR_USER_HAL_MODIFY_USER_REQUEST_REPORTED = 283,
            ATOM_CAR_USER_HAL_MODIFY_USER_RESPONSE_REPORTED = 284,
            ATOM_CAR_USER_HAL_POST_SWITCH_RESPONSE_REPORTED = 285,
            ATOM_CAR_USER_HAL_INITIAL_USER_INFO_REQUEST_REPORTED = 286,
            ATOM_CAR_USER_HAL_INITIAL_USER_INFO_RESPONSE_REPORTED = 287,
            ATOM_CAR_USER_HAL_USER_ASSOCIATION_REQUEST_REPORTED = 288,
            ATOM_CAR_USER_HAL_SET_USER_ASSOCIATION_RESPONSE_REPORTED = 289,
            ATOM_NETWORK_IP_PROVISIONING_REPORTED = 290,
            ATOM_NETWORK_DHCP_RENEW_REPORTED = 291,
            ATOM_NETWORK_VALIDATION_REPORTED = 292,
            ATOM_NETWORK_STACK_QUIRK_REPORTED = 293,
            ATOM_MEDIAMETRICS_AUDIORECORDDEVICEUSAGE_REPORTED = 294,
            ATOM_MEDIAMETRICS_AUDIOTHREADDEVICEUSAGE_REPORTED = 295,
            ATOM_MEDIAMETRICS_AUDIOTRACKDEVICEUSAGE_REPORTED = 296,
            ATOM_MEDIAMETRICS_AUDIODEVICECONNECTION_REPORTED = 297,
            ATOM_BLOB_COMMITTED = 298,
            ATOM_BLOB_LEASED = 299,
            ATOM_BLOB_OPENED = 300,
            ATOM_CONTACTS_PROVIDER_STATUS_REPORTED = 301,
            ATOM_KEYSTORE_KEY_EVENT_REPORTED = 302,
            ATOM_NETWORK_TETHERING_REPORTED = 303,
            ATOM_IME_TOUCH_REPORTED = 304,
            ATOM_UI_INTERACTION_FRAME_INFO_REPORTED = 305,
            ATOM_UI_ACTION_LATENCY_REPORTED = 306,
            ATOM_WIFI_DISCONNECT_REPORTED = 307,
            ATOM_WIFI_CONNECTION_STATE_CHANGED = 308,
            ATOM_HDMI_CEC_ACTIVE_SOURCE_CHANGED = 309,
            ATOM_HDMI_CEC_MESSAGE_REPORTED = 310,
            ATOM_AIRPLANE_MODE = 311,
            ATOM_MODEM_RESTART = 312,
            ATOM_CARRIER_ID_MISMATCH_REPORTED = 313,
            ATOM_CARRIER_ID_TABLE_UPDATED = 314,
            ATOM_DATA_STALL_RECOVERY_REPORTED = 315,
            ATOM_MEDIAMETRICS_MEDIAPARSER_REPORTED = 316,
            ATOM_TLS_HANDSHAKE_REPORTED = 317,
            ATOM_TEXT_CLASSIFIER_API_USAGE_REPORTED = 318,
            ATOM_CAR_WATCHDOG_KILL_STATS_REPORTED = 319,
            ATOM_MEDIAMETRICS_PLAYBACK_REPORTED = 320,
            ATOM_MEDIA_NETWORK_INFO_CHANGED = 321,
            ATOM_MEDIA_PLAYBACK_STATE_CHANGED = 322,
            ATOM_MEDIA_PLAYBACK_ERROR_REPORTED = 323,
            ATOM_MEDIA_PLAYBACK_TRACK_CHANGED = 324,
            ATOM_WIFI_SCAN_REPORTED = 325,
            ATOM_WIFI_PNO_SCAN_REPORTED = 326,
            ATOM_TIF_TUNE_CHANGED = 327,
            ATOM_AUTO_ROTATE_REPORTED = 328,
            ATOM_PERFETTO_TRIGGER = 329,
            ATOM_TRANSCODING_DATA = 330,
            ATOM_IMS_SERVICE_ENTITLEMENT_UPDATED = 331,
            ATOM_DEVICE_ROTATED = 333,
            ATOM_SIM_SPECIFIC_SETTINGS_RESTORED = 334,
            ATOM_TEXT_CLASSIFIER_DOWNLOAD_REPORTED = 335,
            ATOM_PIN_STORAGE_EVENT = 336,
            ATOM_FACE_DOWN_REPORTED = 337,
            ATOM_BLUETOOTH_HAL_CRASH_REASON_REPORTED = 338,
            ATOM_REBOOT_ESCROW_PREPARATION_REPORTED = 339,
            ATOM_REBOOT_ESCROW_LSKF_CAPTURE_REPORTED = 340,
            ATOM_REBOOT_ESCROW_REBOOT_REPORTED = 341,
            ATOM_BINDER_LATENCY_REPORTED = 342,
            ATOM_MEDIAMETRICS_AAUDIOSTREAM_REPORTED = 343,
            ATOM_MEDIA_TRANSCODING_SESSION_ENDED = 344,
            ATOM_MAGNIFICATION_USAGE_REPORTED = 345,
            ATOM_MAGNIFICATION_MODE_WITH_IME_ON_REPORTED = 346,
            ATOM_APP_SEARCH_CALL_STATS_REPORTED = 347,
            ATOM_APP_SEARCH_PUT_DOCUMENT_STATS_REPORTED = 348,
            ATOM_DEVICE_CONTROL_CHANGED = 349,
            ATOM_DEVICE_STATE_CHANGED = 350,
            ATOM_INPUTDEVICE_REGISTERED = 351,
            ATOM_SMARTSPACE_CARD_REPORTED = 352,
            ATOM_AUTH_PROMPT_AUTHENTICATE_INVOKED = 353,
            ATOM_AUTH_MANAGER_CAN_AUTHENTICATE_INVOKED = 354,
            ATOM_AUTH_ENROLL_ACTION_INVOKED = 355,
            ATOM_AUTH_DEPRECATED_API_USED = 356,
            ATOM_UNATTENDED_REBOOT_OCCURRED = 357,
            ATOM_LONG_REBOOT_BLOCKING_REPORTED = 358,
            ATOM_LOCATION_TIME_ZONE_PROVIDER_STATE_CHANGED = 359,
            ATOM_FDTRACK_EVENT_OCCURRED = 364,
            ATOM_TIMEOUT_AUTO_EXTENDED_REPORTED = 365,
            ATOM_ALARM_BATCH_DELIVERED = 367,
            ATOM_ALARM_SCHEDULED = 368,
            ATOM_CAR_WATCHDOG_IO_OVERUSE_STATS_REPORTED = 369,
            ATOM_USER_LEVEL_HIBERNATION_STATE_CHANGED = 370,
            ATOM_APP_SEARCH_INITIALIZE_STATS_REPORTED = 371,
            ATOM_APP_SEARCH_QUERY_STATS_REPORTED = 372,
            ATOM_APP_PROCESS_DIED = 373,
            ATOM_NETWORK_IP_REACHABILITY_MONITOR_REPORTED = 374,
            ATOM_SLOW_INPUT_EVENT_REPORTED = 375,
            ATOM_ANR_OCCURRED_PROCESSING_STARTED = 376,
            ATOM_APP_SEARCH_REMOVE_STATS_REPORTED = 377,
            ATOM_MEDIA_CODEC_REPORTED = 378,
            ATOM_PERMISSION_USAGE_FRAGMENT_INTERACTION = 379,
            ATOM_PERMISSION_DETAILS_INTERACTION = 380,
            ATOM_PRIVACY_SENSOR_TOGGLE_INTERACTION = 381,
            ATOM_PRIVACY_TOGGLE_DIALOG_INTERACTION = 382,
            ATOM_APP_SEARCH_OPTIMIZE_STATS_REPORTED = 383,
            ATOM_NON_A11Y_TOOL_SERVICE_WARNING_REPORT = 384,
            ATOM_APP_COMPAT_STATE_CHANGED = 386,
            ATOM_SIZE_COMPAT_RESTART_BUTTON_EVENT_REPORTED = 387,
            ATOM_SPLITSCREEN_UI_CHANGED = 388,
            ATOM_NETWORK_DNS_HANDSHAKE_REPORTED = 389,
            ATOM_BLUETOOTH_CODE_PATH_COUNTER = 390,
            ATOM_BLUETOOTH_LE_BATCH_SCAN_REPORT_DELAY = 392,
            ATOM_ACCESSIBILITY_FLOATING_MENU_UI_CHANGED = 393,
            ATOM_NEURALNETWORKS_COMPILATION_COMPLETED = 394,
            ATOM_NEURALNETWORKS_EXECUTION_COMPLETED = 395,
            ATOM_NEURALNETWORKS_COMPILATION_FAILED = 396,
            ATOM_NEURALNETWORKS_EXECUTION_FAILED = 397,
            ATOM_CONTEXT_HUB_BOOTED = 398,
            ATOM_CONTEXT_HUB_RESTARTED = 399,
            ATOM_CONTEXT_HUB_LOADED_NANOAPP_SNAPSHOT_REPORTED = 400,
            ATOM_CHRE_CODE_DOWNLOAD_TRANSACTED = 401,
            ATOM_UWB_SESSION_INITED = 402,
            ATOM_UWB_SESSION_CLOSED = 403,
            ATOM_UWB_FIRST_RANGING_RECEIVED = 404,
            ATOM_UWB_RANGING_MEASUREMENT_RECEIVED = 405,
            ATOM_TEXT_CLASSIFIER_DOWNLOAD_WORK_SCHEDULED = 406,
            ATOM_TEXT_CLASSIFIER_DOWNLOAD_WORK_COMPLETED = 407,
            ATOM_CLIPBOARD_CLEARED = 408,
            ATOM_VM_CREATION_REQUESTED = 409,
            ATOM_NEARBY_DEVICE_SCAN_STATE_CHANGED = 410,
            ATOM_CAMERA_COMPAT_CONTROL_EVENT_REPORTED = 411,
            ATOM_APPLICATION_LOCALES_CHANGED = 412,
            ATOM_MEDIAMETRICS_AUDIOTRACKSTATUS_REPORTED = 413,
            ATOM_FOLD_STATE_DURATION_REPORTED = 414,
            ATOM_LOCATION_TIME_ZONE_PROVIDER_CONTROLLER_STATE_CHANGED = 415,
            ATOM_DISPLAY_HBM_STATE_CHANGED = 416,
            ATOM_DISPLAY_HBM_BRIGHTNESS_CHANGED = 417,
            ATOM_PERSISTENT_URI_PERMISSIONS_FLUSHED = 418,
            ATOM_EARLY_BOOT_COMP_OS_ARTIFACTS_CHECK_REPORTED = 419,
            ATOM_VBMETA_DIGEST_REPORTED = 420,
            ATOM_APEX_INFO_GATHERED = 421,
            ATOM_PVM_INFO_GATHERED = 422,
            ATOM_WEAR_SETTINGS_UI_INTERACTED = 423,
            ATOM_TRACING_SERVICE_REPORT_EVENT = 424,
            ATOM_MEDIAMETRICS_AUDIORECORDSTATUS_REPORTED = 425,
            ATOM_LAUNCHER_LATENCY = 426,
            ATOM_DROPBOX_ENTRY_DROPPED = 427,
            ATOM_WIFI_P2P_CONNECTION_REPORTED = 428,
            ATOM_GAME_STATE_CHANGED = 429,
            ATOM_HOTWORD_DETECTOR_CREATE_REQUESTED = 430,
            ATOM_HOTWORD_DETECTION_SERVICE_INIT_RESULT_REPORTED = 431,
            ATOM_HOTWORD_DETECTION_SERVICE_RESTARTED = 432,
            ATOM_HOTWORD_DETECTOR_KEYPHRASE_TRIGGERED = 433,
            ATOM_HOTWORD_DETECTOR_EVENTS = 434,
            ATOM_BOOT_COMPLETED_BROADCAST_COMPLETION_LATENCY_REPORTED = 437,
            ATOM_CONTACTS_INDEXER_UPDATE_STATS_REPORTED = 440,
            ATOM_APP_BACKGROUND_RESTRICTIONS_INFO = 441,
            ATOM_MMS_SMS_PROVIDER_GET_THREAD_ID_FAILED = 442,
            ATOM_MMS_SMS_DATABASE_HELPER_ON_UPGRADE_FAILED = 443,
            ATOM_PERMISSION_REMINDER_NOTIFICATION_INTERACTED = 444,
            ATOM_RECENT_PERMISSION_DECISIONS_INTERACTED = 445,
            ATOM_GNSS_PSDS_DOWNLOAD_REPORTED = 446,
            ATOM_LE_AUDIO_CONNECTION_SESSION_REPORTED = 447,
            ATOM_LE_AUDIO_BROADCAST_SESSION_REPORTED = 448,
            ATOM_DREAM_UI_EVENT_REPORTED = 449,
            ATOM_TASK_MANAGER_EVENT_REPORTED = 450,
            ATOM_CDM_ASSOCIATION_ACTION = 451,
            ATOM_MAGNIFICATION_TRIPLE_TAP_AND_HOLD_ACTIVATED_SESSION_REPORTED = 452,
            ATOM_MAGNIFICATION_FOLLOW_TYPING_FOCUS_ACTIVATED_SESSION_REPORTED = 453,
            ATOM_ACCESSIBILITY_TEXT_READING_OPTIONS_CHANGED = 454,
            ATOM_WIFI_SETUP_FAILURE_CRASH_REPORTED = 455,
            ATOM_UWB_DEVICE_ERROR_REPORTED = 456,
            ATOM_ISOLATED_COMPILATION_SCHEDULED = 457,
            ATOM_ISOLATED_COMPILATION_ENDED = 458,
            ATOM_ONS_OPPORTUNISTIC_ESIM_PROVISIONING_COMPLETE = 459,
            ATOM_SYSTEM_SERVER_PRE_WATCHDOG_OCCURRED = 460,
            ATOM_TELEPHONY_ANOMALY_DETECTED = 461,
            ATOM_LETTERBOX_POSITION_CHANGED = 462,
            ATOM_REMOTE_KEY_PROVISIONING_ATTEMPT = 463,
            ATOM_REMOTE_KEY_PROVISIONING_NETWORK_INFO = 464,
            ATOM_REMOTE_KEY_PROVISIONING_TIMING = 465,
            ATOM_MEDIAOUTPUT_OP_INTERACTION_REPORT = 466,
            ATOM_SYNC_EXEMPTION_OCCURRED = 468,
            ATOM_AUTOFILL_PRESENTATION_EVENT_REPORTED = 469,
            ATOM_DOCK_STATE_CHANGED = 470,
            ATOM_SAFETY_SOURCE_STATE_COLLECTED = 471,
            ATOM_SAFETY_CENTER_SYSTEM_EVENT_REPORTED = 472,
            ATOM_SAFETY_CENTER_INTERACTION_REPORTED = 473,
            ATOM_SETTINGS_PROVIDER_SETTING_CHANGED = 474,
            ATOM_BROADCAST_DELIVERY_EVENT_REPORTED = 475,
            ATOM_SERVICE_REQUEST_EVENT_REPORTED = 476,
            ATOM_PROVIDER_ACQUISITION_EVENT_REPORTED = 477,
            ATOM_BLUETOOTH_DEVICE_NAME_REPORTED = 478,
            ATOM_CB_CONFIG_UPDATED = 479,
            ATOM_CB_MODULE_ERROR_REPORTED = 480,
            ATOM_CB_SERVICE_FEATURE_CHANGED = 481,
            ATOM_CB_RECEIVER_FEATURE_CHANGED = 482,
            ATOM_PRIVACY_SIGNAL_NOTIFICATION_INTERACTION = 484,
            ATOM_PRIVACY_SIGNAL_ISSUE_CARD_INTERACTION = 485,
            ATOM_PRIVACY_SIGNALS_JOB_FAILURE = 486,
            ATOM_VIBRATION_REPORTED = 487,
            ATOM_UWB_RANGING_START = 489,
            ATOM_APP_COMPACTED_V2 = 491,
            ATOM_DISPLAY_BRIGHTNESS_CHANGED = 494,
            ATOM_ACTIVITY_ACTION_BLOCKED = 495,
            ATOM_NETWORK_DNS_SERVER_SUPPORT_REPORTED = 504,
            ATOM_VM_BOOTED = 505,
            ATOM_VM_EXITED = 506,
            ATOM_AMBIENT_BRIGHTNESS_STATS_REPORTED = 507,
            ATOM_MEDIAMETRICS_SPATIALIZERCAPABILITIES_REPORTED = 508,
            ATOM_MEDIAMETRICS_SPATIALIZERDEVICEENABLED_REPORTED = 509,
            ATOM_MEDIAMETRICS_HEADTRACKERDEVICEENABLED_REPORTED = 510,
            ATOM_MEDIAMETRICS_HEADTRACKERDEVICESUPPORTED_REPORTED = 511,
            ATOM_HEARING_AID_INFO_REPORTED = 513,
            ATOM_DEVICE_WIDE_JOB_CONSTRAINT_CHANGED = 514,
            ATOM_AMBIENT_MODE_CHANGED = 515,
            ATOM_ANR_LATENCY_REPORTED = 516,
            ATOM_RESOURCE_API_INFO = 517,
            ATOM_SYSTEM_DEFAULT_NETWORK_CHANGED = 518,
            ATOM_IWLAN_SETUP_DATA_CALL_RESULT_REPORTED = 519,
            ATOM_IWLAN_PDN_DISCONNECTED_REASON_REPORTED = 520,
            ATOM_AIRPLANE_MODE_SESSION_REPORTED = 521,
            ATOM_VM_CPU_STATUS_REPORTED = 522,
            ATOM_VM_MEM_STATUS_REPORTED = 523,
            ATOM_PACKAGE_INSTALLATION_SESSION_REPORTED = 524,
            ATOM_DEFAULT_NETWORK_REMATCH_INFO = 525,
            ATOM_NETWORK_SELECTION_PERFORMANCE = 526,
            ATOM_NETWORK_NSD_REPORTED = 527,
            ATOM_BLUETOOTH_DISCONNECTION_REASON_REPORTED = 529,
            ATOM_BLUETOOTH_LOCAL_VERSIONS_REPORTED = 530,
            ATOM_BLUETOOTH_REMOTE_SUPPORTED_FEATURES_REPORTED = 531,
            ATOM_BLUETOOTH_LOCAL_SUPPORTED_FEATURES_REPORTED = 532,
            ATOM_BLUETOOTH_GATT_APP_INFO = 533,
            ATOM_BRIGHTNESS_CONFIGURATION_UPDATED = 534,
            ATOM_WEAR_MEDIA_OUTPUT_SWITCHER_LAUNCHED = 538,
            ATOM_WEAR_MEDIA_OUTPUT_SWITCHER_FINISHED = 539,
            ATOM_WEAR_MEDIA_OUTPUT_SWITCHER_CONNECTION_REPORTED = 540,
            ATOM_WEAR_MEDIA_OUTPUT_SWITCHER_DEVICE_SCAN_TRIGGERED = 541,
            ATOM_WEAR_MEDIA_OUTPUT_SWITCHER_FIRST_DEVICE_SCAN_LATENCY = 542,
            ATOM_WEAR_MEDIA_OUTPUT_SWITCHER_CONNECT_DEVICE_LATENCY = 543,
            ATOM_PACKAGE_MANAGER_SNAPSHOT_REPORTED = 544,
            ATOM_PACKAGE_MANAGER_APPS_FILTER_CACHE_BUILD_REPORTED = 545,
            ATOM_PACKAGE_MANAGER_APPS_FILTER_CACHE_UPDATE_REPORTED = 546,
            ATOM_LAUNCHER_IMPRESSION_EVENT = 547,
            ATOM_WEAR_MEDIA_OUTPUT_SWITCHER_ALL_DEVICES_SCAN_LATENCY = 549,
            ATOM_WS_WATCH_FACE_EDITED = 551,
            ATOM_WS_WATCH_FACE_FAVORITE_ACTION_REPORTED = 552,
            ATOM_WS_WATCH_FACE_SET_ACTION_REPORTED = 553,
            ATOM_PACKAGE_UNINSTALLATION_REPORTED = 554,
            ATOM_GAME_MODE_CHANGED = 555,
            ATOM_GAME_MODE_CONFIGURATION_CHANGED = 556,
            ATOM_BEDTIME_MODE_STATE_CHANGED = 557,
            ATOM_NETWORK_SLICE_SESSION_ENDED = 558,
            ATOM_NETWORK_SLICE_DAILY_DATA_USAGE_REPORTED = 559,
            ATOM_NFC_TAG_TYPE_OCCURRED = 560,
            ATOM_NFC_AID_CONFLICT_OCCURRED = 561,
            ATOM_NFC_READER_CONFLICT_OCCURRED = 562,
            ATOM_WS_TILE_LIST_CHANGED = 563,
            ATOM_GET_TYPE_ACCESSED_WITHOUT_PERMISSION = 564,
            ATOM_MOBILE_BUNDLED_APP_INFO_GATHERED = 566,
            ATOM_WS_WATCH_FACE_COMPLICATION_SET_CHANGED = 567,
            ATOM_MEDIA_DRM_CREATED = 568,
            ATOM_MEDIA_DRM_ERRORED = 569,
            ATOM_MEDIA_DRM_SESSION_OPENED = 570,
            ATOM_MEDIA_DRM_SESSION_CLOSED = 571,
            ATOM_USER_SELECTED_RESOLUTION = 572,
            ATOM_UNSAFE_INTENT_EVENT_REPORTED = 573,
            ATOM_PERFORMANCE_HINT_SESSION_REPORTED = 574,
            ATOM_MEDIAMETRICS_MIDI_DEVICE_CLOSE_REPORTED = 576,
            ATOM_BIOMETRIC_TOUCH_REPORTED = 577,
            ATOM_HOTWORD_AUDIO_EGRESS_EVENT_REPORTED = 578,
            ATOM_LOCATION_ENABLED_STATE_CHANGED = 580,
            ATOM_IME_REQUEST_FINISHED = 581,
            ATOM_USB_COMPLIANCE_WARNINGS_REPORTED = 582,
            ATOM_APP_SUPPORTED_LOCALES_CHANGED = 583,
            ATOM_MEDIA_PROVIDER_VOLUME_RECOVERY_REPORTED = 586,
            ATOM_BIOMETRIC_PROPERTIES_COLLECTED = 587,
            ATOM_KERNEL_WAKEUP_ATTRIBUTED = 588,
            ATOM_SCREEN_STATE_CHANGED_V2 = 589,
            ATOM_WS_BACKUP_ACTION_REPORTED = 590,
            ATOM_WS_RESTORE_ACTION_REPORTED = 591,
            ATOM_DEVICE_LOG_ACCESS_EVENT_REPORTED = 592,
            ATOM_MEDIA_SESSION_UPDATED = 594,
            ATOM_WEAR_OOBE_STATE_CHANGED = 595,
            ATOM_WS_NOTIFICATION_UPDATED = 596,
            ATOM_NETWORK_VALIDATION_FAILURE_STATS_DAILY_REPORTED = 601,
            ATOM_WS_COMPLICATION_TAPPED = 602,
            ATOM_WS_NOTIFICATION_BLOCKING = 780,
            ATOM_WS_NOTIFICATION_BRIDGEMODE_UPDATED = 822,
            ATOM_WS_NOTIFICATION_DISMISSAL_ACTIONED = 823,
            ATOM_WS_NOTIFICATION_ACTIONED = 824,
            ATOM_WS_NOTIFICATION_LATENCY = 880,
            ATOM_WIFI_BYTES_TRANSFER = 10000,
            ATOM_WIFI_BYTES_TRANSFER_BY_FG_BG = 10001,
            ATOM_MOBILE_BYTES_TRANSFER = 10002,
            ATOM_MOBILE_BYTES_TRANSFER_BY_FG_BG = 10003,
            ATOM_BLUETOOTH_BYTES_TRANSFER = 10006,
            ATOM_KERNEL_WAKELOCK = 10004,
            ATOM_SUBSYSTEM_SLEEP_STATE = 10005,
            ATOM_CPU_TIME_PER_UID = 10009,
            ATOM_CPU_TIME_PER_UID_FREQ = 10010,
            ATOM_WIFI_ACTIVITY_INFO = 10011,
            ATOM_MODEM_ACTIVITY_INFO = 10012,
            ATOM_BLUETOOTH_ACTIVITY_INFO = 10007,
            ATOM_PROCESS_MEMORY_STATE = 10013,
            ATOM_SYSTEM_ELAPSED_REALTIME = 10014,
            ATOM_SYSTEM_UPTIME = 10015,
            ATOM_CPU_ACTIVE_TIME = 10016,
            ATOM_CPU_CLUSTER_TIME = 10017,
            ATOM_DISK_SPACE = 10018,
            ATOM_REMAINING_BATTERY_CAPACITY = 10019,
            ATOM_FULL_BATTERY_CAPACITY = 10020,
            ATOM_TEMPERATURE = 10021,
            ATOM_BINDER_CALLS = 10022,
            ATOM_BINDER_CALLS_EXCEPTIONS = 10023,
            ATOM_LOOPER_STATS = 10024,
            ATOM_DISK_STATS = 10025,
            ATOM_DIRECTORY_USAGE = 10026,
            ATOM_APP_SIZE = 10027,
            ATOM_CATEGORY_SIZE = 10028,
            ATOM_PROC_STATS = 10029,
            ATOM_BATTERY_VOLTAGE = 10030,
            ATOM_NUM_FINGERPRINTS_ENROLLED = 10031,
            ATOM_DISK_IO = 10032,
            ATOM_POWER_PROFILE = 10033,
            ATOM_PROC_STATS_PKG_PROC = 10034,
            ATOM_PROCESS_CPU_TIME = 10035,
            ATOM_CPU_TIME_PER_THREAD_FREQ = 10037,
            ATOM_ON_DEVICE_POWER_MEASUREMENT = 10038,
            ATOM_DEVICE_CALCULATED_POWER_USE = 10039,
            ATOM_PROCESS_MEMORY_HIGH_WATER_MARK = 10042,
            ATOM_BATTERY_LEVEL = 10043,
            ATOM_BUILD_INFORMATION = 10044,
            ATOM_BATTERY_CYCLE_COUNT = 10045,
            ATOM_DEBUG_ELAPSED_CLOCK = 10046,
            ATOM_DEBUG_FAILING_ELAPSED_CLOCK = 10047,
            ATOM_NUM_FACES_ENROLLED = 10048,
            ATOM_ROLE_HOLDER = 10049,
            ATOM_DANGEROUS_PERMISSION_STATE = 10050,
            ATOM_TRAIN_INFO = 10051,
            ATOM_TIME_ZONE_DATA_INFO = 10052,
            ATOM_EXTERNAL_STORAGE_INFO = 10053,
            ATOM_GPU_STATS_GLOBAL_INFO = 10054,
            ATOM_GPU_STATS_APP_INFO = 10055,
            ATOM_SYSTEM_ION_HEAP_SIZE = 10056,
            ATOM_APPS_ON_EXTERNAL_STORAGE_INFO = 10057,
            ATOM_FACE_SETTINGS = 10058,
            ATOM_COOLING_DEVICE = 10059,
            ATOM_APP_OPS = 10060,
            ATOM_PROCESS_SYSTEM_ION_HEAP_SIZE = 10061,
            ATOM_SURFACEFLINGER_STATS_GLOBAL_INFO = 10062,
            ATOM_SURFACEFLINGER_STATS_LAYER_INFO = 10063,
            ATOM_PROCESS_MEMORY_SNAPSHOT = 10064,
            ATOM_VMS_CLIENT_STATS = 10065,
            ATOM_NOTIFICATION_REMOTE_VIEWS = 10066,
            ATOM_DANGEROUS_PERMISSION_STATE_SAMPLED = 10067,
            ATOM_GRAPHICS_STATS = 10068,
            ATOM_RUNTIME_APP_OP_ACCESS = 10069,
            ATOM_ION_HEAP_SIZE = 10070,
            ATOM_PACKAGE_NOTIFICATION_PREFERENCES = 10071,
            ATOM_PACKAGE_NOTIFICATION_CHANNEL_PREFERENCES = 10072,
            ATOM_PACKAGE_NOTIFICATION_CHANNEL_GROUP_PREFERENCES = 10073,
            ATOM_GNSS_STATS = 10074,
            ATOM_ATTRIBUTED_APP_OPS = 10075,
            ATOM_VOICE_CALL_SESSION = 10076,
            ATOM_VOICE_CALL_RAT_USAGE = 10077,
            ATOM_SIM_SLOT_STATE = 10078,
            ATOM_SUPPORTED_RADIO_ACCESS_FAMILY = 10079,
            ATOM_SETTING_SNAPSHOT = 10080,
            ATOM_BLOB_INFO = 10081,
            ATOM_DATA_USAGE_BYTES_TRANSFER = 10082,
            ATOM_BYTES_TRANSFER_BY_TAG_AND_METERED = 10083,
            ATOM_DND_MODE_RULE = 10084,
            ATOM_GENERAL_EXTERNAL_STORAGE_ACCESS_STATS = 10085,
            ATOM_INCOMING_SMS = 10086,
            ATOM_OUTGOING_SMS = 10087,
            ATOM_CARRIER_ID_TABLE_VERSION = 10088,
            ATOM_DATA_CALL_SESSION = 10089,
            ATOM_CELLULAR_SERVICE_STATE = 10090,
            ATOM_CELLULAR_DATA_SERVICE_SWITCH = 10091,
            ATOM_SYSTEM_MEMORY = 10092,
            ATOM_IMS_REGISTRATION_TERMINATION = 10093,
            ATOM_IMS_REGISTRATION_STATS = 10094,
            ATOM_CPU_TIME_PER_CLUSTER_FREQ = 10095,
            ATOM_CPU_CYCLES_PER_UID_CLUSTER = 10096,
            ATOM_DEVICE_ROTATED_DATA = 10097,
            ATOM_CPU_CYCLES_PER_THREAD_GROUP_CLUSTER = 10098,
            ATOM_MEDIA_DRM_ACTIVITY_INFO = 10099,
            ATOM_OEM_MANAGED_BYTES_TRANSFER = 10100,
            ATOM_GNSS_POWER_STATS = 10101,
            ATOM_TIME_ZONE_DETECTOR_STATE = 10102,
            ATOM_KEYSTORE2_STORAGE_STATS = 10103,
            ATOM_RKP_POOL_STATS = 10104,
            ATOM_PROCESS_DMABUF_MEMORY = 10105,
            ATOM_PENDING_ALARM_INFO = 10106,
            ATOM_USER_LEVEL_HIBERNATED_APPS = 10107,
            ATOM_LAUNCHER_LAYOUT_SNAPSHOT = 10108,
            ATOM_GLOBAL_HIBERNATED_APPS = 10109,
            ATOM_INPUT_EVENT_LATENCY_SKETCH = 10110,
            ATOM_BATTERY_USAGE_STATS_BEFORE_RESET = 10111,
            ATOM_BATTERY_USAGE_STATS_SINCE_RESET = 10112,
            ATOM_BATTERY_USAGE_STATS_SINCE_RESET_USING_POWER_PROFILE_MODEL = 10113,
            ATOM_INSTALLED_INCREMENTAL_PACKAGE = 10114,
            ATOM_TELEPHONY_NETWORK_REQUESTS = 10115,
            ATOM_APP_SEARCH_STORAGE_INFO = 10116,
            ATOM_VMSTAT = 10117,
            ATOM_KEYSTORE2_KEY_CREATION_WITH_GENERAL_INFO = 10118,
            ATOM_KEYSTORE2_KEY_CREATION_WITH_AUTH_INFO = 10119,
            ATOM_KEYSTORE2_KEY_CREATION_WITH_PURPOSE_AND_MODES_INFO = 10120,
            ATOM_KEYSTORE2_ATOM_WITH_OVERFLOW = 10121,
            ATOM_KEYSTORE2_KEY_OPERATION_WITH_PURPOSE_AND_MODES_INFO = 10122,
            ATOM_KEYSTORE2_KEY_OPERATION_WITH_GENERAL_INFO = 10123,
            ATOM_RKP_ERROR_STATS = 10124,
            ATOM_KEYSTORE2_CRASH_STATS = 10125,
            ATOM_VENDOR_APEX_INFO = 10126,
            ATOM_ACCESSIBILITY_SHORTCUT_STATS = 10127,
            ATOM_ACCESSIBILITY_FLOATING_MENU_STATS = 10128,
            ATOM_DATA_USAGE_BYTES_TRANSFER_V2 = 10129,
            ATOM_MEDIA_CAPABILITIES = 10130,
            ATOM_CAR_WATCHDOG_SYSTEM_IO_USAGE_SUMMARY = 10131,
            ATOM_CAR_WATCHDOG_UID_IO_USAGE_SUMMARY = 10132,
            ATOM_IMS_REGISTRATION_FEATURE_TAG_STATS = 10133,
            ATOM_RCS_CLIENT_PROVISIONING_STATS = 10134,
            ATOM_RCS_ACS_PROVISIONING_STATS = 10135,
            ATOM_SIP_DELEGATE_STATS = 10136,
            ATOM_SIP_TRANSPORT_FEATURE_TAG_STATS = 10137,
            ATOM_SIP_MESSAGE_RESPONSE = 10138,
            ATOM_SIP_TRANSPORT_SESSION = 10139,
            ATOM_IMS_DEDICATED_BEARER_LISTENER_EVENT = 10140,
            ATOM_IMS_DEDICATED_BEARER_EVENT = 10141,
            ATOM_IMS_REGISTRATION_SERVICE_DESC_STATS = 10142,
            ATOM_UCE_EVENT_STATS = 10143,
            ATOM_PRESENCE_NOTIFY_EVENT = 10144,
            ATOM_GBA_EVENT = 10145,
            ATOM_PER_SIM_STATUS = 10146,
            ATOM_GPU_WORK_PER_UID = 10147,
            ATOM_PERSISTENT_URI_PERMISSIONS_AMOUNT_PER_PACKAGE = 10148,
            ATOM_SIGNED_PARTITION_INFO = 10149,
            ATOM_PINNED_FILE_SIZES_PER_PACKAGE = 10150,
            ATOM_PENDING_INTENTS_PER_PACKAGE = 10151,
            ATOM_USER_INFO = 10152,
            ATOM_TELEPHONY_NETWORK_REQUESTS_V2 = 10153,
            ATOM_DEVICE_TELEPHONY_PROPERTIES = 10154,
            ATOM_REMOTE_KEY_PROVISIONING_ERROR_COUNTS = 10155,
            ATOM_SAFETY_STATE = 10156,
            ATOM_INCOMING_MMS = 10157,
            ATOM_OUTGOING_MMS = 10158,
            ATOM_MULTI_USER_INFO = 10160,
            ATOM_NETWORK_BPF_MAP_INFO = 10161,
            ATOM_OUTGOING_SHORT_CODE_SMS = 10162,
            ATOM_CONNECTIVITY_STATE_SAMPLE = 10163,
            ATOM_NETWORK_SELECTION_REMATCH_REASONS_INFO = 10164,
            ATOM_GAME_MODE_INFO = 10165,
            ATOM_GAME_MODE_CONFIGURATION = 10166,
            ATOM_GAME_MODE_LISTENER = 10167,
            ATOM_NETWORK_SLICE_REQUEST_COUNT = 10168,
            ATOM_WS_TILE_SNAPSHOT = 10169,
            ATOM_WS_ACTIVE_WATCH_FACE_COMPLICATION_SET_SNAPSHOT = 10170,
            ATOM_PROCESS_STATE = 10171,
            ATOM_PROCESS_ASSOCIATION = 10172,
            ATOM_ADPF_SYSTEM_COMPONENT_INFO = 10173,
            ATOM_NOTIFICATION_MEMORY_USE = 10174,
            ATOM_HDR_CAPABILITIES = 10175,
            ATOM_WS_FAVOURITE_WATCH_FACE_LIST_SNAPSHOT = 10176,
            ATOM_ADAPTIVE_AUTH_UNLOCK_AFTER_LOCK_REPORTED = 820,
            ATOM_THERMAL_STATUS_CALLED = 772,
            ATOM_THERMAL_HEADROOM_CALLED = 773,
            ATOM_THERMAL_HEADROOM_THRESHOLDS_CALLED = 774,
            ATOM_ADPF_HINT_SESSION_TID_CLEANUP = 839,
            ATOM_THERMAL_HEADROOM_THRESHOLDS = 10201,
            ATOM_ADPF_SESSION_SNAPSHOT = 10218,
            ATOM_JSSCRIPTENGINE_LATENCY_REPORTED = 483,
            ATOM_AD_SERVICES_API_CALLED = 435,
            ATOM_AD_SERVICES_MESUREMENT_REPORTS_UPLOADED = 436,
            ATOM_MOBILE_DATA_DOWNLOAD_FILE_GROUP_STATUS_REPORTED = 490,
            ATOM_MOBILE_DATA_DOWNLOAD_DOWNLOAD_RESULT_REPORTED = 502,
            ATOM_AD_SERVICES_SETTINGS_USAGE_REPORTED = 493,
            ATOM_BACKGROUND_FETCH_PROCESS_REPORTED = 496,
            ATOM_UPDATE_CUSTOM_AUDIENCE_PROCESS_REPORTED = 497,
            ATOM_RUN_AD_BIDDING_PROCESS_REPORTED = 498,
            ATOM_RUN_AD_SCORING_PROCESS_REPORTED = 499,
            ATOM_RUN_AD_SELECTION_PROCESS_REPORTED = 500,
            ATOM_RUN_AD_BIDDING_PER_CA_PROCESS_REPORTED = 501,
            ATOM_MOBILE_DATA_DOWNLOAD_FILE_GROUP_STORAGE_STATS_REPORTED = 503,
            ATOM_AD_SERVICES_MEASUREMENT_REGISTRATIONS = 512,
            ATOM_AD_SERVICES_GET_TOPICS_REPORTED = 535,
            ATOM_AD_SERVICES_EPOCH_COMPUTATION_GET_TOP_TOPICS_REPORTED = 536,
            ATOM_AD_SERVICES_EPOCH_COMPUTATION_CLASSIFIER_REPORTED = 537,
            ATOM_AD_SERVICES_BACK_COMPAT_GET_TOPICS_REPORTED = 598,
            ATOM_AD_SERVICES_BACK_COMPAT_EPOCH_COMPUTATION_CLASSIFIER_REPORTED = 599,
            ATOM_AD_SERVICES_MEASUREMENT_DEBUG_KEYS = 640,
            ATOM_AD_SERVICES_ERROR_REPORTED = 662,
            ATOM_AD_SERVICES_BACKGROUND_JOBS_EXECUTION_REPORTED = 663,
            ATOM_AD_SERVICES_MEASUREMENT_DELAYED_SOURCE_REGISTRATION = 673,
            ATOM_AD_SERVICES_MEASUREMENT_ATTRIBUTION = 674,
            ATOM_AD_SERVICES_MEASUREMENT_JOBS = 675,
            ATOM_AD_SERVICES_MEASUREMENT_WIPEOUT = 676,
            ATOM_AD_SERVICES_MEASUREMENT_AD_ID_MATCH_FOR_DEBUG_KEYS = 695,
            ATOM_AD_SERVICES_ENROLLMENT_DATA_STORED = 697,
            ATOM_AD_SERVICES_ENROLLMENT_FILE_DOWNLOADED = 698,
            ATOM_AD_SERVICES_ENROLLMENT_MATCHED = 699,
            ATOM_AD_SERVICES_CONSENT_MIGRATED = 702,
            ATOM_AD_SERVICES_ENROLLMENT_FAILED = 714,
            ATOM_AD_SERVICES_MEASUREMENT_CLICK_VERIFICATION = 756,
            ATOM_AD_SERVICES_ENCRYPTION_KEY_FETCHED = 765,
            ATOM_AD_SERVICES_ENCRYPTION_KEY_DB_TRANSACTION_ENDED = 766,
            ATOM_DESTINATION_REGISTERED_BEACONS = 767,
            ATOM_REPORT_INTERACTION_API_CALLED = 768,
            ATOM_INTERACTION_REPORTING_TABLE_CLEARED = 769,
            ATOM_APP_MANIFEST_CONFIG_HELPER_CALLED = 788,
            ATOM_AD_FILTERING_PROCESS_JOIN_CA_REPORTED = 793,
            ATOM_AD_FILTERING_PROCESS_AD_SELECTION_REPORTED = 794,
            ATOM_AD_COUNTER_HISTOGRAM_UPDATER_REPORTED = 795,
            ATOM_SIGNATURE_VERIFICATION = 807,
            ATOM_K_ANON_IMMEDIATE_SIGN_JOIN_STATUS_REPORTED = 808,
            ATOM_K_ANON_BACKGROUND_JOB_STATUS_REPORTED = 809,
            ATOM_K_ANON_INITIALIZE_STATUS_REPORTED = 810,
            ATOM_K_ANON_SIGN_STATUS_REPORTED = 811,
            ATOM_K_ANON_JOIN_STATUS_REPORTED = 812,
            ATOM_K_ANON_KEY_ATTESTATION_STATUS_REPORTED = 813,
            ATOM_GET_AD_SELECTION_DATA_API_CALLED = 814,
            ATOM_GET_AD_SELECTION_DATA_BUYER_INPUT_GENERATED = 815,
            ATOM_BACKGROUND_JOB_SCHEDULING_REPORTED = 834,
            ATOM_TOPICS_ENCRYPTION_EPOCH_COMPUTATION_REPORTED = 840,
            ATOM_TOPICS_ENCRYPTION_GET_TOPICS_REPORTED = 841,
            ATOM_ADSERVICES_SHELL_COMMAND_CALLED = 842,
            ATOM_UPDATE_SIGNALS_API_CALLED = 843,
            ATOM_ENCODING_JOB_RUN = 844,
            ATOM_ENCODING_JS_FETCH = 845,
            ATOM_ENCODING_JS_EXECUTION = 846,
            ATOM_PERSIST_AD_SELECTION_RESULT_CALLED = 847,
            ATOM_SERVER_AUCTION_KEY_FETCH_CALLED = 848,
            ATOM_SERVER_AUCTION_BACKGROUND_KEY_FETCH_ENABLED = 849,
            ATOM_AD_SERVICES_MEASUREMENT_PROCESS_ODP_REGISTRATION = 864,
            ATOM_AD_SERVICES_MEASUREMENT_NOTIFY_REGISTRATION_TO_ODP = 865,
            ATOM_SELECT_ADS_FROM_OUTCOMES_API_CALLED = 876,
            ATOM_REPORT_IMPRESSION_API_CALLED = 877,
            ATOM_AD_SERVICES_ENROLLMENT_TRANSACTION_STATS = 885,
            ATOM_AI_WALLPAPERS_BUTTON_PRESSED = 706,
            ATOM_AI_WALLPAPERS_TEMPLATE_SELECTED = 707,
            ATOM_AI_WALLPAPERS_TERM_SELECTED = 708,
            ATOM_AI_WALLPAPERS_WALLPAPER_SET = 709,
            ATOM_AI_WALLPAPERS_SESSION_SUMMARY = 710,
            ATOM_APEX_INSTALLATION_REQUESTED = 732,
            ATOM_APEX_INSTALLATION_STAGED = 733,
            ATOM_APEX_INSTALLATION_ENDED = 734,
            ATOM_APP_SEARCH_SET_SCHEMA_STATS_REPORTED = 385,
            ATOM_APP_SEARCH_SCHEMA_MIGRATION_STATS_REPORTED = 579,
            ATOM_APP_SEARCH_USAGE_SEARCH_INTENT_STATS_REPORTED = 825,
            ATOM_APP_SEARCH_USAGE_SEARCH_INTENT_RAW_QUERY_STATS_REPORTED = 826,
            ATOM_ART_DATUM_REPORTED = 332,
            ATOM_ART_DEVICE_DATUM_REPORTED = 550,
            ATOM_ART_DATUM_DELTA_REPORTED = 565,
            ATOM_ART_DEX2OAT_REPORTED = 929,
            ATOM_ART_DEVICE_STATUS = 10205,
            ATOM_BACKGROUND_DEXOPT_JOB_ENDED = 467,
            ATOM_PREREBOOT_DEXOPT_JOB_ENDED = 883,
            ATOM_ODREFRESH_REPORTED = 366,
            ATOM_ODSIGN_REPORTED = 548,
            ATOM_AUTOFILL_UI_EVENT_REPORTED = 603,
            ATOM_AUTOFILL_FILL_REQUEST_REPORTED = 604,
            ATOM_AUTOFILL_FILL_RESPONSE_REPORTED = 605,
            ATOM_AUTOFILL_SAVE_EVENT_REPORTED = 606,
            ATOM_AUTOFILL_SESSION_COMMITTED = 607,
            ATOM_AUTOFILL_FIELD_CLASSIFICATION_EVENT_REPORTED = 659,
            ATOM_CAR_RECENTS_EVENT_REPORTED = 770,
            ATOM_CAR_CALM_MODE_EVENT_REPORTED = 797,
            ATOM_CAR_WAKEUP_FROM_SUSPEND_REPORTED = 852,
            ATOM_PLUGIN_INITIALIZED = 655,
            ATOM_BLUETOOTH_HASHED_DEVICE_NAME_REPORTED = 613,
            ATOM_BLUETOOTH_L2CAP_COC_CLIENT_CONNECTION = 614,
            ATOM_BLUETOOTH_L2CAP_COC_SERVER_CONNECTION = 615,
            ATOM_BLUETOOTH_LE_SESSION_CONNECTED = 656,
            ATOM_RESTRICTED_BLUETOOTH_DEVICE_NAME_REPORTED = 666,
            ATOM_BLUETOOTH_PROFILE_CONNECTION_ATTEMPTED = 696,
            ATOM_BLUETOOTH_CONTENT_PROFILE_ERROR_REPORTED = 781,
            ATOM_BLUETOOTH_RFCOMM_CONNECTION_ATTEMPTED = 782,
            ATOM_REMOTE_DEVICE_INFORMATION_WITH_METRIC_ID = 862,
            ATOM_LE_APP_SCAN_STATE_CHANGED = 870,
            ATOM_LE_RADIO_SCAN_STOPPED = 871,
            ATOM_LE_SCAN_RESULT_RECEIVED = 872,
            ATOM_LE_SCAN_ABUSED = 873,
            ATOM_LE_ADV_STATE_CHANGED = 874,
            ATOM_LE_ADV_ERROR_REPORTED = 875,
            ATOM_A2DP_SESSION_REPORTED = 904,
            ATOM_BLUETOOTH_CROSS_LAYER_EVENT_REPORTED = 916,
            ATOM_BROADCAST_AUDIO_SESSION_REPORTED = 927,
            ATOM_BROADCAST_AUDIO_SYNC_REPORTED = 928,
            ATOM_BLUETOOTH_RFCOMM_CONNECTION_REPORTED_AT_CLOSE = 982,
            ATOM_CAMERA_FEATURE_COMBINATION_QUERY_EVENT = 900,
            ATOM_DAILY_KEEPALIVE_INFO_REPORTED = 650,
            ATOM_NETWORK_REQUEST_STATE_CHANGED = 779,
            ATOM_TETHERING_ACTIVE_SESSIONS_REPORTED = 925,
            ATOM_NETWORK_STATS_RECORDER_FILE_OPERATED = 783,
            ATOM_CORE_NETWORKING_TERRIBLE_ERROR_OCCURRED = 979,
            ATOM_APF_SESSION_INFO_REPORTED = 777,
            ATOM_IP_CLIENT_RA_INFO_REPORTED = 778,
            ATOM_VPN_CONNECTION_STATE_CHANGED = 850,
            ATOM_VPN_CONNECTION_REPORTED = 851,
            ATOM_CPU_POLICY = 10199,
            ATOM_CREDENTIAL_MANAGER_API_CALLED = 585,
            ATOM_CREDENTIAL_MANAGER_INIT_PHASE_REPORTED = 651,
            ATOM_CREDENTIAL_MANAGER_CANDIDATE_PHASE_REPORTED = 652,
            ATOM_CREDENTIAL_MANAGER_FINAL_PHASE_REPORTED = 653,
            ATOM_CREDENTIAL_MANAGER_TOTAL_REPORTED = 667,
            ATOM_CREDENTIAL_MANAGER_FINALNOUID_REPORTED = 668,
            ATOM_CREDENTIAL_MANAGER_GET_REPORTED = 669,
            ATOM_CREDENTIAL_MANAGER_AUTH_CLICK_REPORTED = 670,
            ATOM_CREDENTIAL_MANAGER_APIV2_CALLED = 671,
            ATOM_CRONET_ENGINE_CREATED = 703,
            ATOM_CRONET_TRAFFIC_REPORTED = 704,
            ATOM_CRONET_ENGINE_BUILDER_INITIALIZED = 762,
            ATOM_CRONET_HTTP_FLAGS_INITIALIZED = 763,
            ATOM_CRONET_INITIALIZED = 764,
            ATOM_DESKTOP_MODE_UI_CHANGED = 818,
            ATOM_DESKTOP_MODE_SESSION_TASK_UPDATE = 819,
            ATOM_DEVICE_LOCK_CHECK_IN_REQUEST_REPORTED = 726,
            ATOM_DEVICE_LOCK_PROVISIONING_COMPLETE_REPORTED = 727,
            ATOM_DEVICE_LOCK_KIOSK_APP_REQUEST_REPORTED = 728,
            ATOM_DEVICE_LOCK_CHECK_IN_RETRY_REPORTED = 789,
            ATOM_DEVICE_LOCK_PROVISION_FAILURE_REPORTED = 790,
            ATOM_DEVICE_LOCK_LOCK_UNLOCK_DEVICE_FAILURE_REPORTED = 791,
            ATOM_DEVICE_POLICY_MANAGEMENT_MODE = 10216,
            ATOM_DEVICE_POLICY_STATE = 10217,
            ATOM_DISPLAY_MODE_DIRECTOR_VOTE_CHANGED = 792,
            ATOM_EXTERNAL_DISPLAY_STATE_CHANGED = 806,
            ATOM_DND_STATE_CHANGED = 657,
            ATOM_DREAM_SETTING_CHANGED = 705,
            ATOM_DREAM_SETTING_SNAPSHOT = 10192,
            ATOM_EXPRESS_EVENT_REPORTED = 528,
            ATOM_EXPRESS_HISTOGRAM_SAMPLE_REPORTED = 593,
            ATOM_EXPRESS_UID_EVENT_REPORTED = 644,
            ATOM_EXPRESS_UID_HISTOGRAM_SAMPLE_REPORTED = 658,
            ATOM_FEDERATED_COMPUTE_API_CALLED = 712,
            ATOM_FEDERATED_COMPUTE_TRAINING_EVENT_REPORTED = 771,
            ATOM_EXAMPLE_ITERATOR_NEXT_LATENCY_REPORTED = 838,
            ATOM_FULL_SCREEN_INTENT_LAUNCHED = 631,
            ATOM_BAL_ALLOWED = 632,
            ATOM_IN_TASK_ACTIVITY_STARTED = 685,
            ATOM_CACHED_APPS_HIGH_WATERMARK = 10189,
            ATOM_STYLUS_PREDICTION_METRICS_REPORTED = 718,
            ATOM_USER_RISK_EVENT_REPORTED = 725,
            ATOM_MEDIA_PROJECTION_STATE_CHANGED = 729,
            ATOM_MEDIA_PROJECTION_TARGET_CHANGED = 730,
            ATOM_EXCESSIVE_BINDER_PROXY_COUNT_REPORTED = 853,
            ATOM_PROXY_BYTES_TRANSFER_BY_FG_BG = 10200,
            ATOM_MOBILE_BYTES_TRANSFER_BY_PROC_STATE = 10204,
            ATOM_BIOMETRIC_FRR_NOTIFICATION = 817,
            ATOM_SENSITIVE_CONTENT_MEDIA_PROJECTION_SESSION = 830,
            ATOM_SENSITIVE_NOTIFICATION_APP_PROTECTION_SESSION = 831,
            ATOM_SENSITIVE_NOTIFICATION_APP_PROTECTION_APPLIED = 832,
            ATOM_SENSITIVE_NOTIFICATION_REDACTION = 833,
            ATOM_SENSITIVE_CONTENT_APP_PROTECTION = 835,
            ATOM_APP_RESTRICTION_STATE_CHANGED = 866,
            ATOM_APPLICATION_GRAMMATICAL_INFLECTION_CHANGED = 584,
            ATOM_SYSTEM_GRAMMATICAL_INFLECTION_CHANGED = 816,
            ATOM_HDMI_EARC_STATUS_REPORTED = 701,
            ATOM_HDMI_SOUNDBAR_MODE_STATUS_REPORTED = 724,
            ATOM_HEALTH_CONNECT_API_CALLED = 616,
            ATOM_HEALTH_CONNECT_USAGE_STATS = 617,
            ATOM_HEALTH_CONNECT_STORAGE_STATS = 618,
            ATOM_HEALTH_CONNECT_API_INVOKED = 643,
            ATOM_EXERCISE_ROUTE_API_CALLED = 654,
            ATOM_HEALTH_CONNECT_UI_IMPRESSION = 623,
            ATOM_HEALTH_CONNECT_UI_INTERACTION = 624,
            ATOM_HEALTH_CONNECT_APP_OPENED_REPORTED = 625,
            ATOM_HOTWORD_EGRESS_SIZE_ATOM_REPORTED = 761,
            ATOM_IKE_SESSION_TERMINATED = 678,
            ATOM_IKE_LIVENESS_CHECK_SESSION_VALIDATED = 760,
            ATOM_NEGOTIATED_SECURITY_ASSOCIATION = 821,
            ATOM_KEYBOARD_CONFIGURED = 682,
            ATOM_KEYBOARD_SYSTEMS_EVENT_REPORTED = 683,
            ATOM_INPUTDEVICE_USAGE_REPORTED = 686,
            ATOM_TOUCHPAD_USAGE = 10191,
            ATOM_KERNEL_OOM_KILL_OCCURRED = 754,
            ATOM_EMERGENCY_STATE_CHANGED = 633,
            ATOM_CHRE_SIGNIFICANT_MOTION_STATE_CHANGED = 868,
            ATOM_MEDIA_CODEC_RECLAIM_REQUEST_COMPLETED = 600,
            ATOM_MEDIA_CODEC_STARTED = 641,
            ATOM_MEDIA_CODEC_STOPPED = 642,
            ATOM_MEDIA_CODEC_RENDERED = 684,
            ATOM_MEDIA_EDITING_ENDED_REPORTED = 798,
            ATOM_MTE_STATE = 10181,
            ATOM_NFC_OBSERVE_MODE_STATE_CHANGED = 855,
            ATOM_NFC_FIELD_CHANGED = 856,
            ATOM_NFC_POLLING_LOOP_NOTIFICATION_REPORTED = 857,
            ATOM_NFC_PROPRIETARY_CAPABILITIES_REPORTED = 858,
            ATOM_ONDEVICEPERSONALIZATION_API_CALLED = 711,
            ATOM_COMPONENT_STATE_CHANGED_REPORTED = 863,
            ATOM_PDF_LOAD_REPORTED = 859,
            ATOM_PDF_API_USAGE_REPORTED = 860,
            ATOM_PDF_SEARCH_REPORTED = 861,
            ATOM_PERMISSION_RATIONALE_DIALOG_VIEWED = 645,
            ATOM_PERMISSION_RATIONALE_DIALOG_ACTION_REPORTED = 646,
            ATOM_APP_DATA_SHARING_UPDATES_NOTIFICATION_INTERACTION = 647,
            ATOM_APP_DATA_SHARING_UPDATES_FRAGMENT_VIEWED = 648,
            ATOM_APP_DATA_SHARING_UPDATES_FRAGMENT_ACTION_REPORTED = 649,
            ATOM_ENHANCED_CONFIRMATION_DIALOG_RESULT_REPORTED = 827,
            ATOM_ENHANCED_CONFIRMATION_RESTRICTION_CLEARED = 828,
            ATOM_PHOTOPICKER_SESSION_INFO_REPORTED = 886,
            ATOM_PHOTOPICKER_API_INFO_REPORTED = 887,
            ATOM_PHOTOPICKER_UI_EVENT_LOGGED = 888,
            ATOM_PHOTOPICKER_MEDIA_ITEM_STATUS_REPORTED = 889,
            ATOM_PHOTOPICKER_PREVIEW_INFO_LOGGED = 890,
            ATOM_PHOTOPICKER_MENU_INTERACTION_LOGGED = 891,
            ATOM_PHOTOPICKER_BANNER_INTERACTION_LOGGED = 892,
            ATOM_PHOTOPICKER_MEDIA_LIBRARY_INFO_LOGGED = 893,
            ATOM_PHOTOPICKER_PAGE_INFO_LOGGED = 894,
            ATOM_PHOTOPICKER_MEDIA_GRID_SYNC_INFO_REPORTED = 895,
            ATOM_PHOTOPICKER_ALBUM_SYNC_INFO_REPORTED = 896,
            ATOM_PHOTOPICKER_SEARCH_INFO_REPORTED = 897,
            ATOM_SEARCH_DATA_EXTRACTION_DETAILS_REPORTED = 898,
            ATOM_EMBEDDED_PHOTOPICKER_INFO_REPORTED = 899,
            ATOM_ATOM_9999 = 9999,
            ATOM_ATOM_99999 = 99999,
            ATOM_SCREEN_OFF_REPORTED = 776,
            ATOM_SCREEN_TIMEOUT_OVERRIDE_REPORTED = 836,
            ATOM_SCREEN_INTERACTIVE_SESSION_REPORTED = 837,
            ATOM_SCREEN_DIM_REPORTED = 867,
            ATOM_MEDIA_PROVIDER_DATABASE_ROLLBACK_REPORTED = 784,
            ATOM_BACKUP_SETUP_STATUS_REPORTED = 785,
            ATOM_RKPD_POOL_STATS = 664,
            ATOM_RKPD_CLIENT_OPERATION = 665,
            ATOM_SANDBOX_API_CALLED = 488,
            ATOM_SANDBOX_ACTIVITY_EVENT_OCCURRED = 735,
            ATOM_SDK_SANDBOX_RESTRICTED_ACCESS_IN_SESSION = 796,
            ATOM_SANDBOX_SDK_STORAGE = 10159,
            ATOM_SELINUX_AUDIT_LOG = 799,
            ATOM_SETTINGS_SPA_REPORTED = 622,
            ATOM_TEST_EXTENSION_ATOM_REPORTED = 660,
            ATOM_TEST_RESTRICTED_ATOM_REPORTED = 672,
            ATOM_STATS_SOCKET_LOSS_REPORTED = 752,
            ATOM_LOCKSCREEN_SHORTCUT_SELECTED = 611,
            ATOM_LOCKSCREEN_SHORTCUT_TRIGGERED = 612,
            ATOM_LAUNCHER_IMPRESSION_EVENT_V2 = 716,
            ATOM_DISPLAY_SWITCH_LATENCY_TRACKED = 753,
            ATOM_NOTIFICATION_LISTENER_SERVICE = 829,
            ATOM_NAV_HANDLE_TOUCH_POINTS = 869,
            ATOM_EMERGENCY_NUMBER_DIALED = 637,
            ATOM_CELLULAR_RADIO_POWER_STATE_CHANGED = 713,
            ATOM_EMERGENCY_NUMBERS_INFO = 10180,
            ATOM_DATA_NETWORK_VALIDATION = 10207,
            ATOM_DATA_RAT_STATE_CHANGED = 854,
            ATOM_CONNECTED_CHANNEL_CHANGED = 882,
            ATOM_QUALIFIED_RAT_LIST_CHANGED = 634,
            ATOM_QNS_IMS_CALL_DROP_STATS = 635,
            ATOM_QNS_FALLBACK_RESTRICTION_CHANGED = 636,
            ATOM_QNS_RAT_PREFERENCE_MISMATCH_INFO = 10177,
            ATOM_QNS_HANDOVER_TIME_MILLIS = 10178,
            ATOM_QNS_HANDOVER_PINGPONG = 10179,
            ATOM_SATELLITE_CONTROLLER = 10182,
            ATOM_SATELLITE_SESSION = 10183,
            ATOM_SATELLITE_INCOMING_DATAGRAM = 10184,
            ATOM_SATELLITE_OUTGOING_DATAGRAM = 10185,
            ATOM_SATELLITE_PROVISION = 10186,
            ATOM_SATELLITE_SOS_MESSAGE_RECOMMENDER = 10187,
            ATOM_CARRIER_ROAMING_SATELLITE_SESSION = 10211,
            ATOM_CARRIER_ROAMING_SATELLITE_CONTROLLER_STATS = 10212,
            ATOM_CONTROLLER_STATS_PER_PACKAGE = 10213,
            ATOM_SATELLITE_ENTITLEMENT = 10214,
            ATOM_SATELLITE_CONFIG_UPDATER = 10215,
            ATOM_SATELLITE_ACCESS_CONTROLLER = 10219,
            ATOM_CELLULAR_IDENTIFIER_DISCLOSED = 800,
            ATOM_THREADNETWORK_TELEMETRY_DATA_REPORTED = 738,
            ATOM_THREADNETWORK_TOPO_ENTRY_REPEATED = 739,
            ATOM_THREADNETWORK_DEVICE_INFO_REPORTED = 740,
            ATOM_BOOT_INTEGRITY_INFO_REPORTED = 775,
            ATOM_TV_LOW_POWER_STANDBY_POLICY = 679,
            ATOM_EXTERNAL_TV_INPUT_EVENT = 717,
            ATOM_UWB_ACTIVITY_INFO = 10188,
            ATOM_MEDIATOR_UPDATED = 721,
            ATOM_SYSPROXY_BLUETOOTH_BYTES_TRANSFER = 10196,
            ATOM_SYSPROXY_CONNECTION_UPDATED = 786,
            ATOM_MEDIA_ACTION_REPORTED = 608,
            ATOM_MEDIA_CONTROLS_LAUNCHED = 609,
            ATOM_MEDIA_SESSION_STATE_CHANGED = 677,
            ATOM_WEAR_MEDIA_OUTPUT_SWITCHER_DEVICE_SCAN_API_LATENCY = 757,
            ATOM_WEAR_MEDIA_OUTPUT_SWITCHER_SASS_DEVICE_UNAVAILABLE = 758,
            ATOM_WEAR_MEDIA_OUTPUT_SWITCHER_FASTPAIR_API_TIMEOUT = 759,
            ATOM_WEAR_MODE_STATE_CHANGED = 715,
            ATOM_RENDERER_INITIALIZED = 736,
            ATOM_SCHEMA_VERSION_RECEIVED = 737,
            ATOM_LAYOUT_INSPECTED = 741,
            ATOM_LAYOUT_EXPRESSION_INSPECTED = 742,
            ATOM_LAYOUT_ANIMATIONS_INSPECTED = 743,
            ATOM_MATERIAL_COMPONENTS_INSPECTED = 744,
            ATOM_TILE_REQUESTED = 745,
            ATOM_STATE_RESPONSE_RECEIVED = 746,
            ATOM_TILE_RESPONSE_RECEIVED = 747,
            ATOM_INFLATION_FINISHED = 748,
            ATOM_INFLATION_FAILED = 749,
            ATOM_IGNORED_INFLATION_FAILURES_REPORTED = 750,
            ATOM_DRAWABLE_RENDERED = 751,
            ATOM_WEAR_ADAPTIVE_SUSPEND_STATS_REPORTED = 619,
            ATOM_WEAR_POWER_ANOMALY_SERVICE_OPERATIONAL_STATS_REPORTED = 620,
            ATOM_WEAR_POWER_ANOMALY_SERVICE_EVENT_STATS_REPORTED = 621,
            ATOM_WS_WEAR_TIME_SESSION = 610,
            ATOM_WS_INCOMING_CALL_ACTION_REPORTED = 626,
            ATOM_WS_CALL_DISCONNECTION_REPORTED = 627,
            ATOM_WS_CALL_DURATION_REPORTED = 628,
            ATOM_WS_CALL_USER_EXPERIENCE_LATENCY_REPORTED = 629,
            ATOM_WS_CALL_INTERACTION_REPORTED = 630,
            ATOM_WS_ON_BODY_STATE_CHANGED = 787,
            ATOM_WS_WATCH_FACE_RESTRICTED_COMPLICATIONS_IMPACTED = 802,
            ATOM_WS_WATCH_FACE_DEFAULT_RESTRICTED_COMPLICATIONS_REMOVED = 803,
            ATOM_WS_COMPLICATIONS_IMPACTED_NOTIFICATION_EVENT_REPORTED = 804,
            ATOM_WS_STANDALONE_MODE_SNAPSHOT = 10197,
            ATOM_WS_FAVORITE_WATCH_FACE_SNAPSHOT = 10206,
            ATOM_WEAR_POWER_MENU_OPENED = 731,
            ATOM_WEAR_ASSISTANT_OPENED = 755,
            ATOM_WIFI_AWARE_NDP_REPORTED = 638,
            ATOM_WIFI_AWARE_ATTACH_REPORTED = 639,
            ATOM_WIFI_SELF_RECOVERY_TRIGGERED = 661,
            ATOM_SOFT_AP_STARTED = 680,
            ATOM_SOFT_AP_STOPPED = 681,
            ATOM_WIFI_LOCK_RELEASED = 687,
            ATOM_WIFI_LOCK_DEACTIVATED = 688,
            ATOM_WIFI_CONFIG_SAVED = 689,
            ATOM_WIFI_AWARE_RESOURCE_USING_CHANGED = 690,
            ATOM_WIFI_AWARE_HAL_API_CALLED = 691,
            ATOM_WIFI_LOCAL_ONLY_REQUEST_RECEIVED = 692,
            ATOM_WIFI_LOCAL_ONLY_REQUEST_SCAN_TRIGGERED = 693,
            ATOM_WIFI_THREAD_TASK_EXECUTED = 694,
            ATOM_WIFI_STATE_CHANGED = 700,
            ATOM_PNO_SCAN_STARTED = 719,
            ATOM_PNO_SCAN_STOPPED = 720,
            ATOM_WIFI_IS_UNUSABLE_REPORTED = 722,
            ATOM_WIFI_AP_CAPABILITIES_REPORTED = 723,
            ATOM_SOFT_AP_STATE_CHANGED = 805,
            ATOM_SCORER_PREDICTION_RESULT_REPORTED = 884,
            ATOM_WIFI_AWARE_CAPABILITIES = 10190,
            ATOM_WIFI_MODULE_INFO = 10193,
            ATOM_WIFI_SETTING_INFO = 10194,
            ATOM_WIFI_COMPLEX_SETTING_INFO = 10195,
            ATOM_WIFI_CONFIGURED_NETWORK_INFO = 10198
        }

        interface IProcessStatsConfig {
            quirks?: (perfetto.protos.ProcessStatsConfig.Quirks[]|null);
            scanAllProcessesOnStart?: (boolean|null);
            recordThreadNames?: (boolean|null);
            procStatsPollMs?: (number|null);
            procStatsCacheTtlMs?: (number|null);
            resolveProcessFds?: (boolean|null);
            scanSmapsRollup?: (boolean|null);
            recordProcessAge?: (boolean|null);
            recordProcessRuntime?: (boolean|null);
        }

        class ProcessStatsConfig implements IProcessStatsConfig {
            constructor(p?: perfetto.protos.IProcessStatsConfig);
            public quirks: perfetto.protos.ProcessStatsConfig.Quirks[];
            public scanAllProcessesOnStart: boolean;
            public recordThreadNames: boolean;
            public procStatsPollMs: number;
            public procStatsCacheTtlMs: number;
            public resolveProcessFds: boolean;
            public scanSmapsRollup: boolean;
            public recordProcessAge: boolean;
            public recordProcessRuntime: boolean;
            public static create(properties?: perfetto.protos.IProcessStatsConfig): perfetto.protos.ProcessStatsConfig;
            public static encode(m: perfetto.protos.IProcessStatsConfig, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.ProcessStatsConfig;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.ProcessStatsConfig;
            public static toObject(m: perfetto.protos.ProcessStatsConfig, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace ProcessStatsConfig {

            enum Quirks {
                QUIRKS_UNSPECIFIED = 0,
                DISABLE_INITIAL_DUMP = 1,
                DISABLE_ON_DEMAND = 2
            }
        }

        interface IHeapprofdConfig {
            samplingIntervalBytes?: (number|null);
            adaptiveSamplingShmemThreshold?: (number|null);
            adaptiveSamplingMaxSamplingIntervalBytes?: (number|null);
            processCmdline?: (string[]|null);
            pid?: (number[]|null);
            targetInstalledBy?: (string[]|null);
            heaps?: (string[]|null);
            excludeHeaps?: (string[]|null);
            streamAllocations?: (boolean|null);
            heapSamplingIntervals?: (number[]|null);
            allHeaps?: (boolean|null);
            all?: (boolean|null);
            minAnonymousMemoryKb?: (number|null);
            maxHeapprofdMemoryKb?: (number|null);
            maxHeapprofdCpuSecs?: (number|null);
            skipSymbolPrefix?: (string[]|null);
            continuousDumpConfig?: (perfetto.protos.HeapprofdConfig.IContinuousDumpConfig|null);
            shmemSizeBytes?: (number|null);
            blockClient?: (boolean|null);
            blockClientTimeoutUs?: (number|null);
            noStartup?: (boolean|null);
            noRunning?: (boolean|null);
            dumpAtMax?: (boolean|null);
            disableForkTeardown?: (boolean|null);
            disableVforkDetection?: (boolean|null);
        }

        class HeapprofdConfig implements IHeapprofdConfig {
            constructor(p?: perfetto.protos.IHeapprofdConfig);
            public samplingIntervalBytes: number;
            public adaptiveSamplingShmemThreshold: number;
            public adaptiveSamplingMaxSamplingIntervalBytes: number;
            public processCmdline: string[];
            public pid: number[];
            public targetInstalledBy: string[];
            public heaps: string[];
            public excludeHeaps: string[];
            public streamAllocations: boolean;
            public heapSamplingIntervals: number[];
            public allHeaps: boolean;
            public all: boolean;
            public minAnonymousMemoryKb: number;
            public maxHeapprofdMemoryKb: number;
            public maxHeapprofdCpuSecs: number;
            public skipSymbolPrefix: string[];
            public continuousDumpConfig?: (perfetto.protos.HeapprofdConfig.IContinuousDumpConfig|null);
            public shmemSizeBytes: number;
            public blockClient: boolean;
            public blockClientTimeoutUs: number;
            public noStartup: boolean;
            public noRunning: boolean;
            public dumpAtMax: boolean;
            public disableForkTeardown: boolean;
            public disableVforkDetection: boolean;
            public static create(properties?: perfetto.protos.IHeapprofdConfig): perfetto.protos.HeapprofdConfig;
            public static encode(m: perfetto.protos.IHeapprofdConfig, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.HeapprofdConfig;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.HeapprofdConfig;
            public static toObject(m: perfetto.protos.HeapprofdConfig, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace HeapprofdConfig {

            interface IContinuousDumpConfig {
                dumpPhaseMs?: (number|null);
                dumpIntervalMs?: (number|null);
            }

            class ContinuousDumpConfig implements IContinuousDumpConfig {
                constructor(p?: perfetto.protos.HeapprofdConfig.IContinuousDumpConfig);
                public dumpPhaseMs: number;
                public dumpIntervalMs: number;
                public static create(properties?: perfetto.protos.HeapprofdConfig.IContinuousDumpConfig): perfetto.protos.HeapprofdConfig.ContinuousDumpConfig;
                public static encode(m: perfetto.protos.HeapprofdConfig.IContinuousDumpConfig, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.HeapprofdConfig.ContinuousDumpConfig;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.HeapprofdConfig.ContinuousDumpConfig;
                public static toObject(m: perfetto.protos.HeapprofdConfig.ContinuousDumpConfig, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }
        }

        interface IJavaHprofConfig {
            processCmdline?: (string[]|null);
            pid?: (number[]|null);
            targetInstalledBy?: (string[]|null);
            continuousDumpConfig?: (perfetto.protos.JavaHprofConfig.IContinuousDumpConfig|null);
            minAnonymousMemoryKb?: (number|null);
            dumpSmaps?: (boolean|null);
            ignoredTypes?: (string[]|null);
        }

        class JavaHprofConfig implements IJavaHprofConfig {
            constructor(p?: perfetto.protos.IJavaHprofConfig);
            public processCmdline: string[];
            public pid: number[];
            public targetInstalledBy: string[];
            public continuousDumpConfig?: (perfetto.protos.JavaHprofConfig.IContinuousDumpConfig|null);
            public minAnonymousMemoryKb: number;
            public dumpSmaps: boolean;
            public ignoredTypes: string[];
            public static create(properties?: perfetto.protos.IJavaHprofConfig): perfetto.protos.JavaHprofConfig;
            public static encode(m: perfetto.protos.IJavaHprofConfig, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.JavaHprofConfig;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.JavaHprofConfig;
            public static toObject(m: perfetto.protos.JavaHprofConfig, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace JavaHprofConfig {

            interface IContinuousDumpConfig {
                dumpPhaseMs?: (number|null);
                dumpIntervalMs?: (number|null);
                scanPidsOnlyOnStart?: (boolean|null);
            }

            class ContinuousDumpConfig implements IContinuousDumpConfig {
                constructor(p?: perfetto.protos.JavaHprofConfig.IContinuousDumpConfig);
                public dumpPhaseMs: number;
                public dumpIntervalMs: number;
                public scanPidsOnlyOnStart: boolean;
                public static create(properties?: perfetto.protos.JavaHprofConfig.IContinuousDumpConfig): perfetto.protos.JavaHprofConfig.ContinuousDumpConfig;
                public static encode(m: perfetto.protos.JavaHprofConfig.IContinuousDumpConfig, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.JavaHprofConfig.ContinuousDumpConfig;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.JavaHprofConfig.ContinuousDumpConfig;
                public static toObject(m: perfetto.protos.JavaHprofConfig.ContinuousDumpConfig, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }
        }

        interface IPerfEventConfig {
            timebase?: (perfetto.protos.PerfEvents.ITimebase|null);
            followers?: (perfetto.protos.IFollowerEvent[]|null);
            callstackSampling?: (perfetto.protos.PerfEventConfig.ICallstackSampling|null);
            ringBufferReadPeriodMs?: (number|null);
            ringBufferPages?: (number|null);
            maxEnqueuedFootprintKb?: (number|null);
            maxDaemonMemoryKb?: (number|null);
            remoteDescriptorTimeoutMs?: (number|null);
            unwindStateClearPeriodMs?: (number|null);
            targetInstalledBy?: (string[]|null);
            allCpus?: (boolean|null);
            samplingFrequency?: (number|null);
            kernelFrames?: (boolean|null);
            targetPid?: (number[]|null);
            targetCmdline?: (string[]|null);
            excludePid?: (number[]|null);
            excludeCmdline?: (string[]|null);
            additionalCmdlineCount?: (number|null);
        }

        class PerfEventConfig implements IPerfEventConfig {
            constructor(p?: perfetto.protos.IPerfEventConfig);
            public timebase?: (perfetto.protos.PerfEvents.ITimebase|null);
            public followers: perfetto.protos.IFollowerEvent[];
            public callstackSampling?: (perfetto.protos.PerfEventConfig.ICallstackSampling|null);
            public ringBufferReadPeriodMs: number;
            public ringBufferPages: number;
            public maxEnqueuedFootprintKb: number;
            public maxDaemonMemoryKb: number;
            public remoteDescriptorTimeoutMs: number;
            public unwindStateClearPeriodMs: number;
            public targetInstalledBy: string[];
            public allCpus: boolean;
            public samplingFrequency: number;
            public kernelFrames: boolean;
            public targetPid: number[];
            public targetCmdline: string[];
            public excludePid: number[];
            public excludeCmdline: string[];
            public additionalCmdlineCount: number;
            public static create(properties?: perfetto.protos.IPerfEventConfig): perfetto.protos.PerfEventConfig;
            public static encode(m: perfetto.protos.IPerfEventConfig, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.PerfEventConfig;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.PerfEventConfig;
            public static toObject(m: perfetto.protos.PerfEventConfig, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace PerfEventConfig {

            interface ICallstackSampling {
                scope?: (perfetto.protos.PerfEventConfig.IScope|null);
                kernelFrames?: (boolean|null);
                userFrames?: (perfetto.protos.PerfEventConfig.UnwindMode|null);
            }

            class CallstackSampling implements ICallstackSampling {
                constructor(p?: perfetto.protos.PerfEventConfig.ICallstackSampling);
                public scope?: (perfetto.protos.PerfEventConfig.IScope|null);
                public kernelFrames: boolean;
                public userFrames: perfetto.protos.PerfEventConfig.UnwindMode;
                public static create(properties?: perfetto.protos.PerfEventConfig.ICallstackSampling): perfetto.protos.PerfEventConfig.CallstackSampling;
                public static encode(m: perfetto.protos.PerfEventConfig.ICallstackSampling, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.PerfEventConfig.CallstackSampling;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.PerfEventConfig.CallstackSampling;
                public static toObject(m: perfetto.protos.PerfEventConfig.CallstackSampling, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            interface IScope {
                targetPid?: (number[]|null);
                targetCmdline?: (string[]|null);
                excludePid?: (number[]|null);
                excludeCmdline?: (string[]|null);
                additionalCmdlineCount?: (number|null);
                processShardCount?: (number|null);
            }

            class Scope implements IScope {
                constructor(p?: perfetto.protos.PerfEventConfig.IScope);
                public targetPid: number[];
                public targetCmdline: string[];
                public excludePid: number[];
                public excludeCmdline: string[];
                public additionalCmdlineCount: number;
                public processShardCount: number;
                public static create(properties?: perfetto.protos.PerfEventConfig.IScope): perfetto.protos.PerfEventConfig.Scope;
                public static encode(m: perfetto.protos.PerfEventConfig.IScope, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.PerfEventConfig.Scope;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.PerfEventConfig.Scope;
                public static toObject(m: perfetto.protos.PerfEventConfig.Scope, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            enum UnwindMode {
                UNWIND_UNKNOWN = 0,
                UNWIND_SKIP = 1,
                UNWIND_DWARF = 2,
                UNWIND_FRAME_POINTER = 3
            }
        }

        interface IPerfEvents {
        }

        class PerfEvents implements IPerfEvents {
            constructor(p?: perfetto.protos.IPerfEvents);
            public static create(properties?: perfetto.protos.IPerfEvents): perfetto.protos.PerfEvents;
            public static encode(m: perfetto.protos.IPerfEvents, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.PerfEvents;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.PerfEvents;
            public static toObject(m: perfetto.protos.PerfEvents, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace PerfEvents {

            interface ITimebase {
                frequency?: (number|null);
                period?: (number|null);
                counter?: (perfetto.protos.PerfEvents.Counter|null);
                tracepoint?: (perfetto.protos.PerfEvents.ITracepoint|null);
                rawEvent?: (perfetto.protos.PerfEvents.IRawEvent|null);
                timestampClock?: (perfetto.protos.PerfEvents.PerfClock|null);
                name?: (string|null);
            }

            class Timebase implements ITimebase {
                constructor(p?: perfetto.protos.PerfEvents.ITimebase);
                public frequency?: (number|null);
                public period?: (number|null);
                public counter?: (perfetto.protos.PerfEvents.Counter|null);
                public tracepoint?: (perfetto.protos.PerfEvents.ITracepoint|null);
                public rawEvent?: (perfetto.protos.PerfEvents.IRawEvent|null);
                public timestampClock: perfetto.protos.PerfEvents.PerfClock;
                public name: string;
                public interval?: ("frequency"|"period");
                public event?: ("counter"|"tracepoint"|"rawEvent");
                public static create(properties?: perfetto.protos.PerfEvents.ITimebase): perfetto.protos.PerfEvents.Timebase;
                public static encode(m: perfetto.protos.PerfEvents.ITimebase, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.PerfEvents.Timebase;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.PerfEvents.Timebase;
                public static toObject(m: perfetto.protos.PerfEvents.Timebase, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            enum Counter {
                UNKNOWN_COUNTER = 0,
                SW_CPU_CLOCK = 1,
                SW_PAGE_FAULTS = 2,
                SW_TASK_CLOCK = 3,
                SW_CONTEXT_SWITCHES = 4,
                SW_CPU_MIGRATIONS = 5,
                SW_PAGE_FAULTS_MIN = 6,
                SW_PAGE_FAULTS_MAJ = 7,
                SW_ALIGNMENT_FAULTS = 8,
                SW_EMULATION_FAULTS = 9,
                SW_DUMMY = 20,
                HW_CPU_CYCLES = 10,
                HW_INSTRUCTIONS = 11,
                HW_CACHE_REFERENCES = 12,
                HW_CACHE_MISSES = 13,
                HW_BRANCH_INSTRUCTIONS = 14,
                HW_BRANCH_MISSES = 15,
                HW_BUS_CYCLES = 16,
                HW_STALLED_CYCLES_FRONTEND = 17,
                HW_STALLED_CYCLES_BACKEND = 18,
                HW_REF_CPU_CYCLES = 19
            }

            interface ITracepoint {
                name?: (string|null);
                filter?: (string|null);
            }

            class Tracepoint implements ITracepoint {
                constructor(p?: perfetto.protos.PerfEvents.ITracepoint);
                public name: string;
                public filter: string;
                public static create(properties?: perfetto.protos.PerfEvents.ITracepoint): perfetto.protos.PerfEvents.Tracepoint;
                public static encode(m: perfetto.protos.PerfEvents.ITracepoint, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.PerfEvents.Tracepoint;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.PerfEvents.Tracepoint;
                public static toObject(m: perfetto.protos.PerfEvents.Tracepoint, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            interface IRawEvent {
                type?: (number|null);
                config?: (number|null);
                config1?: (number|null);
                config2?: (number|null);
            }

            class RawEvent implements IRawEvent {
                constructor(p?: perfetto.protos.PerfEvents.IRawEvent);
                public type: number;
                public config: number;
                public config1: number;
                public config2: number;
                public static create(properties?: perfetto.protos.PerfEvents.IRawEvent): perfetto.protos.PerfEvents.RawEvent;
                public static encode(m: perfetto.protos.PerfEvents.IRawEvent, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.PerfEvents.RawEvent;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.PerfEvents.RawEvent;
                public static toObject(m: perfetto.protos.PerfEvents.RawEvent, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            enum PerfClock {
                UNKNOWN_PERF_CLOCK = 0,
                PERF_CLOCK_REALTIME = 1,
                PERF_CLOCK_MONOTONIC = 2,
                PERF_CLOCK_MONOTONIC_RAW = 3,
                PERF_CLOCK_BOOTTIME = 4
            }
        }

        interface IFollowerEvent {
            counter?: (perfetto.protos.PerfEvents.Counter|null);
            tracepoint?: (perfetto.protos.PerfEvents.ITracepoint|null);
            rawEvent?: (perfetto.protos.PerfEvents.IRawEvent|null);
            name?: (string|null);
        }

        class FollowerEvent implements IFollowerEvent {
            constructor(p?: perfetto.protos.IFollowerEvent);
            public counter?: (perfetto.protos.PerfEvents.Counter|null);
            public tracepoint?: (perfetto.protos.PerfEvents.ITracepoint|null);
            public rawEvent?: (perfetto.protos.PerfEvents.IRawEvent|null);
            public name: string;
            public event?: ("counter"|"tracepoint"|"rawEvent");
            public static create(properties?: perfetto.protos.IFollowerEvent): perfetto.protos.FollowerEvent;
            public static encode(m: perfetto.protos.IFollowerEvent, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.FollowerEvent;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.FollowerEvent;
            public static toObject(m: perfetto.protos.FollowerEvent, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface ISysStatsConfig {
            meminfoPeriodMs?: (number|null);
            meminfoCounters?: (perfetto.protos.MeminfoCounters[]|null);
            vmstatPeriodMs?: (number|null);
            vmstatCounters?: (perfetto.protos.VmstatCounters[]|null);
            statPeriodMs?: (number|null);
            statCounters?: (perfetto.protos.SysStatsConfig.StatCounters[]|null);
            devfreqPeriodMs?: (number|null);
            cpufreqPeriodMs?: (number|null);
            buddyinfoPeriodMs?: (number|null);
            diskstatPeriodMs?: (number|null);
            psiPeriodMs?: (number|null);
            thermalPeriodMs?: (number|null);
            cpuidlePeriodMs?: (number|null);
            gpufreqPeriodMs?: (number|null);
        }

        class SysStatsConfig implements ISysStatsConfig {
            constructor(p?: perfetto.protos.ISysStatsConfig);
            public meminfoPeriodMs: number;
            public meminfoCounters: perfetto.protos.MeminfoCounters[];
            public vmstatPeriodMs: number;
            public vmstatCounters: perfetto.protos.VmstatCounters[];
            public statPeriodMs: number;
            public statCounters: perfetto.protos.SysStatsConfig.StatCounters[];
            public devfreqPeriodMs: number;
            public cpufreqPeriodMs: number;
            public buddyinfoPeriodMs: number;
            public diskstatPeriodMs: number;
            public psiPeriodMs: number;
            public thermalPeriodMs: number;
            public cpuidlePeriodMs: number;
            public gpufreqPeriodMs: number;
            public static create(properties?: perfetto.protos.ISysStatsConfig): perfetto.protos.SysStatsConfig;
            public static encode(m: perfetto.protos.ISysStatsConfig, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.SysStatsConfig;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.SysStatsConfig;
            public static toObject(m: perfetto.protos.SysStatsConfig, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace SysStatsConfig {

            enum StatCounters {
                STAT_UNSPECIFIED = 0,
                STAT_CPU_TIMES = 1,
                STAT_IRQ_COUNTS = 2,
                STAT_SOFTIRQ_COUNTS = 3,
                STAT_FORK_COUNT = 4
            }
        }

        enum MeminfoCounters {
            MEMINFO_UNSPECIFIED = 0,
            MEMINFO_MEM_TOTAL = 1,
            MEMINFO_MEM_FREE = 2,
            MEMINFO_MEM_AVAILABLE = 3,
            MEMINFO_BUFFERS = 4,
            MEMINFO_CACHED = 5,
            MEMINFO_SWAP_CACHED = 6,
            MEMINFO_ACTIVE = 7,
            MEMINFO_INACTIVE = 8,
            MEMINFO_ACTIVE_ANON = 9,
            MEMINFO_INACTIVE_ANON = 10,
            MEMINFO_ACTIVE_FILE = 11,
            MEMINFO_INACTIVE_FILE = 12,
            MEMINFO_UNEVICTABLE = 13,
            MEMINFO_MLOCKED = 14,
            MEMINFO_SWAP_TOTAL = 15,
            MEMINFO_SWAP_FREE = 16,
            MEMINFO_DIRTY = 17,
            MEMINFO_WRITEBACK = 18,
            MEMINFO_ANON_PAGES = 19,
            MEMINFO_MAPPED = 20,
            MEMINFO_SHMEM = 21,
            MEMINFO_SLAB = 22,
            MEMINFO_SLAB_RECLAIMABLE = 23,
            MEMINFO_SLAB_UNRECLAIMABLE = 24,
            MEMINFO_KERNEL_STACK = 25,
            MEMINFO_PAGE_TABLES = 26,
            MEMINFO_COMMIT_LIMIT = 27,
            MEMINFO_COMMITED_AS = 28,
            MEMINFO_VMALLOC_TOTAL = 29,
            MEMINFO_VMALLOC_USED = 30,
            MEMINFO_VMALLOC_CHUNK = 31,
            MEMINFO_CMA_TOTAL = 32,
            MEMINFO_CMA_FREE = 33,
            MEMINFO_GPU = 34,
            MEMINFO_ZRAM = 35,
            MEMINFO_MISC = 36,
            MEMINFO_ION_HEAP = 37,
            MEMINFO_ION_HEAP_POOL = 38
        }

        enum VmstatCounters {
            VMSTAT_UNSPECIFIED = 0,
            VMSTAT_NR_FREE_PAGES = 1,
            VMSTAT_NR_ALLOC_BATCH = 2,
            VMSTAT_NR_INACTIVE_ANON = 3,
            VMSTAT_NR_ACTIVE_ANON = 4,
            VMSTAT_NR_INACTIVE_FILE = 5,
            VMSTAT_NR_ACTIVE_FILE = 6,
            VMSTAT_NR_UNEVICTABLE = 7,
            VMSTAT_NR_MLOCK = 8,
            VMSTAT_NR_ANON_PAGES = 9,
            VMSTAT_NR_MAPPED = 10,
            VMSTAT_NR_FILE_PAGES = 11,
            VMSTAT_NR_DIRTY = 12,
            VMSTAT_NR_WRITEBACK = 13,
            VMSTAT_NR_SLAB_RECLAIMABLE = 14,
            VMSTAT_NR_SLAB_UNRECLAIMABLE = 15,
            VMSTAT_NR_PAGE_TABLE_PAGES = 16,
            VMSTAT_NR_KERNEL_STACK = 17,
            VMSTAT_NR_OVERHEAD = 18,
            VMSTAT_NR_UNSTABLE = 19,
            VMSTAT_NR_BOUNCE = 20,
            VMSTAT_NR_VMSCAN_WRITE = 21,
            VMSTAT_NR_VMSCAN_IMMEDIATE_RECLAIM = 22,
            VMSTAT_NR_WRITEBACK_TEMP = 23,
            VMSTAT_NR_ISOLATED_ANON = 24,
            VMSTAT_NR_ISOLATED_FILE = 25,
            VMSTAT_NR_SHMEM = 26,
            VMSTAT_NR_DIRTIED = 27,
            VMSTAT_NR_WRITTEN = 28,
            VMSTAT_NR_PAGES_SCANNED = 29,
            VMSTAT_WORKINGSET_REFAULT = 30,
            VMSTAT_WORKINGSET_ACTIVATE = 31,
            VMSTAT_WORKINGSET_NODERECLAIM = 32,
            VMSTAT_NR_ANON_TRANSPARENT_HUGEPAGES = 33,
            VMSTAT_NR_FREE_CMA = 34,
            VMSTAT_NR_SWAPCACHE = 35,
            VMSTAT_NR_DIRTY_THRESHOLD = 36,
            VMSTAT_NR_DIRTY_BACKGROUND_THRESHOLD = 37,
            VMSTAT_PGPGIN = 38,
            VMSTAT_PGPGOUT = 39,
            VMSTAT_PGPGOUTCLEAN = 40,
            VMSTAT_PSWPIN = 41,
            VMSTAT_PSWPOUT = 42,
            VMSTAT_PGALLOC_DMA = 43,
            VMSTAT_PGALLOC_NORMAL = 44,
            VMSTAT_PGALLOC_MOVABLE = 45,
            VMSTAT_PGFREE = 46,
            VMSTAT_PGACTIVATE = 47,
            VMSTAT_PGDEACTIVATE = 48,
            VMSTAT_PGFAULT = 49,
            VMSTAT_PGMAJFAULT = 50,
            VMSTAT_PGREFILL_DMA = 51,
            VMSTAT_PGREFILL_NORMAL = 52,
            VMSTAT_PGREFILL_MOVABLE = 53,
            VMSTAT_PGSTEAL_KSWAPD_DMA = 54,
            VMSTAT_PGSTEAL_KSWAPD_NORMAL = 55,
            VMSTAT_PGSTEAL_KSWAPD_MOVABLE = 56,
            VMSTAT_PGSTEAL_DIRECT_DMA = 57,
            VMSTAT_PGSTEAL_DIRECT_NORMAL = 58,
            VMSTAT_PGSTEAL_DIRECT_MOVABLE = 59,
            VMSTAT_PGSCAN_KSWAPD_DMA = 60,
            VMSTAT_PGSCAN_KSWAPD_NORMAL = 61,
            VMSTAT_PGSCAN_KSWAPD_MOVABLE = 62,
            VMSTAT_PGSCAN_DIRECT_DMA = 63,
            VMSTAT_PGSCAN_DIRECT_NORMAL = 64,
            VMSTAT_PGSCAN_DIRECT_MOVABLE = 65,
            VMSTAT_PGSCAN_DIRECT_THROTTLE = 66,
            VMSTAT_PGINODESTEAL = 67,
            VMSTAT_SLABS_SCANNED = 68,
            VMSTAT_KSWAPD_INODESTEAL = 69,
            VMSTAT_KSWAPD_LOW_WMARK_HIT_QUICKLY = 70,
            VMSTAT_KSWAPD_HIGH_WMARK_HIT_QUICKLY = 71,
            VMSTAT_PAGEOUTRUN = 72,
            VMSTAT_ALLOCSTALL = 73,
            VMSTAT_PGROTATED = 74,
            VMSTAT_DROP_PAGECACHE = 75,
            VMSTAT_DROP_SLAB = 76,
            VMSTAT_PGMIGRATE_SUCCESS = 77,
            VMSTAT_PGMIGRATE_FAIL = 78,
            VMSTAT_COMPACT_MIGRATE_SCANNED = 79,
            VMSTAT_COMPACT_FREE_SCANNED = 80,
            VMSTAT_COMPACT_ISOLATED = 81,
            VMSTAT_COMPACT_STALL = 82,
            VMSTAT_COMPACT_FAIL = 83,
            VMSTAT_COMPACT_SUCCESS = 84,
            VMSTAT_COMPACT_DAEMON_WAKE = 85,
            VMSTAT_UNEVICTABLE_PGS_CULLED = 86,
            VMSTAT_UNEVICTABLE_PGS_SCANNED = 87,
            VMSTAT_UNEVICTABLE_PGS_RESCUED = 88,
            VMSTAT_UNEVICTABLE_PGS_MLOCKED = 89,
            VMSTAT_UNEVICTABLE_PGS_MUNLOCKED = 90,
            VMSTAT_UNEVICTABLE_PGS_CLEARED = 91,
            VMSTAT_UNEVICTABLE_PGS_STRANDED = 92,
            VMSTAT_NR_ZSPAGES = 93,
            VMSTAT_NR_ION_HEAP = 94,
            VMSTAT_NR_GPU_HEAP = 95,
            VMSTAT_ALLOCSTALL_DMA = 96,
            VMSTAT_ALLOCSTALL_MOVABLE = 97,
            VMSTAT_ALLOCSTALL_NORMAL = 98,
            VMSTAT_COMPACT_DAEMON_FREE_SCANNED = 99,
            VMSTAT_COMPACT_DAEMON_MIGRATE_SCANNED = 100,
            VMSTAT_NR_FASTRPC = 101,
            VMSTAT_NR_INDIRECTLY_RECLAIMABLE = 102,
            VMSTAT_NR_ION_HEAP_POOL = 103,
            VMSTAT_NR_KERNEL_MISC_RECLAIMABLE = 104,
            VMSTAT_NR_SHADOW_CALL_STACK_BYTES = 105,
            VMSTAT_NR_SHMEM_HUGEPAGES = 106,
            VMSTAT_NR_SHMEM_PMDMAPPED = 107,
            VMSTAT_NR_UNRECLAIMABLE_PAGES = 108,
            VMSTAT_NR_ZONE_ACTIVE_ANON = 109,
            VMSTAT_NR_ZONE_ACTIVE_FILE = 110,
            VMSTAT_NR_ZONE_INACTIVE_ANON = 111,
            VMSTAT_NR_ZONE_INACTIVE_FILE = 112,
            VMSTAT_NR_ZONE_UNEVICTABLE = 113,
            VMSTAT_NR_ZONE_WRITE_PENDING = 114,
            VMSTAT_OOM_KILL = 115,
            VMSTAT_PGLAZYFREE = 116,
            VMSTAT_PGLAZYFREED = 117,
            VMSTAT_PGREFILL = 118,
            VMSTAT_PGSCAN_DIRECT = 119,
            VMSTAT_PGSCAN_KSWAPD = 120,
            VMSTAT_PGSKIP_DMA = 121,
            VMSTAT_PGSKIP_MOVABLE = 122,
            VMSTAT_PGSKIP_NORMAL = 123,
            VMSTAT_PGSTEAL_DIRECT = 124,
            VMSTAT_PGSTEAL_KSWAPD = 125,
            VMSTAT_SWAP_RA = 126,
            VMSTAT_SWAP_RA_HIT = 127,
            VMSTAT_WORKINGSET_RESTORE = 128,
            VMSTAT_ALLOCSTALL_DEVICE = 129,
            VMSTAT_ALLOCSTALL_DMA32 = 130,
            VMSTAT_BALLOON_DEFLATE = 131,
            VMSTAT_BALLOON_INFLATE = 132,
            VMSTAT_BALLOON_MIGRATE = 133,
            VMSTAT_CMA_ALLOC_FAIL = 134,
            VMSTAT_CMA_ALLOC_SUCCESS = 135,
            VMSTAT_NR_FILE_HUGEPAGES = 136,
            VMSTAT_NR_FILE_PMDMAPPED = 137,
            VMSTAT_NR_FOLL_PIN_ACQUIRED = 138,
            VMSTAT_NR_FOLL_PIN_RELEASED = 139,
            VMSTAT_NR_SEC_PAGE_TABLE_PAGES = 140,
            VMSTAT_NR_SHADOW_CALL_STACK = 141,
            VMSTAT_NR_SWAPCACHED = 142,
            VMSTAT_NR_THROTTLED_WRITTEN = 143,
            VMSTAT_PGALLOC_DEVICE = 144,
            VMSTAT_PGALLOC_DMA32 = 145,
            VMSTAT_PGDEMOTE_DIRECT = 146,
            VMSTAT_PGDEMOTE_KSWAPD = 147,
            VMSTAT_PGREUSE = 148,
            VMSTAT_PGSCAN_ANON = 149,
            VMSTAT_PGSCAN_FILE = 150,
            VMSTAT_PGSKIP_DEVICE = 151,
            VMSTAT_PGSKIP_DMA32 = 152,
            VMSTAT_PGSTEAL_ANON = 153,
            VMSTAT_PGSTEAL_FILE = 154,
            VMSTAT_THP_COLLAPSE_ALLOC = 155,
            VMSTAT_THP_COLLAPSE_ALLOC_FAILED = 156,
            VMSTAT_THP_DEFERRED_SPLIT_PAGE = 157,
            VMSTAT_THP_FAULT_ALLOC = 158,
            VMSTAT_THP_FAULT_FALLBACK = 159,
            VMSTAT_THP_FAULT_FALLBACK_CHARGE = 160,
            VMSTAT_THP_FILE_ALLOC = 161,
            VMSTAT_THP_FILE_FALLBACK = 162,
            VMSTAT_THP_FILE_FALLBACK_CHARGE = 163,
            VMSTAT_THP_FILE_MAPPED = 164,
            VMSTAT_THP_MIGRATION_FAIL = 165,
            VMSTAT_THP_MIGRATION_SPLIT = 166,
            VMSTAT_THP_MIGRATION_SUCCESS = 167,
            VMSTAT_THP_SCAN_EXCEED_NONE_PTE = 168,
            VMSTAT_THP_SCAN_EXCEED_SHARE_PTE = 169,
            VMSTAT_THP_SCAN_EXCEED_SWAP_PTE = 170,
            VMSTAT_THP_SPLIT_PAGE = 171,
            VMSTAT_THP_SPLIT_PAGE_FAILED = 172,
            VMSTAT_THP_SPLIT_PMD = 173,
            VMSTAT_THP_SWPOUT = 174,
            VMSTAT_THP_SWPOUT_FALLBACK = 175,
            VMSTAT_THP_ZERO_PAGE_ALLOC = 176,
            VMSTAT_THP_ZERO_PAGE_ALLOC_FAILED = 177,
            VMSTAT_VMA_LOCK_ABORT = 178,
            VMSTAT_VMA_LOCK_MISS = 179,
            VMSTAT_VMA_LOCK_RETRY = 180,
            VMSTAT_VMA_LOCK_SUCCESS = 181,
            VMSTAT_WORKINGSET_ACTIVATE_ANON = 182,
            VMSTAT_WORKINGSET_ACTIVATE_FILE = 183,
            VMSTAT_WORKINGSET_NODES = 184,
            VMSTAT_WORKINGSET_REFAULT_ANON = 185,
            VMSTAT_WORKINGSET_REFAULT_FILE = 186,
            VMSTAT_WORKINGSET_RESTORE_ANON = 187,
            VMSTAT_WORKINGSET_RESTORE_FILE = 188
        }

        interface ITestConfig {
            messageCount?: (number|null);
            maxMessagesPerSecond?: (number|null);
            seed?: (number|null);
            messageSize?: (number|null);
            sendBatchOnRegister?: (boolean|null);
            dummyFields?: (perfetto.protos.TestConfig.IDummyFields|null);
        }

        class TestConfig implements ITestConfig {
            constructor(p?: perfetto.protos.ITestConfig);
            public messageCount: number;
            public maxMessagesPerSecond: number;
            public seed: number;
            public messageSize: number;
            public sendBatchOnRegister: boolean;
            public dummyFields?: (perfetto.protos.TestConfig.IDummyFields|null);
            public static create(properties?: perfetto.protos.ITestConfig): perfetto.protos.TestConfig;
            public static encode(m: perfetto.protos.ITestConfig, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.TestConfig;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.TestConfig;
            public static toObject(m: perfetto.protos.TestConfig, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace TestConfig {

            interface IDummyFields {
                fieldUint32?: (number|null);
                fieldInt32?: (number|null);
                fieldUint64?: (number|null);
                fieldInt64?: (number|null);
                fieldFixed64?: (number|null);
                fieldSfixed64?: (number|null);
                fieldFixed32?: (number|null);
                fieldSfixed32?: (number|null);
                fieldDouble?: (number|null);
                fieldFloat?: (number|null);
                fieldSint64?: (number|null);
                fieldSint32?: (number|null);
                fieldString?: (string|null);
                fieldBytes?: (Uint8Array|null);
            }

            class DummyFields implements IDummyFields {
                constructor(p?: perfetto.protos.TestConfig.IDummyFields);
                public fieldUint32: number;
                public fieldInt32: number;
                public fieldUint64: number;
                public fieldInt64: number;
                public fieldFixed64: number;
                public fieldSfixed64: number;
                public fieldFixed32: number;
                public fieldSfixed32: number;
                public fieldDouble: number;
                public fieldFloat: number;
                public fieldSint64: number;
                public fieldSint32: number;
                public fieldString: string;
                public fieldBytes: Uint8Array;
                public static create(properties?: perfetto.protos.TestConfig.IDummyFields): perfetto.protos.TestConfig.DummyFields;
                public static encode(m: perfetto.protos.TestConfig.IDummyFields, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.TestConfig.DummyFields;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.TestConfig.DummyFields;
                public static toObject(m: perfetto.protos.TestConfig.DummyFields, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }
        }

        interface ITrackEventConfig {
            disabledCategories?: (string[]|null);
            enabledCategories?: (string[]|null);
            disabledTags?: (string[]|null);
            enabledTags?: (string[]|null);
            disableIncrementalTimestamps?: (boolean|null);
            timestampUnitMultiplier?: (number|null);
            filterDebugAnnotations?: (boolean|null);
            enableThreadTimeSampling?: (boolean|null);
            filterDynamicEventNames?: (boolean|null);
        }

        class TrackEventConfig implements ITrackEventConfig {
            constructor(p?: perfetto.protos.ITrackEventConfig);
            public disabledCategories: string[];
            public enabledCategories: string[];
            public disabledTags: string[];
            public enabledTags: string[];
            public disableIncrementalTimestamps: boolean;
            public timestampUnitMultiplier: number;
            public filterDebugAnnotations: boolean;
            public enableThreadTimeSampling: boolean;
            public filterDynamicEventNames: boolean;
            public static create(properties?: perfetto.protos.ITrackEventConfig): perfetto.protos.TrackEventConfig;
            public static encode(m: perfetto.protos.ITrackEventConfig, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.TrackEventConfig;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.TrackEventConfig;
            public static toObject(m: perfetto.protos.TrackEventConfig, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface ISystemInfoConfig {
        }

        class SystemInfoConfig implements ISystemInfoConfig {
            constructor(p?: perfetto.protos.ISystemInfoConfig);
            public static create(properties?: perfetto.protos.ISystemInfoConfig): perfetto.protos.SystemInfoConfig;
            public static encode(m: perfetto.protos.ISystemInfoConfig, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.SystemInfoConfig;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.SystemInfoConfig;
            public static toObject(m: perfetto.protos.SystemInfoConfig, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IIPCFrame {
            requestId?: (number|null);
            msgBindService?: (perfetto.protos.IPCFrame.IBindService|null);
            msgBindServiceReply?: (perfetto.protos.IPCFrame.IBindServiceReply|null);
            msgInvokeMethod?: (perfetto.protos.IPCFrame.IInvokeMethod|null);
            msgInvokeMethodReply?: (perfetto.protos.IPCFrame.IInvokeMethodReply|null);
            msgRequestError?: (perfetto.protos.IPCFrame.IRequestError|null);
            setPeerIdentity?: (perfetto.protos.IPCFrame.ISetPeerIdentity|null);
            dataForTesting?: (Uint8Array[]|null);
        }

        class IPCFrame implements IIPCFrame {
            constructor(p?: perfetto.protos.IIPCFrame);
            public requestId: number;
            public msgBindService?: (perfetto.protos.IPCFrame.IBindService|null);
            public msgBindServiceReply?: (perfetto.protos.IPCFrame.IBindServiceReply|null);
            public msgInvokeMethod?: (perfetto.protos.IPCFrame.IInvokeMethod|null);
            public msgInvokeMethodReply?: (perfetto.protos.IPCFrame.IInvokeMethodReply|null);
            public msgRequestError?: (perfetto.protos.IPCFrame.IRequestError|null);
            public setPeerIdentity?: (perfetto.protos.IPCFrame.ISetPeerIdentity|null);
            public dataForTesting: Uint8Array[];
            public msg?: ("msgBindService"|"msgBindServiceReply"|"msgInvokeMethod"|"msgInvokeMethodReply"|"msgRequestError"|"setPeerIdentity");
            public static create(properties?: perfetto.protos.IIPCFrame): perfetto.protos.IPCFrame;
            public static encode(m: perfetto.protos.IIPCFrame, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.IPCFrame;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.IPCFrame;
            public static toObject(m: perfetto.protos.IPCFrame, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace IPCFrame {

            interface IBindService {
                serviceName?: (string|null);
            }

            class BindService implements IBindService {
                constructor(p?: perfetto.protos.IPCFrame.IBindService);
                public serviceName: string;
                public static create(properties?: perfetto.protos.IPCFrame.IBindService): perfetto.protos.IPCFrame.BindService;
                public static encode(m: perfetto.protos.IPCFrame.IBindService, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.IPCFrame.BindService;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.IPCFrame.BindService;
                public static toObject(m: perfetto.protos.IPCFrame.BindService, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            interface IBindServiceReply {
                success?: (boolean|null);
                serviceId?: (number|null);
                methods?: (perfetto.protos.IPCFrame.BindServiceReply.IMethodInfo[]|null);
            }

            class BindServiceReply implements IBindServiceReply {
                constructor(p?: perfetto.protos.IPCFrame.IBindServiceReply);
                public success: boolean;
                public serviceId: number;
                public methods: perfetto.protos.IPCFrame.BindServiceReply.IMethodInfo[];
                public static create(properties?: perfetto.protos.IPCFrame.IBindServiceReply): perfetto.protos.IPCFrame.BindServiceReply;
                public static encode(m: perfetto.protos.IPCFrame.IBindServiceReply, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.IPCFrame.BindServiceReply;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.IPCFrame.BindServiceReply;
                public static toObject(m: perfetto.protos.IPCFrame.BindServiceReply, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            namespace BindServiceReply {

                interface IMethodInfo {
                    id?: (number|null);
                    name?: (string|null);
                }

                class MethodInfo implements IMethodInfo {
                    constructor(p?: perfetto.protos.IPCFrame.BindServiceReply.IMethodInfo);
                    public id: number;
                    public name: string;
                    public static create(properties?: perfetto.protos.IPCFrame.BindServiceReply.IMethodInfo): perfetto.protos.IPCFrame.BindServiceReply.MethodInfo;
                    public static encode(m: perfetto.protos.IPCFrame.BindServiceReply.IMethodInfo, w?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.IPCFrame.BindServiceReply.MethodInfo;
                    public static fromObject(d: { [k: string]: any }): perfetto.protos.IPCFrame.BindServiceReply.MethodInfo;
                    public static toObject(m: perfetto.protos.IPCFrame.BindServiceReply.MethodInfo, o?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }
            }

            interface IInvokeMethod {
                serviceId?: (number|null);
                methodId?: (number|null);
                argsProto?: (Uint8Array|null);
                dropReply?: (boolean|null);
            }

            class InvokeMethod implements IInvokeMethod {
                constructor(p?: perfetto.protos.IPCFrame.IInvokeMethod);
                public serviceId: number;
                public methodId: number;
                public argsProto: Uint8Array;
                public dropReply: boolean;
                public static create(properties?: perfetto.protos.IPCFrame.IInvokeMethod): perfetto.protos.IPCFrame.InvokeMethod;
                public static encode(m: perfetto.protos.IPCFrame.IInvokeMethod, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.IPCFrame.InvokeMethod;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.IPCFrame.InvokeMethod;
                public static toObject(m: perfetto.protos.IPCFrame.InvokeMethod, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            interface IInvokeMethodReply {
                success?: (boolean|null);
                hasMore?: (boolean|null);
                replyProto?: (Uint8Array|null);
            }

            class InvokeMethodReply implements IInvokeMethodReply {
                constructor(p?: perfetto.protos.IPCFrame.IInvokeMethodReply);
                public success: boolean;
                public hasMore: boolean;
                public replyProto: Uint8Array;
                public static create(properties?: perfetto.protos.IPCFrame.IInvokeMethodReply): perfetto.protos.IPCFrame.InvokeMethodReply;
                public static encode(m: perfetto.protos.IPCFrame.IInvokeMethodReply, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.IPCFrame.InvokeMethodReply;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.IPCFrame.InvokeMethodReply;
                public static toObject(m: perfetto.protos.IPCFrame.InvokeMethodReply, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            interface IRequestError {
                error?: (string|null);
            }

            class RequestError implements IRequestError {
                constructor(p?: perfetto.protos.IPCFrame.IRequestError);
                public error: string;
                public static create(properties?: perfetto.protos.IPCFrame.IRequestError): perfetto.protos.IPCFrame.RequestError;
                public static encode(m: perfetto.protos.IPCFrame.IRequestError, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.IPCFrame.RequestError;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.IPCFrame.RequestError;
                public static toObject(m: perfetto.protos.IPCFrame.RequestError, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            interface ISetPeerIdentity {
                pid?: (number|null);
                uid?: (number|null);
                machineIdHint?: (string|null);
            }

            class SetPeerIdentity implements ISetPeerIdentity {
                constructor(p?: perfetto.protos.IPCFrame.ISetPeerIdentity);
                public pid: number;
                public uid: number;
                public machineIdHint: string;
                public static create(properties?: perfetto.protos.IPCFrame.ISetPeerIdentity): perfetto.protos.IPCFrame.SetPeerIdentity;
                public static encode(m: perfetto.protos.IPCFrame.ISetPeerIdentity, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.IPCFrame.SetPeerIdentity;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.IPCFrame.SetPeerIdentity;
                public static toObject(m: perfetto.protos.IPCFrame.SetPeerIdentity, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }
        }

        interface IPerfettoMetatrace {
            eventId?: (number|null);
            counterId?: (number|null);
            eventName?: (string|null);
            eventNameIid?: (number|null);
            counterName?: (string|null);
            eventDurationNs?: (number|null);
            counterValue?: (number|null);
            threadId?: (number|null);
            hasOverruns?: (boolean|null);
            args?: (perfetto.protos.PerfettoMetatrace.IArg[]|null);
            internedStrings?: (perfetto.protos.PerfettoMetatrace.IInternedString[]|null);
        }

        class PerfettoMetatrace implements IPerfettoMetatrace {
            constructor(p?: perfetto.protos.IPerfettoMetatrace);
            public eventId?: (number|null);
            public counterId?: (number|null);
            public eventName?: (string|null);
            public eventNameIid?: (number|null);
            public counterName?: (string|null);
            public eventDurationNs: number;
            public counterValue: number;
            public threadId: number;
            public hasOverruns: boolean;
            public args: perfetto.protos.PerfettoMetatrace.IArg[];
            public internedStrings: perfetto.protos.PerfettoMetatrace.IInternedString[];
            public recordType?: ("eventId"|"counterId"|"eventName"|"eventNameIid"|"counterName");
            public static create(properties?: perfetto.protos.IPerfettoMetatrace): perfetto.protos.PerfettoMetatrace;
            public static encode(m: perfetto.protos.IPerfettoMetatrace, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.PerfettoMetatrace;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.PerfettoMetatrace;
            public static toObject(m: perfetto.protos.PerfettoMetatrace, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace PerfettoMetatrace {

            interface IArg {
                key?: (string|null);
                keyIid?: (number|null);
                value?: (string|null);
                valueIid?: (number|null);
            }

            class Arg implements IArg {
                constructor(p?: perfetto.protos.PerfettoMetatrace.IArg);
                public key?: (string|null);
                public keyIid?: (number|null);
                public value?: (string|null);
                public valueIid?: (number|null);
                public keyOrInternedKey?: ("key"|"keyIid");
                public valueOrInternedValue?: ("value"|"valueIid");
                public static create(properties?: perfetto.protos.PerfettoMetatrace.IArg): perfetto.protos.PerfettoMetatrace.Arg;
                public static encode(m: perfetto.protos.PerfettoMetatrace.IArg, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.PerfettoMetatrace.Arg;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.PerfettoMetatrace.Arg;
                public static toObject(m: perfetto.protos.PerfettoMetatrace.Arg, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            interface IInternedString {
                iid?: (number|null);
                value?: (string|null);
            }

            class InternedString implements IInternedString {
                constructor(p?: perfetto.protos.PerfettoMetatrace.IInternedString);
                public iid: number;
                public value: string;
                public static create(properties?: perfetto.protos.PerfettoMetatrace.IInternedString): perfetto.protos.PerfettoMetatrace.InternedString;
                public static encode(m: perfetto.protos.PerfettoMetatrace.IInternedString, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.PerfettoMetatrace.InternedString;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.PerfettoMetatrace.InternedString;
                public static toObject(m: perfetto.protos.PerfettoMetatrace.InternedString, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }
        }

        enum TraceProcessorApiVersion {
            TRACE_PROCESSOR_CURRENT_API_VERSION = 14
        }

        interface ITraceProcessorRpcStream {
            msg?: (perfetto.protos.ITraceProcessorRpc[]|null);
        }

        class TraceProcessorRpcStream implements ITraceProcessorRpcStream {
            constructor(p?: perfetto.protos.ITraceProcessorRpcStream);
            public msg: perfetto.protos.ITraceProcessorRpc[];
            public static create(properties?: perfetto.protos.ITraceProcessorRpcStream): perfetto.protos.TraceProcessorRpcStream;
            public static encode(m: perfetto.protos.ITraceProcessorRpcStream, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.TraceProcessorRpcStream;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.TraceProcessorRpcStream;
            public static toObject(m: perfetto.protos.TraceProcessorRpcStream, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface ITraceProcessorRpc {
            seq?: (number|null);
            fatalError?: (string|null);
            request?: (perfetto.protos.TraceProcessorRpc.TraceProcessorMethod|null);
            response?: (perfetto.protos.TraceProcessorRpc.TraceProcessorMethod|null);
            invalidRequest?: (perfetto.protos.TraceProcessorRpc.TraceProcessorMethod|null);
            appendTraceData?: (Uint8Array|null);
            queryArgs?: (perfetto.protos.IQueryArgs|null);
            computeMetricArgs?: (perfetto.protos.IComputeMetricArgs|null);
            enableMetatraceArgs?: (perfetto.protos.IEnableMetatraceArgs|null);
            resetTraceProcessorArgs?: (perfetto.protos.IResetTraceProcessorArgs|null);
            registerSqlPackageArgs?: (perfetto.protos.IRegisterSqlPackageArgs|null);
            appendResult?: (perfetto.protos.IAppendTraceDataResult|null);
            queryResult?: (perfetto.protos.IQueryResult|null);
            metricResult?: (perfetto.protos.IComputeMetricResult|null);
            metricDescriptors?: (perfetto.protos.IDescriptorSet|null);
            metatrace?: (perfetto.protos.IDisableAndReadMetatraceResult|null);
            status?: (perfetto.protos.IStatusResult|null);
            registerSqlPackageResult?: (perfetto.protos.IRegisterSqlPackageResult|null);
            finalizeDataResult?: (perfetto.protos.IFinalizeDataResult|null);
        }

        class TraceProcessorRpc implements ITraceProcessorRpc {
            constructor(p?: perfetto.protos.ITraceProcessorRpc);
            public seq: number;
            public fatalError: string;
            public request?: (perfetto.protos.TraceProcessorRpc.TraceProcessorMethod|null);
            public response?: (perfetto.protos.TraceProcessorRpc.TraceProcessorMethod|null);
            public invalidRequest?: (perfetto.protos.TraceProcessorRpc.TraceProcessorMethod|null);
            public appendTraceData?: (Uint8Array|null);
            public queryArgs?: (perfetto.protos.IQueryArgs|null);
            public computeMetricArgs?: (perfetto.protos.IComputeMetricArgs|null);
            public enableMetatraceArgs?: (perfetto.protos.IEnableMetatraceArgs|null);
            public resetTraceProcessorArgs?: (perfetto.protos.IResetTraceProcessorArgs|null);
            public registerSqlPackageArgs?: (perfetto.protos.IRegisterSqlPackageArgs|null);
            public appendResult?: (perfetto.protos.IAppendTraceDataResult|null);
            public queryResult?: (perfetto.protos.IQueryResult|null);
            public metricResult?: (perfetto.protos.IComputeMetricResult|null);
            public metricDescriptors?: (perfetto.protos.IDescriptorSet|null);
            public metatrace?: (perfetto.protos.IDisableAndReadMetatraceResult|null);
            public status?: (perfetto.protos.IStatusResult|null);
            public registerSqlPackageResult?: (perfetto.protos.IRegisterSqlPackageResult|null);
            public finalizeDataResult?: (perfetto.protos.IFinalizeDataResult|null);
            public type?: ("request"|"response"|"invalidRequest");
            public args?: ("appendTraceData"|"queryArgs"|"computeMetricArgs"|"enableMetatraceArgs"|"resetTraceProcessorArgs"|"registerSqlPackageArgs"|"appendResult"|"queryResult"|"metricResult"|"metricDescriptors"|"metatrace"|"status"|"registerSqlPackageResult"|"finalizeDataResult");
            public static create(properties?: perfetto.protos.ITraceProcessorRpc): perfetto.protos.TraceProcessorRpc;
            public static encode(m: perfetto.protos.ITraceProcessorRpc, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.TraceProcessorRpc;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.TraceProcessorRpc;
            public static toObject(m: perfetto.protos.TraceProcessorRpc, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace TraceProcessorRpc {

            enum TraceProcessorMethod {
                TPM_UNSPECIFIED = 0,
                TPM_APPEND_TRACE_DATA = 1,
                TPM_FINALIZE_TRACE_DATA = 2,
                TPM_QUERY_STREAMING = 3,
                TPM_COMPUTE_METRIC = 5,
                TPM_GET_METRIC_DESCRIPTORS = 6,
                TPM_RESTORE_INITIAL_TABLES = 7,
                TPM_ENABLE_METATRACE = 8,
                TPM_DISABLE_AND_READ_METATRACE = 9,
                TPM_GET_STATUS = 10,
                TPM_RESET_TRACE_PROCESSOR = 11,
                TPM_REGISTER_SQL_PACKAGE = 13
            }
        }

        interface IAppendTraceDataResult {
            totalBytesParsed?: (number|null);
            error?: (string|null);
        }

        class AppendTraceDataResult implements IAppendTraceDataResult {
            constructor(p?: perfetto.protos.IAppendTraceDataResult);
            public totalBytesParsed: number;
            public error: string;
            public static create(properties?: perfetto.protos.IAppendTraceDataResult): perfetto.protos.AppendTraceDataResult;
            public static encode(m: perfetto.protos.IAppendTraceDataResult, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.AppendTraceDataResult;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.AppendTraceDataResult;
            public static toObject(m: perfetto.protos.AppendTraceDataResult, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IQueryArgs {
            sqlQuery?: (string|null);
            tag?: (string|null);
        }

        class QueryArgs implements IQueryArgs {
            constructor(p?: perfetto.protos.IQueryArgs);
            public sqlQuery: string;
            public tag: string;
            public static create(properties?: perfetto.protos.IQueryArgs): perfetto.protos.QueryArgs;
            public static encode(m: perfetto.protos.IQueryArgs, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.QueryArgs;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.QueryArgs;
            public static toObject(m: perfetto.protos.QueryArgs, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IQueryResult {
            columnNames?: (string[]|null);
            error?: (string|null);
            batch?: (perfetto.protos.QueryResult.ICellsBatch[]|null);
            statementCount?: (number|null);
            statementWithOutputCount?: (number|null);
            lastStatementSql?: (string|null);
        }

        class QueryResult implements IQueryResult {
            constructor(p?: perfetto.protos.IQueryResult);
            public columnNames: string[];
            public error: string;
            public batch: perfetto.protos.QueryResult.ICellsBatch[];
            public statementCount: number;
            public statementWithOutputCount: number;
            public lastStatementSql: string;
            public static create(properties?: perfetto.protos.IQueryResult): perfetto.protos.QueryResult;
            public static encode(m: perfetto.protos.IQueryResult, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.QueryResult;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.QueryResult;
            public static toObject(m: perfetto.protos.QueryResult, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace QueryResult {

            interface ICellsBatch {
                cells?: (perfetto.protos.QueryResult.CellsBatch.CellType[]|null);
                varintCells?: (number[]|null);
                float64Cells?: (number[]|null);
                blobCells?: (Uint8Array[]|null);
                stringCells?: (string|null);
                isLastBatch?: (boolean|null);
            }

            class CellsBatch implements ICellsBatch {
                constructor(p?: perfetto.protos.QueryResult.ICellsBatch);
                public cells: perfetto.protos.QueryResult.CellsBatch.CellType[];
                public varintCells: number[];
                public float64Cells: number[];
                public blobCells: Uint8Array[];
                public stringCells: string;
                public isLastBatch: boolean;
                public static create(properties?: perfetto.protos.QueryResult.ICellsBatch): perfetto.protos.QueryResult.CellsBatch;
                public static encode(m: perfetto.protos.QueryResult.ICellsBatch, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.QueryResult.CellsBatch;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.QueryResult.CellsBatch;
                public static toObject(m: perfetto.protos.QueryResult.CellsBatch, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            namespace CellsBatch {

                enum CellType {
                    CELL_INVALID = 0,
                    CELL_NULL = 1,
                    CELL_VARINT = 2,
                    CELL_FLOAT64 = 3,
                    CELL_STRING = 4,
                    CELL_BLOB = 5
                }
            }
        }

        interface IStatusArgs {
        }

        class StatusArgs implements IStatusArgs {
            constructor(p?: perfetto.protos.IStatusArgs);
            public static create(properties?: perfetto.protos.IStatusArgs): perfetto.protos.StatusArgs;
            public static encode(m: perfetto.protos.IStatusArgs, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.StatusArgs;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.StatusArgs;
            public static toObject(m: perfetto.protos.StatusArgs, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IStatusResult {
            loadedTraceName?: (string|null);
            humanReadableVersion?: (string|null);
            apiVersion?: (number|null);
            versionCode?: (string|null);
        }

        class StatusResult implements IStatusResult {
            constructor(p?: perfetto.protos.IStatusResult);
            public loadedTraceName: string;
            public humanReadableVersion: string;
            public apiVersion: number;
            public versionCode: string;
            public static create(properties?: perfetto.protos.IStatusResult): perfetto.protos.StatusResult;
            public static encode(m: perfetto.protos.IStatusResult, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.StatusResult;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.StatusResult;
            public static toObject(m: perfetto.protos.StatusResult, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IComputeMetricArgs {
            metricNames?: (string[]|null);
            format?: (perfetto.protos.ComputeMetricArgs.ResultFormat|null);
        }

        class ComputeMetricArgs implements IComputeMetricArgs {
            constructor(p?: perfetto.protos.IComputeMetricArgs);
            public metricNames: string[];
            public format: perfetto.protos.ComputeMetricArgs.ResultFormat;
            public static create(properties?: perfetto.protos.IComputeMetricArgs): perfetto.protos.ComputeMetricArgs;
            public static encode(m: perfetto.protos.IComputeMetricArgs, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.ComputeMetricArgs;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.ComputeMetricArgs;
            public static toObject(m: perfetto.protos.ComputeMetricArgs, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace ComputeMetricArgs {

            enum ResultFormat {
                BINARY_PROTOBUF = 0,
                TEXTPROTO = 1,
                JSON = 2
            }
        }

        interface IComputeMetricResult {
            metrics?: (Uint8Array|null);
            metricsAsPrototext?: (string|null);
            metricsAsJson?: (string|null);
            error?: (string|null);
        }

        class ComputeMetricResult implements IComputeMetricResult {
            constructor(p?: perfetto.protos.IComputeMetricResult);
            public metrics?: (Uint8Array|null);
            public metricsAsPrototext?: (string|null);
            public metricsAsJson?: (string|null);
            public error: string;
            public result?: ("metrics"|"metricsAsPrototext"|"metricsAsJson");
            public static create(properties?: perfetto.protos.IComputeMetricResult): perfetto.protos.ComputeMetricResult;
            public static encode(m: perfetto.protos.IComputeMetricResult, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.ComputeMetricResult;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.ComputeMetricResult;
            public static toObject(m: perfetto.protos.ComputeMetricResult, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IEnableMetatraceArgs {
            categories?: (perfetto.protos.MetatraceCategories|null);
        }

        class EnableMetatraceArgs implements IEnableMetatraceArgs {
            constructor(p?: perfetto.protos.IEnableMetatraceArgs);
            public categories: perfetto.protos.MetatraceCategories;
            public static create(properties?: perfetto.protos.IEnableMetatraceArgs): perfetto.protos.EnableMetatraceArgs;
            public static encode(m: perfetto.protos.IEnableMetatraceArgs, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.EnableMetatraceArgs;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.EnableMetatraceArgs;
            public static toObject(m: perfetto.protos.EnableMetatraceArgs, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IEnableMetatraceResult {
        }

        class EnableMetatraceResult implements IEnableMetatraceResult {
            constructor(p?: perfetto.protos.IEnableMetatraceResult);
            public static create(properties?: perfetto.protos.IEnableMetatraceResult): perfetto.protos.EnableMetatraceResult;
            public static encode(m: perfetto.protos.IEnableMetatraceResult, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.EnableMetatraceResult;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.EnableMetatraceResult;
            public static toObject(m: perfetto.protos.EnableMetatraceResult, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IDisableAndReadMetatraceArgs {
        }

        class DisableAndReadMetatraceArgs implements IDisableAndReadMetatraceArgs {
            constructor(p?: perfetto.protos.IDisableAndReadMetatraceArgs);
            public static create(properties?: perfetto.protos.IDisableAndReadMetatraceArgs): perfetto.protos.DisableAndReadMetatraceArgs;
            public static encode(m: perfetto.protos.IDisableAndReadMetatraceArgs, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.DisableAndReadMetatraceArgs;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.DisableAndReadMetatraceArgs;
            public static toObject(m: perfetto.protos.DisableAndReadMetatraceArgs, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IDisableAndReadMetatraceResult {
            metatrace?: (Uint8Array|null);
            error?: (string|null);
        }

        class DisableAndReadMetatraceResult implements IDisableAndReadMetatraceResult {
            constructor(p?: perfetto.protos.IDisableAndReadMetatraceResult);
            public metatrace: Uint8Array;
            public error: string;
            public static create(properties?: perfetto.protos.IDisableAndReadMetatraceResult): perfetto.protos.DisableAndReadMetatraceResult;
            public static encode(m: perfetto.protos.IDisableAndReadMetatraceResult, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.DisableAndReadMetatraceResult;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.DisableAndReadMetatraceResult;
            public static toObject(m: perfetto.protos.DisableAndReadMetatraceResult, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IDescriptorSet {
            descriptors?: (perfetto.protos.IDescriptorProto[]|null);
        }

        class DescriptorSet implements IDescriptorSet {
            constructor(p?: perfetto.protos.IDescriptorSet);
            public descriptors: perfetto.protos.IDescriptorProto[];
            public static create(properties?: perfetto.protos.IDescriptorSet): perfetto.protos.DescriptorSet;
            public static encode(m: perfetto.protos.IDescriptorSet, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.DescriptorSet;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.DescriptorSet;
            public static toObject(m: perfetto.protos.DescriptorSet, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IResetTraceProcessorArgs {
            dropTrackEventDataBefore?: (perfetto.protos.ResetTraceProcessorArgs.DropTrackEventDataBefore|null);
            ingestFtraceInRawTable?: (boolean|null);
            analyzeTraceProtoContent?: (boolean|null);
            ftraceDropUntilAllCpusValid?: (boolean|null);
            parsingMode?: (perfetto.protos.ResetTraceProcessorArgs.ParsingMode|null);
        }

        class ResetTraceProcessorArgs implements IResetTraceProcessorArgs {
            constructor(p?: perfetto.protos.IResetTraceProcessorArgs);
            public dropTrackEventDataBefore: perfetto.protos.ResetTraceProcessorArgs.DropTrackEventDataBefore;
            public ingestFtraceInRawTable: boolean;
            public analyzeTraceProtoContent: boolean;
            public ftraceDropUntilAllCpusValid: boolean;
            public parsingMode: perfetto.protos.ResetTraceProcessorArgs.ParsingMode;
            public static create(properties?: perfetto.protos.IResetTraceProcessorArgs): perfetto.protos.ResetTraceProcessorArgs;
            public static encode(m: perfetto.protos.IResetTraceProcessorArgs, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.ResetTraceProcessorArgs;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.ResetTraceProcessorArgs;
            public static toObject(m: perfetto.protos.ResetTraceProcessorArgs, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace ResetTraceProcessorArgs {

            enum DropTrackEventDataBefore {
                NO_DROP = 0,
                TRACK_EVENT_RANGE_OF_INTEREST = 1
            }

            enum ParsingMode {
                DEFAULT = 0,
                TOKENIZE_ONLY = 1,
                TOKENIZE_AND_SORT = 2
            }
        }

        interface IRegisterSqlPackageArgs {
            packageName?: (string|null);
            modules?: (perfetto.protos.RegisterSqlPackageArgs.IModule[]|null);
            allowOverride?: (boolean|null);
        }

        class RegisterSqlPackageArgs implements IRegisterSqlPackageArgs {
            constructor(p?: perfetto.protos.IRegisterSqlPackageArgs);
            public packageName: string;
            public modules: perfetto.protos.RegisterSqlPackageArgs.IModule[];
            public allowOverride: boolean;
            public static create(properties?: perfetto.protos.IRegisterSqlPackageArgs): perfetto.protos.RegisterSqlPackageArgs;
            public static encode(m: perfetto.protos.IRegisterSqlPackageArgs, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.RegisterSqlPackageArgs;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.RegisterSqlPackageArgs;
            public static toObject(m: perfetto.protos.RegisterSqlPackageArgs, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace RegisterSqlPackageArgs {

            interface IModule {
                name?: (string|null);
                sql?: (string|null);
            }

            class Module implements IModule {
                constructor(p?: perfetto.protos.RegisterSqlPackageArgs.IModule);
                public name: string;
                public sql: string;
                public static create(properties?: perfetto.protos.RegisterSqlPackageArgs.IModule): perfetto.protos.RegisterSqlPackageArgs.Module;
                public static encode(m: perfetto.protos.RegisterSqlPackageArgs.IModule, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.RegisterSqlPackageArgs.Module;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.RegisterSqlPackageArgs.Module;
                public static toObject(m: perfetto.protos.RegisterSqlPackageArgs.Module, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }
        }

        interface IRegisterSqlPackageResult {
            error?: (string|null);
        }

        class RegisterSqlPackageResult implements IRegisterSqlPackageResult {
            constructor(p?: perfetto.protos.IRegisterSqlPackageResult);
            public error: string;
            public static create(properties?: perfetto.protos.IRegisterSqlPackageResult): perfetto.protos.RegisterSqlPackageResult;
            public static encode(m: perfetto.protos.IRegisterSqlPackageResult, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.RegisterSqlPackageResult;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.RegisterSqlPackageResult;
            public static toObject(m: perfetto.protos.RegisterSqlPackageResult, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IFinalizeDataResult {
            error?: (string|null);
        }

        class FinalizeDataResult implements IFinalizeDataResult {
            constructor(p?: perfetto.protos.IFinalizeDataResult);
            public error: string;
            public static create(properties?: perfetto.protos.IFinalizeDataResult): perfetto.protos.FinalizeDataResult;
            public static encode(m: perfetto.protos.IFinalizeDataResult, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.FinalizeDataResult;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.FinalizeDataResult;
            public static toObject(m: perfetto.protos.FinalizeDataResult, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IFileDescriptorSet {
            file?: (perfetto.protos.IFileDescriptorProto[]|null);
        }

        class FileDescriptorSet implements IFileDescriptorSet {
            constructor(p?: perfetto.protos.IFileDescriptorSet);
            public file: perfetto.protos.IFileDescriptorProto[];
            public static create(properties?: perfetto.protos.IFileDescriptorSet): perfetto.protos.FileDescriptorSet;
            public static encode(m: perfetto.protos.IFileDescriptorSet, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.FileDescriptorSet;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.FileDescriptorSet;
            public static toObject(m: perfetto.protos.FileDescriptorSet, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IFileDescriptorProto {
            name?: (string|null);
            "package"?: (string|null);
            dependency?: (string[]|null);
            publicDependency?: (number[]|null);
            weakDependency?: (number[]|null);
            messageType?: (perfetto.protos.IDescriptorProto[]|null);
            enumType?: (perfetto.protos.IEnumDescriptorProto[]|null);
            extension?: (perfetto.protos.IFieldDescriptorProto[]|null);
        }

        class FileDescriptorProto implements IFileDescriptorProto {
            constructor(p?: perfetto.protos.IFileDescriptorProto);
            public name: string;
            public package: string;
            public dependency: string[];
            public publicDependency: number[];
            public weakDependency: number[];
            public messageType: perfetto.protos.IDescriptorProto[];
            public enumType: perfetto.protos.IEnumDescriptorProto[];
            public extension: perfetto.protos.IFieldDescriptorProto[];
            public static create(properties?: perfetto.protos.IFileDescriptorProto): perfetto.protos.FileDescriptorProto;
            public static encode(m: perfetto.protos.IFileDescriptorProto, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.FileDescriptorProto;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.FileDescriptorProto;
            public static toObject(m: perfetto.protos.FileDescriptorProto, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IDescriptorProto {
            name?: (string|null);
            field?: (perfetto.protos.IFieldDescriptorProto[]|null);
            extension?: (perfetto.protos.IFieldDescriptorProto[]|null);
            nestedType?: (perfetto.protos.IDescriptorProto[]|null);
            enumType?: (perfetto.protos.IEnumDescriptorProto[]|null);
            oneofDecl?: (perfetto.protos.IOneofDescriptorProto[]|null);
            reservedRange?: (perfetto.protos.DescriptorProto.IReservedRange[]|null);
            reservedName?: (string[]|null);
        }

        class DescriptorProto implements IDescriptorProto {
            constructor(p?: perfetto.protos.IDescriptorProto);
            public name: string;
            public field: perfetto.protos.IFieldDescriptorProto[];
            public extension: perfetto.protos.IFieldDescriptorProto[];
            public nestedType: perfetto.protos.IDescriptorProto[];
            public enumType: perfetto.protos.IEnumDescriptorProto[];
            public oneofDecl: perfetto.protos.IOneofDescriptorProto[];
            public reservedRange: perfetto.protos.DescriptorProto.IReservedRange[];
            public reservedName: string[];
            public static create(properties?: perfetto.protos.IDescriptorProto): perfetto.protos.DescriptorProto;
            public static encode(m: perfetto.protos.IDescriptorProto, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.DescriptorProto;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.DescriptorProto;
            public static toObject(m: perfetto.protos.DescriptorProto, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace DescriptorProto {

            interface IReservedRange {
                start?: (number|null);
                end?: (number|null);
            }

            class ReservedRange implements IReservedRange {
                constructor(p?: perfetto.protos.DescriptorProto.IReservedRange);
                public start: number;
                public end: number;
                public static create(properties?: perfetto.protos.DescriptorProto.IReservedRange): perfetto.protos.DescriptorProto.ReservedRange;
                public static encode(m: perfetto.protos.DescriptorProto.IReservedRange, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.DescriptorProto.ReservedRange;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.DescriptorProto.ReservedRange;
                public static toObject(m: perfetto.protos.DescriptorProto.ReservedRange, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }
        }

        interface IUninterpretedOption {
            name?: (perfetto.protos.UninterpretedOption.INamePart[]|null);
            identifierValue?: (string|null);
            positiveIntValue?: (number|null);
            negativeIntValue?: (number|null);
            doubleValue?: (number|null);
            stringValue?: (Uint8Array|null);
            aggregateValue?: (string|null);
        }

        class UninterpretedOption implements IUninterpretedOption {
            constructor(p?: perfetto.protos.IUninterpretedOption);
            public name: perfetto.protos.UninterpretedOption.INamePart[];
            public identifierValue: string;
            public positiveIntValue: number;
            public negativeIntValue: number;
            public doubleValue: number;
            public stringValue: Uint8Array;
            public aggregateValue: string;
            public static create(properties?: perfetto.protos.IUninterpretedOption): perfetto.protos.UninterpretedOption;
            public static encode(m: perfetto.protos.IUninterpretedOption, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.UninterpretedOption;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.UninterpretedOption;
            public static toObject(m: perfetto.protos.UninterpretedOption, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace UninterpretedOption {

            interface INamePart {
                namePart?: (string|null);
                isExtension?: (boolean|null);
            }

            class NamePart implements INamePart {
                constructor(p?: perfetto.protos.UninterpretedOption.INamePart);
                public namePart: string;
                public isExtension: boolean;
                public static create(properties?: perfetto.protos.UninterpretedOption.INamePart): perfetto.protos.UninterpretedOption.NamePart;
                public static encode(m: perfetto.protos.UninterpretedOption.INamePart, w?: $protobuf.Writer): $protobuf.Writer;
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.UninterpretedOption.NamePart;
                public static fromObject(d: { [k: string]: any }): perfetto.protos.UninterpretedOption.NamePart;
                public static toObject(m: perfetto.protos.UninterpretedOption.NamePart, o?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }
        }

        interface IFieldOptions {
            packed?: (boolean|null);
            uninterpretedOption?: (perfetto.protos.IUninterpretedOption[]|null);
        }

        class FieldOptions implements IFieldOptions {
            constructor(p?: perfetto.protos.IFieldOptions);
            public packed: boolean;
            public uninterpretedOption: perfetto.protos.IUninterpretedOption[];
            public static create(properties?: perfetto.protos.IFieldOptions): perfetto.protos.FieldOptions;
            public static encode(m: perfetto.protos.IFieldOptions, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.FieldOptions;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.FieldOptions;
            public static toObject(m: perfetto.protos.FieldOptions, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IFieldDescriptorProto {
            name?: (string|null);
            number?: (number|null);
            label?: (perfetto.protos.FieldDescriptorProto.Label|null);
            type?: (perfetto.protos.FieldDescriptorProto.Type|null);
            typeName?: (string|null);
            extendee?: (string|null);
            defaultValue?: (string|null);
            options?: (perfetto.protos.IFieldOptions|null);
            oneofIndex?: (number|null);
        }

        class FieldDescriptorProto implements IFieldDescriptorProto {
            constructor(p?: perfetto.protos.IFieldDescriptorProto);
            public name: string;
            public number: number;
            public label: perfetto.protos.FieldDescriptorProto.Label;
            public type: perfetto.protos.FieldDescriptorProto.Type;
            public typeName: string;
            public extendee: string;
            public defaultValue: string;
            public options?: (perfetto.protos.IFieldOptions|null);
            public oneofIndex: number;
            public static create(properties?: perfetto.protos.IFieldDescriptorProto): perfetto.protos.FieldDescriptorProto;
            public static encode(m: perfetto.protos.IFieldDescriptorProto, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.FieldDescriptorProto;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.FieldDescriptorProto;
            public static toObject(m: perfetto.protos.FieldDescriptorProto, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace FieldDescriptorProto {

            enum Type {
                TYPE_DOUBLE = 1,
                TYPE_FLOAT = 2,
                TYPE_INT64 = 3,
                TYPE_UINT64 = 4,
                TYPE_INT32 = 5,
                TYPE_FIXED64 = 6,
                TYPE_FIXED32 = 7,
                TYPE_BOOL = 8,
                TYPE_STRING = 9,
                TYPE_GROUP = 10,
                TYPE_MESSAGE = 11,
                TYPE_BYTES = 12,
                TYPE_UINT32 = 13,
                TYPE_ENUM = 14,
                TYPE_SFIXED32 = 15,
                TYPE_SFIXED64 = 16,
                TYPE_SINT32 = 17,
                TYPE_SINT64 = 18
            }

            enum Label {
                LABEL_OPTIONAL = 1,
                LABEL_REQUIRED = 2,
                LABEL_REPEATED = 3
            }
        }

        interface IOneofDescriptorProto {
            name?: (string|null);
            options?: (perfetto.protos.IOneofOptions|null);
        }

        class OneofDescriptorProto implements IOneofDescriptorProto {
            constructor(p?: perfetto.protos.IOneofDescriptorProto);
            public name: string;
            public options?: (perfetto.protos.IOneofOptions|null);
            public static create(properties?: perfetto.protos.IOneofDescriptorProto): perfetto.protos.OneofDescriptorProto;
            public static encode(m: perfetto.protos.IOneofDescriptorProto, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.OneofDescriptorProto;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.OneofDescriptorProto;
            public static toObject(m: perfetto.protos.OneofDescriptorProto, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IEnumDescriptorProto {
            name?: (string|null);
            value?: (perfetto.protos.IEnumValueDescriptorProto[]|null);
            reservedName?: (string[]|null);
        }

        class EnumDescriptorProto implements IEnumDescriptorProto {
            constructor(p?: perfetto.protos.IEnumDescriptorProto);
            public name: string;
            public value: perfetto.protos.IEnumValueDescriptorProto[];
            public reservedName: string[];
            public static create(properties?: perfetto.protos.IEnumDescriptorProto): perfetto.protos.EnumDescriptorProto;
            public static encode(m: perfetto.protos.IEnumDescriptorProto, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.EnumDescriptorProto;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.EnumDescriptorProto;
            public static toObject(m: perfetto.protos.EnumDescriptorProto, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IEnumValueDescriptorProto {
            name?: (string|null);
            number?: (number|null);
        }

        class EnumValueDescriptorProto implements IEnumValueDescriptorProto {
            constructor(p?: perfetto.protos.IEnumValueDescriptorProto);
            public name: string;
            public number: number;
            public static create(properties?: perfetto.protos.IEnumValueDescriptorProto): perfetto.protos.EnumValueDescriptorProto;
            public static encode(m: perfetto.protos.IEnumValueDescriptorProto, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.EnumValueDescriptorProto;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.EnumValueDescriptorProto;
            public static toObject(m: perfetto.protos.EnumValueDescriptorProto, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        interface IOneofOptions {
        }

        class OneofOptions implements IOneofOptions {
            constructor(p?: perfetto.protos.IOneofOptions);
            public static create(properties?: perfetto.protos.IOneofOptions): perfetto.protos.OneofOptions;
            public static encode(m: perfetto.protos.IOneofOptions, w?: $protobuf.Writer): $protobuf.Writer;
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): perfetto.protos.OneofOptions;
            public static fromObject(d: { [k: string]: any }): perfetto.protos.OneofOptions;
            public static toObject(m: perfetto.protos.OneofOptions, o?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        enum MetatraceCategories {
            QUERY_TIMELINE = 1,
            QUERY_DETAILED = 2,
            FUNCTION_CALL = 4,
            DB = 8,
            API_TIMELINE = 16,
            NONE = 0,
            ALL = 31
        }
    }
}
