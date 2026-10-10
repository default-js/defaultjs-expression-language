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
| B-30 | Are the uncovered lines of `ResolverContextHandle` dead code? | investigate | refactor | | |
| B-13 | Should the `ctx` prefix of `ContextObjectExecuter` be configurable? | agreed | feature | | |
| B-70 | `context-object-executer` binds `context` beside `ctx` | agreed | gap | | |
| B-71 | `context-deconstruction-executer` and `with-scoped-executer` bind `context` | decision | gap | | |
| B-72 | Every executer binds `arguments` | decision | gap | | |

---

## Release blockers

None open.

## Resolver

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

- **Status:** agreed — Frank's decision and implementation of 2026-10-04, unfinished
- **Kind:** feature · **Spec:** 9.3
- **Pinned by:** the two cases on the name `setupExecuter` sets in
  `test/executer/context-object/context.Test.js`, and "exports getContextVar" in its
  `interface.Test.js`
- **Records:** `DECISIONS.md` — JSDoc, `README.md`, `CHANGELOG.md`, 8, 9.2, 9.3 and the decision of
  2026-10-04 are written

What the option does and why is in `DECISIONS.md`, 2026-10-04. Open:

1. **A regression on the hot path.** `getOrCreateFunction` keys the code cache by
   `${CONTEXT_VAR}::${aStatement}`, built by concatenation on every execution, a cache hit
   included. Measured 2026-10-04, `HEAD` against the change, four pairs, strictly alternating with
   the order swapped, depth 10 and `ResolveText`, change/head per pair:

   | Bench | `context-object` | controls: the other two executers |
   | --- | --- | --- |
   | `ResolveText`, 20 distinct | 0.87–0.90 | 0.96–1.06 |
   | `ResolveText`, one expression 20 times | 0.81–0.88 | 0.96–1.01 |
   | `ResolveText`, literals | 0.89–0.95 | 0.99–1.02 |
   | `ResolveText`, no expression | 0.98–1.03 | 0.98–1.03 |
   | `WarmResolve` | 0.88–0.97 | 0.92–1.07 |
   | `ColdResolve`, both shapes | 0.98–1.03 | 0.98–1.09, one run 0.25 |

   The alternative, measured the same way against `HEAD`: the statement alone as the key, and
   `setupExecuter` clears the cache where it changes the name. It comes out level — `ResolveText`
   0.98–1.13, `WarmResolve` 0.94–1.01, `ColdResolve` 0.94–1.01, the controls 0.92–1.09 — and
   `test/executer/context-object/` is green under it, 17 of 17. Next: Frank picks; the decision
   of 2026-10-04 then gets the cache and its numbers.
2. The guarantees `README.md` states are pinned only in part: that an option left out, `null`,
   `undefined` and a blank string leave the name as it is, that a value that is not a string is a
   `TypeError`, and what `getContextVar()` answers have no case.
3. Line 67 of `src/executer/ContextObjectExecuter.js` carries trailing whitespace.

### B-70 · `context-object-executer` binds `context` beside `ctx`

- **Status:** agreed — Frank's implementation of 2026-10-10, not measured yet
- **Kind:** gap · **Spec:** 9.2
- **Pinned by:** "reaches a global named context" in `test/executer/context-object/globals.Test.js`
- **Records:** `CHANGELOG.md` is written; `README.md` needs nothing, it already says every global is
  reachable

`generate` in `src/executer/ContextObjectExecuter.js` names the parameter of the outer function
after the inner one and calls the inner one with it, so `context` is bound nowhere. The case failed
against a copy of `HEAD`, answering the context object, and passes against the change; `npm test`
346 of 346. Open: `npm run bench`, `HEAD` against the change, since the compiled code changed.
Level, and the entry is deleted.

### B-71 · `context-deconstruction-executer` and `with-scoped-executer` bind `context`

- **Status:** decision — found 2026-10-10 while checking B-70
- **Kind:** gap · **Spec:** 9.2
- **Records:** `README.md`

Both compile an outer function whose parameter is named `context`, and `with-scoped-executer` takes
the context under that name in its inner function as well. A name the context does not carry falls
through to that parameter before it reaches the global object: over `{ known: 1 }`, `${context}`
answers the context object under both, and a global named `context` is not reached by its bare name
(checked 2026-10-10), although `README.md` says a name the chain does not carry falls through to the
global object. Next: decide whether the generated code changes — measured with `npm run bench` — or
`README.md` names `context` for both.

### B-72 · Every executer binds `arguments`

- **Status:** decision — found 2026-10-10 while checking B-70
- **Kind:** gap · **Spec:** 9.2
- **Records:** `README.md`

All three run the statement in an arrow function inside a function built by `new Function`. An arrow
function has no `arguments` of its own, so the statement sees the outer one's, and `arguments[0]` is
the context: over `{ known: 1 }`, `${arguments[0].known}` answers `1` under each executer (checked
2026-10-10, after the change of B-70). No global is shadowed, since a browser has no global
`arguments`, but it is a name for the context that `README.md` does not give. Next: decide whether
`README.md` names it or the generated code changes.
