# Specification — `@default-js/defaultjs-expression-language`

**Written 2026-08-22, for version 3.**

This document says **what the package does**, not why. The reasoning lives in `DECISIONS.md`,
open work in `BACKLOG.md`, and `README.md` carries the part of this document a consumer needs to
get started.

It was written from an interview with the author, not from reading the code. That is deliberate:
the code has behaviour that is a regression rather than an intention, so it is not a reliable
witness to what the package is meant to do. **Where the code disagrees with a rule below, the rule
is the specification and the code is the defect.** Every such place is marked *Not yet
implemented*, and section 10 lists them in one table.

---

## 1. Purpose

The package resolves expressions embedded in text or handed over on their own, against a data
context, at runtime in the browser. It exists because a declarative template engine needs to
evaluate dynamic expressions, and it is modelled on the Java Standard Expression Language.

Two kinds of consumer are supported equally: other packages of the `defaultjs-*` family — first
of all the template engine — and application code, for instance a web component evaluating an
expression that stands in an HTML attribute.

The chain of resolvers is what makes it more than an evaluator: a template descends through
nested structure, introduces values at a given depth, and unwinds again. Values introduced
deeper must never overwrite values further up.

## 2. Terms

| Term | Meaning |
|---|---|
| **Statement** | A piece of JavaScript to be evaluated, without delimiters. |
| **Expression** | A statement in its delimited form, `${…}`, optionally carrying a scope prefix. |
| **Resolver** | One `ExpressionResolver` instance: a name, a context, and optionally a parent. |
| **Chain** | A resolver and its parents. Also called the stacking context. |
| **Link** | One resolver within a chain. |
| **Root** | The link that has no parent. A resolver without a parent is its own root. |
| **Context** | The data an expression is evaluated against, one object per link. |
| **Executer** | The strategy that turns a statement into a value. Pluggable. |

**Direction.** The chain is drawn as a tree in the usual way of computer science: the **root at
the top**, its children below it, a leaf furthest down. So *up*, *above* and *nearer the root*
all point from a resolver towards its parents, while *down*, *below* and *deeper* point away from
the root. A lookup climbs; a template descends as it builds and unwinds as it finishes.

## 3. Expression syntax

### 3.1 Delimiters

An expression begins with `${` and ends at the **matching** closing brace. Braces inside the
statement — an object literal, an arrow function body, a nested template literal — are part of
the statement and must be counted, not terminated on.

*Not yet implemented* — the current regular expression cannot nest; see `BACKLOG.md`, "An
expression that contains braces is not recognized".

### 3.2 Escaping

A backslash directly before the `$` escapes the expression. It is not evaluated, and the text
stands as written without the backslash.

### 3.3 Scope prefix

`${name::statement}` evaluates the statement on the link of the chain that carries the name
`name`. The prefix is optional; without it the resolver the call was made on applies.

The name is a label, not a JavaScript identifier. Allowed are **letters, digits, whitespace,
`-` and `_`** — nothing else. The name is trimmed at both ends, so leading and trailing
whitespace is not part of it. The character set is deliberately tight, so that scope and
statement can always be separated cheaply and no quoted `::` inside a statement can be mistaken
for a prefix.

### 3.4 What a statement may contain

Arbitrary JavaScript, evaluated as such, `await` and asynchronous code included. There is no
restricted grammar and none is intended.

## 4. Entry points

### 4.1 Static

Two call forms, and a caller may use either.

```javascript
ExpressionResolver.resolve(aExpression, aContext, aDefault, aTimeout, aAllowGlobalWrite)
ExpressionResolver.resolveText(aText, aContext, aDefault, aTimeout, aAllowGlobalWrite)

ExpressionResolver.resolve({ expression, context, defaultValue, timeout, allowGlobalWrite })
ExpressionResolver.resolveText({ text, context, defaultValue, timeout, allowGlobalWrite })
```

Which form is in use is decided by the **first argument alone**: an expression is always a
string, a configuration is always an object. No key of the configuration is inspected to find
that out, so a context object that happens to carry a key named `context` can never be mistaken
for a configuration.

Both forms answer a promise, build a single resolver over the context and delegate to the
instance methods. `aTimeout` / `timeout` is described in 4.5, `aAllowGlobalWrite` /
`allowGlobalWrite` is the switch of 6.5 for this one call; without it the static
`ExpressionResolver.allowGlobalWrite` applies.

Whether a default value was passed is what 4.4 turns on, and the two forms answer it
differently. Positionally it is the third argument being present, so reaching the fifth means
passing the third and fourth — which costs nothing: `undefined` as the default is honoured and
behaves like passing none, and `undefined` as the timeout is no timeout. In the configuration
form it is the presence of the key `defaultValue`, independent of everything else.

The configuration form is the one to document as preferred as soon as more than a context and a
default are involved — `resolve(e, ctx, undefined, undefined, true)` tells a reader nothing about
what `true` means.

*Not yet implemented* — only the positional form exists, and without its fifth argument; see
`BACKLOG.md`.

### 4.2 Instance

```javascript
new ExpressionResolver({ context, parent, name, executer, allowGlobalWrite })
resolver.resolve(aExpression, aDefault)                                    // → Promise<*>
resolver.resolveText(aText, aDefault)                                      // → Promise<string>
```

`context` defaults to the default context of the **executer in use** and `parent` to `null`;
`name` defaults to a generated name (5.1). Leaving `context` out and passing `context: null` are
**not the same thing**: the first takes the executer's default context, which for
`EsprimaExecuter` is the global object, while the second is an empty context, equivalent to `{}`
(6.3). `executer` takes the **registered name** of an executer and
nothing else — every executer is registered before it can be used, so the name is what addresses
it; an unregistered name throws. Without the option the resolver uses
`ExpressionResolver.defaultExecuter`. `allowGlobalWrite` defaults to
`ExpressionResolver.allowGlobalWrite` (6.5).

The instance methods stay **positional** and get no configuration form of their own. Everything a
configuration would carry beyond the default value — the context, the executer, the global-write
switch — is already fixed on the instance and must not be overridable per call.

### 4.3 `resolve` versus `resolveText`

`resolve` evaluates **one** expression and answers its value with its type intact — a number, an
object, a promise's fulfilment value.

`resolveText` takes a text carrying **any number** of expressions and answers the text with each
expression replaced by its value, cast towards string. **Every occurrence is evaluated on its
own**, so an expression with a side effect means what it says: `${counter++}` twice in one text
increments twice.

*Not yet implemented* — today a text is scanned per distinct expression and all identical
occurrences share one evaluation; see `BACKLOG.md`.

`resolve` additionally accepts a **bare statement** without the `${…}` delimiters. The scope
prefix is recognized only in the delimited form: `resolve("${scope::statement}")` addresses the
scope, `resolve("scope::statement")` does not and is passed to the executer as it stands.

*Not yet implemented* — the instance `resolve` strips the delimiters but never parses a scope;
see `BACKLOG.md`.

### 4.4 Default value

A default value replaces a result of `null` **and** of `undefined`. Whether it was passed at all
is what counts, not what it holds: passing `undefined` as the default is a deliberate choice by
the caller and is honoured, and it is indistinguishable in its effect from passing nothing.

In `resolveText` the default applies per expression. Without a default, `undefined` and `null`
are rendered as the literal texts `undefined` and `null`.

### 4.5 Timeout

`aTimeout`, in milliseconds, **delays the start** of the resolution by that amount. It is not a
deadline: nothing is aborted when the resolution takes longer.

### 4.6 Asynchrony

Both entry points answer a promise, always. A statement may `await`, and a value that is a
promise is awaited before it is answered or inserted into a text.

## 5. The chain

### 5.1 Structure

Every resolver carries a `name` and may carry a `parent`. A resolver sees its own context and
the contexts of **all its parents**; it never sees the context of a link below it.

A name is not optional. Where the caller passes none, the resolver **generates** one: the prefix
`ER` followed by a counter, `ER1`, `ER2`, and so on. A generated name obeys the character rule of
3.3 and is therefore addressable like any other, but it is not predictable and is not meant to be
addressed — it exists so that every link can be named in a chain path and so that `name` never
answers `null`.

*Not yet implemented* — an unnamed resolver keeps `name` at `null` today and contributes the
literal `"/null"` to a chain path; see `BACKLOG.md`.

### 5.2 Lookup without a prefix

The lookup starts at the resolver the call was made on and climbs towards the root. **The
nearest link that carries the key answers**, and shadows every link above it.

What decides is whether the key **exists** on a link, not what it holds. A key defined with the
value `undefined` answers the lookup and stops the walk; a key that a link does not carry at all
is passed on to the parent.

Keys inherited through the **prototype chain** of a context object count as carried — a getter
or a method defined on a class is reachable from an expression.

### 5.3 Lookup with a prefix

`${name::statement}` climbs the chain until it reaches the link whose `name` equals the prefix,
and evaluates the statement there — against that link's context and the contexts above it.

*Not yet implemented* — the recursion passes its arguments in the wrong order and never reaches
an ancestor; see `BACKLOG.md`.

### 5.4 A prefix no link carries

The result is `undefined` — the link does not exist, and `undefined` is what JavaScript uses to
say so. A default value, if one was passed, then applies as it does everywhere else.

*Not yet implemented* — today `null` is answered and the default value is skipped; see
`BACKLOG.md`.

### 5.5 Inspecting the chain

```javascript
resolver.chain             // → "/ER1/root/leaf"
resolver.effectiveChain    // → "/root/leaf"
resolver.contextChain      // → [context, …] from this resolver upwards
```

`chain` names **every** link from the root down to this resolver, one path segment per link.

`effectiveChain` names only the links that **provide a context**. Since every link now carries a
name, the context is what tells the links apart: a link that exists only to hold a name and a
parent adds nothing to a lookup, and does not appear here.

`contextChain` answers the contexts of exactly those links, this resolver's first, the root's
last.

A link counts as providing a context when its context **holds at least one value**. Whether a
context object was handed in is irrelevant, and an empty object does not count.

Two consequences follow from that and are part of the rule:

- `effectiveChain` and `contextChain` describe a **state, not a structure**. A link that is empty
  now and receives a value later — through `mergeContext`, `updateData`, or a write from an
  expression — joins both from that moment on. A key added directly to the object the caller
  handed in does **not** count until the cache is rebuilt, by the snapshot rule of 6.2. `chain`
  is the opposite: it is structural and does not change. Neither result should be cached by a
  consumer.
- What counts as a value is what the link's property cache holds, which is the same set of names
  an expression can reach: keys inherited through the **prototype chain** count, and keys the
  cache drops do not — reserved words, and names that are not valid variable names. An object
  holding only `{ class: 1 }` is therefore an empty context here, exactly as `class` is
  unreachable from an expression.

When no link qualifies, `effectiveChain` is the empty string, while `chain` still answers the
full path.

*Not yet implemented* — `effectiveChain` returns exactly what `chain` returns, and
`contextChain` collects every link; see `BACKLOG.md`.

## 6. The context

### 6.1 The proxy

A context is never touched directly. Every access goes through the proxy of
`ResolverContextHandle`, which is what implements the chain walk of 5.2 and what makes a write
land on a defined link rather than on the object the caller handed in.

### 6.2 Names are a snapshot, values are live

The set of keys a link contributes is captured when the resolver is built. Adding a key to the
handed-in object afterwards has no effect until `contextHandle.resetCache()` runs — an accepted
side effect, not a defect.

Values are always read at the moment of the lookup, so mutating what a key holds
(`data.user.name = "x"`, a `push` into an array) is visible immediately.

Writing **through** the resolver — `updateData`, `mergeContext`, or an assignment through the
proxy — keeps the set of keys in step.

### 6.3 A link without a context

A link built with `context: null` is an empty context, equivalent to `{}`. It contributes nothing
to a lookup and is passed through. This is not the same as leaving `context` out, which takes the
executer's default context (4.2).

Such a link gains content like any other: through `updateData`, `mergeContext`, or a write from
an expression evaluated on it (6.5).

### 6.4 Reaching the global object

Whether an expression can reach a global variable or function is **not decided by the resolver**
but follows from how the executer executes the statement. The specification describes the
mechanism; the details belong to the executer (section 8).

- `WithScopedExecuter` and `ContextDeconstructorExecuter` run the statement as ordinary
  JavaScript, so the engine's scoping applies and a name the chain does not carry is resolved
  against the global object. Neither can prevent that. A consumer who wants a name resolved
  locally puts it into the context, so the engine finds it before it walks out.
- `EsprimaExecuter` rewrites identifiers onto one context variable; only the names on its
  `RESERVED_NAMES` list stay untouched. That list is neither final nor complete.

This is what makes a typo in an expression indistinguishable from an empty value, which is
accepted (section 7).

The global object may also be handed in as a context object; it is then an ordinary link of the
chain.

*Not yet implemented* — a resolver built on the global object throws on every lookup; see
`BACKLOG.md`.

### 6.5 Writing from inside an expression

Writing from inside an expression is **not specified behaviour**, and it cannot be: what an
assignment does is decided by the executer, not by this package. `updateData`, `mergeContext` and
`deleteData` (6.6) are the supported way to change a context, and they are the only path with
guaranteed behaviour.

**The one guarantee is negative**: while the switch below is off, an assignment inside an
expression must not create or change anything on the global object.

What happens instead is the executer's business and differs between them. Where the assignment
can be intercepted — the `with`-based executer, whose assignments pass through the context proxy
— it lands in the context of the link the expression is evaluated on. Where it cannot — the
deconstructor executer, whose assignments hit a destructured local binding — it throws and is
reported as an execution error (7). Nothing beyond the negative guarantee is promised, in
particular not that the written value is still readable afterwards.

This is governed by a switch that **allows** writing to the global object. It exists at three levels, each
overriding the one above it:

| Level | How | Applies to |
|---|---|---|
| Application | `ExpressionResolver.allowGlobalWrite` | every resolver built from then on |
| Resolver | constructor option `allowGlobalWrite` | that resolver |
| Call | fifth argument of the static `resolve` / `resolveText` | the resolver that call builds |

A level that is not given falls back to the one above it, and the application level defaults to
`false` — so out of the box no write from an expression reaches the global object. With the
switch on, an assignment behaves as plain JavaScript would and a key no link carries becomes a
global variable.

How an executer keeps the guarantee is up to it. `WithScopedExecuter` can intercept the
assignment through the context proxy; `ContextDeconstructorExecuter` cannot, so there the
protected state means the generated body is produced in strict mode and the assignment throws
rather than reaching the global object.

*Not yet implemented* — the switch does not exist yet; today a write to an unknown key creates a
global variable under both executers. See `BACKLOG.md`.

### 6.6 Reading and writing from outside

```javascript
resolver.getData(key, filter)             // → value, or the context proxy when key is empty
resolver.updateData(key, value, filter)
resolver.deleteData(key, filter)
resolver.mergeContext(context, filter)
```

These four are the supported way to change a context, and unlike an assignment inside an
expression (6.5) their behaviour is guaranteed and identical under every executer.

They act **on the chain**, not on one isolated link, and how far each one reaches is a matter of
convention per method, listed below. The rule of 1.3 — a value introduced further from the root
never overwrites one nearer to it — describes the *expression* path and the stacking mechanism.
It is not a general prohibition on these methods, and further methods that act on the whole chain
are explicitly not ruled out.

`filter` is a scope name and selects **the one link** the call applies to, by the rule of 5.3.
Without a filter that link is the resolver the call was made on. A filter that matches no link in
the chain is an **error and throws** — unlike a scope prefix inside an expression, which answers
`undefined` (5.4): a wrong name in an API call is a mistake in the calling code, while a wrong
name in an expression is data and must never stop a render (7).

`getData` reads along the chain by the rule of 5.2 — the link nearest to the addressed one that
carries the key answers. Without a key it answers the **whole context** of the addressed link:
the proxy, so every access on it still sees the chain. That is intended, not an accident of the
signature.

`updateData` changes the value **where the key lives**, and the filter decides how far the call
looks:

- **Without a filter** the call walks from the resolver it was made on towards the root and
  updates the context of the first link carrying the key. Carries no link it, the key is created
  on the resolver the call was made on.
- **With a filter** the addressed link is the target outright. The value is written there,
  whatever the rest of the chain holds.

This is the deliberate counterpart to 1.3: the chain protects a link's value against being
overwritten by an expression evaluated further from the root, while the data methods are the
explicit path that may reach across links on purpose.

`deleteData` removes a key from **one** link — the addressed one with a filter, and without one
the first link carrying it, counting from the resolver the call was made on towards the root.
Removing it there uncovers the value of the next link that carries the same key, if any: that is
the inverse of shadowing (5.2) and it is intended. There is no chain-wide variant; a caller who
wants one walks the chain and deletes per link.

`mergeContext` assigns the keys of the passed object into the context of the addressed link — a
**shallow** assignment, key by key, replacing what is there and adding what is not. No deep
merge, and no search along the chain: keys that other links carry are untouched, and a merged key
shadows them from this link onwards (5.2).

That makes `mergeContext` the counterpart to `updateData`, and the two cover the whole of writing
from outside: `updateData` changes a value **where it lives**, `mergeContext` defines values
**here**. Defining a single key on one link is `mergeContext({ key: value })` with a one-key
object; there is no separate method for it and none is planned.

*Not yet implemented* — `getData` does not return the value it fetched from a parent, and
`deleteData` calls a method that does not exist; see `BACKLOG.md`.

### 6.7 `buildSecure`

```javascript
ExpressionResolver.buildSecure({ context, propFilter, option,
                                 name, parent, executer, allowGlobalWrite })
```

Builds a resolver over a **filtered copy** of the context, so that properties a consumer does
not want reachable never enter the evaluation. The motivating case is real: the template engine
and this resolver run inside CMS systems where users author expressions.

It filters the **context, not the globals**. `fetch`, `console` and `document` stay reachable
from an expression through the mechanism of 6.4 — under `EsprimaExecuter` `fetch` and `console`
are even explicitly protected. `buildSecure` is a way to hand over a cleaned context; it is not
a sandbox and must not be documented as one.

`buildSecure` forwards the **full constructor option set**, on top of its own `propFilter` and
`option`. `executer` was missing by oversight; `allowGlobalWrite` matters here more than anywhere
else, because the CMS case that motivates this method is exactly the case the switch of 6.5 was
invented for.

*Not yet implemented* — only `context`, `name` and `parent` are passed on today; see
`BACKLOG.md`.

## 7. Errors

An error raised while a statement executes is **caught**. A warning names the statement that
failed, and the call answers `undefined` — where a default value was passed, that default. One
failing expression never stops the rest: a text keeps rendering, a template keeps building.

A statement that takes longer than one second produces a warning naming it. The resolution is
not affected.

## 8. Executers

### 8.1 The interface

```javascript
new Executer({ defaultContext, execution })
executer.defaultContext          // the context a resolver gets when the caller passes none
executer.execute(aStatement, aContext)
```

`ExecuterRegistry` keeps implementations under a name: `registrate(aName, anExecuter)` and
`getExecuter(aName)`, the latter also the module's default export. Importing an executer module
registers it.

`ExpressionResolver.defaultExecuter` reads and writes the default; the setter takes a registered
name or an `Executer` instance.

### 8.2 The implementations

| Name | Module | How it executes |
|---|---|---|
| `with-scoped-executer` | `WithScopedExecuter.js` | a `with` block over the context |
| `context-object-executer` | `ContextObjectExecuter.js` | the context as one object named `ctx` |
| `context-deconstruction-executer` | `ContextDeconstructorExecuter.js` | the context destructured into parameters |
| `esprima-executer` | `EsprimaExecuter.js` | parsed to an AST, identifiers rewritten onto `ctx` |

The executers are **not feature complete**. They are attempts at getting away from `with`, which
is deprecated. The default is moving to `context-deconstruction-executer`; `WithScopedExecuter`
is what every consumer gets today and announces its own deprecation on first use.

`esprima-executer` is registered only when its module is imported explicitly, because `espree`
grows the browser bundle from 11.5 KB to 355.6 KB. It also cannot execute an assignment at all —
`x = 5` is rewritten to `ctx?.x = 5`, which is a syntax error.

*Open* — which executer is the default is decided (the deconstructor), the switch has not been
made; see `BACKLOG.md`.

### 8.3 Behaviour that is the executer's own

An executer chooses how a statement reaches the global object (6.4), and whether a write can be
caught (6.5). Both differ between the implementations, and a consumer who cares has to read the
executer's own description. Everything else in this document holds regardless of the executer in
use.

### 8.4 Tuning

Each executer module exports `setupExecuter(options)`, which configures that executer's compiled
code cache — `{ size }`, where `0` or less disables caching. Reaching it means importing the
module directly, which is the intended usage and the reason the package publishes its sources.

## 9. Public surface

Everything listed here is public and may be used, the purely informative parts included: they
exist so a consumer can build their own debug output.

**`ExpressionResolver`** — static `resolve`, `resolveText`, `buildSecure`, `defaultExecuter`,
`allowGlobalWrite`; constructor `{ context, parent, name, executer, allowGlobalWrite }`;
instance `resolve`, `resolveText`, `getData`, `updateData`, `deleteData`, `mergeContext`; getters `name`, `parent`, `context`, `contextHandle`,
`chain`, `effectiveChain`, `contextChain`.

**`ExecuterRegistry`** — `registrate`, `getExecuter`.

**`Executer`** — the interface an own implementation builds on.

**Each executer module** — `EXECUTERNAME`, `setupExecuter`, its default export, and `setDebug`
where it exists.

`chain`, `effectiveChain` and `contextChain` are specified in 5.5.

## 10. Index of what is not yet implemented

Every rule above that the code does not keep today, in one place:

| Rule | `BACKLOG.md` entry |
|---|---|
| 3.1 matching closing brace | An expression that contains braces is not recognized |
| 4.1 the configuration form of the static calls | The static entry points take no configuration object |
| 4.3 one evaluation per occurrence | An expression that contains braces is not recognized, decision C |
| 4.3 `resolve` and the scope prefix | The instance `resolve()` does not understand the scope syntax at all |
| 5.1 a generated name where none was passed | `effectiveChain` is a copy of `chain`, and a resolver without a name |
| 5.3 climbing to a named link | `${scope::expression}` never reaches an ancestor |
| 5.4 `undefined` for an unknown scope | same entry |
| 5.5 `effectiveChain` and `contextChain` skip links without a context | `effectiveChain` is a copy of `chain`, and a resolver without a name |
| 6.4 the global object as a context | A resolver built on the global object throws on every lookup |
| 6.5 no write reaches the global object | A write to an unknown name inside an expression lands on `globalThis` |
| 6.6 `getData`, `deleteData` with a filter | `getData` and `deleteData` are broken on the filter path |
| 6.6 the rules of the four data methods along the chain | The data methods have no rules along the chain |
| 6.7 `buildSecure` forwards every constructor option | `buildSecure` drops the options a secure context needs most |
| 8.2 the default executer | The default executer announces itself as deprecated |
