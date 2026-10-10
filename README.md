# defaultjs-expression-language

Resolves `${…}` expressions against a data context, at runtime, in the browser. An expression reads
like one in a JavaScript template literal, but it is evaluated on demand, a promise it answers is
awaited, and resolvers can be stacked into a chain that gives a template engine hierarchic scopes.

## Table of Contents

- [Install](#install)
- [Quick start](#quick-start)
- [Security](#security)
- [API at a glance](#api-at-a-glance)
  - [`ExpressionResolver`](#expressionresolver)
  - [`ExecuterRegistry`](#executerregistry)
  - [`Executer`](#executer)
  - [Executer modules](#executer-modules)
- [Expressions](#expressions)
- [Resolving](#resolving)
  - [`resolve` and `resolveText`](#resolve-and-resolvetext)
  - [Promises](#promises)
  - [The static call forms](#the-static-call-forms)
  - [Default value](#default-value)
  - [Timeout](#timeout)
- [Resolver chains](#resolver-chains)
  - [Lookup and scopes](#lookup-and-scopes)
  - [Names](#names)
  - [Inspecting a chain](#inspecting-a-chain)
- [Changing a context](#changing-a-context)
- [Errors](#errors)
- [Globals](#globals)
- [Filtered contexts](#filtered-contexts)
- [Executers](#executers)
  - [Choosing and tuning an executer](#choosing-and-tuning-an-executer)
  - [context-deconstruction-executer (the default)](#context-deconstruction-executer-the-default)
  - [context-object-executer](#context-object-executer)
  - [with-scoped-executer (deprecated)](#with-scoped-executer-deprecated)
  - [A custom executer](#a-custom-executer)
- [Upgrading from 2.x](#upgrading-from-2x)
- [Development](#development)
- [License](#license)

## Install

```sh
npm install @default-js/defaultjs-expression-language
```

The package is an ES module and is reached by its name. It has **no default export**; both of its
members are named:

```javascript
import { ExpressionResolver, ExecuterRegistry } from "@default-js/defaultjs-expression-language";
```

Importing the package registers all three executers. Without a bundler, load the browser script
from `dist/` instead; it sets the same two members, and `VERSION`, on the global object under
`defaultjs.el`. Where `defaultjs.el` is already set, by a second copy of the script for example, it
is left as it is:

```html
<script src="node_modules/@default-js/defaultjs-expression-language/dist/browser-defaultjs-expression-language.min.js"></script>
<script>
  const { ExpressionResolver } = defaultjs.el;
</script>
```

`dist/module-defaultjs-expression-language.min.js` is the same, bundled as an ES module.

These paths of the package can be imported, and every other one is closed:

| Path | What it is |
| --- | --- |
| the package itself | `ExpressionResolver` and `ExecuterRegistry`, every executer registered |
| `/browser.js` | the same, and sets `defaultjs.el` on the global object |
| `/src/Executer.js` | `Executer`, as its default export |
| `/src/executer/<module>.js` | an executer module, the way to tune that executer |
| `/dist/<file>` | the bundles |
| `/package.json` | the manifest |

## Quick start

```javascript
import { ExpressionResolver } from "@default-js/defaultjs-expression-language";

await ExpressionResolver.resolveText("hello ${name}, nice to see you!", { name: "max mustermann" });
// "hello max mustermann, nice to see you!"

await ExpressionResolver.resolve("${ items.length * 2 }", { items: [1, 2, 3] });
// 6 - a number: resolve keeps the type of the result
```

Resolvers stack into a chain: a resolver sees the values of its parents, and a scope prefix
addresses one of them by name.

```javascript
const page = new ExpressionResolver({ name: "page", context: { title: "Shop", currency: "EUR" } });
const item = new ExpressionResolver({ parent: page, context: { title: "Book", price: 12 } });

await item.resolveText("${title}: ${price} ${currency}"); // "Book: 12 EUR"
await item.resolve("${ page::title }");                   // "Shop"
```

## Security

An expression is JavaScript, and it runs with every right the page has. Every executer compiles a
statement with `new Function`, so:

- **Never resolve text from an untrusted source.** Whoever writes an expression can call `fetch`,
  read `document.cookie` and reach every global. Neither the context nor
  [`buildFiltered`](#filtered-contexts) limits that: they decide which data an expression finds,
  not what it may do. Nothing in this package is a sandbox.
- **A Content Security Policy has to allow `'unsafe-eval'`** in `script-src`. Without it no
  statement compiles, and the refusal reaches the caller as the browser's `EvalError`.

## API at a glance

The whole public surface, by component. The sections further down explain the behaviour in depth;
this is the reference.

| Component | Imported from | Role |
| --- | --- | --- |
| [`ExpressionResolver`](#expressionresolver) | the package | resolves expressions, on its own or as one resolver of a chain |
| [`ExecuterRegistry`](#executerregistry) | the package | keeps executers under a name |
| [`Executer`](#executer) | `/src/Executer.js`, default export | the interface every executer implements |
| [Executer modules](#executer-modules) | `/src/executer/<module>.js` | one shipped executer each, and its tuning |

### `ExpressionResolver`

#### Static members

Each static call builds a resolver of its own over an ad-hoc context and runs under
`defaultExecuter`.

- **`ExpressionResolver.resolve(expression, context?, defaultValue?, timeout?)`** → `Promise<*>` —
  resolves one expression and answers its value with its type intact. `expression` is a delimited
  `${…}`, with or without a scope prefix, or a bare statement. `context` is any object; `null` or
  left out means none. A `defaultValue` replaces a result of `null` or `undefined` and counts as
  passed when the third argument is present, `undefined` included. A positive `timeout` delays the
  start by that many milliseconds. Rejects with the statement's error after logging it, and with a
  `TypeError` for an argument of the wrong type. See [Resolving](#resolving).
- **`ExpressionResolver.resolve({ expression, context, defaultValue, timeout })`** — the same as one
  configuration object. The first argument alone decides the form, and every argument behind a
  configuration is ignored. A default counts as passed when the key `defaultValue` is present.
  Without a string under `expression` it rejects with a `TypeError`. See
  [The static call forms](#the-static-call-forms).
- **`ExpressionResolver.resolveText(text, context?, defaultValue?, timeout?)`** → `Promise<string>` —
  replaces every expression of the text by its value, converted to a string, and answers the text.
  Each occurrence is evaluated on its own, an escaped `\${` is not evaluated, and the default applies
  per expression. A failing expression stays in the text as written and a warning names it; the call
  itself rejects only for an argument of the wrong type. `context` and `timeout` as for `resolve`.
- **`ExpressionResolver.resolveText({ text, context, defaultValue, timeout })`** — the same as one
  configuration object, with the text under `text`.
- **`ExpressionResolver.buildFiltered({ context, propFilter, option })`** → `ExpressionResolver` —
  builds a resolver over a filtered copy of `context`, which stays untouched.
  `propFilter(name, value, holder)` is called for every enumerable property, inherited ones
  included, and a property it answers `false` for is left out. `option` carries `deep`, which
  filters nested objects as well and defaults to `true`, and the constructor options `name`,
  `parent` and `executer`. It filters the context, never the globals — see
  [Filtered contexts](#filtered-contexts).
- **`ExpressionResolver.buildSecure(…)`** — the former name of `buildFiltered`, with the same
  arguments. Deprecated.
- **`ExpressionResolver.defaultExecuter`**, read and written — the executer of a resolver built
  without a parent and without the `executer` option, and so of the static calls. It is set to a
  registered name or an `Executer` instance; an unregistered name throws, any other value is
  rejected with a `TypeError`, and every set writes a line to the console. Read, it answers the instance. A resolver keeps the executer it was built
  with, so a change affects only resolvers built afterwards. Starts as
  `context-deconstruction-executer`.

#### Constructor

`new ExpressionResolver({ context, parent, name, executer })` builds one resolver. Every option may be
left out.

| Option | Takes | Where it is left out |
| --- | --- | --- |
| `context` | any object, a function included. The resolver keeps this object, not a copy, and writes into it. A primitive is rejected with a `TypeError`. | `null` or `undefined` as well: the resolver has no context of its own until a value is written to it |
| `parent` | an `ExpressionResolver`, which makes this one part of its chain. Anything else is rejected with a `TypeError`. | the resolver is the root of a chain |
| `name` | a string by the rule of [Names](#names), kept trimmed. Any other is rejected with a `TypeError`. | a unique name is generated |
| `executer` | a registered name, where an unregistered one throws, or an `Executer` instance, which needs no registration. Any other value is rejected with a `TypeError`. | `null` or `undefined` as well: the executer of `parent`, and without a parent `defaultExecuter` |

#### Instance methods

- **`resolver.resolve(expression, defaultValue?)`** → `Promise<*>` — as the static `resolve`, over
  this resolver's chain: a name is looked up from this resolver towards the root, and a scope prefix
  climbs to the nearest resolver of that name. A default counts as passed when the second argument
  is present. There is no timeout. A non-string is rejected with a `TypeError`.
- **`resolver.resolveText(text, defaultValue?)`** → `Promise<string>` — as the static `resolveText`,
  over this resolver's chain.
- **`resolver.getData(key?, filter?)`** → `*` — reads `key` along the chain from the addressed
  resolver towards the root; the nearest resolver carrying the key answers. Without a key, `null` or
  `undefined`, it answers the whole context of the addressed resolver, as the getter `context` does.
- **`resolver.updateData(key, value, filter?)`** — sets a value in the object that was handed over.
  Without a filter it is changed on the nearest resolver carrying the key, counting from this one
  towards the root, and created on this one where none carries it. With a filter it is written on
  the addressed resolver and shadows any value further up. A missing key is a `TypeError`.
- **`resolver.deleteData(key, filter?)`** — removes the key from one resolver: the addressed one
  with a filter, otherwise the nearest one carrying it. The value of the next resolver up that
  carries the same key shows again. Where no resolver carries it, nothing happens.
- **`resolver.mergeContext(object, filter?)`** — assigns the keys of `object` shallowly into the
  addressed resolver, replacing what is there and adding what is not, without searching the chain.
  `null` or `undefined` changes nothing, a primitive is a `TypeError`. Where the object refuses a
  key, the keys before it are written by then.

What the four data methods share:

- **`key`** is a string, a number, which is read as its string, or a symbol. Any other type is a
  `TypeError`.
- **`filter`** is a resolver name, trimmed, and addresses the nearest resolver of that name from
  this one towards the root; without one, or with an empty one, the call addresses this resolver. A
  filter that matches no resolver throws an `Error`, one that is no string a `TypeError`.
- **An object that refuses** a write or a deletion, a frozen one for example, raises a `TypeError`.

See [Changing a context](#changing-a-context).

#### Getters

All of them are read-only.

| Getter | Answers |
| --- | --- |
| `name` | the resolver's name, the one passed or a generated one; never `null` |
| `parent` | the parent resolver, or `null` at the root |
| `context` | the context as an expression sees it: a view that reads along the chain, not the object handed over. Over the global object, the global object itself |
| `executer` | the `Executer` instance in use, fixed in the constructor |
| `chain` | the names from the root down to this resolver as a path, `/root/…/this`. It describes the structure and never changes |
| `effectiveChain` | the same path with only the resolvers that provide a context, `""` where none does. It changes when a resolver without a context gets a value |
| `contextChain` | the contexts of the resolvers `effectiveChain` names, as `context` answers them, this resolver's first |
| `contextHandle` | the internal handle behind the context. It is public only for `contextHandle.resetCache()`, which takes up keys added to the handed-over object past the resolver |

### `ExecuterRegistry`

Imported from the package, a namespace of two functions.

- **`ExecuterRegistry.register(name, executer)`** — keeps an `Executer` under a name and replaces one
  already kept under it. Every shipped executer registers itself when its module is imported, and
  importing the package imports all three.
- **`ExecuterRegistry.getExecuter(name)`** → `Executer` — the executer kept under the name. Throws
  an `Error` where none is.

### `Executer`

The default export of `/src/Executer.js`, the interface every executer implements. See
[A custom executer](#a-custom-executer).

- **`new Executer({ execution })`** — builds an executer from `execution(statement, context)`, the
  function that runs a statement over a context and answers the result, a promise included. Without
  one, every execution throws.
- **`executer.execute(statement, context)`** → `*` — runs the statement, without delimiters and
  scope prefix, over the context of the resolver it is evaluated on. The resolver calls it.

### Executer modules

One module per shipped executer under `/src/executer/`. Importing one registers its executer:

| Module | `EXECUTERNAME` |
| --- | --- |
| `ContextDeconstructorExecuter.js` | `"context-deconstruction-executer"`, the default |
| `ContextObjectExecuter.js` | `"context-object-executer"` |
| `WithScopedExecuter.js` | `"with-scoped-executer"`, deprecated |

Each of them exports:

- **`EXECUTERNAME`** — the name the executer is registered under.
- **The executer itself**, as the default export, to hand to a resolver directly.
- **`setupExecuter({ size })`** — sets the size of this executer's compiled-code cache, which starts
  at 5000 entries. `0` or less switches the cache off and releases its entries, and a later positive
  size switches it on again, empty. A fraction is rounded down, a `size` that is not a finite number
  is a `TypeError`, and a call without `size` changes nothing.
- **`setupExecuter({ contextVar })`** and **`getContextVar()`**, from `ContextObjectExecuter.js`
  only — set and answer the name a statement addresses the context by, `ctx` until it is set; see
  [context-object-executer](#context-object-executer).
- **`setDebug(on)`**, from `ContextDeconstructorExecuter.js` only — logs every function the executer
  generates to the console.

## Expressions

An expression is a **statement** between `${` and the matching `}`. The statement is JavaScript in
expression position — arithmetic, a call, a ternary, an object literal, `await`:

```javascript
"${ user.firstName + ' ' + user.lastName }"
"${ price > 100 ? 'expensive' : 'cheap' }"
"${ await loadUser(id) }"
```

How a statement addresses a context value depends on the [executer](#executers): the default
writes the bare name, `context-object-executer` writes `ctx.name`. Every example in this readme
runs under the default.

- **Braces are counted.** `${ { a: 1 }.a }` is one expression. A brace inside a string, a template
  literal, a regular expression literal or a comment does not count, so `${ "}" }` is one as well.
- **An unclosed `${` is text.** It stands as written, nothing is evaluated, nothing fails.
- **`${}` answers `undefined`.**
- **Escaping, in `resolveText` only.** A backslash before `${` escapes it, and that one backslash
  is consumed: the text `\${name}` renders as `${name}`. An even number of backslashes escapes
  nothing, and no other backslash is ever removed. In a JavaScript string literal the
  backslash itself has to be written twice: `"\\${name}"`.
- **A scope prefix** `${name::statement}` evaluates the statement on one resolver of a chain — see
  [Lookup and scopes](#lookup-and-scopes).

## Resolving

### `resolve` and `resolveText`

`resolve` evaluates **one** expression and answers its value with its type intact. It also takes a
bare statement without delimiters: an input that begins with `${` and ends with `}` is the
delimited form, anything else is a bare statement and goes to the executer as it stands.

`resolveText` replaces **every** expression of a text by its value, converted to a string, and
answers the text. Each occurrence is evaluated on its own, so `${ counter() }` twice calls twice.

```javascript
await ExpressionResolver.resolve("${ a + b }", { a: 1, b: 2 });           // 3
await ExpressionResolver.resolve("a + b", { a: 1, b: 2 });                // 3, a bare statement
await ExpressionResolver.resolveText("${a} + ${b} = ${ a + b }", { a: 1, b: 2 }); // "1 + 2 = 3"
```

Both are available statically, with an ad-hoc context, and on an instance, over its chain
([Resolver chains](#resolver-chains)).

### Promises

Both entry points answer a promise, always. A value that is a promise is awaited before it is
answered or inserted, and a statement may `await`. A function is not called for you:
`${ load }` answers the function, `${ load() }` its result.

```javascript
const context = {
  name: Promise.resolve("max mustermann"),
  load: async () => "loaded",
};

await ExpressionResolver.resolve("${name}", context);                 // "max mustermann"
await ExpressionResolver.resolveText("${ load() } and ${ await load() }", context); // "loaded and loaded"
```

### The static call forms

The static `resolve` and `resolveText` take their arguments positionally or as one configuration
object, and the first argument alone decides which. The configuration form is the readable one
as soon as more than a context is involved. Every argument behind a configuration is ignored.

```javascript
await ExpressionResolver.resolve("${ user.name }", { user: { name: null } }, "anonymous", 500);
// "anonymous" - but what does 500 mean?

await ExpressionResolver.resolve({
  expression: "${ user.name }",
  context: { user: { name: null } },
  defaultValue: "anonymous",
  timeout: 500,
});
// "anonymous"
```

A first argument that is neither a string nor an object, and a configuration without a string under
`expression` or `text`, is rejected with a `TypeError`.

### Default value

A default value replaces a result of `null` **and** `undefined`, and never covers an error.
In `resolveText` it applies per expression; without one, `null` and `undefined` render as the texts
`null` and `undefined`.

```javascript
await ExpressionResolver.resolve("${ name }", { name: null }, "n/a");                  // "n/a"
await ExpressionResolver.resolveText("${ first } ${ last }", { first: "max", last: undefined }, "?"); // "max ?"
await ExpressionResolver.resolveText("${ last }", { last: undefined });                // "undefined"
```

Positionally, a default counts as passed when the third argument is present, `undefined` included;
in a configuration, when the key `defaultValue` is present.

### Timeout

The timeout, in milliseconds, **delays the start** of the resolution. It is not a deadline: nothing
is aborted when the resolution takes longer.

## Resolver chains

A resolver carries a context, a name, and optionally a parent. The resolvers from it up to the root
form a chain, and a resolver sees its own context and those of **all its parents**, never one below
it. A template engine builds the chain as it descends into nested structure: a value introduced
deeper shadows one further up and never overwrites it.

```javascript
const shop = new ExpressionResolver({ name: "shop", context: { title: "Shop", currency: "EUR" } });
const item = new ExpressionResolver({ name: "item", parent: shop, context: { title: "Book", price: 12 } });

await item.resolveText("${title}: ${price} ${currency}"); // "Book: 12 EUR"
await item.resolve("${ shop::title }");                    // "Shop"
await shop.resolve("${title}");                            // "Shop" - shop does not see item
```

A resolver built without the `executer` option takes the executer of its parent.

### Lookup and scopes

- **Without a prefix**, the lookup starts at the resolver the call was made on and climbs towards
  the root; the **nearest** resolver carrying the key answers. What counts is that the key
  exists, not what it holds: a key holding `undefined` shadows a value further up.
- **With a prefix**, `${name::statement}` climbs to the nearest resolver of that name and evaluates
  the statement there, against its context and those above it and with its executer. In a chain
  that mixes executers, each expression is written for the resolver it addresses.
- **A prefix no resolver carries** answers `undefined`, and a default applies to it.
- **A prefix whose name is empty** — `${::title}` or `${ ::title}` — is no prefix: the statement
  is evaluated on the resolver the call was made on.

```javascript
await item.resolve("${ nowhere::title }");          // undefined
await item.resolve("${ nowhere::title }", "none");  // "none"
```

A context inherits from `Object.prototype` unless it was built without a prototype, so a resolver
over a plain object also carries `toString`, `valueOf` and the like, and shadows a resolver further
up holding one of those names as data.

### Names

A name is a label: the ASCII letters `a`–`z` and `A`–`Z`, digits, whitespace, `-` and `_`,
trimmed at both ends. The constructor rejects any other name with a `TypeError`. Where
none is passed, the resolver generates a unique one; its shape is not part of the API.

### Inspecting a chain

```javascript
item.chain;          // "/shop/item" - every resolver from the root down
item.effectiveChain; // "/shop/item" - only those that provide a context
item.contextChain;   // [item.context, shop.context] - this resolver's first
```

`contextChain` holds the contexts as the getter `context` answers them, not the objects handed to
the constructor. `effectiveChain` and `contextChain` describe a state: a resolver built without a
context joins them the moment a value is set on it.

## Changing a context

Four methods read and write a context from outside. Unlike an assignment inside an expression,
whose effect is the executer's own, they behave the same under every executer.

```javascript
const shop = new ExpressionResolver({ name: "shop", context: { currency: "EUR" } });
const item = new ExpressionResolver({ name: "item", parent: shop, context: { title: "Book" } });

item.getData("currency");                 // "EUR" - read along the chain
item.updateData("currency", "USD");       // changed on shop, where the key lives
item.updateData("currency", "CHF", "item"); // with a filter: written on item, shadows shop
item.mergeContext({ stock: 3 });          // keys defined on item
item.deleteData("currency");              // removed from item, shop's "USD" shows again
```

- **`filter`** is a scope name and selects the one resolver a call applies to. A filter that matches
  no resolver throws — a wrong name in code is a mistake, unlike a wrong prefix in an expression.
- **The object you handed over is written.** A resolver keeps that object, not a copy; hand over a
  copy where that is not wanted. A frozen or sealed object raises the error it raises anyway.
- **Keys are a snapshot, values are live**. A key added to the handed-in object directly,
  past the resolver, is not seen until `resolver.contextHandle.resetCache()` runs; a value changed
  under an existing key is seen at once. The four methods keep the keys in step themselves.
- **`getData()` without a key**, like the getter `context`, answers the context as an expression
  sees it: not the object handed over, but one that reads along the chain.

## Errors

- **`resolveText` keeps rendering.** A failing expression stands in the text exactly as written,
  and a warning names its statement.
- **`resolve` hands the error on.** It logs the statement and the error and rejects with it; a
  caller who wants a fallback writes the `try`/`catch`.
- **A default value never covers an error.**
- **A mistake in the calling code** is rejected outright: an argument of the wrong type with a
  `TypeError`.

```javascript
await ExpressionResolver.resolveText("a ${ broken( } b", {}); // "a ${ broken( } b", and a warning
await ExpressionResolver.resolve("${ broken( }", {});        // logs, then rejects with the statement's SyntaxError
```

## Globals

A name the chain does not carry falls through to the global object under the default executer, so
`${ Math.max(a, b) }` and any global the page defines are reachable — see [Security](#security).
Put a name you want resolved locally into the context, where it is found first.

The global object can itself be the context of a resolver. It then carries every name and answers
every lookup that reaches it, so it belongs at the root of a chain.

## Filtered contexts

`buildFiltered` builds a resolver over a **filtered copy** of a context, to keep properties out of
what an expression finds. `propFilter` is called with the name, the value and the object holding it, and a property it
answers `false` for is left out; `option` takes `deep`, which filters nested objects as well and
defaults to `true`, and the constructor options `name`, `parent` and `executer`.

```javascript
const page = ExpressionResolver.buildFiltered({
  context: { user: { name: "max", password: "secret" } },
  propFilter: (aName) => aName !== "password",
  option: { name: "page" },
});

await page.resolve("${ user.password }"); // undefined
```

It filters the context, **not the globals**: `fetch`, `document` and `console` stay reachable, so it
does not make an untrusted expression safe — see [Security](#security).
`buildSecure` is the former name, deprecated.

## Executers

The resolver finds an expression, picks the resolver of the chain it addresses, and hands the
statement inside the `${…}` to an **executer**, which runs it over that resolver's context. Which
resolver answers a name is the resolver's work and the same under every executer. How a statement
is written, which JavaScript it may contain, and what an assignment inside it leaves behind are the
executer's own — so switching executer can mean rewriting expressions.

Three executers ship with the package. Each is a solution of its own, with its own strengths and its
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

The option takes the registered name or an `Executer` instance, and so does `defaultExecuter`,
which answers the instance when read and writes a line to the console when set. Importing an executer module
registers it under its name, and that module is also where it is tuned: `setupExecuter({ size })`
sets the size of its compiled-code cache, where `0` or less switches the cache off. Every executer
starts with 5000 entries. An option left out changes nothing, a `size` that is not a finite number
is rejected with a `TypeError`, and a fraction is rounded down. `context-object-executer` takes a
second option, `contextVar`, the name a statement addresses the context by.

```javascript
import { setupExecuter } from "@default-js/defaultjs-expression-language/src/executer/ContextObjectExecuter.js";

setupExecuter({ size: 500 });
```

What holds under all three: a statement stands in **expression position**, so `${ 1; 2 }` is not two
statements; and the generated code runs in **sloppy mode**, so a statement that asks for the global
object by name, as in `${ globalThis.x = 1 }`, gets it — see [Security](#security).

A statement **must not begin with a comment that ends a line** — a `//` comment, or a `/* … */`
spanning a line break. The generated code places the statement right behind `return`, so the line
ends there and the statement answers `undefined`: `${ // note⏎ value }` does not answer `value`. A
comment anywhere after the first token, or a block comment on one line, is harmless.

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

**The name `ctx`** is the executer's setting, and `setupExecuter({ contextVar })` changes it for every
statement the executer runs from then on, whichever resolver hands it over. `getContextVar()`
answers the name in use.

```javascript
import { setupExecuter } from "@default-js/defaultjs-expression-language/src/executer/ContextObjectExecuter.js";

setupExecuter({ contextVar: "data" });   // ${ data.user.name }
```

A name is taken trimmed: `" data "` sets `data`. `null`, `undefined` and a string that is empty after
trimming leave the name as it is, and any other value that is not a string is a `TypeError`. A name
that cannot be a parameter name is not rejected: every statement then throws a `SyntaxError`.

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
strategy of this package, and the reason for the other two: `with` is deprecated and cannot run in
strict mode.

**Writing a statement.** Bare names, as with the default: `${ user.name }`. Everything legal in
expression position runs, every global is reachable, and a method of the context keeps its object.

**What a context may be: anything**, as for `context-object-executer`, and a getter is read only
when the statement reads it.

**Writes.** An assignment to a name the chain carries behaves like one in JavaScript and lands on
the resolver the statement ran on. An assignment to a name **no** resolver carries falls out of the
`with` block and creates a global instead.

### A custom executer

An executer is an `Executer` built from the function that runs a statement over a context. Hand the
instance to a resolver directly, or register it and use its name:

```javascript
import Executer from "@default-js/defaultjs-expression-language/src/Executer.js";
import { ExpressionResolver, ExecuterRegistry } from "@default-js/defaultjs-expression-language";

const upper = new Executer({
  execution: (aStatement, aContext) => String(aContext[aStatement]).toUpperCase(),
});

new ExpressionResolver({ context: { name: "max" }, executer: upper }); // no registration needed

ExecuterRegistry.register("upper-executer", upper);
const resolver = new ExpressionResolver({ context: { name: "max" }, executer: "upper-executer" });
await resolver.resolve("${name}"); // "MAX"
```

The function receives the statement without delimiters and scope prefix, and the context of the
resolver the statement is evaluated on, which reads along its chain. It may answer a promise.
Everything outside the statement stays the resolver's work under every executer: which resolver
answers, the default value, the errors, the escaping.

## Upgrading from 2.x

3.0.0 changes behaviour a 2.x caller may rely on. The changes most likely to break one, each
described in full in [CHANGELOG.md](CHANGELOG.md):

- **The default executer is `context-deconstruction-executer`.** An assignment inside an expression
  no longer reaches the context, and an array, a `Map`, a `Set`, a `NodeList` or a DOM element can
  no longer be a context under it. `context-object-executer` covers both, with `ctx.` in front of
  every context value.
- **`resolve` rejects when a statement fails**, where it answered `undefined` or the default value.
  `resolveText` leaves a failing expression standing in the text.
- **Deep imports are closed**: only the paths listed under [Install](#install) can be imported.
- **The data methods follow the chain.** A filter selects one resolver and throws where it matches
  none; `updateData` and `deleteData` without a filter act where the key lives.
- **A resolver without the `executer` option takes the executer of its parent.**
- **Renamed:** `ExecuterRegistry.registrate` is `register`, the old name is gone;
  `ExpressionResolver.buildSecure` is `buildFiltered`, the old name still works and is deprecated.
- **Removed:** `EsprimaExecuter`, the bundle `browser-all-executers`, the option `defaultContext` of
  `Executer`, and the warning for a statement running longer than a second.

## Development

Building and testing needs **Node 22.15 or newer, and not Node 23**; `.nvmrc` names the version this
is developed against. The floor applies to the toolchain only, so `engines` is deliberately unset.

| | |
|---|---|
| `npm test` | the test gate — Vitest in headless Chromium via Playwright |
| `npm run test:live` | the same in watch mode |
| `npm run test:coverage` | the same with a coverage report in `coverage/` |
| `npm run build` | tests plus the development and production bundles into `dist/` |
| `npm run dev` | development server against `WebContent/` |
| `npm run bench` | the benchmarks under `test/PerformanceTests/`, not part of the test gate |

The browsers Playwright needs are not installed by `npm install`. Run
`npx playwright install chromium` once after cloning.

## License

[MIT](LICENSE)
