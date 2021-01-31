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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { compile } from "path-to-regexp";
import deepmerge from "deepmerge";
export let _fetch = null;
function fetch(input, init) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!_fetch) {
            /* if server or client side */
            _fetch = (typeof window === "undefined") ?
                (yield import("node-fetch")).default :
                window.fetch;
            _fetch.server = typeof window === "undefined";
        }
        return _fetch(input, init);
    });
}
export class HTTP {
    constructor(options = {}, immutable = false) {
        this.options = options;
        this.immutable = immutable;
    }
    static create(options, immutable) {
        return new HTTP(options, immutable);
    }
    mutate(options) {
        if (this.immutable)
            throw new ReferenceError("Cannot modify; HTTP instance declared as immutable");
        this.options = deepmerge(this.options, options);
        return this;
    }
    clone(options, immutable) {
        return new HTTP(deepmerge(this.options, options), immutable);
    }
    request(path, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            options = this.options.excludeDefaults ? options : deepmerge(this.options, options);
            /* handle url creation */
            const _url = new URL(path, this.options.baseURL);
            const url = _url.pathname.includes(":") ?
                _url.href.replace(_url.pathname, compile(_url.pathname)(options)) :
                _url.href;
            options.debug && console.debug({ path, url, options });
            const response = yield fetch(url, options);
            if (options.resultType === "response")
                return response;
            if (!options.resultType || !response[options.resultType])
                throw new TypeError("Unknown resultType");
            const result = response[options.resultType];
            return typeof result === "function" ? result.call(response) : result;
        });
    }
    get(path, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request(path, Object.assign(Object.assign({}, options), { method: "get" }));
        });
    }
    head(path, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request(path, Object.assign(Object.assign({}, options), { method: "head" }));
        });
    }
    /* body'd request methods */
    post(path, body, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request(path, Object.assign(Object.assign({}, options), { method: "post", body }));
        });
    }
    patch(path, body, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request(path, Object.assign(Object.assign({}, options), { method: "patch", body }));
        });
    }
    put(path, body, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request(path, Object.assign(Object.assign({}, options), { method: "put", body }));
        });
    }
    /* optional body'd request methods */
    delete(path, body, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request(path, Object.assign(Object.assign({}, options), { method: "delete", body }));
        });
    }
}
export const http = new HTTP({}, true);
export default http;
