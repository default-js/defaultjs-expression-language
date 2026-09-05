# How tests are written here

The rules a new test case follows, and the reasons in one line each. The reasoning in full is in
`DECISIONS.md` (2026-09-01, four entries); `SPECIFICATION.md` says what is true, this file says where
a case saying it belongs and what it may assert.

Four things are tested, and each has one place:

| What | Where | Against |
|---|---|---|
| the **resolver** | `test/spec/` | `TestExecuter`, which evaluates nothing |
| what an **executer supports** | `test/executer/capabilities/` | all four, against `CAPABILITIES` |
| a **rule that needs a real executer** to be seen | `test/executer/rules/` | all four, plain `it` |
| everything that pins no rule | `test/general/` | whatever it needs |

## 1. Where a case belongs

Ask in this order:

1. **Does it pin a rule of `SPECIFICATION.md`?** If not, it goes to `test/general/` — the code cache
   and the helpers of the suite are the two things there today. Nothing in `test/general/` loops over
   the executers; if a case wants to, it belongs in `test/executer/`.
2. **Is the rule observable without executing a statement?** Then it is the resolver's and goes to
   `test/spec/`: parsing and delimiting, the chain, the entry points, the data methods, the public
   surface. It runs once.
3. **Is it the executer's own work?** Then it is a **capability** and goes to
   `test/executer/capabilities/`, where it is asked of all four and gets a row in `CAPABILITIES`.
   A capability measures how far an executer supports JavaScript over a dynamic context: which
   constructs run, how much of the language's scoping survives, which values stay reachable, whether
   a write behaves the way an assignment does.
4. **Otherwise it is a rule of the resolver that only shows through a statement** and goes to
   `test/executer/rules/`, where it is asked of all four as a plain `it` — no row, no state. The
   chain walk, the name snapshot, the error policy: the proxy of `ResolverContextHandle` does that
   work and every executer gets it for free, so there is nothing an implementation may decline.

**Capability or rule** is the question steps 3 and 4 turn on, and since 2026-09-05 it is decided by
subject, not by rank: **an executer has capabilities and nothing else.** Beyond the interface it
implements and the promise to execute an expression, nothing is demanded of it — so a case only
becomes a capability if the executer is the component that does the work. If the resolver would keep
the rule no matter which implementation ran the statement, it is step 4.

A rule with halves in `test/spec/` and `test/executer/` gets a file on each — 6.1, 6.5, 7 and 8.2 are
the ones today. The directory is the answer to "how is this tested", the file name is the answer to
"which capability or which rule is it".

**The marker for a case in the wrong place:** you have to teach `TestExecuter` something specific to
keep it in `test/spec/`. What an executer decides for itself (8.3 — reaching a global, intercepting
a write, the dialect) is never asserted there.

## 2. Files

**In `test/executer/capabilities/` the file is the capability**, named after it —
`context-scope.Test.js`. Which section of `SPECIFICATION.md` it is read against is in the catalogue
and repeated in the file header, because a capability can span sections.

**Everywhere else the file is the section**, named `<section>-<slug>.Test.js` —
`6.2-names-are-a-snapshot.Test.js`. Not one file per case. Anything matching `test/**/*Test.js` runs;
`vitest.config.mjs` needs no change for a new file.

The header of a file says which section it covers, which half of it (where a section is split), and
what the file deliberately does **not** pin. In `test/executer/rules/` it also says why the cases are
plain `it`: they are not capabilities, so there is no state to look up.

## 3. In `test/spec/` nothing is evaluated

`TestExecuter` answers the statement it was handed, unchanged. A case therefore reads the resolver's
own work straight out of the result:

```javascript
const result = await ExpressionResolver.resolveText("a ${ {v: 2}.v } b", {});
expect(result).toBe("a {v: 2}.v b");   // the text the scanner cut out
```

Four tools, and nothing else is needed:

- **`useTestExecuter()`** at the top of the file — makes it the default for this file and restores
  the previous one afterwards. Needed because the static entry points of 4.1 take no executer. It
  also clears the record and any set answer after every case.
- **`answerWith(fn)`** inside a case — for the rules about what the resolver does *with* a result:
  the default value replaces `null` (4.4), a promise is awaited (4.6), a type survives `resolve`
  (4.3), an error reaches the caller (7). Set the result, do not compute it.
- **`answersFromContext()`** at the top of the file — answers `context[statement]`, a lookup rather
  than an evaluation, for the rules about **which resolver of the chain answers**.
- **`statements()`** — what was handed over, in order. For what an answer cannot show: that a
  statement arrived **not at all** (an escaped expression, 3.2) or **how often** (every occurrence on
  its own, 4.3).

A resolver can also be built with an executer of its own since 2026-09-01 —
`new ExpressionResolver({ executer })` takes an instance, not only a registered name.

## 4. In `test/executer/capabilities/` the catalogue decides

Every case is asked of all four executers and **needs a row** in `CAPABILITIES`
(`test/ExecuterCapabilities.js`). The row is keyed by the case name, so the name in the test is the
name in the table; a case whose name is no row throws rather than running.

```javascript
const capabilityIt = casesOf("context-scope", executer);   // once per capability, inside the loop over EXECUTERS
capabilityIt("reaches a context value from inside a nested function", async () => { … });
```

**Two states**, and picking the right one is the whole job of the table:

- **`yes`** — the executer supports it, the case has to pass.
- **`no`** — it does not, the case has to fail.

There is no third state. `defect` was dropped on 2026-09-05 with the idea it rested on: nothing an
executer does can break a rule it was never given, so a difference is always a `no`. Whether a `no`
is **meant** to become a `yes` is a question for `BACKLOG.md`, and the comment on the row names the
entry — but that is a plan, not a state of the table.

**Every construct is asked twice**, and the two questions live in two capabilities:

- **`syntax`** — does it run at all? Constants inside it, never a context name.
- **`context-scope`** — does it still see the context? The same construct, carrying one.

A case that puts a context name inside a construct answers both at once, and a failure then does not
say which broke. Which is why `evaluates an object literal` reads `yes` for all four today: it uses
`{a: 4}`, so it pins the parser rather than the rewrite — and whether `{a: value}` answers under
every executer is a question nothing in the suite asks yet. `BACKLOG.md` carries what reading the
esprima traversal predicts about that.

**Never write a case that pins what an executer answers instead.** A `no` says everything; a second
case asserting the other answer is the same fact in a second place, and the day the capability
arrives it turns red without the table knowing. That mistake has been made twice here.

The dialect is no row: a spelling is not a yes or no. It comes from `variableName` on the executer
entry, and a case that depends on it branches on that function.

## 5. In `test/executer/rules/` nothing decides

A rule that needs a real executer to be seen has no row and no state: it runs as a plain `it` under
all four, and a failure is a red gate the ordinary way. Import `EXECUTERS` for the loop and
`variableName` for the spelling — not `casesOf`.

The header says why the file is here rather than in `test/executer/capabilities/`: the resolver does
the work, so there is nothing an implementation may decline.

## 6. Every case, wherever it lives

- **One case asserts one thing.** `resolveText("${ {a: 1}.a }")` answering `"1"` says both *the
  expression was delimited correctly* and *the statement was evaluated correctly* — a broken scanner
  and a broken executer then look the same.
- **A change in behaviour starts with a failing test**, and the failure is read before the source is
  touched: failing for the right reason, not just failing. Where the two states cannot be told apart
  from the outside, write that limitation into the file instead of implying a proof.
- **The comment says why, not what.** Where a case cannot tell an implementation apart, or was
  carried over, or deliberately does not assert something, the comment says so.
- **`describe` / `it` / `expect` with `toBe`, `toBeDefined`, `toBeUndefined`.** Keeping that surface
  narrow is worth something on its own; widen it only with a reason. `globals: true` stays off — the
  suite uses the bare identifier `test` as its example of an undefined variable.
- Per-suite timeouts go in the options object, `describe(name, { timeout }, fn)`.

## 7. When cases move

Moving is where coverage is lost quietly, so both are counted:

- **The case count before and after**, with the difference accounted for item by item.
- **`npm run test:coverage`** at the end of a move, against the numbers in `BACKLOG.md`. Counting
  cases is not enough: on 2026-09-01 the case count was right and one branch of the esprima rewrite
  had lost its only reader.

## 8. What the suite runs on

Vitest in browser mode, headless Chromium through Playwright — a real browser, because the package
targets one and the tests reach for `document`, `window` and `document.location`. Shared setup in
`test/setup.js`, helpers in `test/TestUtils.js`. The benchmarks under `test/PerformanceTests/` are
never part of the gate; `npm run bench` runs them, and a broken benchmark reports nothing at all
rather than failing.
