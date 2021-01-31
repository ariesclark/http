/*
    Copyright (C) 2021 rubybb <https://github.com/rubybb>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { compile } from "path-to-regexp";
import deepmerge from "deepmerge";

export declare type PartialHTTPOptions = Partial<HTTPOptions>;

export declare type RequestFunction = <ResultType>(path: string, options?: PartialHTTPOptions) => Promise<ResultType>;
export declare type RequestFunctionWithBody = <ResultType>(path: string, body: string, options?: PartialHTTPOptions) => Promise<ResultType>;
export declare type RequestFunctionWithOptionalBody = <ResultType>(path: string, body?: string, options?: PartialHTTPOptions) => Promise<ResultType>;

export declare interface HTTPOptions extends RequestInit {
    resultType: "response" | keyof Response;
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
    constructor (private options: PartialHTTPOptions = {}, private immutable = false) {}

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
        const _url = new URL(path, this.options.baseURL);
        const url = _url.pathname.includes(":") ? 
            _url.href.replace(_url.pathname, compile(_url.pathname)(options)) :
            _url.href;
            
        options.debug && console.debug({path, url, options});
        
        const response = await fetch(url, options);

        if (options.resultType === "response") return (response as unknown) as ResultType; 
        if (!options.resultType || !response[options.resultType]) throw new TypeError("Unknown resultType");
    
        const result = response[options.resultType];
        return typeof result === "function" ? result.call(response) : result;
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