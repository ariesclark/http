import { HTTP, http } from "./index.js";
import fetch from "cross-fetch";
//import fetch from "node-fetch"

import FormData from "form-data";
const form = new FormData();

const body = {
    "version_title": "gfdfdgdf", 
    "version_number": "dfgfdgdfg", 
    "release_channel": "release", 
    "loaders": ["fabric"], 
    "game_versions": ["21w06a"], 
    "mod_id": "XZCiVOi9", 
    "dependencies": [], 
    "featured": false
};

const files = [{ name: "test.jar", data: "aaa" }];

form.append("data", JSON.stringify({
    ...body, ...{
        file_parts: files.map((file, index) => `${file.name}-${index}`)
    }
}));

files.map((file, index) => {
    form.append(`${file.name}-${index}`, file.data, {
        filename: file.name,
    });
});

const headers = {
    "authorization": "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",
    ...form.getHeaders()
}

console.log({form, files})

http.post("https://api.modrinth.com/api/v1/version", form, {
    debug: true,
    resultType: "json",
    headers
}).then(async r => {
    console.log(r);
});

/* fetch("https://api.modrinth.com/api/v1/version", {
    method: "POST",
    body: form,
    headers
}).then(async r => {
    console.log(r)
    console.log(await r.json())
}) */