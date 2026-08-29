# Plan — Expression parsing, the scope walk, and the error policy

**Status: running. Opened 2026-08-29 by Frank.**

Sections 3, 4.3, 5.3, 5.4 and 7 of `SPECIFICATION.md`, in one undertaking, because they share
three functions of `src/ExpressionResolver.js` and would otherwise rewrite each other.

## Why this exists

The entries below all end in the same place: the syntax of an expression is parsed in three
different spots of one file — the `EXPRESSION` regular expression with `resolveMatch` (`:13-17`,
`:73-77`), the `split`/`join` loop of `resolveText` (`:273-285`), and the `startsWith`/`endsWith`
pair in `resolve` (`:256-259`). Nothing else in `src/` parses; verified 2026-08-29 by grep over
the whole tree.

Fixing them one at a time means writing the same parsing rule two or three times and throwing two
of them away. Fixing them together is one change to one file — but a large one, with an order
that matters, which is what a plan is for rather than four independent backlog entries.

The entries this plan owns:

- `${scope::expression}` never reaches an ancestor — the recursive call passes its arguments in
  the wrong order
- The instance `resolve()` does not understand the scope syntax at all
- An expression that contains braces is not recognized — there is no matching-brace parsing
- An escaped expression is resolved anyway when the same expression also stands unescaped in the
  text

Section 7 comes along because the rules below force it open, but only in part: the error policy
carries a decision that is still Frank's, written down at the end of this file.

## What is decided

The rules below were settled with Frank on 2026-08-22, 2026-08-24 and 2026-08-29. Everything here
is a target for the code, not a description of it. `SPECIFICATION.md` already carries the ones
settled before 2026-08-29; the five newer ones go into it as part of the stage that implements
them, and `DECISIONS.md` gets one entry for the batch.

| # | Rule | Settled |
|---|---|---|
| 3.1 | An expression ends at the **matching** closing brace. | 2026-08-22 |
| 3.1 | A brace inside a string, template or **regex** literal does not count, in neither direction. Comments are **not** examined — a documented limit. | 2026-08-24; regex and comments 2026-08-29 |
| 3.1 | A `${` met **outside** a literal while a statement is open starts a **new** expression: the open one is abandoned and its text stands. | 2026-08-29 |
| 3.1 | An opening `${` that never finds its matching brace is not an expression. The text stands unchanged, no error, no partial replacement. | 2026-08-22 |
| 3.2 | The backslashes immediately before the `$` are counted. An **odd** number escapes the **delimiter**: exactly **one** backslash is consumed and the `${` opens nothing, so the text behind it is scanned like any other and a delimiter inside what would have been the statement resolves. An **even** number does not escape: the expression is evaluated and **no** backslash is consumed. There is no general unescaping. | 2026-08-29, sharpened the same day |
| 3.3 | The scope prefix is parsed by **both** entry points, through one shared rule. | 2026-08-29 |
| 3.4 | An empty statement answers `undefined` — the same as `return;` in JavaScript. | 2026-08-29 |
| 4.3 | `resolveText` evaluates **every occurrence on its own** and replaces **by position**. | 2026-08-22 |
| 4.3 | `resolve`: a trimmed input that starts with `${` **must** end with `}` and may carry a scope prefix. One that does not start with `${` is a statement in full, carries no prefix, and is executed as it stands. | 2026-08-29 |
| 5.3 | The walk climbs to the link whose name matches and evaluates there. Where two links share a name, the **first found climbing towards the root** answers. | 2026-08-24 |
| 5.4 | A prefix no link carries answers `undefined`, and a default value then applies. | 2026-08-24 |
| 7 | `resolve` **may** throw. `resolveText` **never** aborts because one expression is broken. | 2026-08-29 |

## Scope

**In scope:** `src/ExpressionResolver.js`, the conformance tests that pin the rules above, one new
benchmark, and the records named at the end.

**Out of scope:** every other backlog entry, in particular the four that touch the same file and
would be easy to pick up in passing — `getData`/`deleteData` on the filter path and the chain
rules of the data methods (6.6), `effectiveChain` and the generated name (5.1/5.5), the
global-write switch (6.5), and the configuration form of the static entry points (4.1). None of
them is needed here and each carries a rule of its own.

**No new module.** Decided 2026-08-29: under the rule of 4.3 above, `resolve` knows where the
expression ends without searching for it — the end of the input is the end of the expression — so
the scanner has exactly one caller, and it deletes more from `ExpressionResolver.js` than it adds.
Everything under `src/**` is published, so a new file would also be a public-surface question for
nothing. Revisit only if the scanner grows past roughly a hundred lines once regex literals are in.

## What the scanner produces

One module-private function over the whole text, left to right, without backtracking:

```
scan(text) -> [{ start, end, escaped, scope, statement }, …]
```

`start` is the index of the `$`, `end` the index after the matching `}`, so `resolveText` builds
its result by position and never touches an occurrence it has already passed. The state is a mode
— normal, single-quoted, double-quoted, template, regex — plus a brace depth and a stack for the
one nesting case that exists: inside a template literal a `${` opens a substitution whose `}`
returns to the literal. Without that stack a nested template literal is cut in the middle, which
is the case that corrupts text today instead of leaving it alone:

```javascript
await resolver.resolveText("${ `a${1 + 1}b` }");   // has to answer "a2b"
```

Three details are the whole difficulty:

- **Regex or division.** A `/` in normal mode starts a regex literal unless the last character
  that is not whitespace is an identifier character, a digit, `)` or `]`. Inside the literal a `\`
  escapes the next character and a `[…]` class hides a `/`. This heuristic is the part whose cost
  is measured in stage 2 before it is kept.
- **The backslash run.** Counted backwards from the `$`, so an escape is decided per occurrence
  without looking at what any other occurrence did.
- **The restart.** A `${` in normal mode while a statement is open discards the open start and
  continues at the new one. The abandoned prefix is text and is never scanned again, which is what
  keeps the pass linear. So `"a ${ x b ${value}"` answers `"a ${ x b resolved"`.

The scope prefix is **not** part of the scanner. It is a second module-private function over the
text between the delimiters, used by the scanner and by `resolve` alike:

```
parseScope(content) -> { scope, statement }
```

It carries the character rule of 3.3 — letters, digits, whitespace, `-`, `_`, then `::` — and the
trim that makes `${  ::value}` a prefix-free expression with the statement `value`. One rule, one
place, both entry points.

## Stages

Secure a baseline, one stage, green, only then the next.

**Stage 0 — baseline.** `npm test` green and the test count written down. `npm run bench` over
several runs, respecting the bimodality caveat in `BACKLOG.md` — a single run proves nothing at
the deep sizes.

One instrument is missing and is built here: **no benchmark calls `resolveText`.** All three
existing files resolve a single expression through `resolve` (verified 2026-08-29). Stage 2
rewrites the replacement loop from two full-text `split`s per distinct expression to one pass, and
stage 2 also has a question to answer with numbers, so `test/PerformanceTests/ResolveText.bench.js`
is added **before** anything changes: a text with several distinct expressions, a text repeating
one expression, and a text carrying literals and braces. Its numbers on the current implementation
are the "before".

**Done 2026-08-29.** `npm test` green: **21 files, 350 passed and 63 expected fail (413 tests)**,
9.3 s. `test/PerformanceTests/ResolveText.bench.js` added; the gate is unchanged by it, because
`include` collects only `test/**/*Test.js`.

`npm run bench`, three runs each, headless chromium through playwright. Ranges across the three
runs, `mean` in milliseconds per operation. The four chain benchmarks were measured before the new
file existed, the four text cases with it in place:

| Bench | case | mean | hz |
|---|---|---|---|
| ColdResolve — links carry a non-matching context | 10 | 0.0019–0.0026 | 381 k – 523 k |
| | 1 000 | 0.0189–0.0245 | 40.8 k – 52.9 k |
| | 100 000 | 6.86–14.33 | 69.8–146 |
| | 1 000 000 | 63.1–133.7 | 7.5–15.9 |
| ColdResolve — links carry no context | 10 | 0.0019–0.0022 | 450 k – 534 k |
| | 1 000 | 0.0150–0.0198 | 50.4 k – 66.5 k |
| | 100 000 | 5.86–13.74 | 72.8–171 |
| | 1 000 000 | 72.5–150.1 | 6.7–13.8 |
| WarmResolve — expression served from the cache | 10 | 0.0016–0.0017 | 577 k – 600 k |
| | 1 000 | 0.0176–0.0189 | 52.9 k – 56.7 k |
| | 100 000 | 6.73–7.06 | 142–149 |
| | 1 000 000 | 66.9–68.9 | 14.5–15.0 |
| RandomScope — random scope lookup | 1 000 | 0.0119–0.0131 | 76.2 k – 84.2 k |
| | 100 000 | 5.66–6.31 | 159–177 |
| **ResolveText** — 20 distinct expressions | 1 510 chars | 0.0604–0.0718 | 13.9 k – 16.6 k |
| | one expression 20 times, 1 400 chars | 0.0042–0.0049 | 202 k – 236 k |
| | no expression at all, 1 530 chars | 0.0006–0.0007 | 1.53 M – 1.67 M |
| | expressions carrying literals, 1 616 chars | 0.0124–0.0129 | 77.7 k – 80.4 k |

Five things to carry forward when this is compared against:

- **The bimodality of `BACKLOG.md` is decided per file and per run, not per machine.** Within one
  batch of three runs `ColdResolve` landed in the fast mode once and in the slow mode twice —
  6.9 ms against 13–14 ms at depth 100 000, 63 ms against 132–134 ms at depth 1 000 000 — while
  `WarmResolve` stayed in the fast mode all three times. Both describes of `ColdResolve` always
  moved together. So the two deep sizes cannot be compared across runs at all, and a comparison
  has to name which mode each run landed in.
- **Only depths 10 and 1 000 and the four text cases are stable enough to judge a small change.**
  Their spread is under 8 %, against a factor of two at the deep sizes.
- **One warm run at depth 10 reported an rme of ±106 %** with a maximum of 428 ms against a mean
  of 0.0046 ms, where the other two runs sat at 0.0016 ms with ±3 %. A single outlier — first
  compilation or a collection — not a mode. Discard such a run rather than average it in.
- **`resolveText` is 13 times slower over 20 distinct expressions than over one expression
  standing 20 times**, which is exactly the shared evaluation 4.3 removes. The repeated case is
  therefore *expected* to get slower in stage 2, and it is not a regression: it will do twenty
  evaluations where it does one today. What must not get slower is the distinct case.
- **Text carrying no expression runs at 1.5–1.7 M hz today**, one native `RegExp.exec` over
  1 530 characters. That is the number the hand-written scanner has to defend, and the case a
  template engine hits most often.

**Stage 1 — the walk over the chain (5.3, 5.4).** The smallest of the three, and the only one that
is not parsing: the internal `resolve` (`:64-71`) recurses with its arguments in the wrong order,
and ends the walk with a bare `null` that skips the default value. The default handling moves into
a helper that both exits share, so an unmatched prefix answers `undefined` and then the default,
as 5.4 requires.

Nothing here parses anything — the filter arrives correctly from `resolveText` today, which is
what the four green tests of `SyntaxTest.js` 3.3 already pin. It goes first so that the 24
conformance cases of 5.3 and 5.4 are green **before** stage 2 rewrites the code that produces the
filter, and can serve as its regression guard.

Markers removed: `test/spec/ChainTest.js`, four in 5.3 and two in 5.4, six markers over four
executers.

**Done 2026-08-29.** The six markers came off first and the gate was run red: **24 failing cases**,
every one of them reporting `expected 'null' to be …` — the walk answering the string `null`
instead of climbing, and 5.4 skipping the default on top. That is what the specification predicts,
so the tests fail for the right reason.

The fix is in `src/ExpressionResolver.js`: the recursion now passes `(aExecuter, aResolver.parent,
aExpression, aFilter, aDefault)` in that order, and the default handling moved into `withDefault`,
which both exits share — so the end of a walk that matched nothing answers `undefined` through the
same rule that applies to a result of `null`. `npm test` green: **374 passed and 39 expected fail
(413)**, up from 350 passed and 63 expected fail.

`npm run bench`, three runs, against the stage 0 baseline. The stable cases, `mean` in
milliseconds:

| Bench | case | before | after |
|---|---|---|---|
| ColdResolve — non-matching context | 10 | 0.0019–0.0026 | 0.0018 |
| | 1 000 | 0.0189–0.0245 | 0.0167–0.0171 |
| ColdResolve — no context | 10 | 0.0019–0.0022 | 0.0017–0.0018 |
| | 1 000 | 0.0150–0.0198 | 0.0130–0.0134 |
| WarmResolve | 10 | 0.0016–0.0017 | 0.0015 |
| | 1 000 | 0.0176–0.0189 | 0.0167–0.0173 |
| RandomScope | 1 000 | 0.0119–0.0131 | 0.0104–0.0110 |
| ResolveText | 20 distinct | 0.0604–0.0718 | 0.0453–0.0464 |
| | one expression 20 times | 0.0042–0.0049 | 0.0034–0.0036 |
| | no expression at all | 0.0006–0.0007 | 0.0005 |
| | expressions carrying literals | 0.0124–0.0129 | 0.0094–0.0095 |

**Every case improved by 10 % to 25 %, and none of that belongs to this change.** The proof stands
in the table: `no expression at all` gained 17 %, and stage 1 cannot reach it — a text with no
`${` in it never calls the internal `resolve` at all. The whole batch drifted, by more than the
one added function call could ever account for. What the measurement says is therefore only this:
**no regression is detectable**, and the drift between two batches is larger than the effect being
looked for. All three runs also landed in the fast mode of the deep sizes, against a mixture
before.

Carry this method into the later stages: **name a case the change cannot reach and read the batch
drift off it.** For stage 2 that is `WarmResolve`, which goes through `resolve` and never touches
the text path; for stage 1 it was `no expression at all`.

**Stage 2 — the scanner in `resolveText` (3.1, 3.2, 4.3).** `EXPRESSION`, the four `MATCH_`
constants, `resolveMatch` and the `split`/`join` loop go; `scan` and `parseScope` arrive.
`resolveText` walks the occurrences once and builds the result by position, so an escaped
occurrence and an unescaped one of the same expression no longer reach each other, and every
occurrence is evaluated on its own.

Markers removed: `test/spec/SyntaxTest.js`, all eight; `test/spec/EntryPointTest.js`, "resolveText
evaluates every occurrence on its own".

**The measurement Frank asked for, and the only thing that decides regex literals:** the scanner is
measured twice, on `ResolveText.bench.js` and on `WarmResolve.bench.js`, once with the
regex-literal branch and once without, several runs each. The numbers go to Frank and he decides
whether the branch is kept. If it is dropped, a `}` inside a regex literal becomes a documented
limit of 3.1 alongside comments. Either outcome belongs in `DECISIONS.md`.

**Done 2026-08-29.** Nine markers came off first — eight in `SyntaxTest.js`, one in
`EntryPointTest.js` — and the gate was run red: **9 failing cases**, each with the message the
specification predicts. The two loudest: the nested template literal answered ``${ `a2b` }``, the
inner placeholder substituted while the expression around it stood, and the escape cases answered
`resolved resolved` and `resolved \resolved`.

`EXPRESSION`, the four `MATCH_` constants, `resolveMatch` and the `split`/`join` loop are gone.
`scan` walks a text with `indexOf("${")` and hands each expression to `scanExpression`, which
counts braces through a five-state stack — code, single- and double-quoted, template, regular
expression, with a class inside it. `resolveText` builds its answer by position. `npm test` green:
**388 passed and 30 expected fail (418)**.

**Five tests were added for the three rules settled on 2026-08-29** — the restart, regex literals,
the parity of the backslash run — because nothing pinned them. Run against the source from before
the scanner, only **two** of the five go red: the brace inside a regular expression literal, and
the even backslash run. The other three answer the same on both implementations, which is written
into the test file rather than implied away: the old regular expression could not cross an inner
brace either and advanced to the second delimiter by itself, and it captured a single backslash and
replaced as text, which happens to leave an odd run of three looking correct. They state the rule
and guard the scanner; they do not prove a fix.

`npm run bench`, three runs per variant. Against stage 1, `mean` in milliseconds:

| case | stage 1 | stage 2 |
|---|---|---|
| 20 distinct expressions | 0.0453–0.0464 | 0.0265–0.0280 |
| one expression 20 times | 0.0034–0.0036 | 0.0258–0.0266 |
| no expression at all | 0.0005 | 0.0002 |
| expressions carrying literals | 0.0094–0.0095 | 0.0258–0.0334 |
| WarmResolve depth 10 (drift indicator) | 0.0015 | 0.0015 |

Read in order: the **distinct** case is 40 % faster, which is the `split`/`join` gone. The
**repeated** case is 7.5 times slower and that is the rule, not a regression — twenty evaluations
where there was one, each of them served by the code cache. **No expression at all** is 2.4 times
faster: `indexOf` beats the old `RegExp.exec`, so the case a template engine hits most often gained
rather than lost, which was the open risk of this stage. The **literals** case is not comparable,
as its bench file says: it now evaluates expressions the regular expression could not see. And
`WarmResolve`, which stage 2 cannot reach, did not move at all — so unlike stage 1 there was no
batch drift and these numbers can be read as they stand.

**The regex-literal branch costs nothing measurable** and is kept; the numbers, the reasoning and
the blind spot of the division heuristic are in `DECISIONS.md`.

**One rule was sharpened after the stage was green,** on a case Frank brought: what an odd
backslash run escapes is the **delimiter**, not a region. The first implementation scanned an
escaped expression to its matching brace and copied the whole of it out, so
`Test \${"${test}"} Test` answered itself minus the backslash. It answers
`Test ${"resolved"} Test` now: the escaped `${` opens nothing, only those two characters are taken
out of the text, and the delimiter that stood inside what would have been its statement is an
expression like any other. The expectation was changed first and seen red, then the scanner. The
change makes `scan` shorter - an escaped delimiter needs no brace matching at all - and it removes
a question that had no good answer before, what an escaped delimiter without a matching brace would
mean. `SPECIFICATION.md` 3.2 carries the rule and the example.

**Stage 3 — `resolve` (4.3, 3.2, 3.4).** The `startsWith`/`endsWith` pair keeps its shape — it is
the correct rule for an input that is one expression in full — and gains three things: the
backslash run of 3.2 in place of the single `\${` check, `parseScope` on the delimited form, and
the rejection of a delimited form that does not end in `}`.

That rejection has to survive the method's own `catch` (`:260-263`), which today answers the
default for anything that goes wrong inside. It is thrown as a `SyntaxError` and re-thrown from
that `catch` by an `instanceof` check. The `trim` stays **inside** the `try`: moving it out would
change what `resolve(123)` does, and that belongs to another backlog entry.

The empty statement of 3.4 is one line in `execute` (`:28-29`), which answers `null` today where it
now has to answer `undefined`. It sits in this stage because it belongs to the same section, but
its visible effect is in **both** entry points: `resolveText("${}")` renders the text `undefined`
where `${}` stands unchanged today.

Markers removed: `test/spec/EntryPointTest.js`, "resolve recognizes the scope prefix in the
delimited form". Added: `resolve` reaching an ancestor through a prefix, and a prefix no link
carries falling back to the default — the combination of stage 1 and stage 3 that no test covers
today. The header comment of `ChainTest.js` says 5.3 and 5.4 are reachable through `resolveText`
only; that stops being true here.

**Done 2026-08-29.** The marker came off and five tests were added; the gate ran red with **six**
failing cases, each for its own reason — the prefix answering `undefined` because the filter was
hardcoded to `null`, the ancestor case the same, no throw where one is required, an odd run of
three backslashes answering `undefined`, and the empty statement answering `null` in both entry
points.

`resolve` decides on `indexOf("${")` now: an odd backslash run before it means the input is no
expression and stands one backslash lighter, a delimiter at position 0 means the delimited form,
and anything else is a statement in full. The delimited form must end with `}` or it is rejected
with a `SyntaxError`, which the method's own `catch` re-throws by an `instanceof` check while it
keeps answering the default for everything else. `parseScope` was lifted out of the scanner in the
same change, so both entry points carry one rule for 3.3. The empty statement is two lines in
`execute`. `npm test` green: **398 passed and 29 expected fail (427)**.

**Three of the five new tests were green before the change**, verified and written into the test
files: `resolve("${nowhere::value}", "fallback")` answered the default through the error path
because `nowhere::value` did not compile; the default applies to `null` as it does to `undefined`,
so the empty-statement default case could not tell the two apart; and an even backslash run goes to
the executer as a statement either way. They state the rules; they do not pin the fix.

`npm run bench`, three runs. Nothing moved — `mean` in milliseconds, stage 2 against stage 3:

| case | stage 2 | stage 3 |
|---|---|---|
| 20 distinct expressions | 0.0265–0.0280 | 0.0260–0.0283 |
| one expression 20 times | 0.0258–0.0266 | 0.0245–0.0265 |
| no expression at all | 0.0002 | 0.0002 |
| expressions carrying literals | 0.0258–0.0334 | 0.0264–0.0295 |
| WarmResolve depth 10 | 0.0015 | 0.0015–0.0016 |
| WarmResolve depth 1 000 | 0.0168–0.0184 | 0.0169–0.0171 |

`WarmResolve` is the case to read here, because stage 3 changes `resolve` and that is what it
calls: one `indexOf`, a backslash count and a `parseScope` per call, none of it measurable. One run
answered 0.0032 ms at depth 10 against 0.0015 in the other two — the same single-run outlier the
stage 0 baseline recorded, not a mode. The object `parseScope` allocates per occurrence does not
show in the text cases either.

**Stage 4 — the error policy (7).** Pending the decision below. Whatever it turns out to be,
`resolveText` must not abort because one expression is broken: the per-occurrence loop of stage 2
catches around each occurrence and renders `undefined`, which is what section 7 already promises.

**Stage 5 — close out.** `npm run test:coverage`, and the coverage entry in `BACKLOG.md` updated —
several of its numbers move, and its item 5, the unreachable outer `catch` of `execute`, is touched
by stage 4 and has to be re-read. Then the records below, then this file is deleted.

## The open decision — how far does "resolve may throw" reach?

Settled: a form that `resolve` rejects itself — `${` without a closing `}` — throws. Not settled:
what happens when the statement itself is not valid JavaScript.

`resolve("${a} ${b}")` passes the shallow form check — it starts with `${`, it ends with `}` — and
becomes the statement `a} ${b`. `resolve("\\${value}")` with an even backslash run does not start
with `${` and becomes a statement in full. Both are invalid JavaScript, both fail when the executer
compiles them, and both answer `undefined` or the default today, because `execute` (`:43-51`)
catches every executer error by design — section 7.

Frank's position on 2026-08-29 was that a statement the user got wrong need not be caught by the
resolver. Two things have to be weighed before that becomes the rule:

1. **It flips a passing conformance test.** `test/spec/EntryPointTest.js`, "resolve does not
   recognize a scope prefix without the delimiters", resolves `scope::value` as a bare statement
   and expects `undefined`. `scope::value` is a syntax error, so under the wider rule that call
   throws. The test pins 4.3 and would have to be rewritten together with the rule.
2. **Telling the two apart is not free.** `instanceof SyntaxError` is the obvious discriminator and
   it is wrong: a valid statement can raise a `SyntaxError` at runtime, `${ JSON.parse("{") }`
   being the everyday case. The reliable line is **when** the error appears — the executers compile
   synchronously and return a promise, so a synchronous throw out of `anExecuter.execute` is a
   compile failure while a rejection is a runtime failure. That holds for the three executers that
   build code through `new Function` (verified 2026-08-29); `EsprimaExecuter` parses synchronously
   through `espree` and has to be checked before it is relied on. The known blind spot: anything
   else that throws synchronously before the code runs is misread as a syntax error —
   `ContextDeconstructorExecuter` reads the context keys first, and on a resolver built over the
   global object that read throws today, which is a separate backlog entry.

Until this is decided, stages 0 to 3 are unaffected: none of them widens or narrows what is caught.
Stage 4 is where it lands, and the outcome belongs in `DECISIONS.md`, in `SPECIFICATION.md` 4.3 and
7, and in `CHANGELOG.md`.

## Verification

`npm test` green at the end of every stage. A marker is removed **before** the fix that makes it
pass, the test is run and seen red, and its failure message is read against what the specification
predicts — a message that does not match is a finding, not a formality.

`npm run bench` at the end of **every** stage that touches `src/` — corrected 2026-08-29, the
first version of this plan skipped stage 1, which changes the internal `resolve` and therefore
sits on the hot path of all four benchmarks. At the end of stage 2 with both scanner variants.
Several runs each; only depths 10 and 1 000 and the four text cases are stable enough to judge a
small change, and each comparison names a case the change cannot reach, to read the batch drift
off it.

`npm run build` is not affected — no entry point, no dependency and no published file changes shape
— but it runs once at the end anyway, together with a diff of `dist/`.

## Records to update when this is done

- `SPECIFICATION.md` — the five new rules into 3.1, 3.2, 3.4, 4.3 and 7; the *not yet implemented*
  notes in 3.1, 3.2, 4.3, 5.3 and 5.4 removed; six rows out of section 10.
- `DECISIONS.md` — one entry for the batch of rules settled on 2026-08-29, one for the regex
  literal measurement, one for the error policy. **The measurement entry carries the numbers**,
  not only the verdict: the stage 0 baseline of the four text cases and of depths 10 and 1 000,
  and what they became. This plan is deleted when it is finished, so anything left only here
  survives as git history and nothing else — and goal 5 asks whether the resolver came out of the
  whole v3 cycle faster, which is a question no single plan can answer. The deep depths stay out
  of that entry: they are bimodal by a factor of two and prove nothing across runs.
- `CHANGELOG.md` — under `## [Unreleased]`, one *Fixed* entry per defect and one *Changed* entry
  for the empty statement and the error policy, which alter behaviour a consumer can see.
- `BACKLOG.md` — the four entries this plan owns are deleted, and the coverage entry is updated
  with the numbers from stage 5.
- `AGENTS.md` — its `plans/` paragraph says no plan is running; it names this one while it runs,
  and goes back to saying none afterwards.
