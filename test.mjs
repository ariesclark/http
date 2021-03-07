import { HTTP } from "./index.js";

const api = HTTP.create({
    resultType: "json",
    debug: true
});

api.get("https://api.github.com/repos/altar-gg/tickets/issues/35", {
    nothrow: true,
    events: {
        pre: async function () {
            console.log("pre", {arguments});
            return true;
        },
        post: async function () {
            console.log("post", {arguments});
        }
    }
}).then((json) => {
    console.log(json);
});