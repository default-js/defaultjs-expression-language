# Plan — Specification of the ExpressionResolver

**Status: running, and it blocks. Opened 2026-08-21 by Frank.**

Read this before touching anything listed under *What is frozen*. Nothing there gets changed,
fixed or documented until this plan is finished — not even a defect that looks unambiguous.

## Why this exists

There is no specification of what the ExpressionResolver is supposed to do. What exists is the
code, and the code has at least one behaviour that is a year-old regression rather than an
intention (see `BACKLOG.md`). That makes the code an unreliable witness: every fix derived from
reading it risks cementing an accident, and every test written against it risks pinning one.

The knowledge that is missing is Frank's own, and it lives nowhere but in his head. This plan is
the vehicle for getting it written down: an interview in batches, answers turned into a durable
document, and only then work resumes on the frozen items.

Goal 2 of the v3 cycle — raise code quality — cannot be finished without it. Neither can goal 4:
documenting a behaviour nobody has specified would only produce a second description of the same
accident.

## What is frozen

No change to the observable behaviour of `src/ExpressionResolver.js`,
`src/ResolverContextHandle.js` or the public API around them, and no documentation of that
behaviour, while this plan runs. The `BACKLOG.md` entries on hold:

- `${scope::expression}` never reaches an ancestor — the argument-order regression
- The instance `resolve()` does not understand the scope syntax at all
- `getData` and `deleteData` are broken on the filter path — unambiguous defects that need no
  design input, so these go first once the freeze lifts
- The constructor option `executer` is undocumented and silently ignores an `Executer` instance
- Was a `Context` export meant to exist on the public API?
- Every code example in `README.md` uses a default import that does not exist — the readme
  rewrite is downstream of this plan, not parallel to it
- The default executer announces itself as deprecated — what replaces it is part of the same
  conversation

**Not frozen**, because none of it touches resolver semantics: the toolchain and packaging
entries (`"type": "module"` and `exports`, `espree` 11, Dependabot, webpack vs. Vite, the
`module` entry, `generate-license.config.json`, `devServer.static`), the benchmark entries, and
the two remaining `TestUtils` helpers.

## What is known today, and how much it is worth

Recorded here so the next session does not repeat the archaeology.

| Source | What it says | Weight |
|---|---|---|
| `package.json` description | "This provides an expression resolver. You can build an resolver chain to solve hierarchic scopes!" | The only statement of purpose predating this cycle. Names the chain and hierarchic scopes as the point of the package. |
| `README.md` | The static API only: `resolve` / `resolveText` with `(aStatement, aContext, aDefault, aTimeout)`, context with a global fallback, default value, timeout. | Says nothing about chains, scopes, `::`, executers or the instance API. Its examples do not run. |
| `DECISIONS.md` | Nothing on resolver semantics. Ten entries, nine toolchain, one on the esprima registration. | — |
| The test suite | Unscoped lookups along a chain, context behaviour, context manipulation, `resolveText`. | No test uses `scope::`. Branch coverage of `ExpressionResolver.js` is 62 %. |
| `AGENTS.md`, Architecture | Chain, scopes, context proxy, executer, `DefaultValue`. | **Circular — written during this cycle by reading the code.** Not evidence of intent. |
| Git history | Beta 3 (`df42f2c`, 2020-02-22) declared `resolve(aResolver, aExpression, aFilter, aDefault)` and recursed correctly. `aExecuter` was prepended on 2025-07-20 (`38aff7d`) and the call site was never adjusted. | The strongest evidence of intent found so far, and only for the scope walk: it was meant to climb until a link's name matches. |

## Stages

**Stage 0 — where does the finished specification live?**
Not settled. `DECISIONS.md` records *why* a thing is the way it is; a specification records
*what* it does. Different documents. Recommendation: a permanent `SPECIFICATION.md` in the
repository root, with `README.md` carrying the consumer-facing subset and `DECISIONS.md` the
reasoning behind individual answers. Needs Frank's yes; if yes, `AGENTS.md` gets it under
*Records*.

**Stage 1 — the interview.** The questions below, in batches, answered by Frank. Answers are
written into this file as they arrive, so a session ending mid-interview loses nothing.

**Stage 2 — draft.** The answers turned into the document decided in stage 0. Behaviour the
current code gets wrong is written as the intended behaviour, with a pointer to the `BACKLOG.md`
entry that will fix it.

**Stage 3 — review.** Frank reads the draft against his intent, not against the code.

**Stage 4 — land and lift the freeze.** The specification becomes a permanent record, the
individual decisions that came out of it go into `DECISIONS.md`, this plan is deleted, and the
frozen backlog entries are rewritten to say what the fix has to achieve.

## Stage 1 — open questions

Nothing here is answered yet. Answers go directly underneath their question.

### A. Purpose

1. What problem does the resolver solve in your systems, and where is it actually used — which
   sibling packages depend on which behaviour?
2. Who is the intended consumer: application code, or other `defaultjs-*` packages?

### B. Expression syntax

3. What is an expression allowed to contain — arbitrary JavaScript, or a restricted grammar?
4. `\${...}` returns the literal text. Permanent part of the syntax?
5. `${name::expression}` — what is the scope prefix for, and what are the rules for the name?
   The regex allows letters, digits, `-`, `_` and whitespace.
6. Must `resolve()` and `resolveText()` accept the same syntax, or is `resolve()` deliberately
   the raw path?

### C. Chain and scopes

7. Without a scope prefix, what is the lookup order along the chain, and does the nearest link
   shadow the ones above it?
8. A scope name that no link in the chain carries — `null`, the default value, or an error?
9. A write performed inside an expression lands on the context proxy rather than on the object
   the caller passed in. Intended, and on which link of the chain does it land?

### D. Context

10. The readme documents a global fallback: `resolve("${test}")` finds `window.test`. Still
    wanted? It is the reason a name resolving to nothing rarely looks like an error.
11. A link constructed with `context: null` — what should it contribute to a lookup?

### E. Defaults, errors, timeouts

12. An execution error is currently swallowed with a `console.warn` and the call answers
    `undefined`. Intended, or should it throw, or fall back to the default value?
13. `DefaultValue` distinguishes "no default passed" from "the default is `undefined`". What is
    the rule that distinction serves?
14. The readme says `aTimeout` makes the resolver wait 1000 ms before starting to resolve. Is
    that the intent, or was a deadline meant?

### F. Executers

15. Which executer is the default meant to be? `WithScopedExecuter` warns that it is deprecated
    while being exactly what every consumer gets.
16. Is `buildSecure` public API, and what does "secure" mean there?

### G. Public surface

17. Which of `resolve`, `resolveText`, `getData`, `updateData`, `deleteData`, `mergeContext`,
    `chain`, `effectiveChain`, `contextChain`, `context`, `buildSecure` are supported public API,
    and which are internal?
