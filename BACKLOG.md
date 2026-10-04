# Backlog

Every open task of `@default-js/defaultjs-expression-language`: defects, open decisions, agreed
work, ideas, and the status of the v3 goals. If it is to be done, it is here and nowhere else.
Settled questions and their reasoning are in `DECISIONS.md`, what the resolver is meant to do is in
`SPECIFICATION.md`.

## How this file works

- **One entry per item**, independent of the others. An undertaking whose steps depend on each
  other gets a plan under `plans/` instead, and its entry here points at it.
- **Written the moment an item comes up**, not at handover — a session can end at any point.
- **Only the current state.** An entry says what is wrong or undecided, what is known, and what
  happens next. How it got there is in git history; why a decision fell is in `DECISIONS.md`.
- **Deleted once done**, together with its row in the overview. IDs are never reused.
- **Titles are addresses.** Test comments point at entries by title, so a title is not reworded
  without updating them — `grep` for it first.
- Anything that affects consumers additionally belongs in the
  [issue tracker](https://github.com/default-js/defaultjs-expression-language/issues); that call is
  Frank's.

Each entry carries these fields; the ones that do not apply are left out.

| Field | Meaning |
| --- | --- |
| **Status** | `decision` — needs a decision, which is Frank's · `agreed` — decided, ready to implement · `investigate` — the facts are not complete yet · `idea` — raised, not agreed |
| **Kind** | `defect` · `gap` (behaviour nobody has specified) · `executer` (something one executer does not do, and might) · `feature` · `refactor` · `docs` · `bench` · `test` · `tooling` |
| **Blocks 3.0.0** | `yes` where the release has to wait for it |
| **Priority** | `low` — taken up after everything without it, with the reason; left out means normal |
| **Spec** | the section of `SPECIFICATION.md` that is the target |
| **Pinned by** | the test that marks the item, if any |
| **Records** | what else moves when it is closed: `CHANGELOG.md`, `DECISIONS.md`, `SPECIFICATION.md` |

**`Blocks 3.0.0` is the release gate.** `SPECIFICATION.md` is written as though every rule in it
holds and carries no index of what is missing, so this marker is the only place that says a rule is
not kept yet. Adding a rule to the specification without either implementing it or opening an entry
with the marker here is how the gate gets lost.

## v3 goals

The intent of each goal is in `AGENTS.md`; this is where they stand.

| # | Goal | Status | Open entries |
| --- | --- | --- | --- |
| 1 | Modernize the toolchain | done 2026-08-21 — webpack 5.109, Vitest in Chromium, `npm audit` at 0 (again on 2026-09-30) | — |
| 2 | Raise code quality | done 2026-10-03 — no `defect` and no `Blocks 3.0.0` entry open | — |
| 3 | Raise test coverage | largely done | B-30 |
| 4 | Documentation | `SPECIFICATION.md`, `README.md` and the JSDoc written; the specification reviewed | — |
| 5 | Do not lose performance | standing rule, see `AGENTS.md` | B-68, B-47, B-25, B-26 |

**Markers, counted 2026-10-03** (`npm test`: 342 passed, 342 cases). No `it.fails` is left and no
entry blocks 3.0.0. **No release carries an `it.fails`** (`DECISIONS.md`, 2026-09-27). No
executer's suite carries one: it tests what that executer guarantees, and what it does not do is
documented in `README.md` rather than pinned (`DECISIONS.md`, 2026-09-26).

## Overview

| ID | Title | Status | Kind | 3.0.0 | Prio |
| --- | --- | --- | --- | --- | --- |
| B-57 | The context proxy intercepts six operations, and every other one meets an empty target | idea | gap | | |
| B-58 | `buildSecure` is removed in 4.0 | agreed | refactor | | low |
| B-65 | What the copy of `buildFiltered` keeps of the context is not specified | idea | gap | | |
| B-68 | A static call snapshots every name of its context before it resolves | idea | refactor | | |
| B-69 | The decision on the inherited executer still argues from the executer a prefix used to run with | idea | docs | | |
| B-13 | Should the `ctx` prefix of `ContextObjectExecuter` be configurable? | idea | feature | | |
| B-25 | The deep-chain benchmarks are bimodal by a factor of two | investigate | bench | | |
| B-26 | No benchmark exercises the cache eviction | idea | bench | | |
| B-30 | Coverage, and what is still uncovered | investigate | test | | |
| B-47 | `readExpression` allocates a stack array for every expression | idea | refactor | | |

---

## Release blockers

None open.

## Resolver

### B-57 · The context proxy intercepts six operations, and every other one meets an empty target

- **Status:** idea — moved here on 2026-10-03 from a `TODO` in `src/ResolverContextHandle.js`
  ("need to support the other proxy actions"), since a published file carries no open work
- **Kind:** gap · **Spec:** 6.1

The proxy a context hands out traps `has`, `get`, `set`, `deleteProperty`,
`getOwnPropertyDescriptor` and `ownKeys`. Every other operation — `Object.defineProperty`,
`Object.getPrototypeOf`, `Object.setPrototypeOf`, `Object.isExtensible`,
`Object.preventExtensions` — reaches the empty object the proxy stands over, not the chain; the
changelog states this for three of them. 6.1 says nothing about these operations. Open: which of
them a context should answer for the chain, and what that costs, before anything is trapped.

### B-58 · `buildSecure` is removed in 4.0

- **Status:** agreed — Frank's decision of 2026-10-01
- **Kind:** refactor · **Priority:** low — due with 4.0, nothing before it
- **Spec:** 6.7
- **Records:** `CHANGELOG.md`, `README.md`, `SPECIFICATION.md`, `DECISIONS.md`

`ExpressionResolver.buildSecure` is a silent alias of `buildFiltered`, deprecated in 3.0.0. It goes
in 4.0, not earlier (`DECISIONS.md`, 2026-10-01). Since 2026-10-03 no published file names that
version, so the changelog of 4.0 is the first place a consumer reads it. With it go the alias in
`src/ExpressionResolver.js`, its rows in `README.md`, its cases in `test/package/surface.Test.js`
and `test/expressionresolver/buildfiltered.Test.js`, and the sentence in 6.7.

### B-65 · What the copy of `buildFiltered` keeps of the context is not specified

- **Status:** idea — found 2026-10-03 reading `filter` of `@default-js/defaultjs-common-utils`, not
  probed
- **Kind:** gap · **Spec:** 6.7

6.7 says only that `buildFiltered` builds over a filtered copy. `ObjectUtils.filter` walks the
context with `for … in` into a new plain object, which decides more than the specification says: a
symbol key never reaches the copy, a non-enumerable member — the methods and getters of a class
among them — is dropped, an enumerable getter is read once while the copy is built and its value
kept, and the copy has no prototype of the context's class. Open: which of these 6.7 states, and
whether each needs a case in `test/expressionresolver/buildfiltered.Test.js`.

### B-68 · A static call snapshots every name of its context before it resolves

- **Status:** idea — measured 2026-10-04 with `test/PerformanceTests/StaticShare.bench.js`, one run,
  not profiled
- **Kind:** refactor · **Spec:** 4.1, 6.2

The resolver a static entry point builds takes the name snapshot of 6.2 over the whole context and
its prototype chain, and is dropped after one resolution. Under `TestExecuter`, hz: `resolve` as an
instance call 2.82M, static over 2 keys 1.11M, static over 1,000 keys 21.9k — about 45 µs a call,
growing with the keys; `resolveText` 1.74M, 576k and 18.4k. Presumably the `Map` of
`#buildNameCache`; confirm before changing anything. Candidate: build the snapshot on the first
lookup. Open with it: whether 6.2 still holds when the snapshot is taken later — a key added to the
object during the delay of 4.5 would then count.

### B-69 · The decision on the inherited executer still argues from the executer a prefix used to run with

- **Status:** idea — found 2026-10-04 while closing B-66
- **Kind:** docs · **Records:** `DECISIONS.md`

The reasoning of "Which executer does a resolver use when the `executer` option is left out?"
(2026-09-22) says a scoped statement runs with the executer of the resolver the call was made on and
cites `src/ExpressionResolver.js:84-89`. Since 2026-10-03 it runs with the executer of the resolver
it addresses, and the cited lines are gone. The decision itself stands; that bullet is to be rewritten
to the state in force, as the header of `DECISIONS.md` asks — Frank's call, since the entry is his.

## Executers

### B-13 · Should the `ctx` prefix of `ContextObjectExecuter` be configurable?

- **Status:** idea — raised by Frank 2026-08-24
- **Kind:** feature · **Spec:** 9.3
- **Records:** `DECISIONS.md`, `CHANGELOG.md`

The executer hands the context over as `ctx`, so a value is addressed as `${ctx.value}` — settled
and intended (`DECISIONS.md`, 2026-08-24). But the identifier is hard-coded, and a context carrying
a property named `ctx` has no way out. Open with it: whether the option belongs on
`setupExecuter(options)` next to `size`, and what happens to the code cache, which is keyed by the
statement text alone — entries compiled under the old identifier would answer for the new one.

## Benchmarks

### B-47 · `readExpression` allocates a stack array for every expression

- **Status:** idea — left over from B-45, unmeasured
- **Kind:** refactor · **Spec:** 3.1

`readExpression` in `src/ExpressionScanner.js` starts every expression with `const stack = [CODE]`
and pushes for every `{`, although most expressions never nest. Candidates: a depth counter for
code and a stack only once a literal opens, or one array reused across the expressions of a text.
To be measured with `ResolveTextShare`, old and new alternating (`DECISIONS.md`, 2026-09-27, "Does
`resolveText` scan and replace in one pass?"): scanning is a small share of the resolver's work,
so the gain is bounded by it.

### B-25 · The deep-chain benchmarks are bimodal by a factor of two across runs

- **Status:** investigate — cause unknown
- **Kind:** bench

At depths 100 000 and 1 000 000 a bench **file** settles into one of two modes and stays there:
about 6.4 ms / 64 ms, or 12.9 ms / 130 ms, each with an rme under 3 %. Depths 10 and 1 000 are stable.
The mode is decided per file, not per run, so two files of the same run cannot be compared either —
a recorded number has to name its mode, and a single run is never compared against a single earlier
one. Looks like a JIT or GC state decided early. Check whether it also happens outside the browser
runner.

**A lead from 2026-10-03:** which files share a run decides at least part of it. At depth 100 000
the warm row of `context-deconstruction-executer` took 11.5–22.4 ms when `ColdResolve.bench.js` ran
before it in the same `vitest bench` call, and 7.2–8.8 ms with `WarmResolve.bench.js` alone — the
first is slower than the cold row of the same call, 2.2–2.3 ms, which recompiles on every iteration.
Under the sources of `4cc573e` the pairing made no difference, 7.9–9.1 against 7.8–8.2. Until this
is understood, both sides of a comparison run the same set of files.

A full `npm run bench` showed it again the same day, on two sources that differ in no measured path:
the deep rows of `WarmResolve.bench.js` landed in a slow mode — `context-deconstruction-executer` at
depth 1 000 000 about 240 ms — or a fast one of about 70 ms, a factor of three, and the mode changed
between runs of the same side. `WarmResolve.bench.js` alone put both sides level, 0.91–1.06. A deep
`WarmResolve` row from a full run is therefore no evidence for or against a change; run the file on
its own.

### B-26 · No benchmark exercises the cache eviction, the one thing `CodeCache` now does differently

- **Status:** idea
- **Kind:** bench

All bench files stay far below the 5000 entries of the cache, so `#trim()` never runs and the switch
from write-time to use-time eviction (2026-08-21) is invisible to `npm run bench`. A bench that fills
past `size` and then measures the hit rate on a hot subset would show it and give the eviction order
a regression guard beyond `test/codecache/caching.Test.js`.

## Tests

### B-30 · Coverage, and what is still uncovered

- **Status:** investigate — none of it is a missing test for a rule
- **Kind:** test

Measured 2026-09-28 with `npm run test:coverage`, 320 cases: statements **95.31 %** (590/619),
branches **95.46 %** (316/331), functions **93.20 %** (96/103), lines **96.60 %** (512/530), after
`EsprimaExecuter` was removed. Update these
numbers when the picture changes rather than adding another baseline. Uncovered lines:

1. `stringToHashcode` in `src/Utils.js`. Nothing imports it; it stays, deliberately without a test
   (Frank, 2026-09-27).
2. The `setDebug` body of `ContextDeconstructorExecuter.js`. The surface
   test asserts it exists and deliberately never flips them: a debug switch has nothing observable.
3. `set` and `delete` of `createGlobalNameCache` in `ResolverContextHandle.js`. A global context
   is not proxied since 2026-08-30, so nothing routes a write through the wrapper — check whether
   the two methods still have a caller before covering them.
4. `get parent` and `replaceData` of `ResolverContextHandle`. The handle is internal (`DECISIONS.md`,
   2026-09-30), so check whether anything reaches them before covering them.
5. **New on 2026-09-22:** the `return null` of `findPropertyDescriptor`, and the `get` of the
   descriptor the `getOwnPropertyDescriptor` trap hands out, which no case ever calls. Look at both
   before deciding whether they are reachable.

`src/version.js` is generated; its 0 % is noise. The 15 open branches sit in the scanner's state
machine — combinations of literal states — and in the lines listed above; none is a rule without a
test.
