var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
            const response = yield fetch(request_url, request_options);
            if (!resultType || !Object.prototype.hasOwnProperty.call(response, resultType))
                resultType = "response";
            if (resultType === "response")
                return response;
            return response[resultType]();
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
