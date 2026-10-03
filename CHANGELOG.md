# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Only what reaches a consumer of the package belongs here: the public api, the published
files, runtime dependencies, the supported environment. Build and test work stays out.
`DECISIONS.md` carries the reasoning, this file carries the effect.

Versions up to 2.0.4 predate this file — the git history is the record for those.

## [Unreleased]

### Added

- **The static entry points take a configuration object.**
  `ExpressionResolver.resolve({ expression, context, defaultValue, timeout })` and
  `ExpressionResolver.resolveText({ text, context, defaultValue, timeout })` sit beside the
  positional form, which stays as it is. The first argument alone decides the form — a string or
  an object — so a context carrying a key named `context` is never mistaken for a configuration.
  Any argument behind a configuration is ignored. A configuration without a string under
  `expression` or `text` is rejected with a `TypeError` naming the key. A default counts as passed
  where the key `defaultValue` is present.

- **The constructor takes an `Executer` instance, not only a registered name.**
  `new ExpressionResolver({ executer })` accepted a registered name and silently fell back to the
  default for anything else — an instance included, although the static setter
  `ExpressionResolver.defaultExecuter` has always accepted both. The two ends of the same concept
  now follow the same rule. Nothing that worked before changes: a name is still looked up in the
  registry and an unregistered one still throws. What is new is that an executer can be used
  **without registering it**, which is what a caller wants for one that is built for a single
  resolver.

- **`README.md` documents every executer.** How each one runs a statement; how a statement
  addresses a context value under it — `${ctx.value}` under `context-object-executer`, the bare
  name under the other two, so switching executer can mean rewriting expressions; which JavaScript
  it runs, which shapes of context it runs over, what an assignment inside a statement leaves behind
  and which globals it reaches; and how to pick one for a chain and tune its code cache.

- **`README.md` documents the whole public surface**: installing and importing, the paths that can
  be imported, the browser script and the module bundle, the expression syntax and its escaping,
  both call forms of the static entry points, default value and timeout, resolver chains with their
  lookup, scope prefixes, names and inspecting getters, the four data methods and their filter,
  error handling, the reach to globals, `buildFiltered`, and writing a custom executer with
  `Executer` and `ExecuterRegistry`. A reference lists every public member by component, with what
  it takes, answers and throws. A section *Security* says
  that an expression runs with the page's rights, that no filter makes an untrusted one safe, and
  that a Content Security Policy has to allow `'unsafe-eval'`; a section *Upgrading from 2.x* lists
  the changes most likely to break a 2.x caller.

- **Every public member carries JSDoc** that says what it takes, answers and throws. One statement
  was wrong before: the constructor said a
  resolver without the `executer` option takes `ExpressionResolver.defaultExecuter`, while it takes
  the executer of its parent and only a resolver without a parent takes the default. The code
  always did the latter.

### Changed

- **The package is an ES module package with an `exports` field, and a deep import outside it
  breaks.** `package.json` carries `"type": "module"` and an `exports` field. It opens the package
  itself (`index.js`), `browser.js`, `src/Executer.js`, every module under `src/executer/`, every
  file under `dist/`, and `package.json`. Every other path is rejected with
  `ERR_PACKAGE_PATH_NOT_EXPORTED` by Node and by every bundler that honours `exports`, among them
  `src/ExpressionResolver.js`, `src/CodeCache.js` and `index.js` written out. Import from the
  package name instead. Tuning an executer still goes through its module under `src/executer/`.

- **The expression scanner is a module of its own, `src/ExpressionScanner.js`.** It finds the
  expressions of a text and takes the single expression of `resolve` apart; it moved out of
  `src/ExpressionResolver.js` unchanged. It is internal — `index.js` does not export it and nothing
  promises its shape — but it is published under `src/` like every other file.

- **A context carries every key JavaScript says it carries.** Names that are not variable names
  (`test-test`, `0`), reserved words (`class`, `undefined`, `constructor`) and symbol keys used to be
  dropped when a resolver was built, with a warning `Variable name is illegal …` for the first kind.
  They are now reachable through `getData`, through the context and, where the executer can express
  them, from an expression — `ctx["test-test"]` under `context-object-executer`. `Object.keys`, a
  spread and `JSON.stringify` of a context include them. The warning is gone. Under
  `with-scoped-executer` a context key named like `undefined` now shadows it inside an expression.
  See `DECISIONS.md`, 2026-09-22.

- **`context-deconstruction-executer`, the default, no longer runs over a context whose names it
  cannot bind — and says so.** It binds every name a context carries as a variable and filters
  nothing, so a name that cannot be one stops every statement over that context, whether or not the
  statement mentions it: an index, a symbol, a reserved word, a key like `test-test`. In practice
  that rules out an array, a `Map`, a `Set`, a `NodeList` and a DOM element, which carry such names
  on their prototypes. It used to drop those names silently, which hid a property the caller had
  defined. The error names the key and
  the statement: *Context property name "test-test" cannot be used as a variable by
  context-deconstruction-executer, so this statement cannot run over this context! statement: 1 + 1*.
  A compilation that a Content Security Policy without `'unsafe-eval'` refuses is not blamed on a
  name: the browser's `EvalError` reaches the caller as it is. A consumer who hands over such a context picks `context-object-executer`, which addresses a name
  through an object and needs no name to be a variable. `README.md` describes the executer, and
  `DECISIONS.md` (2026-09-22) the reasoning.

- **The default executer warns about a large context while it compiles, not on every execution.**
  `High count of properties at first level …` used to be written on every resolution, which in a
  browser costs more than the resolution itself — measured at a factor of four to twenty-five. It is
  now written when the statement is compiled, so a consumer hears it once per context shape and
  statement. The threshold moved from 10 names to 25, because every ordinary object brings seven
  inherited names along.

- **A resolver whose context is the global object contributes no name to an enumeration below it.**
  `Object.keys` of a context below such a resolver used to list the names of the global object;
  it now lists what the other resolvers of the chain carry. Nothing changes for a lookup: a global
  is found from anywhere in the chain, and a statement reaches it through the ordinary scope chain.
  What this fixes: those names were handed to every executer that turns a name into code, so one
  frame on the page — `window[0]` — was enough to stop every statement below a global resolver.

- **A resolver without a context no longer answers the names of `Object.prototype`.** It held an
  empty object, so `toString`, `valueOf`, `hasOwnProperty` and the rest of `Object.prototype` were
  answered by it rather than by a resolver further up that carried them. It now holds no object at
  all until a value is written to it. A resolver built over a plain object still answers those
  names itself — that is what `in` says.

- **The static entry points reject a first argument that is neither a string nor an object.**
  `ExpressionResolver.resolve` and `resolveText` now reject a number, a boolean, a function,
  `undefined` or `null` in first place with a `TypeError` that names the call.
  Before, `resolve(123)` failed by accident inside a string method, and `resolveText(123)`
  answered `123` unchanged. The instance method `resolveText` still hands a non-string back as it
  is.

- **A resolver without an executer of its own takes the one of its parent.** Until now a
  resolver built without the `executer` option used `ExpressionResolver.defaultExecuter`, whatever
  its parent had been built with, so a chain named its executer on every resolver or mixed two.
  The order is now: the `executer` option, then the executer of the `parent`, then the default.
  A resolver whose parent runs a non-default executer changes behaviour with this, since it now
  evaluates in that executer's dialect. The new getter `executer` answers the executer in use.

- **`resolve` no longer catches an error — it logs it and hands it on.** A statement that fails
  used to answer `undefined`, or the default value where one was passed, and the caller had no way
  to tell a broken expression from one that legitimately resolved to nothing. `resolve` now writes
  the statement and the error to the console and then raises the error. **A default value does not
  cover an error any more**: it answers a missing result, never a failing statement. A caller who
  wants a fallback writes the `try`/`catch`.

  `resolveText` keeps catching, but no longer replaces what failed: **the expression stays in the
  text exactly as it was written**, a warning names it, and the rest of the text renders. Where it
  used to leave `undefined` or the default value, the reader now sees the expression that could not
  be evaluated — which is what an author needs in order to find it. The two entry points differ on
  purpose: a document has to render, a value has a caller standing right there.

  This is the loudest change of the release for anyone calling `resolve` directly. What used to be
  a silent `undefined` is now a rejected promise, so every call site that relied on the default
  value as a safety net needs one.

- **The default executer is `context-deconstruction-executer`.** Anyone who never configured one
  got `with-scoped-executer` before — a `with` block over the context, which announced its own
  deprecation on the first expression it resolved. The new default destructures the context into
  the parameters of the compiled function instead. How an expression is written does not change:
  a context property `value` is still addressed as `${value}`, so nothing has to be rewritten for
  the switch itself. Why the default moved, and why it moved to this one rather than to
  `context-object-executer`, is in `DECISIONS.md`.

  **A write from inside an expression no longer reaches the context**, and this is the part to read
  before upgrading. The new default runs the statement over local bindings destructured from the
  context and carries nothing back, so the binding a statement assigns to is gone when the expression
  is done: `${ known = "after" }` leaves `getData("known")` answering `"before"`, and a text carrying
  `${ counter++ }` twice renders `0 0` where it rendered `0 1`. Under `with-scoped-executer`, the
  default up to 3.0.0, both of those worked. Nothing warns about it — the write executes, it simply
  has nowhere to land.

  What still works is a **mutation** of an object the context holds: `${ holder.name = "after" }` is
  visible afterwards, because the statement and the context hold the same object and nothing has to
  be carried back. So a context of objects keeps behaving as it did; a context of primitives does
  not.

  **Two ways out.** `updateData` and `mergeContext` are the supported way to change a context and
  behave identically under every executer — that is the path to move a write
  onto. Where an expression really has to do the writing,
  `ExpressionResolver.defaultExecuter = "context-object-executer"` restores it in every shape, at the
  price of its dialect: that executer addresses a context property `value` as `${ctx.value}`, so the
  expressions have to be rewritten with it.

  The default is the fast implementation rather than the complete one, and the write-back is what a
  cache miss paid for — about eleven times the cost at a shallow chain, measured both ways.
  `README.md` describes what it keeps and what it does not, and `DECISIONS.md` (2026-09-20) carries
  the reasoning. A write to a name **no resolver of the chain carries** was never kept by this executer
  or by `with-scoped-executer` and still is not: it creates a global instead.

- **Escaping is a rule of `resolveText` alone.** `resolve("\${value}")` used to answer the text
  `${value}`; it now hands `\${value}` to the executer as a statement, which cannot compile it, so
  the error reaches the caller. The escape exists so that an expression can stand in surrounding
  text without being evaluated, and `resolve` has no surrounding text — its input is one
  expression.

- **An empty statement answers `undefined`.** `${}` used to answer `null`, and before the parser
  landed it was not recognized as an expression at all. It is one now, and it answers what
  `return;` answers in JavaScript. A default value applies to it like to any other result, and in
  a text it renders as `undefined`.

- **`resolve` rejects a delimited expression that does not end with `}`.** It throws a
  `SyntaxError` instead of answering the default value: nothing has been executed at that point,
  so it is a rejection of the form rather than an execution error, and the rules for a failing
  statement do not cover it. Whether the statement between the delimiters is valid JavaScript is
  still the executer's business and an error there is caught as before.

- **Every occurrence of an expression in a text is evaluated on its own.** `resolveText` used to
  scan a text once per *distinct* expression and replace all identical occurrences with that one
  result, so a statement with a side effect ran once however often it stood in the text. Each
  occurrence is now parsed, evaluated and replaced by position. Visible where a statement is not
  pure: a text carrying `${counter++}` twice now increments twice.

- **What escapes is the delimiter, and the parity of the backslash run decides.** An odd number of
  backslashes before the `$` escapes the `${` and exactly one backslash is consumed; an even number
  does not escape, and no backslash is consumed. Before, a single backslash was recognized and
  nothing else was defined. No backslash is removed except the one that does the escaping.

  An escaped `${` **opens nothing**, so the text behind it is scanned like any other: a delimiter
  that would have stood inside its statement is an expression of its own and resolves.

- **The four data methods follow the rules of the chain now.** `getData`, `updateData`,
  `deleteData` and `mergeContext` each take a `filter`, and what it meant was never quite the same
  in two of them. A filter now selects **exactly one resolver** by its name — the rule a scope
  prefix inside an expression follows — and **a filter matching none throws**, where three of the
  four used to do nothing at all. Without a filter, `updateData` changes the value **where the key
  lives**, walking towards the root and creating the key on the calling resolver only where no
  resolver carries it, and `deleteData` removes it from the first one carrying it; both used to act
  on the calling resolver alone. A caller who wants to define a value on one resolver without
  reaching into the rest of the chain uses `mergeContext({ key: value })`, which is unchanged.

- **Every resolver carries a name, and the two state getters mean what they say.** A resolver built
  without a `name` used to keep `null` and put the literal `/null` into every chain path; it now
  **generates** one — `ER1`, `ER2`, … — so `name` never answers `null`. Only the uniqueness of a
  generated name is promised, never its shape.

  With every resolver named, `effectiveChain` and `contextChain` can do what they were meant to:
  `effectiveChain` names only the resolvers that **provide a context**, and `contextChain` collects
  the contexts of exactly those — where the first used to answer the same string as `chain` and the
  second the whole list. A resolver provides a context when the caller handed one to the
  constructor, any value that is neither `null` nor `undefined`, or when a value has been written
  to it since through `updateData`, `mergeContext` or an assignment inside an expression. What the
  context holds decides nothing: an empty object counts. Both therefore describe a **state** that
  changes over a resolver's lifetime, while `chain` stays structural — a consumer must not cache
  either. Where no resolver provides a context, `effectiveChain` is the empty string.

- **The constructor rejects a `parent`, a `context` or a `name` it cannot use.** Each raises a
  `TypeError` naming the option, where the mistake used to surface somewhere else or not at all:
  - a `parent` that is not an `ExpressionResolver` — a context object, a resolver from another copy
    of the package — was dropped, which left a resolver without a chain whose executer answered
    `undefined`. `null` and `undefined` still mean no parent;
  - a `context` that is a primitive raised from inside the property cache for `"abc"`, `42` or
    `true`, while `0`, `""` and `false` became an empty context that counted as providing one. Any
    object is a context, and `null` or `undefined` still mean none. The static entry points build
    their resolver through the constructor and reject such a context as well;
  - a `name` must obey the character rule of a scope prefix — ASCII letters, digits, whitespace, `-`
    and `_` — so that every name can be addressed by one; a name carrying `.`, `:` or `/`, an empty or
    whitespace-only name and one that is no string are rejected. `""` and `0` used to get a generated
    name. A passed name is kept **trimmed**: `" root "` is the resolver `root`.

- **The `filter` of the data methods is read like a scope prefix.** `getData`, `updateData`,
  `deleteData` and `mergeContext` trim it, and a filter that is empty or whitespace only means no
  filter, where `"  "` used to throw as a name no resolver carries. A filter that is no string raises
  a `TypeError`.

- **The instance `resolve` and `resolveText` reject an argument that is not a string.** Both reject
  with a `TypeError`, as the static entry points do, and no default value applies. `resolveText(42)`
  used to answer `42`, and `resolve(42)` raised a `TypeError` from inside the scanner and logged it
  as a failed statement; no warning is written now, since no statement ran.

- **The data methods take every property key, and reject what is none.** `getData`, `updateData`
  and `deleteData` take a string, `""` included, a symbol or a number, and `0` addresses the first
  element of an array. They used to treat every falsy key as missing: `getData(0)` and `getData("")`
  answered the whole context, `updateData` and `deleteData` did nothing. Without a key — `null` or
  `undefined` — `getData` still answers the whole context, while `updateData` and `deleteData` raise
  a `TypeError`, as all three do for a key of another type. `mergeContext` still ignores `null` and
  `undefined` and raises a `TypeError` for a primitive, which it used to ignore.

- **`setupExecuter` rejects a `size` that is not a finite number.** A string, `null`, `NaN` or
  `Infinity` raises a `TypeError`. Before, such a size was taken as it was: `null` switched the cache
  off, and `"abc"` or `NaN` left it without an upper bound, so it never evicted anything again. A
  fraction is rounded down.

- **`ExecuterRegistry.registrate` is now `register`, and the old name is gone.** An own executer is
  registered with `ExecuterRegistry.register(aName, anExecuter)`; a call to `registrate` fails, since
  the registry no longer exports it. The error for a name that was never registered now reads
  `is not registered`.

- **`ExpressionResolver.buildSecure` is now `buildFiltered`.** It takes the same arguments and
  builds the same resolver; the new name says what it does, filter the context, where the old one
  promised a security the method does not give.

### Deprecated

- **`ExpressionResolver.buildSecure`**, the former name of `buildFiltered`. It still works and
  writes no warning, and it is removed in 4.0.

### Removed

- **No warning for a statement that runs longer than a second.** Every statement used to start a
  timer that wrote `Long running statement: …` to the console after one second and was cleared when
  the statement finished. The timer cost more than the rest of the resolver's own work per
  statement together; without it `resolveText` does about 3.6 times as much of that work in the
  same time. A consumer who wants to know about slow statements measures around `resolve` or
  `resolveText`. See `DECISIONS.md`, 2026-09-27.

- **`Executer` no longer has a default context.** The option `defaultContext` of
  `new Executer({ … })` and the getter `executer.defaultContext` are gone. A resolver built without
  a context has none of its own, whichever executer it runs: leaving `context` out is the same as
  `context: null`. Before, leaving it out took the executer's default context — under
  `EsprimaExecuter` the global object, under the other three a single object shared by every
  resolver built that way, so a write to one of them showed up in all the others. An own executer
  that still passes `defaultContext` keeps working; the option is ignored. A context shared by many
  resolvers is the context of a resolver at the root of their chain.

- **`EsprimaExecuter` is gone.** `src/executer/EsprimaExecuter.js` and the executer name
  `esprima-executer` no longer exist. It rewrote a statement's syntax tree onto the context without
  knowing the context, and that approach cannot be made to work cleanly: it did not reach a context
  value inside a function, a literal or a ternary, reached only a fixed list of globals, and could
  not run an assignment to a context name. A consumer who used it moves to
  `context-deconstruction-executer` (the default) or `context-object-executer`; `README.md`
  describes both. See `DECISIONS.md`, 2026-09-28.

- **The entry `browser-all-executers.js` and its bundles are gone.** They differed from
  `browser.js` and `dist/browser-…` only by registering `EsprimaExecuter`. Load
  `dist/browser-defaultjs-expression-language[.min].js` instead; it registers every executer the
  package ships.

- **`espree`, `escodegen` and `esprima` are no longer runtime dependencies.** The first two were
  used by `EsprimaExecuter` alone, `esprima` was never imported. The package has one runtime
  dependency left, `@default-js/defaultjs-common-utils`.

- **`LICENSE-OF-THIRD-PARTY` is no longer published.** It carried the licences of the bundled
  dependencies, which mattered while `espree` and `escodegen` were among them. The one runtime
  dependency left, `@default-js/defaultjs-common-utils`, comes from the same author under the same
  MIT licence as this package, see `LICENSE`.

### Fixed

- **Every code example of `README.md` failed.** They imported a default export the package never
  had (`import ExpressionResolver from …`), while `index.js` exports only named bindings; they now
  read `import { ExpressionResolver } from "@default-js/defaultjs-expression-language"`. The promise
  examples were unbalanced and, once balanced, answered the function they handed over instead of
  its result. The examples built on global variables are replaced by ones over a context. Every
  example was run against the package.

- **`dist/module-defaultjs-expression-language[.min].js` exported nothing.** The bundle built from
  `index.js` had no library configuration, so it could be loaded but offered nothing to import. It
  is an ES module now and exports `ExpressionResolver` and `ExecuterRegistry`, as `index.js` does.
  Both production bundles are now built with tree shaking and come out 2 to 4 % smaller. The
  browser bundle stays a classic script that sets `defaultjs.el`.

- **`setupExecuter` without a `size` shrank the cache.** Every executer starts its code cache at
  5000 entries, but `setupExecuter()` or `setupExecuter({})` set it to 1000 and evicted the rest. An
  option left out now changes nothing.

- **A scope prefix failed on a deep chain, and slowed down with every resolver it climbed.** The
  walk to the resolver a prefix names recursed once per resolver passed, so somewhere between 1,000
  and 10,000 resolvers `resolve("${name::…}")` rejected with `RangeError: Maximum call stack size
  exceeded`, and `resolveText` left the expression standing as though its statement had failed. The
  same happened for a prefix no resolver carries, which climbs to the root before it answers
  `undefined`. The walk is a loop now: no depth limit, and at depth 10 a prefixed expression resolves
  about a third faster, at depth 1,000 about nine times as fast. Resolution without a prefix is
  unchanged.

- **`chain` and `effectiveChain` failed on a deep chain.** Both built their path by recursing into
  the parent, and somewhere between 10,000 and 100,000 resolvers raised `RangeError: Maximum call
  stack size exceeded`. They walk the chain in a loop now, as `contextChain` already did.

- **A frozen context object broke every operation that enumerates a context.** `Object.keys`, a
  spread, `JSON.stringify` and `Object.getOwnPropertyNames` over a context raised
  `TypeError: 'ownKeys' on proxy: trap returned extra keys but proxy target is non-extensible`
  where the caller had handed in a frozen object, and under `ContextDeconstructorExecuter` — which
  reads the names of a context before it runs a statement — *every* expression failed with it. The
  proxy answers for the whole chain, which is more than the handed-in object holds, and a proxy may
  not do that over a target that guarantees anything about its own keys. It now stands over a
  target of its own, so any context object works.

  Two things follow for every context, not only a frozen one: **enumeration now describes the
  chain**, so `Object.keys`, a spread and `JSON.stringify` answer the names of every resolver
  instead of only the one the call was made on — each with the enumerability it has where it is
  defined, so a prototype's members stay out of `Object.keys` as they would on the object itself.
  And operations that are not intercepted — `Object.getPrototypeOf`, `Object.defineProperty`,
  `Object.isExtensible` — now see that empty target rather than the context object.

- **A page carrying a frame broke every resolver below one built on the global object.** The
  property cache of a global context handed its names out unfiltered, while every other context
  drops the names that cannot stand for a variable. A window that embeds a frame carries the own
  name `"0"` — the indexed access to `frames[0]` — which reached `ContextDeconstructorExecuter`
  through the chain and made every generated function a `SyntaxError: Unexpected number`, including
  one for an expression that only read its own context. Both caches apply the same rule now.

- **A resolver built on the global object threw on every lookup.** `new ExpressionResolver({
  context: globalThis })` answered `undefined`
  for every name, `${ Math.round(1.5) }` included. The property cache of a global context is a
  wrapper rather than a `Map`, and its lookup answered the value of the property where the caller
  expects the resolver holding it, so reading the property off that answer raised a `TypeError` that
  the executer swallowed. The wrapper answers the resolver now, and a resolver on the global object
  is an ordinary member of the chain: it carries every name, so it answers every lookup that reaches
  it and nothing below it is consulted.

  **A context that is the global object is no longer put behind a proxy.** There is nothing for a
  proxy to add there — the object already carries every name — and putting one in front of it
  broke every operation that enumerates a context, because a proxy may not hide what its target
  guarantees. `getData()` on such a resolver therefore answers the global object itself.
  `ContextDeconstructorExecuter` skips reading the property names when the context is the global
  object, so it no longer generates a destructuring pattern over every global name.

- **The instance `resolve` did not understand the scope syntax.** It stripped the delimiters and
  passed everything between them to the executer with the scope filter hardcoded to `null`, so
  `resolver.resolve("${scope::statement}")` handed `scope::statement` to the executer, which could
  not compile it: the error was swallowed and the caller got `undefined`. The two entry points
  answered differently for one syntax. Both parse the prefix by the same rule now, and `resolve`
  reaches a named resolver of the chain like `resolveText` does.

- **An expression carrying a brace of its own was not recognized.** The delimiters were matched by
  a regular expression that could not see past an inner brace, so an object literal, an arrow
  function body or a nested template literal inside a statement either left the text untouched or
  cut the expression at the first inner brace. The worst of the three was the nested template
  literal: the inner placeholder was matched and substituted while the expression around it stood,
  which corrupted the text instead of leaving it alone. An expression now ends at its **matching**
  closing brace, counted by a scanner that knows string, template and regular expression literals
  and block and line comments; a brace inside one of them does not count. A line comment ends at the
  end of the line, as in JavaScript, so `${ a // note }` written on one line is not an expression.
  The executers receive comments unchanged, and a statement that **begins** with a comment ending a
  line answers `undefined` under all three; `README.md` names the limit. An
  opening delimiter that never finds its matching brace is not an expression, and the text stands
  as written.

- **An escaped expression was resolved anyway where the same expression also stood unescaped.**
  Replacement went through `split`/`join` over the whole text, which cannot tell one occurrence
  from another: an escaped occurrence was replaced by the plain expression and evaluated on the
  next round, and an unescaped one left its backslash standing in front of the result. Escaping is
  decided per occurrence now.

- **`${scope::statement}` never reached an ancestor of the chain.** The internal walk was
  declared as `(aExecuter, aResolver, aExpression, aFilter, aDefault)` but recursed with its five
  arguments rotated by one, so the parent resolver arrived where the executer was expected and the
  walk died on the first step. Addressing a named resolver other than the one the call was made on
  has therefore never worked: `resolveText("${root::value}")` answered the text `null` where the
  root holds a value. It is a regression, not an original defect — the call site was not adjusted
  when `aExecuter` was prepended to the parameter list in 2025-07. Where two resolvers carry the
  same name, the first one found climbing towards the root now answers, the same shadowing rule as
  an unprefixed lookup.

- **A scope prefix that no resolver carries answered `null` and skipped the default value.** It now
  answers `undefined`, and a default value passed to `resolve` or `resolveText` applies to it as
  it does to every other result.

- **`ExpressionResolver.buildSecure`, now `buildFiltered`, threw a `TypeError` on every call.** It passed
  `ObjectUtils.filter` a single object where that helper takes three positional arguments, so
  the wrapper object arrived as the data to be filtered and `propFilter` arrived as
  `undefined` — every call died inside the filter before a resolver was built, whatever was
  handed in. The method therefore had no working consumer. The three arguments are now passed
  in the places `filter` expects, which also makes the documented default `deep: true` take
  effect. The constructor options travel inside `option` together with `deep` —
  `buildFiltered({ context, propFilter, option : { deep, name, parent, executer } })` — and
  `executer` is among them, which was missing by oversight, so a filtered resolver could not be
  pinned to an execution strategy.

- **The expression cache evicted the entries it should have kept.** `CodeCache` refreshed a
  marker on every read but ordered the eviction by write time, so it dropped the least
  recently *written* entry instead of the least recently used one. For this workload that is
  the wrong way round: an expression is compiled once and then resolved for the rest of the
  page's life, which makes the hottest entries the oldest writes and therefore the first to
  go, while an expression resolved once and never again survived. Eviction now follows the
  last use. Only reachable above the configured cache size — 5000 distinct expressions per
  executer by default.

- **A cache disabled through `setupExecuter({ size: 0 })` neither released anything nor could
  be switched back on.** `clear()` returned early on the very flag that disabling had just
  set, so the compiled expressions stayed in memory, and re-enabling never cleared the flag,
  which left that executer recompiling every expression for the rest of the page's life.
  `setupExecuter({ size: 0 })` now releases the entries, and a later positive size caches
  again, starting empty. Affects every executer.

- **`CodeCache` wrote a `console.debug` line into the consumer's console** every time it
  trimmed. The line is gone; nothing about the trim itself changed.

- **The raw published sources could not be loaded as native ES modules.** `src/**`,
  `index.js` and `browser.js` all ship raw through the `files` array, and neither entry
  loaded without a bundler in front of it. Two independent reasons: `browser.js` imported a binding
  `Context` that `index.js` does not export, which a browser rejects with `SyntaxError: The
  requested module './index.js' does not provide an export named 'Context'`; and three imports
  carried no file extension — `./ExpressionResolver` and
  `@default-js/defaultjs-common-utils/src/ObjectUtils` in `src/ResolverContextHandle.js`,
  `@default-js/defaultjs-common-utils/src/Global` in `browser.js` — which the browser
  and Node answer with `ERR_MODULE_NOT_FOUND`, because neither guesses the extension and the
  dependency's `exports` map takes the subpath literally. The second reason reached `index.js`
  as well, the entry `main` points at. The unused import is gone and the three extensions are
  in place; nothing else about any of the files changed, and the bundles are unaffected.

- **`browser.js` was published with an unresolved version placeholder.** The file is part of the
  `files` array, so anyone importing the raw source
  instead of a bundle got `GLOBAL.defaultjs.el.VERSION === "${version}"`. The version now comes
  from the generated module `src/version.js`, which ships with the package, so the raw sources
  and the bundles report the same value.

- **The dependency on `@default-js/defaultjs-common-utils` was declared as `latest`.**
  It resolved to whatever happened to be published at install time and would have pulled
  a future major without any warning. The range is now `^1`.

- **The expression cache ran at a fifth of its configured size in two of three executers.**
  `WithScopedExecuter` and `ContextObjectExecuter` passed the cache option
  as `aSize` instead of `size`, so the intended 5000 entries never applied and both fell
  back to the default of 1000 — trimming, and therefore recompiling, five times as often as
  designed. `ContextDeconstructorExecuter` was already correct. Expression-heavy pages hold
  more compiled expressions in memory now and recompile less.

- **The published `dist/` bundles did not match the bytes webpack produced.** `.gitattributes`
  applied `text=auto eol=lf` to the generated directory as well, so git normalized the CRLF
  pairs the bundled `@default-js/defaultjs-common-utils` sources bring with them — 771, 886 and
  771 bytes in the three development bundles. The published files therefore differed from every
  local build. `dist/**` is now excluded from line-ending conversion and ships exactly as built.
  The minified bundles and source maps were never affected.

- **`getData` and `deleteData` were broken wherever a filter named another resolver.** `getData`
  walked to the parent without returning what it found, so a value living further up answered
  `undefined`; `deleteData` called `deleteDataData`, a method that does not exist, so the same case
  raised a `TypeError`. Both walk the chain properly now — and an unknown filter raises a
  deliberate error instead of that `TypeError`, see the entry under *Changed*.
