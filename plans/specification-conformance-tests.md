# Plan — Conformance tests for the specification

**Status: running. Opened 2026-08-22 by Frank.**

Every rule of `SPECIFICATION.md` gets a test **before** any of the fourteen fixes listed in its
section 10 is written. No source file under `src/` is touched while this plan runs.

## Why this exists

Three reasons, in the order they matter.

1. **A failing test is the instrument for reviewing a decision.** The specification was written
   from an interview, in one long session. Some of its rules have never been executed. Writing
   them out as tests and watching each one fail individually is what turns them from agreed
   sentences into verified behaviour — and where a failure looks wrong rather than expected, the
   rule goes back for revision instead of the code being bent to match it.
2. **The working agreement puts tests first.** A change in behaviour starts with a test that was
   seen failing for the right reason. Fourteen fixes are fourteen changes in behaviour.
3. **The suite is the safety net for the fixes themselves.** Several of them touch the same three
   files, and some interact — the matching-brace parser and per-occurrence evaluation land
   together, the scope walk and the instance `resolve` overlap. Without the rules pinned first,
   the later fixes are changing behaviour nobody is watching.

## The mechanism: `it.fails`

Verified against vitest 4.1.11 in this repository
(`node_modules/@vitest/runner/dist/tasks.d-DEYaIMIu.d.ts:535`): a test marked `fails` "should
succeed if it fails — if the task fails, it will be marked as passed".

So a test for a rule the code does not keep yet is written as `it.fails(...)`:

- the gate stays green while the specification and the code disagree,
- and the moment the behaviour becomes correct, that test **fails** — which forces the marker to
  be removed in the same change that lands the fix. The suite cleans itself up.

**The cost, and the countermeasure.** A `.fails` test also passes when it fails for the wrong
reason — a typo in the test, a wrong import, a rule misunderstood. So every `.fails` test is run
**once with the marker removed** and its failure message read before it is written down as
expected. A failure message that does not match what the specification predicts is a finding, not
a formality.

## Scope

**In scope:** new test files under `test/spec/`, one per section of the specification, and
whatever helpers they need in `test/TestUtils.js`.

**Out of scope, without exception:** any change under `src/`. If a rule cannot be tested without
touching a source file, that is a `BACKLOG.md` entry, not a licence to fix it here.

Note two `TestUtils` helpers already carry a defect of their own (see `BACKLOG.md`); they have no
consumer today, and the conformance suite must not become their first one until they are fixed.

## Layout

`test/**/*Test.js` is what the runner collects, so the files are named accordingly. One file per
specification section, and every `describe` names the rule it pins, so a failure points straight
into the document:

| File | Covers |
|---|---|
| `test/spec/SyntaxTest.js` | 3 — delimiters, escaping, scope prefix, statement content |
| `test/spec/EntryPointTest.js` | 4 — both call forms, default value, timeout, asynchrony |
| `test/spec/ChainTest.js` | 5 — structure, lookup with and without a prefix, the chain getters |
| `test/spec/ContextTest.js` | 6 — proxy, snapshot rule, global object, writing, the data methods, `buildSecure` |
| `test/spec/ErrorTest.js` | 7 — a failing statement, a slow statement |
| `test/spec/ExecuterTest.js` | 8 — registry, the four implementations, what may differ between them |
| `test/spec/PublicSurfaceTest.js` | 9 — every member of the surface exists and has the shape the document claims |

**The executer dimension.** Section 8.3 says only two things may differ per executer: how a
statement reaches the global object, and whether a write can be intercepted. Everything else has
to hold under every registered executer. The chain and context suites are therefore written to run
once per executer, and the two exceptions are stated in `ExecuterTest.js` rather than silently
skipped elsewhere.

## Stages

Secure a baseline, one stage, green, only then the next.

**Stage 0 — baseline.** `npm test` green and the test count noted; `npm run bench` captured for
the performance goal, with the bimodality caveat from `BACKLOG.md` respected — several runs, not
one. Nothing else happens before this is written down.
**Measured 2026-08-22, before the first conformance test.** `npm test` green: **14 files, 144
tests**, 15.6 s.

`npm run bench`, three runs, headless chromium through playwright, node 24.19. Ranges are across
the three runs, `mean` in milliseconds per operation:

| Bench | depth | mean | hz |
|---|---|---|---|
| ColdResolve — links carry a non-matching context | 10 | 0.0018–0.0019 | 521 k – 542 k |
| | 1 000 | 0.0170–0.0175 | 57.3 k – 58.7 k |
| | 100 000 | 5.76–6.78 | 148–174 |
| | 1 000 000 | 56.5–63.9 | 15.6–17.7 |
| ColdResolve — links carry no context | 10 | 0.0018–0.0019 | 537 k – 554 k |
| | 1 000 | 0.0130–0.0147 | 68.2 k – 76.7 k |
| | 100 000 | 5.12–5.66 | 177–195 |
| | 1 000 000 | 58.2–66.8 | 15.0–17.2 |
| WarmResolve — expression served from the cache | 10 | 0.0016 | 621 k – 636 k |
| | 1 000 | 0.0171–0.0187 | 53.5 k – 58.6 k |
| | 100 000 | 6.38–6.92 | 144–157 |
| | 1 000 000 | 59.7–63.9 | 15.7–16.7 |
| RandomScope — random scope lookup | 1 000 | 0.0106–0.0111 | 89.9 k – 94.4 k |
| | 100 000 | 5.11–5.39 | 186–196 |

Three things to carry forward when this is compared against:

- **All three runs landed in the fast mode** of the bimodality recorded in `BACKLOG.md` — roughly
  6 ms at depth 100 000 and 60 ms at depth 1 000 000. The slow mode, about twice that, did not
  appear once. A later run that lands in the slow mode is not a regression, and a comparison
  across modes says nothing.
- **Warm is not faster than cold on a deep chain.** At depth 100 000 the warm case runs at
  144–157 hz against 148–195 hz cold. Compilation is not what those depths measure; the chain
  walk is, which is what the performance entry in `BACKLOG.md` already describes. Only the
  shallow depths show the cache doing its work — 621 k hz warm against 521 k cold at depth 10.
- **Only depths 10 and 1 000 are stable enough to judge a small change.** Their spread across the
  three runs is under 4 %, while the deep cases move by 10 % and more without anything changing.

**Stage 1 — sections 3 and 4.** Syntax and entry points. The largest cluster of `.fails` tests
sits here: the matching brace, per-occurrence evaluation, the configuration form, the scope prefix
in `resolve`.

**Stage 2 — section 5.** The chain. Includes the two rules that have never run at all — the scope
walk reaching an ancestor, and `undefined` for a scope no link carries.

**Stage 3 — section 6.** The context. The biggest section and the one with the most rules that are
new rather than merely broken: the snapshot rule, the global-write switch, the four data methods
along the chain, `buildSecure`.

**Stage 4 — sections 7 to 9.** Errors, executers, public surface.

**Stage 5 — the review pass.** Every `.fails` test run with its marker removed, in one sitting,
and every failure message read against what the specification predicts. Findings go into
`BACKLOG.md`; a rule that turns out to be wrong goes back to Frank rather than into the code.

**Stage 6 — close out.** `npm run test:coverage`, and the coverage entry in `BACKLOG.md` updated
with the new numbers. Then this plan is deleted and the fixes begin, one backlog entry at a time.

## Verification

`npm test` green at the end of every stage — including the stages that add tests which the code
cannot satisfy, because those are marked `fails` and therefore count as passing. A red gate during
this plan means a test is wrong, not that a rule is.
