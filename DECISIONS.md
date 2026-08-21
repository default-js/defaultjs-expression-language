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

## 2026-08-21 — How do we work with branches, and what identifies a released version?

**Decision:** Tags identify versions, branches only identify work.

- `master` is the released state and the default branch.
- One working branch per cycle — currently `v3`. Its name is free.
- A release is: merge the working branch into `master` with `--no-ff`, tag the commit
  `<version>`, push the tag, delete the working branch.
- Every publish to npm gets a tag. The tag and the `CHANGELOG.md` heading carry the same
  version string.
- A fix to an older line branches off that line's tag, e.g. `2.x`, and is released with its
  own tag.
- No version-named branches. `2.0.0` as a branch name promises something immutable about a
  ref that can move.

**Reasoning:** The version selector of the documentation app at `default-js.github.io` is
fed by branch names — `repository.view.tpl.html` builds the `<select>` from
`Object.getOwnPropertyNames(repo.branches)`. That put working branches and published
versions into one namespace: `v3` matches the generator's name filter and is already on
origin, so the next run would have offered an unfinished branch to readers as a "Version".
`defaultjs-extdom` shows the duplication the branch model produces — branch `2.0.0` and
tag `2.0.0` on the same commit `753d80b`, enough of a collision that `git rev-parse 2.0.0`
warns about an ambiguous refname. The generator in `default-js.github.io` was changed to
read `refs/tags/*` as well and to take only the default branch from `refs/heads/*`.

**Alternatives:** Keeping branches as the version axis and moving work out of the way by
naming it outside the filter, e.g. `dev/v3`. It needs no change to the documentation app,
but keeps a mutable ref standing in for an immutable one and duplicates every tag.

**Consequences:** Releasing now has a mandatory step that used to be optional — without a
tag the version vanishes from the documentation app, and a `CHANGELOG.md` section points at
nothing. Repositories in the family that carry version branches but no tags lose their
older entries until those tags exist; that is Frank's call per repository and no concern of
this one.

## 2026-08-21 — Do we maintain a `CHANGELOG.md`?

**Decision:** Yes. `CHANGELOG.md` in the repository root, Keep a Changelog 1.1.0 plus
SemVer, the same shape `defaultjs-extdom` already uses, extended by a `## [Unreleased]`
section that is written during the work rather than at release time. It is part of the
`files` array, so npm consumers receive it. History before 3.0.0 is not reconstructed.

**Reasoning:** The commit history cannot serve as the release record — subjects like
`update` and `some improvents` carry nothing, while `BACKLOG.md` relies on git history
being the archive. 3.0.0 is a breaking major, and its migration list only exists if it is
written while the breaking change is made. `DECISIONS.md` does not overlap: it holds the
reasoning for us, the changelog holds the effect for consumers. Two audiences.

**Alternatives:** Generating the changelog from commit messages, which would require a
commit message convention and a tool — both rejected as unrequested tooling, and the
message quality would have to be fixed first either way. Reconstructing 1.x and 2.x costs
real effort for versions nobody migrates from any more.

**Consequences:** Every consumer-visible change now carries a second edit, enforced by the
rule in `AGENTS.md`. A release means moving `## [Unreleased]` to a version heading with a
date. Which ref a release is pinned to is settled by the branch model above: a tag
carrying the same version string.

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
