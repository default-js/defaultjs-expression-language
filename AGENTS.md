# AGENTS.md

## Project

`@default-js/defaultjs-expression-language` — an expression resolver for dynamic content. It resolves `${...}` expressions against a context, similar to JavaScript template literals, but with support for promise results and hierarchic scopes through a resolver chain.

Pure ESM package, **shipped untranspiled**: the sources under `src/` are published as-is, `dist/` additionally holds bundled browser variants. The target environment is the browser.

Part of the `defaultjs-*` family (~20 repositories under `c:\_dev_ws\vscode`). Its only family-internal runtime dependency is `@default-js/defaultjs-common-utils`.

## Vision for v3

v3 is an AI-assisted modernization cycle with four goals:

1. **Modernize the toolchain** — current build and test chain, replace Karma. Roadmap and rationale: `plans/toolchain-modernization.md`.
2. **Raise code quality** — fix existing defects, sharpen the structure. The pluggable executer strategy is the part of this work already begun.
3. **Raise test coverage** — coverage is structurally broken today (see the plan). Repair first, extend afterwards.
4. **Documentation** — for human consumers *and* for AI systems meant to use this package.

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

**No unrequested extras** — no drive-by refactorings, no new dependencies, no additional tooling (formatter, linter, CI, types) without asking. The requested scope is the scope.

**Report findings, and write them down** — a defect noticed along the way goes into `BACKLOG.md` in the same turn it is reported: not at handover, and not into the diff. A session can end without a handover, and anything living only in the conversation is lost when it does.

**No commits, no pushes** — git is available for reading, branches, diffs, and stashes, but `git commit` and `git push` are Frank's to run. Working branch `v3`, main branch `master`.

## Workflow

Sessions end whenever a topic is finished, often without warning. The files under *Records* are the only state that survives; the conversation does not.

0. **Orient** — `BACKLOG.md` is injected automatically at session start by the `SessionStart` hook in `.claude/settings.json`; read it from disk only if that context is missing. Read `DECISIONS.md` before proposing anything about architecture or the public API. Read `plans/toolchain-modernization.md` before touching the build, the tests, or dependencies.
1. **Clarify** — check the request, ask the open questions of intent in one batch before starting.
2. **Plan** — for anything touching more than one file or changing dependencies: goal, affected files, risk, intended verification. Wait for approval. An approved plan that is not implemented straight away becomes a `BACKLOG.md` entry carrying the agreed scope. Small, locally contained changes go straight in.
3. **Implement** — the agreed scope, nothing beside it.
4. **Verify** — `npm test`; if the build is affected, also `npm run build` plus a diff of `dist/` against the previous state. Show the result instead of summarizing it.
5. **Hand over** — what changed, what was deliberately left alone, what is still open. Frank commits.

During the modernization the staging rule from the plan applies on top: secure a baseline, one stage, green, only then the next.

## Records

Split by shape: independent items go in the backlog, settled questions get written down with their reasoning, and an undertaking whose steps depend on each other gets its own plan.

- `BACKLOG.md` — open items, findings, and work that was agreed but not yet implemented. Entries are deleted once done; git history is the archive.
- `DECISIONS.md` — architecture and API decisions with their reasoning. Anything that constrains later work, or that would otherwise be argued a second time, gets an entry.
- `plans/` — one file per ordered undertaking, named after it; currently `plans/toolchain-modernization.md`. A plan is a living document: update a stage's status the moment it goes green, along with what was actually installed and any deviation from the intent. When the undertaking is finished the plan is **deleted** — durable outcomes move into `DECISIONS.md` first, git history keeps the rest. A finished plan left lying around gets read as instructions. With nothing running, `plans/` does not exist.

The repository root holds permanent records only; anything temporary lives in `plans/`.

## Commands

| | |
|---|---|
| `npm test` | Karma headless (Chrome via Puppeteer) — the test gate |
| `npm run test:live` | Karma in watch mode |
| `npm run build:dev` / `build:prod` | webpack bundles into `dist/` |
| `npm run build` | `test` plus both builds |
| `npm run dev` | dev server against `WebContent/` |
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

- Indent with **tabs**.
- ESM imports **always carry the `.js` extension** — the sources run untranspiled in the browser.
- Parameter names take an `a`/`an` prefix: `aStatement`, `anExecuter`, `aContext`.
- State lives in private `#` fields, exposed through getters.
- JSDoc on everything public.
- No formatter and no linter are configured — follow the style of the surrounding file.

## Tests

Jasmine running under Karma. The suite uses only `describe` / `it` / `beforeAll` with `async` functions and the matchers `toBe`, `toBeDefined`, `toBeUndefined`. That restriction is what keeps the planned move away from Karma cheap, so don't widen it without a reason.

New test files are **not discovered automatically**: they have to be listed in the `index.js` of their folder, and that chain runs up to `test/index.js`. Shared setup sits in `test/setup.js`, helpers in `test/TestUtils.js`.
