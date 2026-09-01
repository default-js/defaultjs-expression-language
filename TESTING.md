# How tests are written here

The rules a new test case follows, and the reasons in one line each. The reasoning in full is in
`DECISIONS.md` (2026-09-01, four entries); `SPECIFICATION.md` says what is true, this file says where
a case saying it belongs and what it may assert.

Three things are tested, and each has one place:

| What | Where | Against |
|---|---|---|
| the **resolver** | `test/spec/` | `TestExecuter`, which evaluates nothing |
| the **implementations** | `test/executer/rules/` | all four registered executers, against `MATRIX` |
| everything that pins no rule | `test/general/` | whatever it needs |

## 1. Where a case belongs

Ask in this order:

1. **Does it pin a rule of `SPECIFICATION.md`?** If not, it goes to `test/general/` — the code cache
   and the helpers of the suite are the two things there today. Nothing in `test/general/` loops over
   the executers; if a case wants to, it belongs in `test/executer/`.
2. **Is the rule observable without executing a statement?** Then it is the resolver's and goes to
   `test/spec/`: parsing and delimiting, the chain, the entry points, the data methods, the public
   surface. It runs once.
3. **Otherwise it is a demand on the implementations** and goes to `test/executer/rules/`, where it
   is asked of all four and gets a row in `MATRIX`.

A rule with halves on both sides gets a file on each — 6.1, 6.5, 7 and 8.2 are the ones today. The
directory is the answer to "how is this tested", the file name is the answer to "which rule is it".

**The marker for a case in the wrong place:** you have to teach `TestExecuter` something specific to
keep it in `test/spec/`. What an executer decides for itself (8.3 — reaching a global, intercepting
a write, the dialect) is never asserted there.

## 2. Files

One file per section of `SPECIFICATION.md`, named `<section>-<slug>.Test.js` —
`6.5-writing-from-inside.Test.js`. Not one file per case. Anything matching `test/**/*Test.js` runs;
`vitest.config.mjs` needs no change for a new file.

The header of a file says which section it covers, which half of it (where a section is split), and
what the file deliberately does **not** pin.

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

## 4. In `test/executer/rules/` the matrix decides

Every case is asked of all four executers and **needs a row** in `MATRIX`
(`test/ExecuterCapabilities.js`). The row is keyed by the case name, so the name in the test is the
name in the table; a case whose name is no row throws rather than running.

```javascript
const matrixIt = casesOf("6.2", executer);   // once per section, inside the loop over EXECUTERS
matrixIt("sees that key after resetCache", async () => { … });
```

Three states, and picking the right one is the whole job of the table:

- **`yes`** — the case has to pass. A row of nothing but `yes` is a rule every implementation keeps.
- **`no`** — the case has to fail, and that is **a freedom the specification grants** (8.3). Neither
  answer is wrong.
- **`defect`** — the case has to fail although the specification demands it. Not a freedom: the
  comment on the row names the `BACKLOG.md` entry that carries the fix.

Where the specification is silent, a difference is `no`, never `defect` — and it still gets a row,
because a difference between implementations is exactly what the table is for.

**Never write a case that pins what an executer answers instead.** A `no` says everything; a second
case asserting the other answer is the same fact in a second place, and the day the capability
arrives it turns red without the table knowing. That mistake has been made twice here.

The dialect is no row: a spelling is not a yes or no. It comes from `variableName` on the executer
entry, and a case that depends on it branches on that function.

## 5. Every case, wherever it lives

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

## 6. When cases move

Moving is where coverage is lost quietly, so both are counted:

- **The case count before and after**, with the difference accounted for item by item.
- **`npm run test:coverage`** at the end of a move, against the numbers in `BACKLOG.md`. Counting
  cases is not enough: on 2026-09-01 the case count was right and one branch of the esprima rewrite
  had lost its only reader.

## 7. What the suite runs on

Vitest in browser mode, headless Chromium through Playwright — a real browser, because the package
targets one and the tests reach for `document`, `window` and `document.location`. Shared setup in
`test/setup.js`, helpers in `test/TestUtils.js`. The benchmarks under `test/PerformanceTests/` are
never part of the gate; `npm run bench` runs them, and a broken benchmark reports nothing at all
rather than failing.
