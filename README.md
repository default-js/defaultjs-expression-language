# defaultjs-expression-language

** Table of Contents

- [defaultjs-expression-language](#defaultjs-expression-language)
  - [Intro](#intro)
  - [Install](#install)
    - [Browser](#browser)
    - [Nodejs/NPM](#nodejsnpm)
  - [Using](#using)
    - [Simple value replacement](#simple-value-replacement)
    - [Promise / async support](#promise--async-support)
  - [API Documentation](#api-documentation)
    - [Context sensitive behavior](#context-sensitive-behavior)
    - [Default value behavior](#default-value-behavior)
    - [Timeout behavior](#timeout-behavior)
  - [Development](#development)
  - [License](#license)

## Intro

This lib provide functionallity similar to the text literals at javascript, but this lib supports Promise results from an Expression.

** Use this lib for dynamic content solutions.

## Install

### Browser

```html
<script type="text/javascript" src="browser-defaultjs-expression-language.min.js"></script>
```

### Nodejs/NPM

````
npm install @default-js/defaultjs-expression-language

````

```javascript
import ExpressionResolver from "@default-js/defaultjs-expression-language"

/*simple value replacement*/
ExpressionResolver.resolve("${name}", {"name": "max mustermann"})
.then(console.log); // max mustermann

ExpressionResolver.resolveText("hello ${name}, nice to see you!", {"name": "max mustermann"})
.then(console.log); // hello max mustermann, nice to see you!
```

## Using

### Simple value replacement

```javascript
import ExpressionResolver from "@default-js/defaultjs-expression-language"

/*resolve an expression*/
ExpressionResolver.resolve("${name}", {"name": "max mustermann"})
.then(console.log); // max mustermann

/*replace expression at string*/
ExpressionResolver.resolveText("hello ${name}, nice to see you!", {"name": "max mustermann"})
.then(console.log); // hello max mustermann, nice to see you!
```

### Promise / async support

```javascript
/*promise value replacement*/
ExpressionResolver.resolve("${name}", {"name": function(){
	return Promise.resolve("max mustermann");
}).then(console.log); // max mustermann

ExpressionResolver.resolveText("hello ${name}, nice to see you!", {"name": function(){
	return Promise.resolve("max mustermann");
}).then(console.log); // hello max mustermann, nice to see you!
```

## API Documentation

```javascript
import ExpressionResolver from "@default-js/defaultjs-expression-language";

ExpressionResolver.resolve(aStatement, aContext, aDefault, aTimeout)
// returned a promise and the expression can be resolved to any type

ExpressionResolver.resolveText(aStatement, aContext, aDefault, aTimeout)
// returned a promise and the expression would be resolved to an string
```

### Context sensitive behavior

```javascript
const global = window || global || self || this || {};
global.test = "global test var";
ExpressionResolver.resolve("${test}"); // global test var
ExpressionResolver.resolve("${test}", {}); // global test var
ExpressionResolver.resolve("${test}", {test: "local test var"}); // local test var

ExpressionResolver.resolveText("text ${test} text"); // text global test var text
ExpressionResolver.resolveText("text ${test} text", {}); // text global test var text
ExpressionResolver.resolveText("text ${test} text", {test: "local test var"}); // text local test var text
```

### Default value behavior

```javascript
const global = window || global || self || this || {};
global.test = undefined;
ExpressionResolver.resolve("${test}", global, "var is undefined"); // var is undefined
ExpressionResolver.resolveText("text ${test} text", global, "var is undefined"); // text var is undefined text
```

### Timeout behavior

```javascript
const global = window || global || self || this || {};
global.test = "global test var";
ExpressionResolver.resolve("${test}", global, undefined, 1000);
// the expression resolver waits 1000ms, before starting the resolving process

ExpressionResolver.resolveText("text ${test} text", global, undefined, 1000);
// the expression resolver waits 1000ms, before starting the resolving process
```

## Development

Building and testing this package needs **Node 22.15 or newer, and not Node 23** —
`webpack-dev-server` requires `>= 22.15.0`, and Vitest accepts `^20 || ^22 || >=24`, which
leaves 23 out. `.nvmrc` names the version this is developed against.

This floor applies to the toolchain only, not to the package. `engines` is deliberately left
unset, because it would be imposed on everyone installing the library, which targets the
browser and does not care which Node published it.

| | |
|---|---|
| `npm test` | the test gate — Vitest in headless Chromium via Playwright |
| `npm run test:live` | the same in watch mode |
| `npm run test:coverage` | the same with a coverage report in `coverage/` |
| `npm run build` | tests plus the development and production bundles into `dist/` |
| `npm run dev` | development server against `WebContent/` |

The browsers Playwright needs are not installed by `npm install`. Run
`npx playwright install chromium` once after cloning.

## License

[MIT](LICENSE)
