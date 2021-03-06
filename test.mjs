import { HTTP } from "./index.js";

const api = HTTP.create({
    resultType: "json",
    debug: true
});

api.get("https://api.github.com/repos/altar-gg/tickets/issues/35").then((json) => {
    console.log(json);
});