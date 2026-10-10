# Specification — `@default-js/defaultjs-expression-language`

**For version 3.**

This document says what the package does. `README.md` carries the part of it a consumer needs to get
started.

It has two parts. **Part A** is the resolver: what it does, what its API promises, and what holds no
matter which executer runs a statement. **Part B** is the executers: the interface they implement and
the ones the package ships. Beyond that interface nothing in this document is demanded of an
executer. Each one is a solution of its own, and what it can run is documented with it in
`README.md`; everything in part A holds for all of them.

---

# Part A — The resolver

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
| **Resolver** | One `ExpressionResolver` instance: a name, optionally a context, and optionally a parent. |
| **Chain** | A resolver and its parents. |
| **Root** | The resolver that has no parent. A resolver without a parent is its own root. |
| **Context** | The data an expression is evaluated against: the object handed to a resolver, at most one per resolver (6.3). |
| **Executer** | The strategy that turns a statement into a value. Pluggable. |

**Direction.** The chain is drawn as a tree in the usual way of computer science: the **root at
the top**, its children below it, a leaf furthest down. So *up*, *above* and *nearer the root*
all point from a resolver towards its parents, while *down*, *below* and *deeper* point away from
the root. A lookup climbs; a template descends as it builds and unwinds as it finishes.

## 3. Expression syntax

### 3.1 Delimiters

**This is the rule of a text.** `resolveText` finds the expressions of a text by it. `resolve` takes
one expression, so its input ends where the input ends, and only its two ends decide whether it is
the delimited form (4.3).

An expression begins with `${` and ends at the **matching** closing brace. Braces inside the
statement — an object literal, an arrow function body, a nested template literal — are part of
the statement and must be counted, not terminated on.

Three rules bound that counting.

**A brace inside a literal or a comment does not count.** `${ "}" }` is one expression whose
statement is `"}"`, and the expression ends at the brace that follows it. The same holds for `'`,
for a template literal, for a regular expression literal, for a block comment `/* … */` and for a
line comment `//`, and it holds in both directions: neither an opening nor a closing brace inside
one of them changes the count. A line comment ends where JavaScript ends it, at a line terminator,
and not at a brace — so `${ a // note }` written on one line never closes and is not an expression.
Comments stay in the statement; what an executer does with them is its own (9.2).

The rule has one limit. Whether a `/` opens a regular expression literal or divides is decided by
the character before it, comments skipped, so a literal that follows `)` or `]` —
`${ (() => { if (a) /x/.test(b) })() }` is the shape — is read as division. That matters only where
the literal also carries a brace.

**An opening `${` without a matching closing brace is not an expression.** The text stands as
written, unchanged, and nothing is evaluated. There is no error and no partial replacement.

**A `${` met outside a literal or a comment while a statement is still open starts a new
expression.** The open one is abandoned and the text it covered stands as written. So
`"a ${ x b ${value}"` answers `"a ${ x b "` with the second expression resolved behind it.
Everything between the delimiters is meant to be JavaScript, and a second opening delimiter cannot
be part of it.

### 3.2 Escaping

**This is a rule of `resolveText`.** It exists so that an expression can stand in surrounding
text without being evaluated. `resolve` has no surrounding text — its input is one expression —
so a backslash there belongs to the statement and is handed to the executer with it (4.3).

The backslashes directly before the `$` are counted. An **odd** number escapes the delimiter: it
opens nothing, and exactly **one** backslash is consumed. An **even** number does not escape: the
expression is evaluated and no backslash is consumed. So `\${value}` answers `${value}`,
`\\${value}` answers two backslashes followed by the value, and `\\\${value}` answers
`\\${value}`. No backslash is ever removed except the one that does the escaping — this is not a
general unescaping of the text.

**What carries the escape is the delimiter, not a region.** An escaped `${` opens nothing, so the
text behind it is scanned like any other — a delimiter that would have stood inside its statement
is an expression of its own and resolves. `Test \${"${test}"} Test` therefore answers
`Test ${"resolved"} Test`, not the text unchanged: the outer delimiter is escaped and stands, the
inner one is not and is evaluated.

This holds per occurrence: an escaped one stands even where the same expression appears unescaped
elsewhere in the text, and the other way round.

### 3.3 Scope prefix

`${name::statement}` evaluates the statement on the resolver of the chain that carries the name
`name`. The prefix is optional; without it the resolver the call was made on applies.

The name is a label, not a JavaScript identifier. Allowed are **the ASCII letters `a`–`z` and
`A`–`Z`, digits, whitespace, `-` and `_`** — nothing else. The name is trimmed at both ends, so
leading and trailing whitespace is not part of it. The character set is narrow enough that scope and
statement can always be separated, and that a quoted `::` inside a statement cannot be read as a
prefix.

A name that is **empty after trimming is no name**, and the prefix it stands in is no prefix: the
separator goes with it. `${::value}` and `${ ::value}` both carry the statement `value`, evaluated on
the resolver the call was made on.

### 3.4 The empty statement

An **empty statement** answers `undefined`, the same as `return;` does in JavaScript. `${}` is a
valid expression, a default value applies to it like to any other result, and it never reaches an
executer: the resolver answers it.

Otherwise a statement is arbitrary JavaScript, `await` and asynchronous code included. There is no
restricted grammar. How much of it a given executer runs is that executer's own (9.2).

## 4. Entry points

### 4.1 Static

Two call forms, and a caller may use either.

```javascript
ExpressionResolver.resolve(aExpression, aContext, aDefault, aTimeout)
ExpressionResolver.resolveText(aText, aContext, aDefault, aTimeout)

ExpressionResolver.resolve({ expression, context, defaultValue, timeout })
ExpressionResolver.resolveText({ text, context, defaultValue, timeout })
```

Which form is in use is decided by the **first argument alone**: an expression is always a
string, a configuration is always an object. No key of the configuration is inspected to find
that out, so a context object that happens to carry a key named `context` can never be mistaken
for a configuration. `null` is not an object in this sense. A first argument that is neither a
string nor an object is **rejected with a `TypeError`** saying so; it is a mistake in the calling
code and is not treated as a failed statement, so no default value applies to it (7).

A configuration carries the whole call, so every argument **behind** it is **ignored** — neither a
context nor a default nor a timeout is taken from there, and none of them makes the call fail.

A configuration carries a **string** under `expression` or `text`. Anything else there — the key
missing, `null`, a number, an object — is **rejected with a `TypeError`** that names the key, for
the same reason and with the same consequence as a first argument of neither form: no default value
applies to it. An object under the key is not read as a configuration of its own. The other keys are
not checked: `context` and `timeout` mean in a configuration what their positional counterparts mean.

Both forms answer a promise, build a single resolver over the context and delegate to the
instance methods. `aTimeout` / `timeout` is described in 4.5.

Whether a default value was passed is what 4.4 turns on, and the two forms answer it
differently. Positionally it is the third argument being present, so reaching the fifth means
passing the third and fourth — which costs nothing: `undefined` as the default is honoured and
behaves like passing none, and `undefined` as the timeout is no timeout. In the configuration
form it is the presence of the key `defaultValue`, independent of everything else.

The configuration form is the preferred one as soon as more than a context and a default are
involved: `resolve(e, ctx, undefined, 500)` does not say what `500` means.

### 4.2 Instance

```javascript
new ExpressionResolver({ context, parent, name, executer })
resolver.resolve(aExpression, aDefault)                                    // → Promise<*>
resolver.resolveText(aText, aDefault)                                      // → Promise<string>
```

`parent` defaults to `null` and `name` to a generated name (5.1). Leaving `context` out,
`context: null` and `context: undefined` are **the same thing**: the resolver has no context of its
own (6.3), whichever executer it runs.

The constructor **rejects with a `TypeError`**, naming the option, what is a mistake in the calling
code rather than data:

- a `parent` other than `null`, `undefined` or an `ExpressionResolver` — a resolver from another
  copy of the package included, since the chain reaches into its private state;
- a `context` that is a primitive — a string, a number, a boolean, a symbol or a bigint, `0`, `""`
  and `false` included. Any object is a context (6.1), and `null` or `undefined` is none;
- a `name` that breaks the rule of 5.1;
- an `executer` that is neither a string nor an `Executer` instance — an executer from another copy
  of the package included, as for `parent`.

The static entry points build their resolver through the constructor, so a context of the wrong type
rejects their call as well.

`executer` takes the **registered name** of an executer or an **`Executer` instance**. A name is
looked up in the registry and an unregistered one throws; an instance is taken as it is and needs no
registration, because it already addresses the executer. `null` and `undefined` count as the option
left out.

Without the option the resolver takes the executer of its **parent**, and only a resolver without
a parent falls back to `ExpressionResolver.defaultExecuter`, whose setter accepts either form as
well and rejects anything else with a `TypeError`. The choice is made once, in the constructor, and
the parent's executer is whatever that parent holds, however it got it — so one executer named at
the root of a chain applies to every resolver built under it that does not name its own. The getter
`executer` answers the one in use.

The instance methods stay **positional** and get no configuration form of their own. Everything a
configuration would carry beyond the default value — the context and the executer — is already
fixed on the instance and must not be overridable per call.

`resolve` takes an expression and `resolveText` a text, each a **string**; anything else is
**rejected with a `TypeError`**, as in 4.1. No statement ran, so no warning names one (7), and no
default value applies.

### 4.3 `resolve` versus `resolveText`

`resolve` evaluates **one** expression and answers its value with its type intact — a number, an
object, a promise's fulfilment value.

`resolveText` takes a text carrying **any number** of expressions and answers the text with each
expression replaced by its value, cast towards string. **Every occurrence is evaluated on its
own**, so an expression with a side effect means what it says: `${counter++}` twice in one text
increments twice.

`resolve` additionally accepts a **bare statement** without the `${…}` delimiters. Which of the two
forms is in hand is decided by the two ends of the trimmed input alone: an input that starts with
`${` **and** ends with `}` is the delimited form; anything else — one that starts with `${` and does
not end with `}` included — is a statement in full and is passed to the executer as it stands. The
rule is `resolve`'s alone: in a text, an expression is always delimited (3.1).

The scope prefix is recognized only in the delimited form: `resolve("${scope::statement}")`
addresses the scope, `resolve("scope::statement")` does not. Both entry points parse the prefix by
the same rule (3.3).

`resolve` checks nothing about the form beyond its two ends — whether the statement is valid
JavaScript is the executer's business, and whatever it raises is a failing statement (7).

The escaping of 3.2 does **not** apply to `resolve`. A leading backslash is part of the statement,
so `resolve("\\${value}")` hands `\${value}` to the executer, which cannot compile it.

### 4.4 Default value

A default value replaces a result of `null` **and** of `undefined`. It never covers an **error**,
in neither entry point: whatever default was passed, `resolve` raises and `resolveText` leaves the
expression standing (7). Whether it was passed at all is what counts, not what it holds: passing
`undefined` as the default is honoured, and its effect cannot be told from passing nothing.

In `resolveText` the default applies per expression. Without a default, `undefined` and `null`
are rendered as the literal texts `undefined` and `null`.

### 4.5 Timeout

`aTimeout`, in milliseconds, **delays the start** of the resolution by that amount. It is not a
deadline: nothing is aborted when the resolution takes longer.

Only a positive number delays. Zero, a negative number and a value that is no number at all —
`"500"` included — mean no delay. Such a timeout is **not rejected**, unlike an argument of the wrong
type anywhere else (7).

### 4.6 Asynchrony

Both entry points answer a promise, always. A statement may `await`, and a value that is a
promise is awaited before it is answered or inserted into a text.

## 5. The chain

### 5.1 Structure

Every resolver carries a `name` and may carry a `parent`. A resolver sees its own context and
the contexts of **all its parents**; it never sees the context of a resolver below it.

A name the caller passes obeys the **same rule as a scope prefix** (3.3): a string of the characters
3.3 allows, **trimmed** at both ends before it is kept, so `" root "` is the resolver `root`. A name
that carries any other character, that is empty or whitespace only, or that is no string at all is
rejected (4.2). So every name can be addressed by a prefix, and a chain path (5.5) can always be
split back into its names.

A name is not optional. Where the caller passes none — `null`, `undefined`, or the option left
out — the resolver **generates** one. The only
requirement on a generated name is that it is **unique** and obeys the character rule of 3.3; its
shape is not part of this specification, and a consumer must not depend on it. `ER` plus a
counter — `ER1`, `ER2` — is what the implementation uses. A generated name is addressable like
any other, but it is not meant to be addressed: it exists so that every resolver can be named in a
chain path and so that `name` never answers `null`.

### 5.2 Lookup without a prefix

The lookup starts at the resolver the call was made on and climbs towards the root. **The
nearest resolver that carries the key answers**, and shadows every resolver above it.

What decides is whether the key **exists** on a resolver, not what it holds. A key defined with the
value `undefined` answers the lookup and stops the walk; a key that a resolver does not carry at all
is passed on to the parent.

Which keys a resolver carries is **what JavaScript says it carries**, and nothing is filtered out of
that: a key inherited through the **prototype chain** counts, so a getter or a method defined on a
class is reachable from an expression; so do a key that could not stand for a variable
(`test-test`), one named like a reserved word (`class`), an index, and a symbol.

There is **one exception**, and it comes from removing a key (6.6). Where a resolver's object only
inherits the key, the removal cannot take it off the object, and the resolver stops carrying the name
all the same: a lookup passes it on to the parent until the names are rebuilt (6.2) or the key is
written again.

Two consequences are worth naming, because both follow from the language rather than from a choice
made here. A context object inherits from `Object.prototype` unless it was built without a
prototype, so a resolver over a plain object **carries `toString`, `valueOf`, `hasOwnProperty` and
their kind**, and shadows a resolver above it that holds one of those names as data. And a key an
executer cannot express stays unreachable *from a statement* under that executer while `getData`
reads it — how a statement addresses a name is the executer's own (9.2).

### 5.3 Lookup with a prefix

`${name::statement}` climbs the chain until it reaches the resolver whose `name` equals the prefix,
and evaluates the statement there — against that resolver's context and the contexts above it, and
with **that resolver's executer** (4.2), not the one of the resolver the call was made on. In a chain
that mixes executers, every expression is written for the resolver it addresses, so one text may
carry two spellings side by side (9.2).

Where more than one resolver carries the name, the **first one found while climbing** answers, and
the ones above it are shadowed — the same rule as 5.2, and for the same reason: a chain is built
by descending, so the nearest resolver is the one the caller most recently introduced.

### 5.4 A prefix no resolver carries

The result is `undefined` — the resolver does not exist, and `undefined` is what JavaScript uses to
say so. A default value, if one was passed, then applies as it does everywhere else.

### 5.5 Inspecting the chain

```javascript
resolver.chain             // → "/ER1/root/leaf"
resolver.effectiveChain    // → "/root/leaf"
resolver.contextChain      // → [context, …] from this resolver upwards
```

`chain` names **every** resolver from the root down to this one, one path segment each.

`effectiveChain` names only the resolvers that **provide a context**: a resolver that exists only to
hold a name and a parent adds nothing to a lookup, and does not appear here.

`contextChain` answers the contexts of exactly those resolvers, this resolver's first, the root's
last. Each is a context as 6.1 describes it, answering for the chain above its resolver, not the
object handed to that resolver alone: enumerating the first one lists every name the chain carries.

A resolver counts as providing a context when the caller **handed one to the constructor** — any
value that is neither `null` nor `undefined` — **or** when a value has been set on it since,
through `mergeContext`, `updateData`, or a write from an expression. What the context holds is
irrelevant: an empty object counts, and so does an object holding only names an expression cannot
reach.

A resolver therefore provides no context only in one case: it was built without one —
`context: null`, `context: undefined`, or the option left out — and nothing has been written to it
since. So `context: {}` provides a context and `context: null` does not; a lookup tells the two apart
as well, since `{}` carries what every object inherits (6.3).

One consequence follows from that and is part of the rule: `effectiveChain` and `contextChain`
describe a **state, not a structure**. A resolver built without a context joins both the moment a
value is set on it. `chain` is the opposite: it is structural and does not change. Neither result
should be cached by a consumer.

When no resolver qualifies, `effectiveChain` is the empty string, while `chain` still answers the
full path.

## 6. The context

### 6.1 What a context answers

`getData()` without a key answers the context of the addressed resolver. That context is **not the
object passed to the constructor** and it **answers for the whole chain**: reading a name on it
follows 5.2, so it sees what the resolvers above carry.

Enumerating it describes the chain rather than one resolver. `Object.keys`, a spread and
`JSON.stringify` answer every name the chain carries — those that are no variable names among them —
each with the enumerability it has where it is defined, so the members of a prototype stay out of
`Object.keys` as they would on the object itself. `Object.getOwnPropertyNames` is the wider list and
names them, and `Object.getOwnPropertySymbols` answers the symbol keys.

Three further rules hold for any context:

- **Values are read at the moment of the lookup** (6.2), never collected up front.
- **A write lands on the resolver it was made on**, never on one nearer the root (section 1). Where
  that resolver was built over a frozen object, the write fails as it would on the object itself.
- **Any object works as a context**, a frozen or sealed one included, and so do an array, a `Map`, a
  `Set`, a `NodeList` and a DOM element. Which of them a given executer can run a statement over is
  that executer's own (9.2). A primitive is no context and is rejected (4.2).

A context that **is** the global object is the exception to all of this; see 6.4.

### 6.2 Names are a snapshot, values are live

The set of keys a resolver contributes is captured when the resolver is built. Adding a key to the
handed-in object afterwards has no effect until the set is rebuilt: `contextHandle.resetCache()`
rebuilds it, and so does `mergeContext`, which takes up every key the object carries by then along
with the ones it merges.

Values are always read at the moment of the lookup, so mutating what a key holds
(`data.user.name = "x"`, a `push` into an array) is visible immediately.

Writing **through** the resolver — `updateData`, `mergeContext`, or an assignment an executer let
through (6.5) — keeps the set of keys in step. Removing a key the object only inherits is the
exception of 5.2.

### 6.3 A resolver without a context

A resolver built without a context — `context: null`, `context: undefined`, or the option left
out (4.2) — holds **no object at all**. It therefore carries no name, not even one every object
inherits, contributes nothing to a lookup and is passed through. That is the difference to a
resolver built over `{}`, which carries what that object inherits (5.2) and shadows those names.

Such a resolver gains content like any other: through `updateData`, `mergeContext`, or a write from
an expression evaluated on it (6.5).

### 6.4 The global object as a context

Whether an expression can reach a global variable or function is decided by how the executer runs
the statement, and is that executer's own (9.2). The resolver only states the consequence: a name
the chain does not carry may resolve against the global object, which is what makes a typo in an
expression indistinguishable from an empty value — accepted, see section 7. A consumer who wants a
name resolved locally puts it into the context, so it is found before the lookup walks out.

The global object may also be handed in **as a context object**; it is then an ordinary resolver of
the chain. Four things follow from what such a resolver is, and all four are intended:

- It carries **every** name, so it answers every lookup that reaches it and no resolver nearer the
  root is ever consulted. A resolver over the global object therefore belongs at the root of a
  chain, not in the middle of one.
- It contributes **no name to an enumeration** below it. A lookup still finds everything it holds,
  from any resolver of the chain, but `Object.keys` of a context below it does not list the globals:
  a statement reaches a global through the ordinary scope chain, so listing them would only
  hand names like the index of a frame to an executer that has to turn every name into code.
- It is **not wrapped**. Every other context is answered for through something that flattens the
  chain and catches writes; in front of an object that already carries every name that has nothing to
  add, and it would break every operation that enumerates the context. `getData()` on such a resolver
  therefore answers the global object itself, and a write through it is an ordinary global write —
  the one case 6.5 cannot reach.
- An executer may treat it as its own case, and one does: `ContextDeconstructorExecuter` reads the
  names of a context before it runs a statement and skips that for the global object, because the
  statement reaches a global through the ordinary scope chain anyway.

### 6.5 Where a write from an expression lands

Writing from inside an expression is **not specified behaviour**: what an assignment does is decided
by the executer. `updateData`, `mergeContext` and `deleteData` (6.6) are the supported way to change
a context and the only path with guaranteed behaviour.

Where a write goes once an executer lets it through is a rule:

- It lands in the context of the resolver the expression is evaluated on, **never in an ancestor's**
  (section 1). A name an ancestor carries is shadowed from that resolver downwards, not changed where it
  lives.
- Where that resolver was built over a frozen object, the write fails as it would on the object
  itself.
- It lands in **the object the caller handed over** (6.6).

Everything else about such a write is the executer's own (9.2): whether an assignment runs at all,
whether it is intercepted, whether the value is readable afterwards, and whether one to a name no
resolver carries stays off the global object.

**Reaching the global object is not sandboxed.** A statement that names `globalThis` gets it, and an
unqualified assignment to a name no resolver carries creates a global under an executer that cannot
intercept it. `buildFiltered` (6.7) filters the context, not the globals.

### 6.6 Reading and writing from outside

```javascript
resolver.getData(key, filter)             // → value, or the whole context without a key
resolver.updateData(key, value, filter)
resolver.deleteData(key, filter)
resolver.mergeContext(context, filter)
```

These four are the supported way to change a context, and unlike an assignment inside an
expression (6.5) their behaviour is guaranteed and identical under every executer.

**The three that write, write into the object the caller handed over.** A resolver keeps that object
rather than a copy, so `updateData`, `deleteData` and `mergeContext` add, replace and remove keys on
it, and code outside the resolver holding the same reference sees the change. A caller who does not
want that hands over a copy. A change the object refuses — any change to a frozen one, a new key or a
deletion on a sealed one — **raises the error the object raises**, as a write from an expression
does (6.1). `mergeContext` assigns key by key, so the keys before the refused one are already
written when it raises.

**A key** is what JavaScript takes as a property key: a string, `""` included, a symbol, or a number,
so `0` addresses the first element of an array. Without a key — `null` or `undefined` — `getData`
answers the whole context (below), while `updateData` and `deleteData` have nothing to write and
reject with a `TypeError`. A key of any other type is rejected with a `TypeError` by all three.

They act **on the chain**, not on one isolated resolver, and how far each one reaches is per method,
listed below. The rule of section 1 — a value introduced further from the root never overwrites one
nearer to it — describes the *expression* path; it is not a prohibition on these methods.

`filter` is a scope name and selects **the one resolver** the call applies to, by the rule of 5.3.
It is read like a scope prefix (3.3): trimmed, and empty or whitespace only it is no filter. Without
a filter — that, `null` or `undefined` — it is the resolver the call was made on. A filter that is
no string is rejected with a `TypeError`. A filter that matches no resolver in
the chain is an **error and throws** — unlike a scope prefix inside an expression, which answers
`undefined` (5.4): a wrong name in an API call is a mistake in the calling code, while a wrong
name in an expression is data and must never stop a render (7).

`getData` reads along the chain by the rule of 5.2 — the resolver nearest to the addressed one that
carries the key answers. Without a key it answers the **whole context** of the addressed resolver,
so every access on it still sees the chain (6.1). That is intended, not an accident of the
signature.

`updateData` changes the value **where the key lives**, and the filter decides how far the call
looks:

- **Without a filter** the call walks from the resolver it was made on towards the root and updates
  the context of the first resolver carrying the key. Where none carries it, the key is created on
  the resolver the call was made on.
- **With a filter** the addressed resolver is the target outright. The value is written there,
  whatever the rest of the chain holds.

This is the counterpart to section 1: the chain protects a resolver's value against an expression
evaluated further from the root, while the data methods are the path that may reach across
resolvers.

`deleteData` removes a key from **one** resolver — the addressed one with a filter, and without one
the first resolver carrying it, counting from the resolver the call was made on towards the root.
Removing it there uncovers the value of the next resolver that carries the same key, if any: that is
the inverse of shadowing (5.2) and it is intended. There is no chain-wide variant; a caller who
wants one walks the chain and deletes per resolver. Where that resolver's object only inherits the
key, nothing is taken off the object, and the resolver stops carrying the name all the same — the
exception of 5.2.

`mergeContext` assigns the keys of the passed object into the context of the addressed resolver — a
**shallow** assignment, key by key, replacing what is there and adding what is not. No deep merge,
and no search along the chain: keys that other resolvers carry are untouched, and a merged key
shadows them from this resolver onwards (5.2). `null` or `undefined` has nothing to merge and changes
nothing; a primitive is rejected with a `TypeError`, as a context is (4.2).

That makes `mergeContext` the counterpart to `updateData`, and the two cover the whole of writing
from outside: `updateData` changes a value **where it lives**, `mergeContext` defines values
**here**. Defining a single key on one resolver is `mergeContext({ key: value })` with a one-key
object; there is no separate method for it and none is planned.

### 6.7 `buildFiltered`

```javascript
ExpressionResolver.buildFiltered({ context, propFilter,
                                   option : { deep, name, parent, executer } })
```

Builds a resolver over a **filtered copy** of the context, so that properties a consumer does
not want reachable never enter the evaluation. The motivating case is real: the template engine
and this resolver run inside CMS systems where users author expressions.

It filters the **context, not the globals**. `fetch`, `console` and `document` stay reachable from an
expression through the mechanism of 6.4, as far as the executer in use reaches them (9.2).
`buildFiltered` is a way to hand over a cleaned context; it is not a sandbox and must not be
documented as one.

`propFilter(name, value, holder)` is called for every enumerable property of the context, inherited
ones included, with the object the property is read from as `holder`; a property it answers `false`
for is left out of the copy. The context itself stays untouched.

`option` carries the filter's own `deep`, which filters nested objects as well and is `true` where
it is left out, together with the constructor options `name`, `parent` and `executer`, which
`buildFiltered` hands on unchanged. The context is the one passed beside `option`; an
`option.context` is not read.

`buildSecure` is its former name, deprecated: it takes the same arguments and answers the same
resolver.

## 7. Errors

An error raised while a statement executes reaches the two entry points differently, and that
difference is the whole of this section. What they share: **a default value never covers an
error.** It answers a missing result (4.4), never a statement that failed.

**`resolveText` catches, and leaves the expression standing.** A warning names the statement that
failed, the expression stays in the text exactly as it was written — delimiters, scope prefix and
statement — and the rest of the text keeps rendering. One failing expression never stops a template
from building, and what stands in its place is the expression itself, which is what an author needs
in order to find it.

**`resolve` logs the error and hands it on.** The statement and the error are written to the
console, and the error is then raised to the caller. A caller who wants a fallback for a broken
expression writes the `try`/`catch` and can see what went wrong.

The two differ because their callers do. A text is a document that has to render whatever else is
in it, and a single broken expression in it is a defect in that expression, not in the page.
`resolve` is called from code, for one value, and answering `undefined` there hides a mistake at
the place where it can still be found.

A **form that an entry point rejects itself** follows the same line: an argument of the wrong type
is rejected with a `TypeError` by the static entry points (4.1), the constructor, the setter of the
default executer and the instance entry points (4.2), and the data methods (6.6). The one argument
of the wrong type that is not rejected is the timeout, which then means no delay (4.5). `resolve`
rejects no form of a string — what is not the delimited form is a bare statement (4.3) — and in a
text anything that is not an expression is text and no error arises at all (3.1).

**Rejected**, throughout this document, means the caller receives the error in the way the call
answers: a synchronous call — the constructor, a setter, the data methods, `setupExecuter` — throws
it, and an entry point, which always answers a promise (4.6), answers a rejected one.

## 8. Public surface

Everything listed here is public and may be used, the purely informative parts included: they
exist so a consumer can build their own debug output.

**`ExpressionResolver`** — static `resolve`, `resolveText`, `buildFiltered`, `defaultExecuter`, and
`buildSecure`, deprecated (6.7);
constructor `{ context, parent, name, executer }`;
instance `resolve`, `resolveText`, `getData`, `updateData`, `deleteData`, `mergeContext`; getters
`name`, `parent`, `context`, `contextHandle`, `executer`, `chain`, `effectiveChain`, `contextChain`.

**`ExecuterRegistry`** — `register`, `getExecuter`.

**`Executer`** — the interface an own implementation builds on.

**Each executer module** — `EXECUTERNAME`, `setupExecuter`, its default export, and `setDebug` and
`getContextVar` where they exist.

`chain`, `effectiveChain` and `contextChain` are specified in 5.5.

**What a consumer imports.** The package is reached by its name, and only these paths are open:

| Path | What it is |
| --- | --- |
| the package itself | `index.js` — `ExpressionResolver` and `ExecuterRegistry`, every executer registered |
| `/browser.js` | the same, and sets `defaultjs.el` on the global object |
| `/src/Executer.js` | `Executer`, as its default export |
| `/src/executer/<module>.js` | an executer module, the way to tune that executer |
| `/dist/<file>` | the bundles: `browser-…[.min].js` a classic script, `module-…[.min].js` an ES module exporting what `index.js` exports |
| `/package.json` | the manifest |

Every other path is closed, `index.js` written out included.

# Part B — The executers

## 9. Executers

### 9.1 The interface

```javascript
new Executer({ execution })
executer.execute(aStatement, aContext)
```

An executer runs statements and holds no context of its own: the context always comes from the
resolver, and a context shared by many resolvers is the context of a resolver at the root of their
chain (5.1).

`ExecuterRegistry` keeps implementations under a name: `register(aName, anExecuter)` and
`getExecuter(aName)`, the latter also the module's default export. Importing an executer module
registers it.

`ExpressionResolver.defaultExecuter` reads and writes the default; the setter takes a registered
name or an `Executer` instance and rejects anything else (4.2).

### 9.2 The implementations

| Name | Module | How it executes |
|---|---|---|
| `with-scoped-executer` | `WithScopedExecuter.js` | a `with` block over the context |
| `context-object-executer` | `ContextObjectExecuter.js` | the context as one object named `ctx` |
| `context-deconstruction-executer` | `ContextDeconstructorExecuter.js` | the context destructured into parameters |

The default is `context-deconstruction-executer`. `with-scoped-executer` is deprecated, because
`with` is; it is still registered and reachable by name, and announces its deprecation on the first
expression it resolves.

Each implementation is a solution of its own. Which JavaScript a statement may contain, how it
addresses a context value, which shapes of context it runs over, what an assignment inside it
leaves behind and which globals it reaches are the executer's own, and `README.md` documents them for
each one. An executer may demand its own spelling: `context-object-executer` hands the context over
as the object `ctx`, a name 9.3 lets a consumer change, so a property is addressed as
`${ctx.value}` where the other two read `${value}`, and switching executer can mean rewriting
expressions. What an executer may not change is which resolver of the chain answers a lookup, or
any other rule of part A.

### 9.3 Tuning

Each executer module exports `setupExecuter(options)`, which configures that executer's compiled
code cache — `{ size }`, where `0` or less disables caching. Reaching it means importing the
module directly, which is the intended usage and the reason the package publishes its sources.

Every cache starts with a size of **5000**. An option left out changes nothing, so `setupExecuter()`
and `setupExecuter({})` leave the size where it is. A `size` that is not a finite number is rejected
with a `TypeError`; a fraction is rounded down.

`context-object-executer` takes a second option, `contextVar`: the name a statement addresses the
context by, `ctx` until it is set, and `getContextVar()` answers it. The name is the executer's, not
a chain's, so it holds for every statement that executer runs from then on, whichever resolver hands
it over. A name is taken trimmed. `null`, `undefined` and a string that is empty after trimming leave
the name as it is, and another value that is not a string is rejected with a `TypeError`. A name
that cannot be a parameter name is not rejected: every statement then fails with a `SyntaxError`
(7).
