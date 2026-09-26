# Plan — take the spec tests apart, one suite per component

Backlog entry: B-43. Scope clarified with Frank on 2026-09-26. Status of each stage is updated the
moment it goes green, together with what was actually done and any deviation.

## Goal

`test/spec/` tests every rule through `ExpressionResolver`, with a shared, stateful `TestExecuter`
behind it. After this plan every component is tested on its own, called directly with what it is
handed in use — the move the executer suites made on 2026-09-26, now for the rest of the package.
Cases are **moved, not thinned**: the count stays, every difference is accounted for item by item.

## Decisions taken for this plan

1. **The units** are `ExpressionScanner`, `ResolverContextHandle`, `ExpressionResolver`,
   `ExecuterRegistry` and `CodeCache`.
2. **The scanner is extracted** from `src/ExpressionResolver.js` into `src/ExpressionScanner.js` — a
   pure move, no change in behaviour. It exports two forms:
   - `scan(aText)` — every occurrence of a text, as `resolveText` uses it today;
   - `parseExpression(aExpression)` — the single-expression form of the instance `resolve`: the
     closing-brace check that throws the `SyntaxError`, the split into scope and statement, the
     normalizing.
   It is internal: not exported through `index.js`, not added to section 8. It is reachable by deep
   import like every file under `src/`, and documented nowhere as API. The scanner is a hot path, so
   `npm run bench` is run before and after the extraction.
3. **Layout:** one directory per component, named after the **full component name in lower case** —
   `test/expressionscanner/`, `test/resolvercontexthandle/`, `test/expressionresolver/`,
   `test/executerregistry/`, `test/codecache/`. Inside, **one file per topic**, as in the executer
   suites; the sections of `SPECIFICATION.md` a file pins stand in its header. Section 8 is no
   component and becomes `test/package/surface.Test.js`. `test/spec/` and `test/general/` go away.
4. **`TestExecuter` becomes an instance per case.** It is built with an optional answer function; without
   one it answers the statement it was handed. The global state goes entirely — `statements()`,
   `answerWith`, `answersFromContext`, `useTestExecuter`, the record and the reset. A case that needs
   to count calls does so in its own answer function. A case about the static entry points of 4.1
   sets `ExpressionResolver.defaultExecuter` to its instance (the setter takes an instance) and puts
   the previous one back. No `vi.fn`: the narrow assertion surface of `TESTING.md` stays.
5. **Section 9 is split by component:** the `Executer` class cases go to
   `test/executer/interface.Test.js`, the registry to `test/executerregistry/`, `defaultExecuter` and
   the default of 9.2 to `test/expressionresolver/`.
6. **Wiring:** the chain walk (5.2, 6.1 to 6.4) is tested on the handle only, through
   `new ResolverContextHandle(aData, aParentHandle).proxy`. The resolver suite keeps **one
   representative case per wiring** — e.g. that `resolver.context` sees a name of an ancestor, so the
   constructor connected the handles.
7. **`it.fails`** marks a requirement that is wanted and not implemented yet, in any component suite
   — never under `test/executer/`. A fixed limit is pinned by an ordinary `it` that checks the limit.
   **No release may carry an `it.fails`.** B-33 moves as `it.fails` to `test/expressionresolver/`.
8. **Necessity review is out of scope** — B-44.

## Where the cases go

Assignment is per case, not per file, by one question: *whose code decides this?* The table is the
intended target; a case that turns out to belong elsewhere is moved there and noted in its stage.

| From `test/spec/` | To |
|---|---|
| `3.1-delimiters` | `expressionscanner/delimiters` — "delimits the same way in resolve" to `expressionscanner/single-expression` |
| `3.2-escaping` | `expressionscanner/escaping` — the case "does not hold in resolve" to `single-expression` |
| `3.3-the-scope-prefix` | parsing to `expressionscanner/scope-prefix`; "addresses the link carrying the name" to `expressionresolver/scope` |
| `3.4-the-empty-statement` | the statement being empty to `expressionscanner`; the answer `undefined`, the default and the rendering to `expressionresolver` |
| `4.1-the-static-entry-points` | `expressionresolver/static-entry-points`, B-33 as `it.fails` |
| `4.2-the-instance-entry-points` | `expressionresolver/construction` |
| `4.3-resolve-and-resolvetext` | result handling to `expressionresolver/resolve-and-resolvetext`; the delimited form, the closing-brace error and the prefix only inside delimiters to `expressionscanner/single-expression` |
| `4.4`, `4.5`, `4.6` | `expressionresolver/default-value`, `timeout`, `asynchrony` |
| `5.1-structure` | `expressionresolver/construction` |
| `5.2-lookup-without-a-prefix` | `resolvercontexthandle/lookup`, one wiring case to `expressionresolver/wiring` |
| `5.3`, `5.4` | `expressionresolver/scope` |
| `5.5-inspecting-the-chain` | `expressionresolver/chain-inspection` |
| `6.1`, `6.2`, `6.3`, `6.4` | `resolvercontexthandle/context-shape`, `snapshot`, `without-context`, `global-object`; one wiring case each where the resolver builds or hands over the handle |
| `6.6-reading-and-writing-from-outside` | which resolver a data method addresses to `expressionresolver/data-methods`; what the write does to the handed-over object to `resolvercontexthandle/write` |
| `6.7-buildsecure` | `expressionresolver/buildsecure` |
| `7-errors`, `7-the-warnings` | `expressionresolver/errors` |
| `8-the-public-surface` | `package/surface` |
| `9.1-the-interface` | `Executer` to `executer/interface`, registry to `executerregistry/registry`, default executer to `expressionresolver/default-executer` |
| `9.2-the-implementations` | `expressionresolver/default-executer` |
| `general/CodeCacheTest.js` | `codecache/` |

## Stages

Each stage ends green (`npm test`) before the next one starts.

### 0 · Baseline — open

Record here: the case count of `npm test` (last known 2026-09-26: 315 cases, 314 passed, 1 expected
fail), the coverage of `npm run test:coverage` (B-30: 93.03 / 90.78 / 91.89 / 95.95), and one
`npm run bench` run, read with the caveats of B-25 and B-27.

### 1 · Scanner suite, seen failing — open

Write `test/expressionscanner/` against `src/ExpressionScanner.js`, carrying the scanner cases of
3.1 to 3.4 and 4.3 over as calls of `scan` and `parseExpression`. Run it and see it fail on the
missing module. The extraction changes no behaviour, so the proof that nothing changed is the other
half: the untouched cases in `test/spec/` stay green through stage 2.

### 2 · Extract the scanner — open

Move `scan`, `scanExpression`, `splitScopeAndStatement`, `countBackslashes`, `startsRegex`,
`normalize` and their constants into `src/ExpressionScanner.js`; add `parseExpression`; the resolver
imports both. `npm test` green with the new suite and the old one. `npm run bench` against stage 0.
`CHANGELOG.md` under `[Unreleased]`: a new file is published under `src/`.

### 3 · The new `TestExecuter` — open

Rewrite `test/TestExecuter.js` as an instance built with an optional answer function. The old
helpers stay until the last file using them has moved, so the gate stays green in between.

### 4 · `ResolverContextHandle` — open

`test/resolvercontexthandle/`, built directly over data and parent handles. Wiring cases to
`test/expressionresolver/wiring`.

### 5 · `ExecuterRegistry`, the interface, the surface — open

`test/executerregistry/`, the `Executer` cases into `test/executer/interface.Test.js`,
`test/package/surface.Test.js`.

### 6 · `ExpressionResolver` — open

Everything left in `test/spec/`, against the new `TestExecuter`. B-33 as `it.fails`.

### 7 · `CodeCache` — open

Move `test/general/CodeCacheTest.js` to `test/codecache/`, named by topic.

### 8 · Close — open

Delete `test/spec/`, `test/general/` and the old helpers of `TestExecuter`. Case count against stage
0, every difference accounted for. `npm run test:coverage` against stage 0. Then the records:

- `TESTING.md` — the table, section 1 to 3 and the `it.fails` rule of section 5.
- `AGENTS.md` — the *Tests* section, `ExpressionScanner` under *Architecture*, the `it.fails` rule in
  goal 2 of the vision, and the release rule.
- `DECISIONS.md` — one entry: the units, the extraction, the instance `TestExecuter`, `it.fails` and
  the release rule. Reasoning and alternatives from this plan.
- `BACKLOG.md` — the *Markers* paragraph, B-43 deleted, B-30 numbers updated.

Then this plan is deleted.

## Risk

- **Coverage lost quietly** — a branch losing its only reader while the count is right. Checked in
  stage 8 against stage 0, per `TESTING.md` section 6.
- **A slower scanner** — an extra module boundary on the hot path. Checked in stage 2; a regression is
  a defect, not a trade-off.
- **A case that only held through the chain** — a handle case built directly may miss a behaviour the
  resolver added on top. That is what the wiring cases are for; where one is missing, the stage adds it.
