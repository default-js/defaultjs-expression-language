# Backlog

Open items and findings for `@default-js/defaultjs-expression-language`.

Three kinds of entry live here: defects noticed while working on something else, open questions that need a decision, and work that was agreed but not implemented yet.

One paragraph each — where it is, what is wrong or undecided, what it costs. Enough to act on months later without asking anyone. Entries are written the moment they come up, not at the end of a session, because a session can end at any point. They are deleted once done; git history is the archive.

Anything that affects consumers of the package additionally belongs in the [issue tracker](https://github.com/default-js/defaultjs-expression-language/issues); that call is Frank's.

Entries here are independent of each other. An undertaking whose steps depend on each other gets its own file under `plans/` instead, and that file is deleted once it is finished — as the toolchain modernization was on 2026-08-21.

---

> **Freeze since 2026-08-21 — read `plans/expression-resolver-specification.md` first.**
> There is no specification of what the ExpressionResolver is meant to do, and one of the
> defects found in it turned out to be a year-old regression rather than an intention. Until
> that specification exists, nothing that changes or documents resolver behaviour gets worked
> on — the entries concerned are marked *Frozen* below. Toolchain, packaging, benchmark and
> test-infrastructure entries are unaffected.

- [ ] **Decide on `"type": "module"` plus an `exports` field — and what it does to the executer import path.**
  `defaultjs-common-utils` already went this way, so the two packages diverge today. The
  catch: reaching a non-default executer — and with it `setupExecuter(options)` — is done by
  importing its module directly, e.g.
  `@default-js/defaultjs-expression-language/src/executer/EsprimaExecuter.js`. That is the
  intended usage (see `DECISIONS.md`, 2026-08-20) and works only because there is no
  `exports` field. An `exports` field must therefore whitelist `./src/executer/*`, or every
  consumer following the intended pattern breaks. Open alongside it: tuning the *default*
  executer needs the same deep import even though the consumer never imported that module —
  decide whether that stays as is or gets a documented entry point. Not to be mixed into the
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
  **Frozen** — `plans/expression-resolver-specification.md`.
  All examples read `import ExpressionResolver from "@default-js/defaultjs-expression-language"`,
  but `index.js:5` exports only named bindings — `export { ExpressionResolver, ExecuterRegistry }`.
  The default import resolves to `undefined`, so every example in the readme fails at the first
  call. Present since 1.0.0, so not a v3 regression. Two of the examples are additionally
  unbalanced (`README.md:70-78`: the object literal and the argument list are never closed).
  This is goal 4 territory — the readme is what an AI system reads to learn the package, and
  right now it teaches a broken call. Alongside the fix: the readme documents none of v3
  (`ExecuterRegistry`, executers, `setupExecuter`, resolver chains, scopes). Found 2026-08-21.

- [ ] **Was a `Context` export meant to exist on the public API?**
  **Frozen** — `plans/expression-resolver-specification.md`.
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

- [ ] **The default executer announces itself as deprecated, and nothing says what replaces it.**
  **Frozen** — `plans/expression-resolver-specification.md`.
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

- [ ] **Coverage baseline of 2026-08-21, and where the gaps sit.**
  State after the `setupExecuter` tests: statements 85.28 % (342/401), branches 72.82 %
  (142/195), functions 83.87 % (78/93), lines 88.91 % (321/361) — so goal 3 is no longer
  blocked, only unfinished. Branches are the weak axis, and it is concentrated:
  `ExpressionResolver.js` at 62 % of 104 branches carries more than half of everything
  uncovered in the package, with the gaps around lines 180-203 and 226-262.
  `ResolverContextHandle.js` covers 58 % of its functions (11/19, missing around lines 18-30,
  the proxy traps that no test triggers), and `EsprimaExecuter.js` sits at 83 % of branches.
  Of the executers only the `setDebug` bodies and one `DEBUG`-guarded `console.log` are left
  uncovered. `src/Utils.js` at 0 % is listed separately above, and `src/version.js` is
  generated, so its 0 % is noise. Update these numbers when the picture changes rather than
  adding a second baseline.

- [ ] **The constructor option `executer` is undocumented and silently ignores an `Executer` instance.**
  **Frozen** — `plans/expression-resolver-specification.md`.
  `new ExpressionResolver({ executer })` is how a consumer pins one resolver to a non-default
  executer, but the JSDoc above the constructor lists only `context`, `parent` and `name`
  (`src/ExpressionResolver.js:118-128`), so the option exists only in the code. It also accepts
  a name and nothing else: `typeof executer === "string" ? getExecuterType(executer) :
  ExpressionResolver.defaultExecuter` (`:130`) falls back to the default for anything that is
  not a string, an `Executer` instance included — while the static setter
  `ExpressionResolver.defaultExecuter` (`:98-102`) accepts both a name and an instance. Same
  concept, two rules, and the stricter one fails without a word. Either accept an instance here
  too or throw on one; document the option either way. Consumer-visible, so the outcome belongs
  in `DECISIONS.md`. Found 2026-08-21 while covering `setupExecuter`.

- [ ] **`${scope::expression}` never reaches an ancestor — the recursive call passes its arguments in the wrong order.**
  **Frozen** — `plans/expression-resolver-specification.md`.
  `resolve()` is declared as `(aExecuter, aResolver, aExpression, aFilter, aDefault)`
  (`src/ExpressionResolver.js:64`), but when the scope filter does not match the current link it
  recurses as `resolve(aResolver.parent, aExpression, aFilter, aDefault, aExecuter)` (`:65`) —
  five arguments, every one in the wrong slot: the parent resolver arrives as the executer, the
  expression as the resolver, the filter as the expression. Verified 2026-08-21 in the browser:
  a leaf named `leaf` under a root named `root`, both carrying `value`, resolves
  `resolveText("${leaf::value}")` to `from leaf` but `resolveText("${root::value}")` to the
  string `null`. Addressing a named link of the chain is the feature the scope syntax exists
  for and it has never worked beyond the resolver one already holds. It is a regression, not an
  original defect: in beta 3 (`df42f2c`, 2020-02-22) the function took
  `(aResolver, aExpression, aFilter, aDefault)` and recursed correctly. `aExecuter` was
  prepended to the parameter list on 2025-07-20 (`38aff7d`, "updated beta code") and the call
  site was never adjusted — it had `aExecuter` appended at the end instead, which shifted every
  other argument by one. Invisible for a year because no test uses `scope::` —
  `ResolverChainTest.js` only resolves unscoped names, which travel through the context proxy
  instead. Consumer-visible,
  so the outcome belongs in `CHANGELOG.md`. Found 2026-08-21 while reading the uncovered
  branches for goal 3.

- [ ] **The instance `resolve()` does not understand the scope syntax at all.**
  **Frozen** — `plans/expression-resolver-specification.md`.
  `resolveText()` parses an expression with the `EXPRESSION` regex and hands
  `MATCH_EXPRESSION_SCOPE` on as the filter (`src/ExpressionResolver.js:76`), but
  `resolve(aExpression, aDefault)` merely strips `${` and `}` and passes everything in between
  as the statement, with the filter hardcoded to `null` (`:258`). So `${root::value}` becomes
  the statement `root::value`, which is not valid JavaScript: the executer throws, the error is
  swallowed, and the caller gets `undefined`. Verified 2026-08-21 — `resolveText` returns
  `from leaf` for `${leaf::value}` while `resolve` returns `undefined` for the same input on the
  same resolver. Two entry points, one syntax, different answers; the readme documents neither.
  Related to the argument-order defect above: fixing only that one still leaves `resolve()`
  unable to reach a scope. Consumer-visible, so the outcome belongs in `CHANGELOG.md`.
  Found 2026-08-21.

- [ ] **`getData` and `deleteData` are broken on the filter path.**
  **Frozen** — `plans/expression-resolver-specification.md`.
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
