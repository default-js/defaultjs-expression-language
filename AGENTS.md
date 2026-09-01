# AGENTS.md

## Project

`@default-js/defaultjs-expression-language` — an expression resolver for dynamic content. It resolves `${...}` expressions against a context, similar to JavaScript template literals, but with support for promise results and hierarchic scopes through a resolver chain.

Pure ESM package, **shipped untranspiled**: the sources under `src/` are published as-is, `dist/` additionally holds bundled browser variants. The target environment is the browser.

Part of the `defaultjs-*` family (~20 repositories under `c:\_dev_ws\vscode`). Its only family-internal runtime dependency is `@default-js/defaultjs-common-utils`.

## Vision for v3

v3 is an AI-assisted modernization cycle with five goals:

1. **Modernize the toolchain** — current build and test chain, replace Karma. **Done (2026-08-21):** webpack 5.109 with CLI 7 and dev server 6, Vitest in a real browser instead of Karma, `npm audit` at 0. The reasoning that outlived the work is in `DECISIONS.md`, the rest in the git history.
2. **Raise code quality** — fix existing defects, sharpen the structure. The pluggable executer strategy is the part of this work already begun. The freeze that held this back is **lifted (2026-08-22)**: `SPECIFICATION.md` now says what the resolver is meant to do, so a fix has something to be derived from other than the code. The places where the code and the specification disagree are listed in its section 10 and carried as `BACKLOG.md` entries. Since 2026-08-24 **every one of them is pinned by a failing test** marked `it.fails` — 63 at the start, **8 left** after the data methods of 6.6 and the chain getters of 5.5 were fixed on 2026-08-30 and the default executer moved on 2026-09-01 — so a fix is finished when its markers can be removed and the gate is still green. Since 2026-09-01 the marker carries a second meaning as well, and the two are not the same thing: 5 of the 13 markers say *this executer does not have this capability*, which is not a defect and not a rule broken. Which of the two a marker is comes from `test/ExecuterCapabilities.js`, never from the marker itself. The markers now sit in `test/spec/` and `test/executer/`. See `DECISIONS.md` for both mechanisms.
3. **Raise test coverage** — **largely done (2026-08-24).** The conformance suite of `test/spec/` pins every rule of `SPECIFICATION.md` and took coverage from 84 % to **93.28 % of statements, 91.85 % of branches** (2026-08-29, after the expression parsing rework; `src/ExpressionResolver.js` is at 100 % of lines). What is left is four named items in `BACKLOG.md`, and none of them is a missing test: dead code, two debug switches, one branch that only becomes reachable when a defect is fixed, and two methods whose place on the public surface is undecided.
4. **Documentation** — for human consumers *and* for AI systems meant to use this package. `SPECIFICATION.md` (2026-08-22) is the first half of it and the reference the rest is written against; `README.md` still teaches a broken call and documents none of v3.
5. **Do not lose performance** — the resolver must not come out of this cycle slower than it went in, and coming out faster is the actual goal. Every change that touches a hot path is measured against `npm run bench` before and after, and a regression is a defect like any other. Two of the decisions in `DECISIONS.md` were already taken on measurements rather than taste; keep it that way. Note the benchmark caveat in `BACKLOG.md` before comparing single runs.

What this repository is meant to become a template for is **the way we work and shape the project** — the sibling repositories are otherwise none of this project's business. Carrying results over to them is Frank's own task and must not influence decisions made here.

## Working agreement

**Language** — conversation happens in German. Everything written down is English: code, comments, JSDoc, commit messages, documentation, and this file.

**Answers** — short, at the level of a senior engineer. No recap of what was just read, no listing of options not taken, no praise for the question. The diff carries the detail.

**Evidence over agreement** — disagreement needs a reason grounded in code, a measurement, or a specification. Agreement without checking is just as wrong as objection without grounds; manufactured dissent costs more time than assent does. Raise objections *before* the work, not as hindsight. Once a decision is made after an objection was heard, implement it and let it rest.

**Verified, not asserted** — never report something as working without having run it. Never quote versions, options, or API behaviour from memory when a source exists in the repo or in the dependency tree; read it.

**Uncertainty** — three distinct cases:
- *Facts about the code* — never guess, look. Nothing is claimed about a file that has not been read.
- *Intent, where different readings lead to materially different work* — ask, bundled before the work starts, not drop by drop.
- *Routine judgement* (naming, ordering, where a test belongs) — decide, and state the assumption in the handover.

**Test gate** — nothing counts as done before `npm test` has run green. Failing tests are reported with their output rather than talked around; skipped steps are named.

**Tests come first** — a change in behaviour starts with a test, and that test is run and seen
failing before any source file is touched. Failing for the right reason: a defect is reproduced
first, so the test proves the defect exists and later proves it gone. A test written after the
fix passes on the broken version often enough to be worthless, and nobody finds out. Where the
two states genuinely cannot be told apart from the outside — `setupExecuter` is the known case,
a cache hit and a recompilation return the same value — write that limitation into the test file
instead of implying a proof that is not there.

**No unrequested extras** — no drive-by refactorings, no new dependencies, no additional tooling (formatter, linter, CI, types) without asking. The requested scope is the scope.

**Report findings, and write them down** — a defect noticed along the way goes into `BACKLOG.md` in the same turn it is reported: not at handover, and not into the diff. A session can end without a handover, and anything living only in the conversation is lost when it does.

**Changes reach the changelog in the same turn** — anything a consumer of the package
notices (public api, published files, runtime dependencies, supported environment) gets its
entry under `## [Unreleased]` in `CHANGELOG.md` together with the diff, never assembled at
release time from memory. Same reason as the backlog rule: a session ends without warning.
Build and test work is not consumer-visible and stays out.

**No commits, no pushes** — git is available for reading, branches, diffs, and stashes, but `git commit` and `git push` are Frank's to run. Working branch `v3`, main branch `master`.

## Workflow

Sessions end whenever a topic is finished, often without warning. The files under *Records* are the only state that survives; the conversation does not.

0. **Orient** — read `BACKLOG.md` from disk at the start of every session, before anything else; nothing is injected automatically. Read `DECISIONS.md` before proposing anything about architecture or the public API. If `plans/` exists, read the plan it contains before touching whatever it covers. The question *what do we do next?* is answered from `BACKLOG.md` and this file alone: the backlog is the authoritative status, so no test run, no build and no code search is needed to work it out.
1. **Clarify** — check the request, ask the open questions of intent in one batch before starting.
2. **Plan** — for anything touching more than one file or changing dependencies: goal, affected files, risk, intended verification. Wait for approval. An approved plan that is not implemented straight away becomes a `BACKLOG.md` entry carrying the agreed scope. Small, locally contained changes go straight in.
3. **Implement** — the agreed scope, nothing beside it.
4. **Verify** — `npm test`; if the build is affected, also `npm run build` plus a diff of `dist/` against the previous state. Show the result instead of summarizing it.
5. **Hand over** — what changed, what was deliberately left alone, what is still open. Frank commits.

During the modernization the staging rule from the plan applies on top: secure a baseline, one stage, green, only then the next.

## Records

Split by shape: independent items go in the backlog, settled questions get written down with their reasoning, and an undertaking whose steps depend on each other gets its own plan.

- `BACKLOG.md` — open items, findings, and work that was agreed but not yet implemented. Entries are deleted once done; git history is the archive.
- `CHANGELOG.md` — what changed for consumers, per released version, newest first. Keep a Changelog format. Written while the change is made, released by moving `## [Unreleased]` to a version heading.
- `DECISIONS.md` — architecture and API decisions with their reasoning. Anything that constrains later work, or that would otherwise be argued a second time, gets an entry. It answers *why*; `SPECIFICATION.md` answers *what*.
- `SPECIFICATION.md` — what the resolver does, rule by rule, and what it is meant to do where the code does not yet keep up. Written 2026-08-22 from an interview with Frank rather than from the code, because the code is not a reliable witness to its own intent. It is the reference for every fix to the resolver, and it is published with the package.
- `plans/` — one file per ordered undertaking, named after it. **No plan is running.** The five so far — the toolchain modernization, the specification, the conformance suite, the expression parsing rework, and the executer conformance suite — were retired on 2026-08-21, 2026-08-22, 2026-08-24, 2026-08-29 and 2026-09-01. The last of them is **finished but still on disk**: `plans/executer-conformance.md` carries the record of its five stages, and that record only survives its deletion once it has been committed. A plan is a living document: update a stage's status the moment it goes green, along with what was actually installed and any deviation from the intent. When the undertaking is finished the plan is **deleted** — durable outcomes move into `DECISIONS.md` first, git history keeps the rest. A finished plan left lying around gets read as instructions. With nothing running, `plans/` does not exist.

The repository root holds permanent records only; anything temporary lives in `plans/`.

## Commands

| | |
|---|---|
| `npm test` | Vitest in headless Chromium via Playwright — the test gate |
| `npm run test:live` | Vitest in watch mode |
| `npm run test:coverage` | the same, with a v8 coverage report into `coverage/` |
| `npm run build:dev` / `build:prod` | webpack bundles into `dist/` |
| `npm run build` | `test` plus both builds |
| `npm run dev` | dev server against `WebContent/` — a bare page that loads the browser bundle so the library can be tried out in the browser console. It is not a demo and is not meant to display anything; a blank screen is the intended state. |
| `npm run bench` | the benchmarks under `test/PerformanceTests/`, deliberately not part of the gate |
| `npm run build:third-party-licence` | regenerates `LICENSE-OF-THIRD-PARTY` |

## Architecture

- **`src/ExpressionResolver.js`** — the public API. Used statically (`resolve` / `resolveText` with an ad-hoc context) or as an instance within a `parent` chain.
- **Chain and scopes** — every resolver optionally carries a `name` and a `parent`. `${scopeName::expression}` addresses one specific link of the chain; without a scope the resolver's own context applies.
- **Context** — always passes through the proxy from `src/ResolverContextHandle.js`. Writes performed inside an expression land there, not on the original object handed in.
- **Executer** — the pluggable execution strategy. `src/Executer.js` defines the interface (`defaultContext` + `execution`), `src/ExecuterRegistry.js` keeps implementations under a name. Implementations live in `src/executer/`: `WithScopedExecuter` (the default, `with` block), `ContextObjectExecuter`, `ContextDeconstructorExecuter`, and `EsprimaExecuter` (AST-based, via `espree`). Each one exports `EXECUTERNAME` and registers itself on import.
- **`src/CodeCache.js`** — LRU-style cache for compiled expressions, one instance per executer.
- **`src/DefaultValue.js`** — distinguishes "no default passed" from "the default is `undefined`". That is what the `arguments.length` checks in `ExpressionResolver` are for; keep them when changing those signatures.

## Distribution

Three shapes, all listed in `entries.config.json` and bundled into `dist/` by webpack:

| Entry | Bundle | Purpose |
|---|---|---|
| `browser.js` | `browser-…[.min].js` | browser script, executers pre-registered, exposes `GLOBAL.defaultjs.el` |
| `browser-all-executers.js` | `browser-all-executers-…[.min].js` | same, plus the esprima executer |
| `index.js` | `module-…[.min].js` | the ESM entry point — meant as the standard entry for bundlers, not for direct use in a browser |

Importing any entry registers the executers pulled in by `src/executer/index.js`, which leaves out `EsprimaExecuter` on purpose: `espree` inflates the bundle from 11.5 KB to 355.6 KB. That commented-out import is load-bearing, not leftover — see `DECISIONS.md`.

A consumer who wants a non-default executer imports it explicitly; that same import is what makes `setupExecuter(options)` reachable, to tune that executer's behaviour within whatever it allows. This is intended usage, not a leak — check `BACKLOG.md` before adding an `exports` field.

## Conventions

- **Separation of concerns.** A component does its own job and carries no rule on behalf of
  another one: a cache caches, a proxy proxies, and a check lives with the part that needs it.
  Where two parts need the same constant, it is provided centrally rather than duplicated. The
  decision of 2026-08-30 in `DECISIONS.md` carries the case that produced this rule.
- Indent with **tabs** — spaces only in markdown, where nesting is column-based syntax.
- Files are utf-8 with LF endings, a final newline, and no trailing whitespace.
- ESM imports **always carry the `.js` extension** — the sources run untranspiled in the browser.
- Parameter names take an `a`/`an` prefix: `aStatement`, `anExecuter`, `aContext`.
- State lives in private `#` fields, exposed through getters.
- JSDoc on everything public.
- `.editorconfig` and `.gitattributes` carry the rules above in machine-readable form. They
  advise editors and agents; nothing enforces them, because no formatter and no linter is
  configured. Beyond what they cover, follow the style of the surrounding file.
- The spaces inside the template literals of `src/executer/ContextObjectExecuter.js` and
  `ContextDeconstructorExecuter.js` are the indentation of the code this package *generates*.
  They are content, not style — leave them alone when reformatting.

## Tests

Vitest in browser mode, headless Chromium through Playwright — a real browser, because the package targets one and the tests reach for `document`, `window` and `document.location`. Configuration in `vitest.config.mjs`. The reasoning behind the runner choice is in `DECISIONS.md`.

New test files **are** discovered automatically: anything matching `test/**/*Test.js` runs. Shared setup sits in `test/setup.js`, wired in through `setupFiles`; helpers in `test/TestUtils.js`.

Every test file imports what it uses — `import { describe, it, expect, beforeAll, afterAll } from "vitest"`. **`globals: true` is deliberately off** and must stay off: the suite uses the bare identifier `test` as its example of an undefined variable, and one `afterAll` calls `delete global.test`. With globals on, that is Vitest's own `test` function on `window`.

The suite uses `describe` / `it` / `beforeAll` / `afterAll` with `async` functions and the matchers `toBe`, `toBeDefined`, `toBeUndefined`. Keeping that surface narrow is worth something on its own — don't widen it without a reason. Per-suite timeouts go in the options object, `describe(name, { timeout }, fn)`.

## Benchmarks

`test/PerformanceTests/` holds three `*.bench.js` files run by `npm run bench`, never by `npm test` — `include` matches only `test/**/*Test.js`, so a benchmark can never fail the gate. They measure resolution over a chain: `ColdResolve` with the code cache switched off so every call recompiles, `WarmResolve` with it on, `RandomScope` with a context on every link and a randomly chosen name.

Two things about `vitest bench` cost an hour once, verified against 4.1.11 — do not rediscover them:

- **No setup hook runs.** Neither vitest's `beforeAll` nor tinybench's `beforeAll` option is executed for a bench. Setup belongs in the module body, which is why `ChainBuilder.js` exists and why one chain is built and reused across depths.
- **A failing bench reports nothing at all** — no `FAIL`, no error, just a missing result table. If a bench produced no numbers, assume it threw.

Deep-chain numbers are bimodal across runs by a factor of two; see `BACKLOG.md` before drawing conclusions from a single run.
