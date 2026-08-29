# Backlog

Open items and findings for `@default-js/defaultjs-expression-language`.

Three kinds of entry live here: defects noticed while working on something else, open questions that need a decision, and work that was agreed but not implemented yet.

One paragraph each — where it is, what is wrong or undecided, what it costs. Enough to act on months later without asking anyone. Entries are written the moment they come up, not at the end of a session, because a session can end at any point. They are deleted once done; git history is the archive.

Anything that affects consumers of the package additionally belongs in the [issue tracker](https://github.com/default-js/defaultjs-expression-language/issues); that call is Frank's.

Entries here are independent of each other. An undertaking whose steps depend on each other gets its own file under `plans/` instead, and that file is deleted once it is finished — as the toolchain modernization was on 2026-08-21.

---

> **The freeze is lifted (2026-08-22). `SPECIFICATION.md` is the reference now.**
> The entries that were on hold say what the fix has to achieve and name the section of
> `SPECIFICATION.md` that defines it — that section is the target, not whatever the code does
> today. Every one of them is already pinned by a test in `test/spec/`, marked `it.fails` until
> the fix lands.
>
> **Four of them are owned by a running plan (2026-08-29):** the scope walk, the instance
> `resolve` and its scope syntax, the matching-brace parser, and the escape that reaches the
> wrong occurrence. They share three functions of one file, so they are ordered in
> `plans/expression-parsing.md` rather than picked up one by one. Read it before touching
> `src/ExpressionResolver.js`. Three of the four landed on 2026-08-29 — the scope walk in stage 1,
> the matching-brace parser and the escape in stage 2 — and their entries are gone. What is left
> of the plan is the instance `resolve`, the empty statement `${}`, and the error policy.

- [ ] **Decide on `"type": "module"` plus an `exports` field — and what it does to the executer import path.**
  `defaultjs-common-utils` already went this way, so the two packages diverge today. The
  catch: reaching a non-default executer — and with it `setupExecuter(options)` — is done by
  importing its module directly, e.g.
  `@default-js/defaultjs-expression-language/src/executer/EsprimaExecuter.js`. That is the
  intended usage (see `DECISIONS.md`, 2026-08-20) and works only because there is no
  `exports` field. An `exports` field must therefore whitelist `./src/executer/*`, or every
  consumer following the intended pattern breaks. Open alongside it: tuning the *default*
  executer needs the same deep import even though the consumer never imported that module —
  decide whether that stays as is or gets a documented entry point. **`./src/Executer.js` needs
  the same treatment**, noted 2026-08-24: `SPECIFICATION.md` 9 lists `Executer` as public — it is
  the interface an own implementation builds on — but `index.js` exports only `ExpressionResolver`
  and `ExecuterRegistry`, so the only way to it is the deep import, which `test/spec/PublicSurfaceTest.js`
  now pins. Either whitelist it too, or export it from `index.js` and drop it from the deep-import
  list. Not to be mixed into the
  toolchain work; the outcome belongs in `DECISIONS.md`. Found 2026-08-20.

- [ ] **Decide whether to move `espree` 10 → 11.**
  Version 11 raises the **runtime** Node floor for consumers of this package to
  `^20.19 || ^22.13 || >=24`. That is a compatibility decision about the published package,
  not a toolchain bump, so it stays out of the modernization stages. `espree` is only pulled
  in by `EsprimaExecuter`, which is not registered by default — weigh the reach of the change
  against that. The outcome belongs in `DECISIONS.md`. Found 2026-08-20.

- [ ] **Decide what happens to Dependabot while the v3 cycle runs.**
  Four branches sit on origin — `engine.io-6.2.1`, `json5-2.2.3`, `ua-parser-js-0.7.33`,
  `webpack-5.76.0` — the newest from 2023-03-15, all opened against `master`, all for
  devDependencies of a toolchain that no longer exists — `karma`, `webpack` 5.76, `engine.io`,
  `ua-parser-js`. The modernization of 2026-08-21 overtook all four. They no
  longer reach the documentation app now that its version selector runs off tags, so this
  is only about noise: close them and pause Dependabot until after the 3.0.0 release, or
  leave them. Found 2026-08-21.

- [ ] **Every code example in `README.md` uses a default import that does not exist.**
  Target: `SPECIFICATION.md` in full — the readme carries its consumer-facing subset.
  All examples read `import ExpressionResolver from "@default-js/defaultjs-expression-language"`,
  but `index.js:5` exports only named bindings — `export { ExpressionResolver, ExecuterRegistry }`.
  The default import resolves to `undefined`, so every example in the readme fails at the first
  call. Present since 1.0.0, so not a v3 regression. Two of the examples are additionally
  unbalanced (`README.md:70-78`: the object literal and the argument list are never closed).
  This is goal 4 territory — the readme is what an AI system reads to learn the package, and
  right now it teaches a broken call. Alongside the fix: the readme documents none of v3
  (`ExecuterRegistry`, executers, `setupExecuter`, resolver chains, scopes). Found 2026-08-21.

- [ ] **Was a `Context` export meant to exist on the public API?**
  Not answered by `SPECIFICATION.md`: section 9 lists the public surface and
  `ResolverContextHandle` is not on it, so the name dies here unless a reason to export it turns
  up. Decide and close.
  `browser.js`, `browser-all-executers.js` and `test/setup.js` all imported a binding
  `Context` from `index.js` that was never exported. The imports were unused and are gone
  (2026-08-21, see `CHANGELOG.md`), so nothing is broken any more — but the fact that three
  separate files asked for it suggests it was once intended. `src/ResolverContextHandle.js`
  holds the proxy every context passes through and is exported nowhere. Decide whether that
  becomes public API or whether the name simply dies here; the outcome belongs in
  `DECISIONS.md` if it becomes public.

- [ ] **Decide whether the build moves from webpack to Vite, once part 2 is done.**
  Taking Vitest puts `vite` in the tree as a direct dependency (`DECISIONS.md`, 2026-08-21),
  so the repository would carry two bundlers: Vite for the test path, webpack for `dist/`.
  That is the one honest cost of the runner decision, and consolidating would remove it —
  Vite's library mode covers what is needed in principle (several entries, minified and
  unminified, source maps, controllable file names). Against it: nothing about webpack is
  broken (5.109.2, zero vulnerabilities, both builds green), `dist/` is published *and*
  committed, so swapping bundlers changes every published artifact and needs its own
  verification rather than riding along with a test migration; and Vite 8's bundler is
  `rolldown` at 1.x. Do not open this before part 2 of the toolchain plan is green — it
  needs its own plan under `plans/`, and the outcome belongs in `DECISIONS.md`.
  Raised 2026-08-21 when the runner was decided.

- [ ] **The `module` entry produces a bundle nothing can consume.**
  `entries.config.json` builds `index.js` into `dist/module-…[.min].js`, but
  `webpack.config.mjs` sets no `output.library`, so the bundle evaluates its code and exposes
  no exports at all. Bundler consumers do not use it either — `main` points at `./index.js`,
  the raw untranspiled source. The artifact is therefore decorative, and it is what forces
  `optimization.usedExports: false` (see `DECISIONS.md`, 2026-08-21): without a consumer for
  its exports, tree shaking prunes the library out of it. Either give it a library
  configuration and let tree shaking back in, or drop the entry and publish two bundles
  instead of three. Consumer-visible either way, so the outcome belongs in `DECISIONS.md`.
  Found 2026-08-21 during stage F.

- [ ] **`generate-license.config.json` sets a key that does not exist.**
  The file says `"omitVersion": true` (`generate-license.config.json:5`), but the option
  `generate-license-file` 4.2.1 knows is **`omitVersions`**, plural — documented in its
  `README.md:92` and typed in `src/lib/cli/commands/main.d.ts:10`. The singular key is
  silently ignored, which is why `LICENSE-OF-THIRD-PARTY` carries versions although someone
  clearly meant it not to. Same class of defect as the `CodeCache` entry above: a
  misspelled option name that no tool complains about. Fixing the typo changes a published
  file, so decide first whether the versions should really be dropped — they do make the
  file churn on every dependency bump. Found 2026-08-21 while closing out the toolchain plan.

- [ ] **`devServer.static` serves a directory that does not exist.**
  `webpack.config.mjs` lists `["./WebContent", "./src/css"]`, but there is no `src/css` — the
  whole `src/` tree is `.js`. The dev server reports it anyway on startup
  (`Content not from webpack is served from './WebContent, ./src/css' directory`, verified
  2026-08-21), it just never resolves anything from it. Harmless, but it is the second dead
  path found in that one option; the first was the `./webcontent` casing. Left standing while
  fixing the casing so the change stayed on the agreed scope. Found 2026-08-21.

- [ ] **A `parent` that is not an `ExpressionResolver` is silently dropped.**
  `constructor` keeps `parent` only when it passes `parent instanceof ExpressionResolver`
  (`src/ExpressionResolver.js:131`), and answers `null` otherwise. So a caller who passes the
  wrong thing — a context object, a resolver from a different copy of the package, `undefined`
  from a lookup that missed — gets a resolver that silently has no chain at all, and every lookup
  that should have climbed answers the default instead. `SPECIFICATION.md` 4.2 does not mention
  the case. Compare the neighbouring option: an unregistered `executer` name **throws**, which is
  the behaviour that makes a mistake visible at construction rather than at the first resolution.
  Decide whether `parent` follows it. Consumer-visible if it changes, so the outcome belongs in
  `DECISIONS.md` and in `CHANGELOG.md`. Found 2026-08-24 while probing the edge cases of section 4.

- [ ] **Should the `ctx` prefix of `ContextObjectExecuter` be configurable?**
  An idea, not agreed work. That executer hands the context to the statement as the object `ctx`
  (`src/executer/ContextObjectExecuter.js:20-27`), so every context value is addressed as
  `${ctx.value}`. That this differs from the other three executers is settled and intended — see
  `DECISIONS.md`, 2026-08-24 — but the identifier itself is hard-coded, and a consumer whose
  context legitimately carries a property named `ctx` has no way out. Raised by Frank on
  2026-08-24 when the dialect question was decided. Open with it: whether the option belongs on
  `setupExecuter(options)` next to `size`, and what happens to the code cache when the identifier
  changes — the cache is keyed by the statement text alone, so entries compiled under the old
  identifier would answer for the new one. Consumer-visible, so the outcome belongs in
  `DECISIONS.md` and in `CHANGELOG.md`.

- [ ] **The default executer announces itself as deprecated, and nothing says what replaces it.**
  Target: `SPECIFICATION.md` 8.2 — the default becomes `context-deconstruction-executer`. What
  is left here is making the switch and the migration note that comes with it.
  `WithScopedExecuter` is what every consumer gets without configuring anything
  (`src/executer/index.js`), and on the first expression it resolves it writes
  `console.warn(new Error("With Scoped expression execution is marked as deprecated."))`
  (`src/executer/WithScopedExecuter.js:58`) — an `Error` object, so browsers print it with a
  stack trace. The `initialCall` guard keeps it to once per page, so this is a notice, not
  noise. But a default strategy that declares itself deprecated is a contradiction: either one
  of the other three becomes the default, or the warning goes. Neither `DECISIONS.md` nor
  `AGENTS.md` records why `with` is being retired or what consumers should move to, and the
  readme documents none of it. Consumer-visible either way, so the outcome belongs in
  `DECISIONS.md` and in `CHANGELOG.md`. Found 2026-08-21 while running the performance cases.
  **What the migration note has to warn about, measured 2026-08-24** in stage 4: an assignment
  inside an expression behaves differently on the two executers, and it fails silently. Under
  `WithScopedExecuter`, `${ known = "after" }` lands in the context and `getData("known")` answers
  `"after"`; under `ContextDeconstructorExecuter` the same expression answers `"after"` as its
  value while the context still holds `"before"`, because the assignment hits a destructured local
  binding. `SPECIFICATION.md` 6.5 allows exactly this — it promises nothing about a written value
  being readable afterwards — so it is conformant, not a defect. But a consumer carried over by a
  change of default gets no error, only a value that stops persisting. Pinned per executer in
  `test/spec/ExecuterTest.js`.

- [ ] **A name found at the top of a resolver chain costs as much as one found at the bottom.**
  Measured 2026-08-21 with `npm run bench`. `test/PerformanceTests/RandomScope.bench.js` builds
  a chain whose every link carries ~10 of 100 possible names, so a randomly asked name sits
  within a handful of links — yet depth 1 000 resolves at 86 000 hz and depth 100 000 at 166 hz,
  a factor of ~500 for a 100-fold deeper chain. The lookup itself is not the problem:
  `#getPropertyDef` (`src/ResolverContextHandle.js:168`) does return at the first match, and a
  direct `proxy["marker"]` on a property sitting in the top link of a 100 000 link chain runs at
  7.9 million hz — against 494 hz for one sitting at the bottom. What does scale with the full
  depth is any lookup that can never match: `proxy[Symbol.unscopables]` costs 455 hz at that
  same depth, because `#cache` is keyed by string and a symbol therefore walks every link before
  returning null. `with(context)` asks the object for `@@unscopables` as part of resolving a
  binding, which would put one full-chain walk on every successful lookup and matches what the
  benchmark shows. Worth confirming with a counter in the trap before acting on it. If it holds,
  the fix is cheap: answer non-string properties in `get`/`has` without walking, or give the
  handle an own `Symbol.unscopables`. Consumer-visible performance, so the outcome belongs in
  `DECISIONS.md`.

- [ ] **The deep-chain benchmarks are bimodal by a factor of two across runs.**
  At depths 100 000 and 1 000 000 a run settles into one of two states and stays there: roughly
  6.4 ms and 64 ms, or roughly 12.9 ms and 130 ms, each with an rme under 3 %. Measured
  2026-08-21 across several runs of `test/PerformanceTests/WarmResolve.bench.js` and
  `ColdResolve.bench.js`, which briefly made the cold path look twice as fast as the warm one —
  it was not, the two files had simply landed in different modes. Depths 10 and 1 000 are stable
  to within a few percent. Cause unknown; it looks like a JIT or GC state that is decided early
  and then holds for the whole run, not drift. Until it is understood, a single run of the deep
  benchmarks cannot be compared against a single earlier run — repeat, or compare only within
  one run. Whoever picks this up should check whether it also happens outside the browser
  runner.
  **Sharpened 2026-08-29** in stage 0 of `plans/expression-parsing.md`: the mode is decided per
  bench **file**, not per run. Across three runs `ColdResolve` landed in the fast mode once and in
  the slow mode twice, while `WarmResolve` stayed fast in all three — and the two `describe`s
  inside `ColdResolve` always moved together. So two files of the *same* run cannot be compared
  against each other either, and a recorded number has to name the mode it was taken in.

- [ ] **No benchmark exercises the cache eviction, the one thing `CodeCache` now does differently.**
  All four bench files stay far below the configured 5000 entries — `ColdResolve` and
  `WarmResolve` put a single expression through the cache, `RandomScope` about a hundred — so
  `#trim()` never runs and the switch from write-time to use-time eviction (2026-08-21) is
  invisible to `npm run bench`. Six runs across both versions differ by less than the
  benchmark's own run-to-run spread, which says nothing about the case the fix targets: a page
  holding more distinct expressions than the cache size, where the old order evicted the hot
  entries and forced a recompile. A bench that fills past `size` and then measures the hit rate
  on a hot subset would close that, and would also give the eviction order a regression guard
  beyond `test/general/CodeCacheTest.js`. Found 2026-08-21 while checking the fix for
  performance impact.

- [ ] **`src/Utils.js` is dead code, and it is published.**
  It exports a single function, `stringToHashcode`, and nothing in the repository imports it —
  not `src/`, not the entries, not the tests; `grep` for the name over `dist/**` returns zero
  hits in all six bundles, so webpack never sees it either. It still ships, because the `files`
  array publishes `src/**` raw. Coverage reports it at 0 %, which is how it surfaced
  (2026-08-21). Either it is somebody's intended public helper — then it needs a test and a
  mention in the readme — or it goes. Deleting a published file is consumer-visible, so the
  outcome belongs in `CHANGELOG.md`. Found 2026-08-21 during the first coverage run.

- [ ] **Two `TestUtils` helpers pass the context where the instance API expects a default value.**
  `createResolveWithExecuterFunction` and `createResolveTextWithExecuterFunction`
  (`test/TestUtils.js:9-21`) call `resolver.resolve(expression, data, defaultValue, timeout)`,
  but the instance signature is `resolve(aExpression, aDefault)`
  (`src/ExpressionResolver.js:253`): the context lands in the default value, the resolver
  itself is built without one, and every expression resolves against an empty context. The
  two extra arguments also defeat the `arguments.length == 2` check the `DefaultValue`
  distinction depends on (`AGENTS.md`, Architecture). Neither helper has a consumer, so
  nothing is failing today — the trap is that they look usable. Either give them the static
  `ExpressionResolver.resolve(aExpression, aContext, aDefault, aTimeout)`, which does take all
  four, or build the resolver with the context and drop the extra arguments. The sibling
  helper `createResolverWithExecuterFactory` was fixed on 2026-08-21 and is fine.
  Found 2026-08-21 while covering `setupExecuter`.

- [ ] **Coverage as of 2026-08-24, and the five things still uncovered.**
  After the conformance suite: statements **92.51 %** (371/401), branches **90.76 %** (177/195),
  functions **90.32 %** (84/93), lines **94.45 %** (341/361). The baseline this replaces, measured
  2026-08-21 after the `setupExecuter` tests, was 85.28 % / 72.82 % / 83.87 % / 88.91 % — branches
  were the weak axis at 72.82 % and are now the second strongest. `ExpressionResolver.js`, which
  carried more than half of everything uncovered in the package, is at 99.1 % of lines and 100 %
  of functions.
  What is left is five items, and none of them is "write more tests for a rule":
  1. `src/Utils.js`, 0 %, all nine lines — dead code, its own entry above. Deleting it is what
     closes this, not a test.
  2. The `setDebug` bodies of `ContextDeconstructorExecuter.js:13` and `EsprimaExecuter.js:13`,
     plus the `DEBUG`-guarded `console.log` at `ContextDeconstructorExecuter.js:41`. The public
     surface test asserts both exports exist but never flips them, deliberately: a debug switch
     has no observable effect to assert on.
  3. `ResolverContextHandle.js:24,27,30` — the `set`, `delete` and `keys` of
     `createGlobalCacheWrapper`. Unreachable today because a resolver on the global object throws
     on the first lookup; this closes itself when that entry is fixed and
     `test/spec/ContextTest.js` "takes the global object as an ordinary link of the chain" goes
     green.
  4. `ResolverContextHandle.js:118` (`get parent`) and `:122-123` (`updateData` on the handle,
     not the one on the resolver). Both are public on a class that section 9 does not list, so
     decide whether they are surface at all before covering them — see the `Context` export entry.
  5. `ExpressionResolver.js:60` — the outer `catch` of `execute`. The inner `try` already swallows
     every executer error, so nothing reaches it; it is unreachable rather than untested, and the
     honest fix is to remove it with the error-path work, not to contrive a test.
  `src/version.js` is generated, so its 0 % stays noise. Update these numbers when the picture
  changes rather than adding a third baseline.

- [ ] **The constructor option `executer` is undocumented and silently ignores an `Executer` instance.**
  Target: `SPECIFICATION.md` 4.2 — the option takes a registered name and nothing else.
  `new ExpressionResolver({ executer })` is how a consumer pins one resolver to a non-default
  executer, but the JSDoc above the constructor lists only `context`, `parent` and `name`
  (`src/ExpressionResolver.js:118-128`), so the option exists only in the code. It also accepts
  a name and nothing else: `typeof executer === "string" ? getExecuterType(executer) :
  ExpressionResolver.defaultExecuter` (`:130`) falls back to the default for anything that is
  not a string, an `Executer` instance included — while the static setter
  `ExpressionResolver.defaultExecuter` (`:98-102`) accepts both a name and an instance. Same
  concept, two rules, and the stricter one fails without a word. **Decided 2026-08-22** (plan
  question 40): the option takes a **registered name and nothing else**. Every executer is
  registered before use, so the name is what addresses it, and an unregistered name already
  throws through `getExecuter`. What is left to settle is the other end of the asymmetry —
  whether the static setter `defaultExecuter` stays permissive or is narrowed to names as well —
  and what the constructor does when it is handed an instance anyway: falling back to the default
  without a word is the one answer that is now ruled out. Consumer-visible, so the outcome belongs
  in `DECISIONS.md`. Found 2026-08-21 while covering `setupExecuter`.

- [ ] **The instance `resolve()` does not understand the scope syntax at all.**
  Target: `SPECIFICATION.md` 4.3 — `resolve` recognizes the scope prefix in the delimited form,
  and only there.
  `resolveText()` parses an expression with the `EXPRESSION` regex and hands
  `MATCH_EXPRESSION_SCOPE` on as the filter (`src/ExpressionResolver.js:76`), but
  `resolve(aExpression, aDefault)` merely strips `${` and `}` and passes everything in between
  as the statement, with the filter hardcoded to `null` (`:258`). So `${root::value}` becomes
  the statement `root::value`, which is not valid JavaScript: the executer throws, the error is
  swallowed, and the caller gets `undefined`. Verified 2026-08-21 — `resolveText` returns
  `from leaf` for `${leaf::value}` while `resolve` returns `undefined` for the same input on the
  same resolver. Two entry points, one syntax, different answers; the readme documents neither.
  The argument-order defect of the walk, which this one shares the syntax with, was fixed on
  2026-08-29 in stage 1 of `plans/expression-parsing.md` — so `resolveText` reaches a named
  link now, while `resolve` still cannot reach a scope at all. Consumer-visible, so the outcome belongs in `CHANGELOG.md`.
  Found 2026-08-21.

- [ ] **`getData` and `deleteData` are broken on the filter path.**
  Target: `SPECIFICATION.md` 6.6, which specifies all four data methods along the chain — note
  that it changes more than these two defects: a filter selects exactly one link and an unmatched
  filter throws.
  Both walk to the parent when a filter names another link, and both get it wrong.
  `getData` (`src/ExpressionResolver.js:199-201`) calls `this.parent.getData(key, filter)`
  without returning it, so a lookup that has to travel up the chain answers `undefined` instead
  of the value — verified 2026-08-21: `leaf.getData("value", "root")` returns `undefined` where
  the root holds `from root`. `deleteData` (`:224-226`) calls `this.parent.deleteDataData(key,
  filter)` — a method that does not exist, so the same case throws
  `TypeError: this.parent.deleteDataData is not a function`. The two neighbours built on the
  same three-branch shape, `updateData` (`:215-217`) and `mergeContext` (`:239-240`), are
  correct, which is what makes the pair easy to miss. All four are public methods and none of
  the four has a test. Consumer-visible, so the outcome belongs in `CHANGELOG.md`.
  Found 2026-08-21 while reading the uncovered branches for goal 3.
  **One conformance test depends on this typo, noted 2026-08-24:** `test/spec/ContextTest.js`,
  "deleteData throws on a filter that matches no link", passes today — but because
  `deleteDataData` raises a `TypeError`, not because an unknown scope is rejected on purpose. It
  carries no `fails` marker, since it does pass; it starts proving its rule the moment the typo
  is gone. Re-read it with this fix and make sure it still passes for the right reason.

- [ ] **A resolver built on the global object throws on every lookup.**
  Target: `SPECIFICATION.md` 6.4 — the global object stays a supported context object.
  `#initPropertyCache` special-cases `data == GLOBAL` and returns the wrapper from
  `createGlobalCacheWrapper` (`src/ResolverContextHandle.js:14-32`), whose `get(property)`
  answers `GLOBAL[property]` — a **value**. But `#getPropertyDef` (`:168`) is contracted to
  return a `ResolverContextHandle`, and the `get` trap then evaluates `proxy.#data[property]` on
  that value: `TypeError: Cannot read private member #data from an object whose class did not
  declare it`. `execute()` swallows it, so the caller sees `undefined` and a warning. Verified
  2026-08-22 against `src/` under node 24.19: `new ExpressionResolver({ context: globalThis })`
  answers `undefined` for `${Math.round(1.5)}` and for any global that holds a truthy value; a
  global holding `undefined` survives only because the trap short-circuits on falsy. Reach:
  `EsprimaExecuter` declares `defaultContext: GLOBAL` (`src/executer/EsprimaExecuter.js:129`),
  so every resolver built while that executer is the default is affected, and passing `window`
  explicitly is the documented way to reach the global context. Note the ordinary global
  fallback is unaffected — it works through the JavaScript scope chain of the generated code,
  not through this path. **Fix agreed 2026-08-22** (`SPECIFICATION.md` 6.4): the wrapper already receives
  the handle it never uses — its `get` returns that handle instead of the value, and the
  contract "a lookup answers which link holds the name" holds again. Document alongside it that
  `ownKeys` then reports every global name, which `ContextDeconstructorExecuter` destructures on
  every execution. Consumer-visible, so the outcome belongs in `CHANGELOG.md`.
  Found 2026-08-22 while working out the specification questions.

- [ ] **A write to an unknown name inside an expression lands on `globalThis`.**
  Target: `SPECIFICATION.md` 6.5 — the negative guarantee and the three-level switch.
  Verified 2026-08-22 against `src/` under node 24.19 with both executers: `${brandNew = 1}`
  leaves the resolver's own context untouched and sets `globalThis.brandNew`. Under
  `WithScopedExecuter` the `has` trap answers false for a name the chain does not carry
  (`src/ResolverContextHandle.js:65-68`), so the assignment falls out of the `with` block into
  global scope; under `ContextDeconstructorExecuter` the generated function is sloppy-mode and an
  undeclared assignment does the same. A write to a name that **does** exist in the chain behaves
  correctly — it lands in the resolver's own context and leaves the parent link alone. Writing
  from inside an expression is unspecified behaviour (see `SPECIFICATION.md` 6.5), but writing to
  the global object is not merely unspecified: the template engine and this resolver run in CMS
  systems where users author expressions. **Fix agreed 2026-08-22** (`SPECIFICATION.md` 6.5): a switch that
  *allows* writing to the global object, at three levels each falling back to the one above it —
  `ExpressionResolver.allowGlobalWrite` for the whole application, a constructor option
  `allowGlobalWrite` per resolver, and a fifth argument on the static `resolve` / `resolveText`
  per call. **Off by default.** While it
  is off, a write to a name the chain does not carry is caught and executed in the own context of
  the resolver the expression is evaluated on — the same destination as a write to a name that
  already exists somewhere in the chain, so there is one rule and no special case. Under
  `WithScopedExecuter` that means having `has` answer true for every name, with `get` falling
  back to `GLOBAL[property]` so reads are unaffected. Under `ContextDeconstructorExecuter` the write cannot be caught at all, so there
  the protected state means generating the body in strict mode: the assignment throws and is
  reported as an execution error.
  **`buildSecure` has to forward it in the same change.** Since 2026-08-29 it takes the
  constructor options inside its `option` argument and names them one by one
  (`src/ExpressionResolver.js:355`), so `allowGlobalWrite` has to be added to that destructuring
  as well — `SPECIFICATION.md` 6.7 carries it as pending and section 10 points here. The CMS case
  that motivates `buildSecure` is the case this switch was invented for, so the two belong
  together.
  Consumer-visible, so the outcome belongs in `CHANGELOG.md`.
  Found 2026-08-22 while working out the specification questions.

- [ ] **`RESERVED_NAMES` in the esprima executer misspells `global`.**
  Related to `SPECIFICATION.md` 6.4, because it decides what an expression can reach.
  `src/executer/EsprimaExecuter.js:27` lists `"gobal"` where `"global"` was meant. The list names
  the identifiers the AST rewrite leaves alone; everything else is rewritten to `ctx?.name`. So
  `global` is rewritten and resolves against the context instead of the global object, while the
  misspelled `gobal` is protected and nothing ever writes it. Harmless in a browser, where the
  global is `window` or `self` and both are on the list — but this package is used from node
  tooling as well, and the entry is dead either way. The same list is what keeps `fetch`,
  `console`, `Object`, `Array`, `Map` and `Set` reachable inside an expression, so it is worth
  reviewing as a whole rather than only fixing the typo. Found 2026-08-22 while working out the
  global-fallback question.
  **What the list costs, measured 2026-08-24** in stage 4 of the conformance plan: under this
  executer `${ Math.round(1.5) }` answers `undefined`, because `Math` is not on the list and is
  therefore rewritten to `ctx?.Math`. The same holds for every global the list does not name —
  `JSON`, `Date`, `Number`, `Promise`. The other three executers answer `2`. That is legal under
  8.3, which lets an executer decide how a statement reaches the global object, and it is pinned
  as such in `test/spec/ExecuterTest.js` — but it makes the list the whole surface a consumer of
  this executer gets, which is the argument for reviewing it rather than patching one typo.
  **Agreed 2026-08-24: rework the list as a whole, not the typo alone.** The direction to try
  first, Frank's: build it initially from the global context — the names of `GLOBAL` itself —
  instead of maintaining a hand-written list that is a typo away from a dead entry and silently
  drops whatever nobody thought of. Four things to settle when it is written, because a derived
  list is not simply a longer one: it is a **snapshot** taken when the module loads, so a global
  added later is not on it; it makes every global reachable, which removes the property 6.4 leans
  on today, that a typo and an empty value are indistinguishable; a context property must keep
  winning over a global of the same name, so the list decides only what is *not* rewritten, never
  what shadows what; and the hand-written entries that are not names of globals at all —
  `await`, `async`, `this`, `typeof`, `instanceof`, `undefined` — are syntax, not identifiers, and
  have to survive the change. Consumer-visible, so the outcome belongs in `DECISIONS.md` and in
  `CHANGELOG.md`.

- [ ] **`effectiveChain` is a copy of `chain`, and a resolver without a name has none.**
  Target: `SPECIFICATION.md` 5.1 and 5.5.
  `chain` and `effectiveChain` (`src/ExpressionResolver.js:159-171`) build the same string by the
  same rule, only through their own getter, so no input tells them apart; a link without a name
  contributes the literal `"/null"` to both. Agreed 2026-08-22: `chain` names **every** link,
  `effectiveChain` only the links whose context **holds at least one value**, and `contextChain`
  collects the contexts of exactly those links instead of all of them — so both describe a state
  that changes over a resolver's lifetime, unlike the structural `chain`. Alongside it, and the reason the
  context became the deciding characteristic: **every resolver gets a name**. Where the caller
  passes none, one is generated — prefix `ER` plus a counter — so `name` never answers `null` and
  every link can appear in a chain path. All three getters are supported public API (plan
  question 17), so all three need tests. Consumer-visible, so the outcome belongs in
  `CHANGELOG.md`. Found 2026-08-22 while drafting the specification.
  **The rule was simplified on 2026-08-24** (`DECISIONS.md`), after stage 2 showed the original
  one had no workable definition of "holds a value": the property cache walks the prototype chain
  to its end, so even `{}` holds the members of `Object.prototype`. What counts now is what the
  caller handed to the constructor — a link provides a context unless it was built with `null`,
  with `undefined`, or without the option, and nothing has been written to it since. So the fix
  needs no inspection of the context at all: one flag per link, set at construction and set again
  by `mergeContext`, `updateData` and a write from an expression. `SPECIFICATION.md` 5.5 carries
  the rule.
  **Three existing assertions expect the wrong result and are already marked `fails`:**
  `test/ExecuterTests/WithScopedExecuterTests/ResolverChainTest.js:63,73,83` each expect
  `effectiveChain` to be `/first/second/third` on a chain with one link built as `context: null` —
  under 5.5 that link does not appear. The corrected expectations stand in the file; remove the
  markers with this fix.

- [ ] **The static entry points take no configuration object.**
  Target: `SPECIFICATION.md` 4.1.
  `ExpressionResolver.resolve` and `resolveText` are positional only
  (`src/ExpressionResolver.js:298,322`), so every argument beyond the context has to be reached
  by passing the ones before it, and the call site says nothing about what a bare `true` at the
  end would mean. Agreed 2026-08-22: both static methods additionally accept **one configuration
  object** carrying everything — `{ expression | text, context, defaultValue, timeout,
  allowGlobalWrite }`. Which form is in use is decided by the first argument alone, `typeof
  arguments[0] === "string"`, so no key of the object is inspected and a context carrying a key
  named `context` can never be mistaken for a configuration. Two details belong to the same
  change: the positional form gains `aAllowGlobalWrite` as its fifth argument (see the
  global-write entry above), and in the configuration form "a default value was passed" is the
  presence of the key `defaultValue` rather than an `arguments.length` check — which is the more
  precise rule the `DefaultValue` distinction always wanted. Purely additive, so no consumer
  breaks. Consumer-visible, so the outcome belongs in `CHANGELOG.md`.
  Found 2026-08-22 while reviewing the draft specification.
  **One question the fix has to answer**, found 2026-08-24 while probing the edge cases: `typeof
  arguments[0] === "string"` decides between the two forms, so what happens to a first argument
  that is neither a string nor an object needs stating. Today `resolve(123, {}, "fallback")` and
  `resolve(null, {}, "fallback")` both answer the default after a `TypeError` inside the `catch`
  — an accident, not a rule. `SPECIFICATION.md` 4.1 says nothing about it either.

- [ ] **The data methods have no rules along the chain.**
  Target: `SPECIFICATION.md` 6.6.
  `getData`, `updateData`, `deleteData` and `mergeContext` each take a `filter`, and what they do
  with the chain was never specified — the code answers three different things and one of them is
  a defect (see the entry on the filter path above). Agreed 2026-08-22: a filter selects exactly
  one link, and **a filter matching no link throws** in all four instead of being silently
  ignored, which is what happens today. `updateData` without a filter searches from the calling
  resolver towards the root and changes the value where the key lives, creating it on the calling
  resolver only when no link carries it. `deleteData` removes the key from exactly one link — the
  addressed one, or the first one carrying it; a chain-wide switch was weighed and dropped. `mergeContext` stays a shallow `Object.assign` into one link's context.
  Consumer-visible in several places, so the outcome belongs in `CHANGELOG.md`.
  Found 2026-08-22 while specifying the write path.
