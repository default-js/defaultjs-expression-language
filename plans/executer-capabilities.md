# Plan — the executer capability catalogue

**Status:** drafted 2026-09-05, rewritten the same day after Frank's objection to the rule/capability
split. Not approved. Nothing implemented.

## Goal

Replace the difference list of `test/ExecuterCapabilities.js` with a **catalogue of what an executer
supports**, fine-grained enough that a consumer can pick an implementation from it, and implement the
tests that pin every entry of it under all four executers.

Decided by Frank on 2026-09-05, in this order:

1. The catalogue stays **test-only**. No capability metadata on the executer in `src/`, no widening
   of the public surface (section 9).
2. The catalogue is **the surface, not the difference list**: what every implementation supports gets
   an entry as well. That is what makes it readable as "what can this executer do" instead of "where
   do the four disagree".
3. **All groups**, not a selected one — the point of this undertaking is the completeness of the
   list, not a fix.
4. **An executer has capabilities and nothing else.** Beyond the interface it implements and the
   promise to execute an expression, no demand is made of it. What a capability measures is **how far
   an executer supports JavaScript over a dynamic context** — which constructs run, how much of the
   language's scoping survives, which values stay reachable, whether a write behaves the way an
   assignment does.

## Vocabulary

The specification and the suite do not use the same word today. Measured rather than remembered:
`SPECIFICATION.md` says *behaviour* six times and **never says capability**, yet its line 585 points
the reader at `MATRIX` in `test/ExecuterCapabilities.js`; `CHANGELOG.md` (2026-09-01) calls the table
of 8.3 a *capability table*, describing the document with a word the document does not use; the suite,
`DECISIONS.md` and `AGENTS.md` say *capability*.

**Settled by point 4 above**, and the two words separate by subject rather than by rank:

- **behaviour** — what the *resolver* does. The word of `SPECIFICATION.md`, unchanged in 6.5 and 7.
- **capability** — what an *executer* supports. The word of the catalogue, and of `SPECIFICATION.md`
  8.3, whose heading moves from *Behaviour that is the executer's own* to a capability heading. That
  section is the executer axis and nothing else, so the two are the same thing under two names today.

There is no third word. A **rule** stays what it always was — a normative statement of
`SPECIFICATION.md` — and rules are about the resolver; see the next section for the ones that need an
executer to be seen at all.

## What is not a capability

Three things live in `test/executer/` today that this catalogue does not carry. Naming them is half
the point of the rewrite, because 26 of the 57 rows in the table today are one of them.

**1. Rules of the resolver that only show through a statement — 25 rows.** The chain walk (5.2, 5.3,
5.4), the name snapshot (6.2), a resolver without a context (6.3), reading and writing from outside
(6.6) and the error policy (7). None of them is the executer's work: the walk lives in the proxy traps
of `ResolverContextHandle` — `has`, `get` and `ownKeys` climb `#parent` — and every executer gets it
for free, whether it opens a `with` block, hands the proxy over as `ctx` or destructures the names
`ownKeys` already collected from the whole chain. An executer cannot break these rules except by not
reaching the context at all, and that is a broken executer, not a declined rule.

They stay as tests and stay per executer, because `TestExecuter` evaluates nothing and they cannot be
observed without a real one. What they lose is the row: **no state, no table lookup, plain `it`**. A
failure is a red gate the ordinary way. `test/executer/rules/` is finally an accurate name for the
directory that holds them.

**2. The interface contract.** `defaultContext` and `execution` (8.1), registering on import and being
reachable through `getExecuter` by name (8.2). This is the one demand Frank grants, and it is not a
yes/no axis: an implementation that fails it is not an executer. Plain tests, no rows.

**3. The dialect.** Unchanged from today: a spelling is no yes or no. It stays as `variableName` on the
executer entry.

**The one case that argued back, and how Frank settled it.** The negative guarantee of 6.5 — a write
to a name no resolver carries must not reach the global object — cannot be kept by the resolver. Only
the executer can catch it, and `BACKLOG.md` writes the fix per implementation (`with-scoped`: `has`
answers `true` for every name; the deconstructor: a strict-mode body, so the assignment throws). So it
reads like a demand on the executer.

**Decided 2026-09-05: then the specification is wrong and moves.** Where the document promises
something the package cannot keep, the document is what gets corrected — and pointing the promise at
the default executer instead is not an answer, because a consumer who picks another executer would
read a guarantee that does not hold for them. So the containment becomes a **capability** like the
rest, `SPECIFICATION.md` 6.5 is rewritten to say so, and the two cells that read `defect` today read
`no`. Two consequences to carry through in the same change:

- **The switch of 2026-08-22 loses its footing as a guarantee.** `allowGlobalWrite` was agreed as a
  three-level switch, *off* by default, with off meaning a write to an unknown name is redirected into
  the resolver's own context. Off can only mean *under the executers that can catch it*; under the
  others it means nothing. Whether the switch is still worth having on those terms is a question for
  `BACKLOG.md`, not for this plan — but 6.5 must not be rewritten as though the switch closed the gap.
- **The `BACKLOG.md` entry stops being a defect.** "A write to an unknown name inside an expression
  lands on `globalThis`" becomes a capability two implementations lack, and its text says so.

## Non-goals

- **No executer is changed.** Not the write-back draft, not `RESERVED_NAMES`, not the global-write
  containment. Every one of those has a `BACKLOG.md` entry and stays there; this undertaking records
  what is true today and gives each of them a test that turns red the day it lands.
- No change to `SPECIFICATION.md` beyond three things: rewriting the table of 8.3 from the finished
  catalogue, carrying the vocabulary into it, and **6.5**, whose negative guarantee becomes a
  capability statement (see above). No other rule of the document is added, dropped or reworded.
  The 6.5 change is consumer-visible and takes a `CHANGELOG.md` entry with it.
- No new rule of the resolver. `test/spec/` is not touched.

## Precondition

`src/executer/ContextDeconstructorExecuter.js` carries the write-back draft of the `BACKLOG.md` entry
— `generate2`, the destructured names as `let` bindings with a guarded copy-back in `finally`,
`DEBUG = true`, the old `generate` half dead beside it, the warning threshold at 10 instead of 50.
**It was committed by Frank on 2026-09-05 as `30e5623`**, so it is the state of the branch and no
longer something to stash. What was written here before that — measure against a clean tree — is
therefore not a precondition any more but a question for Frank, and two findings decide it:

- **The write-back in it does not work.** It writes back only where
  `Object.getOwnPropertyDescriptor(ctx, name)?.writable` is true, but the context is the proxy of
  `ResolverContextHandle`, whose `getOwnPropertyDescriptor` trap answers an **accessor** descriptor
  (`get`, `enumerable`, `configurable`). `writable` is `undefined` there, so nothing is ever copied
  back. Verified indirectly and decisively: the capability row `makes a write to a name the context
  carries readable afterwards` is `no` for the deconstructor and runs as `it.fails` — with the draft
  in the tree it still fails, and a working write-back would have turned the gate red with
  `Expect test to fail`. The draft in `BACKLOG.md` used a comparison guard
  (`if (counter !== context.counter)`), which does not depend on a descriptor.
- **Every state recorded so far is therefore the state without a write-back**, which is the state the
  catalogue is supposed to describe today. Nothing measured in stage 0 is wrong because of the draft.

What the draft does cost is coverage: it adds 20 statements and 18 lines to that file, nine of them
unreachable (`generate` and `getOrCreateFunction`, which nothing calls any more), which is why the
percentages cannot be compared against the `BACKLOG.md` baseline until it is either finished or
reverted. That is Frank's call, not this plan's.

## The mechanism

`MATRIX` is keyed by specification section today, and a case is looked up by its name within that
section. It becomes keyed by **capability**, and the third state goes:

```javascript
export const CAPABILITIES = {
	"context-write": {
		specification: "6.5",              // the section it is read against, where there is one
		description: "Whether an assignment inside a statement behaves the way JavaScript's does.",
		cases: {
			//                                             with-scoped  context-object  deconstruction  esprima
			"makes a plain assignment readable afterwards": [ YES,       YES,            NO,             NO ]
		}
	}
};
```

- **Two states, `yes` and `no`.** `DEFECT` is gone from the executer table: nothing an executer does
  can break a rule it was never given. Whether a `no` is meant to become a `yes` belongs in
  `BACKLOG.md` — which is what was decided on 2026-08-30 and what the third state kept undermining.
  `MatrixTest.js` loses the two checks that only existed to police it and keeps the shape checks.
- **The `it.fails` marker gets one meaning per directory.** In `test/spec/` it says *not implemented
  yet*; in `test/executer/` it says *this executer does not support this*. `AGENTS.md` currently has
  to explain that the same marker means two things — that paragraph shortens.
- **A capability is one file**, `casesOf("context-write", executer)` in place of `casesOf("6.5", executer)`.

`EXECUTERS`, `variableName` and `executerEntry` stay as they are.

## The list

Six capabilities, roughly **110 rows**, along the axis of point 4: how far the executer supports
JavaScript over a dynamic context. Today's 57 rows split into **31 that stay rows** and **26 that
become plain tests** (25 resolver rules plus `registers itself on import`), so about 80 of the 110 are
new.

`[new]` marks a facet the suite does not ask today. **No state is written into this plan** — every one
is measured in the stage that implements its group, because a state guessed into a table and then
confirmed by the test it generated proves nothing.

### Every construct twice — the principle behind groups 1 and 2

Frank asked on 2026-09-05 how much of the language belongs in the catalogue. The answer is not a
longer list of constructs but **two questions per construct**, and today's suite only ever asks the
first:

1. **Does it run?** The construct with constants inside — `${ {a: 4}.a }`. Nearly free for three of
   the four, which paste the statement verbatim into a function body, so anything legal in expression
   position runs. The whole risk is `esprima`, which parses to an AST, rewrites it and generates code
   back.
2. **Does it still see the context?** The same construct with a context name inside —
   `${ {a: value}.a }`. This is the question that separates the implementations, and it is the one
   nobody is asking today.

**Why this is not theory.** `TRAVERSABLE_PROPERTIES` in `src/executer/EsprimaExecuter.js:31` lists
`body, arguments, argument, expression, callee, params, ast, object, left, right`. It does **not**
list `properties` (object literal), `elements` (array literal), `test` / `consequent` / `alternate`
(ternary), `tag` / `quasi` (tagged template), and the `MemberExpression` handler walks `object` only,
never `property`. `IGNORED_TYPES` skips function bodies whole. Read off that, `${ {a: value}.a }`,
`${ [value][0] }`, `${ flag ? a : b }`, `${ obj[key] }` and `${ new Cls() }` fail under `esprima` while
the other three answer — and the table says `evaluates an object literal: YES` for all four today,
because the case uses `{a: 4}`. Predicted from the code on 2026-09-05, not measured; stage 3 measures
it.

Every facet below therefore names which of the two questions it asks. Where a construct cannot
plausibly fail question 1, it gets no row in `syntax` and only one in `context-scope`.

### 1. `syntax` — which JavaScript constructs run at all

Read against 3.4 and 8.2. Constants only; a context name never appears in a case of this group.

- operator expression · call on a member · object literal · arrow function body · template literal ·
  regular expression literal · `await` *(the seven of 3.4 today, all of which use constants)*
- `[new]` **assignment forms, five rows where 8.2 has one**: `x = 1` · `x += 1` · `x++` ·
  `obj.a = 1` · `({a} = o)`. Under `esprima` all five are expected to fail from one cause (`ctx?.x` is
  not a legal assignment target); the split confirms or refutes that instead of assuming it.
- `[new]` `function(){}` · an IIFE · `new Cls()` · a class expression
- `[new]` a spread argument `f(...list)` · object spread `{...o}` · array spread `[...list]`
- `[new]` optional chaining `a?.b` · `a?.[k]` · `a?.()` · nullish `??` · logical `&&` / `||`
- `[new]` a ternary · a comma sequence `(a, b)` · `typeof` / `instanceof` / `in` / `delete` · `**`
- `[new]` a tagged template · a computed object key `{[k]: 1}` · shorthand `{value}` (a different AST
  node from `{value: value}`, and the rewrite treats it differently)
- `[new]` **the boundary of what an expression is**: a declaration `let x = 1` · two statements
  `a; b` · a bare `return`. All three are expected to fail under all four — the row exists so the
  boundary is written down instead of being rediscovered.
- `[new]` **the mode the generated body runs in**, observable through
  `${ (function(){ return this; })() }`: `globalThis` in sloppy mode, `undefined` in strict. The
  deconstructor generates a sloppy body and `with` is illegal in strict mode altogether, so this is
  the same property the global-write containment hangs on — worth a row of its own rather than being
  inferred from it.

### 2. `context-scope` — how much of JavaScript's scoping survives

Read against 8.3. Every construct of group 1 that can carry a name, carrying one. This is where the
four differ most, and where the dialect lives without being a row.

- addresses a context value the way its own dialect spells it · answers a bare context name only where
  that is its dialect · reads a context value from inside a template literal · reaches a context value
  from inside a nested function · answers from the context where the global object carries the same
  name *(five rows of 8.3 today)*
- `[new]` **the nested function split into six**: an arrow with an expression body · an arrow with a
  block body · a `function(){}` expression · a callback handed to a builtin (`[1,2].map(cb)`) · a
  default parameter reading the context · an async arrow awaiting a context value. The `BACKLOG.md`
  entry names three of them; the suite asks one.
- `[new]` **a context name inside a literal**: an object literal `{a: value}` · shorthand `{value}` ·
  an array literal `[value]` · a computed key `{[key]: 1}` · a spread `{...obj}`
- `[new]` **a context name in a position the rewrite may not reach**: a ternary `flag ? a : b` · a
  computed member `obj[key]` · a tagged template · both sides of `??` and `&&`
- `[new]` a deep member access `a.b.c` · an optional chain over a context value `a?.b?.c`
- `[new]` **a method of the context called bare, keeping `this`** — under a `with` block `this` is the
  context, under destructuring the binding is lost. A difference nothing asks about today.
- `[new]` `new Cls()` with `Cls` from the context
- `[new]` a value read twice within one statement
- `[new]` **async against the context**, four rows where 3.4 has one: `await` on a context promise
  *(today)* · `await` on a promise a global produced · an async IIFE reading the context · `await`
  inside a nested arrow

### 3. `context-shape` — which structures can be put into scope

Read against 6.1. `SPECIFICATION.md` says nothing about what a context may be, and this catalogue is
what answers the open `BACKLOG.md` question by writing down what each implementation accepts.

- object · array (`length`, indices) · `Map` · `Set` · `NodeList` · element · `arguments` · frozen · a
  key that is not a variable name · a named key beside a numeric one · an accessor on the prototype of
  a `Map` *(the 11 rows of 6.1 today)*
- `[new]` `Object.create(null)` — no prototype at all
- `[new]` a primitive (`"abc"`, `42`) — throws at construction today, `BACKLOG.md` carries that
  decision; the row records which implementations would cope if it did not
- `[new]` a symbol key alongside string keys
- `[new]` **a key that collides with the generated code's own names** — `ctx` and `context`. The
  deconstructor names its parameter `ctx` and `new Function("context", …)` its argument; a context
  carrying either name is a case no implementation was designed against. Read out of the write-back
  draft, not measured.
- `[new]` a key named like a reserved word (`class`, `undefined`, `constructor`) — the other half of
  the name check `BACKLOG.md` wants moved out of `ResolverContextHandle`
- `[new]` a getter that counts its calls — the deconstructor reads every name on every execution,
  which is an observable side effect and today only visible through the `arguments` row
- `[new]` a getter that throws, planted deliberately rather than through `arguments`
- `[new]` a context carrying many keys — the threshold the deconstructor warns at

### 4. `context-write` — whether an assignment behaves like an assignment

Read against 6.5. One row today; the write-back draft in `BACKLOG.md` answers each of these
differently, and its guard is the reason the split matters.

- makes a write to a name the context carries readable afterwards *(the row today)*
- `[new]` counts across two occurrences of `counter++` in one text
- `[new]` a write to a name an **ancestor link** carries — own context or ancestor? The guard of the
  draft deliberately does not write it back
- `[new]` a write from inside a nested function
- `[new]` a write while the statement throws — `finally` writes back by default
- `[new]` a write to a non-writable key, and to a key of a frozen context
- `[new]` a write to a name the context does **not** carry — the boundary to `global-scope`
- `[new]` a **mutation** of a context object (`obj.a = 1`) as against a **rebinding** of a context name
  (`obj = {}`); the first survives everywhere because the object is shared, the second is what this
  capability is about

### 5. `global-scope` — which globals stay reachable, and whether a write can be caught

Read against 6.4 and 8.3. Two rows today, and the `no` of `esprima` is wrong in the sense that
matters: it reaches seven globals and declines the rest.

- reaches a global through `window` · reaches a global that no resolver carries *(today)*
- keeps a write to a name no resolver carries out of the global object *(today; see D3)*
- `[new]` a builtin the esprima list does not name: `Math`, `JSON`, `Date`, `Promise` — see D2
- `[new]` a builtin the list does name: `Object`, `Array`, `Map`, `Set`
- `[new]` `console` and `fetch`, which the rewrite treats through a second list
  (`CALLEXPRESSION__RESERVED__CALLEES`)
- `[new]` a global planted by the caller under an ordinary name · `document`
- `[new]` the containment split: the same write from inside a nested function · a compound assignment
  on an unknown name · an explicit `globalThis.x = 1`, which the coming switch has to treat
  differently from the three above

### 6. `cache` — what tuning does to it

Read against 8.4.

- keeps resolving with the cache switched off · caches again after being switched back on · serves a
  cached expression to a different context *(the three rows today)*
- `[new]` serves a cached expression to a context carrying **different names** — the deconstructor
  compiles per name set and keys its cache on it, the other three do not
- `[new]` evicts under a size limit without answering wrongly

## Decided

All three open points were settled by Frank on 2026-09-05.

- **D1 — two directories under `test/executer/`.** `capabilities/<capability>.Test.js` for the six
  above, `rules/<section>-<slug>.Test.js` for the 25 resolver rules that stay per executer. The
  directory answers what a file is; `TESTING.md` §2 stands for the rules half instead of being
  overturned, and the `DECISIONS.md` entry covers the capability half.
- **D2 — one row per builtin.** `Math`, `JSON`, `Date` and `Promise` each get their own row: the
  esprima list is exactly what makes them differ, and granularity is the point of the undertaking.
- **D3 — the containment of 6.5 is a capability, and the specification moves.** Pointing the promise
  at the default executer was rejected: a consumer who picks another one would read a guarantee that
  does not hold for them. Where the document promises something the package cannot keep, the document
  is corrected. See *What is not a capability* for what that pulls along.

Nothing is open. The plan is ready for approval as it stands.

## Stages

Each stage is green before the next one starts, and no stage changes a source file under `src/`.

0. **Mechanism, vocabulary and the split — done 2026-09-05, gate green.** `CAPABILITIES` replaced
   `MATRIX`, `casesOf` takes a capability, `DEFECT` is gone, `MatrixTest.js` became
   `CapabilityTableTest.js` with the shape checks only, and the 26 non-capability cases lost their
   rows.

   What was actually built: six files under `test/executer/capabilities/` (`syntax` 5 rows,
   `context-scope` 8, `context-shape` 11, `context-write` 1, `global-scope` 3, `cache` 3 — 31 rows),
   and `test/executer/rules/` keeps the seven section files as plain `it` plus a new
   `8.2-registration.Test.js` for the contract case that used to sit beside the assignment. Six rule
   files were deleted once their cases had moved.

   **Deviation from the intent, deliberate:** the three cases of 3.4 that carry a context name —
   the operator expression, the call on a context member, the `await` — went to `context-scope` and
   not to `syntax`, because `syntax` asks with constants only. Same cases, same expectations, a
   different capability than a straight reading of "3.4 becomes syntax" would give.

   **Measured, not asserted.** Before: 37 files, 423 passed, 14 expected fail, 437 total. After: 38
   files, 422 passed, 14 expected fail, 436 total. The one case of difference is the table's own test
   — `MatrixTest.js` had 5 cases, `CapabilityTableTest.js` has 4: the two checks that policed `defect`
   went with the state, and one check that every capability names its section came in. Everything
   else is unchanged: `test/executer/` answers 232 cases, which is 31 rows × 4 plus 26 rules × 4 plus
   the 4 of the table itself, and the 8 expected fails there are the same 8 cells as before.

   **Coverage.** No file under `src/` was touched, so the move cannot have changed what the sources
   do. What it could have changed is whether a branch lost its only reader, and it did not: the
   uncovered set is exactly the list `BACKLOG.md` names — `Utils.js` whole, the `setDebug` bodies,
   the two methods of the global cache wrapper, `get parent` and `updateData` on the handle — plus
   nine dead lines of the write-back draft committed as `30e5623`. The **percentages** cannot be
   compared against the `BACKLOG.md` baseline while that draft stands: it adds 20 statements and 18
   lines to `ContextDeconstructorExecuter.js`, half of them unreachable, which is why the report reads
   91.47 % of statements (515/563) against 92.81 % (504/543), 90.00 % of branches against 91.00 %,
   90.26 % of functions against 91.58 %, 93.90 % of lines against 95.56 %. Re-measure once the draft
   is finished or reverted — see *Precondition*.
1. **`context-write` and the containment half of `global-scope` — done 2026-09-05, gate green.**
   `context-write` went from 1 row to 11, `global-scope` from 3 to 6; 13 new rows, 52 new cases.
   Before: 436 cases, 14 expected fails. After: **488 cases, 34 expected fails** — the 20 new `no`
   cells, counted one by one against the table.

   **Every state was measured, none guessed.** The rows went in as `yes` across the board, the cases
   ran, and the failures were read off the run per executer before the table was corrected. The
   second run then had to be green in both directions, which is what a `no` cell means.

   What the split shows, and none of it was visible while each was one case:

   - **The deconstructor keeps exactly one of the ten write facets**: a *mutation* of a context
     object (`holder.name = "after"`), because the statement and the context hold the same object and
     nothing has to be carried back. Every facet that needs a value carried back — a plain write, a
     counting one, an inherited name, one made in a nested function, one made before the statement
     threw, a rebinding — is `no`.
   - **`with-scoped` is `no` for a name no resolver carries**, in *both* capabilities at once: the
     `has` trap answers false, so the assignment leaves the `with` block, and the value is neither
     contained nor readable afterwards. `context-object` is the only executer that puts such a write
     into the context.
   - **`esprima` contains a global write only at the top level, and leaks from inside a function.**
     Its rewrite makes `x = 1` an illegal assignment target, which is why it looked contained; inside
     a function body the rewrite does not go and the sloppy assignment creates a global. The single
     case that existed before could not see this. Written into `BACKLOG.md` the same turn.
   - **Nothing contains an explicit `globalThis.x = 1`** but that same accident. The negative
     guarantee of 6.5 is about an unqualified name, not about sandboxing — which the rewrite of 6.5
     in stage 5 has to say.

   Two rows are all-`yes` and worth keeping for what they fence off rather than for a difference: a
   non-writable key and a frozen context both survive a write attempt under all four. One row,
   `leaves the ancestor untouched when writing a name it carries`, is all-`yes` with two of the four
   passing trivially because they wrote nothing at all — the case says so in its comment and is only
   read together with the row above it.
2. **`context-shape` and `context-scope` — done 2026-09-05, gate green.** `context-shape` went from
   11 rows to 19, `context-scope` from 8 to 26; 26 new rows, 104 new cases. Before: 488 cases, 34
   expected fails. After: **592 cases, 51 expected fails** — the 17 new `no` cells, counted against
   the table. Same method as stage 1: all rows in as `yes`, measure, correct, green in both
   directions.

   **One row was dropped from the plan's list on purpose.** A primitive context (`"abc"`, `42`) never
   reaches an executer — `ResolverContextHandle` throws at construction — so it measures the
   resolver, not the executer, and `test/spec/6.1-the-proxy.Test.js` already pins it. A row that no
   executer can influence is not a capability. **The shorthand object literal `{value}` was dropped
   too**, for a different reason: it only exists where the dialect is a bare name, so under
   `context-object` the case would have to be a different construct — one row measuring two things.

   What the measurements say, all of it predicted from the code first and then confirmed:

   - **Thirteen of the eighteen new `context-scope` rows are `no` for `esprima`**, and they fall into
     two groups with one cause each. Five are function shapes — an arrow with either body, a function
     expression, a default parameter, an async function — because `IGNORED_TYPES` skips every function
     body. Eight are positions its traversal never walks into: an object literal, an array literal, a
     computed key, a spread, a ternary, the key of a computed member access, a tagged template, and
     `new Cls()` (that last one for a second reason — `new ctx?.Cls()` is a syntax error).
   - **What it does reach** is worth the rows it costs: both sides of `??`, a deep member access, an
     optional chain. Those are on its list, and nothing said so before.
   - **The deconstructor loses `this`** when a method of the context is called bare — the only
     `context-scope` row it misses, and the esprima executer keeps it. Its own `BACKLOG.md` entry now.
   - **A context key called `ctx` breaks the deconstructor outright**, every statement, and that is a
     **regression of `30e5623`**: the committed draft emits `let ctx = ctx.ctx;` inside an arrow whose
     parameter is `ctx`. The version before it destructured in the parameter list, where the same key
     is harmless. Own `BACKLOG.md` entry, and it hits the default executer.
   - **The getter pair** — one that throws, one that counts its reads — is `no` for the deconstructor
     twice, which is the cost of reading every name before running anything, now observable rather
     than inferred from the `arguments` shape.
3. **`global-scope` (the reachability half) and `syntax`.**
4. **`cache`**, and the contract tests of 8.1/8.2 as plain cases.
5. **The documents.** `SPECIFICATION.md` in three places: 8.3 rewritten from the finished catalogue by
   hand under a capability heading — the suite runs in a browser and cannot read a document, so both
   sides move together — the vocabulary carried through, and **6.5 rewritten** so the containment is a
   capability rather than a guarantee. `TESTING.md` §1 and §4, where "a demand on the implementations"
   becomes what it actually is; `AGENTS.md`, where the marker regains one meaning per directory; three
   `DECISIONS.md` entries, for D1, for the vocabulary and for D3. `BACKLOG.md`: the global-write entry
   stops being a defect, and the switch of 2026-08-22 gets the open question of whether it survives on
   the terms 6.5 leaves it. `CHANGELOG.md` gets two lines — the 6.5 change, which is consumer-visible,
   and the wording of its own 2026-09-01 entry, which calls section 8.3 a *capability table* where the
   document then says something else.

## Verification

`npm test` per stage. Per stage additionally: the number of rows before and after, accounted for item
by item, and the states of the new rows named as **measured** — every one of them written into the
table from a run, never from an expectation. `npm run test:coverage` at the end of a stage that moved
files.

## Risk

- **A guessed state.** The whole value of the table is that it is true; a row filled from an
  expectation and then confirmed by the test it generated is worth nothing. Mitigated by writing the
  case first, running it under all four, and reading the states off the run.
- **Losing a case in the split.** 26 cases lose their row in stage 0 and keep their assertion; the
  count before and after is the guard, and `TESTING.md` §6 asks for coverage on top of it.
- **Volume.** Roughly 110 rows against four executers is about 440 case runs where 228 run today, on
  top of the 26 rules and the rest of the suite. 36 files run in 8.3 s today, so the runtime is not
  the concern — reviewing 110 rows for whether each says something is.
- **The parked draft.** See *Precondition*. Measuring against a dirty tree records states nobody
  agreed to.
