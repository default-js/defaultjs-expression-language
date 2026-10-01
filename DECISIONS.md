# Decisions

Architecture and API decisions for `@default-js/defaultjs-expression-language`, newest first.

What matters in an entry is the *reasoning*. A decision recorded without it cannot be revisited later — only obeyed or overturned blindly. Only decisions in force stand here, each written against the current state: a superseded entry is deleted, a partly superseded one is rewritten to the half still in force, and git history keeps what was there before.

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

## 2026-10-01 — How does a consumer reach the package: `"type": "module"`, `exports`, and the module bundle?

**Decision:** `package.json` carries `"type": "module"` and an `exports` field. The field opens `.`
(`index.js`), `./browser.js`, `./src/Executer.js`, `./src/executer/*`, `./dist/*` and
`./package.json`, and nothing else. The `module` entry is built as an ES module library, so
`dist/module-…[.min].js` exports what `index.js` exports. `webpack.config.mjs` exports two
configurations, one per entry. `optimization.usedExports: false` is gone from both. The paths
`./dist/*` and `./package.json`, and keeping the deep import as the way to tune the default
executer, are Frank's decisions of 2026-10-01; the rest was decided on 2026-09-30.

**Reasoning:** The sources ship untranspiled as ESM, so `"type": "module"` states what every file
already is. `scripts/generate-version.js` was the last CommonJS file and was rewritten as ESM
(`import.meta.dirname`) rather than renamed to `.cjs`, which would have kept CommonJS alive for one
script. The `exports` field makes the surface of section 8 enforceable. Before, every file of the
package was importable, and a deep import of `src/ExpressionResolver.js` was as much a contract as
`index.js`. `./src/executer/*` and `./src/Executer.js` stay open because importing an executer
module is how it is tuned (entry of 2026-09-28). `./dist/*` stays open because otherwise the module
bundle could be loaded by URL but not imported by package name. `./package.json` stays open for tools
that read a dependency's manifest.

One webpack compiler cannot emit both bundles: `output.module`, which a library of type `module`
requires, holds for every bundle of a compiler and turns off the IIFE wrapper of the browser script
(`node_modules/webpack/lib/config/defaults.js`, read for 5.109.2). Hence two configurations. Each
cleans only the stale files of its own mode that do not belong to the other entry, since both emit
into one `dist/`.

`usedExports: false` existed only because the module entry had no library, so tree shaking pruned
the whole library out of it (measured 2026-08-21: 13 809 → 3 685 bytes). With a library the exports
count as used. Without the line, the production bundles came out 13 871 → 13 386 bytes (browser) and
13 554 → 13 299 bytes (module). Comparing identifiers between the old and new minified bundles, only
webpack-internal names (`exports`, `strict`) are gone. Both bundles were run in dev and min form:
the module bundle in Node, the browser bundle in Chromium. Each had all three executers registered,
answered `resolveText("${1 + 1}")` with `"2"` and applied a default value; the browser bundle also
answered `VERSION` 3.0.0.

**Alternatives:** Leaving `./dist/*` out, which was the list of 2026-09-30. Then the bundle B-16
fixed would be reachable only by URL. Giving the default executer an entry point of its own was
rejected: it adds API for something one deep import already does. `experiments.outputModule` for
the browser bundle as well would have needed `<script type="module">` and broken every consumer of
the classic script.

**Consequences:** A breaking change for 3.0.0: every deep import outside the list fails with
`ERR_PACKAGE_PATH_NOT_EXPORTED`, `index.js` written out included. `src/executer/index.js` is open
through the wildcard; it only registers the executers. `experiments.outputModule` is still marked
experimental in webpack 5 and may change shape in a minor release. The suite pins the open paths
through a self-reference (`test/package/surface.Test.js`). It cannot pin a closed one, because Vite
fails the whole file on a literal import it cannot resolve. Closed paths were checked once against a
packed install in Node. A future change to the field has to repeat that check by hand.

---

## 2026-09-30 — Do the executers contain an assignment to a name nothing declares?

**Decision:** No. `${ x = 1 }` on a name no resolver carries creates a global under all three
executers — under `context-object-executer` wherever the statement leaves out `ctx.` — and nothing
contains an explicit `globalThis.x = 1`. No executer switches to strict mode, and there is no
`allowGlobalWrite` switch. `README.md` documents it per executer. Frank's decision.

**Reasoning:** Strict mode would turn the leak into a `ReferenceError`, but it also rejects binding
names that sloppy mode accepts — `package`, `interface`, `private`, `public`, `static`, `let`,
`yield`, `eval`, `arguments` and others. `context-deconstruction-executer` turns every name of the
context into a binding, so a context carrying one of them would stop every statement over it, where
it runs today. Those names have to stay allowed for now. `with-scoped-executer` cannot run in strict
mode at all, and a switch whose *off* state only some executers can keep promises nothing.

**Alternatives:** Strict-mode code in `context-deconstruction-executer` and
`context-object-executer`, decided on the same day and withdrawn once the name problem was weighed —
worth reopening together with a way to keep those names usable, for instance skipping them in the
destructuring. An `allowGlobalWrite` switch in 6.5, the configuration of 4.1 and `buildSecure`.

**Consequences:** 6.5 keeps promising no containment. A consumer who must not leak globals checks
statements before handing them in.

## 2026-09-30 — Does `context-deconstruction-executer` keep the context as the receiver of a method?

**Decision:** No. `${ greet() }` over a class instance calls `greet` without its object, and `this`
is `undefined` inside it. It stays a documented limitation of the default (`README.md`). Frank's
decision.

**Reasoning:** The executer destructures the context into locals; that is what makes it the fastest,
and a bare local call has no receiver. Binding every function of the context would cost on every
execution, for every function the context carries, whether the statement calls it or not.
`context-object-executer` keeps the receiver and runs over class instances.

**Alternatives:** Binding the functions of the context in the generated code — the way in if class
instances turn out to be the usual context of the default; to be measured with `npm run bench` first.

**Consequences:** A template engine that hands class instances in has to pick
`context-object-executer`. The loss is silent under the default.

## 2026-09-30 — Is reading every accessor of a context a defect of `context-deconstruction-executer`?

**Decision:** No, it is the price of its strategy. Destructuring reads every name, so every getter
runs on every execution, and a getter that throws breaks every statement over that context,
`${ 1 + 1 }` included. Documented in `README.md`. Frank's decision.

**Reasoning:** Handling accessors apart from data would mean inspecting descriptors per context and
generating different code for them — more work in the generator and in the cache key, for a context
shape the default is not meant for. The proxy reads no getter itself (6.2); the other two executers
read a getter only when the statement does.

**Alternatives:** Skipping accessors in the destructuring and reaching them through the context —
the fix if contexts with getters become common under the default.

**Consequences:** A context with costly or throwing getters belongs on `context-object-executer`.

## 2026-09-30 — Does the package export a `Context`, or `ResolverContextHandle`?

**Decision:** No. The name `Context` is gone; nothing ever exported it. `ResolverContextHandle`
stays internal and is not listed in section 8. Frank's decision.

**Reasoning:** Nothing needs the handle from outside except `resetCache`, which 6.2 names, and
whether the name cache and with it `resetCache` survive is what the measurement of the name cache
decides (`BACKLOG.md`, "What the name cache costs and saves when reading and writing along a
chain"). Making the class public now would add surface that measurement may take away again.

**Alternatives:** Exporting the handle from `index.js` and covering `get parent` and `updateData`.

**Consequences:** `get parent` and `updateData` of the handle are internal; their coverage is a
question of reachability, not of surface. The getter `contextHandle` stays public until the
measurement is done.

## 2026-09-30 — Do the benchmarks get rid of the long pause at depth 10?

**Decision:** No. A run whose `rme` passes 100 % is discarded and repeated; the rule stands in
`AGENTS.md`, under Benchmarks. Frank's decision.

**Reasoning:** The pause comes from `ChainBuilder.js` keeping a chain of 1 000 000 resolvers live for
the whole file, and a collection that walks it costs hundreds of milliseconds (verified 2026-08-29:
with `DEPTHS` cut to `[10, 1000]` it disappears). One chain per depth does not help: a bench file has
no setup hook, so every chain is built in the module body and all of them are live at once. The
signature is easy to spot — `rme` past 100 %, `max` at hundreds of milliseconds, `p75` and `p99`
unchanged — so discarding costs less than restructuring.

**Alternatives:** Moving depth 1 000 000 into a file of its own, so the smaller depths never share a
page with it — worth it if the pause starts to appear without the signature. Seen on 2026-09-27 also
at depth 1 000 of `ColdResolve` and in `ResolveText` under `with-scoped-executer`, which builds no
chain; whether another file's chain stays live in the same browser page is not checked.

**Consequences:** A recorded benchmark number is taken from a run without the signature.

## 2026-09-30 — Does the build move from webpack to Vite?

**Decision:** No, webpack stays. Frank's decision.

**Reasoning:** Nothing about the webpack build is broken. `dist/` is published and committed, so a
switch changes every published artifact and needs its own verification, for no gain a consumer
would notice. Vitest puts `vite` into the tree anyway, so the repository carries two bundlers; that
is a cost of the test runner, not a reason to move the build.

**Alternatives:** Vite's library mode, which covers what is needed in principle; its bundler in Vite 8
is `rolldown` 1.x. Worth reopening if webpack blocks something — an ESM library output it cannot
produce, or a maintenance problem.

**Consequences:** Two bundlers stay in the dev tree.

## 2026-09-30 — Do the executers run a statement that begins with a comment ending a line?

**Decision:** No. The limit is documented in `README.md`, under what holds for all three executers,
and the generated code stays as it is. Frank's decision.

**Reasoning:** All three executers place the statement right behind `return` on the same line. A
leading `//` comment, or a `/* … */` spanning a line break, ends that line, automatic semicolon
insertion closes the `return`, and the statement answers `undefined` (node, 2026-09-30). The case is
rare in a template, and nothing that runs today has to change for it.

**Alternatives:** A line break in front of the statement — does not work, `return` followed by a line
break is the same ASI case. Wrapping the statement in parentheses on lines of their own — answers
correctly, but turns a statement with a top-level `;`, `${ a; }`, into a `SyntaxError`, which breaks
expressions that run today. Skipping leading whitespace and comments before the statement is pasted
— keeps `;` working at a cost only per compilation, and is the way in if the limit starts to hurt;
it needs a comment-aware skipper shared by the three executers.

**Consequences:** A consumer who starts a statement with such a comment gets `undefined` without an
error. A new executer that pastes the statement behind `return` inherits the limit and has to
document it too.

---

## 2026-09-28 — Does the package keep `EsprimaExecuter`?

**Decision:** No. `EsprimaExecuter` is removed, together with everything that existed only for it:
the `esprima-executer` registration, the entry `browser-all-executers.js` and its bundles, and the
runtime dependencies `espree` and `escodegen`. Frank's decision.

What stays in force from the entry of 2026-08-20 that kept it unregistered: an executer module is
reached by importing it directly, which is how `setupExecuter` is reached and the intended usage,
so the `exports` field keeps `./src/executer/*` importable (2026-10-01).

**Reasoning:** The approach cannot be made clean. The executer rewrote the statement's AST so that
an identifier became `ctx?.name`, and it had to decide which identifiers to rewrite **without
knowing the context**: `generate` saw the statement text alone, and the result was cached per
statement, so it had to fit every context the statement would ever meet. Whatever it guessed was
wrong somewhere. Rewriting every name it reached cut off every global not on a hand-kept list
(`${ Math.round(1.5) }` raised); rewriting fewer leaves context names bare. Every construct the
rewrite did not walk — function bodies, object and array literals, the branches of a ternary, a
computed key — kept its names bare, and `ctx?.name` cannot be an assignment target or a `new`
callee at all. Each of these was an open backlog entry; closing them one by one would have refined
the guess, never removed it. On top, `espree` made the bundle carrying it about 31 times the size of
the one without.

**Alternatives:** Closing the gaps of the rewrite and deriving the reserved names from the global
object — rejected for the reason above. Rewriting per context instead of per statement would know
the names, but it gives up the code cache, which is what makes an executer affordable, and the names
of a context can still change after compilation. An AST-based executer is worth another look only
if it can decide per identifier at run time, which is what the other executers get from the engine.

**Consequences:** Consumer-visible for 3.0.0: `esprima-executer` is no longer registered, and
`browser-all-executers.js` with its `dist/` bundles is no longer published. The package ships three
executers and one browser bundle. The rule in `TESTING.md` that asked a rewriting executer every
construct twice went with it.

---

## 2026-09-27 — What does the resolver do with input of the wrong type?

**Decision:** Decided per input rather than by one blanket rule, and each case came out the same
way: an argument that cannot mean what the call needs is **rejected with a `TypeError`** that names
it, and `null` or `undefined` keep meaning "none passed" wherever they did. In detail, all in
`SPECIFICATION.md` 4.2, 5.1, 6.1, 6.6, 7 and 9.3, Frank's decisions on B-03, B-04, B-05, B-35, B-36
and B-37:

- **`parent`** other than `null`, `undefined` or an `ExpressionResolver` throws. A resolver from a
  second copy of the package is no exception: the chain reads its private fields.
- **`context`** that is a primitive throws, `0`, `""` and `false` included. The check lives in the
  constructor of `ExpressionResolver`, not in `ResolverContextHandle`, which keeps checking nothing
  (2026-08-30); the `data || {}` there goes.
- **A refused write** — frozen, sealed — raises what the object raises, from every data method.
  `mergeContext` stays a key-by-key assignment and may have written part of its keys when it raises.
- **`name`** obeys 3.3 and is trimmed on construction; any other character, an empty or
  whitespace-only string and a non-string throw. **`filter`** is read like a scope prefix: trimmed,
  empty or whitespace only means no filter, a non-string throws.
- **The instance `resolve` and `resolveText`** reject a non-string like the static ones (4.1),
  without the warning for a failed statement and without the default.
- **`mergeContext`** ignores `null` and `undefined` and rejects a primitive. **A key** of
  `getData`, `updateData`, `deleteData` is any string, `""` included, a symbol or a number, which is
  looked up as its string, as JavaScript does; without one `getData` answers the whole context and
  the two writers throw, and a key of another type throws in all three.
- **`setupExecuter`** changes only what it is handed: no `size`, no change. The start size of 5000
  lives in `CodeCache`. A `size` that is no finite number throws, a fraction is rounded down.

Implemented the same day. The character rule of a name, `normalize` and the whitespace pattern moved
from the scanner into `src/Utils.js`, the shared helper module, once the resolver needed them too.

**Reasoning:** The package already had its answer for the static entry points — a wrong argument is
a mistake in the calling code, and saying so at the call beats an error three frames down or a
lookup that quietly answers the default (4.1, 7). Every silent case here turned a calling mistake
into a wrong result somewhere else: a dropped parent yields a resolver without a chain and an
`undefined` executer, `0` as a context counted as providing data, `setupExecuter({})` shrank a cache
from 5000 to 1000, `getData(0)` answered the whole context instead of an array's first element. A
name that 3.3 cannot address is only reachable by filter, and a `/` in one breaks the path `chain`
answers, so the constructor holds a passed name to the rule a generated one already obeys. Trimming
the name and the filter follows 3.3, which trims the prefix; a name kept with outer whitespace could
never be addressed. `""` became a key everywhere once `0` did, since reading a key that cannot be
written through the API is an asymmetry with no use.

**Alternatives:** One rule for every input, decided up front — offered and declined in favour of
deciding each input on its own. Duck typing the parent — a second copy of the package has private
fields of its own, so the chain would break inside `#getPropertyDef`. Coercing a primitive context
with `Object()` — a typo would then answer quietly. Swallowing a refused write, with or without a
warning — 6.1 already says a write fails as it would on the object. An atomic `mergeContext` — a
second pass over every key on every call, for a mistake the caller sees anyway. Passing a non-string
through the instance `resolveText` — convenient for a caller who hands over unchecked values, but
the static method rejects the same call. Keeping a filter exact — rejected by Frank: filter and
prefix are one name rule.

**Consequences:** Breaking for a consumer who relied on any silent case — each gets its line in
`CHANGELOG.md` with the code. Every rule starts with a failing test. The data methods pay a type
check and, with a filter, a trim per call. On the resolution path the instance `resolve` gains one
`typeof` per call and the instance `resolveText` none, it asks already; measured with `npm run bench`
before and after, as every hot-path change is. The handle's own `mergeData` guard becomes the
resolver's.

---

## 2026-09-27 — Does the expression scanner recognize comments?

**Decision:** Yes. `/* … */` and `//` are states of the scanner, and a brace inside a comment never
counts. A line comment ends at a line terminator — `\n`, `\r`, U+2028, U+2029 — as in JavaScript, not
at a brace, so `${ a // note }` on one line is no expression and stands as text. A `${` inside a
comment is hidden like one inside a literal. The division-or-regex rule decides on the character
before a comment. Comments stay in the statement the executer receives. Frank's decision, B-49.

**Reasoning:** The entry of 2026-08-29 left comments out on the assumption that a brace inside one
then simply counts. Pinning that limit showed it held in half the positions only: the scanner read
the slashes of a comment through the division-or-regex rule, so `1 /* } */` counted the brace and
`/* } */ 1` hid it as a regular expression literal, and a line comment did the opposite —
`1 // }\n` even ran to the end of the text and left no expression at all. A limit that depends on the
character in front of the comment cannot be stated usefully, while recognizing comments costs two
states and no lexer: `/*` always opens a comment in JavaScript and `//` never is an empty literal.
Measured with `ResolveTextShare`, old and new alternating (new, old, new, one file each): 20 distinct
expressions 199 534 / 195 241 / 191 868 hz, literals 158 746 / 143 163 / 160 152, 2,000 distinct
1 647 / 1 716 / 1 737 — every difference inside the spread between runs. The extra work runs only on
a `/` in code; the list of comment ranges `startsRegex` needs is allocated only where a comment
stands. The case `expressions carrying comments`, added to `ResolveTextShare` afterwards, answers
179 000–184 000 hz against 209 000–217 000 for `literals` in the same three runs; its expressions are
longer, so the gap is not the cost of the comment states alone.

**Alternatives:** Stating the limit as it is, position by position — correct, but a rule nobody
writing a template can apply. Ending a line comment at a brace as well, so a one-line `${ a // x }`
works — rejected: the brace would count inside a comment again, and the executer would receive a
comment that no line break closes. Stripping comments from the statement — costs a copy per
expression and changes what an executer and an error message see; which comments an executer can
run is its own. Letting a `${` inside a comment start a new expression, as rule 3 of 3.1 does in
code — a comment would then hide braces but not delimiters, two rules where one does.

**Consequences:** `SPECIFICATION.md` 3.1 lost the comment limit and keeps one: a regular expression
literal after `)` or `]` is read as division. A one-line expression ending in a line comment is text
now — it was before as well, for another reason. The executers receive comments unchanged, which
exposes a limit of their generated code — see 2026-09-30.

---

## 2026-09-27 — What does a configuration have to carry?

**Decision:** A string under `expression` or `text`, and nothing else is checked. Anything else under
that key is rejected with a `TypeError` of its own that names the key, and `defaultValue` does not
apply to it. `SPECIFICATION.md` 4.1 says so. Frank's decision, B-48.

**Reasoning:** A configuration without a string is a mistake in the calling code, the same kind as a
first argument of neither form, so it is treated alike. It gets its own message because the one it
got before — "takes a string or a configuration object" — denied that a configuration had been
passed at all, and sent the caller looking at the wrong argument. `context` and `timeout` stay
unchecked so that both call forms keep meaning the same thing: a context that is no object is B-04
for either form, a timeout that is no positive number is no timeout in either.

**Alternatives:** Keeping the old message and only stating the requirement — the rule would hold,
the diagnosis would stay wrong. Treating a missing key as an empty expression that runs through the
resolver and lets the default apply — it would turn a calling mistake into a quiet result. Checking
`timeout` as well, or rejecting unknown keys to catch typos like `defaultvalue` — either makes the
configuration form stricter than the positional one, which nobody asked for.

**Consequences:** An object under the key used to be read as a configuration once more, so a nested
configuration worked by accident; it is rejected now. A typo in a key name goes unnoticed.

---

## 2026-09-27 — What does an argument behind a configuration object mean?

**Decision:** Nothing. Both static entry points take the configuration form whenever the first
argument is an object, and ignore every argument behind it. `SPECIFICATION.md` 4.1 says so. Frank's
decision, B-33.

**Reasoning:** The configuration is complete — it carries the expression or text, the context, the
default and the timeout, so an argument behind it has nothing left it could mean. The form was
already decided by the first argument alone; rejecting a trailing argument would add a second
condition to that rule, which is exactly the defect: the code took the form only where the
configuration was the sole argument, and rejected it otherwise with a message claiming it was no
configuration at all.

**Alternatives:** Rejecting a trailing argument with a `TypeError` of its own — it would catch a
caller mixing both forms, at the price of a rule that is no longer "the first argument alone".
Letting positional arguments fill in or override keys — it mixes the two forms, and a call would
no longer say in one place what it does. Accepting only `undefined` behind a configuration — a rule
for callers that forward their arguments, and nobody has asked for one.

**Consequences:** A caller who mixes both forms gets no error; the positional part is silently
dropped. What a configuration has to carry is decided separately (2026-09-27, above).

---

## 2026-09-27 — Does a statement that runs longer than a second still produce a warning?

**Decision:** No. `execute` starts no timer any more, the rule is out of `SPECIFICATION.md` 7, and
the case that pinned it is gone. Frank's decision, B-46.

**Reasoning:** The warning cost a `setTimeout` and a `clearTimeout` for every statement, slow or
not, to report the rare one that is. Measured with `test/PerformanceTests/ResolveTextShare.bench.js`
(`TestExecuter`, so the resolver's own share): 20 distinct expressions went from 47.9k-51.5k to
177k-181k hz without the timer, about 3.6× — across sessions and not alternated, but far beyond any
spread seen that day. No other change to the text path came near it.

**Alternatives:** One timer per `resolveText` call instead of one per statement — unmeasured; it
would name the text rather than the statement, which is what the warning was for. Keeping the
warning behind an option — nobody asked for one.

**Consequences:** A hanging statement is silent; a consumer who wants to know measures around the
entry point. The time a statement takes is no concern of the resolver any more — an executer or a
caller that wants a watchdog brings its own.

## 2026-09-27 — Does a function in `ExpressionResolver.js` that never awaits drop `async`?

**Decision:** No, not for that reason alone. The static `resolve` and `resolveText` keep `async`.
What mattered was a different shape: an `async` function that **returns a call to itself** without
awaiting it. The scope walk of the module-level `resolve` was one and is a loop since this day.

**Reasoning:** Measured on Frank's question, with `TestExecuter`, `time: 2000`, two runs, the second
in reversed order. The static entry points only hand on a promise. Taking `async` off them needs a
`try`/`Promise.reject` around the body, because 4.1 promises a *rejection* for a first argument of
the wrong type and a thrown `TypeError` would escape synchronously - and it changed nothing beyond
the spread: `resolve` +1.5 / +2.4 %, `resolveText` +5.1 / -2.9 %. One promise more or less per call
is lost in the work of a resolution. The recursive scope walk was the opposite case: one `async`
frame, one promise and the adoption of a returned promise **per resolver climbed**, and the calls
nested synchronously until the named resolver was reached. Against `HEAD`, hz, run 1 / run 2:

| Case | depth 1 | depth 10 | depth 100 | depth 1,000 |
| --- | --- | --- | --- | --- |
| prefix found at the root | -7.1 / +2.4 % | +31.5 / +33.5 % | +307 / +300 % | +830 / +838 % |
| prefix nobody carries | +0.2 / +0.1 % | +104 / +97 % | +819 / +806 % | +992 / +1,004 % |
| no prefix | +0.2 / +0.5 % | +1.8 / -2.3 % | -1.5 / -2.0 % | -1.0 / +0.1 % |

And it overflowed the stack between 1,000 and 10,000 resolvers, which broke 5.3 - two cases in
`test/expressionresolver/scope.Test.js` pin that at 100,000.

**Alternatives:** Dropping `async` wherever there is no `await`, as a rule - rejected on the numbers
above, and because `async` is what turns a `throw` into the rejection the specification promises.

**Consequences:** Where a walk along the chain is written, it is a loop, not a recursion - neither
a synchronous one nor an `async` one. The getters `chain` and `effectiveChain` recursed
synchronously and overflowed between 10,000 and 100,000 resolvers; they are loops since the same
day, pinned in `test/expressionresolver/chain-inspection.Test.js`. No benchmark exercises a scope prefix; the numbers above come from a
probe that was not kept.

## 2026-09-27 — Does `resolveText` scan and replace in one pass?

**Decision:** No. `scan` answers an array of occurrences and `resolveText` walks it — two passes.
Built on `readExpression(aText, aStart)`, a synchronous function that reads the one expression
whose `$` stands at `aStart` and answers the occurrence `{ start, end, escaped, scope, statement }`
itself, so each expression costs one object. Settled on B-45, which is closed with this entry.

**Reasoning:** The one pass was meant to save the array and the objects. The acceptance rule was
that it stays where no case gets slower; it got slower in every shape tried, twice over:

- **First batch**, with the per-statement timer still in `execute`: a callback handed to the
  scanner (`replace(aText, aReplace)`, an `async` callback per expression) cost 0-8 % under the real
  executers and 4-7 % of the resolver's share; a cursor — one reused object, `next()` per
  occurrence — trailed the two passes by 2-8 % at 200 and 2,000 expressions for a reason nobody
  found. On its own the scanner was about a tenth of `resolveText`.
- **On today's base** — no timer (above), char codes, the scope prefix read by hand, no second trim
  — both shapes built on the same `readExpression` and green under the full suite, then measured with
  `test/PerformanceTests/ResolveTextShare.bench.js` (`TestExecuter`, the resolver's own share), four
  pairs, the order alternated, hz, one pass → two passes: 20 distinct 202k-204k → 235k-248k,
  20 × one expression 214k-218k → 255k-266k, literals 170k-182k → 200k-213k, 200 distinct
  18.6k-19.9k → 23.5k-23.9k, 2,000 distinct 1.8k-1.9k → 2.2k; escaped 1.53M-1.61M → 1.08M-1.09M,
  no expression 4.33M-4.61M → 4.14M-4.28M. No range overlaps. Without the timer the `async`
  callback costs about a sixth of the resolver's work per resolved expression — a promise and a
  frame each — and the one pass wins only where nothing is resolved.
- **The scan folded into the `async` loop itself** (no callback, one function) cost 5-18 % against
  the separate synchronous scan, presumably because the character loop then runs in a function whose
  locals live across an `await` — not verified. The character loop stays a synchronous function.

What was agreed for the callback shape, and holds for any later attempt: the pass keeps 3.1 and 3.2
in full, the resolver keeps evaluation, default value, the cast to text and 7, for which the scanner
hands over the expression as written. The scanner knows nothing about errors, executers or default
values.

**Alternatives:** The one pass, for the 40-50 % it gains on escaped expressions and the few percent
on text without an expression — rejected: escaped expressions are rare, resolved ones are the work.
It becomes the better choice only if the callback stops costing a promise per expression, which
`await` in the scanner rules out. Letting the scanner catch a failing callback — rejected before
measuring: it makes the scanner carry 7 on the resolver's behalf (2026-08-30).

**Consequences:** A change to the text path is measured with `ResolveTextShare`, old and new
alternating with the order swapped, several pairs: under the real executers the spread between runs
(2-10 %) hides the resolver's share, and two builds of the same code differ by up to about 5 %. The
whole cycle, `HEAD` of that morning against the result, `ResolveText.bench.js`, two pairs: the
default executer 15.7k-16.6k → 23.8k-23.9k at 20 distinct expressions, `context-object` and
`esprima` about 3.5×, `with-scoped` about 2.8×, text without an expression unchanged.

## 2026-09-27 — Is the scope prefix read one way for a text and the single expression alike?

**Decision:** No — two implementations of the one rule of 3.3, Frank's decision. A text reads the
prefix forwards from the start, only as far as the first character a name cannot carry
(`splitScopeAndStatement`, used by `scan`); the single expression of `resolve` searches the first
`::` with `indexOf` and checks backwards from it to the start, leaving at the first character a name
cannot carry (`splitScopeAndStatementBySeparator`, used by `parseExpression`). Neither runs a
regular expression any more; whitespace past ASCII is still decided by `\s`.

**Reasoning:** Measured in one probe file with all three side by side, so no build lies between
them, the content between the delimiters, 200 per call, hz, regular expression · forwards ·
`indexOf` backwards: short, no scope 168k-181k · 193k-218k · 250k-259k; short, scoped 95k-100k ·
120k-128k · 85k-117k; a quoted `::` 222k-234k · 302k-313k · 193k-203k; a 500-character chain
166k-176k · 179k-188k · 165k-174k; 500 characters of words and spaces 11k · 4k · 154k-165k; a
multi-line, indented statement 103k-107k · 78k-81k · 154k-160k. Forwards wins where it can stop
early — a prefix, a quoted `::`, a chain; `indexOf` wins where a statement opens with a long run of
name characters, which the forward loop walks at about 2.5 ns a character. Neither loses to the
regular expression except forwards on the long runs.

**Alternatives:** One implementation for both. The objection was heard before the decision: the
measurements follow the shape of a statement, not the entry point, and a multi-line statement —
the forward loop's worst case, half the speed of `indexOf` — is as common in a text as in `resolve`.
`indexOf` for both would lose 7-30 % only where a statement is cheap anyway. At `resolveText` the
choice did not move beyond the spread, apart from the case carrying a quoted `::`; the split is
about 20 ns of the 240 ns an expression costs the resolver.

**Consequences:** 3.3 has two implementations that can drift apart, so every case of
`test/expressionscanner/scope-prefix.Test.js` is asked of both — through `scan` and through
`parseExpression`. A change to the rule changes both functions and both halves of that file.

## 2026-09-27 — Is the suite laid out by section of the specification, or by component?

**Decision:** **By component.** Each component is tested on its own under `test/<component>/`,
named with the full component name in lower case — `expressionscanner`, `resolvercontexthandle`,
`expressionresolver`, `executerregistry`, `codecache` — and called with what it is handed in use.
Inside, one file per topic; the header of a file names the sections of `SPECIFICATION.md` it pins.
`test/package/surface.Test.js` is the list of public members, `test/executer/interface.Test.js` the
class `Executer`. In detail:

- **The scanner is a module of its own**, `src/ExpressionScanner.js` — `scan` for a text,
  `parseExpression` for the single expression of `resolve`. Internal: `index.js` does not export it.
- **`TestExecuter` is an instance per case** — `new TestExecuter()` answers the statement,
  `new TestExecuter(fn)` what `fn` answers. No shared state, no registration, no helper beside it; a
  case about a static entry point sets `ExpressionResolver.defaultExecuter` itself.
- **A rule is tested where it lives, once.** The chain walk is asked of `ResolverContextHandle`
  directly; the resolver suite keeps one representative case per place where it connects to another
  component (`test/expressionresolver/wiring.Test.js`).
- **Whether an executer keeps the interface is asked in its own suite**, in
  `test/executer/<executer>/interface.Test.js`. No test lists or loops over the executers.
- **`it.fails` marks a requirement that is wanted and not implemented yet**, in any component suite
  and never in an executer's. A fixed limit is pinned by an ordinary `it` that checks the limit. **No
  release carries an `it.fails`.**

**Reasoning:** Frank's, on 2026-09-26 and 2026-09-27 (B-43) — the move the executer suites made the day
before, carried through the rest of the package. Every case of `test/spec/` went through
`ExpressionResolver`, so a case about where an expression ends also tested the resolver, and a case
about the chain walk also tested the proxy through a resolver built around it; a failure did not say
which component broke. The scanner was the one component that could not be called on its own — it
was private to `ExpressionResolver.js` — so it moved into a module of its own rather than becoming an
export of the resolver.

The shared `TestExecuter` carried a record and an answer across a whole file and needed a reset after
every case; an instance per case cannot leak into the next one. A first version with a helper for the
default executer beside the class was simplified at Frank's request: the class alone answers every
case, and the helper hid two lines each case can write.

The interface loop was Frank's catch after the move: a new executer would have had to be entered into
a list in somebody else's file, and a forgotten entry turns nothing red. In its own suite, the
question comes along with the directory.

The tie between a case and its rule, which Frank kept on 2026-09-05, survives in the file headers
rather than in the file names.

**Alternatives:** Keeping `test/spec/` one file per section — rejected, it tests components together.
One file per component with the section in the describe — rejected for files per topic, as the
executer suites have. Exporting the scanner from `ExpressionResolver.js` — rejected, `src/` is
published as-is and it would have become API. `vi.fn` as the executer — rejected, it widens the
assertion surface `TESTING.md` keeps narrow, and an answer function does the same. Thinning the
cases in the same move — deferred to B-44, so that the move can be counted.

**Consequences:** Measured on the move: 315 cases before and after, coverage identical in every
file; the scanner adds two lines and one function (`parseExpression`) and costs nothing measurable in
`npm run bench`. A rule that spans components has cases in more than one suite, and only the headers
lead from `SPECIFICATION.md` to them. `src/ExpressionScanner.js` is a published file (`CHANGELOG.md`)
whose shape nothing promises. The `scan` suite reads the occurrences `scan` answers; that shape
stayed when B-45 was settled (2026-09-27, two passes).

## 2026-09-26 — Is an executer measured against a shared catalogue, or tested as a solution of its own?

**Decision:** **As a solution of its own.** Each executer has its own suite under
`test/executer/<executer>/`, and it tests only what that executer guarantees. A case hands the
executer what it is handed in use and nothing else — `execute(aStatement, aContext)`, a bare
statement and a plain data context — and builds no `ExpressionResolver`. The four share the
interface and nothing else, and whether one keeps it is asked in its own suite (2026-09-27). What an
executer does not do is documented with it in `README.md`, not pinned by a test. The chain walk and
every other rule of the resolver are tested without a real executer, in the suite of the component
that keeps them (2026-09-27). `SPECIFICATION.md` part B keeps the interface, the list of
implementations and their tuning; the capability sections and their counts are gone.

**Reasoning:** Frank's, on 2026-09-26 (B-39). The capability catalogue compared four implementations
cell by cell and asked each the questions of the others, which made every difference a `no` — and a
`no` reads like a shortcoming of a solution that never set out to do the thing. An executer is a
strategy with its own trade-offs: the default gives up the write-back and keys that are no variable
names for speed, the context-object one gives up the bare-name dialect for completeness. Each is
described by what it does, and a consumer reads one description instead of a four-column table.

Going through a resolver was wrong for the same reason, and Frank caught it after the first
delivery: a case built that way tests the chain, the scope prefix and the default value along with
the executer, and a case that only exists through a chain — a write to a name an ancestor carries —
is not the executer's at all.

The chain walk was asked of all four because it needs a statement to be seen, but it is the work of
`ResolverContextHandle`. The traps an executer reaches the chain through — reading a name, asking
whether one exists, listing them — can be asked of the context directly, so the rule is tested once,
where it lives.

**Alternatives:** Keeping the catalogue and dropping the comparison from the documents — rejected: the
table is the comparison. Keeping the resolver rules running under all four — rejected: it makes the
chain walk a demand on every executer beyond the interface, which is the shared feature set this
decision removes.

**Consequences:** A limitation has no test, so an executer that starts doing what it did not do turns
nothing red — the guard a `no` cell gave is given up deliberately, and `README.md` is where such a
change has to be written. A `yes` that held only by accident became no guarantee: a write the deconstructor never carries
back left a frozen key "unchanged" — such cases were dropped rather than promised. Case bodies repeat
across the suites on purpose, each in its own dialect; sharing a body would be sharing a feature set. `it.fails` stays out
of an executer's suite. The benchmarks keep a list of
the executers (`test/PerformanceTests/Executers.js`), because comparing them is what a benchmark
is for.

A case is kept where a change to *that* executer could break it — it runs the executer's own code or
pins a guarantee its README section states. Every executer pastes the statement unchanged into the
function it generates, so one representative case stands for every construct and every position of
a name there; asked twenty times, the engine gives the same answer twenty times. That cut the
suites from 343 cases to 81 without moving the coverage.

## 2026-09-22 — What does an executer do with a name it cannot use?

**Decision:** **It filters nothing and reports.** `ContextDeconstructorExecuter` binds every name
the context carries, a name that cannot be a variable included, so such a context stops every
statement it runs — and the error names the offending key and the statement it happened on.
`README.md` documents it with the executer.

**Reasoning:** Frank's, on 2026-09-22, against the proposal to move the filter from the handle into
this executer. A filter hides a property the caller defined: the caller sees a field they wrote
answer nothing, with no way to learn whether it was dropped, misspelled or simply empty. JavaScript
already detects the case — the generated function does not compile — so the only thing missing is a
message that says which statement failed and which name did it, because the statement need not
mention that name at all. The price was measured before the decision, not after: the default executer no longer
runs over an array, a `Map`, a `Set`, a `NodeList` or a DOM element.
Frank's answer is that this executer was never meant to carry those shapes. What the decision does
**not** cover is a name the executer never needed: a resolver over the global object stops handing
its names down, because a statement reaches a global through the ordinary scope chain (Frank, the
same day) - otherwise one frame on the page would stop every statement below such a resolver.

**Alternatives:** Filter in the executer (the proposal) — keeps every shape of context and hides the caller's
own names. Filter only inherited names and warn about own ones — keeps the shapes and the message,
at the price of a rule that tells one name from another. Make `context-object-executer` the default
— removes the case entirely, at the price of changing the dialect every consumer writes.

**Consequences:** The default executer is for a context of plain data; anything else is
`context-object-executer`. Whoever hands over a `NodeList` gets an error naming a key on its
prototype, which reads like a defect until the message is read — `README.md` explains it. The one filter left in this executer is `blockedPropertyNames`, which is not about names
that cannot be bound.

## 2026-09-22 — Which names does a context carry?

**Decision:** **Every name JavaScript says it carries** — `key in object`, nothing filtered. A
symbol, a reserved word, a key that is not a variable name, and every member the object inherits,
the ones of `Object.prototype` included, are carried and answer a lookup. A resolver built without a
context holds **no object at all** rather than `{}`, and gets one on the first write through
`updateData` or `mergeContext`. `SPECIFICATION.md` 5.2, 6.1, 6.3.

**Reasoning:** Frank's, on 2026-09-22: what the caller hands over is what the caller gets. The
read-through of the specification found the filter answering for two rules at once and keeping
neither — names like `test-test` were dropped, while `Object.prototype` members were kept and let a
resolver without a context shadow `valueOf` of its root. Stopping the prototype
walk before `Object.prototype` was proposed and not taken: it would have been one more rule the
handle makes up on behalf of the caller. Without a filter the only rule left is the language's own,
and the one it cannot express — that a resolver without a context contributes nothing — is kept by
not giving that resolver an object.

**Alternatives:** Stop the walk at `Object.prototype` (the proposal): section 1 and 6.3 hold for
every name, at the price of a rule the language does not have. Keep the behaviour and write an
exception into 6.3: the cheapest, and it leaves a special case every consumer has to know.

**Measured** when the work closed, `npm run bench`, four runs of `4cc573e` against two of the
result: **1.02 over all rows**, 1.11 for the three executers that do not read every name, and 1.05
for the default one over everything but a chain of 100 000 resolvers or more that carries no context
at all. That one case costs a factor of three and is in `BACKLOG.md` under B-07: the seven names of
`Object.prototype` are now carried by the root alone, so each of them walks the whole chain, where an
empty resolver holding `{}` used to answer them at the first step.

**Consequences:** A context value named `valueOf`, `toString` or `hasOwnProperty` further up the
chain is shadowed by every resolver below that holds a plain object — that is `in` answering, and
5.2 says so. An executer that turns names into code has to cope with names it cannot express;
`ContextDeconstructorExecuter` reports them (the entry above). Whether
the name snapshot of 6.2 still earns its place once it filters nothing is left to a measurement.

## 2026-09-22 — Does an executer offer a default context?

**Decision:** **No.** `defaultContext` is removed from the `Executer` interface — the constructor
option and the getter. A resolver built without a context has none of its own, whichever executer
it runs. `SPECIFICATION.md` 4.2, 6.3 and 9.1.

**Reasoning:** Frank's, on 2026-09-22, on this proposal. Since 2026-08-30 the constructor no longer
read it, so half of the public interface was dead while the specification still described it. The
alternative on the table was to redefine it as a global context available behind every chain; it
was not taken because every part of it is covered or contradicted already. A context shared by
many resolvers is what a resolver at the root of their chain is (5.1), and the global object can
be handed in as a context (6.4). Holding data is not an executer's job — it runs statements, and
the context comes from the resolver (see the entry of 2026-08-30 on where a check belongs). A single
object per executer module shared by every resolver is exactly what broke on 2026-08-30: a
`mergeContext` on one context-less resolver showed up in all later ones, because
`ResolverContextHandle` keeps a context by identity. And one more layer behind the chain would cost
every name the chain does not carry one step more.

**Alternatives:** A global context behind the chain, per executer or per package. It becomes the
better choice if a consumer needs values visible to chains it does not build itself — then it
belongs to the resolver, not the executer, and needs its own rules for writes.

**Consequences:** Consumer-visible for 3.0.0: `executer.defaultContext` answers `undefined`. An own
executer that passes the option keeps working, the option is ignored.

---

## 2026-09-22 — Which executer does a resolver use when the `executer` option is left out?

**Decision:** **The one of its parent.** The constructor takes the `executer` option where it is a
registered name or an `Executer` instance, otherwise the executer of the `parent`, and only a
resolver without a parent falls back to `ExpressionResolver.defaultExecuter`. The choice is made once,
in the constructor, and the getter `executer` answers it. `SPECIFICATION.md` 4.2.

**Reasoning:** Frank's, on 2026-09-22: a chain is defined as a whole, and its executer should be
stable along it and change only where the chain says so explicitly, rather than being named on every
resolver. Two facts of the code make that more than convenience:
- **The dialect belongs to the executer** (`SPECIFICATION.md` 9.2) — `context-object-executer`
  reads `${ctx.value}` where the other three read `${value}` — and a scoped statement is executed by
  the executer of the resolver the call was made on, not of the one it addresses: the module-level
  `resolve` hands `aExecuter` up the chain unchanged (`src/ExpressionResolver.js:84-89`). Before this,
  `${root::ctx.x}` on a leaf built without the option ran under the default executer although `root`
  was built for `context-object-executer`, and failed in the dialect it was written for.
- **The only other way to keep one executer across a chain is global.** Setting
  `ExpressionResolver.defaultExecuter` switches it for everything on the page, including code that
  has nothing to do with the chain. Inheritance scopes the choice to the chain it was made for.

What a statement may contain and whether a write from it persists depend on the executer as well,
so a mixed chain gives one expression different semantics per level.

**Alternatives:** Falling back to `defaultExecuter` for every resolver, as before — keeps the
constructor independent of the parent, but makes a non-default chain name its executer on every
resolver and lets a forgotten option switch the dialect silently. It would be the better choice only
if resolvers of one chain were routinely meant to run different executers, which nothing in the
package or its specification suggests.

**Consequences:** Consumer-visible (`CHANGELOG.md`, `Changed`): a resolver built without the option
under a parent with a non-default executer now runs that executer. A mixed chain stays possible and
is now always explicit. The getter `executer` joins the public surface (section 8). The constructor
reads `parent.executer` before it checks that `parent` is an `ExpressionResolver`, so a parent that
is not one leaves `undefined` behind — carried in `BACKLOG.md` under the entry on such a parent.

## 2026-09-20 — Does `ContextDeconstructorExecuter` keep its write-back?

**Decision:** **No.** The executer runs the statement over bindings destructured in the parameter
list of the generated function and carries nothing back. A write from inside an expression is
therefore not readable afterwards under the default executer, and `context-object-executer` is the
implementation to pick where it has to be. The write-back that landed on 2026-09-07 is removed.

**Reasoning:** Frank's, on 2026-09-20, against the measurement the entry in `BACKLOG.md` had been
collecting since the write-back landed. This is the executer that exists for speed — that is why it
is the default (2026-09-01) — and the write-back is what a cache miss pays for. Measured before and
after on the same machine, `npm run bench`, deconstructor column, hz:

| bench | with the write-back | without it |
|---|---|---|
| `ColdResolve` depth 10, links carry a non-matching context | 16 546 | **184 986** |
| `ColdResolve` depth 10, links carry no context | 16 066 | **195 022** |
| `ColdResolve` depth 1 000 | 6 283 / 5 540 | 11 054 / 12 046 |
| `WarmResolve` depth 10 | 147 414 | 158 778 |
| `WarmResolve` depth 1 000 | 8 091 | 8 890 |
| `ResolveText`, 20 distinct expressions | 12 963 | 13 376 |
| `ResolveText`, one expression 20 times | 11 512 | 10 034 |
| `ResolveText`, expressions carrying literals | 9 794 | 10 280 |
| `RandomScope` depth 1 000 | 1 827 | 1 968 |

**A cache miss is about eleven times cheaper**; warm the two are within the noise of a single run, in
both directions. The cause is the shape of the generated source rather than the work the write-back
does at runtime: carrying a value back means every context name has to be a binding of the body — a
declaration, a snapshot of the value it started with, and a guarded assignment back — where the
parameter list spells it once. `new Function` parses that source on every miss, and **a context of
two keys already produces eight names**, because the property cache walks the prototype chain (5.2)
and `hasOwnProperty`, `toString` and the rest come with it. The deep depths of the table are the
bimodal ones `BACKLOG.md` warns about and decide nothing here; the shallow cold figures are the
measurement.

The write-back is not worth that to this implementation. `SPECIFICATION.md` 6.5 promises nothing
about a write persisting — where an assignment lands is the executer's own — so nothing in the
document breaks, and the package still offers it under an executer built for it.

**Alternatives:** Keeping the write-back and paying the miss — rejected: it makes the default the
slowest of the three non-`with` implementations on the path that hurts, which contradicts why it was
made the default. Cutting the cost instead of the feature, by emitting the write-back only for names
the statement text actually contains and leaving out the names inherited from the prototype chain —
the two levers the backlog entry had worked out — rejected as well: both are real, but they buy back
part of a factor of eleven at the price of a generator that has to reason about the statement it
compiles, and the write-back was not wanted enough to fund that. Moving the write-back to a fifth
executer, so that the strategy exists under a name of its own — not taken, because
`context-object-executer` already keeps every such write, and a second implementation of the same
behaviour is not worth its maintenance.

**Consequences:** Consumer-visible, and the loudest part of it is that the **default** executer
changed behaviour: `${ known = "after" }` no longer leaves `getData("known")` answering `"after"`,
and a text carrying `${ counter++ }` twice renders `0 0`. A **mutation** of an object the context
holds still works, because nothing has to be carried back for it. `CHANGELOG.md` carries the
migration note. The random name suffix the generated prologue needed is gone with the prologue: the
generated function declares no name of its own any more, so a context key can no longer collide with
one.

## 2026-09-05 — Does the specification describe the code as it is, or the release?

**Decision:** **The release.** `SPECIFICATION.md` is written as though every rule in it holds. It
carries no *Not yet implemented* marker, no index of pending work, no date, no decision history and
no pointer into `BACKLOG.md` or `DECISIONS.md`. It is a result artifact and reads as one.

Two things follow, and the second is the price of the first:

- **The specification is the release gate for 3.0.0.** While a rule in it is false, the package
  cannot be released. That is a stronger commitment than the document made before, when it described
  the work in progress and said which parts were missing.
- **The gap between document and code lives in two places only**: `BACKLOG.md`, which says what is
  left, and the `it.fails` markers in the component suites, which pin each missing rule and turn the gate red
  the day it arrives.

**Reasoning:** Frank's, on 2026-09-05. The document had become four documents in one — a
specification, a changelog (five dates, seven passages of decision prose), a backlog index (six
pointers and a section listing them) and test documentation (four references into the suite). Each of
those has its own file here, and a reader looking up what the package does had to step over the other
three.

Writing it as though everything exists is the same argument from the other end: a specification that
describes its own incompleteness is a status report, and status is what `BACKLOG.md` is for. The
`it.fails` markers already carry that meaning per case, so nothing is lost by removing the prose
version of it — and the loss would be real if the two ever disagreed.

**Alternatives:** Keeping the *Not yet implemented* markers so a consumer cannot read about something
that does not exist — rejected, but only because the document ships with 3.0.0 and not before: while
the package is unreleased there is no consumer to mislead, and by release the markers would have to be
gone anyway. Cutting the unimplemented features out of the document until they land — rejected: the
specification would then say less than the project has decided, and a rule that is decided but not
built is exactly the kind that has to be written down first.

**Consequences:** The one thing to watch: a rule can now be added
to the document that nothing implements and nothing pins, and the document will not say so — only a
`BACKLOG.md` entry and a failing test will. A rule written without both is a rule that nobody is
holding.

## 2026-09-05 — How is the specification laid out?

**Decision:** In **two parts**. Part A is the **resolver**: what it does, what its API promises, and
everything that holds no matter which executer runs a statement — those are rules, and an executer
may not decline one. Part B is the **executers**: the interface (9.1), the implementations the
package ships (9.2) and their tuning (9.3). What each executer can do is not specified there but
documented with it in `README.md` (2026-09-26). The numbering follows the split, so the public
surface is section 8 and the executers section 9.

Three consequences inside part A, all of them Frank's findings:

- **6.1 stops describing the proxy.** How a context is answered for is an implementation detail and
  does not belong in a specification. What was observable in that section stays, worded as behaviour:
  a context answers for the whole chain, enumerating it describes the chain with the enumerability
  each name has where it is defined, a write lands on the resolver it was made on, and a frozen
  context behaves as the object itself would.
- **6.4 and 6.5 keep their numbers and lose their executer halves.** Whether a global is reachable
  and whether a write can be contained are the executer's own; what stays is the resolver's share —
  the global object handed in *as* a context, and where a write lands once an executer lets it
  through.
- **6.6 gains a statement the document never made**: the three data methods write into the object the
  caller handed over. Read off the code and then measured — `updateData` and `deleteData` through the
  context, `mergeContext` through `Object.assign` on it — and pinned in `test/resolvercontexthandle/write.Test.js`.

**Reasoning:** Section 6 mixed the two axes: rules of the resolver and what one executer happens to do
stood in one run of sections, and a reader could not tell which was which. A reader picking an
executer now reads its description, and a reader implementing one reads the interface.

**Alternatives:** Regrouping without renumbering — rejected: sections out of order make a
specification unusable for looking something up. Cutting the tie between a section number and a test
file name, so that a restructure costs nothing next time — rejected by Frank: the tie is what leads
from a case to the rule it pins, and a specification is not restructured often enough to pay for
losing it. Keeping the proxy in the document as an appendix — rejected: it is not what the package
promises, and the four promises that hang off it stand on their own.

**Consequences:** A restructure moves every citation by section number, in test file names and in the
records. The one failure mode is a citation that still parses — `(6.1)` used to mean *the proxy* and
now means *what a context answers* — so a sweep goes by number rather than by file. Every external
link into the published document by section number breaks, which is what the `CHANGELOG.md` entry is
for.

## 2026-09-05 — What happens when the specification promises something no implementation keeps?

**Decision:** **The specification moves.** `SPECIFICATION.md` 6.5 promised that an assignment inside
an expression could not reach the global object while a switch was off. Only an executer can keep that
promise, an executer may be written by anyone, and three of the four shipped break it in at least one
shape — so the promise was withdrawn, and whether a write stays off the global object is the
executer's own (6.5, 9.2). The switch, `allowGlobalWrite`, left the document with it; `BACKLOG.md`
carries whether it is worth having.

**Reasoning:** Frank's, on 2026-09-05: where we find that we promise something we cannot keep, the
document is what gets corrected. The alternative offered at the time — keep the promise and point it
at whichever executer the package ships as its default — was rejected by him on the spot, and rightly:
a consumer who deliberately picks another executer would then read a guarantee that does not hold for
them, which is worse than no guarantee at all.

The measurements that forced it were taken the same day, by splitting one case into four.
`esprima-executer` was thought to contain the write, and does so only at the top level of a statement
— inside a function body its rewrite does not go, the identifier stays bare, and the sloppy assignment
creates a global. A compound assignment cannot leak anywhere, because it raises on the read. And
nothing contains an explicit `globalThis.x = 1`, which means the guarantee was never about sandboxing
but only about the accidental leak of an unqualified name. A promise that has to be qualified three
times is not the promise the document made.

**Alternatives:** Requiring the containment of every executer and marking the ones that fail as
defects — incompatible with an executer owing nothing beyond the interface. Requiring it of the
default executer only — rejected as above. Implementing the switch first and deciding afterwards —
rejected: the specification would have kept a promise it could not keep for however long that takes,
and the switch's own reach is what the measurement calls into question.

**Consequences:** `CHANGELOG.md` records the withdrawal, because a consumer may have read the
guarantee. What this rules out is a claim of safety: the package does not sandbox the global object,
and 6.7 says the same about `buildSecure`.

## 2026-09-01 — What does the suite prove when a case answers a value?

**Decision:** The suite of a component that hands statements to an executer evaluates nothing.
`TestExecuter` answers the **statement it was handed**, so a case reads the resolver's own work out of
the result and nothing else. Where a rule is about what the resolver does *with* a result, the result
is set — `new TestExecuter(fn)` for the case, since 2026-09-27 one instance per case. What needs a
statement to be *evaluated* is an executer's work and is tested with that executer.

**Reasoning:** Frank's, on reading the result: a case must not test two things at once. The first
case of 3.1 said both *the expression was delimited correctly* and *the statement was evaluated
correctly*, and only the first belongs to 3.1. With an executer that answers the statement, the two
come apart by themselves:

```javascript
const result = await ExpressionResolver.resolveText("a ${ {v: 2}.v } b", {});
expect(result).toBe("a {v: 2}.v b");
```

That reads as what it is — the text the scanner cut out. What `{v: 2}.v` evaluates to is an
executer's work.

An evaluating `TestExecuter` had a second cost: a case could rely on it without anybody noticing,
because it behaved like a real implementation. Section 7 wrote statements that *happened* to fail
under the default executer, so a changed default could have taken the failure away and left the cases
green for nothing. They throw through the `TestExecuter` and assert what the resolver does with an error,
which is what section 7 is about.

**Alternatives:** Keeping the evaluation and living with the double meaning — it hid a broken scanner
behind a working executer and the other way round. Teaching the `TestExecuter` just enough for
the resolver suite — rejected, since "just enough" grows with every case that finds it convenient, which is
how an evaluating one comes about.

**Consequences:** A case that needs a value sets it rather than finding a statement that produces it.
What cannot be asserted this way — that `buildSecure` filters the context and not the globals — says
nothing about the resolver and is the executer's own.

## 2026-09-01 — Does the constructor take an executer instance, or only a registered name?

**Decision:** Both. `new ExpressionResolver({ executer })` keeps looking a **string** up in the
registry and still throws on a name that is not registered; an **`Executer` instance** is now taken
as it is. Before, it took a registered name and nothing else.

**Reasoning:** Frank's, 2026-09-01. Three things, and the first is the one that decides it:

The API already contradicted itself. `ExpressionResolver.defaultExecuter = anExecuter` has always
accepted a name *or* an instance; the constructor accepted only a name and dropped an instance
without a word — same concept, two rules, and the stricter one failing silently. Making the
constructor permissive removes the asymmetry in the direction that breaks nothing.

It is an **addition, not a change**: every call that works today works unchanged, so the library
stays backwards compatible. That is what made the earlier decision worth revisiting rather than
defending — it was taken to keep one way of addressing an executer, but a name and an instance are
equally unambiguous, and the registry buys nothing where the caller already holds the object.

And it makes the resolver testable from the outside. An executer built for one resolver — a
recorder, a stub, an implementation under development — no longer has to be registered globally
first, which means a test needs neither a registry entry nor a change of the default. That is the
immediate reason it came up, but it is not the argument: an API that can only be driven through
global state is harder to use for everyone, not only for a test.

**Alternatives:** Narrowing the static setter to names instead, which would remove the asymmetry the
other way — rejected: it takes something away that consumers may already use, for a consistency that
is worth less than the loss. Leaving both as they were and passing the executer some other way in
tests — rejected: it keeps a silent failure in the public API and works around it.

**Consequences:** `SPECIFICATION.md` 4.2 says both forms; `CHANGELOG.md` carries it under Added. An
executer that is neither a string nor an `Executer` is still ignored in favour of the default, which
stays a silent fallback — the same class of thing as the `parent` that is not an `ExpressionResolver`
(`BACKLOG.md`), and if that one is ever made loud, this one goes with it. The constructor JSDoc
documents the option for the first time.

## 2026-09-01 — Which executer is the default, and what does the switch cost a consumer?

**Decision:** `context-deconstruction-executer`. `with-scoped-executer` stays registered, keeps its
deprecation notice and stays reachable by name, so a consumer who needs its behaviour back sets
`ExpressionResolver.defaultExecuter = "with-scoped-executer"` or builds a resolver with
`executer: "with-scoped-executer"`.

**Reasoning:** Three arguments, none of them alone decisive. First, `with` is what the other three
executers exist to get away from, and a default that announces its own deprecation on the first
expression it resolves is a contradiction: either it is fit to be the default or the notice is
noise. Second, the cross-executer benchmarks of 2026-08-30 put a price on it. Over a chain of depth
100 000 with the asked name a few resolvers up (`RandomScope`), `with-scoped` answers **138 hz**
where `context-object` answers **662 000 hz** and `esprima` **457 000 hz**; `WarmResolve`, where
every executer walks the whole chain anyway, puts the same three within a factor of three of each
other (13 / 41 / 41 hz at depth 1 000 000). The gap is therefore not one executer being faster in
general — it is a full-chain walk that only `with` triggers, which matches the `@@unscopables`
lookup a `with` block performs while resolving a binding. That explanation is consistent with every
number measured so far but has not been proven with a counter in the trap; the walk itself is
carried in `BACKLOG.md`. Third, of the two candidates that do not use `with`, the deconstructor is
the only one that leaves the way an expression is written alone: `context-object-executer` hands the
context to the statement as `ctx` and therefore demands `${ctx.value}` where every expression
written so far says `${value}` (9.2). Changing a default must not rewrite every consumer's
expressions.

**Alternatives:** `context-object-executer`, the fastest of the four in `RandomScope` — rejected on
its dialect alone, and it stays available for a consumer who chooses it deliberately and accepts the
rewrite. Staying on `with-scoped-executer` and dropping its deprecation notice instead — rejected:
it keeps the slowest implementation as the one everybody gets and gives up the reason the other
three were written. Waiting until `ContextDeconstructorExecuter` can also keep a write — rejected:
6.5 promises nothing about a write persisting, so that is not a defect blocking the switch, and
holding the default back for it would mean holding it back indefinitely.

**Consequences:** A write from inside an expression stops persisting for everyone who did not pick
an executer — conformant per 6.5, silent, and the reason the entry in `CHANGELOG.md` carries a
migration note rather than a line. The suite pins the default by name (`test/expressionresolver/default-executer.Test.js`), so the next change of default turns
the gate red instead of announcing itself through unrelated failures — which is how this one was
found. `WithScopedExecuter` is off the default path but stays in `src/executer/index.js` and in the
bundle; whether it is removed for 3.0.0 is not decided here.

## 2026-08-30 — Where does a check belong that only one part of the code needs?

**Decision:** With the part that needs it. Separation of concerns is a rule of this code base, not
a preference: a component does its own job and does not carry a rule on behalf of another one.
Concretely, and this is the case that produced the rule: `ResolverContextHandle` is a cache and a
proxy. It is filled with data structures that are already valid, so it checks and filters nothing.
Where an executer needs a check — which names may appear in the code it generates — that check
belongs to the executer and its implementation. Constants that more than one part needs are
provided centrally, `Constants.js` being the obvious place.

**Reasoning:** Frank's, on 2026-08-30, against the assessment written the same day. A filter placed
where the data is stored rather than where the rule applies looks cheap — it runs once instead of
per use — but it makes the storage answer for a consumer it knows nothing about, and every other
consumer pays for a rule it never asked for. That was measurable here: `VARNAME_CHECK` and
`RESERVED_WORDS` were needed by exactly one of four executers, the one that turns names into code,
yet they were applied while the property cache was built and therefore narrowed **the lookup** for
all four. A context carrying `test-test`, `class`, `0` or `undefined` answered `undefined` under
`ContextObjectExecuter`, although `ctx["test-test"]` is an ordinary property access that executer
can express. The component that owns the rule is the only one that can weigh it.

**Alternatives:** Keep the filter where the names are collected, because it runs once per context
instead of once per execution. That is a real cost and it is the argument that has to be measured
when a check moves, not one that decides where the rule belongs. Splitting the rule — the syntactic
half to the executer, the shadowing half (`undefined`, `constructor`) to the handle — was weighed and
rejected for the same reason: it leaves the handle answering for a consumer's concern.

**Consequences:** The handle filters nothing, and since 2026-09-22 no part filters a name at all: a
context carries what JavaScript says it carries, and the one executer that cannot use such a name
reports it (the two entries of that day). Beyond this case the rule applies to every part of the
code, and it is the reason to ask, before adding a check anywhere, whose job the rule actually is.

## 2026-08-29 — Is the price of evaluating every occurrence on its own acceptable?

**Decision:** Yes, and it is the only case that got slower. A text repeating one expression twenty
times costs about seven times what it did, because it is now evaluated twenty times instead of
once. Everything else the rework touched came out faster.

**Reasoning:** Measured when the expression parsing rework closed, with the source from before it
(`900a454`) and the finished one **alternating inside one batch** — the only comparison that
holds, because the machine drifts by more between batches than these changes are worth. Two runs
each, `mean` in milliseconds:

| case | before | after |
|---|---|---|
| resolveText, 20 distinct expressions | 0.0479 / 0.0534 | 0.0259 / 0.0275 |
| resolveText, one expression 20 times | 0.0037 / 0.0038 | 0.0249 / 0.0268 |
| resolveText, no expression at all | 0.0005 / 0.0006 | 0.0002 / 0.0003 |
| ColdResolve, depth 10 | 0.0020 / 0.0023 | 0.0018 / 0.0019 |
| ColdResolve, depth 1 000 | 0.0197 / 0.0234 | 0.0180 / 0.0192 |
| WarmResolve, depth 1 000 | 0.0186 / 0.0196 | 0.0193 / 0.0214 |

The distinct case is **45 % faster**: the `split`/`join` over the whole text per distinct
expression is gone, and with it the quadratic behaviour. Text carrying no expression at all is
**twice as fast**, because `indexOf("${")` beats the old regular expression — and that is the case a
template engine hits most often, by far. The chain benchmarks did not move beyond their spread,
which is what was wanted: `resolve` was rewritten twice in this plan and neither rewrite cost
anything. The repeated case is the one that pays, and it pays for `SPECIFICATION.md` 4.3: an
expression with a side effect now means what it says, and `${counter++}` twice increments twice.
The seventh of a millisecond it costs over twenty occurrences buys a rule that used to be silently
broken.

`ResolveText.bench.js`'s fourth case, expressions carrying literals, is **not** in the table: it is
not comparable across the change, because the old regular expression could not see most of those
expressions and so did far less work than it should have.

**Alternatives:** Caching the value of an expression per text and reusing it for identical
occurrences, which is what the old code did by accident. Rejected with 4.3 itself: it is the defect,
not an optimisation.

**Consequences:** A consumer rendering a text that repeats one expression many times pays for each
occurrence. Nothing in the family does that today. The measurement also turned up a property of the
benchmarks themselves: they hold a chain of a million resolvers live, so a collection during a run
costs hundreds of milliseconds and can inflate the mean at depth 10 two- to fourfold — see
2026-09-30, "Do the benchmarks get rid of the long pause at depth 10?". And the method is
worth keeping: where the drift indicator has moved, alternate the two versions inside one batch
instead of comparing against a recorded baseline.

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
through, so that a name no resolver carries stays soft. That was the counter-proposal, and it was
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
is not an execution error, and nothing has run at that point. That was the smaller half of the
error-policy question; the larger one — whether a statement that does not compile propagates out of
`resolve` — was decided the same day, and it does: see "Does `resolve` catch the errors of a
statement?" above. The escape rule makes an
escaped delimiter cheaper to scan than an unescaped one, since no brace matching is needed. And
`${}` becomes an expression where it used to be text, so a text carrying it changes its answer.

## 2026-08-29 — Does the expression scanner recognize regular expression literals?

**Decision:** Yes. Inside a statement a `/` opens a regular expression literal unless the last
character that is not whitespace is an identifier character, a digit, `)` or `]` — then it is
division. Braces inside such a literal do not count towards the matching closing brace, and a
character class hides a `/`. Comments were left out at first; they are recognized since
2026-09-27 — see "Does the expression scanner recognize comments?".

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

**Alternatives:** Leaving regular expression literals out and documenting them as a limit, which is
what the specification would have said had the measurement gone the other way.
A full JavaScript lexer instead of the heuristic — rejected as far more than 3.1 asks for, and it
would have to be maintained against the language.

**Consequences:** The scanner carried five states instead of three, and one heuristic that can be
wrong: where a regular expression legitimately follows `)` or `]` — `${ (() => { if (a) /x/.test(b)
})() }` is the shape — the `/` is read as division. Nothing is cut unless that literal also carries
a brace. The everyday cases are safe in both directions, because division follows a value and a
literal does not. `test/expressionscanner/delimiters.Test.js` pins both directions, and the division test is there to
keep the heuristic honest rather than to prove a fix.

## 2026-08-24 — How does a test state a rule the code does not keep yet?

**Decision:** It is written as a normal test and marked `it.fails`. Vitest then counts it as passing
while it fails, and the moment the behaviour becomes correct the test **fails for passing**, which
forces the marker to be removed in the same change that lands the fix. Every such test carries a
comment naming the `BACKLOG.md` entry it waits for. Before a marker is written down, the test is
run **once without it** and its failure message is read against what the specification predicts.
This is how the conformance suite was built between 2026-08-22 and 2026-08-24, and it is how any
later test for an agreed but unimplemented rule is written. Where such a test may stand, and that no
release carries one, is the entry of 2026-09-27.

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

## 2026-08-24 — What do the edge cases of the expression parser and of the scope walk do?

**Decision:** Three rules, all now in `SPECIFICATION.md`. A brace inside a string literal does not
count towards the matching brace, so `${ "}" }` is one expression with the statement `"}"`. An
opening `${` with no matching closing brace is not an expression at all: the text stands
unchanged, no error, no partial replacement. And where two resolvers of a chain carry the same name,
`${name::statement}` answers from the first one found while climbing towards the root.

**Reasoning:** All three were found by probing the edge cases of sections 3 and 5 on 2026-08-24,
before the matching-brace parser and the scope-walk fix are written — which is the only cheap
moment to decide them. Counting a brace inside a string literal would cut `${ "}" }` in the middle
of a literal, which no reader of the expression would expect. Leaving an unterminated `${` alone
keeps the failure mode of the syntax uniform: text that is not an expression is text. The scope
walk taking the first hit makes 5.3 behave like 5.2, so one mental model covers both lookups, and
it follows how a chain is used: the deeper resolver is the one introduced most recently.

**Alternatives:** For the unterminated delimiter, throwing or replacing up to the end of the text.
Rejected — both turn a typo in a template into a hard failure or into silent corruption, and a
template engine feeding this package cannot always guarantee the text it passes. For duplicate
names, answering from the root-most resolver. Rejected: it would mean a resolver deeper in the chain
cannot shadow a name, which contradicts the purpose of the chain stated in section 1.

**Consequences:** The parser of the brace fix has to know string literals — `'`, `"` and backtick
— which is more than counting characters, and it has to be able to reach the end of the text
without a match and then do nothing.

## 2026-08-24 — May an executer dictate how a statement addresses a context value?

**Decision:** Yes. How a context value is written inside a statement is the executer's own.
`ContextObjectExecuter` demands `ctx.` in front of every context value; the other three put the
properties into scope, where the bare name works. `SPECIFICATION.md` 9.2 says so, and `README.md`
spells out the dialect of each executer.

**Reasoning:** The rules of section 5 turned the difference up on 2026-08-24: five tests failed under
`ContextObjectExecuter` alone. Addressed as `ctx.value` that executer keeps **every** rule of 5.2 the
other three keep — shadowing, the walk to an ancestor, a key holding `undefined`, the prototype
chain. So the chain, which is what section 5 is about, is not affected at all; only the spelling is.
An executer is a strategy for turning a statement into a value, and what a statement may look like is
part of that strategy. Forbidding it would mean rewriting `ContextObjectExecuter` around a rule
nothing needed.

**Alternatives:** Make every executer put the context properties into scope, keeping `ctx.` as an
addition. Rejected: it removes the one property that distinguishes `ContextObjectExecuter` from
the others without a consumer asking for it. It would become the better choice if expressions
ever have to be portable between executers — that is the cost below.

**Consequences:** Switching executer can mean rewriting expressions, and that is documented rather
than discovered. Open alongside it, and only an idea so far: making the `ctx` prefix of
`ContextObjectExecuter` configurable, so a consumer can pick the identifier. It has its own
`BACKLOG.md` entry.

## 2026-08-24 — When does a resolver count as providing a context?

**Decision:** When the caller handed a context to the constructor — anything that is neither
`null` nor `undefined` — or when a value has been set on the resolver since. What the context holds
does not matter: an empty object counts. A resolver provides no context only if it was built without
one and nothing has been written to it since.

**Reasoning:** A rule by what the context holds — a resolver counting only while its context holds
at least one reachable value — needs a definition of "holds a value", and pinning it showed that
definition does not exist: `#initPropertyCache` walks the
prototype chain to its end, so the cache of even `{}` holds `hasOwnProperty`, `toString` and the
rest of `Object.prototype`. Read literally, every context would be non-empty and `effectiveChain`
would equal `chain` again; read as intended, the specification would have had to draw a boundary
somewhere inside the prototype chain — own keys plus everything up to but excluding
`Object.prototype` — and then explain why `{ class: 1 }` is empty while `{ value: 1 }` is not.
That is a lot of rule for a getter whose purpose is debug output. Deciding it at construction is
one comparison, needs no cache, and cannot drift as the context changes shape.

**Alternatives:** That rule, with the prototype boundary written out. It would become
the better choice if a consumer ever needs `effectiveChain` to answer "which resolvers can actually
contribute a value to a lookup" rather than "which resolvers were given a context" — the two differ
for a resolver handed an empty object.

**Consequences:** `context: null` and `context: {}` are told apart here, and only here; for a
lookup they stay equivalent (6.3). A resolver built without a context joins `effectiveChain` and
`contextChain` the moment a value is written to it, so both still describe a state rather than a
structure.

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
behaviour; where the code does not keep it yet, `BACKLOG.md` carries the entry (2026-09-05), and the
specification is the reference for what the fix has to achieve.
Publishing it adds a file to the `files` array.

## 2026-08-22 — Does a key holding `undefined` shadow a value nearer the root?

**Decision:** Yes. A lookup is decided by whether a resolver **carries the key**, not by what the
key holds. A key defined as `undefined` answers and stops the walk; a key a resolver does not carry
is passed on to its parent.

**Reasoning:** It is what JavaScript scoping itself does, and the property cache is keyed by name,
so it is also the cheapest rule — one map lookup per resolver, no value inspection.

**Alternatives:** Reading `undefined` as "not there" and walking on was proposed, on the ground
that the package elsewhere uses `undefined` to mean a thing does not exist. It was rejected:
that rule is about what a *lookup answers to the caller*, not about how a resolver's own keys are
read. It would also have made it impossible for a resolver to deliberately hide an inherited value.

**Consequences:** A context built as `{ item: obj.missing }` carries the key `item` and hides
whatever the parents hold under that name. Combined with the default-value rule the caller still
sees a value where one was passed, so the effect surfaces only when no default is given.

## 2026-08-22 — Is a context a snapshot or read live?

**Decision:** **Names are a snapshot, values are live.** The set of keys a resolver contributes is
captured when it is built; the values behind them are read at the moment of the lookup.
A key added directly to the handed-in object afterwards is invisible until
`contextHandle.resetCache()`, `updateData` or `mergeContext` rebuilds the set.

**Reasoning:** That cache is what makes the chain walk cheap — one map lookup per resolver. It also
matches how the package is used: a resolver of a chain is filled and then used, not
extended while it is being read.

**Alternatives:** A live fallback — `Reflect.has(data, property)` on every cache miss — was
weighed and rejected. It doubles the cost of the miss path, which is the path that walks the
entire chain, and `ownKeys`, which `ContextDeconstructorExecuter` calls on *every* execution,
would have to be rebuilt live along with it.

**Consequences:** Mutating an object handed to a resolver is not enough to make a new key visible,
which is a documented side effect rather than a defect.

## 2026-08-22 — Is reaching the global object a promise of the package?

**Decision:** No. It is described as a **mechanism** and the details belong to the executer.
Every executer the package ships runs the statement as ordinary JavaScript, so the engine resolves
a name the chain does not carry — under `ContextObjectExecuter` every bare name — against the
global object, and no executer can prevent it.

**Reasoning:** The resolver does not execute anything itself. Promising a global fallback would
bind every future executer to it; the removed `EsprimaExecuter` reached globals only through a
fixed list of names, and a sandboxed executer would reach none.

**Alternatives:** Specifying it as a guarantee every executer must honour would give consumers one
rule to rely on, at the price of constraining every future execution strategy — including a
sandboxed one, which is the direction a CMS deployment would want.

**Consequences:** `buildSecure` filters the context, not the globals: `fetch`, `console` and
`document` stay reachable from an expression. It is a way to hand over a cleaned context, not a
sandbox, and must not be documented as one. A consumer who wants a name resolved locally puts it
into the context so the engine finds it before walking out.

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
nearest resolver carrying the key answers. `updateData` changes the value **where the key lives**,
creating it on the calling resolver only when no resolver carries it. `deleteData` removes the key
from exactly **one** resolver. `mergeContext` assigns shallowly into **one** resolver's context and
does not search. A `filter` selects exactly one resolver, and **a filter matching no resolver
throws** in all four.

**Reasoning:** These methods are the path with guaranteed behaviour, identical under every
executer, so their reach has to be stated rather than inherited from whatever the code does — the
code answers three different things today and one of them is a defect. The throw follows the same
line: a filter naming a resolver that does not exist is a mistake in the calling code, unlike a
scope name inside an expression, which is data and must never stop a render.

**Alternatives:** A switch widening `deleteData` to the whole chain was agreed and then withdrawn:
a filter names one resolver, a chain-wide switch names all of them, and the two contradict each
other in one call. Rather than invent a rule for the contradiction, the method stays at one
resolver; walking the chain and deleting per resolver is three lines of consumer code, since
`parent` and `name` are public.

**Consequences:** An unmatched filter is silently ignored today, so this is consumer-visible.
`mergeContext` becomes the only way to define a key on one resolver when a resolver nearer the root
already carries it — `mergeContext({ key: value })` with a one-key object. A separate `setData`
was proposed for that and dropped: no method is added, the surface stays at four.

## 2026-08-21 — What module format does the webpack config use, and how does it read JSON?

**Decision:** `webpack.config.mjs`, native ESM, reading `package.json` and
`entries.config.json` through `createRequire(import.meta.url)` rather than through JSON import
attributes. It stays `.mjs` under `"type": "module"` (2026-10-01).

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
CommonJS alive in a package that is otherwise pure untranspiled ESM. Since `"type": "module"`, a
`.js` name would work as well; `.mjs` says what the file is without depending on that field.

**Consequences:** Everything naming the config has to say `webpack.config.mjs`; the
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
installs that are perfectly fine. The one runtime dependency,
`@default-js/defaultjs-common-utils`, declares `>=16`; `espree`, which set the only floor that
could have mattered to a consumer, left with `EsprimaExecuter` on 2026-09-28.

**Alternatives:** Setting `engines` with the toolchain floor would make CI failures louder at
the cost of every consumer.

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

The script is ESM, like every other file of the package (`"type": "module"`, 2026-10-01).

**Alternatives:** `DefinePlugin` is a smaller change but fixes only the bundles, leaving the raw
published sources broken — which was the worst of the three defects. Checking `src/version.js`
into git, as `defaultjs-common-utils` does, avoids a generated file being absent in a fresh
clone before the first build; the cost is a generated artifact in the diff of every release.

**Consequences:** A fresh clone has no `src/version.js` until something builds. Nothing imports
it outside the two browser entries, so tests are unaffected, but any future importer must be
aware. The version now has to be right in `package.json` before a build, not before a publish.


## 2026-08-21 — Does `package.json` carry a `sideEffects` field?

**Decision:** Not as `false`, ever. No `sideEffects` field is set. Tree shaking of the `dist/`
bundles is on since 2026-10-01; that entry has the measurement.

**Reasoning:** *Adding `sideEffects: false`* breaks the package. `dist/browser-…min.js` dropped from
13 403 to 8 126 bytes when tried, and the bundle lost `context-object-executer` and
`context-deconstruction-executer`. Every executer registers itself through a bare
`import "./XExecuter.js"` in `src/executer/index.js`. Declaring the package free of side effects
tells every bundler, ours and the consumers', that those imports may be discarded.

**Alternatives:** A `sideEffects` field could be introduced as an *array* whitelisting the
self-registering modules (`./src/executer/*.js`, `./browser.js`), which would let a consumer's
bundler drop the rest. Nobody has asked for it; `false` is the value that must never appear.

**Consequences:** Bundlers treat every module of the package as having side effects, so a consumer's
bundle keeps what it imports, transitively, whether used or not.


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
`defineConfig` from `vitest/config` is the documented path. The config file is `.mjs`,
which holds with or without `"type": "module"`.

The measurements and the full pro/contra per candidate were recorded in the toolchain
modernization plan; that plan was retired on 2026-08-21, so the git history up to commit
`6ca1a4c` is where they live now.


## 2026-08-21 — Do we commit style configuration, and does the tree get normalized?

**Decision:** Yes to both. `.editorconfig` and `.gitattributes` enter the repository, and the
tree was normalized once to match them in the same change.

- `.editorconfig`: utf-8, LF, tabs, final newline, no trailing whitespace. Markdown is the
  one exception — spaces, width 2, because list nesting and fenced blocks are column-based
  syntax there, not style. Generated paths (`dist/**`, `coverage/**`, `target/**`,
  `package-lock.json`) unset every key.
- `.gitattributes`: `* text=auto eol=lf`, plus `linguist-generated` on the generated paths.
- Normalization touched 55 tracked files: four were pure CRLF (`browser.js`,
  `src/ExpressionResolver.js`, `src/index.js`, `test/index.js`), 29 had no final newline,
  ~20 carried trailing whitespace. Space indentation became tabs in `src/Executer.js`,
  `src/Utils.js`, `test/TestUtils.js`, `webpack.config.js` and one configuration file since
  removed; the JSDoc blocks at `src/CodeCache.js:29` and `:40` sat one
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
