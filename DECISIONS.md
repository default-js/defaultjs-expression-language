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

## 2026-08-21 — Do we commit style configuration, and does the tree get normalized?

**Decision:** Yes to both. `.editorconfig` and `.gitattributes` enter the repository, and the
tree was normalized once to match them in the same change.

- `.editorconfig`: utf-8, LF, tabs, final newline, no trailing whitespace. Markdown is the
  one exception — spaces, width 2, because list nesting and fenced blocks are column-based
  syntax there, not style. Generated paths (`dist/**`, `coverage/**`, `target/**`,
  `package-lock.json`, `LICENSE-OF-THIRD-PARTY`) unset every key.
- `.gitattributes`: `* text=auto eol=lf`, plus `linguist-generated` on the three generated
  paths.
- Normalization touched 55 tracked files: four were pure CRLF (`browser.js`,
  `src/ExpressionResolver.js`, `src/index.js`, `test/index.js`), 29 had no final newline,
  ~20 carried trailing whitespace. Space indentation became tabs in `src/Executer.js`,
  `src/Utils.js`, `test/TestUtils.js`, `webpack.config.js` and
  `generate-license.config.json`; the JSDoc blocks at `src/CodeCache.js:29` and `:40` sat one
  column off and were straightened.

**Reasoning:** The conventions in `AGENTS.md` were prose only, and the tree had already
drifted away from them — seven files were space-indented while the rule said tabs, so an
agent following "the style of the surrounding file" correctly produced the wrong thing.
Config without normalization would have left that contradiction standing; normalization
without config would have let it come back. Line endings were not governed by the repository
at all. `core.autocrlf=input` is set on this machine but did not prevent the drift: the four
CRLF files are stored that way in git, so every checkout everywhere received them. A
per-machine setting was never going to hold that line, which is what `.gitattributes` is for.

**Alternatives:** A formatter (Prettier) would enforce rather than advise, but it is a
dependency, a script, and a much larger diff, and it decides far more than indentation —
rejected as out of proportion to the problem. Leaving markdown on tabs was rejected outright:
it breaks list rendering. Keeping trailing whitespace in markdown to preserve the two-space
hard line break was rejected because that break is unused here, and an invisible significant
character is worse than the backslash form.

**Consequences:** `.editorconfig` advises, it does not enforce. With no linter and no CI
nothing rejects a violation, so tree and config stay in agreement by discipline alone. The
spaces inside the template literals of `ContextObjectExecuter.js:23-27` and
`ContextDeconstructorExecuter.js:33-37` are generated-code content, not indentation, and are
deliberately left alone — a blanket tab conversion would rewrite the code this package emits.
Any later bulk reformatting has to make the same exception. The normalization is one
mechanical commit touching nearly every file, so `git blame` across it needs `--ignore-rev`.

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
