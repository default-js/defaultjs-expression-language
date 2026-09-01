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

### Stage 0 — green baseline *(status: done, 2026-09-01)*

Three failures, three unrelated causes. Test count 492 before, 493 after — one case added, none
lost. Gate after the stage: 23 files, 485 passed, 8 expected fail.

- ~~`test/spec/ChainTest.js:229`~~ — **done by Frank on 2026-08-30**, before the plan was approved:
  the constructor no longer reads `this.#executer.defaultContext` for a missing `context` option.
  His decision behind it: **a resolver without a context has no context**, so 5.5 stands and 4.2/6.3
  move instead. The redefinition of `defaultContext` towards a global context is his, is not part of
  this plan, and is carried in `BACKLOG.md`. The change took the shared-default-context defect with
  it. Verified: 2 failed | 482 passed | 8 expected fail.
  In the same line, also **done by Frank on 2026-08-30**: the parameter default `= {}` is back, so
  `new ExpressionResolver()` builds an empty resolver again instead of throwing a `TypeError` on the
  destructuring. ~~Still open here: no test covers the bare call~~ — **done 2026-09-01**:
  `EntryPointTest.js`, 4.2, *takes no options at all*. Seen failing for the right reason first, with
  the parameter default removed again: `TypeError: Cannot destructure property 'context' of
  'undefined'`. It pins the bare call and its result, not what an omitted `context` means — that is
  6.3 and belongs to Frank's redefinition.
- ~~`test/spec/EntryPointTest.js:133`~~ — **done 2026-09-01.** `${counter++} ${counter++}` proves
  "every occurrence is evaluated on its own" only where a write persists, which is a capability, not
  the rule. Replaced by a counting getter in the context. Verified against all four executers by a
  throwaway case before the comment was written: each answers `"0 1"` and reads the getter exactly
  twice.
- ~~`test/spec/ExecuterTest.js:128`~~ — **done 2026-09-01.** The `it.fails` marker on the default
  executer is gone. With it: `SPECIFICATION.md` 8.2 lost the *Open* note and now states the
  deconstructor as the default, section 10 lost its row, the `BACKLOG.md` entry is deleted and its
  back-reference in the benchmark entry rewritten, and `CHANGELOG.md` carries the switch with the
  migration note that `${ counter++ }` no longer persists. **Beyond the plan's file list:**
  `DECISIONS.md` got the decision itself (2026-09-01) — the deleted backlog entry demanded that
  outcome be recorded there, and deleting it without writing the reasoning down would have lost why
  `with` is being retired and why the deconstructor won over the faster `context-object-executer`.

Files: `src/ExpressionResolver.js`, `test/spec/ChainTest.js`, `test/spec/EntryPointTest.js`,
`test/spec/ExecuterTest.js`, `SPECIFICATION.md`, `CHANGELOG.md`, `BACKLOG.md`, `DECISIONS.md`.

### Stage 1 — the catalogue *(status: done, 2026-09-01)*

`test/ExecuterCapabilities.js` now holds `EXECUTERS` — name, dialect, `setupExecuter`, moved out of
`test/TestUtils.js` unchanged — the two states, three capability rows, and the helpers
`capabilityState`, `supports` and `capabilityIt`. `TestUtils.js` keeps what is not the catalogue:
`catchError` and the three resolver factories. Test count 493 before and after, no expectation
changed.

What the catalogue took over, and how:

- `global/reachable` and `context/write-back` replace the `FREEDOMS` table of `ExecuterTest.js`.
  Read through `supports`, not `capabilityIt`, because those cases are written positively with a
  branched expectation — the marker form comes in stage 2, when they move.
- `context/no-global-write` replaces the `leaksToday` switch of `ContextTest.js`, read through
  `capabilityIt`: those cases already use `it.fails`, and the two states map onto it exactly.
- Deliberately **not** listed yet: whether a statement can execute an assignment at all, and
  whether a context value survives into a nested function — both from the executer entries of
  `BACKLOG.md`, both true today only of `esprima-executer`. No case asks either of them under all
  four executers, and a row nothing reads is a state claimed without cover. Stage 2 adds each row
  together with the case that reads it. The file header names both so they are not lost.
- The four bench files follow the import. `npm test` never runs them and a broken bench reports
  nothing at all rather than failing, so `npm run bench` was run: all four files produced their
  tables under all four executers.
- The wiring was verified rather than assumed: two rows were flipped on purpose and the gate
  answered in both directions — `Expect test to fail` where a row understated what the executer
  can do, an ordinary assertion failure where it overstated it. Restored afterwards.

### Stage 2 — the per-executer suite *(status: done, 2026-09-01)*

`test/executer/` holds it, in three kinds of file:

- `shared/ChainRules.js`, `ContextRules.js`, `ErrorRules.js`, `ExecuterRules.js` — one exported
  function each, taking an entry of `EXECUTERS` and opening the `describe` blocks for it. They are
  not named `*Test.js`, so they never run on their own; nothing is discovered twice.
- `<executer-name>/ConformanceTest.js`, one per executer, which calls all four. It takes its
  catalogue entry through `executerEntry(EXECUTERNAME)`, and the name comes from the executer's own
  module rather than as a string — that import is also what registers the implementation, so a file
  cannot address one that does not exist. `executerEntry` throws on an unknown name: a suite that
  silently got nothing would report no cases at all and read as a clean run.
- `<executer-name>/OwnBehaviourTest.js` where an unsupported capability has a known answer worth
  pinning — `esprima-executer` (3 cases: the global, the assignment and the nested function all
  leave their expression standing in the text) and `context-deconstruction-executer` (2: the write
  answers but does not persist, and `${ counter++ }` twice answers `0 0`).

Count: 493 → 505, and every case is accounted for.

- 120 moved unchanged out of `test/spec/`: 13 chain, 8 context, 5 error and 4 executer cases, each
  times four executers.
- 1 moved out of 8.2 into the esprima directory — the assignment it cannot execute.
- 12 are new: `statement/assignment` and `context/nested-function` add 4 each, the two
  `OwnBehaviourTest.js` files add 3 and 2, minus the one that moved rather than appeared.
- `expected fail` 8 → 13, all five of them esprima or the deconstructor: the two capabilities that
  were positive tests with a branched expectation now run through `capabilityIt`, which is the form
  the plan asks for, and the two new rows add their own.

Three decisions taken while the stage ran:

- **The dialect stays out of the catalogue**, as agreed, and both of its cases live in
  `ExecuterRules.js` branched on `variableName`: the spelling the catalogue hands out resolves, and
  where an executer demands a prefix, the bare name does not. That keeps the old
  `only context-object-executer demands the ctx prefix` block intact without a second table.
- **No positive counter-test for `context/no-global-write`.** The other markers describe conformant
  behaviour, so pinning what happens instead is worth it. This one describes a defect that
  `BACKLOG.md` carries, and a positive test would pin the leak — the marker guards both directions
  on its own.
- **8.1, the registration half of 8.2 and the tuning of 8.4 stayed in `test/spec/ExecuterTest.js`**,
  because stage 2 is scoped to 8.3. 8.4 is per-executer in nature — it calls `setupExecuter` on each
  module — so stage 3 has to decide whether it belongs here or in the general suite.

Run time 9.55 s over 29 files, against 8.6 s over 23 before, so the split is drawn about right.

### Stage 3 — the general suite *(status: done, 2026-09-01)*

`test/spec/` keeps what does not belong to an executer, and both halves of the stage are in place.

**The spelling comes from the catalogue.** `defaultExecuterEntry()` answers the entry of whatever
`ExpressionResolver.defaultExecuter` is, found by identity against the registry — a resolver knows
its executer as an object, not by name. `SyntaxTest`, `EntryPointTest`, `ContextTest` and
`ErrorTest` take their `variableName` from it. Statements over literals are written as they stand,
and where a case names its own executer (the deconstructor in 4.2, `context-object` in 6.7) the
dialect of *that* executer stays, with a note saying why.

Verified rather than assumed: with the default swapped to `context-object-executer` in
`src/ExpressionResolver.js`, `test/spec/` answers **1 failed | 171 passed | 6 expected fail**, and
the one failure is the case that pins the default by name — which is exactly what it is for. Before
this stage the same swap took most of the suite with it. The swap was reverted, `src/` is unchanged.

**The group of a rule is declared, not implied.** `RULE_GROUPS` in the catalogue maps every section
of `SPECIFICATION.md` to `general`, `per-executer` or `both`, and `sectionsOf(aGroup)` reads it.
Each shared suite declares the sections it opens as `SECTIONS`, and `test/general/RuleGroupTest.js`
holds the two against each other in five cases: every section a shared suite opens is declared
per-executer or both, every per-executer or both section has a shared suite, no section is opened
twice, no section is left without a group, and no group is misspelled. Move a rule between the two
groups without moving it in the table and the gate says so — which is the `ChainTest.js:229` failure
this was written for.

What it cannot check: the table against `SPECIFICATION.md` itself. The suite runs in a browser and
cannot read the document, so a new section has to be entered by hand. That limitation is written
into both files.

Count 505 → 510: the five cases of `RuleGroupTest.js`. No expectation changed.

Handed to stage 4: **8.4 is declared `general` because that is where it runs**, although
`test/spec/ExecuterTest.js` loops over the executers to check it — same for the registration half of
8.2. Both are candidates for the move into `test/executer/`, and the declaration carries a note
saying so rather than quietly claiming the rule is executer-independent.

### Stage 4 — the old executer tests *(status: done, 2026-09-01)*

`test/ExecuterTests/` is gone: 11 files, 117 cases, all of them read before anything was deleted.
What they pinned and where it stands now:

| What the old suite pinned | Where it is now |
|---|---|
| chain lookups from a leaf, shadowing, `context: null` links (9) | `shared/ChainRules.js` 5.2/5.3, under four executers instead of one |
| `effectiveChain` over links built with `context: null` (3) | `spec/ChainTest.js` 5.5 |
| the `resolveText` batteries: several expressions, one repeated, promise values, a slow one (22) | `spec/EntryPointTest.js` 4.3/4.4/4.6 and `spec/ErrorTest.js` (the long-running warning) |
| the `resolve` batteries: literals, `new Array/Set/Map/Date`, object, `0`, timeout (30) | `spec/EntryPointTest.js` 4.3/4.4 — type preservation is one rule, not one case per built-in |
| a function as a value | **carried over**: `spec/EntryPointTest.js` 4.3, *resolve answers a function as a function* |
| `await`, combined promises, `getPromise()` (6) | `spec/EntryPointTest.js` 4.6 |
| an escaped expression in `resolve` (2) | `spec/SyntaxTest.js` 3.2 |
| a name no link carries raising out of `resolve` (4) | `shared/ErrorRules.js` 7 |
| a name on the global object, `document.location` (8) | `shared/ExecuterRules.js` — `global/reachable` |
| a context name winning against the same name on the global object (2) | **carried over**: `shared/ExecuterRules.js`, under four executers |
| `mergeContext` (2) | `spec/ContextTest.js` 6.6 |
| "illegal object member" — a context key that is not a variable name (3) | **carried over**: `shared/ContextRules.js` 6.1, under four executers |
| a DOM element as context (2) | **carried over**: `general/ContextShapeTest.js`, under four executers |
| a statement spanning several lines (4) | **carried over**: `spec/SyntaxTest.js` 3.1 |
| esprima reaching a global only through `window` (2) | **carried over**: `esprima-executer/OwnBehaviourTest.js` |
| `${ await fetch(url) }` (2) | **dropped**: a network call in the gate, and `await` is pinned in 4.6 |
| `${ Object.freeze(url) \|\| true }`, `${ test?.value }` (4) | **dropped**: JavaScript semantics, covered by 3.4 and `global/reachable` |

Count 510 → 416: minus 117, plus 7 carried-over cases which run per executer where that is the
point (15 cases), plus 8 from `StackedContextTest.js` now running under four executers instead of
two. Run time fell from 9.2 s to 3.6 s — the old suite waited on two one-second promises and a
`fetch`.

**`test/general/` is kept, and it is not a compromise.** The two groups of the catalogue describe
the *conformance* suite: rules of `SPECIFICATION.md`. These four files pin something else, and
declaring them as rules or capabilities would say something untrue about them.

- `ContextShapeTest.js` — what the executers do with a context the specification says nothing about
  (an array, a Map, a NodeList, an element, a primitive). Its own header says it is not a
  conformance test.
- `SetupExecuterTest.js` — the three states a consumer can put a code cache into. It carried an
  `EXECUTERS` list of its own, which is now the catalogue's.
- `StackedContextTest.js` — 6.6 seen through a resolution instead of through `getData`. It named
  two of the four executers by hand; it now takes all four from the catalogue, which is where its
  8 extra cases come from.
- `CodeCacheTest.js`, `TestUtilsTest.js`, `RuleGroupTest.js` — the cache, the helpers, and the
  catalogue itself. None of them is executer-shaped.

Noted while clearing up: `test/data/` is an empty directory from 2019 that nothing references. Git
does not track empty directories, so it exists only in the working tree; left alone.

### Stage 5 — records *(status: done, 2026-09-01)*

- `SPECIFICATION.md` 8.3 carries the capability table, five rows against four executers, with the
  one row that is a broken rule rather than a capability marked as such. 8.2 no longer describes
  the limits of `esprima-executer` in prose. The document says outright that
  `test/ExecuterCapabilities.js` is the authority and that the suite cannot check the document, so
  a change goes into both.
- `DECISIONS.md` carries the mechanism and the vocabulary — function, capability, rule — the two
  states, `capabilityIt`, the rule groups, and why a branched expectation was not enough.
- `CHANGELOG.md` carries the one consumer-visible part: the specification ships with the package,
  so its new table does too. Nothing else of stages 1–4 reaches a consumer.
- `BACKLOG.md` carries the re-measured coverage. Not planned here, but the stage would have been
  dishonest without it: counting test cases does not prove coverage was kept, and measuring found
  the one line the move had lost.
- `AGENTS.md` says what an `it.fails` marker means now that it carries two meanings, and its count
  of open specification deviations is 8 rather than 9 — the default executer closed one.

## The undertaking is finished

All five stages are done, the gate is green at 420 cases, and what outlives this file is in
`DECISIONS.md`, `SPECIFICATION.md` and `BACKLOG.md`. **This file is kept only until it is
committed** — deleting it before that would take the record of the five stages with it, because
nothing else holds it. Once the commit is in, delete it; a finished plan left lying around gets
read as instructions.

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
