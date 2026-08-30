# Plan — the executer conformance suite

Agreed 2026-08-30, after the default executer moved to `context-deconstruction-executer` and three
tests of `test/spec/` turned red. The plan is deleted when the undertaking is finished; what
outlives it goes to `DECISIONS.md`.

## Goal

Every executer is its own implementation of one function — *execute an expression against a dynamic
context* — and they are deliberately **not** developed at the same speed. `EsprimaExecuter` is
experimental and does not have to do everything; the other three matter more and will still not
answer identically. The suite has to say, per executer, what it can do today, and it has to notice
by itself when that changes.

Two things follow, and they are the whole plan:

1. **A capability catalogue** — one row per capability, one column per executer, two states. The
   catalogue is the single place where "which executer can what" is written down.
2. **Two groups of tests** — the rules that do not belong to an executer run once; everything that
   executes a statement runs per executer, against the catalogue.

## Terms

| Term | Meaning |
|---|---|
| **Function** | what all executers provide: executing an expression against a dynamic context. One, not many. |
| **Capability** | a point where implementations legitimately differ — the dialect, whether a write persists, whether a global is reachable, whether a nested function sees the context. |
| **Rule** | a statement of `SPECIFICATION.md`. Normative. A rule that names no capability holds for every executer. |

*Specification* stays the right word for the document and for a rule. It is the wrong word for the
per-executer axis: a rule is not something an implementation may decline. That axis is capabilities.

## The catalogue

`test/ExecuterCapabilities.js`. One entry per capability, `supported` or `unsupported` per executer,
and nothing else — **whether an unsupported capability is meant to arrive belongs in `BACKLOG.md`**,
not in the table (decided by Frank, 2026-08-30).

```javascript
{
	id: "context/write-back",
	spec: "6.5",
	description: "a write from an expression is readable from the context afterwards",
	state: {
		[WithScopedExecuterName]:           SUPPORTED,
		[ContextObjectExecuterName]:        SUPPORTED,
		[ContextDeconstructorExecuterName]: UNSUPPORTED,
		[EsprimaExecuterName]:              UNSUPPORTED
	}
}
```

`supported` runs the test as `it`, `unsupported` as `it.fails`. Both directions are guarded: a
capability that stops working turns the gate red, and one that *starts* working turns it red as
well, with `Expect test to fail` — which is exactly how the switch of the default executer
announced itself. The table cannot claim a state the code does not have.

`it.fails` only says "this does not pass". Where what the executer answers *instead* is known and
worth pinning — `${ Math.round(1.5) }` staying in the text under `esprima-executer` — that gets an
ordinary positive test in the executer's own file, next to the marker. The marker is the record of
the state, the positive test is the record of the behaviour.

The dialect is not a boolean and stays what it is today: `variableName` on the executer entry,
`value` for three of them and `ctx.value` for `ContextObjectExecuter`.

The initial rows come out of what the suite already pins — the `FREEDOMS` table of
`test/spec/ExecuterTest.js`, the `leaksToday` switch of `ContextTest.js`, and the executer entries
of `BACKLOG.md`. The final set is whatever stage 2 needs; it is not decided up front.

## Stages

Baseline first, then one stage at a time, `npm test` green before the next one starts.

### Stage 0 — green baseline *(status: one of three done)*

Three failures, three unrelated causes:

- ~~`test/spec/ChainTest.js:229`~~ — **done by Frank on 2026-08-30**, before the plan was approved:
  the constructor no longer reads `this.#executer.defaultContext` for a missing `context` option.
  His decision behind it: **a resolver without a context has no context**, so 5.5 stands and 4.2/6.3
  move instead. The redefinition of `defaultContext` towards a global context is his, is not part of
  this plan, and is carried in `BACKLOG.md`. The change took the shared-default-context defect with
  it. Verified: 2 failed | 482 passed | 8 expected fail.
  In the same line, also **done by Frank on 2026-08-30**: the parameter default `= {}` is back, so
  `new ExpressionResolver()` builds an empty resolver again instead of throwing a `TypeError` on the
  destructuring. Still open here: no test covers the bare call, which is why the gate stayed green
  through both directions of that change. The test belongs to this stage.
- `test/spec/EntryPointTest.js:133` — `${counter++} ${counter++}` proves "every occurrence is
  evaluated on its own" only where a write persists, which is a capability, not the rule. Replaced
  by a counting getter in the context; verified 2026-08-30 to answer `"0 1"` under all four
  executers, so the rule is pinned without borrowing a capability.
- `test/spec/ExecuterTest.js:128` — the `it.fails` marker on the default executer goes. With it:
  `SPECIFICATION.md` 8.2 (the *Open* note) and its section 10 row, the `BACKLOG.md` entry, and a
  `CHANGELOG.md` entry — the default executer changing is the most consumer-visible part of the
  release after the error policy, and it carries the migration note that `${ counter++ }` no longer
  persists.

Files: `src/ExpressionResolver.js`, `test/spec/ChainTest.js`, `test/spec/EntryPointTest.js`,
`test/spec/ExecuterTest.js`, `SPECIFICATION.md`, `CHANGELOG.md`, `BACKLOG.md`.

### Stage 1 — the catalogue *(status: not started)*

`test/ExecuterCapabilities.js`: `EXECUTERS` moves here from `test/TestUtils.js` — name, dialect,
`setupExecuter` — and gains the capability rows, the two states and the `capabilityIt` helper.
`TestUtils.js` keeps the helpers that are not the catalogue (`catchError`, the resolver factories).
No test changes its expectation in this stage.

Files: `test/ExecuterCapabilities.js` (new), `test/TestUtils.js`, the 6 spec files and 3 general
files that import `EXECUTERS`, the 4 bench files.

### Stage 2 — the per-executer suite *(status: not started)*

`test/executer/<executer-name>/`, one directory per executer. Shared, parametrized suites carry the
rules that every executer has to answer; each executer's directory holds what only it has. Every
case that a capability decides is written through `capabilityIt`.

Moves out of `test/spec/`: `ChainTest` 5.2–5.4, `ContextTest` 6.1, 6.2, 6.3, 6.5, `ErrorTest` 7 (both
halves), `ExecuterTest` 8.3.

### Stage 3 — the general suite *(status: not started)*

`test/spec/` keeps what does not belong to an executer: 3 (syntax and parsing), 4 (entry points),
5.1 and 5.5 (chain structure and inspection), 6.6 (reading and writing from outside), 9 (public
surface). It runs once, against `ExpressionResolver.defaultExecuter`, and takes the spelling of a
context name from the catalogue instead of assuming a bare name — otherwise this half breaks again
at the next change of default.

**Which group a rule belongs to is declared in the catalogue, not implied by the directory.** That
is the lesson of `ChainTest.js:229`: the test counted as executer-independent until the constructor
made it otherwise, and nothing but luck made that visible.

### Stage 4 — the old executer tests *(status: not started)*

`test/ExecuterTests/` (13 files, `WithScopedExecuter` 5, `ContextObjectExecuter` 0) is dissolved into
`test/executer/<name>/`. Anything it pins that the new suite does not is carried over first; the
directory is deleted once nothing is left in it. To be dissolved as well, or kept: `test/general/`
holds three files that are per-executer in nature (`ContextShapeTest`, `SetupExecuterTest`,
`StackedContextTest`) — decided while the stage runs.

### Stage 5 — records *(status: not started)*

`SPECIFICATION.md` 8.2 and 8.3 get the capability table the catalogue holds, so the document and the
suite say the same thing. `DECISIONS.md` gets the mechanism and the vocabulary. `CHANGELOG.md` gets
whatever of stages 2–4 reaches a consumer, which should be nothing beyond stage 0.

## Risks

- **Silent loss of coverage while tests move.** Count the tests before and after every stage and
  account for the difference; a moved test that quietly stopped running is the failure mode of this
  whole undertaking.
- **`it.fails` as a false green.** A test can fail for a reason other than the missing capability.
  Mitigated by the positive test next to the marker, wherever the alternative behaviour is known.
- **The default-executer swap in the general suite.** `ExpressionResolver.defaultExecuter` is
  global state; the general suite may only set it in `beforeAll` and must restore it in `afterAll`.
  Vitest isolates each file in its own iframe, so this stays inside one file.
- **Run time.** 492 cases in 9.66 s today, of which 8.5 s is setup. Stage 2 multiplies part of the
  suite by four; if the gate goes past roughly half a minute, the split between the two groups is
  drawn wrong.

## Out of scope

The redefinition of the executers' `defaultContext` towards a global context (Frank's, in
`BACKLOG.md`), the write-back for `ContextDeconstructorExecuter`, the name check moving out of
`ResolverContextHandle`, and every other open item. This plan writes down what is, it does not
change what the executers can do.
