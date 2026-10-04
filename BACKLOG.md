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
| 5 | Do not lose performance | standing rule, see `AGENTS.md` | — |

**Markers, counted 2026-10-03** (`npm test`: 342 passed, 342 cases). No `it.fails` is left and no
entry blocks 3.0.0. **No release carries an `it.fails`** (`DECISIONS.md`, 2026-09-27). No
executer's suite carries one: it tests what that executer guarantees, and what it does not do is
documented in `README.md` rather than pinned (`DECISIONS.md`, 2026-09-26).

## Overview

| ID | Title | Status | Kind | 3.0.0 | Prio |
| --- | --- | --- | --- | --- | --- |
| B-58 | `buildSecure` is removed in 4.0 | agreed | refactor | | low |
| B-69 | The decision on the inherited executer still argues from the executer a prefix used to run with | idea | docs | | |
| B-30 | Are the uncovered lines of `ResolverContextHandle` dead code? | investigate | refactor | | |
| B-13 | Should the `ctx` prefix of `ContextObjectExecuter` be configurable? | idea | feature | | |

---

## Release blockers

None open.

## Resolver

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

### B-69 · The decision on the inherited executer still argues from the executer a prefix used to run with

- **Status:** idea — found 2026-10-04 while closing B-66
- **Kind:** docs · **Records:** `DECISIONS.md`

The reasoning of "Which executer does a resolver use when the `executer` option is left out?"
(2026-09-22) says a scoped statement runs with the executer of the resolver the call was made on and
cites `src/ExpressionResolver.js:84-89`. Since 2026-10-03 it runs with the executer of the resolver
it addresses, and the cited lines are gone. The decision itself stands; that bullet is to be rewritten
to the state in force, as the header of `DECISIONS.md` asks — Frank's call, since the entry is his.

### B-30 · Are the uncovered lines of `ResolverContextHandle` dead code?

- **Status:** investigate
- **Kind:** refactor

`npm run test:coverage` leaves lines of `src/ResolverContextHandle.js` uncovered that no rule asks
for. Each is checked for a caller; what has none is deleted rather than covered.

1. `set` and `delete` of `createGlobalNameCache` — a global context is not proxied since 2026-08-30,
   so nothing seems to route a write through the wrapper.
2. `get parent` and `replaceData` of `ResolverContextHandle`, which is internal (`DECISIONS.md`,
   2026-09-30).
3. The `return null` of `findPropertyDescriptor`, and the `get` of the descriptor the
   `getOwnPropertyDescriptor` trap hands out.

Not part of it: `stringToHashcode` in `src/Utils.js` stays, without a test (Frank, 2026-09-27), and
the `setDebug` body of `ContextDeconstructorExecuter.js` has nothing observable to test.

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
