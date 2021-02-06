import { HTTP } from "./index.js";

const api = HTTP.create({
    baseURL: "https://jsonplaceholder.typicode.com/",
    resultType: "json",
    debug: true
});

api.get("users/:id", {query: {limit: 5}, id: "ruby"}).then((json) => {
    console.log(json);
});