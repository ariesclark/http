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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { compile } from "path-to-regexp";
import deepmerge from "deepmerge";
export var _fetch = null;
function fetch(input, init) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!!_fetch) return [3 /*break*/, 5];
                    if (!(typeof window === "undefined")) return [3 /*break*/, 2];
                    return [4 /*yield*/, import("node-fetch")];
                case 1:
                    _a = (_b.sent()).default;
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, import("whatwg-fetch")];
                case 3:
                    _a = (_b.sent()).fetch;
                    _b.label = 4;
                case 4:
                    /* if server or client side */
                    _fetch = _a;
                    _fetch.server = typeof window === "undefined";
                    _b.label = 5;
                case 5: return [2 /*return*/, _fetch(input, init)];
            }
        });
    });
}
var HTTP = /** @class */ (function () {
    function HTTP(options, immutable) {
        if (options === void 0) { options = {}; }
        if (immutable === void 0) { immutable = false; }
        this.options = options;
        this.immutable = immutable;
    }
    HTTP.create = function (options, immutable) {
        return new HTTP(options, immutable);
    };
    HTTP.prototype.mutate = function (options) {
        if (this.immutable)
            throw new ReferenceError("Cannot modify; HTTP instance declared as immutable");
        this.options = deepmerge(this.options, options);
        return this;
    };
    HTTP.prototype.clone = function (options, immutable) {
        return new HTTP(deepmerge(this.options, options), immutable);
    };
    HTTP.prototype.request = function (path, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _url, url, response, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = this.options.excludeDefaults ? options : deepmerge(this.options, options);
                        _url = new URL(path, this.options.baseURL);
                        url = _url.pathname.includes(":") ?
                            _url.href.replace(_url.pathname, compile(_url.pathname)(options)) :
                            _url.href;
                        options.debug && console.debug({ path: path, url: url, options: options });
                        return [4 /*yield*/, fetch(url, options)];
                    case 1:
                        response = _a.sent();
                        if (options.resultType === "response")
                            return [2 /*return*/, response];
                        if (!options.resultType || !response[options.resultType])
                            throw new TypeError("Unknown resultType");
                        result = response[options.resultType];
                        return [2 /*return*/, typeof result === "function" ? result.call(response) : result];
                }
            });
        });
    };
    HTTP.prototype.get = function (path, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request(path, __assign(__assign({}, options), { method: "get" }))];
            });
        });
    };
    HTTP.prototype.head = function (path, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request(path, __assign(__assign({}, options), { method: "head" }))];
            });
        });
    };
    /* body'd request methods */
    HTTP.prototype.post = function (path, body, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request(path, __assign(__assign({}, options), { method: "post", body: body }))];
            });
        });
    };
    HTTP.prototype.patch = function (path, body, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request(path, __assign(__assign({}, options), { method: "patch", body: body }))];
            });
        });
    };
    HTTP.prototype.put = function (path, body, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request(path, __assign(__assign({}, options), { method: "put", body: body }))];
            });
        });
    };
    /* optional body'd request methods */
    HTTP.prototype.delete = function (path, body, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request(path, __assign(__assign({}, options), { method: "delete", body: body }))];
            });
        });
    };
    return HTTP;
}());
export { HTTP };
export var http = new HTTP({}, true);
export default http;
