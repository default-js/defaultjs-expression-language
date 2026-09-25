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
| 3 | Raise test coverage | largely done | **B-43**, B-30, B-38 |
| 4 | Documentation | `SPECIFICATION.md` and the executers written; readme and JSDoc open | B-20, B-21, B-22, B-23, B-24 |
| 5 | Do not lose performance | standing rule, see `AGENTS.md` | B-07, B-25, B-26, B-27, B-40 |

**Markers, counted 2026-09-26** (`npm test`: 314 passed, 1 expected fail, 315 cases). One `it.fails`
is left, in `test/spec/`, and it pins B-33, the only entry that still blocks. Nothing else in the
suite is marked: an executer's suite tests what that executer guarantees, and what it does not do is
documented in `README.md` rather than pinned (`DECISIONS.md`, 2026-09-26).

## Overview

| ID | Title | Status | Kind | 3.0.0 |
| --- | --- | --- | --- | --- |
| B-03 | A `parent` that is not an `ExpressionResolver` is silently dropped | decision | defect | |
| B-04 | A context that is not an object throws from inside the property cache | decision | gap | |
| B-05 | The data methods of 6.6 raise a `TypeError` over a sealed or a frozen context | decision | gap | |
| B-07 | A name found at the top of a resolver chain costs as much as one found at the bottom | investigate | defect | |
| B-08 | `EsprimaExecuter` cannot reach a context value from inside a nested function | decision | executer | |
| B-09 | `RESERVED_NAMES` in the esprima executer misspells `global` | agreed | defect | |
| B-10 | A write to an unknown name inside an expression lands on `globalThis` | decision | executer | |
| B-11 | `ContextDeconstructorExecuter` loses `this` inside a method of the context | decision | executer | |
| B-12 | `ContextDeconstructorExecuter` reads every property of a context | decision | executer | |
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
| B-33 | A configuration object followed by another argument is rejected instead of taken | agreed | defect | yes |
| B-35 | A name the caller passes is checked against nothing | decision | gap | |
| B-36 | The instance entry points and the data methods take input of the wrong type without a rule | decision | gap | |
| B-37 | `setupExecuter` without a size sets 1000, not the 5000 an executer starts with | decision | gap | |
| B-38 | Rules without a test that pins them | agreed | test | |
| B-40 | What the name cache costs and saves when reading and writing along a chain | agreed | bench | |
| B-41 | The default executer logs its generated code on every cache miss | decision | defect | |
| B-43 | Take the spec tests apart as well — test each component on its own | agreed, **urgent** | test | |

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
- **Kind:** executer · **Spec:** none — `README.md`, *esprima-executer*
- **Records:** `CHANGELOG.md`

The rewrite turns an identifier into `ctx?.name` only where the traversal reaches it.
`TRAVERSABLE_PROPERTIES` (`src/executer/EsprimaExecuter.js`) does not cover `properties`,
`elements`, `test`/`consequent`/`alternate`, `tag`/`quasi`, the `property` of a computed member
access, or function bodies (`IGNORED_TYPES`). So `${ {a: value}.a }`, `${ [value][0] }`,
`${ flag ? a : b }`, `${ obj[key] }`, and every arrow, function expression, default parameter and
async function that reads the context raise where the other three executers answer — measured. Two further causes: `ctx?.name` cannot be an assignment target or a `new` callee
(`new ctx?.Cls()` is a syntax error), and `escodegen` 2.1.0 cannot generate a class field. One pass
over the rewrite closes the first two causes, not the third. Decide together with B-09.

### B-09 · `RESERVED_NAMES` in the esprima executer misspells `global`

- **Status:** agreed 2026-08-24 — rework the list as a whole, not the typo alone
- **Kind:** defect · **Spec:** 6.4
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
- **Kind:** executer · **Spec:** 6.5
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

- **Status:** decision — stays a limitation of the default, or the generated code binds the receiver
- **Kind:** executer · **Spec:** none — `README.md`, *context-deconstruction-executer*
- **Records:** `CHANGELOG.md`

A context that is a class instance — the shape a template engine hands in most often — answers
`${ greet() }` under the other three executers, which keep the context as the receiver. The
deconstructor binds the method to a local and calls it bare, so `this` is `undefined` and a method
reading its own state raises. It is the **default** executer, and the loss is silent.

### B-12 · `ContextDeconstructorExecuter` reads every property of a context, including one that throws on access

- **Status:** decision — defect of the executer, or the price of its strategy
- **Kind:** executer · **Spec:** none — `README.md`, *context-deconstruction-executer*

It destructures every name of the context, which calls every accessor on every execution. A context
whose getter throws breaks every expression, including `${ 1 + 1 }`; an `arguments` object in strict
mode does the same through `callee`. The other three executers answer, and the proxy itself reads no
getter (6.2), so this is the executer's doing alone. The cost half: every getter runs on every
execution even when the statement touches no name.

### B-41 · The default executer logs its generated code on every cache miss

- **Status:** decision — a leftover of debugging, or meant
- **Kind:** defect · **Spec:** none
- **Records:** `CHANGELOG.md` if it ships

`src/executer/ContextDeconstructorExecuter.js` starts with `let DEBUG = true` since `6a7a41d`
(2026-09-23, `false` before), and `generate` then writes `genererated code:` plus the source to
`console.log` every time it compiles. It is the default executer, so every consumer gets one console
line per cache miss; one `npm run bench` on 2026-09-26 printed it 29 761 times. It also distorts
every measurement with a cold cache taken since — a console write costs more than a resolution
(the reason the large-context warning moved to compile time, 2026-09-22). Found while documenting
the executers on 2026-09-26; `src/` was out of that scope.

### B-13 · Should the `ctx` prefix of `ContextObjectExecuter` be configurable?

- **Status:** idea — raised by Frank 2026-08-24
- **Kind:** feature · **Spec:** 9.3
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
- **Kind:** gap · **Spec:** 9.3

Every executer builds its cache with `{ size: 5000 }`; `CodeCache.setup` defaults a missing `size` to
1000, so `setupExecuter({})` or `setupExecuter()` shrinks the cache instead of leaving it alone. 9.3
names neither number. To decide: which default is meant, and whether 9.3 states it.

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
the gaps B-35 to B-37, and the missing pins in B-38. Fixed in the
text: *the stacking context* in section 2, *the global-write switch* in 4.2, four references to a
section 1.3 that does not exist, and 3.3 now says **ASCII** letters, which is what `EXPRESSION_SCOPE` accepts — a prefix
`Äpfel::` is not recognized, and whether it should be is Frank's to say.

Still open here: the bundle sizes in `AGENTS.md` and `DECISIONS.md` (11.5 KB and 355.6 KB) do not match `dist/` as committed on 2026-09-07 — 16.1 KiB and 365.5 KiB minified.
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
*link*. Counted 2026-09-26 (`\blinks?\b`, case-insensitive, occurrences): `test/` 50, most of them test
names and comments of `test/spec/` and the benchmarks; `DECISIONS.md` 36; `CHANGELOG.md` 9, entries
under `[Unreleased]` among them, which a reader meets without a definition; `src/` 2 comments;
`AGENTS.md` 2. The suites written on 2026-09-26 say *resolver* throughout.

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

### B-38 · Rules without a test that pins them

- **Status:** agreed — goal 3
- **Kind:** test

Found by the read-through of B-21. The code keeps each of them as far as it was checked, but nothing
turns the gate red if that changes:

1. 6.7 — the `deep` option of `buildSecure`; the four cases never pass it.
2. 9.2 — `with-scoped-executer` announcing its deprecation on the first expression it resolves.
3. 6.1, 6.5 — a write over a frozen context fails. The suites of `with-scoped` and `context-object`
   ask it of an assignment in an expression; `updateData` over a frozen context is not asked at all,
   and a sealed context is not in the suite (B-05).
4. 6.4 — `getData()` on a resolver over the global object answers the global object itself, and a
   write through it is an ordinary global write.
5. 3.1 — the two limits: a brace inside a comment counts, a regular expression literal after `)` is
   read as division.

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

### B-43 · Take the spec tests apart as well — test each component on its own

- **Status:** agreed 2026-09-26 — **urgent**, Frank's call; the scope is clarified first, then it
  gets its own plan under `plans/`
- **Kind:** test
- **Records:** `TESTING.md`, `AGENTS.md`, `DECISIONS.md`

The same move the executer suites made on 2026-09-26 (`DECISIONS.md`), now for `test/spec/`: 26
files, 224 cases, one file per section of `SPECIFICATION.md`. Every case goes through
`ExpressionResolver` with `TestExecuter` behind it — including the rules that are not the resolver's
own work but that of `ResolverContextHandle` (the chain walk of 5.2 to 5.4, the snapshot of 6.2, what
a context answers in 6.1 and 6.4), which are asked of the context through `answerWith` rather than of
the handle directly. The one `it.fails` of the suite (B-33) lives there.

To settle before the plan, and each changes the work:

- **What a unit is.** One suite per component — `ExpressionResolver`, `ResolverContextHandle`,
  `ExecuterRegistry`, the scanner — each called directly with what it is handed in use, as the
  executers are now; or something else.
- **The tie between a test file and a section of `SPECIFICATION.md`.** Frank kept it on 2026-09-05
  because it leads from a case to the rule it pins. Files named after components give it up unless
  the section moves into the case or the header.
- **`TestExecuter`.** Whether the resolver's own suite still needs it once the handle is tested on its
  own, and what the static entry points of 4.1 are tested against.
- **Necessity.** The same review as for the executers: only what the component's own code decides.

### B-30 · Coverage, and what is still uncovered

- **Status:** investigate — none of it is a missing test for a rule
- **Kind:** test

Measured 2026-09-26 with `npm run test:coverage`, 315 cases: statements **93.03 %** (534/574),
branches **90.78 %** (266/293), functions **91.89 %** (102/111), lines **95.95 %** (474/494). Update
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
6. The reserved-callee branch of the esprima rewrite (`EsprimaExecuter.js:49`,
   `CALLEXPRESSION__RESERVED__CALLEES`): no case ever calls `fetch(…)` or `console(…)` bare — the two
   global cases ask `typeof`, and `console.log(…)` has a member as callee. Found 2026-09-26.

`src/version.js` is generated; its 0 % is noise. The 27 open branches sit in the scanner's state
machine and in `EsprimaExecuter` — combinations of literal states, not rules without a test.
