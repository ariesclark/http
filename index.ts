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

export declare type RequestFunction = <ResultType>(path: string, options?: PartialHTTPOptions) => Promise<ResultType>;
export declare type RequestFunctionWithBody = <ResultType>(path: string, body: string, options?: PartialHTTPOptions) => Promise<ResultType>;
export declare type RequestFunctionWithOptionalBody = <ResultType>(path: string, body?: string, options?: PartialHTTPOptions) => Promise<ResultType>;

export declare interface HTTPOptions extends RequestInit {
    resultType: "response" | keyof Response;
    query: Record<string, any>;
    excludeDefaults: boolean;
    baseURL: string;

    debug: boolean;

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

    private async request <ResultType>(this: HTTP, path: string, options: PartialHTTPOptions = {}): Promise<ResultType> {
        options = this.options.excludeDefaults ? options : deepmerge(this.options, options);
        
        /* handle url creation */
        const initialURL = new URL(path, this.options.baseURL);
        let url = initialURL.pathname.includes(":") ? 
            initialURL.href.replace(initialURL.pathname, compile(initialURL.pathname)(options)) :
            initialURL.href;

        /* handle generation of query string */
        if (options.query) url += ("?" + qstr.stringify(options.query));

        options.debug && console.debug({path, url, options});
        const response = await fetch(url, options);

        if (options.resultType === "response") return (response as unknown) as ResultType; 
        if (!options.resultType || !response[options.resultType]) throw new TypeError(`Unknown resultType (got: ${options.resultType})`);

        const initialResult = response[options.resultType];

        if (typeof initialResult === "function") {
            try { return initialResult.call(response); } 
            catch (_) { throw new TypeError("Failed to cast result via function, perhaps data isn't what was expected?"); }
        }

        return initialResult as unknown as ResultType;
    }

    async get <ResultType>(this: HTTP, path: string, options: Partial<HTTPOptions> = {}): Promise<ResultType> {
        return this.request<ResultType>(path, {...options, method: "get"});
    }

    async head <ResultType>(this: HTTP, path: string, options: Partial<HTTPOptions> = {}): Promise<ResultType> {
        return this.request<ResultType>(path, {...options, method: "head"});
    }

    /* body'd request methods */

    async post <ResultType>(this: HTTP, path: string, body: BodyInit, options: Partial<HTTPOptions> = {}): Promise<ResultType> {
        return this.request<ResultType>(path, {...options, method: "post", body});
    }

    async patch <ResultType>(this: HTTP, path: string, body: BodyInit, options: Partial<HTTPOptions> = {}): Promise<ResultType> {
        return this.request<ResultType>(path, {...options, method: "patch", body});
    }

    async put <ResultType>(this: HTTP, path: string, body: BodyInit, options: Partial<HTTPOptions> = {}): Promise<ResultType> {
        return this.request<ResultType>(path, {...options, method: "put", body});
    }

    /* optional body'd request methods */

    async delete <ResultType>(this: HTTP, path: string, body?: BodyInit, options: Partial<HTTPOptions> = {}): Promise<ResultType> {
        return this.request<ResultType>(path, {...options, method: "delete", body});
    }
}

export const http = new HTTP({}, true);
export default http;