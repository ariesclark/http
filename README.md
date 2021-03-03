# @rubybb/http
Simple, small and extendable http library for sending requests.

[![Discord](https://img.shields.io/discord/418093857394262020?label=discord&style=for-the-badge)](https://discord.gg/WUgGJhS) [![Maintenance](https://img.shields.io/maintenance/yes/2021?style=for-the-badge)][![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Frubybb%2Fhttp.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Frubybb%2Fhttp?ref=badge_shield)
() ![GitHub issues](https://img.shields.io/github/issues/rubybb/http?style=for-the-badge) ![npm bundle size (scoped)](https://img.shields.io/bundlephobia/min/@rubybb/http?style=for-the-badge) ![NPM](https://img.shields.io/npm/l/@rubybb/http?style=for-the-badge)

## Install
Available on NPM: [@rubybb/http](https://www.npmjs.com/package/@rubybb/http)

Ruby's recommended package manager: <br/>
[pnpm: 📦🚀 Fast, disk space efficient package manager](https://pnpm.js.org/).

```
pnpm install @rubybb/http
```

## Examples
```ts
import http, { HTTP } from "@rubybb/http";

http.get("https://reqres.in/api/users/3", {resultType: "json"}).then((json) => {
    console.log(json);
    /* {
        data: {
            id: 3,
            email: "emma.wong@reqres.in",
            first_name: "Emma",
            last_name: "Wong",
            avatar: "https://reqres.in/img/faces/3-image.jpg"
        }
    } */
});

const api = HTTP.create({
    baseURL: "https://reqres.in/api/",
    resultType: "json"
});

api.get("users/3").then((json) => {...});
api.get("users/:id", {id: 3}).then((json) => {...});
```

## API

**NOTE**: RequestInit refers to all [native fetch options](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request), and BodyInit refers to a [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob), [BufferSource](https://developer.mozilla.org/en-US/docs/Web/API/BufferSource), [FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData), [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams), [USVString](https://developer.mozilla.org/en-US/docs/Web/API/USVString), or [ReadableStream](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream) object.

```ts
interface HTTPOptions extends RequestInit {
    resultType: "response" | keyof Response;
    excludeDefaults: boolean;
    baseURL: string;

    debug: boolean;

    /* for path params */
    [key: string]: unknown
}

// equivalent of new HTTP(options, immutable)
HTTP.create (options: Partial<HTTPOptions> = {}, immutable? = false): HTTP;

// mutate the current HTTP instance options.
http.mutate (options: Partial<HTTPOptions>): HTTP;

// copy the current instance options onto a new instance, and apply addtional options.
http.clone (options: Partial<HTTPOptions>): HTTP;

// send a request with the GET method.
http.get (path: string, options: Partial<HTTPOptions> = {}): Promise<unknown>;

// send a request with the HEAD method.
http.head (path: string, options: Partial<HTTPOptions> = {}): Promise<unknown>;

// send a request with the POST method and body.
http.post (path: string, body: BodyInit, options: Partial<HTTPOptions> = {}): Promise<unknown>;

// send a request with the PATCH method and body.
http.patch (path: string, body: BodyInit, options: Partial<HTTPOptions> = {}): Promise<unknown>;

// send a request with the PUT method and body.
http.put (path: string, body: BodyInit, options: Partial<HTTPOptions> = {}): Promise<unknown>;

// send a request with the delete method and an optional body.
http.delete (path: string, body?: BodyInit, options: Partial<HTTPOptions> = {}): Promise<unknown>;
```

## License
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Frubybb%2Fhttp.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Frubybb%2Fhttp?ref=badge_large)