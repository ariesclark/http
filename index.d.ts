export declare type PartialHTTPOptions = Partial<HTTPOptions>;
export declare type RequestFunction = <ResultType>(path: string, options?: PartialHTTPOptions) => Promise<ResultType>;
export declare type RequestFunctionWithBody = <ResultType>(path: string, body: string, options?: PartialHTTPOptions) => Promise<ResultType>;
export declare type RequestFunctionWithOptionalBody = <ResultType>(path: string, body?: string, options?: PartialHTTPOptions) => Promise<ResultType>;
export declare interface HTTPOptions extends RequestInit {
    resultType: "response" | keyof Response;
    excludeDefaults: boolean;
    baseURL: string;
    debug: boolean;
    [key: string]: unknown;
}
export declare let _fetch: any;
export declare class HTTP {
    private options;
    private immutable;
    constructor(options?: PartialHTTPOptions, immutable?: boolean);
    static create(options: PartialHTTPOptions, immutable?: boolean): HTTP;
    mutate(this: HTTP, options: PartialHTTPOptions): HTTP;
    clone(this: HTTP, options: PartialHTTPOptions, immutable?: boolean): HTTP;
    private request;
    get<ResultType>(this: HTTP, path: string, options?: Partial<HTTPOptions>): Promise<ResultType>;
    head<ResultType>(this: HTTP, path: string, options?: Partial<HTTPOptions>): Promise<ResultType>;
    post<ResultType>(this: HTTP, path: string, body: BodyInit, options?: Partial<HTTPOptions>): Promise<ResultType>;
    patch<ResultType>(this: HTTP, path: string, body: BodyInit, options?: Partial<HTTPOptions>): Promise<ResultType>;
    put<ResultType>(this: HTTP, path: string, body: BodyInit, options?: Partial<HTTPOptions>): Promise<ResultType>;
    delete<ResultType>(this: HTTP, path: string, body?: BodyInit, options?: Partial<HTTPOptions>): Promise<ResultType>;
}
export declare const http: HTTP;
export default http;
