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
| 1 | Modernize the toolchain | done 2026-08-21 — webpack 5.109, Vitest in Chromium, `npm audit` at 0 on 2026-09-30, 5 since 2026-10-10, all of the `braces` chain | — |
| 2 | Raise code quality | done 2026-10-03 — no `defect` and no `Blocks 3.0.0` entry open | — |
| 3 | Raise test coverage | done 2026-10-10 — no entry open. Uncovered on purpose: `get parent` of `ResolverContextHandle` and `set`/`delete` of `createGlobalNameCache` (Frank, 2026-10-10), `stringToHashcode` in `src/Utils.js` (Frank, 2026-09-27), the body of `setDebug` in `ContextDeconstructorExecuter.js`, which has nothing observable | — |
| 4 | Documentation | `SPECIFICATION.md`, `README.md` and the JSDoc written; the specification reviewed; type declarations generated from the JSDoc since 2026-10-10 | — |
| 5 | Do not lose performance | standing rule, see `AGENTS.md` | — |

**Markers, counted 2026-10-03** (`npm test`: 342 passed, 342 cases). No `it.fails` is left and no
entry blocks 3.0.0. **No release carries an `it.fails`** (`DECISIONS.md`, 2026-09-27). No
executer's suite carries one: it tests what that executer guarantees, and what it does not do is
documented in `README.md` rather than pinned (`DECISIONS.md`, 2026-09-26).

## Overview

| ID | Title | Status | Kind | 3.0.0 | Prio |
| --- | --- | --- | --- | --- | --- |

---

## Release blockers

None open.

## Resolver

None open.

## Executers

None open.
