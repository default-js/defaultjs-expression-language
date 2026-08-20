# Decisions

Architecture and API decisions for `@default-js/defaultjs-expression-language`, newest first.

What matters in an entry is the *reasoning*. A decision recorded without it cannot be revisited later — only obeyed or overturned blindly. Entries stay even once superseded; a later entry references the one it replaces.

A decision that is only a step inside a running undertaking stays in that undertaking's plan under `plans/`. It moves here once it outlives the plan.

## Format

```
## YYYY-MM-DD — <the question, phrased as a question>

**Decision:** what was chosen.
**Reasoning:** why, and what evidence supported it.
**Alternatives:** what was rejected, and what would make it the better choice.
**Consequences:** what this costs, and what it rules out later.
```

---

## 2026-08-20 — Should `EsprimaExecuter` be registered by default?

**Decision:** No. `src/executer/index.js` registers `WithScopedExecuter`,
`ContextObjectExecuter` and `ContextDeconstructorExecuter`; the import of `EsprimaExecuter`
stays commented out. It is reached either through the separate
`browser-all-executers.js` bundle or by importing the module explicitly.

**Reasoning:** `espree` dominates the bundle. Measured on the current `dist/` artifacts:
`browser-…min.js` is 11.5 KB, `browser-all-executers-…min.js` is 355.6 KB — a factor of 31
for an executer most consumers never use. The split is a bundle-size decision, not a
functional one; the difference between the two browser bundles is `espree` alone.

**Alternatives:** Registering everything by default would remove one entry point and one
bundle from the build. It becomes the better choice only if `espree` stops being the
dominant cost — for instance if the esprima executer were rewritten against a parser that
is already present, or if it became the default execution strategy.

**Consequences:** Two browser bundles have to be built and kept in step. Consumers wanting
the esprima executer import it explicitly, which is also how they reach `setupExecuter`.
The commented-out import in `src/executer/index.js` is load-bearing and must not be
"cleaned up". An `exports` field must keep `./src/executer/*` importable — see `BACKLOG.md`.
