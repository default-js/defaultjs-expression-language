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
  - [Executers](#executers)
    - [Choosing and tuning an executer](#choosing-and-tuning-an-executer)
    - [context-deconstruction-executer (the default)](#context-deconstruction-executer-the-default)
    - [context-object-executer](#context-object-executer)
    - [with-scoped-executer (deprecated)](#with-scoped-executer-deprecated)
    - [esprima-executer](#esprima-executer)
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

## Executers

The resolver finds an expression, picks the resolver of the chain it addresses, and hands the
statement inside the `${…}` to an **executer**, which runs it over that resolver's context. Which
resolver answers a name is the resolver's work and the same under every executer. How a statement
is written, which JavaScript it may contain, and what an assignment inside it leaves behind are the
executer's own — so switching executer can mean rewriting expressions.

Four executers ship with the package. Each is a solution of its own, with its own strengths and its
own limits, described below. They share only the interface in `src/Executer.js`.

### Choosing and tuning an executer

```javascript
import { ExpressionResolver } from "@default-js/defaultjs-expression-language";

// for one chain: a resolver built without the option takes the executer of its parent
const root = new ExpressionResolver({ context: { value: 1 }, executer: "context-object-executer" });
const leaf = new ExpressionResolver({ context: {}, parent: root });   // runs context-object-executer too

// for everything that names none
ExpressionResolver.defaultExecuter = "context-object-executer";
```

The option takes the registered name or an `Executer` instance. Importing an executer module
registers it under its name, and that module is also where it is tuned: `setupExecuter({ size })`
sets the size of its compiled-code cache, where `0` or less switches the cache off. Every executer
starts with 5000 entries; pass a size explicitly, because `setupExecuter()` without one sets 1000.

```javascript
import { setupExecuter } from "@default-js/defaultjs-expression-language/src/executer/ContextObjectExecuter.js";

setupExecuter({ size: 500 });
```

What holds under all four: a statement stands in **expression position**, so `${ 1; 2 }` is not two
statements; and the generated code runs in **sloppy mode**, so nothing here is a sandbox — a
statement that asks for the global object by name, as in `${ globalThis.x = 1 }`, gets it.

### context-deconstruction-executer (the default)

Module `src/executer/ContextDeconstructorExecuter.js`, registered by every entry point.

**How it works.** It destructures every name the context carries into the parameters of a generated
function and returns the statement from it. That is the fastest way to put a context into scope,
which is why it is the default.

**Writing a statement.** A context value is addressed by its bare name: `${ user.name }`. Everything
that is legal in expression position runs, including `await`, class fields and the assignment forms.
Globals are ordinary identifiers: `${ Math.round(price) }`, `${ JSON.stringify(data) }`, and any
global your page defines.

**What a context may be: plain data.** Every name the context carries, the inherited ones included,
becomes a variable before anything runs. So:

- A key that cannot be a variable — `"first-name"`, a symbol, a reserved word like `class`, an array
  index — stops **every** statement over that context, including `${ 1 + 1 }`. The `SyntaxError` names
  the key and the statement. An array, a `Map`, a `Set`, a `NodeList`, a DOM element and an
  `arguments` object carry such keys, so this executer does not run over them; use
  `context-object-executer` there.
- Every accessor of the context is read on every execution. A getter that throws breaks every
  statement; a getter that costs is paid each time.
- A context with more than 25 names produces a warning when a statement is compiled for it.

**Calling a method of the context.** `${ greet() }` over a class instance runs `greet` without its
object, so `this` is `undefined` inside it. Keep such contexts on `context-object-executer`.

**Writes.** An assignment writes into a local binding and is gone when the statement returns:
`${ count = 1 }` leaves the context unchanged, and `${ counter++ } ${ counter++ }` renders `0 0`.
Changing an object the context holds does persist — `${ user.name = "x" }` — because the statement
and the context hold the same object. An assignment to a name no resolver carries creates a global.
Use `updateData` or `mergeContext` to change a context, or `context-object-executer` where writes
from an expression have to persist.

### context-object-executer

Module `src/executer/ContextObjectExecuter.js`, registered by every entry point.

**How it works.** It hands the context to the statement as one object named `ctx` and runs the
statement as written. Nothing about the context is compiled into the code.

**Writing a statement.** A context value is addressed as a member of `ctx`: `${ ctx.user.name }`,
`${ root::ctx.value }`. A bare name is a global, so `${ value }` raises unless the page defines one.
Everything legal in expression position runs, and every global is reachable.

**What a context may be: anything.** Plain objects, class instances, arrays, `Map`, `Set`, a
`NodeList`, a DOM element, an `arguments` object, a frozen object, one without a prototype, one with
keys that are no variable names, symbols or reserved words. A getter of the context is read only
when the statement reads it. A method keeps its object: `${ ctx.greet() }` sees `this`.

**Writes.** An assignment through `ctx` behaves like one in JavaScript: `${ ctx.count = 1 }` is
readable afterwards, two `${ ctx.counter++ }` in one text count `0 1`, a write inside a nested
function or before the statement threw survives. A write lands on the resolver the statement ran on
and shadows the value of an ancestor rather than changing it; a name no resolver carries is created
there. A frozen context or a non-writable key keeps its value. A bare assignment, `${ x = 1 }`, is an
assignment to a global.

Pick this executer where completeness matters more than the last bit of speed.

### with-scoped-executer (deprecated)

Module `src/executer/WithScopedExecuter.js`, registered by every entry point. It announces its
deprecation on the first expression it runs.

**How it works.** It runs the statement inside a `with` block over the context — the original
strategy of this package, and the reason for the other three: `with` is deprecated and cannot run in
strict mode.

**Writing a statement.** Bare names, as with the default: `${ user.name }`. Everything legal in
expression position runs, every global is reachable, and a method of the context keeps its object.

**What a context may be: anything**, as for `context-object-executer`, and a getter is read only
when the statement reads it.

**Writes.** An assignment to a name the chain carries behaves like one in JavaScript and lands on
the resolver the statement ran on. An assignment to a name **no** resolver carries falls out of the
`with` block and creates a global instead.

### esprima-executer

Module `src/executer/EsprimaExecuter.js`. **Not registered by default**, because its parser `espree`
makes the browser bundle many times larger. Import the module, or load the
`browser-all-executers-…` bundle, before naming it.

```javascript
import { EXECUTERNAME } from "@default-js/defaultjs-expression-language/src/executer/EsprimaExecuter.js";

const resolver = new ExpressionResolver({ context: { price: 4 }, executer: EXECUTERNAME });
```

**How it works.** It parses the statement with `espree`, rewrites the identifiers it reaches into
`ctx?.name`, and generates code again with `escodegen`.

**Writing a statement.** Bare names: `${ price * amount }`. A context value is reached where the
rewrite walks: operands of an operator, `??`, member access (`${ user.address.city }`,
`${ user?.address }`), calls and their arguments, template literals, `await`. It is **not** reached
inside a function written in the statement — an arrow or callback (`${ items.map((i) => i + tax) }`),
a function expression, a default parameter, an async function — nor inside an object or array
literal, a computed key, a spread, the branches of a ternary, the key of `a[b]`, a tagged template,
or as the class of `new Cls()`. A class field does not run at all.

**Globals.** Only `window`, `self`, `Object`, `Array`, `Map`, `Set`, `fetch` and `console` are
reachable as bare names. Everything else becomes a context lookup: `${ Math.round(1.5) }`,
`${ JSON.stringify(x) }`, `Date`, `Promise`, `document` and globals your page defines are not
reached — go through `window`, as in `${ window.Math.round(1.5) }`.

**What a context may be: anything**, as for `context-object-executer`.

**Writes.** An assignment to a context name does not run: `${ count = 1 }`, `+=` and `++` raise.
Nothing a statement writes reaches the context. A bare assignment inside a function written in the
statement is not rewritten and creates a global.

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
