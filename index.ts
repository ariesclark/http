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

/* eslint-disable @typescript-eslint/ban-ts-comment */
import merge from "deepmerge";

export interface HTTP {
    options: Partial<HTTPOptions>;
    mutate: (defaults: Partial<HTTPOptions>) => HTTP;

    request: <ResultType>(path: string, options: Partial<HTTPOptions>) => Promise<ResultType>;

    get: <ResultType>(path: string, options?: Partial<HTTPOptions>) => Promise<ResultType>;
    post: <ResultType>(path: string, body: string, options?: Partial<HTTPOptions>) => Promise<ResultType>;
}

export interface HTTPOptions extends RequestInit {
    resultType: "response" | keyof Response;
    excludeDefaults: boolean;
    baseURL: string;
}

const http: HTTP = {
    options: {},

    mutate (this: HTTP, defaults: Partial<HTTPOptions>): HTTP {
        const clone = Object.assign({}, this);
        clone.options = merge(clone.options, defaults);

        return clone;
    },

    async request <ResultType>(this: HTTP, path: string, options: Partial<HTTPOptions> = {}): Promise<ResultType> {
        const request_options = this.options.excludeDefaults ? options : merge(this.options, options);
        const request_url = this.options.baseURL ? this.options.baseURL + path : path;
        let {resultType} = request_options;

        const fetch = (
            (typeof window === "undefined") ?
                // @ts-ignore ?: "@types/node-fetch" causes more problems than it fixes.
                (await import("node-fetch")).default : 
                window.fetch
        );
        
        const response = await fetch(request_url, request_options) as Response; 
  
        if (!resultType || !Object.prototype.hasOwnProperty.call(response, resultType)) resultType = "response";
        if (resultType === "response") return (response as unknown) as ResultType;

        const result = response[resultType];
        return typeof result === "function" ? result() : result;
    },

    async get <ResultType>(this: HTTP, path: string, options: Partial<HTTPOptions> = {}) {
        return this.request<ResultType>(path, {...options, method: "get"});
    },

    async post <ResultType>(this: HTTP, path: string, body: string, options: Partial<HTTPOptions> = {}) {
        return this.request<ResultType>(path, {...options, method: "post", body});
    }
};

export default http;