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
> **Four of them were closed on 2026-08-29** by the expression parsing rework: the scope walk, the
> instance `resolve` and its scope syntax, the matching-brace parser, and the escape that reached
> the wrong occurrence. They shared three functions of one file and were done in one ordered
> undertaking; `DECISIONS.md` carries what outlived it, git history the rest.

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
  **The cross-executer numbers of 2026-08-30 say it holds.** Since the benchmarks run under every
  executer, the `with` block can be compared against three strategies that do not use one, over the
  same chain. `RandomScope`, where the match sits a few links up, is the clearest: at depth 100 000
  `with-scoped` answers **138 hz** while `context-object` answers **662 000 hz** and `esprima`
  **457 000 hz** — the two that do not use `with` do not scale with the depth at all, exactly as a
  lookup that stops at the match should not. `WarmResolve`, where the name sits at the bottom and
  everyone walks the whole chain, puts the same three within a factor of three of each other
  (13 / 41 / 41 hz at depth 1 000 000), so the difference is not the executer being faster in
  general — it is the extra full walk that only `with` triggers. The default executer is therefore
  the slowest of the four on any chain worth the name, which the entry on the deprecated default
  should be read against.

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
  **Sharpened 2026-08-29** while the expression parsing rework was measured: the mode is decided per
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

- [ ] **`WarmResolve` and `ColdResolve` can report a mean two to four times too high at depth 10,
  and the cause is the chain they hold live.**
  Signature: `hz` collapses, `mean` jumps from 0.0016 ms to somewhere between 0.0032 and 0.0064,
  `rme` goes past 100 %, and `max` sits at 340–430 ms — while `p75` and `p99` do not move at all
  (0.0000 and 0.1000 in every single run measured). So it is never a slower operation, always one
  long pause inside 100 000 to 300 000 iterations.
  **What it is, verified 2026-08-29.** `ChainBuilder.js` builds a chain of **1 000 000** resolvers in
  the module body, and it stays live for the whole file — a million `ExpressionResolver`, each with
  a `ResolverContextHandle` and a `Proxy`. Any collection that has to walk that live set costs
  hundreds of milliseconds, and depth 10 is where it shows because it is the fastest case and
  therefore allocates the most per second. Cut `DEPTHS` to `[10, 1000]` and the pause disappears
  completely: four runs at 0.0015–0.0016 ms, ±3.3 %, `max` 3.3–3.8 ms.
  **How often it strikes depends on how much the resolver allocates**, which is what made it look
  like a defect: across 19 runs of this session it appeared in **5 of 9** runs of sources where the
  instance `resolve` allocates one `{ scope, statement }` object per call through `parseScope`, and
  in **1 of 10** runs of sources that do not. Inlining those two lines in `resolve` removes the
  allocation and the pause did not appear in two runs afterwards — but the base rate says two runs
  prove little, and the small-chain measurement above says the allocation is not the cost, only the
  trigger. Per operation it is not measurable at all.
  So this is a property of the benchmark, not of the library, and `parseScope` stays as it is. What
  to do with it: either accept the signature and discard such a run — `rme` past 100 % with a `max`
  in the hundreds of milliseconds is the tell — or stop holding the deep chain live while the
  shallow depths are measured, for instance by building one chain per depth instead of reusing the
  tail of the deepest. Note that the same file's own comment explains why the tail is reused: a
  bench file has nowhere to put setup. Found 2026-08-29 while measuring the whole cycle for goal 5.

- [ ] **Coverage as of 2026-08-29, and the four things still uncovered.**
  Statements **93.28 %** (472/506), branches **91.85 %** (248/270), functions **90.81 %** (89/98),
  lines **95.69 %** (422/441). Measured after the expression parsing rework, and every axis
  is above the 2026-08-24 baseline it replaces — 92.51 % / 90.76 % / 90.32 % / 94.45 % — although
  the package grew by about a hundred statements in the same work.
  **`src/ExpressionResolver.js` is at 100 % of lines and functions**, the file that carried more
  than half of everything uncovered a week earlier.
  What is left is four items, and none of them is "write more tests for a rule":
  1. `src/Utils.js`, 0 %, all nine lines — dead code, its own entry above. Deleting it is what
     closes this, not a test.
  2. The `setDebug` bodies of `ContextDeconstructorExecuter.js:13` and `EsprimaExecuter.js:13`,
     plus the `DEBUG`-guarded `console.log` at `ContextDeconstructorExecuter.js:41`. The public
     surface test asserts both exports exist but never flips them, deliberately: a debug switch
     has no observable effect to assert on.
  3. The `set` and `delete` of `createGlobalCacheWrapper` (`ResolverContextHandle.js`). Since a
     global context is no longer proxied (2026-08-30), nothing routes a write through the wrapper
     at all — only `has`, `get` and `keys` are reached, and those through a child link. Whether the
     two remaining methods still have a caller is worth checking before covering them.
  4. `get parent` and `updateData` on the handle (`ResolverContextHandle.js`, not the `updateData`
     on the resolver). Both are public on a class that section 9 does not list, so decide whether
     they are surface at all before covering them — see the `Context` export entry. One more reason
     to settle it, noted 2026-08-30: `updateData(data)` replaces the data and rebuilds the cache,
     but the proxy is decided in the constructor, so it cannot move a handle between the global
     shape and the ordinary one.
  `src/version.js` is generated, so its 0 % stays noise. The 22 branches still open are spread over
  the scanner's state machine and `EsprimaExecuter`; they are combinations of literal states, not
  rules without a test. Update these numbers when the picture changes rather than adding a fourth
  baseline.

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

- [ ] **Take the name check out of `ResolverContextHandle` and give it to the executer that needs it.**
  Agreed 2026-08-30, reasoning in `DECISIONS.md` — the cache stays a cache, the proxy stays a
  proxy, both are filled with data structures that are already valid, and neither checks anything.
  What goes: `VARNAME_CHECK`, `RESERVED_WORDS`, the `isVariableName` predicate and the warning
  `Variable name is illegal …` in `#initPropertyCache`, plus the same filter in the cache wrapper of
  a global context. What takes over: `ContextDeconstructorExecuter`, the only place that turns
  context names into code (`Object.getOwnPropertyNames` appears nowhere else in `src/`), filters the
  names it destructures. Constants that more than one part needs go into a central `Constants.js`.
  Measured consequences, all consumer-visible: under `ContextObjectExecuter` a context carrying
  `test-test`, `class`, `0` or `undefined` answers `undefined` today although `ctx["test-test"]` is
  an ordinary property access — those become reachable; an enumeration of a context widens by the
  same names; and the warning leaves the context path, where it fires today for consumers who never
  generate code. Two things to settle while implementing: whether `undefined` and `constructor` may
  then shadow through a `with` block, which is what dropping `RESERVED_WORDS` from the lookup
  allows, and what the filter costs in the executer, which computes its name list on every call —
  `npm run bench` covers every executer since 2026-08-30, so that is measurable now. Related and
  worth deciding together: `RESERVED_NAMES` in `EsprimaExecuter` is that executer's version of the
  same rule, see its entry above. `CHANGELOG.md` and `SPECIFICATION.md` 6.1 both move with it.

- [ ] **A context that is not an object throws from inside the property cache.**
  `ResolverContextHandle` keeps whatever it is handed except a falsy value (`data || {}`), so
  `new ExpressionResolver({ context: "abc" })` — or `42`, or `true` — reaches `Reflect.ownKeys` on
  a primitive and throws `TypeError: Reflect.ownKeys called on non-object` at construction, from
  three frames below the call. A falsy primitive is silently taken as an empty context instead, so
  `0` and `false` build a resolver and `42` does not. Verified 2026-08-30 in the test browser and
  pinned in `test/general/ContextShapeTest.js`, which asserts only *that* it throws, so a decision
  to reject a primitive with a clear message keeps the test green. To decide: reject with an error
  that names the mistake, coerce (`Object(context)`), or ignore and take an empty context — the
  last of the three is what the falsy half does today. `SPECIFICATION.md` says nothing about what a
  context may be, which is the other half of the entry. Found 2026-08-30 while checking how the
  executers treat unusual context shapes.

- [ ] **`ContextDeconstructorExecuter` reads every property of a context, including one that throws
  on access.**
  It builds its destructuring pattern from the names of the context and then destructures, which
  *calls* every accessor among them. A context whose accessor throws therefore breaks every
  expression, including one that touches no name at all. Verified 2026-08-30 with an `arguments`
  object, whose `callee` is a poisoned accessor in strict mode: `${ 1 + 1 }` answers `2` under
  `WithScopedExecuter` and `TypeError: 'caller', 'callee', and 'arguments' properties may not be
  accessed…` under this one. Pinned as the current difference in `test/general/ContextShapeTest.js`.
  The same shape covers any context with a lazily computed or throwing getter, and note that
  destructuring also *runs* every getter on every execution, which is a cost the other executers do
  not pay. To decide whether that is a defect of the executer or the price of its strategy (8.3).
  Found 2026-08-30 while checking how the executers treat unusual context shapes.

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
  **One case has no interception point since 2026-08-30:** a resolver whose context *is* the global
  object is no longer proxied, so a write from an expression evaluated on it reaches the global
  object directly and the switch cannot catch it there. Arguably that write is not "reaching out to
  the global object" but writing into that resolver's own context — decide it explicitly rather
  than discovering it while implementing.
  **`buildSecure` has to forward it in the same change.** Since 2026-08-29 it takes the
  constructor options inside its `option` argument and names them one by one
  (`src/ExpressionResolver.js:355`), so `allowGlobalWrite` has to be added to that destructuring
  as well — `SPECIFICATION.md` 6.7 carries it as pending and section 10 points here. The CMS case
  that motivates `buildSecure` is the case this switch was invented for, so the two belong
  together.
  Consumer-visible, so the outcome belongs in `CHANGELOG.md`.
  Found 2026-08-22 while working out the specification questions.

- [ ] **`EsprimaExecuter` cannot reach a context value from inside a nested function.**
  Its rewrite turns an identifier into `ctx?.name`, but only where the identifier stands in the
  statement itself. Verified 2026-08-30 in the test browser with a context `{ count: 3 }`:
  `${ count }` answers `3`, while `${ (() => { return count; })() }`,
  `${ [1,2].map(v => v + count).join() }` and `${ (function(){ return count; })() }` all raise
  `ReferenceError: count is not defined`. Every other executer answers all four, because they put
  the context into scope (`with`), into the parameter list, or hand it over as an object - and a
  nested function closes over any of those. A callback is not an exotic thing to write in an
  expression, so this is narrower than it looks only until someone writes `map`. §8.3 lets an
  executer decide how a statement reaches a context value, but not to lose it halfway through the
  statement. Read together with the `RESERVED_NAMES` entry above: both are about what the rewrite
  does and does not see, and one pass over that rewrite should answer both. Consumer-visible, so
  the outcome belongs in `CHANGELOG.md`. Found 2026-08-30 while making the benchmarks run under
  every executer - the benchmark for expressions carrying literals had to stop reading the context
  inside an arrow function because of it.

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
  that is neither a string nor an object needs stating. **Changed 2026-08-29** with the error
  policy of section 7: `resolve(123, {}, "fallback")` and `resolve(null, {}, "fallback")` used to
  answer the default after a `TypeError` inside the `catch`; the `TypeError` now reaches the caller,
  which is at least visible but still an accident rather than a rule. `SPECIFICATION.md` 4.1 says
  nothing about it either.

- [ ] **The JSDoc of the whole package needs one pass.**
  Agreed 2026-08-30, out of the naming review of the same day. What that review turned up, without
  looking at every file: the constructor of `ResolverContextHandle` is documented as "Creates an
  instance of Context" and declares `@param {ExpressionResolver} resolver` for a parameter that is
  called `parent` and holds a `ResolverContextHandle` (`src/ResolverContextHandle.js:137-141`);
  `#initPropertyCache` promises `@returns {Map<string,PropertyDefinition>}`, a type that exists
  nowhere, and over a global context it answers no Map at all but the cache wrapper (`:260`); the
  doc block of `resolveText` has its description and the next line run together into one broken
  line (`src/ExpressionResolver.js:465`); the constructor lists `context`, `parent` and `name` but
  not `executer`, which has its own entry above; `generate(aStatement, contextProperties)`
  documents only its first parameter (`src/executer/ContextDeconstructorExecuter.js:30`); and
  `CodeCache.has`, `get`, `set` and `clear` carry no JSDoc at all, although `AGENTS.md` asks for it
  on everything public. The pass goes file by file rather than through this list. Worth doing in
  one go with the entry below: a wrong name and a wrong doc line usually sit in the same place.

- [ ] **Check every method name against what it does and what it answers.**
  Agreed 2026-08-30, after `#addressedLink` had to be renamed to `#findResolver` — the name said
  "link" where a resolver comes back. The same review found, again without looking at every file:
  `#getPropertyDef` answers the handle that carries a name, not a property definition, and in two
  of the traps the variable it lands in is called `proxy` (`src/ResolverContextHandle.js:164`,
  `:182`, `:287`); `chain` and `effectiveChain` answer a string path while `contextChain` answers
  an array, and none of the three answers a chain in the sense of section 2; `getData` without a
  key answers the whole context; `toText` converts nothing, it replaces `undefined` and `null` by
  their word and hands everything else back (`src/ExpressionResolver.js:93`); `traverse` rewrites
  the AST it walks (`src/executer/EsprimaExecuter.js:76`); `buildSecure` promises a security its
  own JSDoc denies; `setupExecuter` sets the code cache size and nothing else; `normalize`,
  `startsRegex`, `parseScope` and `scanExpression` each say less than they do; `registrate` is not
  an English word and stands on the public surface (`src/ExecuterRegistry.js:11`);
  `getExecuterType` is the import alias of `getExecuter` and answers an instance, `ContextProxy`
  the import alias of `ResolverContextHandle` (`src/ExpressionResolver.js:4`, `:6`); and
  `EsprimaExecuter`, registered as `esprima-executer`, parses with `espree`. The public ones —
  section 9 names `registrate`, the three chain getters and `buildSecure` — are consumer-visible,
  so their outcome belongs in `DECISIONS.md` and `CHANGELOG.md`; the private ones are a rename and
  nothing else.

- [ ] **"Link" is out of the specification and still stands in every other file.**
  Decided 2026-08-30: one member of a chain is a **resolver**, so `SPECIFICATION.md` lost the term
  from its table of terms and from all 56 places that used it. Nothing else was touched beyond the
  text written in the same session, which leaves roughly 145 occurrences: `test/` carries 78, most
  of them in the names of the conformance tests that mirror the specification
  (`test/spec/ContextTest.js` 24, `test/spec/ChainTest.js` 21); `DECISIONS.md` 35; `BACKLOG.md` 17;
  `CHANGELOG.md` 11, entries under `[Unreleased]` among them, which a reader will meet without a
  definition once the specification no longer carries one; `AGENTS.md` 2; and three comments in
  `src/` (`ExpressionResolver.js:77`, `ResolverContextHandle.js:95` and `:153`). The test names are
  the loudest part and the one with a price: renaming them changes what the gate prints.
  Found 2026-08-30.

- [ ] **The executer's `defaultContext` has no reader left, so 4.2 and 6.3 are unimplemented.**
  `SPECIFICATION.md` 4.2 says `context` defaults to the default context of the **executer in
  use**, and 6.3 leans on it: leaving `context` out is explicitly *not* the same as passing
  `context: null`, because the first takes that default — for `EsprimaExecuter` the global object.
  Since the constructor change of 2026-08-30 (`src/ExpressionResolver.js:269`) the option defaults
  to `null` and the handle turns that into `{}`, so both cases answer an empty context. Before
  that the constructor read `DEFAULT_EXECUTER.defaultContext` — the *globally* configured default
  executer, not the one this resolver was built with — so the rule as written was never
  implemented either; the change removed the approximation. A `grep` for `defaultContext` over
  `src/` now finds only the definition in `Executer.js` and the four executers setting it, and no
  reader at all, which leaves half of the `Executer` interface of 8.1 dead in production while
  section 9 lists it as public. To decide: implement 4.2 with the executer of the instance, or
  change 4.2 and 6.3 and drop `defaultContext` from the interface. No test covers the rule, which
  is why the gate stayed green through the change, and unlike the other entries of section 10 this
  one carries no `fails` marker yet. Consumer-visible, so the outcome belongs in `DECISIONS.md`
  and in `CHANGELOG.md`. Found 2026-08-30 while rebuilding `dist/` after the commit `some fixes`.

- [ ] **The executer's `defaultContext` is one shared object, so every resolver built without a
  context writes into every other one.**
  Since 2026-08-30 the constructor takes `this.#executer.defaultContext` where the `context` option
  is left out (`src/ExpressionResolver.js:274`), which implements 4.2 and 6.3 — but that default is
  a single object created once per executer module (`src/executer/ContextDeconstructorExecuter.js:63`
  and the three others), and `ResolverContextHandle` keeps it by identity (`data || {}`). Verified
  2026-08-30 under node 24 with the new default executer: `a.mergeContext({ leak: 1 })` on a
  resolver built without a context puts `leak` into `ContextDeconstructorExecuter.defaultContext`
  itself, and every resolver built afterwards — anywhere in the application — answers `1` for it.
  `updateData` and a write from an expression do the same. So the isolation 6.1 promises is gone for
  the whole class of context-less resolvers, and the value survives for the lifetime of the page.
  Two more consequences to weigh with the fix: under `esprima-executer` that default context **is**
  the global object, so a context-less resolver writes straight to `globalThis` and 6.5's negative
  guarantee cannot hold there at all; and the executer's default is shared across resolvers that
  have nothing to do with each other, which is what makes this different from two resolvers being
  handed the same object on purpose. To decide: copy the default per resolver (wrong for the global
  object of the esprima executer), have the handle treat a defaulted context as read-only, or let
  the executer answer a fresh default on every call. `SPECIFICATION.md` 4.2 and 6.3 say nothing
  about identity. Consumer-visible, so the outcome belongs in `DECISIONS.md` and in `CHANGELOG.md`.
  Found 2026-08-30 while working out why the spec suite fails under the new default executer.
  **The interim removes it** - the constructor no longer reads `defaultContext` for a missing
  option (see the entry below) - but the question does not go away: it returns the moment the
  redefined default context is handed to a resolver, because a single object shared by every
  resolver that has one behaves exactly like this. Keep it on record until that definition is
  written.

- [ ] **5.5 and 4.2 now contradict each other over a resolver built without the `context` option.**
  5.5 says a resolver provides a context when the caller *handed one to the constructor* — "any
  value that is neither `null` nor `undefined`" — and names three cases that provide none:
  `context: null`, `context: undefined`, and *the option left out*. 4.2 and 6.3 say the option left
  out takes the **executer's default context**, and since that is implemented (2026-08-30) the
  default is `{}` under three executers and the global object under `esprima-executer` — never
  `null`, so `effectiveChain` and `contextChain` now count a resolver that 5.5 says they must skip.
  `test/spec/ChainTest.js:229` fails on exactly that and is the only test that catches it. Both
  rules were written on 2026-08-22 and neither knew the other would land. To decide which one moves:
  either 5.5 drops "the option left out" from its list, and then a resolver built without a context
  joins the chain carrying whatever its executer defaults to — under `esprima-executer` the whole
  global object, which 6.4 then has to be read against; or 4.2 keeps the default only as the
  *content* of the context while "was one handed over?" stays a question about the option, which
  means the handle has to tell a defaulted context from a handed one. Read together with the entry
  above: the same distinction would fix both. Consumer-visible, so the outcome belongs in
  `DECISIONS.md`; `SPECIFICATION.md` moves with it either way. Found 2026-08-30.
  **Decided the same day, by Frank: a resolver without a context has no context.** 5.5 stands as
  written and does not move. What moves is the other end: 4.2 and 6.3 lose the rule that a missing
  option takes the executer's default context, and **`defaultContext` is to be redefined** - away
  from "the context a resolver gets when the caller passes none" and towards something like a
  *global* context, available in addition to the chain rather than in place of it. Frank is working
  out that definition; nothing about it is settled beyond the direction, and `Executer.js`,
  `SPECIFICATION.md` 4.2, 6.3, 8.1 and section 10 all move with it. Until it is written, the
  constructor stops reading `defaultContext` for a missing option, which is what makes
  `test/spec/ChainTest.js:229` green again and what removes the shared-object defect above.

- [ ] **A write from an expression can be made to persist under `ContextDeconstructorExecuter`.**
  Raised by Frank on 2026-08-30 with the switch of the default: `${counter++} ${counter++}` answers
  `"0 0"` there, because the assignment hits a destructured local binding and nothing carries it
  back. A write-back closes it, verified the same day under node 24 against a real resolver context:
  keep the destructured names as `let` bindings inside the generated function instead of in the
  parameter list, and copy each one back in a `finally`, guarded by a comparison —
  `if (counter !== context.counter) context.counter = counter;`. Two runs then answer `0` and `1`,
  and `getData("counter")` answers `2`. **The generated code never looks at the expression**: the
  names come from `contextProperties`, the list the generator already builds for the destructuring,
  so the write-back is emitted from the same source and works for any name - verified with `i++`
  and `test = test + "!"` on 2026-08-30. **The guard is not an optimization, it is the correctness
  half**: destructuring pulls the values of the whole chain into locals, so an unguarded write-back
  would copy every inherited name into the own context of the resolver the expression runs on and
  shadow the resolvers above it from then on. With the guard, a leaf built with `{ counter: 0 }`
  under a root carrying `inherited` holds exactly `{"counter":2}` after two runs — measured, not
  assumed. What is left to decide before this is implemented: the cost, one comparison per context
  property per execution on top of the destructuring that already reads them all, which
  `npm run bench` can measure per executer since 2026-08-30; whether the write-back also runs when
  the statement throws, which `finally` does by default; and whether a getter that answers a fresh
  object on every read turns the comparison into a spurious write. `SPECIFICATION.md` 6.5 promises
  nothing about a written value being readable afterwards, so this widens what the executer can do
  rather than fixing a broken rule - which is why it is a capability with a state, not a defect.
  Consumer-visible, so the outcome belongs in `CHANGELOG.md`. One boundary belongs in the same
  note: a name the context does **not** carry is not destructured either, so nothing is written
  back for it - `${ x = 5 }` stays the global-write case of 6.5 and is not covered by this.
