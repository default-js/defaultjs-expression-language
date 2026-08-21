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

## 2026-08-21 — Which Node version does this project need, and does it go into `engines`?

**Decision:** The toolchain needs **Node ≥ 22.15, and not Node 23**. That floor is recorded in
`.nvmrc` (which names 24, the version developed against) and in the Development section of
`README.md`. **`engines` stays unset.**

**Reasoning:** Read off the installed tree rather than assumed: `webpack-dev-server@6` declares
`>= 22.15.0`, the highest floor among all dependencies. `vitest@4` declares
`^20.0.0 || ^22.0.0 || >=24.0.0`, which is what excludes 23. Everything else sits lower —
`webpack-cli` at `>=20.9.0`, `playwright` at `>=20`, `webpack` at `>=10.13.0`.

`engines` is npm's field for *consumers*: it is checked when someone installs this package, not
when we build it. This library targets the browser, ships untranspiled ESM, and does not care
which Node produced the tarball. Putting a build-time requirement there would refuse or warn on
installs that are perfectly fine. The only runtime floor that could legitimately go in comes
from `espree` (`^18.18.0 || ^20.9.0 || >=21.1.0`), and it applies solely to consumers who reach
for `EsprimaExecuter` under Node — a narrow enough case that a documented note beats a hard
constraint.

**Alternatives:** Setting `engines` with the toolchain floor would make CI failures louder at
the cost of every consumer. Setting it to the `espree` range would be defensible if the esprima
executer were the default; it is not (see the entry of 2026-08-20).

**Consequences:** Nothing enforces the floor. A contributor on Node 20 gets a failure from
`webpack-dev-server` rather than from npm, and on Node 23 one from Vitest. `.nvmrc` and the
readme are the only signposts, so both have to be updated when the floor moves.

---

## 2026-08-21 — How does the package version get into the code?

**Decision:** `scripts/generate-version.js` derives `src/version.js` from `package.json` before
every build, wired in through `prebuild:dev`, `prebuild:prod` and `predev`. The browser entry
points import `VERSION` from it. `src/version.js` is generated, therefore gitignored, and
published anyway.

**Reasoning:** The previous approach patched `${version}` into the emitted files with
`replace-in-file-webpack-plugin`, after webpack had finished. Three defects followed from that:
the published raw sources `browser.js` and `browser-all-executers.js` kept the literal
placeholder, because the plugin only rewrote `dist/`; the source maps no longer matched their
content, because bytes changed after they were generated; and the hardcoded `dir: "dist"`
rescanned the other mode's artifacts on every build. Generating a module instead makes the
version a normal import — bundled, minified and mapped like any other code, with nothing
touching the output afterwards.

That a gitignored file still reaches consumers was verified, not assumed: `npm pack --dry-run`
lists `src/version.js` in the tarball. The `files` array is an allowlist and outranks
`.gitignore`.

The script is CommonJS because this package has no `"type": "module"`. When that question is
settled it is renamed to `.cjs` together with `webpack.config.js`.

**Alternatives:** `DefinePlugin` is a smaller change but fixes only the bundles, leaving the raw
published sources broken — which was the worst of the three defects. Checking `src/version.js`
into git, as `defaultjs-common-utils` does, avoids a generated file being absent in a fresh
clone before the first build; the cost is a generated artifact in the diff of every release.

**Consequences:** A fresh clone has no `src/version.js` until something builds. Nothing imports
it outside the two browser entries, so tests are unaffected, but any future importer must be
aware. The version now has to be right in `package.json` before a build, not before a publish.


## 2026-08-21 — Do we enable tree shaking for the `dist/` bundles?

**Decision:** No. `optimization.usedExports: false` stays in `webpack.config.js`, and a
`sideEffects` field must **not** be added to `package.json` — at least not as `false`. Both
were reviewed as part of stage F of the toolchain plan, which suggested the opposite; the
measurements below overruled it.

**Reasoning:** Two experiments, each a build followed by a look at what came out.

*Dropping `usedExports: false`* guts the module bundle. `dist/module-…min.js` falls from
13 809 to 3 685 bytes, and `resolveText`, `defaultExecuter`, `ResolverContextHandle` and
`DefaultValue` are gone from it — only the executer registration survives. The cause is not
tree shaking misbehaving: the `module` entry has no `output.library`, so webpack correctly
concludes that nothing consumes the entry's exports and prunes everything reachable only
through them. The browser entries are unaffected, because their code sets
`GLOBAL.defaultjs.el` as a side effect rather than through exports.

*Adding `sideEffects: false`* is worse. `dist/browser-…min.js` drops from 13 403 to 8 126
bytes, and the bundle loses `context-object-executer`, `context-deconstruction-executer` and
`esprima-executer` — two of the three default executers and the optional one. Every executer
registers itself through a bare `import "./XExecuter.js"` in `src/executer/index.js`;
declaring the package free of side effects tells every bundler, ours and the consumers', that
those imports may be discarded.

Both were confirmed the other way too: with the current settings a Playwright smoke test
loads each built browser bundle in Chromium and finds `VERSION` 3.0.0, the three default
executers registered, `esprima-executer` absent from the small bundle and present in the
all-executers one, and `resolveText("${1 + 1}")` returning `"2"`.

**Alternatives:** Tree shaking becomes worth revisiting the moment the `module` entry gets an
`output.library`, or is dropped — bundler consumers reach the package through `main`, which
points at the raw `index.js`, not at `dist/`. A `sideEffects` field could be introduced as an
*array* whitelisting the self-registering modules (`./src/executer/*.js`, `./browser.js`,
`./browser-all-executers.js`); `false` is the value that must never appear. Both are tracked
in `BACKLOG.md`.

**Consequences:** The bundles carry unused exports of `@default-js/defaultjs-common-utils`,
which is what the roughly 10 KB difference in the module bundle is. That is the price of
correctness here, and it is paid only by consumers of `dist/`, not by those importing `src/`.
The `usedExports: false` line is load-bearing and carries a comment saying so, in the same
way as the commented-out esprima import in `src/executer/index.js`.


## 2026-08-21 — Which test runner replaces Karma?

**Decision:** Vitest 4 in browser mode, with Playwright/Chromium as the provider and
`@vitest/coverage-v8`. Karma, the seven `karma-*` packages, `jasmine-core`, `puppeteer` and
`karma.conf.js` go once the new suite reaches parity. webpack stays the bundler and keeps
doing what it is for: producing `dist/`.

**Reasoning:** Karma is deprecated by its own maintainers — *"Karma is deprecated and is not
accepting new features or general bug fixes"* (`node_modules/karma/README.md`, 6.4.4) — and
coverage in that setup never worked, which is goal 3 of the v3 cycle. Four candidates were
measured the same way (scratch project, `npm i --ignore-scripts`, packages including
transitive, browser driver counted separately):

| Candidate | packages | size | real browser |
|---|---|---|---|
| `jasmine-browser-runner` 5.0.0 | 48 | ~29 MB | yes, via selenium |
| `vitest` 4.1.11 + browser + `coverage-v8` | 71 + 3 | ~49 MB | yes, via playwright |
| `@web/test-runner` 1.0.0 + `-playwright` | 293 + 3 | ~58 MB | yes, via playwright |
| `jest` 30.4.2 + `jest-environment-jsdom` | 336 | ~59 MB | no, jsdom |

Two properties decided it. **Coverage as a feature rather than as glue:** Vitest is one
devDependency and `coverage: { provider: "v8" }`, with no instrumentation step between source
and browser. **Surface:** 71 packages against Web Test Runner's 293, on exactly the axis that
started this cycle — 44 dev vulnerabilities, none of them in `dependencies`.

What explicitly did *not* decide it: that the 122 tests need no rewriting. That is an effort
argument, and effort is not a selection criterion. It survives only as a footnote.

**Alternatives:** *Jest* is out on substance, not on taste — it runs in Node against jsdom, and
this package's target environment is the browser; its ESM support is still documented as
experimental and needs `--experimental-vm-modules`, for a package that is pure untranspiled
ESM. That webpack is the bundler changes nothing in its favour: the config has no `module` and
no `resolve` key, so `moduleNameMapper`, the thing that connects Jest to a webpack setup, has
nothing to map. *Web Test Runner* is the better fit on paper — no bundler in the request path —
and would win if its dependency tree were not four times the size. *jasmine-browser-runner* is
the close second and would become the better choice if owning ~50-80 lines of coverage glue
(`nyc instrument`, extraction through its `middleware` hook or its own webdriver, `nyc report`)
ever looks cheaper than carrying Vite: it is the smallest tree, needs no change to a single
test, and its `--esm` mode serves specs as native ES modules, the closest any candidate gets to
how this package ships.

**Consequences:** `vite` enters the tree as a direct dependency of `vitest` (`^6 || ^7 || ^8`,
currently 8.2.2), and with it `rolldown` — Vite 8 no longer bundles with Rollup or esbuild.
Vite majors will drag Vitest along, which is the treadmill part 1 just climbed off, now in the
test path. Tests are transformed by Vite while `dist/` is bundled by webpack; with zero loaders
on either side the difference is small, but it is not nothing, and it is the standing argument
for eventually moving the build to Vite as well — tracked in `BACKLOG.md`, deliberately not
part of this decision. No `vite.config` is required; a standalone `vitest.config.mjs` using
`defineConfig` from `vitest/config` is the documented path. The config file has to be `.mjs`
until the `"type": "module"` question is settled.

The measurements and the full pro/contra per candidate were recorded in the toolchain
modernization plan; that plan was retired on 2026-08-21, so the git history up to commit
`6ca1a4c` is where they live now.


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
