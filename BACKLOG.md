# Backlog

Open items and findings for `@default-js/defaultjs-expression-language`.

Three kinds of entry live here: defects noticed while working on something else, open questions that need a decision, and work that was agreed but not implemented yet.

One paragraph each — where it is, what is wrong or undecided, what it costs. Enough to act on months later without asking anyone. Entries are written the moment they come up, not at the end of a session, because a session can end at any point. They are deleted once done; git history is the archive.

Anything that affects consumers of the package additionally belongs in the [issue tracker](https://github.com/default-js/defaultjs-expression-language/issues); that call is Frank's.

Entries here are independent of each other. An undertaking whose steps depend on each other gets its own file under `plans/` instead, and that file is deleted once it is finished — as the toolchain modernization was on 2026-08-21.

---

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
  All examples read `import ExpressionResolver from "@default-js/defaultjs-expression-language"`,
  but `index.js:5` exports only named bindings — `export { ExpressionResolver, ExecuterRegistry }`.
  The default import resolves to `undefined`, so every example in the readme fails at the first
  call. Present since 1.0.0, so not a v3 regression. Two of the examples are additionally
  unbalanced (`README.md:70-78`: the object literal and the argument list are never closed).
  This is goal 4 territory — the readme is what an AI system reads to learn the package, and
  right now it teaches a broken call. Alongside the fix: the readme documents none of v3
  (`ExecuterRegistry`, executers, `setupExecuter`, resolver chains, scopes). Found 2026-08-21.

- [ ] **Was a `Context` export meant to exist on the public API?**
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

- [ ] **`CodeCache` evicts by write time, not by use — `lastHit` is written and never read.**
  `get()` stamps `data.lastHit = Date.now()` (`src/CodeCache.js:64`), but `#trim()` sorts by
  `count` (`:97`), and `count` is only ever set when an entry is written (`:74`, `:78`). No
  read influences eviction, so the cache is least-recently-*written*, not least-recently-used.
  For this workload that inverts the intent: an expression is compiled once and then hit for
  the rest of the page's life, so the hottest entries are exactly the oldest writes and are
  evicted first, while an expression resolved once and never again survives. Either sort by
  `lastHit` or drop the field. Around it, the same object is described three ways: the
  `CacheEntry` typedef declares `lastHit` and `code` (`:3`, `:5`) while the code writes
  `count` and `value`, and the `@type` on `:25` is missing its closing `>`
  (`Map<string,CacheEntry`). `#trim()` also logs a `console.debug` line into every consumer's
  console on each trim (`:96`) — with the size fix now in place that happens five times less
  often, which is why it has not been noticed. Found 2026-08-21 while fixing the `aSize` typo.

- [ ] **`devServer.static` serves a directory that does not exist.**
  `webpack.config.mjs` lists `["./WebContent", "./src/css"]`, but there is no `src/css` — the
  whole `src/` tree is `.js`. The dev server reports it anyway on startup
  (`Content not from webpack is served from './WebContent, ./src/css' directory`, verified
  2026-08-21), it just never resolves anything from it. Harmless, but it is the second dead
  path found in that one option; the first was the `./webcontent` casing. Left standing while
  fixing the casing so the change stayed on the agreed scope. Found 2026-08-21.

- [ ] **`target/` holds three dead build artifacts and is no longer gitignored.**
  `commons.js`, `index.2193891163.js` and `runtime.js` — output of the Karma-era build that
  redirected webpack into `target/` via `argv.target`. That argument is gone (2026-08-21) and
  so is the `.gitignore` entry, which means the directory now shows up as untracked in
  `git status`. Nothing produces it any more and nothing reads it. Delete it. Left on disk
  because deleting a directory is Frank's call, not a side effect of a config cleanup.
  Found 2026-08-21.

- [ ] **The default executer announces itself as deprecated, and nothing says what replaces it.**
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

- [ ] **Disabling a `CodeCache` never frees it, and re-enabling it brings the old entries back.**
  `setup({ size: 0 })` sets `#disabled = true` and then calls `this.clear()`
  (`src/CodeCache.js:44-46`), but `clear()` opens with `if (this.#disabled) return`
  (`src/CodeCache.js:88`) — the flag it just set. The early return fires every time, so the
  entries and the map survive. A consumer calling `setupExecuter({ size: 0 })` to release the
  memory releases nothing, and a later `setupExecuter({ size: 5000 })` resurrects every stale
  compiled expression instead of starting empty. Either clear before setting the flag, or drop
  the guard from `clear()` — a disabled cache has nothing to protect. Reachable through the
  public `setupExecuter` of all four executers, so it is consumer-visible. Found 2026-08-21
  while looking for a way to force a cache miss in the benchmarks.

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
