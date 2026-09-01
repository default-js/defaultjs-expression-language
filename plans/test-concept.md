# Plan — what is tested against what

Agreed 2026-09-01, after the test structure was rebuilt and read again. The structure is now
readable, but Frank's review of it found the layer underneath: the suite was **reshaped, not
conceived**. Three things follow from that and they are this plan. It is deleted when the
undertaking is finished; what outlives it goes to `DECISIONS.md`.

## Why

1. **The general suite tests the resolver but runs against a real executer.** `test/spec/` carries
   `defaultExecuterEntry()` and a dialect only because *some* implementation has to be there. 3.2 is
   the clearest case: the rule is that an escaped expression is **never handed to an executer**, and
   the test asserts it through the answer of a foreign implementation instead of through the fact
   itself. Most files there have the same shape.
2. **`ExecuterCapabilities.js` carries test logic.** `run` and `expected` in a data file are tests in
   disguise — the same thing that was rejected once already, in another wrapping.
3. **Five capability rows are an arbitrary selection.** They are what the old suite happened to have
   marked as a freedom. If the matrix listed *every* case that runs per executer, it would be what it
   looks like — the conformance overview of the package — and the cases could go back to being
   ordinary tests.
4. **`SetupExecuterTest` is 8.4, not "general".** It runs per executer and belongs on the executer
   side and in the matrix, together with `test/spec/8.4-tuning.Test.js`, which asks the same thing.
   The same holds for the registration half of 8.2 — the open `BACKLOG.md` entry about the two loops
   in the general suite dissolves here instead of staying an exception.

## The concept

Three things are tested, and each has one place:

| What | Where | Against |
|---|---|---|
| **the resolver** — parsing, chain, entry points, data methods, public surface | `test/spec/` | a **TestExecuter** owned by the suite |
| **the implementations** — every rule that is only observable through a statement | `test/executer/` | all four registered executers |
| **which implementation answers what** | `test/ExecuterCapabilities.js` | data only: one row per case, one column per executer |

The TestExecuter is what makes the first row honest. It is a small implementation the suite owns:
predictable semantics, no dialect of its own to work around, and it **records the statements it
receives**, so a rule about what reaches an executer can be asserted directly instead of inferred
from an answer. `test/spec/` then depends on no registered implementation at all, and changing the
default executer cannot touch it.

## Decisions taken before the work starts

- **The matrix lists every case that runs per executer**, not a selection. A row is
  `section → case name → one state per executer`, and the case name in the test *is* the key — so a
  case whose name is not in the matrix throws rather than passing silently, and a row without a case
  is found by counting.
- **Each row says which kind it is**: `CAPABILITY` — the implementations may differ, no answer is
  wrong; or `RULE` — every column has to be `yes`, and a `no` is a known defect that names its
  `BACKLOG.md` entry. A rule row with a `no` is the only place a red gate is expected.
- **No test logic in the catalogue.** `run`, `expected` and `context` go back into the test files.
  The catalogue is data.
- **The section files keep iterating over the executers themselves** and ask the matrix per case
  (decided by Frank, 2026-09-01, after both sides were laid out). The alternative was one file that
  runs every case, with the section files reduced to exported case tables: it would keep the matrix
  aliases out of the test bodies entirely and cut the per-file setup cost, but the section files
  would stop being test files, one broken file would redden the whole executer side, and every
  failure would report the same file. Not to be reopened without a reason the run time provides.
- **`test/general/` keeps only what belongs to no rule and no executer**: the code cache and the
  helpers of the suite itself.

## Stages

All done, 2026-09-01. 415 cases before, 409 after — accounted for below. Coverage unchanged.

### Stage 0 — baseline *(done)*

415 cases (402 passed, 13 expected fail) over 36 files in 8.8 s, coverage
92.81 % / 90.94 % / 91.58 % / 95.56 %.

### Stage 1 — the TestExecuter *(done)*

`test/TestExecuter.js`: destructures the context properties into scope, compiles with `new Function`
inside an async wrapper so a statement may `await`, records every statement it receives, and exports
`useTestExecuter()` — which moves `ExpressionResolver.defaultExecuter` for one file and restores it,
because the static entry points of 4.1 take no executer.

It is not registered by `src/executer/index.js` and each file that wants it imports it, rather than
`test/setup.js` handing it to files that must not see it — a deviation from the plan's file list,
for the sake of the dependency being visible where it is used.

**What it deliberately does not do:** answer the three freedoms of 8.3 in a way any case may lean
on. Globals are in scope because generated code sits in the global scope, and a write lands on a
destructured local — both are accidents of the shortest implementation, written into the file
header as such. Teaching it more to keep a case in `test/spec/` is the marker that the case belongs
on the executer side; that did not happen once during stage 2.

### Stage 2 — the general suite runs against it *(done)*

11 files switched, `defaultExecuterEntry` and all 43 `variableName` calls gone from `test/spec/`,
the catalogue's entry for the default executer deleted with them. Context names read bare again.

**Seven cases added, each stating its rule instead of inferring it** — 415 → 422:

- 3.2 (three): an escaped expression reaches no executer at all; beside an unescaped one, exactly
  the unescaped one is handed over; and in `resolve` the backslash *is* handed over, which is why it
  raises.
- 3.1 (two): the abandoned start of an expression is never executed, and a delimiter without a
  matching brace hands over nothing.
- 3.3 (one): the scope prefix is parsed off above the executer — what arrives is the statement alone.
- 4.3 (one): two occurrences of one expression are handed over twice, without needing a side effect
  to see it.

One defect of my own found on the way: a template literal carrying both a backslash and an
interpolation was rewritten into a plain string, which silently dropped the interpolation. One case,
caught by the gate.

### Stage 3 — the matrix becomes complete *(done)*

`MATRIX` replaced `CAPABILITIES`: 35 rows today, one per case that runs per executer, keyed by the
case name. `run`, `expected` and `context` left the catalogue; the five capability cases became
ordinary tests in the section files, two of them in new files (6.5, 8.2). `casesOf(section,
executer)` answers the `it` a case runs under, and `matrixState` throws on a case the table does not
know. `CapabilityTest.js` is gone; `MatrixTest.js` checks the table's shape in five cases.

**Three states instead of two**, and this is the part worth keeping: `yes`, `no` (a freedom 8.3
grants) and `defect` (a rule an implementation does not keep, with its backlog entry named). Two
rows are defects today — the global-write leak under two executers, and the nested function under
esprima.

### Stage 4 — the executer side becomes complete *(done)*

- The registration half of 8.2 moved into `rules/8.2-…` and got a row.
- `test/spec/8.4-tuning.Test.js` and `test/executer/SetupExecuterTest.js` asked the same subject
  twice; they are one `rules/8.4-tuning.Test.js` with three rows, and the general half is gone.
- `StackedContextTest.js` became `rules/6.6-…` with one row — the case that pins 6.6 through a
  resolution. Its other three cases were resolutions over a chain and nothing else, which 5.2 asks
  of all four already; dropped rather than moved.
- `ContextShapeTest.js` was kept outside the matrix here, on the grounds that it pins what the
  specification does not state. **Reversed on the same day** by `test-isolation.md`: the file was
  dissolved, because a case checking two named executers by hand is a matrix row written in
  prose, and a row saying `no` where the specification is silent is exactly the difference the
  table exists to show.
- `setDebug` moved to 9, where the public surface of the executer modules is pinned.

422 → 409: minus 4 (registration loop), minus 4 (the duplicated 8.4 case), minus 12
(`SetupExecuterTest`), minus 16 (`StackedContextTest`), plus 4 + 12 + 4 for the rows they became.

### Stage 5 — records *(done)*

`DECISIONS.md` carries the concept and marks both predecessors of the same day as superseded.
`AGENTS.md` describes the three places in one paragraph. `SPECIFICATION.md` 8.3 lists only the
points where the four differ — with `no` and *defect* told apart, which the document could not do
before — and names `MATRIX` as the authority. The `BACKLOG.md` entry about the two loops in the
general suite is deleted: stage 4 answered it.

## The undertaking is finished

Gate green at 409 cases over 37 files. Coverage identical to the baseline at
92.81 % / 90.94 % / 91.58 % / 95.56 %, measured before and after. **This file is kept only until it
is committed** — deleting it before that would take the record of the six stages with it. Once the
commit is in, delete it along with `executer-conformance.md` and `test-structure.md`.

## Risks

- **The TestExecuter hides a defect that only a real implementation shows.** It is the reason the
  executer side exists and runs all four; nothing that is observable through a statement may be
  pinned in `test/spec/` alone. Watch for it while stage 2 runs: a case that cannot be written
  against the TestExecuter without teaching it something specific is a case that belongs on the
  executer side.
- **Silent loss of coverage.** Case counts per stage, `npm run test:coverage` at the end. Stage 2 is
  the dangerous one because it rewrites cases rather than moving them.
- **A matrix of forty rows nobody reads.** It is only worth having if it stays a table: one line per
  case, aligned columns, no logic. If it stops being readable at that size, the concept is wrong and
  that has to be said in stage 3, not worked around.
- **The case name as the key.** Renaming a test then breaks the matrix — deliberately, but it has to
  fail loudly rather than skip the case.

## Out of scope

Everything in `BACKLOG.md`. This plan changes what is tested against what; it does not change the
resolver, the executers, or what the specification promises. New cases are allowed only where a rule
is currently pinned indirectly, and each one is named.
