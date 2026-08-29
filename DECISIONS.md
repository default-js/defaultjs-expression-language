# Decisions

Architecture and API decisions for `@default-js/defaultjs-expression-language`, newest first.

What matters in an entry is the *reasoning*. A decision recorded without it cannot be revisited later — only obeyed or overturned blindly. Entries stay even once superseded; a later entry references the one it replaces.

A decision that is only a step inside a running undertaking stays in that undertaking's plan under `plans/`. It moves here once it outlives the plan.

## Format

```
## YYYY-MM-DD — <the question, phrased as a question>

**Decision:** what was chosen.
**Reasoning:** why, and what evidence supported it.
**Alternatives:** what was rejected, and what would make it the better choice.
**Consequences:** what this costs, and what it rules out later.
```

---

## 2026-08-29 — Does `resolve` catch the errors of a statement?

**Decision:** No. `resolve` logs the statement and the error and then raises it to the caller.
`resolveText` keeps catching and renders on, but leaves the expression that failed standing in the
text exactly as it was written. **A default value covers an error in neither of them** — it answers
a missing result and nothing else. Sections 3.2 and 7 of `SPECIFICATION.md` are therefore rules of
`resolveText` alone.

*The second half was sharpened the same day.* `resolveText` first kept its old answer, putting the
default value or `undefined` where the expression had stood; Frank changed it to leaving the
expression as written, for the same reason the first half exists: `undefined` in the middle of a
rendered page says nothing about what went wrong, while the expression itself points at it. It also
makes the default value mean one thing across the whole package instead of two.

**Reasoning:** Frank's, and it is about who is standing there. `resolveText` renders a document:
one broken expression must not take the page with it. `resolve` is called from code for one value,
and answering `undefined` hides the mistake at the only place where it is still cheap to find. The
default value carried two meanings before this — "the expression answered nothing" and "the
expression blew up" — and a caller could not tell them apart; it now carries one, the one 4.4
gives it.

**Alternatives:** Keeping the catch and letting only errors from statements that do not *compile*
through, so that a name no link carries stays soft. That was the counter-proposal, and it was
measured on 2026-08-29: `resolve` catching nothing costs **25 tests**, and only 11 of them are the
error rule itself — the other 14 are the resolver's ordinary business, a name the chain does not
carry, which is a `ReferenceError` under two of the four executers. `ChainTest`'s "never sees the
context of a link below" was the sharpest of them: the chain's own isolation guarantee, expressed
through a missing name. The distinction was verified to be implementable — all four executers
compile synchronously and execute asynchronously, so a non-compiling statement throws out of
`Executer.execute` while a missing name arrives as a rejected promise. Frank weighed it and chose
the simpler contract: `resolve` answers a value or says why it cannot, with no second class of
error that is quietly absorbed.

**Consequences:** The 14 tests were not deleted but moved: where what is pinned is the chain, the
dialect of an executer or the global-write guarantee — not the error policy — they now ask through
`resolveText`, which still answers the default and can state the rule for every executer alike.
`test/TestUtils.js` gained `catchError`, so an expected error is asserted by hand and the suite
keeps to `toBe`/`toBeDefined`/`toBeUndefined`. `execute` no longer swallows, which removed the
unreachable outer `catch` the coverage entry in `BACKLOG.md` carried as item 5, and with it a
`Promise` allocation per execution. And a consumer calling `resolve` directly must now handle a
rejected promise where a silent `undefined` used to arrive — the loudest breaking change of 3.0.0,
made while the version is still unreleased.

## 2026-08-29 — What do the open edges of the expression syntax do?

**Decision:** Four rules, all now in `SPECIFICATION.md`, settled with Frank before the parser was
written.

**Escaping is about the delimiter, and parity decides.** The backslashes before the `$` are
counted: an odd number escapes the `${`, an even number does not, and exactly one backslash is
consumed by an escape. What is escaped is the **delimiter, not a region** — an escaped `${` opens
nothing, so the text behind it is scanned like any other and a delimiter inside what would have
been its statement is an expression of its own. `Test \${"${test}"} Test` answers
`Test ${"resolved"} Test`.

**An empty statement answers `undefined`**, the same as `return;` in JavaScript.

**A second `${` outside a literal starts a new expression.** Everything between the delimiters is
meant to be JavaScript, and a second opening delimiter cannot be part of it, so the open one is
abandoned and its text stands.

**`resolve` decides the form on the first characters alone.** An input that starts with `${` is
the delimited form and must end with `}` — otherwise it is rejected with a `SyntaxError`, which is
thrown rather than caught. Anything else is a statement in full and carries no scope prefix.

**Reasoning:** These are the edges that had no answer when the specification was written, and the
parser had to be told what to do at each of them. Parity is the rule every language with an escape
character uses, and it is the only one under which an escaped backslash can be written down at all.
The delimiter reading of the escape follows from there: the syntax has no concept of a region, so
escaping cannot open one, and the alternative — skipping the whole would-be statement — would make
one backslash silently disable expressions the author cannot see. `undefined` for the empty
statement is what the language itself answers, and 3.4 promises arbitrary JavaScript, so the
resolver has no business inventing something else. For `resolve`, the input is one expression by
definition, so its end is the end of the input and no brace matching is needed at all — which is
also why the scanner stayed a private helper of `resolveText` instead of becoming its own module.

**Alternatives:** For `resolve`, checking more than the two delimiters — rejected, because whether
the statement is valid JavaScript is the executer's business and it reports it. For the escape,
treating an escaped expression as a region that stands verbatim — that was the first
implementation, and Frank rejected it: it hides expressions behind a single backslash. For the
empty statement, answering `null` — that was the accident the code had, and nothing argued for it.

**Consequences:** `resolve` can now throw, which section 7 had to be extended for: a rejected form
is not an execution error, and nothing has run at that point. That is the smaller half of the
error-policy question; the larger one — whether a statement that does not compile propagates out of
`resolve` — is still open and carried in `plans/expression-parsing.md`. The escape rule makes an
escaped delimiter cheaper to scan than an unescaped one, since no brace matching is needed. And
`${}` becomes an expression where it used to be text, so a text carrying it changes its answer.

## 2026-08-29 — Does the expression scanner recognize regular expression literals?

**Decision:** Yes. Inside a statement a `/` opens a regular expression literal unless the last
character that is not whitespace is an identifier character, a digit, `)` or `]` — then it is
division. Braces inside such a literal do not count towards the matching closing brace, and a
character class hides a `/`. Comments stay out: a brace inside `/* … */` or behind `//` counts like
any other, which `SPECIFICATION.md` 3.1 names as a limit.

**Reasoning:** Frank made the branch conditional on its cost, so it was measured both ways on
2026-08-29, three runs each, immediately after the scanner replaced the regular expression. The two
variants are indistinguishable — `mean` in milliseconds, over the four cases of
`ResolveText.bench.js`:

| case | with the branch | without it |
|---|---|---|
| 20 distinct expressions | 0.0265–0.0280 | 0.0267–0.0295 |
| one expression 20 times | 0.0258–0.0266 | 0.0251–0.0270 |
| no expression at all | 0.0002 | 0.0002 |
| expressions carrying literals | 0.0258–0.0334 | 0.0253–0.0259 |

Every difference is inside the run-to-run spread, and `WarmResolve`, which no variant touches,
answered identically in all six runs (0.0015 ms at depth 10), so the machine did not drift between
the two halves of the comparison. The reason the branch is free is that the per-character work only
runs **inside** an expression: a text is walked by `indexOf("${")`, so a document with little
expression in it never enters the state machine at all.

With no cost to weigh, correctness decides alone: without the branch `${ /}/.test(x) }` ends at the
brace inside the literal, and the statement is cut in the middle.

**Alternatives:** Leaving regular expression literals out and documenting them as a limit next to
comments, which is what the specification would have said had the measurement gone the other way.
A full JavaScript lexer instead of the heuristic — rejected as far more than 3.1 asks for, and it
would have to be maintained against the language.

**Consequences:** The scanner carries five states instead of three, and one heuristic that can be
wrong: where a regular expression legitimately follows `)` or `]` — `${ (() => { if (a) /x/.test(b)
})() }` is the shape — the `/` is read as division. Nothing is cut unless that literal also carries
a brace. The everyday cases are safe in both directions, because division follows a value and a
literal does not. `test/spec/SyntaxTest.js` pins both directions, and the division test is there to
keep the heuristic honest rather than to prove a fix.

## 2026-08-24 — How does a test state a rule the code does not keep yet?

**Decision:** It is written as a normal test and marked `it.fails`. Vitest then counts it as passing
while it fails, and the moment the behaviour becomes correct the test **fails for passing**, which
forces the marker to be removed in the same change that lands the fix. Every such test carries a
comment naming the `BACKLOG.md` entry it waits for. Before a marker is written down, the test is
run **once without it** and its failure message is read against what the specification predicts.
This is how `test/spec/` was built between 2026-08-22 and 2026-08-24, and it is how any later test
for an agreed but unimplemented rule is written.

**Reasoning:** Fourteen places where the code and `SPECIFICATION.md` disagree had to be pinned
before any of them was fixed — several touch the same three files and some interact, so fixing
them without the rules pinned first would have been changing behaviour nobody was watching. A
skipped test states nothing and rots silently; a failing test cannot be committed with a green
gate; a comment in the specification is not executable. `it.fails` is the only one of the three
that both keeps the gate green and cleans itself up. The run-without-the-marker step is the
countermeasure to its one weakness: a `.fails` test also passes when it fails for the *wrong*
reason — a typo, a wrong import, a misunderstood rule. It paid for itself twice, once on a
backslash that the shell had eaten out of a test string, and once on a nested template literal
that failed differently than predicted.

**Alternatives:** `it.skip` with a comment — rejected, it proves nothing and nothing ever forces
it back on. Writing the tests only when each fix is written — rejected for the reason above, and
because it would have left the specification's interview-written rules unexecuted; several of them
had never run at all, and writing them out is what turned them from agreed sentences into verified
behaviour.

**Consequences:** A green gate no longer means "everything specified works" but "everything works
that is not marked as pending", and the count of expected fails is the measure of what is left —
68 on 2026-08-24. Whoever fixes a backlog entry has to remove markers as part of it and will be
told by a red gate if they forget. A whole-suite review with every marker stripped is worth
repeating before a release: it is what proves no marker has gone stale.

## 2026-08-24 — How does a test express a rule that has to hold under every executer?

**Decision:** The suite loops over an `EXECUTERS` table exported from `test/TestUtils.js`, which
lists every registered executer together with a `variableName(property)` function answering the
name a statement has to use to reach a context property under it. A test names that variable in a
constant of its own and inserts it into the expression, so it measures the rule rather than the
spelling. Executer-specific behaviour is not skipped in those loops — it is stated in
`test/spec/ExecuterTest.js`, per executer, in a table of the three freedoms 8.3 grants.

**Reasoning:** The rules of sections 5, 6 and 7 have to hold under every executer, so testing them
under one proves a quarter of what is claimed. Writing them out four times by hand would have been
four places to update. The `variableName` indirection exists because
`ContextObjectExecuter` addresses a context value as `ctx.value` while the others use the bare
name: without it the section 5 suite would have reported five rules broken under that executer
which it in fact keeps. Keeping the executer-specific answers in one table in `ExecuterTest.js`
rather than as conditions spread through the loops means a new executer is described in one place,
and a difference nobody intended shows up as a wrong table row instead of a skipped test.

**Alternatives:** `describe.each` — rejected, it widens the vitest surface the suite deliberately
keeps at `describe`/`it`/`expect` and three matchers, and a plain `for` loop reads the same.
Running each suite under the default executer only — rejected: 8.3 says everything outside its
three freedoms holds regardless of the executer, and that sentence is worth checking rather than
trusting.

**Consequences:** Adding an executer means one row in `EXECUTERS`, one row in the `FREEDOMS` table
of `ExecuterTest.js`, and the whole conformance suite runs against it. A test that must differ per
executer — the negative guarantee of 6.5 is the one case so far — picks its marker inside the loop
(`const pin = leaksToday ? it.fails : it`) instead of being marked wholesale, because a blanket
marker fails on the executers that already keep the rule.

## 2026-08-24 — What do the edge cases of the expression parser and of the scope walk do?

**Decision:** Three rules, all now in `SPECIFICATION.md`. A brace inside a string literal does not
count towards the matching brace, so `${ "}" }` is one expression with the statement `"}"`. An
opening `${` with no matching closing brace is not an expression at all: the text stands
unchanged, no error, no partial replacement. And where two links of a chain carry the same name,
`${name::statement}` answers from the first one found while climbing towards the root.

**Reasoning:** All three were found by probing the edge cases of sections 3 and 5 on 2026-08-24,
before the matching-brace parser and the scope-walk fix are written — which is the only cheap
moment to decide them. Counting a brace inside a string literal would cut `${ "}" }` in the middle
of a literal, which no reader of the expression would expect. Leaving an unterminated `${` alone
keeps the failure mode of the syntax uniform: text that is not an expression is text. The scope
walk taking the first hit makes 5.3 behave like 5.2, so one mental model covers both lookups, and
it follows how a chain is used: the deeper link is the one introduced most recently.

**Alternatives:** For the unterminated delimiter, throwing or replacing up to the end of the text.
Rejected — both turn a typo in a template into a hard failure or into silent corruption, and a
template engine feeding this package cannot always guarantee the text it passes. For duplicate
names, answering from the root-most link. Rejected: it would mean a resolver deeper in the chain
cannot shadow a name, which contradicts the purpose of the chain stated in section 1.

**Consequences:** The parser of the brace fix has to know string literals — `'`, `"` and backtick
— which is more than counting characters, and it has to be able to reach the end of the text
without a match and then do nothing. Both are now pinned by tests marked `fails`. Still open, and
noted in `BACKLOG.md` rather than decided here: what an escaped backslash in front of an
expression means, and what an empty statement `${}` evaluates to.

## 2026-08-24 — May an executer dictate how a statement addresses a context value?

**Decision:** Yes. How a context value is written inside a statement is the executer's own, a
third freedom alongside the two 8.3 already granted. `ContextObjectExecuter` demands `ctx.` in
front of every context value; the other three put the properties into scope, where the bare name
works. `SPECIFICATION.md` 8.3 now says so, with both dialects spelled out.

**Reasoning:** The conformance suite of section 5 turned the difference up on 2026-08-24: five
tests failed under `ContextObjectExecuter` alone. Addressed as `ctx.value` that executer keeps
**every** rule of 5.2 the other three keep — shadowing, the walk to an ancestor, a key holding
`undefined`, the prototype chain. So the chain, which is what section 5 is about, is not affected
at all; only the spelling is. An executer is a strategy for turning a statement into a value, and
what a statement may look like is part of that strategy. Forbidding it would mean rewriting
`ContextObjectExecuter` around a rule nothing needed.

**Alternatives:** Make every executer put the context properties into scope, keeping `ctx.` as an
addition. Rejected: it removes the one property that distinguishes `ContextObjectExecuter` from
the others without a consumer asking for it. It would become the better choice if expressions
ever have to be portable between executers — that is the cost below.

**Consequences:** Switching executer can mean rewriting expressions, and that is now documented
rather than discovered. `README.md` has to carry the dialects once it is rewritten, since it is
what a consumer and an AI system read first. Test code that runs one case against several
executers needs the name per executer — `test/spec/ChainTest.js` carries a `variableName`
function for exactly that. Open alongside it, and only an idea so far: making the `ctx` prefix of
`ContextObjectExecuter` configurable, so a consumer can pick the identifier. It has its own
`BACKLOG.md` entry.

## 2026-08-24 — When does a link count as providing a context?

**Decision:** When the caller handed a context to the constructor — anything that is neither
`null` nor `undefined` — or when a value has been set on the link since. What the context holds
does not matter: an empty object counts. A link provides no context only if it was built without
one and nothing has been written to it since. This replaces the rule written on 2026-08-22, under
which a link counted only while its context held at least one reachable value.

**Reasoning:** The older rule needed a definition of "holds a value", and pinning it in stage 2
of the conformance plan showed that definition does not exist: `#initPropertyCache` walks the
prototype chain to its end, so the cache of even `{}` holds `hasOwnProperty`, `toString` and the
rest of `Object.prototype`. Read literally, every context would be non-empty and `effectiveChain`
would equal `chain` again; read as intended, the specification would have had to draw a boundary
somewhere inside the prototype chain — own keys plus everything up to but excluding
`Object.prototype` — and then explain why `{ class: 1 }` is empty while `{ value: 1 }` is not.
That is a lot of rule for a getter whose purpose is debug output. Deciding it at construction is
one comparison, needs no cache, and cannot drift as the context changes shape.

**Alternatives:** The 2026-08-22 rule with the prototype boundary written out. It would become
the better choice if a consumer ever needs `effectiveChain` to answer "which links can actually
contribute a value to a lookup" rather than "which links were given a context" — the two differ
for a link handed an empty object.

**Consequences:** `context: null` and `context: {}` are told apart here, and only here; for a
lookup they stay equivalent (6.3). A link built without a context joins `effectiveChain` and
`contextChain` the moment a value is written to it, so both still describe a state rather than a
structure. The three assertions in
`test/ExecuterTests/WithScopedExecuterTests/ResolverChainTest.js` that expect a `context: null`
link to appear in `effectiveChain` are wrong under this rule and are marked as such.

## 2026-08-22 — Where does the specification of the resolver live, and what is it for?

**Decision:** A permanent `SPECIFICATION.md` in the repository root, written from an interview
with the author rather than from the code, and published with the package. `README.md` carries
the consumer-facing subset, this file carries the reasoning behind individual answers.

**Reasoning:** There was no statement of what the `ExpressionResolver` is meant to do. The code
could not supply one: at least one of its behaviours turned out to be a year-old regression
rather than an intention, so every fix derived from reading it risked cementing an accident and
every test written against it risked pinning one. A specification records *what*, this file
records *why* — different documents, and merging them would have buried the rules in argument.

**Alternatives:** Folding it into `DECISIONS.md` was rejected for the reason above. Putting it
into `README.md` alone was rejected because internal semantics — the chain walk, the snapshot
rule, error handling — have no place in a getting-started document but must be written down
somewhere.

**Consequences:** A fourth permanent record to keep in step. The specification states intended
behaviour, so it disagrees with the code in fourteen places listed in its section 10; each one
is a `BACKLOG.md` entry, and the specification is the reference for what the fix has to achieve.
Publishing it adds a file to the `files` array.

## 2026-08-22 — Does a key holding `undefined` shadow a value nearer the root?

**Decision:** Yes. A lookup is decided by whether a link **carries the key**, not by what the key
holds. A key defined as `undefined` answers and stops the walk; a key a link does not carry is
passed on to its parent.

**Reasoning:** It is what JavaScript scoping itself does, and the property cache is keyed by name,
so it is also the cheapest rule — one map lookup per link, no value inspection.

**Alternatives:** Reading `undefined` as "not there" and walking on was proposed, on the ground
that the package elsewhere uses `undefined` to mean a thing does not exist. It was rejected:
that rule is about what a *lookup answers to the caller*, not about how a link's own keys are
read. It would also have made it impossible for a link to deliberately hide an inherited value.

**Consequences:** A context built as `{ item: obj.missing }` carries the key `item` and hides
whatever the parents hold under that name. Combined with the default-value rule the caller still
sees a value where one was passed, so the effect surfaces only when no default is given.

## 2026-08-22 — Is a context a snapshot or read live?

**Decision:** **Names are a snapshot, values are live.** The set of keys a link contributes is
captured when the resolver is built; the values behind them are read at the moment of the lookup.
A key added directly to the handed-in object afterwards is invisible until
`contextHandle.resetCache()`, `updateData` or `mergeContext` rebuilds the set.

**Reasoning:** That cache is what makes the chain walk cheap — one map lookup per link. It also
matches how the package is used: a link of a stacking context is filled and then used, not
extended while it is being read.

**Alternatives:** A live fallback — `Reflect.has(data, property)` on every cache miss — was
weighed and rejected. It doubles the cost of the miss path, which is the path that walks the
entire chain, and `ownKeys`, which `ContextDeconstructorExecuter` calls on *every* execution,
would have to be rebuilt live along with it.

**Consequences:** Mutating an object handed to a resolver is not enough to make a new key visible,
which is a documented side effect rather than a defect. It also decides `effectiveChain`: a link
counts as carrying values by what the cache holds, so keys the cache drops — reserved words,
names that are not valid variable names — do not count.

## 2026-08-22 — Is reaching the global object a promise of the package?

**Decision:** No. It is described as a **mechanism** and the details belong to the executer.
`WithScopedExecuter` and `ContextDeconstructorExecuter` run the statement as ordinary JavaScript,
so the engine resolves a name the chain does not carry against the global object and neither
executer can prevent it. `EsprimaExecuter` rewrites identifiers onto one context variable and
reaches globals only through its `RESERVED_NAMES` list or a global context object.

**Reasoning:** The resolver does not execute anything itself. Promising a global fallback would
be promising something only some executers keep, and the esprima executer already breaks it.

**Alternatives:** Specifying it as a guarantee every executer must honour would give consumers one
rule to rely on, at the price of constraining every future execution strategy — including a
sandboxed one, which is the direction a CMS deployment would want.

**Consequences:** `buildSecure` filters the context, not the globals: `fetch`, `console` and
`document` stay reachable from an expression. It is a way to hand over a cleaned context, not a
sandbox, and must not be documented as one. A consumer who wants a name resolved locally puts it
into the context so the engine finds it before walking out.

## 2026-08-22 — What happens when an expression writes?

**Decision:** Writing from inside an expression is **not specified**; `updateData` and
`mergeContext` are the supported path. One guarantee is given, and it is negative: while writing
to the global object is not explicitly allowed, an assignment inside an expression must not
create or change anything there. The switch that allows it exists at three levels, each falling
back to the one above — `ExpressionResolver.allowGlobalWrite`, the constructor option
`allowGlobalWrite`, and the fifth argument of the static `resolve` / `resolveText` — and defaults
to `false`.

**Reasoning:** What an assignment does is decided by the executer, not by this package.
`WithScopedExecuter` routes it through the context proxy and can be intercepted;
`ContextDeconstructorExecuter` writes to a destructured local binding and cannot; `EsprimaExecuter`
cannot execute an assignment at all, because `x = 5` is rewritten to `ctx?.x = 5`, a syntax error.
Promising a destination would promise what only one executer can keep. The negative guarantee is
different in kind: expressions are authored by users in CMS deployments, and a page where an
expression can write to `window` is a problem regardless of which executer is in use.

**Alternatives:** Specifying "a write always lands in the own context" was worked out and
rejected: it is implementable for the `with`-based executer only, and choosing it would have
locked `with` in as the default against the decision to move away from it.

**Consequences:** The protected state means different things per executer — interception for the
`with`-based one, strict-mode generation and a reported error for the deconstructor. That
difference is part of the specification rather than hidden behind the switch. Turning the switch
on restores plain JavaScript behaviour, including accidental globals.

## 2026-08-22 — Is an expression in a text evaluated once or once per occurrence?

**Decision:** **Once per occurrence.** `${counter++}` twice in one text increments twice.

**Reasoning:** Measured before deciding, against `src/` under node 24.19: one warm evaluation of
`${a + b}` costs about 3.2 µs; a text with 500 identical occurrences resolves in 0.05 ms today,
so evaluating each occurrence separately would add about 1.6 ms. Against that, a text with 500
*distinct* expressions costs 21.8 ms today — about 44 µs per expression, more than ten times the
evaluation it performs, because `resolveText` runs the regex and then `split`/`join`s the whole
text once per expression. The saving that one-evaluation-per-expression buys is real but small,
and it is dwarfed by the replacement machinery it sits inside.

**Alternatives:** Keeping one evaluation per distinct expression and documenting the side effect
was the cheaper option and would have stayed correct for side-effect-free expressions. It was
rejected because an expression with a side effect has to mean what it says.

**Consequences:** The rewrite rides on the single-pass parser that finding the matching closing
brace needs anyway: walk the text once, evaluate each expression where it stands, build the
result. That also removes the quadratic behaviour over the number of distinct expressions.

## 2026-08-22 — How does a caller reach the newer options of the static entry points?

**Decision:** Two call forms. The positional one keeps its shape and gains
`aAllowGlobalWrite` as a fifth argument; alongside it, a **single configuration object** carries
everything: `resolve({ expression, context, defaultValue, timeout, allowGlobalWrite })`. Which
form is in use is decided by the first argument alone — an expression is always a string, a
configuration always an object. The instance methods stay positional.

**Reasoning:** An options object in *second* position cannot be told apart from a context: a
context is an arbitrary object and may itself carry a key named `context`, so any detection would
be a heuristic and therefore a trap. Moving the expression into the object removes the ambiguity
entirely and costs one `typeof` per call, which is not measurable against 3.2 µs of evaluation.
The instance methods need no such form because everything a configuration would carry beyond the
default value is already fixed on the instance and must not be overridable per call.

**Alternatives:** Object-only for the new options would have kept one call shape per method and
reads better at the call site — `resolve(e, ctx, undefined, undefined, true)` tells nobody what
`true` means. It was rejected because existing positional code should not have to be restructured
to reach a switch.

**Consequences:** Two shapes to document and test per static method. In the configuration form
"a default value was passed" becomes the presence of the key `defaultValue`, which is more precise
than the `arguments.length` check the positional form has to keep using. The configuration form is
what the documentation recommends as soon as more than a context and a default are involved.

## 2026-08-22 — How far along the chain does each data method reach?

**Decision:** Per method, by convention, and written down: `getData` reads along the chain and the
nearest link carrying the key answers. `updateData` changes the value **where the key lives**,
creating it on the calling resolver only when no link carries it. `deleteData` removes the key
from exactly **one** link. `mergeContext` assigns shallowly into **one** link's context and does
not search. A `filter` selects exactly one link, and **a filter matching no link throws** in all
four.

**Reasoning:** These methods are the path with guaranteed behaviour, identical under every
executer, so their reach has to be stated rather than inherited from whatever the code does — the
code answers three different things today and one of them is a defect. The throw follows the same
line: a filter naming a link that does not exist is a mistake in the calling code, unlike a scope
name inside an expression, which is data and must never stop a render.

**Alternatives:** A switch widening `deleteData` to the whole chain was agreed and then withdrawn:
a filter names one link, a chain-wide switch names all of them, and the two contradict each other
in one call. Rather than invent a rule for the contradiction, the method stays at one link;
walking the chain and deleting per link is three lines of consumer code, since `parent` and `name`
are public.

**Consequences:** An unmatched filter is silently ignored today, so this is consumer-visible.
`mergeContext` becomes the only way to define a key on one link when a link nearer the root
already carries it — `mergeContext({ key: value })` with a one-key object. A separate `setData`
was proposed for that and dropped: no method is added, the surface stays at four.

## 2026-08-21 — What module format does the webpack config use, and how does it read JSON?

**Decision:** `webpack.config.mjs`, native ESM, reading `package.json` and
`entries.config.json` through `createRequire(import.meta.url)` rather than through JSON import
attributes. The rename is deliberately independent of the open `"type": "module"` question.

**Reasoning:** The config was the last CommonJS file involved in the build, while
`vitest.config.mjs` was already ESM — two module systems across the two config files of one
repository, for no reason. `.mjs` is explicit and keeps working whichever way `"type"` is
decided, which is exactly what decouples this from that question. webpack-cli needs no
configuration for it: `.mjs` sits second in its default extension list, right after `.js`
(`node_modules/webpack-cli/lib/webpack-cli.js:1953`) — read there, not assumed. Because `.js`
is tried first, the old file had to be renamed rather than left beside the new one. No npm
script changed.

`createRequire` over `import … with { type: "json" }` is a verification argument, not a matter
of taste. Import attributes run on this machine's Node 24.19 with no warning on stderr —
measured, against the assumption in the backlog entry that requested this work, which claimed
the opposite. But the documented floor of the project is Node ≥ 22.15 (see the entry below),
and no Node 22 is installed here to measure against. `createRequire` costs two lines and holds
across the whole supported window without a claim that could not be checked.

The rewrite was held against the artifacts rather than against the tests alone: a build with
the old config and a build with the new one produce the same nine files in `dist/`, with
identical sha256 sums. `__dirname` became `import.meta.dirname`, and `argv.target` went in the
same rewrite — Karma was its only caller — so `output.path` is now
`path.resolve(import.meta.dirname, "dist")`.

**Alternatives:** Import attributes are the cleaner ESM form and become the better choice the
moment the floor is verified against Node 22.15; the change is one line per JSON file.
Renaming to `.cjs` instead — which the version-generation entry below anticipated — keeps
CommonJS alive in a package that is otherwise pure untranspiled ESM. Leaving the file as `.js`
works only until `"type": "module"` is set, at which point it breaks.

**Consequences:** `scripts/generate-version.js` is now the only CommonJS file left in the
repository, and it is no longer coupled to the config, so the `"type": "module"` decision has
to deal with it on its own. Everything naming the config has to say `webpack.config.mjs`; the
entries below were corrected where they describe the present, and left untouched where they
record the past.

---

## 2026-08-21 — Which Node version does this project need, and does it go into `engines`?

**Decision:** The toolchain needs **Node ≥ 22.15, and not Node 23**. That floor is recorded in
`.nvmrc` (which names 24, the version developed against) and in the Development section of
`README.md`. **`engines` stays unset.**

**Reasoning:** Read off the installed tree rather than assumed: `webpack-dev-server@6` declares
`>= 22.15.0`, the highest floor among all dependencies. `vitest@4` declares
`^20.0.0 || ^22.0.0 || >=24.0.0`, which is what excludes 23. Everything else sits lower —
`webpack-cli` at `>=20.9.0`, `playwright` at `>=20`, `webpack` at `>=10.13.0`.

`engines` is npm's field for *consumers*: it is checked when someone installs this package, not
when we build it. This library targets the browser, ships untranspiled ESM, and does not care
which Node produced the tarball. Putting a build-time requirement there would refuse or warn on
installs that are perfectly fine. The only runtime floor that could legitimately go in comes
from `espree` (`^18.18.0 || ^20.9.0 || >=21.1.0`), and it applies solely to consumers who reach
for `EsprimaExecuter` under Node — a narrow enough case that a documented note beats a hard
constraint.

**Alternatives:** Setting `engines` with the toolchain floor would make CI failures louder at
the cost of every consumer. Setting it to the `espree` range would be defensible if the esprima
executer were the default; it is not (see the entry of 2026-08-20).

**Consequences:** Nothing enforces the floor. A contributor on Node 20 gets a failure from
`webpack-dev-server` rather than from npm, and on Node 23 one from Vitest. `.nvmrc` and the
readme are the only signposts, so both have to be updated when the floor moves.

---

## 2026-08-21 — How does the package version get into the code?

**Decision:** `scripts/generate-version.js` derives `src/version.js` from `package.json` before
every build, wired in through `prebuild:dev`, `prebuild:prod` and `predev`. The browser entry
points import `VERSION` from it. `src/version.js` is generated, therefore gitignored, and
published anyway.

**Reasoning:** The previous approach patched `${version}` into the emitted files with
`replace-in-file-webpack-plugin`, after webpack had finished. Three defects followed from that:
the published raw sources `browser.js` and `browser-all-executers.js` kept the literal
placeholder, because the plugin only rewrote `dist/`; the source maps no longer matched their
content, because bytes changed after they were generated; and the hardcoded `dir: "dist"`
rescanned the other mode's artifacts on every build. Generating a module instead makes the
version a normal import — bundled, minified and mapped like any other code, with nothing
touching the output afterwards.

That a gitignored file still reaches consumers was verified, not assumed: `npm pack --dry-run`
lists `src/version.js` in the tarball. The `files` array is an allowlist and outranks
`.gitignore`.

The script is CommonJS because this package has no `"type": "module"`. When that question is
settled it is renamed to `.cjs` together with `webpack.config.js`.

*Update 2026-08-21: `webpack.config.js` became `webpack.config.mjs` on its own — see the entry
at the top — so that pairing no longer exists. `scripts/generate-version.js` is the last
CommonJS file in the repository and the `"type": "module"` decision has to handle it alone.*

**Alternatives:** `DefinePlugin` is a smaller change but fixes only the bundles, leaving the raw
published sources broken — which was the worst of the three defects. Checking `src/version.js`
into git, as `defaultjs-common-utils` does, avoids a generated file being absent in a fresh
clone before the first build; the cost is a generated artifact in the diff of every release.

**Consequences:** A fresh clone has no `src/version.js` until something builds. Nothing imports
it outside the two browser entries, so tests are unaffected, but any future importer must be
aware. The version now has to be right in `package.json` before a build, not before a publish.


## 2026-08-21 — Do we enable tree shaking for the `dist/` bundles?

**Decision:** No. `optimization.usedExports: false` stays in `webpack.config.mjs`, and a
`sideEffects` field must **not** be added to `package.json` — at least not as `false`. Both
were reviewed as part of stage F of the toolchain plan, which suggested the opposite; the
measurements below overruled it.

**Reasoning:** Two experiments, each a build followed by a look at what came out.

*Dropping `usedExports: false`* guts the module bundle. `dist/module-…min.js` falls from
13 809 to 3 685 bytes, and `resolveText`, `defaultExecuter`, `ResolverContextHandle` and
`DefaultValue` are gone from it — only the executer registration survives. The cause is not
tree shaking misbehaving: the `module` entry has no `output.library`, so webpack correctly
concludes that nothing consumes the entry's exports and prunes everything reachable only
through them. The browser entries are unaffected, because their code sets
`GLOBAL.defaultjs.el` as a side effect rather than through exports.

*Adding `sideEffects: false`* is worse. `dist/browser-…min.js` drops from 13 403 to 8 126
bytes, and the bundle loses `context-object-executer`, `context-deconstruction-executer` and
`esprima-executer` — two of the three default executers and the optional one. Every executer
registers itself through a bare `import "./XExecuter.js"` in `src/executer/index.js`;
declaring the package free of side effects tells every bundler, ours and the consumers', that
those imports may be discarded.

Both were confirmed the other way too: with the current settings a Playwright smoke test
loads each built browser bundle in Chromium and finds `VERSION` 3.0.0, the three default
executers registered, `esprima-executer` absent from the small bundle and present in the
all-executers one, and `resolveText("${1 + 1}")` returning `"2"`.

**Alternatives:** Tree shaking becomes worth revisiting the moment the `module` entry gets an
`output.library`, or is dropped — bundler consumers reach the package through `main`, which
points at the raw `index.js`, not at `dist/`. A `sideEffects` field could be introduced as an
*array* whitelisting the self-registering modules (`./src/executer/*.js`, `./browser.js`,
`./browser-all-executers.js`); `false` is the value that must never appear. Both are tracked
in `BACKLOG.md`.

**Consequences:** The bundles carry unused exports of `@default-js/defaultjs-common-utils`,
which is what the roughly 10 KB difference in the module bundle is. That is the price of
correctness here, and it is paid only by consumers of `dist/`, not by those importing `src/`.
The `usedExports: false` line is load-bearing and carries a comment saying so, in the same
way as the commented-out esprima import in `src/executer/index.js`.


## 2026-08-21 — Which test runner replaces Karma?

**Decision:** Vitest 4 in browser mode, with Playwright/Chromium as the provider and
`@vitest/coverage-v8`. Karma, the seven `karma-*` packages, `jasmine-core`, `puppeteer` and
`karma.conf.js` go once the new suite reaches parity. webpack stays the bundler and keeps
doing what it is for: producing `dist/`.

**Reasoning:** Karma is deprecated by its own maintainers — *"Karma is deprecated and is not
accepting new features or general bug fixes"* (`node_modules/karma/README.md`, 6.4.4) — and
coverage in that setup never worked, which is goal 3 of the v3 cycle. Four candidates were
measured the same way (scratch project, `npm i --ignore-scripts`, packages including
transitive, browser driver counted separately):

| Candidate | packages | size | real browser |
|---|---|---|---|
| `jasmine-browser-runner` 5.0.0 | 48 | ~29 MB | yes, via selenium |
| `vitest` 4.1.11 + browser + `coverage-v8` | 71 + 3 | ~49 MB | yes, via playwright |
| `@web/test-runner` 1.0.0 + `-playwright` | 293 + 3 | ~58 MB | yes, via playwright |
| `jest` 30.4.2 + `jest-environment-jsdom` | 336 | ~59 MB | no, jsdom |

Two properties decided it. **Coverage as a feature rather than as glue:** Vitest is one
devDependency and `coverage: { provider: "v8" }`, with no instrumentation step between source
and browser. **Surface:** 71 packages against Web Test Runner's 293, on exactly the axis that
started this cycle — 44 dev vulnerabilities, none of them in `dependencies`.

What explicitly did *not* decide it: that the 122 tests need no rewriting. That is an effort
argument, and effort is not a selection criterion. It survives only as a footnote.

**Alternatives:** *Jest* is out on substance, not on taste — it runs in Node against jsdom, and
this package's target environment is the browser; its ESM support is still documented as
experimental and needs `--experimental-vm-modules`, for a package that is pure untranspiled
ESM. That webpack is the bundler changes nothing in its favour: the config has no `module` and
no `resolve` key, so `moduleNameMapper`, the thing that connects Jest to a webpack setup, has
nothing to map. *Web Test Runner* is the better fit on paper — no bundler in the request path —
and would win if its dependency tree were not four times the size. *jasmine-browser-runner* is
the close second and would become the better choice if owning ~50-80 lines of coverage glue
(`nyc instrument`, extraction through its `middleware` hook or its own webdriver, `nyc report`)
ever looks cheaper than carrying Vite: it is the smallest tree, needs no change to a single
test, and its `--esm` mode serves specs as native ES modules, the closest any candidate gets to
how this package ships.

**Consequences:** `vite` enters the tree as a direct dependency of `vitest` (`^6 || ^7 || ^8`,
currently 8.2.2), and with it `rolldown` — Vite 8 no longer bundles with Rollup or esbuild.
Vite majors will drag Vitest along, which is the treadmill part 1 just climbed off, now in the
test path. Tests are transformed by Vite while `dist/` is bundled by webpack; with zero loaders
on either side the difference is small, but it is not nothing, and it is the standing argument
for eventually moving the build to Vite as well — tracked in `BACKLOG.md`, deliberately not
part of this decision. No `vite.config` is required; a standalone `vitest.config.mjs` using
`defineConfig` from `vitest/config` is the documented path. The config file has to be `.mjs`
until the `"type": "module"` question is settled.

The measurements and the full pro/contra per candidate were recorded in the toolchain
modernization plan; that plan was retired on 2026-08-21, so the git history up to commit
`6ca1a4c` is where they live now.


## 2026-08-21 — Do we commit style configuration, and does the tree get normalized?

**Decision:** Yes to both. `.editorconfig` and `.gitattributes` enter the repository, and the
tree was normalized once to match them in the same change.

- `.editorconfig`: utf-8, LF, tabs, final newline, no trailing whitespace. Markdown is the
  one exception — spaces, width 2, because list nesting and fenced blocks are column-based
  syntax there, not style. Generated paths (`dist/**`, `coverage/**`, `target/**`,
  `package-lock.json`, `LICENSE-OF-THIRD-PARTY`) unset every key.
- `.gitattributes`: `* text=auto eol=lf`, plus `linguist-generated` on the three generated
  paths.
- Normalization touched 55 tracked files: four were pure CRLF (`browser.js`,
  `src/ExpressionResolver.js`, `src/index.js`, `test/index.js`), 29 had no final newline,
  ~20 carried trailing whitespace. Space indentation became tabs in `src/Executer.js`,
  `src/Utils.js`, `test/TestUtils.js`, `webpack.config.js` and
  `generate-license.config.json`; the JSDoc blocks at `src/CodeCache.js:29` and `:40` sat one
  column off and were straightened.

**Reasoning:** The conventions in `AGENTS.md` were prose only, and the tree had already
drifted away from them — seven files were space-indented while the rule said tabs, so an
agent following "the style of the surrounding file" correctly produced the wrong thing.
Config without normalization would have left that contradiction standing; normalization
without config would have let it come back. Line endings were not governed by the repository
at all. `core.autocrlf=input` is set on this machine but did not prevent the drift: the four
CRLF files are stored that way in git, so every checkout everywhere received them. A
per-machine setting was never going to hold that line, which is what `.gitattributes` is for.

**Alternatives:** A formatter (Prettier) would enforce rather than advise, but it is a
dependency, a script, and a much larger diff, and it decides far more than indentation —
rejected as out of proportion to the problem. Leaving markdown on tabs was rejected outright:
it breaks list rendering. Keeping trailing whitespace in markdown to preserve the two-space
hard line break was rejected because that break is unused here, and an invisible significant
character is worse than the backslash form.

**Consequences:** `.editorconfig` advises, it does not enforce. With no linter and no CI
nothing rejects a violation, so tree and config stay in agreement by discipline alone. The
spaces inside the template literals of `ContextObjectExecuter.js:23-27` and
`ContextDeconstructorExecuter.js:33-37` are generated-code content, not indentation, and are
deliberately left alone — a blanket tab conversion would rewrite the code this package emits.
Any later bulk reformatting has to make the same exception. The normalization is one
mechanical commit touching nearly every file, so `git blame` across it needs `--ignore-rev`.

## 2026-08-21 — How do we work with branches, and what identifies a released version?

**Decision:** Tags identify versions, branches only identify work.

- `master` is the released state and the default branch.
- One working branch per cycle — currently `v3`. Its name is free.
- A release is: merge the working branch into `master` with `--no-ff`, tag the commit
  `<version>`, push the tag, delete the working branch.
- Every publish to npm gets a tag. The tag and the `CHANGELOG.md` heading carry the same
  version string.
- A fix to an older line branches off that line's tag, e.g. `2.x`, and is released with its
  own tag.
- No version-named branches. `2.0.0` as a branch name promises something immutable about a
  ref that can move.

**Reasoning:** The version selector of the documentation app at `default-js.github.io` is
fed by branch names — `repository.view.tpl.html` builds the `<select>` from
`Object.getOwnPropertyNames(repo.branches)`. That put working branches and published
versions into one namespace: `v3` matches the generator's name filter and is already on
origin, so the next run would have offered an unfinished branch to readers as a "Version".
`defaultjs-extdom` shows the duplication the branch model produces — branch `2.0.0` and
tag `2.0.0` on the same commit `753d80b`, enough of a collision that `git rev-parse 2.0.0`
warns about an ambiguous refname. The generator in `default-js.github.io` was changed to
read `refs/tags/*` as well and to take only the default branch from `refs/heads/*`.

**Alternatives:** Keeping branches as the version axis and moving work out of the way by
naming it outside the filter, e.g. `dev/v3`. It needs no change to the documentation app,
but keeps a mutable ref standing in for an immutable one and duplicates every tag.

**Consequences:** Releasing now has a mandatory step that used to be optional — without a
tag the version vanishes from the documentation app, and a `CHANGELOG.md` section points at
nothing. Repositories in the family that carry version branches but no tags lose their
older entries until those tags exist; that is Frank's call per repository and no concern of
this one.

## 2026-08-21 — Do we maintain a `CHANGELOG.md`?

**Decision:** Yes. `CHANGELOG.md` in the repository root, Keep a Changelog 1.1.0 plus
SemVer, the same shape `defaultjs-extdom` already uses, extended by a `## [Unreleased]`
section that is written during the work rather than at release time. It is part of the
`files` array, so npm consumers receive it. History before 3.0.0 is not reconstructed.

**Reasoning:** The commit history cannot serve as the release record — subjects like
`update` and `some improvents` carry nothing, while `BACKLOG.md` relies on git history
being the archive. 3.0.0 is a breaking major, and its migration list only exists if it is
written while the breaking change is made. `DECISIONS.md` does not overlap: it holds the
reasoning for us, the changelog holds the effect for consumers. Two audiences.

**Alternatives:** Generating the changelog from commit messages, which would require a
commit message convention and a tool — both rejected as unrequested tooling, and the
message quality would have to be fixed first either way. Reconstructing 1.x and 2.x costs
real effort for versions nobody migrates from any more.

**Consequences:** Every consumer-visible change now carries a second edit, enforced by the
rule in `AGENTS.md`. A release means moving `## [Unreleased]` to a version heading with a
date. Which ref a release is pinned to is settled by the branch model above: a tag
carrying the same version string.

## 2026-08-20 — Should `EsprimaExecuter` be registered by default?

**Decision:** No. `src/executer/index.js` registers `WithScopedExecuter`,
`ContextObjectExecuter` and `ContextDeconstructorExecuter`; the import of `EsprimaExecuter`
stays commented out. It is reached either through the separate
`browser-all-executers.js` bundle or by importing the module explicitly.

**Reasoning:** `espree` dominates the bundle. Measured on the current `dist/` artifacts:
`browser-…min.js` is 11.5 KB, `browser-all-executers-…min.js` is 355.6 KB — a factor of 31
for an executer most consumers never use. The split is a bundle-size decision, not a
functional one; the difference between the two browser bundles is `espree` alone.

**Alternatives:** Registering everything by default would remove one entry point and one
bundle from the build. It becomes the better choice only if `espree` stops being the
dominant cost — for instance if the esprima executer were rewritten against a parser that
is already present, or if it became the default execution strategy.

**Consequences:** Two browser bundles have to be built and kept in step. Consumers wanting
the esprima executer import it explicitly, which is also how they reach `setupExecuter`.
The commented-out import in `src/executer/index.js` is load-bearing and must not be
"cleaned up". An `exports` field must keep `./src/executer/*` importable — see `BACKLOG.md`.
