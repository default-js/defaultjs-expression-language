# Plan — the test structure

Agreed 2026-09-01, after the executer conformance suite was finished and read. The structure it
produced works but is not readable, and the reasons are Frank's, listed below as they were raised.
The plan is deleted when the undertaking is finished; what outlives it goes to `DECISIONS.md`.

## Why

1. **What is tested is only visible after opening a file.** A file carries too many different
   things — `ContextRules.js` holds 6.1, 6.2, 6.3 and 6.5 — and the shared suites are the worst of
   it.
2. **The test code decides what may be a capability.** `capabilityIt("global/reachable", executer)`
   sits in the test body, so the more important half of the statement — *this rule is one an
   executer may decline* — is spread across the code instead of standing in one place.
3. **The `OwnBehaviourTest` files pin the other side of a capability.** `context-deconstruction-executer`
   asserts `"0 0"` for a counting write, which is what `context/write-back: unsupported` already
   says. The day the executer gains the write-back, that test is wrong and nothing in the catalogue
   knows about it.
4. **The state configuration does not read as a table.** Five objects with four
   `[ExecuterName]: SUPPORTED` lines each.
5. **The shared rules are grouped by theme, not by specification section.** The section is what a
   reader looks for.
6. **Four `ConformanceTest.js` files differ in one import line.** The per-executer directories are
   almost pure boilerplate; two of them hold nothing else.
7. **`RULE_GROUPS` earns nothing.** It was introduced against the `ChainTest.js:229` failure, but
   would not have caught it: there a test in `test/spec/` became executer-dependent because the
   constructor changed, and neither the declaration nor `RuleGroupTest.js` can see that. What the
   table checks is its own consistency. `both` is the symptom — 6.1, 6.5, 7 and 8.2 have halves in
   both groups, because the split does not run along sections. Folder and file name carry the same
   information without a table.

## Decisions taken before the work starts

- **One file per specification section**, named `<section>-<slug>.Test.js` — `6.5-writing-from-inside.Test.js`.
  Not one file per case. The glob `test/**/*Test.js` matches that form, verified; `vitest.config.mjs`
  is not touched.
- **A capability case is unambiguous**: supported runs as `it` and has to pass, unsupported runs as
  `it.fails` and has to fail. There is no second expectation for the unsupported state — the
  counter-tests in `OwnBehaviourTest` disappear rather than moving into the catalogue.
- **The catalogue carries the case, not just the state**, so that "is this a capability at all" is
  decided in one place: `context`, a `run` that answers one value, the `expected` value of the
  supported state, and the state per executer.
- **`RULE_GROUPS` and `test/general/RuleGroupTest.js` are removed.** The group of a rule is the
  directory it lives in. A section with halves in both groups gets a file in each.
- **`test/general/` stays.** It holds what pins no rule of the specification.

## What it becomes

```
test/
  ExecuterCapabilities.js            executers, the capability matrix, the cases
  TestUtils.js                       catchError and the resolver factories
  spec/
    3.1-delimiters.Test.js           … one file per section that runs once
    4.1-static-entry-points.Test.js
    …
  executer/
    CapabilityTest.js                data-driven from the matrix, all executers
    rules/
      5.2-lookup-without-prefix.Test.js   … one file per section that runs per executer
      …
    esprima-executer/OwnBehaviourTest.js  only what matches no capability
  general/                           what pins no rule of the specification
  PerformanceTests/
```

Sections and where they land, from the current suite:

| runs once — `test/spec/` | runs per executer — `test/executer/rules/` |
|---|---|
| 3.1, 3.2, 3.3, 3.4 | 5.2, 5.3, 5.4 |
| 4.1, 4.2, 4.3, 4.4, 4.5, 4.6 | 6.1 (through a statement), 6.2, 6.3 |
| 5.1, 5.5 | 6.5 (the negative guarantee) |
| 6.1 (the proxy), 6.4, 6.5 (the switch), 6.6, 6.7 | 7 (both entry points) |
| 7 (the warnings) | 8.2 (what an implementation can execute) |
| 8.1, 8.2 (registration), 8.4, 9 | 8.3 |

## Stages

All done, 2026-09-01. 415 cases before and after, coverage unchanged.

### Stage 0 — baseline *(done)*

420 cases (407 passed, 13 expected fail) over 19 files in 3.7 s, coverage
92.81 % / 90.94 % / 91.58 % / 95.56 %.

### Stage 1 — the catalogue *(done)*

`ExecuterCapabilities.js` rebuilt: `CAPABILITY_MATRIX` is a table with a header line, one row per
capability against one column per executer, and every capability carries its own case — `context`,
`run`, `expected`. `test/executer/CapabilityTest.js` generates the tests from it and adds two cases
on the catalogue itself: every capability has a case *and* a state, and `supports` agrees with the
matrix. `capabilityIt` is gone; no test file decides any more whether something is a capability.

Two kinds of row stay apart, `CAPABILITY` and `UNIMPLEMENTED_RULE`, and the kind is part of the test
name. `context/no-global-write` is the only one of the second kind: it runs as a failing case like a
missing capability, but it is a defect and `BACKLOG.md` carries its fix.

**The risk this stage was to answer is answered:** all five capabilities express as one value.

**And a defect was found doing it.** `context` was first written as an object, and objects on a
module are shared: the write of the first executer mutated the context of the next three, so
`context/write-back` *passed* under the two executers that do not have it — `Expect test to fail`.
It is a factory now, and the reason is written into the file so nobody turns it back.

### Stage 2 — the counter-tests go *(done)*

Both `OwnBehaviourTest.js` files are deleted. Four of their six cases were the other side of a
capability — `context/write-back` twice, `global/reachable`, `statement/assignment`,
`context/nested-function`. The sixth, reaching a global through `window`, turned out to be a rule:
verified before moving that all four executers answer `2` to `${ window.Math.round(1.5) }`,
including the one that cannot reach a bare `Math`. It now runs in the 8.3 rules file. Nothing was
left that only one executer does, so the four per-executer directories are empty of content.

### Stage 3 — the rules split by section *(done)*

`test/executer/shared/` and the four `ConformanceTest.js` files are replaced by eight files under
`test/executer/rules/`, one per section, each looping over `EXECUTERS` itself.

`RULE_GROUPS`, `sectionsOf` and `test/general/RuleGroupTest.js` were removed **here rather than in
stage 5**: their only reader was that test, which read the `SECTIONS` exports of the shared files,
and keeping them alive for two more stages would have meant building a replacement for something
being deleted. 420 → 415 cases, the five of `RuleGroupTest.js`.

### Stage 4 — the general suite splits by section *(done)*

`test/spec/` is 22 files, one per section, named the same way. `ErrorTest.js` and
`PublicSurfaceTest.js` were renamed rather than split — each holds one section.

**Run time measured, as the plan demanded:** 8.8 s over 36 files against 3.7 s over 18. The
threshold was 15 s, so the granularity stays. Setup per file is the dominant cost and it grows
roughly with the file count; the next undertaking that adds files should measure again rather than
assume the headroom is still there.

### Stage 5 — `test/general/` sorted *(done)*

Every file that loops over `EXECUTERS` now lives under `test/executer/`: `ContextShapeTest.js`,
`StackedContextTest.js` and `SetupExecuterTest.js` moved. What is left in `test/general/` —
`CodeCacheTest.js` and `TestUtilsTest.js` — pins no rule of the specification and loops over
nothing, which is what makes the directory honest. The import paths did not change: both
directories sit at the same depth.

### Stage 6 — records *(done)*

`DECISIONS.md` carries the new entry and marks the superseded half of the earlier one, as the format
demands. `AGENTS.md` says in one paragraph what the directories and file names mean, so a session
does not have to derive it. `BACKLOG.md` had seven paths into files that no longer exist — the
public surface test, `ChainTest.js:229` twice, the coverage entry, the esprima list, the "Link"
count and the entry about 8.2/8.4 — all rewritten. `CHANGELOG.md` gets nothing: none of this reaches
a consumer.

## The undertaking is finished

Gate green at 415 cases over 36 files, coverage identical to the baseline at
92.81 % / 90.94 % / 91.58 % / 95.56 %. **This file is kept only until it is committed** — deleting
it before that would take the record of the six stages with it. Once the commit is in, delete it
along with `executer-conformance.md`.

## Risks

- **Silent loss of coverage while files move.** Case counts per stage, and `npm run test:coverage`
  at the end against 92.81 % / 90.94 % / 91.58 % / 95.56 %. Counting cases is not enough — that is
  how the `TemplateLiteral` branch was nearly lost on 2026-09-01.
- **Run time through file count.** Named in stage 3 with its threshold.
- **A capability case that cannot be expressed as one value.** `run` answers one value and the
  generated case compares it. Where a capability needs more than that, it stays a hand-written case
  in a rules file and the catalogue row carries the state only — but then the row is back to
  deciding nothing, so this needs to be seen before stage 1 is called done.
- **`it.fails` that fails for the wrong reason.** Without the counter-tests, a marked case no
  longer says what happens instead. Mitigated by the case standing in the catalogue with its
  `expected` value, so what it *would* answer is at least written down.

## Out of scope

Everything in `BACKLOG.md`. This plan moves tests, it does not change what the resolver or the
executers do, and it adds no case that is not already there — except where stage 2 finds an
own-behaviour case that is a rule.
