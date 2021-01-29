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
/* eslint-disable @typescript-eslint/ban-ts-comment */
import merge from "deepmerge";
const http = {
    options: {},
    mutate(defaults) {
        const clone = Object.assign({}, this);
        clone.options = merge(clone.options, defaults);
        return clone;
    },
    request(path, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const request_options = this.options.excludeDefaults ? options : merge(this.options, options);
            const request_url = this.options.baseURL ? this.options.baseURL + path : path;
            let { resultType } = request_options;
            const fetch = ((typeof window === "undefined") ?
                // @ts-ignore ?: "@types/node-fetch" causes more problems than it fixes.
                (yield import("node-fetch")).default :
                window.fetch);
            const response = yield fetch(request_url, request_options);
            if (!resultType || !Object.prototype.hasOwnProperty.call(response, resultType))
                resultType = "response";
            if (resultType === "response")
                return response;
            const result = response[resultType];
            return typeof result === "function" ? result() : result;
        });
    },
    get(path, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request(path, Object.assign(Object.assign({}, options), { method: "get" }));
        });
    },
    post(path, body, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request(path, Object.assign(Object.assign({}, options), { method: "post", body }));
        });
    }
};
export default http;
