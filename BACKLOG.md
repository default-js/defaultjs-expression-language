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
| **Kind** | `defect` · `gap` (behaviour nobody has specified) · `capability` (an executer lacks something, 9.3) · `feature` · `refactor` · `docs` · `bench` · `test` · `tooling` |
| **Blocks 3.0.0** | `yes` where the release has to wait for it |
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
| 1 | Modernize the toolchain | done 2026-08-21 — webpack 5.109, Vitest in Chromium, `npm audit` at 0 | B-28, B-29 (follow-up decisions) |
| 2 | Raise code quality | open — gated by the `Blocks 3.0.0` entries | every `defect` |
| 3 | Raise test coverage | largely done | B-30, B-38 |
| 4 | Documentation | `SPECIFICATION.md` written; readme, JSDoc and the executers open | **B-39**, B-20, B-21, B-22, B-23, B-24 |
| 5 | Do not lose performance | standing rule, see `AGENTS.md` | B-07, B-25, B-26, B-27, B-40 |

**Markers, counted 2026-09-22**, after the context filtering was taken out (`DECISIONS.md`, the two
entries of that day)
(`npm test`: 669 passed, 72 expected fail, 741 cases). One `it.fails` is left in `test/spec/`, and it
pins B-33, the only entry that still blocks. The 71 `no` cells in
`test/executer/capabilities/` say *this executer does not support this*, which is neither a defect
nor a broken rule — 11 of them are what the default executer gave up on 2026-09-22, and the table
itself is on its way out with B-39. What blocks 3.0.0 is the marker, not this count.

## Overview

| ID | Title | Status | Kind | 3.0.0 |
| --- | --- | --- | --- | --- |
| B-03 | A `parent` that is not an `ExpressionResolver` is silently dropped | decision | defect | |
| B-04 | A context that is not an object throws from inside the property cache | decision | gap | |
| B-05 | The data methods of 6.6 raise a `TypeError` over a sealed or a frozen context | decision | gap | |
| B-07 | A name found at the top of a resolver chain costs as much as one found at the bottom | investigate | defect | |
| B-08 | `EsprimaExecuter` cannot reach a context value from inside a nested function | decision | capability | |
| B-09 | `RESERVED_NAMES` in the esprima executer misspells `global` | agreed | defect | |
| B-10 | A write to an unknown name inside an expression lands on `globalThis` | decision | capability | |
| B-11 | `ContextDeconstructorExecuter` loses `this` inside a method of the context | decision | capability | |
| B-12 | `ContextDeconstructorExecuter` reads every property of a context | decision | capability | |
| B-13 | Should the `ctx` prefix of `ContextObjectExecuter` be configurable? | idea | feature | |
| B-14 | `"type": "module"` plus an `exports` field | decision | tooling | |
| B-15 | Was a `Context` export meant to exist on the public API? | decision | gap | |
| B-16 | The `module` entry produces a bundle nothing can consume | decision | defect | |
| B-17 | `src/Utils.js` is dead code, and it is published | decision | defect | |
| B-18 | Move `espree` 10 → 11? | decision | tooling | |
| B-19 | `generate-license.config.json` sets a key that does not exist | decision | defect | |
| B-20 | Every code example in `README.md` uses a default import that does not exist | agreed | docs | |
| B-21 | `SPECIFICATION.md` has not been read rule by rule since it was written | agreed | docs | |
| B-22 | The JSDoc of the whole package needs one pass | agreed | docs | |
| B-23 | Check every method name against what it does and what it answers | agreed | refactor | |
| B-24 | "Link" is out of the specification and still stands in every other file | decision | docs | |
| B-25 | The deep-chain benchmarks are bimodal by a factor of two | investigate | bench | |
| B-26 | No benchmark exercises the cache eviction | idea | bench | |
| B-27 | `WarmResolve` and `ColdResolve` can report a mean two to four times too high at depth 10 | decision | bench | |
| B-28 | What happens to Dependabot while the v3 cycle runs | decision | tooling | |
| B-29 | Move the build from webpack to Vite? | decision | tooling | |
| B-30 | Coverage, and what is still uncovered | investigate | test | |
| B-31 | `AGENTS.md` describes three benchmark files, there are four | agreed | docs | |
| B-33 | A configuration object followed by another argument is rejected instead of taken | agreed | defect | yes |
| B-35 | A name the caller passes is checked against nothing | decision | gap | |
| B-36 | The instance entry points and the data methods take input of the wrong type without a rule | decision | gap | |
| B-37 | `setupExecuter` without a size sets 1000, not the 5000 an executer starts with | decision | gap | |
| B-38 | Rules without a test that pins them | agreed | test | |
| B-39 | Take the capabilities apart — document each executer on its own | agreed, **urgent** | docs | |
| B-40 | What the name cache costs and saves when reading and writing along a chain | agreed | bench | |

---

## Release blockers

B-33 — the entry stands in its own section below.

## Resolver

### B-03 · A `parent` that is not an `ExpressionResolver` is silently dropped

- **Status:** decision
- **Kind:** defect · **Spec:** 4.2
- **Records:** `DECISIONS.md`, `CHANGELOG.md`

The constructor keeps `parent` only if it passes `instanceof ExpressionResolver` and takes `null`
otherwise, so a wrong value — a context object, a resolver from another copy of the package,
`undefined` from a missed lookup — yields a resolver without a chain, and every lookup that should
climb answers the default. An unregistered `executer` name throws instead, which is the behaviour
that makes the mistake visible. **Since the executer is inherited (2026-09-22) the dropped parent
leaves a second trace:** the executer is taken from `parent.executer` *before* the `instanceof`
check, so `new ExpressionResolver({ parent: {} })` holds `undefined` as its executer, the getter
answers `undefined` against 4.2, and a child inherits it. Resolution still works only because the
module-level `resolve` defaults `aExecuter` to `DEFAULT_EXECUTER`. Checking the normalized
`this.#parent` instead of the raw option closes that half whichever way the question is decided.

### B-04 · A context that is not an object throws from inside the property cache

- **Status:** decision
- **Kind:** gap · **Spec:** none — the specification says nothing about what a context may be
- **Pinned by:** `test/spec/6.1-what-a-context-answers.Test.js`, asserting only *that* it throws

`ResolverContextHandle` keeps whatever it is handed except a falsy value (`data || {}`), so
`context: "abc"`, `42` or `true` reaches `Reflect.ownKeys` on a primitive and throws
`TypeError: Reflect.ownKeys called on non-object` from three frames below the constructor, while `0`
and `false` silently become an empty context. To decide: reject with an error that names the
mistake, coerce (`Object(context)`), or take an empty context as the falsy half already does.

### B-05 · The data methods of 6.6 raise a `TypeError` over a sealed or a frozen context, and nothing says so

- **Status:** decision
- **Kind:** gap · **Spec:** 6.6
- **Records:** `SPECIFICATION.md`

`mergeData` writes with `Object.assign` and the handle's `set` trap assigns, both in strict-mode
module code, so a write the object refuses raises. Over a sealed context `updateData` raises for a
new key, `mergeContext` for a new key, `deleteData` even for an existing one; over a frozen context
all four raise (measured 2026-09-07, node 22). 6.5 says the equivalent for a write from an expression
("fails as it would on the object itself"), 6.6 says nothing for the supported path. The suite has no
sealed context at all — `Object.seal` and `Object.preventExtensions` appear in no test. To decide:
6.6 gains a sentence and cases follow it, or a refused change is swallowed.

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
under `context-object` and 457 000 hz under `esprima` (2026-08-30). `#getPropertyDef` does stop at
the first match; what walks the whole chain is a lookup that can never match —
`proxy[Symbol.unscopables]`, which `with` asks on every binding, walks every resolver because the
cache is keyed by string. Cheap fix if confirmed: answer non-string properties in `get`/`has`
without walking, or give the handle its own `Symbol.unscopables`. Costs every consumer who keeps
the `with`-based executer; the default moved away from it on 2026-09-01.

## Executers

### B-08 · `EsprimaExecuter` cannot reach a context value from inside a nested function

- **Status:** decision — close the gaps or accept them as the executer's limits
- **Kind:** capability · **Spec:** 9.5
- **Pinned by:** `test/executer/capabilities/context-scope.Test.js`, `syntax.Test.js`
- **Records:** `CHANGELOG.md`

The rewrite turns an identifier into `ctx?.name` only where the traversal reaches it.
`TRAVERSABLE_PROPERTIES` (`src/executer/EsprimaExecuter.js`) does not cover `properties`,
`elements`, `test`/`consequent`/`alternate`, `tag`/`quasi`, the `property` of a computed member
access, or function bodies (`IGNORED_TYPES`). So `${ {a: value}.a }`, `${ [value][0] }`,
`${ flag ? a : b }`, `${ obj[key] }`, and every arrow, function expression, default parameter and
async function that reads the context raise where the other three executers answer — measured and
pinned. Two further causes: `ctx?.name` cannot be an assignment target or a `new` callee
(`new ctx?.Cls()` is a syntax error), and `escodegen` 2.1.0 cannot generate a class field. One pass
over the rewrite closes the first two causes, not the third. Decide together with B-09.

### B-09 · `RESERVED_NAMES` in the esprima executer misspells `global`

- **Status:** agreed 2026-08-24 — rework the list as a whole, not the typo alone
- **Kind:** defect · **Spec:** 6.4, 9.8
- **Pinned by:** `test/executer/capabilities/global-scope.Test.js`, one row per global
- **Records:** `DECISIONS.md`, `CHANGELOG.md`

`src/executer/EsprimaExecuter.js` lists `"gobal"`; everything not on the list is rewritten to
`ctx?.name`. The list is therefore the whole global surface of this executer: `Object`, `Array`,
`Map`, `Set`, `console`, `fetch`, `window` are reachable; `Math`, `JSON`, `Date`, `Promise`,
`document` and any global the application planted are not (`${ Math.round(1.5) }` raises a
`TypeError`: `ctx?.Math` is `undefined`, and reading `round` off it throws). Direction, Frank's: derive the list from the names of `GLOBAL` instead of maintaining
it by hand. Settle when writing it: the derived list is a snapshot taken at module load; it makes
every global reachable, which removes the property 6.4 leans on (a typo and an empty value are
indistinguishable); a context property must keep winning over a global of the same name; and the
syntax entries — `await`, `async`, `this`, `typeof`, `instanceof`, `undefined` — are not globals and
have to survive.

### B-10 · A write to an unknown name inside an expression lands on `globalThis`

- **Status:** decision
- **Kind:** capability · **Spec:** 6.5, 9.8
- **Pinned by:** `test/executer/capabilities/global-scope.Test.js`, `syntax.Test.js`
- **Records:** `SPECIFICATION.md`, `CHANGELOG.md`

Since 2026-09-05 this is not a broken rule: 6.5 no longer promises containment, because only an
executer can keep it (`DECISIONS.md`). Two questions are open: **should the executers that leak gain
the containment**, and **is an `allowGlobalWrite` switch worth having** — its *off* state could only
mean something under an executer able to intercept the assignment. If the switch comes, 6.5 gets it
back, the configuration form of 4.1 and `buildSecure` (6.7) take it as an option, and this entry gets the release marker.
What is measured: an unqualified `x = 1` on a name no resolver carries creates a global under
`with-scoped`, `context-deconstructor` and `esprima` — the last one only inside a function body or
an array pattern (`${ [name] = ["hit"] }`), which its rewrite does not reach; `context-object`
contains it, because its dialect writes through the proxy. A compound assignment (`x += 1`) cannot
leak, it raises on the read. Nothing contains an explicit `globalThis.x = 1`. No executer runs its
statement in strict mode, which the agreed fix of 2026-08-22 leaned on. A resolver whose context
*is* the global object is not proxied, so there is no interception point at all.

### B-11 · `ContextDeconstructorExecuter` loses `this` inside a method of the context

- **Status:** decision — stays a capability the default lacks, or the generated code binds the receiver
- **Kind:** capability · **Spec:** 9.5
- **Pinned by:** `keeps this bound to the context when a method is called bare`,
  `test/executer/capabilities/context-scope.Test.js`
- **Records:** `CHANGELOG.md`

A context that is a class instance — the shape a template engine hands in most often — answers
`${ greet() }` under the other three executers, which keep the context as the receiver. The
deconstructor binds the method to a local and calls it bare, so `this` is `undefined` and a method
reading its own state raises. It is the **default** executer, and the loss is silent.

### B-12 · `ContextDeconstructorExecuter` reads every property of a context, including one that throws on access

- **Status:** decision — defect of the executer, or the price of its strategy (9.6)
- **Kind:** capability · **Spec:** 9.6
- **Pinned by:** `reads a context value beside a getter that throws`,
  `leaves a getter of the context unread when the statement does not touch it`,
  `runs a statement over an arguments object as context` —
  `test/executer/capabilities/context-shape.Test.js`

It destructures every name of the context, which calls every accessor on every execution. A context
whose getter throws breaks every expression, including `${ 1 + 1 }`; an `arguments` object in strict
mode does the same through `callee`. The other three executers answer, and the proxy itself reads no
getter (6.2), so this is the executer's doing alone. The cost half: every getter runs on every
execution even when the statement touches no name.

### B-13 · Should the `ctx` prefix of `ContextObjectExecuter` be configurable?

- **Status:** idea — raised by Frank 2026-08-24
- **Kind:** feature · **Spec:** 9.10
- **Records:** `DECISIONS.md`, `CHANGELOG.md`

The executer hands the context over as `ctx`, so a value is addressed as `${ctx.value}` — settled
and intended (`DECISIONS.md`, 2026-08-24). But the identifier is hard-coded, and a context carrying
a property named `ctx` has no way out. Open with it: whether the option belongs on
`setupExecuter(options)` next to `size`, and what happens to the code cache, which is keyed by the
statement text alone — entries compiled under the old identifier would answer for the new one.

## Public surface and packaging

### B-14 · Decide on `"type": "module"` plus an `exports` field — and what it does to the executer import path

- **Status:** decision
- **Kind:** tooling · **Spec:** 8
- **Pinned by:** `test/spec/8-the-public-surface.Test.js` (the deep import of `Executer`)
- **Records:** `DECISIONS.md`, `CHANGELOG.md`

`defaultjs-common-utils` already went this way, so the two packages diverge. Reaching a non-default
executer — and with it `setupExecuter(options)` — is done by importing its module directly
(`…/src/executer/EsprimaExecuter.js`); that is intended (`DECISIONS.md`, 2026-08-20) and works only
because there is no `exports` field. So an `exports` field must whitelist `./src/executer/*`.
`./src/Executer.js` needs the same treatment: section 8 lists `Executer` as public, but `index.js`
exports only `ExpressionResolver` and `ExecuterRegistry` — whitelist it, or export it from
`index.js`. Also open: tuning the *default* executer needs the same deep import although the
consumer never imported that module — keep, or give it a documented entry point.

### B-15 · Was a `Context` export meant to exist on the public API?

- **Status:** decision — the name dies unless a reason turns up
- **Kind:** gap · **Spec:** 8
- **Records:** `DECISIONS.md` if it becomes public

`browser.js`, `browser-all-executers.js` and `test/setup.js` all imported a `Context` from
`index.js` that was never exported; the unused imports were removed on 2026-08-21. Section 8 does
not list `ResolverContextHandle`, the class the name probably meant. Decide together: the handle's
own public members `get parent` and `updateData` are uncovered (B-30) and only worth covering if
they are surface. `updateData(data)` replaces the data, but the proxy shape is fixed in the
constructor, so it cannot move a handle between the global shape and the ordinary one. The handle is
already surface in one place: 6.2 tells a consumer to call `contextHandle.resetCache()`, while
section 8 lists the getter `contextHandle` and none of the handle's members.

### B-16 · The `module` entry produces a bundle nothing can consume

- **Status:** decision — give it a library configuration, or drop the entry
- **Kind:** defect · **Spec:** none
- **Records:** `DECISIONS.md`, `CHANGELOG.md`

`entries.config.json` builds `index.js` into `dist/module-…[.min].js`, but `webpack.config.mjs`
sets no `output.library`, so the bundle exposes nothing. Bundlers do not use it either — `main`
points at the raw `./index.js`. It is also what forces `optimization.usedExports: false`
(`DECISIONS.md`, 2026-08-21). With a library configuration, tree shaking can come back; without the
entry, two bundles are published instead of three.

### B-17 · `src/Utils.js` is dead code, and it is published

- **Status:** decision — delete, or make it an intended helper with a test and a readme mention
- **Kind:** defect · **Spec:** 8 (not listed)
- **Records:** `CHANGELOG.md`

It exports `stringToHashcode`, which nothing imports — not `src/`, the entries, the tests, nor any
bundle. It ships because `files` publishes `src/**` raw, and it is the largest uncovered file.

### B-18 · Decide whether to move `espree` 10 → 11

- **Status:** decision
- **Kind:** tooling · **Spec:** none
- **Records:** `DECISIONS.md`

`package.json` pins `espree` `^10.4.0`. Version 11 raises the **runtime** Node floor for consumers
to `^20.19 || ^22.13 || >=24` — a compatibility decision about the published package, not a
toolchain bump. `espree` is only pulled in by `EsprimaExecuter`, which is not registered by default.

### B-19 · `generate-license.config.json` sets a key that does not exist

- **Status:** decision — should the versions really be dropped?
- **Kind:** defect · **Spec:** none

The file sets `"omitVersion": true`; `generate-license-file` 4.2.1 knows `omitVersions`, plural
(its `README.md` and `src/lib/cli/commands/main.d.ts`). The key is silently ignored, so
`LICENSE-OF-THIRD-PARTY` carries versions and churns on every dependency bump. Fixing it changes a
published file.

### B-33 · A configuration object followed by another argument is rejected instead of taken

- **Status:** agreed — the rule of 4.1 decides it
- **Kind:** defect · **Spec:** 4.1 · **Blocks 3.0.0:** yes
- **Pinned by:** `decides the call form by the first argument alone, even where another argument
  follows` (`test/spec/4.1-…`)
- **Records:** `CHANGELOG.md`

4.1 decides the call form *by the first argument alone*. Both static entry points take the
configuration form only when `arguments.length === 1`, so `resolve({ expression, context }, x)` falls
through to the string check and rejects with a `TypeError` claiming the object is not a
configuration. Settle while fixing: what extra arguments mean in the configuration form — the rule
says only that they do not decide it.

### B-35 · A name the caller passes is checked against nothing

- **Status:** decision
- **Kind:** gap · **Spec:** 3.3, 5.1, 5.5

5.1 holds a *generated* name to the character rule of 3.3 and says nothing about a passed one. The
constructor takes any truthy value: a name carrying `.` or `:` can never be addressed by a scope
prefix while a filter (6.6) still finds it, a `/` breaks the path `chain` answers (5.5), and `""` or
`0` get a generated name instead. To decide: reject such a name, or state that only a name obeying
3.3 is addressable by a prefix.

### B-36 · The instance entry points and the data methods take input of the wrong type without a rule

- **Status:** decision
- **Kind:** gap · **Spec:** 4.2, 4.3, 6.6

4.1 rejects a first argument of the wrong type with a `TypeError`; nothing is said for the instance.
Measured 2026-09-22: `resolver.resolveText(42)` answers `42`, `resolver.resolve(42)` raises a
`TypeError` out of `trim` and logs it as a failed statement, `mergeContext` ignores anything that is
not an object, and `updateData` and `deleteData` ignore an empty key. To decide: one rule for all of
them, most likely the one 4.1 already has.

### B-37 · `setupExecuter` without a size sets 1000, not the 5000 an executer starts with

- **Status:** decision
- **Kind:** gap · **Spec:** 9.10

Every executer builds its cache with `{ size: 5000 }`; `CodeCache.setup` defaults a missing `size` to
1000, so `setupExecuter({})` or `setupExecuter()` shrinks the cache instead of leaving it alone. 9.10
names neither number. To decide: which default is meant, and whether 9.10 states it.

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
the gaps B-35 to B-37, and the missing pins in B-38. The capability counts of 9.2 to 9.9 were recounted from `CAPABILITIES` and hold. Fixed in the
text: *the stacking context* in section 2, *the global-write switch* in 4.2, four references to a
section 1.3 that does not exist, one broken sentence in 9.7, `self` missing from the esprima list in
9.8, and 3.3 now says **ASCII** letters, which is what `EXPRESSION_SCOPE` accepts — a prefix
`Äpfel::` is not recognized, and whether it should be is Frank's to say.

Still open here: the bundle sizes in 9.2 (11.5 KB and 355.6 KB, also in `AGENTS.md` and
`DECISIONS.md`) do not match `dist/` as committed on 2026-09-07 — 16.1 KiB and 365.5 KiB minified.
Take the figures from the next `npm run build` rather than from this note. Frank has further points
from reviewing the restructure; they are added here when they come.

### B-22 · The JSDoc of the whole package needs one pass

- **Status:** agreed 2026-08-30
- **Kind:** docs

Known without having looked at every file: the constructor of `ResolverContextHandle` is documented
as "Creates an instance of Context"; `#initPropertyCache` promises
`@returns {Map<string,PropertyDefinition>}`, a type that exists nowhere, and over a global context
answers the cache wrapper instead; the doc block of the instance `resolveText` runs its description
and the next line together ("replace all expressions at a string *"); `CodeCache.has`, `get`, `set`
and `clear` carry no JSDoc although `AGENTS.md` asks for it on everything public. Go file by file,
not through this list, and together with B-23.

### B-23 · Check every method name against what it does and what it answers

- **Status:** agreed 2026-08-30
- **Kind:** refactor
- **Records:** `DECISIONS.md` and `CHANGELOG.md` for the public names

Known so far: `#getPropertyDef` answers the handle carrying a name, and the variable it lands in is
called `proxy`; `chain` and `effectiveChain` answer a string path, `contextChain` an array, and none
of them a chain in the sense of section 2; `getData` without a key answers the whole context;
`toText` replaces `undefined` and `null` by their word and converts nothing; `traverse` rewrites the
AST it walks; `buildSecure` promises a security its own JSDoc denies; `setupExecuter` sets the cache
size and nothing else; `normalize`, `startsRegex`, `parseScope` and `scanExpression` say less than
they do; `registrate` is not an English word and is public; `getExecuterType` is the import alias of
`getExecuter` and answers an instance; `EsprimaExecuter` parses with `espree`. Public ones —
`registrate`, the three chain getters, `buildSecure` — need a decision; private ones are a rename.

### B-24 · "Link" is out of the specification and still stands in every other file

- **Status:** decision — whether the test names are renamed, which changes what the gate prints
- **Kind:** docs

Decided 2026-08-30: one member of a chain is a **resolver**, and `SPECIFICATION.md` no longer uses
*link*. Counted 2026-09-22 (`\blinks?\b`, case-insensitive): `test/` 70, most of them test names;
`DECISIONS.md` 41; `CHANGELOG.md` 13, entries under `[Unreleased]` among them, which a reader meets
without a definition; `src/` 3 comments; `AGENTS.md` 2.

### B-39 · Take the capabilities apart — document each executer on its own

- **Status:** agreed 2026-09-22 — **urgent**, Frank's call; needs its own plan under `plans/`
- **Kind:** docs · **Spec:** 9.3 to 9.9
- **Records:** `SPECIFICATION.md`, `TESTING.md`, `AGENTS.md`, `DECISIONS.md`

The capability catalogue compares four implementations cell by cell, which is the wrong question:
**each executer is to be looked at on its own, closed in itself.** What is owed instead is clean
documentation per executer — how it works, and what follows from that for the expressions a consumer
writes: which dialect, which names have to be variables, which shapes of context it runs over, what
a write does, which globals it reaches, what it does when it cannot run. The comparison across four
columns, the counts (`79 of 106`), and `no` as a state disappear with it.

Touches everything the catalogue holds up: `test/ExecuterCapabilities.js` and the six files under
`test/executer/capabilities/`, part B of `SPECIFICATION.md` (9.3 to 9.9), the sections *Tests* of
`AGENTS.md` and 4 of `TESTING.md`, and the entries of 2026-08-30 and 2026-09-05 in `DECISIONS.md`
that set up the two-state table. Open with it: what carries the guard a `no` cell gives today — an
executer that starts or stops doing something turns the gate red — once the table is gone.

## Benchmarks

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
Note the benchmark caveats of B-25 and B-27, and compare alternating runs rather than single ones.

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
a regression guard beyond `test/general/CodeCacheTest.js`.

### B-27 · `WarmResolve` and `ColdResolve` can report a mean two to four times too high at depth 10, and the cause is the chain they hold live

- **Status:** decision — accept and discard such runs, or build one chain per depth
- **Kind:** bench

Signature: `rme` past 100 %, `max` at 340–430 ms, `p75` and `p99` unchanged — one long pause, never
a slower operation. Cause, verified 2026-08-29: `ChainBuilder.js` keeps a chain of 1 000 000
resolvers live for the whole file, and a collection that walks that set costs hundreds of
milliseconds; with `DEPTHS` cut to `[10, 1000]` it disappears. A property of the benchmark, not of
the library. Reusing the tail of the deepest chain is deliberate — a bench file has nowhere to put
setup (`AGENTS.md`, Benchmarks).

### B-31 · `AGENTS.md` describes three benchmark files, there are four

- **Status:** agreed — found 2026-09-22
- **Kind:** docs

The section *Benchmarks* of `AGENTS.md` names three files: `ColdResolve`, `WarmResolve` and
`RandomScope`. `test/PerformanceTests/ResolveText.bench.js` (since `0ea787f`)
is missing there. It measures the instance `resolveText` over four texts. No benchmark calls a
static entry point, so a change confined to those two is not visible in `npm run bench`.

### B-38 · Rules without a test that pins them

- **Status:** agreed — goal 3
- **Kind:** test

Found by the read-through of B-21. The code keeps each of them as far as it was checked, but nothing
turns the gate red if that changes:

1. 6.7 — the `deep` option of `buildSecure`; the four cases never pass it.
2. 9.2 — `with-scoped-executer` announcing its deprecation on the first expression it resolves.
3. 6.1, 6.5 — a write over a frozen context fails. The capability row `leaves a key of a frozen
   context unchanged` asks it of an assignment in an expression; `updateData` over a frozen context is
   not asked at all, and a sealed context is not in the suite (B-05).
4. 6.4 — `getData()` on a resolver over the global object answers the global object itself, and a
   write through it is an ordinary global write.
5. 3.1 — the two limits: a brace inside a comment counts, a regular expression literal after `)` is
   read as division.

Also stale: the header of `test/spec/6.1-what-a-context-answers.Test.js` points at
`test/executer/rules/6.1-the-proxy.Test.js`, which does not exist.

## Tooling

### B-28 · Decide what happens to Dependabot while the v3 cycle runs

- **Status:** decision — close them and pause Dependabot until after 3.0.0, or leave them
- **Kind:** tooling

18 `dependabot/*` branches sit on origin (as of the local view, 2026-09-22), all against `master`,
all for devDependencies of the toolchain the modernization replaced (`karma`, `webpack` 5.76,
`engine.io`, `ua-parser-js`, …). They no longer reach the documentation app, whose version selector
runs off tags, so this is only noise.

### B-29 · Decide whether the build moves from webpack to Vite

- **Status:** decision — needs its own plan under `plans/` if taken up
- **Kind:** tooling
- **Records:** `DECISIONS.md`

Vitest puts `vite` in the tree as a direct dependency, so the repository carries two bundlers.
Vite's library mode covers what is needed in principle. Against it: nothing about webpack is broken,
`dist/` is published *and* committed, so a switch changes every published artifact and needs its own
verification, and Vite 8's bundler is `rolldown` 1.x. The toolchain modernization this was waiting
for is done.

## Tests

### B-30 · Coverage, and what is still uncovered

- **Status:** investigate — none of it is a missing test for a rule
- **Kind:** test

Measured 2026-09-22 with `npm run test:coverage`, 743 cases: statements **93.17 %** (519/557),
branches **91.72 %** (255/278), functions **91.81 %** (101/110), lines **95.85 %** (463/483). Update
these numbers when the picture changes rather than adding another baseline. Uncovered lines:

1. `src/Utils.js`, all of it — B-17.
2. The `setDebug` bodies of `ContextDeconstructorExecuter.js` and `EsprimaExecuter.js`. The surface
   test asserts they exist and deliberately never flips them: a debug switch has nothing observable.
3. `set` and `delete` of `createGlobalCacheWrapper` in `ResolverContextHandle.js`. A global context
   is not proxied since 2026-08-30, so nothing routes a write through the wrapper — check whether
   the two methods still have a caller before covering them.
4. `get parent` and `updateData` of `ResolverContextHandle` — B-15.
5. **New on 2026-09-22:** the `return null` of `findPropertyDescriptor`, and the `get` of the
   descriptor the `getOwnPropertyDescriptor` trap hands out, which no case ever calls. Look at both
   before deciding whether they are reachable.

`src/version.js` is generated; its 0 % is noise. The 23 open branches sit in the scanner's state
machine and in `EsprimaExecuter` — combinations of literal states, not rules without a test.
