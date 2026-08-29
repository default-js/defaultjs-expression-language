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
| 3.2 | The backslashes immediately before the `$` are counted. An **odd** number escapes the expression: exactly **one** backslash is consumed, nothing is evaluated. An **even** number does not escape: the expression is evaluated and **no** backslash is consumed. There is no general unescaping. | 2026-08-29 |
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

`npm run bench` at stage 0, at the end of stage 2 with both scanner variants, and once at the end
of stage 3, because the instance `resolve` is on the hot path of all three existing benchmarks.
Several runs each; only depths 10 and 1 000 are stable enough to judge a small change.

`npm run build` is not affected — no entry point, no dependency and no published file changes shape
— but it runs once at the end anyway, together with a diff of `dist/`.

## Records to update when this is done

- `SPECIFICATION.md` — the five new rules into 3.1, 3.2, 3.4, 4.3 and 7; the *not yet implemented*
  notes in 3.1, 3.2, 4.3, 5.3 and 5.4 removed; six rows out of section 10.
- `DECISIONS.md` — one entry for the batch of rules settled on 2026-08-29, one for the regex
  literal measurement, one for the error policy.
- `CHANGELOG.md` — under `## [Unreleased]`, one *Fixed* entry per defect and one *Changed* entry
  for the empty statement and the error policy, which alter behaviour a consumer can see.
- `BACKLOG.md` — the four entries this plan owns are deleted, and the coverage entry is updated
  with the numbers from stage 5.
- `AGENTS.md` — its `plans/` paragraph says no plan is running; it names this one while it runs,
  and goes back to saying none afterwards.
