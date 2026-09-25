# How tests are written here

The rules a new test case follows, and the reasons in one line each. The reasoning in full is in
`DECISIONS.md`; `SPECIFICATION.md` says what is true, this file says where a case saying it belongs
and what it may assert.

Every part of the suite has one place:

| What | Where | Against |
|---|---|---|
| the **resolver**, the chain walk included | `test/spec/` | `TestExecuter`, which evaluates nothing, or the context the resolver hands over |
| the **interface** every executer shares | `test/executer/interface.Test.js` | all four executer modules |
| what **one executer** guarantees | `test/executer/<executer>/` | that executer alone, called as `execute(aStatement, aContext)` |
| everything that pins no rule | `test/general/` | whatever it needs |

## 1. Where a case belongs

Ask in this order:

1. **Is it about one executer?** Then it goes into that executer's directory — `with-scoped`,
   `context-object`, `context-deconstruction`, `esprima` — and only if the executer **guarantees** it.
   What an executer does not do is written into its section of `README.md`, never into a test.
2. **Is it the interface?** Registering on import is asked of all four in
   `test/executer/interface.Test.js`. Nothing else is asked of all four: every executer is a solution
   of its own, and no feature set is shared beyond the interface.
3. **Does it pin a rule of `SPECIFICATION.md`?** Then it is the resolver's and goes to `test/spec/`:
   parsing and delimiting, the chain and its walk, the entry points, the data methods, the public
   surface. It runs once.
4. **Otherwise** it goes to `test/general/` — the code cache is the one thing there today.

**The chain walk is the resolver's, not an executer's.** It lives in the traps of
`ResolverContextHandle`, and an executer reaches the chain through them: reading a name, asking
whether one exists, listing them. A case asks those of the context directly — through `TestExecuter`
or on `resolver.context` — rather than of an executer that happens to use them.

**The marker for a case in the wrong place:** you have to teach `TestExecuter` something specific to
keep it in `test/spec/`, or a case in `test/spec/` needs a real executer to answer. Either way it is
an executer's work and belongs with that executer.

## 2. Files

**In `test/spec/` the file is the section**, named `<section>-<slug>.Test.js` —
`6.2-names-are-a-snapshot.Test.js`. A section with two halves may have two files with two slugs,
as 7 has. Not one file per case.

**In an executer's directory the file is the topic**: `syntax`, `context`, `context-shape`, `write`,
`globals`, `cache`, and `errors` where the executer guarantees how it fails. A topic the executer
guarantees nothing in has no file.

The header of a file says what it covers and what it deliberately does not pin. Anything matching
`test/**/*Test.js` runs; `vitest.config.mjs` needs no change for a new file.

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
  (4.3), an error reaches the caller (7). Set the result, do not compute it. It also asks the context
  a question directly — `aStatement in aContext`, `Object.keys(aContext)` — which is how the walk is
  pinned for every trap an executer might use.
- **`answersFromContext()`** at the top of the file — answers `context[statement]`, a lookup rather
  than an evaluation, for the rules about **which resolver of the chain answers**.
- **`statements()`** — what was handed over, in order. For what an answer cannot show: that a
  statement arrived **not at all** (an escaped expression, 3.2) or **how often** (every occurrence on
  its own, 4.3).

A resolver can also be built with an executer of its own — `new ExpressionResolver({ executer })`
takes an instance, not only a registered name.

## 4. An executer's suite tests its guarantees

Every case is an ordinary `it` that has to pass. There is no table, no state and no `it.fails`:

- **The executer and nothing else.** A case calls `executer.execute(aStatement, aContext)` with a
  bare statement — no `${}` — and a plain data context. No `ExpressionResolver` is built: a case that
  goes through one tests the chain, the scope prefix and the default value along with the executer.
  What only exists through a chain — a write to a name an ancestor carries — is the resolver's.

- **Only where the executer's own code decides.** A case is needed where a change to *that*
  executer could break it: it runs the executer's own work — generating, rewriting, reading the
  names of a context, caching — or pins a guarantee its README section states. Three of the four
  paste the statement unchanged into the function they generate, so which construct runs and where
  a name is found is the engine's answer: one representative case, not one per construct.
- **Only what the executer guarantees.** A behaviour that holds only by accident — a write
  "contained" because the executer cannot run the assignment at all, a frozen key "unchanged"
  because nothing is ever written — is no guarantee and gets no case.
- **In the executer's own dialect, written out.** `${ ctx.value }` in the context-object suite,
  `${ value }` in the others. A case body is repeated across suites where two executers guarantee the
  same thing; sharing it would be sharing a feature set.
- **Never a case that pins what an executer does not do.** A limitation is documented in `README.md`.
  Where an executer guarantees *how* it fails — the deconstructor names the key it cannot bind —
  that is a guarantee and belongs in `errors`.

**Where the executer rewrites the statement, every construct is asked twice** — `esprima` today —
and the two questions live in two files: `syntax` asks whether a construct runs, with constants
inside it; `context` asks whether the same construct still reaches a context value. A case that puts a context name inside a construct answers both at once, and a
failure then does not say which broke.

## 5. Every case, wherever it lives

- **One case asserts one thing.** `resolveText("${ {a: 1}.a }")` answering `"1"` says both *the
  expression was delimited correctly* and *the statement was evaluated correctly* — a broken scanner
  and a broken executer then look the same.
- **A change in behaviour starts with a failing test**, and the failure is read before the source is
  touched: failing for the right reason, not just failing. Where the two states cannot be told apart
  from the outside, write that limitation into the file instead of implying a proof.
- **`it.fails` stands in `test/spec/` only**, for a rule the resolver does not keep yet, with its
  `BACKLOG.md` entry named in a comment.
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
  cases is not enough: a branch can lose its only reader while the count is right.

## 7. What the suite runs on

Vitest in browser mode, headless Chromium through Playwright — a real browser, because the package
targets one and the tests reach for `document`, `window` and `document.location`. Shared setup in
`test/setup.js`, helpers in `test/TestUtils.js`. The benchmarks under `test/PerformanceTests/` are
never part of the gate; `npm run bench` runs them, and a broken benchmark reports nothing at all
rather than failing.
