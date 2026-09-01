# Plan — the resolver tested without an evaluation

Agreed 2026-09-01, continuing `test-concept.md` after its result was read. That plan put the
resolver on a `TestExecuter`; this one finishes the thought, because the executer it got **evaluates**
— it destructures the context and compiles with `new Function`, which is `ContextDeconstructorExecuter`
under another name. So `test/spec/` still checks evaluation results, only from an implementation the
suite happens to own. Deleted when finished; what outlives it goes to `DECISIONS.md`.

## Why

**A case must not test two things at once.** The first case of `3.1-delimiters.Test.js` is the
example: `resolveText("${ {a: 1}.a }")` answering `"1"` says both *the expression was delimited
correctly* — the resolver's job — and *the statement was evaluated correctly* — the executer's. Only
the first belongs to 3.1, and the second belongs to every implementation, not to one.

**The TestExecuter needs no functionality at all.** Where an evaluation really has to be proven,
that is a case for the executer side and a row of the matrix. Here, all that matters is *what
arrives as the statement*.

## Decisions taken before the work starts

- **The TestExecuter answers the statement it was handed.** No compiler, no destructuring. A case
  then reads the delimiting straight out of the result:
  ```javascript
  const result = await ExpressionResolver.resolveText("a ${ {v: 2}.v } b", {});
  expect(result).toBe("a {v: 2}.v b");
  ```
  The recorder stays for what the answer cannot show — that a statement arrived **not at all**, or
  how often — but most cases stop needing it.
- **`answerWith(fn)` for the resolver rules that depend on an answer**: the default value needs a
  `null`, asynchrony needs a promise, section 7 needs a throw, 4.3 needs a non-string. Those are
  rules about what the resolver does *with* an answer, and they become independent of anyone
  producing it.
- **The constructor takes an `Executer` instance as well as a registered name.** Frank's, 2026-09-01:
  it is an addition, not a change — every call that works today keeps working, and the library stays
  backwards compatible. It also removes an inconsistency of the current API: the static setter
  `ExpressionResolver.defaultExecuter = anExecuter` already accepts an instance, the constructor
  silently drops one (`BACKLOG.md`). `SPECIFICATION.md` 4.2 says "the registered name … and nothing
  else" today, so this is a change to the specification and gets its entries.
- The static entry points of 4.1 keep taking no executer; a file that pins them still moves the
  default through `useTestExecuter()`.

## Stages

All done, 2026-09-01. 409 cases before, 434 after — accounted for below. Coverage unchanged, branch
coverage up.

### Stage 0 — baseline *(done)*

409 cases (396 passed, 13 expected fail) over 37 files in 4.2 s, coverage
92.81 % / 90.94 % / 91.58 % / 95.56 %.

### Stage 1 — the constructor takes an instance *(done)*

`src/ExpressionResolver.js`: an `Executer` instance is kept, a string is still looked up in the
registry, anything else still falls back to the default. Seen failing first, for the right reason —
the instance was dropped and the default answered. The constructor JSDoc documents the option for
the first time. `SPECIFICATION.md` 4.2, `CHANGELOG.md` (Added) and `DECISIONS.md` carry it; the
`BACKLOG.md` entry that asked the question is deleted, including the half of it about the asymmetry
with `defaultExecuter` — which is what the change removes.

The only change to `src/` in this plan. 409 → 410.

### Stage 2 + 3 — the TestExecuter stops evaluating, and the suite with it *(done)*

Run together, because stage 2 alone leaves the gate red: taking the evaluation out failed 63 cases
at once, and those 63 are exactly the ones that were asking two questions.

`test/TestExecuter.js` now answers the statement it was handed. `answerWith(fn)` sets a different
answer for one case; `answersFromContext()` answers `context[statement]` for a whole file — a
lookup, which is what a rule about *which resolver answers* needs. Both are cleared after every case
by `useTestExecuter()`, so nothing leaks between cases.

What the rewrite made sharper, beyond the split:

- **4.4** sets the answer (`answerWith(() => null)`) instead of hunting for a statement that produces
  one. It gained a case on the way — that `false` is not replaced, which nothing pinned.
- **7** now throws through `answerWith` rather than writing a statement that happens to fail under
  whichever executer is the default. One case became stronger: the caller gets *the* error the
  executer raised, asserted by identity.
- **4.5** no longer needs a slow function in a context; the answer is the slow promise.
- **3.2** lost its `catchError`: what `resolve` does with an escaped expression is that it hands the
  backslash over as part of the statement, which the record shows directly.
- **6.7** lost one case: "filters the context, not the globals" cannot be asserted without evaluating
  something, and it said nothing about `buildSecure` — reaching a global is a freedom of 8.3 and has
  its own row. Noted in the file rather than dropped silently.

### Stage 4 — the executer side gains 3.4 *(done)*

`test/executer/rules/3.4-what-a-statement-may-contain.Test.js`, seven rows: an operator expression, a
call on a context member, an object literal, an arrow function body, a template literal, a regular
expression literal, and `await`. Asked of all four for the first time.

**The finding the plan expected turned out to be a case that asked two things.**
`${ await Promise.resolve(20) + 1 }` failed under `esprima-executer` — not because of `await` but
because `Promise` is rewritten to `ctx?.Promise`, which is the `global/reachable` freedom that
already has a row. The case now awaits a promise the context carries, and all four pass it. The
matrix gained no `no` from 3.4: what looked like a new difference was the known one in disguise.

The general 3.4 keeps what never reaches an executer: the empty statement.

Count 410 → 434: plus 28 for the seven rows times four executers, minus 3 for the evaluation cases
that left the general suite, plus 1 in 4.4, minus 1 in 6.7, minus 1 in 3.2 (two cases became one).

### Stage 5 — records *(done)*

`DECISIONS.md` carries both decisions and supersedes the TestExecuter of the previous entry.
`AGENTS.md` says what the TestExecuter does and does not do. `SPECIFICATION.md` 4.2 carries the
instance option; 8.3 needed no change, because the seven new rows are `yes` throughout.
`CHANGELOG.md` carries the instance option under Added. `BACKLOG.md` has the re-measured branch
coverage.

### Stage 6 — `ContextShapeTest.js` dissolved *(done, added while stage 5 ran)*

Frank, on reading the result: the file was still outside the matrix, and one of its cases -
"an arguments object as context is fine until it is destructured" - checked two named executers by
hand. That is a matrix row written in prose, and the reason it had been left out ("the
specification says nothing about context shapes") is not a reason: a `no` where the specification
is silent is exactly the difference the table exists to show.

Nine cases became rows of 6.1 and run under all four: array, Map, Set, NodeList, arguments object,
element, the length of an array, a named key beside a numeric one, an accessor on a prototype. The
arguments row is the only `no` - measured across all four rather than assumed, which the old case
could not do because it named two of them. The two cases about a primitive context are resolver
behaviour and moved to `test/spec/6.1-the-proxy.Test.js`.

434 → 437, and `test/executer/` now holds nothing but `MatrixTest.js` and `rules/`.

## The undertaking is finished

Gate green at 434 cases over 38 files. Coverage 92.81 % / **91.00 %** / 91.58 % / 95.56 % against
92.81 % / 90.94 % / 91.58 % / 95.56 % at the baseline — statements and lines unchanged, branches up,
and the uncovered lines are the same four known items. The risk this plan named — that a general
suite which no longer evaluates would stop reaching the paths a compiler needs — did not
materialise: the executer side covers them, which is where they belong.

**This file is kept only until it is committed.** Once the commit is in, delete it along with
`executer-conformance.md`, `test-structure.md` and `test-concept.md`.

## Risks

- **A rewritten case that pins nothing.** `expect(result).toBe("a {v: 2}.v b")` is only worth
  something because the TestExecuter's answer is the statement; if a case is rewritten without
  understanding what it asserted, it can end up asserting the TestExecuter instead of the resolver.
  Every rewritten case names, in its comment, which half of the old case it kept.
- **Coverage of `src/`.** The general suite stops running real evaluation, so paths that only a
  compiling executer reaches are covered by the executer side alone. Measure at the end; if a line
  loses its only reader, the case that used to reach it belonged on the executer side anyway and
  goes there.
- **Silent loss while cases move.** Counts per stage, and stage 3 and 4 are counted together because
  cases cross between them.
- **The instance option in the wrong place.** It is an API change; it must not become a test
  convenience that nobody documented. Stage 1 is finished only when the specification, the changelog
  and the decision are written, not when the test passes.

## Out of scope

Everything else in `BACKLOG.md`. The resolver is touched in exactly one place — the constructor
option — and nothing else about its behaviour changes.
