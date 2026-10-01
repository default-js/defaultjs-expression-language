# How tests are written here

The rules a new test case follows, and the reasons in one line each. The reasoning in full is in
`DECISIONS.md`; `SPECIFICATION.md` says what is true, this file says where a case saying it belongs
and what it may assert.

Every part of the suite has one place:

| What | Where | Against |
|---|---|---|
| one **component** — `ExpressionScanner`, `ResolverContextHandle`, `ExpressionResolver`, `ExecuterRegistry`, `CodeCache` | `test/<component>/`, the full component name in lower case: `test/expressionscanner/`, `test/executerregistry/` | that component alone, called with what it is handed in use |
| the class **`Executer`**, the interface | `test/executer/interface.Test.js` | the class |
| what **one executer** guarantees, its interface included | `test/executer/<executer>/` | that executer alone, called as `execute(aStatement, aContext)` |
| the **public surface** of the package | `test/package/surface.Test.js` | `index.js`, `Executer`, and the paths the `exports` field opens |

## 1. Where a case belongs

Ask **whose code decides it**, in this order:

1. **One executer?** Then it goes into that executer's directory — `with-scoped`, `context-object`,
   `context-deconstruction` — and only if the executer **guarantees** it. What an executer
   does not do is written into its section of `README.md`, never into a test.
2. **Whether an executer keeps the interface** — its module registers it on import and exports it,
   its name and `setupExecuter` — is that executer's guarantee too, in its own `interface.Test.js`.
   **No test lists or loops over the executers**: a new executer brings every question along with its
   own directory, rather than having to be entered in somebody else's list, where a forgotten entry
   turns nothing red. The class `Executer` itself is `test/executer/interface.Test.js`.
3. **Otherwise the component whose code decides it:**
   - `expressionscanner` — where an expression begins and ends, which occurrence is escaped, the
     syntax of the scope prefix, the single-expression form of `resolve`;
   - `resolvercontexthandle` — the chain walk, what a context answers, the snapshot of names, where a
     write lands;
   - `expressionresolver` — construction, the entry points and what they do with a result, default
     value, timeout, asynchrony, errors and warnings, which resolver a scope prefix or a data method
     addresses, the chain getters, the default executer;
   - `executerregistry`, `codecache` — each its own.
4. **The list of public members** is `test/package/surface.Test.js`: existence and shape only, so
   that a removal trips over it. What a member does is tested with the component that has it.

**A rule is tested where it lives, once.** The resolver hands statements to the scanner, reads the
context through its handle and runs executers; none of that is retested through the resolver. What
the resolver suite keeps is **one representative case per place where it connects** to another
component — `test/expressionresolver/wiring.Test.js` — so that a broken connection turns something
red.

**The marker for a case in the wrong place:** you have to teach `TestExecuter` something specific to
keep it in the resolver suite, or a resolver case needs a real executer to answer. Either way it is
an executer's work and belongs with that executer.

## 2. Files

**The file is the topic**, in every directory: `delimiters`, `escaping`, `lookup`, `snapshot`,
`default-value`, `data-methods`; in an executer's directory `syntax`, `context`, `context-shape`,
`write`, `globals`, `cache`, `interface`, and `errors` where the executer guarantees how it fails. A
topic the component guarantees nothing in has no file. Not one file per case.

**The header of a file names the sections of `SPECIFICATION.md` it pins**, which is what leads from a
case to its rule, and says what it deliberately does not pin. Anything matching `test/**/*Test.js`
runs; `vitest.config.mjs` needs no change for a new file.

## 3. `TestExecuter` evaluates nothing

A component that hands a statement to an executer — `ExpressionResolver` — is tested against
`TestExecuter` (`test/TestExecuter.js`), so a case reads the component's own work out of the result
and nothing about anybody's ability to evaluate:

- **`new TestExecuter()`** answers the statement it was handed, unchanged.
- **`new TestExecuter(fn)`** answers `fn(aStatement, aContext)` — for the rules about what the
  resolver does *with* a result: the default value replaces `null` (4.4), a promise is awaited (4.6),
  a type survives `resolve` (4.3), an error reaches the caller (7). Set the result, do not compute it.
  For the rules about **which resolver answers**, a file declares
  `const lookup = () => new TestExecuter((aStatement, aContext) => aContext[aStatement]);` — a
  lookup, not an evaluation.
- **What arrived, and how often**, a case records in its own answer function.

**One instance per case**, never registered. A resolver takes it as `executer`, on the root of a chain
— the resolvers below take it from their parent. The static entry points of 4.1 take no executer, so
a case sets `ExpressionResolver.defaultExecuter` to its instance and the file puts the previous one
back in one `afterAll`.

## 4. An executer's suite tests its guarantees

Every case is an ordinary `it` that has to pass. There is no table, no state and no `it.fails`:

- **The executer and nothing else.** A case calls `executer.execute(aStatement, aContext)` with a
  bare statement — no `${}` — and a plain data context. No `ExpressionResolver` is built: a case that
  goes through one tests the chain, the scope prefix and the default value along with the executer.
  What only exists through a chain — a write to a name an ancestor carries — is the resolver's.

- **Only where the executer's own code decides.** A case is needed where a change to *that*
  executer could break it: it runs the executer's own work — generating, reading the
  names of a context, caching — or pins a guarantee its README section states. All three paste
  the statement unchanged into the function they generate, so which construct runs and where
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

## 5. Every case, wherever it lives

- **One case asserts one thing.** `resolveText("${ {a: 1}.a }")` answering `"1"` says both *the
  expression was delimited correctly* and *the statement was evaluated correctly* — a broken scanner
  and a broken executer then look the same.
- **A change in behaviour starts with a failing test**, and the failure is read before the source is
  touched: failing for the right reason, not just failing. Where the two states cannot be told apart
  from the outside, write that limitation into the file instead of implying a proof.
- **`it.fails` marks a requirement that is wanted and not implemented yet** — a rule of
  `SPECIFICATION.md` the code does not keep — with its `BACKLOG.md` entry named in a comment. It may
  stand in any component suite, never under `test/executer/`. A **fixed limit** is no such
  requirement: it is pinned by an ordinary `it` that checks the limit. **No release carries an
  `it.fails`.**
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
