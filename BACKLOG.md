# Backlog

Every open task of `@default-js/defaultjs-expression-language`: defects, open decisions, agreed
work, ideas, and the status of the v3 goals. If it is to be done, it is here and nowhere else.
Settled questions and their reasoning are in `DECISIONS.md`, what the resolver is meant to do is in
`SPECIFICATION.md`.

## How this file works

- **One entry per item**, independent of the others. An undertaking whose steps depend on each
  other gets a plan under `plans/` instead, and its entry here points at it.
- **Written the moment an item comes up**, not at handover — a session can end at any point.
- **Only the current state.** An entry says what is wrong or undecided, what is known, and what
  happens next. How it got there is in git history; why a decision fell is in `DECISIONS.md`.
- **Deleted once done**, together with its row in the overview. IDs are never reused.
- **Titles are addresses.** Test comments point at entries by title, so a title is not reworded
  without updating them — `grep` for it first.
- Anything that affects consumers additionally belongs in the
  [issue tracker](https://github.com/default-js/defaultjs-expression-language/issues); that call is
  Frank's.

Each entry carries these fields; the ones that do not apply are left out.

| Field | Meaning |
| --- | --- |
| **Status** | `decision` — needs a decision, which is Frank's · `agreed` — decided, ready to implement · `investigate` — the facts are not complete yet · `idea` — raised, not agreed |
| **Kind** | `defect` · `gap` (behaviour nobody has specified) · `executer` (something one executer does not do, and might) · `feature` · `refactor` · `docs` · `bench` · `test` · `tooling` |
| **Blocks 3.0.0** | `yes` where the release has to wait for it |
| **Priority** | `low` — taken up after everything without it, with the reason; left out means normal |
| **Spec** | the section of `SPECIFICATION.md` that is the target |
| **Pinned by** | the test that marks the item, if any |
| **Records** | what else moves when it is closed: `CHANGELOG.md`, `DECISIONS.md`, `SPECIFICATION.md` |

**`Blocks 3.0.0` is the release gate.** `SPECIFICATION.md` is written as though every rule in it
holds and carries no index of what is missing, so this marker is the only place that says a rule is
not kept yet. Adding a rule to the specification without either implementing it or opening an entry
with the marker here is how the gate gets lost.

## v3 goals

The intent of each goal is in `AGENTS.md`; this is where they stand.

| # | Goal | Status | Open entries |
| --- | --- | --- | --- |
| 1 | Modernize the toolchain | done 2026-08-21 — webpack 5.109, Vitest in Chromium, `npm audit` at 0 (again on 2026-09-30) | — |
| 2 | Raise code quality | open — gated by the `Blocks 3.0.0` entries | every `defect` |
| 3 | Raise test coverage | largely done | B-30 |
| 4 | Documentation | `SPECIFICATION.md` and the executers written; readme and JSDoc open | B-20, B-21, B-22, B-23 |
| 5 | Do not lose performance | standing rule, see `AGENTS.md` | B-47, B-07, B-25, B-26, B-40 |

**Markers, counted 2026-10-01** (`npm test`: 326 passed, 326 cases). No `it.fails` is left and no
entry blocks 3.0.0. **No release carries an `it.fails`** (`DECISIONS.md`, 2026-09-27). Nothing in
the suite is marked: an executer's suite tests what that executer guarantees, and what it does not do
is documented in `README.md` rather than pinned (`DECISIONS.md`, 2026-09-26).

## Overview

| ID | Title | Status | Kind | 3.0.0 | Prio |
| --- | --- | --- | --- | --- | --- |
| B-07 | A name found at the top of a resolver chain costs as much as one found at the bottom | investigate | defect | | |
| B-13 | Should the `ctx` prefix of `ContextObjectExecuter` be configurable? | idea | feature | | |
| B-20 | Every code example in `README.md` uses a default import that does not exist | agreed | docs | | |
| B-21 | `SPECIFICATION.md` has not been read rule by rule since it was written | agreed | docs | | |
| B-22 | The JSDoc of the whole package needs one pass | agreed | docs | | |
| B-23 | Check every method name against what it does and what it answers | agreed | refactor | | |
| B-25 | The deep-chain benchmarks are bimodal by a factor of two | investigate | bench | | |
| B-26 | No benchmark exercises the cache eviction | idea | bench | | |
| B-30 | Coverage, and what is still uncovered | investigate | test | | |
| B-40 | What the name cache costs and saves when reading and writing along a chain | agreed | bench | | |
| B-47 | `readExpression` allocates a stack array for every expression | idea | refactor | | |

---

## Release blockers

None open.

## Resolver

### B-07 · A name found at the top of a resolver chain costs as much as one found at the bottom

- **Status:** investigate — confirm with a counter in the trap, then fix
- **Kind:** defect (performance) · **Spec:** none
- **Records:** `DECISIONS.md`

**A second case since 2026-09-22**, and it is the same rule from the other side: a name that only
the **root** carries costs the whole chain. `ContextDeconstructorExecuter` reads every name of the
context on every execution, the seven of `Object.prototype` among them, and since a resolver without
a context holds no object those seven are carried by the root alone. Over a chain of 100 000
resolvers without contexts one `resolve` takes 40 ms against 10 ms before (chromium, 2026-09-22),
while `ownKeys` of the same proxy got faster, 3.1 ms against 9.4. Before, each empty resolver held
`{}` and answered such a name itself, which hid the walk. A negative result cached per handle, or the
`Symbol.unscopables` fix above, would answer both halves.

Under `WithScopedExecuter` a lookup scales with the full chain depth even when the name sits a few
resolvers up: `RandomScope` at depth 100 000 answers 138 hz under `with-scoped` against 662 000 hz
under `context-object` (2026-08-30). `#getPropertyDef` does stop at
the first match; what walks the whole chain is a lookup that can never match —
`proxy[Symbol.unscopables]`, which `with` asks on every binding, walks every resolver because the
cache is keyed by string. Cheap fix if confirmed: answer non-string properties in `get`/`has`
without walking, or give the handle its own `Symbol.unscopables`. Costs every consumer who keeps
the `with`-based executer; the default moved away from it on 2026-09-01.

## Executers

### B-13 · Should the `ctx` prefix of `ContextObjectExecuter` be configurable?

- **Status:** idea — raised by Frank 2026-08-24
- **Kind:** feature · **Spec:** 9.3
- **Records:** `DECISIONS.md`, `CHANGELOG.md`

The executer hands the context over as `ctx`, so a value is addressed as `${ctx.value}` — settled
and intended (`DECISIONS.md`, 2026-08-24). But the identifier is hard-coded, and a context carrying
a property named `ctx` has no way out. Open with it: whether the option belongs on
`setupExecuter(options)` next to `size`, and what happens to the code cache, which is keyed by the
statement text alone — entries compiled under the old identifier would answer for the new one.

## Documentation and naming

### B-20 · Every code example in `README.md` uses a default import that does not exist

- **Status:** agreed — goal 4
- **Kind:** docs · **Spec:** all of it — the readme carries its consumer-facing subset

All examples read `import ExpressionResolver from "@default-js/defaultjs-expression-language"`,
but `index.js` exports only named bindings, so every example fails at the first call (since 1.0.0).
Two examples are also unbalanced — an object literal and an argument list never closed. And the
readme documents none of v3: `ExecuterRegistry`, the executers, `setupExecuter`, chains, scopes.
It is what an AI system reads to learn the package.

### B-21 · `SPECIFICATION.md` has not been read rule by rule since it was written

- **Status:** agreed — the read-through is done, Frank's review points are open
- **Kind:** docs · **Spec:** all of it
- **Records:** `SPECIFICATION.md`

Read rule by rule against the code, the suite and a node probe on 2026-09-22. What it produced: the
two release blockers - B-33, and the shadowing of `Object.prototype` names, closed the same day -
the gaps B-35 to B-37, and six rules without a pin, pinned on 2026-09-27. Fixed in the
text: *the stacking context* in section 2, *the global-write switch* in 4.2, four references to a
section 1.3 that does not exist, and 3.3 now says **ASCII** letters, which is what `EXPRESSION_SCOPE` accepts — a prefix
`Äpfel::` is not recognized, and whether it should be is Frank's to say.

Still open here: Frank has further points from reviewing the restructure; they are added here when
they come.

### B-22 · The JSDoc of the whole package needs one pass

- **Status:** agreed 2026-08-30
- **Kind:** docs

Known without having looked at every file: the constructor of `ResolverContextHandle` is documented
as "Creates an instance of Context"; `#initPropertyCache` promises
`@returns {Map<string,PropertyDefinition>}`, a type that exists nowhere, and over a global context
answers the cache wrapper instead; the doc block of the instance `resolveText` runs its description
and the next line together ("replace all expressions at a string *"); `CodeCache.has`, `get`, `set`
and `clear` carry no JSDoc although `AGENTS.md` asks for it on everything public. Two comments cite
sections of `SPECIFICATION.md` that no longer exist since 2026-09-26 (part B is 9.1 to 9.3 now):
`ContextDeconstructorExecuter.js` ("`context-write`, SPECIFICATION.md 9.7") and the global cache
wrapper in `ResolverContextHandle.js` ("6.4, 9.8"). Go file by file, not through this list, and
together with B-23.

### B-23 · Check every method name against what it does and what it answers

- **Status:** agreed 2026-08-30
- **Kind:** refactor
- **Records:** `DECISIONS.md` and `CHANGELOG.md` for the public names

Known so far: `#getPropertyDef` answers the handle carrying a name, and the variable it lands in is
called `proxy`; `chain` and `effectiveChain` answer a string path, `contextChain` an array, and none
of them a chain in the sense of section 2; `getData` without a key answers the whole context;
`toText` replaces `undefined` and `null` by their word and converts nothing; `buildSecure` promises a security its own JSDoc denies; `setupExecuter` sets the cache
size and nothing else; `normalize`, `startsRegex`, `parseScope` and `scanExpression` say less than
they do; `registrate` is not an English word and is public; `getExecuterType` is the import alias of
`getExecuter` and answers an instance. Public ones —
`registrate`, the three chain getters, `buildSecure` — need a decision; private ones are a rename.

## Benchmarks

### B-47 · `readExpression` allocates a stack array for every expression

- **Status:** idea — left over from B-45, unmeasured
- **Kind:** refactor · **Spec:** 3.1

`readExpression` in `src/ExpressionScanner.js` starts every expression with `const stack = [CODE]`
and pushes for every `{`, although most expressions never nest. Candidates: a depth counter for
code and a stack only once a literal opens, or one array reused across the expressions of a text.
To be measured with `ResolveTextShare`, old and new alternating (`DECISIONS.md`, 2026-09-27, "Does
`resolveText` scan and replace in one pass?"): scanning is a small share of the resolver's work,
so the gain is bounded by it.

### B-40 · What the name cache costs and saves when reading and writing along a chain

- **Status:** agreed 2026-09-22 — Frank's order, measure before anything is changed
- **Kind:** bench · **Spec:** 6.2
- **Records:** `DECISIONS.md`, and `SPECIFICATION.md` 6.2 if the cache goes

Every handle keeps `#cache`, a `Map` from every name its context carries to the handle carrying it
(`src/ResolverContextHandle.js`: built in `#initPropertyCache`, read by `#getPropertyDef`, the
`ownKeys` trap and `hasData`, kept in step by the `set` and `deleteProperty` traps, `updateData`,
`mergeData` and `resetCache`). **Since 2026-09-22 it filters nothing**, so it holds exactly what
`key in object` would answer, one `Map` per resolver, built on construction.

**Measure what it costs and what it saves**, over a chain, for both directions:

- **Reading** — a name the resolver carries itself, one only an ancestor carries, one nobody
  carries, and one the root alone carries (the case B-07 got on 2026-09-22). Against the cache and
  against a live `in` walking `#data` of each handle.
- **Writing** — `updateData`, `mergeContext`, `deleteData` and an assignment from inside an
  expression. Each of those rebuilds or amends the cache today, which is work a live lookup would
  not do at all.
- **Building** — one `#initPropertyCache` per resolver, which a chain pays once per resolver and a
  template engine pays on every nesting level it enters.

What hangs on the answer: **6.2 itself.** Without the cache, names are as live as values, the
snapshot rule of 6.2 falls away and `resetCache` loses its purpose — a rule and a public method
would go, so the measurement decides a specification question and not only an implementation.
Note the benchmark caveats of B-25 and of `AGENTS.md` (Benchmarks), and compare alternating runs
rather than single ones.

### B-25 · The deep-chain benchmarks are bimodal by a factor of two across runs

- **Status:** investigate — cause unknown
- **Kind:** bench

At depths 100 000 and 1 000 000 a bench **file** settles into one of two modes and stays there:
about 6.4 ms / 64 ms, or 12.9 ms / 130 ms, each with an rme under 3 %. Depths 10 and 1 000 are stable.
The mode is decided per file, not per run, so two files of the same run cannot be compared either —
a recorded number has to name its mode, and a single run is never compared against a single earlier
one. Looks like a JIT or GC state decided early. Check whether it also happens outside the browser
runner.

### B-26 · No benchmark exercises the cache eviction, the one thing `CodeCache` now does differently

- **Status:** idea
- **Kind:** bench

All bench files stay far below the 5000 entries of the cache, so `#trim()` never runs and the switch
from write-time to use-time eviction (2026-08-21) is invisible to `npm run bench`. A bench that fills
past `size` and then measures the hit rate on a hot subset would show it and give the eviction order
a regression guard beyond `test/codecache/caching.Test.js`.

## Tests

### B-30 · Coverage, and what is still uncovered

- **Status:** investigate — none of it is a missing test for a rule
- **Kind:** test

Measured 2026-09-28 with `npm run test:coverage`, 320 cases: statements **95.31 %** (590/619),
branches **95.46 %** (316/331), functions **93.20 %** (96/103), lines **96.60 %** (512/530), after
`EsprimaExecuter` was removed. Update these
numbers when the picture changes rather than adding another baseline. Uncovered lines:

1. `stringToHashcode` in `src/Utils.js`. Nothing imports it; it stays, deliberately without a test
   (Frank, 2026-09-27).
2. The `setDebug` body of `ContextDeconstructorExecuter.js`. The surface
   test asserts it exists and deliberately never flips them: a debug switch has nothing observable.
3. `set` and `delete` of `createGlobalCacheWrapper` in `ResolverContextHandle.js`. A global context
   is not proxied since 2026-08-30, so nothing routes a write through the wrapper — check whether
   the two methods still have a caller before covering them.
4. `get parent` and `updateData` of `ResolverContextHandle`. The handle is internal (`DECISIONS.md`,
   2026-09-30), so check whether anything reaches them before covering them.
5. **New on 2026-09-22:** the `return null` of `findPropertyDescriptor`, and the `get` of the
   descriptor the `getOwnPropertyDescriptor` trap hands out, which no case ever calls. Look at both
   before deciding whether they are reachable.
6. **New on 2026-09-27:** `if (typeof aStatement !== "string") return aStatement;` in `execute` of
   `ExpressionResolver.js`. Since the instance `resolve` rejects a non-string (4.2), every statement
   reaching it is a string or null from the scanner, so the branch looks unreachable — check, then
   delete it rather than cover it.

`src/version.js` is generated; its 0 % is noise. The 15 open branches sit in the scanner's state
machine — combinations of literal states — and in the lines listed above; none is a rule without a
test.
