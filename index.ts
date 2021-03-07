/*
    Copyright (C) 2021 rubybb <https://github.com/rubybb>

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/

import { compile } from "path-to-regexp";
import deepmerge from "deepmerge";
import qstr from "query-string";

export declare type PartialHTTPOptions = Partial<HTTPOptions>;
export declare type ResultType = "response" | keyof Response;

// export declare type RequestFunction = <ResultType>(path: string, options?: PartialHTTPOptions) => Promise<ResultType>;
// export declare type RequestFunctionWithBody = <ResultType>(path: string, body: string, options?: PartialHTTPOptions) => Promise<ResultType>;
// export declare type RequestFunctionWithOptionalBody = <ResultType>(path: string, body?: string, options?: PartialHTTPOptions) => Promise<ResultType>;

export declare interface HTTPOptions<T = unknown> extends RequestInit {
    resultType: ResultType;
    query: Record<string, any>;
    excludeDefaults: boolean;
    baseURL: string;

    /* logs loads of information to console. */
    debug: boolean;
    
    /* 
        disables features like path name mutation,
        request transforms, and other various things.
    */
    minimal: boolean;

    nothrow: boolean;

    events?: {
        override?: boolean;
        pre?: (this: HTTP, path: string, options: PartialHTTPOptions) => Promise<boolean>;
        post?: (this: HTTP, result: any, path: string, options: PartialHTTPOptions) => Promise<typeof result>;
    }

    /* for path params */
    [key: string]: unknown
}

let _fetch = null;
async function fetch (input: RequestInfo, init?: RequestInit): Promise<Response> {
    if (!_fetch) {
        /* if server or client side */
        _fetch = (typeof window === "undefined") ?
            (await import("node-fetch")).default : 
            (await import("whatwg-fetch")).fetch;
    }

    return _fetch(input, init);
}

class HTTPError extends Error {
    public name: string = "HTTPError";

    public method: string;
    /* we're a teapot, unless otherwise specified. :) */
    public status: number = 418;

    constructor (public url: string, options: PartialHTTPOptions, response?: Response, public body?: unknown, message?: string) {
        super(message ? message : `Request failed (${options.method.toUpperCase()} ${url})`);

        this.method = options.method.toUpperCase();
        if (response) this.status = response.status;
    }

    public toJSON () {
        return {
            message: this.message,
            status: this.status,
            method: this.method,
            url: this.url,
            body: (typeof this.body !== "undefined" ? 
                this.body : null
            ),
        }
    }
}

export class HTTP {
    constructor (public options: PartialHTTPOptions = {}, private immutable = false) {}

    static create (options: PartialHTTPOptions, immutable?: boolean): HTTP {
        return new HTTP(options, immutable);
    }

    public mutate (this: HTTP, options: PartialHTTPOptions): HTTP {
        if (this.immutable) throw new ReferenceError("Cannot modify; HTTP instance declared as immutable");

        this.options = deepmerge(this.options, options);
        return this;
    }

    public clone (this: HTTP, options: PartialHTTPOptions, immutable?: boolean): HTTP {
        return new HTTP(deepmerge(this.options, options), immutable);
    }

    private async request <T = unknown>(this: HTTP, path: string, options: PartialHTTPOptions = {}): Promise<null | T> {
        const _options = options; /* the options passed to the request function, without being merged into defaults */
        options = this.options.excludeDefaults ? _options : deepmerge(this.options, _options);

        /* event override fix */
        if (!options.minimal && (this.options.events && !options.events?.override)) {

            /* pre request event hook */
            if (this.options.events.pre && _options.events.pre) {
                options.events.pre = async (path: string, options: PartialHTTPOptions): Promise<boolean> => {
                    let _cancelled = await this.options.events.pre.apply(this, [path, options]) === false;
                    if (!_cancelled) return await _options.events.pre.apply(this, [path, options]);
                }
            }

            /* post request event hook */
            if (this.options.events.post && _options.events.post) {
                options.events.post = async (result: any, path: string, options: PartialHTTPOptions) => {
                    const _result = await this.options.events.post.apply(this, [result, path, options]);
                    return await _options.events.post.apply(this, [
                        typeof _result !== "undefined" ? _result : result, 
                        path, options
                    ]);
                }
            }
        }

        // emit pre request event
        if (!options.minimal && (typeof options.events?.pre === "function")) {
            const cancelled: boolean = (await options.events.pre.apply(this, [path, options]) === false);
            if (cancelled) return null;
        }
        
        /* handle url creation */
        const initialURL = new URL(path, this.options.baseURL);
        let url = (!options.minimal && initialURL.pathname.includes(":")) ? 
            initialURL.href.replace(initialURL.pathname, compile(initialURL.pathname)(options)) :
            initialURL.href;

        /* handle generation of query string */
        if (options.query) url += ("?" + qstr.stringify(options.query));

        options.debug && console.debug(options.method, url, {path, options});
        const response = await fetch(url, options);

        if (!options.resultType || !response[options.resultType]) 
            /* nothrow doesn't matter here because this is not a response error 
               the function is being passed invalid paramaters, this should never fail silently. */
            throw new TypeError(`Unknown resultType (${options.resultType})`);

        let result = options.resultType === "response" ? response : await response[options.resultType];
        try { result = typeof result === "function" ? (await result.call(response)) : result; } catch (error) { 
            if (!options.nothrow) throw new HTTPError(url, options, response, null, `Response failed (${error.message})`); 
            result = null;
        }

        // emit pre request event
        if (!options.minimal && (typeof options.events?.post === "function")) {
            let _result = await options.events.post.apply(this, [result, path, options]);
            if (typeof _result !== "undefined")
                result = _result;
        }

        if (!response.ok && !options.nothrow) throw new HTTPError(url, options, response, result);
        return result as unknown as T;
    }

    async get <ResultType>(this: HTTP, path: string, options: Partial<HTTPOptions> = {}): Promise<ResultType> {
        return this.request<ResultType>(path, {...options, method: "GET"});
    }

    async head <ResultType>(this: HTTP, path: string, options: Partial<HTTPOptions> = {}): Promise<ResultType> {
        return this.request<ResultType>(path, {...options, method: "HEAD"});
    }

    /* body'd request methods */

    async post <ResultType>(this: HTTP, path: string, body: BodyInit, options: Partial<HTTPOptions> = {}): Promise<ResultType> {
        return this.request<ResultType>(path, {...options, method: "POST", body});
    }

    async patch <ResultType>(this: HTTP, path: string, body: BodyInit, options: Partial<HTTPOptions> = {}): Promise<ResultType> {
        return this.request<ResultType>(path, {...options, method: "PATCH", body});
    }

    async put <ResultType>(this: HTTP, path: string, body: BodyInit, options: Partial<HTTPOptions> = {}): Promise<ResultType> {
        return this.request<ResultType>(path, {...options, method: "PUT", body});
    }

    /* optional body'd request methods */

    async delete <ResultType>(this: HTTP, path: string, body?: BodyInit, options: Partial<HTTPOptions> = {}): Promise<ResultType> {
        return this.request<ResultType>(path, {...options, method: "DELETE", body});
    }
}

export const http = new HTTP({}, true);
export default http;