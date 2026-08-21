# Modernizing the build and test toolchain

**Project:** `@default-js/defaultjs-expression-language` v3.0.0
**Analysis as of:** 2026-08-14
**Status:** stages 0 to D green (2026-08-21), stage E dropped. Stage F is open in its
`webpack.config.js` half only; part 2 not started.

A plan, not a collection: the stages depend on each other, and that sequence is what the analysis below buys. Independent items belong in `BACKLOG.md`, settled questions in `DECISIONS.md`.

Update the status line of a stage the moment it goes green, together with the versions actually installed and any deviation from the intent.

**Retiring this document:** once part 2 is finished, this file has done its job and gets deleted. Whatever remains true beyond it — the Node floor, the `sideEffects` question, the shape of the version generation — moves into `DECISIONS.md` first.

---

## Guard rails

1. **Stabilize the webpack chain first** (part 1). No rework of the test infrastructure while the build is not current and green.
2. **Replace Karma afterwards** (part 2). Karma is deprecated but functional — the switch is a separate undertaking with its own verification.
3. Every stage ends with a green `npm run build` and `npm test`. No moving on from a red state.

---

## Starting point

| | |
|---|---|
| Node | v24.19.0 |
| npm | 12.0.2 |
| `npm audit` | **0** vulns in `dependencies`, **44** in `devDependencies` (3 critical: `tar`, `shell-quote`, `websocket-driver`) |
| Origin of the vulns | almost exclusively `puppeteer@16` and the Karma / `socket.io` chain |

The runtime dependencies are clean. Everything that needs doing sits in the toolchain.

### Findings from the analysis

- **`browser.js` is published with the placeholder still in it.** `replace-in-file-webpack-plugin` only patches `dist/`. Since `browser.js` and `browser-all-executers.js` are part of the `files` array, consumers importing the raw source literally receive `VERSION: "${version}"`. — *A shipping defect, fixed in stage C.*
- **Coverage is effectively dead.** The Karma preprocessor `"src/**/*.js": ["webpack", "coverage"]` never applies, because `files` loads `test/index.js` only; the sources reach the browser bundled.
- **Three devDependencies are unused:** `clean-webpack-plugin`, `terser-webpack-plugin`, `http-server`.
- **`esprima` is a dead runtime dependency** — in `src/executer/EsprimaExecuter.js` it appears only in a comment; what is actually used is `espree`.
- **The Karma configuration carries dead entries:** `test/data/**` and `test/templates/**` plus their `proxies` point at directories that do not exist. (`test/sites/` does exist, so `html2js` is still needed.)
- **The test code is migration-friendly:** only `describe` / `it` / `beforeAll` with `async` functions, no `done` callbacks, no `jasmine.*` globals; the only matchers used are `toBe`, `toBeDefined`, `toBeUndefined`.

---

## Part 1 — Stabilize the webpack chain

### Target versions

| Package | current | target | kind |
|---|---|---|---|
| `webpack` | 5.100.2 | **5.109.2** | minor — required peer (`^5.101.0`) for CLI 7 / WDS 6 |
| `webpack-cli` | 4.10.0 | **7.2.2** | 3 majors |
| `webpack-dev-server` | 4.15.2 | **6.0.0** | 2 majors |
| `copy-webpack-plugin` | 11.0.0 | **14.0.0** | 3 majors |
| `generate-license-file` | 4.0.0 | **4.2.1** | minor |
| `karma` | 6.4.4 | 6.4.4 | range `^6.3.4` → `^6.4.4` |
| `karma-chrome-launcher` | 3.2.0 | 3.2.0 | raise the range |
| `karma-coverage` | 2.2.1 | 2.2.1 | raise the range |
| `karma-firefox-launcher` | 2.1.3 | 2.1.3 | raise the range |
| `karma-webpack` | 5.0.1 | 5.0.1 | raise the range |
| `karma-sourcemap-loader` | 0.3.8 | **0.4.0** | minor |
| `karma-jasmine` | 4.0.2 | **5.1.0** | 1 major |
| `jasmine-core` | 3.99.1 *(transitive)* | **^6.3.0** | add explicitly — a peer as of `karma-jasmine@5` |
| `puppeteer` | 16.2.0 | **25.7.0** | 9 majors |
| `karma-html2js-preprocessor` | 1.1.0 | 1.1.0 | current |
| `karma-safari-launcher` | 1.0.0 | 1.0.0 | useless on Windows — optionally drop |
| `clean-webpack-plugin` | 1.0.1 | **remove** | unused → `output.clean: true` |
| `terser-webpack-plugin` | 5.3.14 | **remove** | unused, webpack 5 ships Terser |
| `http-server` | 14.1.1 | **remove** | unused, `webpack serve` covers it |
| `replace-in-file-webpack-plugin` | 1.0.6 | **replace** | unmaintained since 2019 → stage C |

`dependencies`:
`escodegen` 2.1.0 ✔ current · `esprima` → remove (stage B) · `espree` 10.4.0 → 11.2.0 possible, but that raises the runtime Node floor for consumers — a separate decision, tracked in `BACKLOG.md` · `@default-js/defaultjs-common-utils` ^1 ✔

### Relevant breaking changes

**webpack-cli 4 → 7**
- Node ≥ 20.9, webpack ≥ 5.101, `webpack-dev-server@4` no longer supported — hence the combined upgrade.
- `--node-env` removed in favour of `--config-node-env`; not used here ✔
- The config is loaded through a dynamic `import()` (falling back to `require`) — the CJS `webpack.config.js` stays valid as long as no `"type": "module"` is set.
- `--mode` and `--progress` in the scripts are unaffected ✔

**webpack-dev-server 4 → 6**
- **Node ≥ 22.15**, Express 5, `http-proxy-middleware` v4, `webpack-dev-middleware` v8, SockJS and `spdy` removed.
- CLI flags removed — the supported route is `webpack serve`, which is exactly what the scripts do ✔
- The existing `devServer` block (`open`, `allowedHosts`, `client.*`, `devMiddleware.*`, `static`, `watchFiles`) is valid under v6 unchanged. `proxy`, `https` and `http2` are not used → no migration needed.

**copy-webpack-plugin 11 → 14** — Node ≥ 20.9, webpack peer `^5.1.0`. The `patterns` / `noErrorOnMissing` API in use is unchanged.

**puppeteer 16 → 25** — Node ≥ 22.12. `puppeteer.executablePath()` still exists but now points into the Chrome-for-Testing cache (`~/.cache/puppeteer`). After the bump, verify that the path exists; for CI, set `PUPPETEER_CACHE_DIR` or add `npx puppeteer browsers install chrome` as a step.

**karma-jasmine 4 → 5 / jasmine 3 → 6** — low risk, see the finding on the test code.

### Stages

#### Stage 0 — Baseline

**Status:** **green, 2026-08-21** on `683bae8` (branch `v3`), Node v24.19.0 / npm 12.0.2.

- `npm test` — **122 of 122 passing**, Chrome Headless 105.0.5173.0 (the Chromium bundled
  with `puppeteer@16`). Runs on Node 24 despite the age of the launcher, so stage E is not
  forced forward.
- `npm run build` — exit 0, three warnings, all of them the asset size limit for
  `browser-all-executers-…min.js` (359 KiB > 244 KiB). Known and intended, see `DECISIONS.md`.
- `npm audit` — **44** (2 low, 16 moderate, 23 high, 3 critical) in `devDependencies`,
  **0** with `--omit=dev`. Identical to the analysis of 2026-08-14.
- Baseline archive: the freshly built `dist/` sits in the git ref **`refs/baseline/stage0`**
  (`e088ef2`, created with `git stash create` — no commit on `v3`, nothing in
  `git status`). Compare a later stage with
  `git diff refs/baseline/stage0 -- dist`, read a single file with
  `git show refs/baseline/stage0:dist/<name>`. Delete it when the plan is retired:
  `git update-ref -d refs/baseline/stage0`.

Sizes of the archived artifacts, in bytes:

| Artifact | dev | min | map |
|---|---|---|---|
| `browser-…` | 159 122 | 13 824 | 75 664 |
| `browser-all-executers-…` | 2 331 003 | 368 103 | 1 329 936 |
| `module-…` | 156 827 | 13 502 | 75 046 |

The committed `dist/` of `683bae8` predates the v3 sources and is therefore **not** the
baseline — a fresh build differs from it substantially (`browser-…min.js` 11 804 → 13 824
bytes). That is the executer work, not a toolchain effect.

Noticed while archiving, tracked in `BACKLOG.md`: the dev bundles carry 771 CRLF pairs from
the bundled `defaultjs-common-utils` sources, which `.gitattributes` normalizes away on
commit. Comparisons through `git diff` are unaffected — both sides are normalized — but a
byte comparison against a checked-out `dist/` is not.

#### Stage A — low-risk bumps

**Status:** **green, 2026-08-21** on `cdb66dc`. Installed exactly as intended, no deviation:
`webpack` 5.100.2 → **5.109.2**, `karma-sourcemap-loader` 0.3.8 → **0.4.0**,
`generate-license-file` 4.0.0 → **4.2.1**, and the ranges of `karma` (^6.3.4 → ^6.4.4),
`karma-chrome-launcher` (^3.1.0 → ^3.2.0), `karma-coverage` (^2.0.3 → ^2.2.1),
`karma-firefox-launcher` (^2.1.1 → ^2.1.3) and `karma-webpack` (^5.0.0 → ^5.0.1) raised to
what was already installed. `webpack-cli` 4 and `webpack-dev-server` 4 untouched — stage D.

- `npm test` — **122 of 122 passing**, unchanged.
- `npm run build:dev` / `build:prod` — both exit 0, same three asset-size warnings as in
  stage 0.
- `npm audit` — 44 → **42** (1 low, 16 moderate, 22 high, 3 critical), still **0** with
  `--omit=dev`. The bulk stays with puppeteer and the karma chain, as expected.

**Artifacts against the baseline:** every bundle grew by roughly 2 % —
`module-…min.js` 13 502 → 13 809, `browser-…min.js` 13 824 → 14 128,
`browser-all-executers-…min.js` 368 103 → 371 868 bytes. Cause identified: 5.109 emits an
additional `webpack/runtime/global` block that 5.100 did not, and the inline source map of
the dev bundles grows with it. A codegen change, not a defect.

One caveat on comparing: `refs/baseline/stage0` stores the bundles LF-normalized, the
working copy has them with CRLF (the `.gitattributes` finding in `BACKLOG.md`). Byte counts
taken from the ref are therefore up to ~900 bytes lower than the same file on disk. Use
`git diff` for comparisons, which normalizes both sides.

#### Stage B — clean up

**Status:** **green, 2026-08-21.** All four packages removed after confirming by grep that
nothing outside `package.json` and this plan mentions them:
`clean-webpack-plugin`, `terser-webpack-plugin`, `http-server` from `devDependencies`,
`esprima` from `dependencies`.

**Deviation — `output.clean: true` is wrong here and was not used as written.** Both modes
emit into the same `dist/`, dev first and prod second, so an unconditional clean lets the
prod run delete the dev bundles. Measured before changing anything: after `build:dev`
`dist/` held the three dev bundles, after the following `build:prod` only the six minified
artifacts were left. Since `dist/**` is part of the `files` array, that ships a package
without its unminified bundles.

What went in instead keeps the intent — webpack cleans, no third-party plugin — while each
mode only removes its own stale artifacts:

```js
clean: { keep: (asset) => (devMode ? asset.includes(".min.") : !asset.includes(".min.")) },
```

Verified with two planted files: `dist/stale-old.js` and `dist/stale-old.min.js`.
`build:dev` removed the first and kept the second, `build:prod` removed the second and kept
all dev bundles; all nine real artifacts survive the pair.

- `npm test` — **122 of 122 passing**.
- `npm run build:dev` / `build:prod` — both exit 0. The artifacts are **byte-identical in
  size to stage A**, as expected: `esprima` was never bundled.
- `npm audit` — 42 → **41** (1 low, 15 moderate, 22 high, 3 critical), **0** with `--omit=dev`.

`esprima` stays in `node_modules` regardless — `escodegen@2.1.0` depends on it. Only the
declared direct dependency is gone; `CHANGELOG.md` says so.

#### Stage C — rework versioning

**Status:** **green, 2026-08-21.** Implemented as described below, with two notes.

*CommonJS, not ESM.* `defaultjs-common-utils` writes its `scripts/generate-version.js` in ESM
because it carries `"type": "module"`. This package does not, so the script here is CJS — like
`webpack.config.js` and `karma.conf.js`. Whenever the `"type": "module"` question in
`BACKLOG.md` is settled, all three files are renamed to `.cjs` together.

*`src/version.js` is gitignored and still published.* Verified with `npm pack --dry-run`: the
tarball contains `src/version.js` (251 B, 31 files total). The `files` array is an allowlist
and outranks `.gitignore`, so the generated module reaches consumers.

**Verification:**

- Placeholder gone: a grep for the literal `${version}` over `dist/`, `src/`, `browser.js` and
  `browser-all-executers.js` finds nothing. `VERSION` reads `3.0.0` in `dist/browser-…js`,
  `dist/browser-…min.js` and `dist/browser-all-executers-…min.js`. The module bundle carries no
  `VERSION` — it never did, only the two browser entries define one.
- `src/version.js` deleted by hand, then `npm run build:dev`: the `prebuild:dev` hook
  regenerated it before webpack ran. The generator is idempotent — a second run prints
  `version.js is up to date` and leaves the file untouched.
- `npm test` — **122 of 122 passing**. `build:dev` and `build:prod` exit 0.
- `npm audit` — **41**, unchanged; `replace-in-file-webpack-plugin` carried no advisories of
  its own.

**Artifacts** (sizes with CRLF normalized away, against the stage A/B state in `ecaa9d6`): the
minified bundles are **byte-identical** — terser inlines the constant, which yields exactly what
the plugin used to patch in. The browser dev bundles grow by 1 546 and 1 560 bytes for the added
module plus its inline map, their `.min.js.map` by 258 and 369 bytes for the new source entry.
The module bundle is unchanged, it does not import `version.js`. Source maps now match their
content by construction: nothing rewrites the files after webpack emitted them.

`replace-in-file-webpack-plugin` steps outside webpack's asset pipeline and patches files in the `done` hook. The concrete problems:

- The published raw source `browser.js` keeps the placeholder (see the findings).
- The source maps in `dist/` no longer match their content after the patch.
- `dir: "dist"` is hardcoded and ignores the `--target` argument from `webpack.config.js`; every build additionally rescans all of `dist/`, including the artifacts of the other mode.

**Solution** — following the approach already taken in `defaultjs-common-utils`:

1. `scripts/generate-version.js` derives a `src/version.js` from `package.json` (`export const VERSION = "3.0.0";`).
2. `browser.js` and `browser-all-executers.js` import `VERSION` instead of using the placeholder.
3. A `pre*` chain in the scripts: `prebuild:dev`, `prebuild:prod`, `predev` call `generate:version`.
4. `replace-in-file-webpack-plugin` and its plugin block are dropped.
5. `src/version.js` goes into `.gitignore` (a generated artifact) but is still published through `src/**` in the `files` array.

*Alternative, `DefinePlugin`:* a smaller change, but it does not fix the raw-source defect — so it is not recommended.

**Verification:** `VERSION` is correct in `dist/*.js`, in `dist/*.min.js` **and** in `browser.js`. — done, see the status above.

#### Stage D — webpack majors

**Status:** **green, 2026-08-21**, with one item left to Frank (see below). Installed in one
step, as the peer chain demands: `webpack-cli` 4.10.0 → **7.2.2**, `webpack-dev-server`
4.15.2 → **6.0.0**, `copy-webpack-plugin` 11.0.0 → **14.0.0**. The peers check out against
what is installed — all three want `webpack ^5.101.0` or looser, and 5.109.2 satisfies it.

- `npm run build:dev` / `build:prod` — both exit 0, no deprecation notices from CLI 7. The
  CJS `webpack.config.js` loads unchanged under the new dynamic-import config loader.
- `npm test` — **122 of 122 passing**.
- **The artifacts are byte-identical to stage C**, all nine of them. The majors touch the
  driver, not the output.
- `npm audit` — 41 → **29** (1 low, 9 moderate, 18 high, 1 critical), **0** with `--omit=dev`.
  The single remaining critical now sits in the karma chain, which part 2 removes.

**Dev server, verified headless:** started with `webpack serve --mode=development --no-open
--port 9999`. WDS 6 comes up, logs `Content not from webpack is served from ./webcontent,
./src/css`, compiles in 348 ms and answers `GET /` with `WebContent/index.html` and
`GET /browser-defaultjs-expression-language.js` with the 576 KiB bundle. The `devServer`
block needed no migration, exactly as the analysis expected.

**Left for Frank:** overlay and live reload cannot be checked without a browser. Run
`npm run dev` once, change a file under `src/`, and confirm the page reloads and that a
deliberate syntax error shows the overlay.

Noticed while probing the server and written into `BACKLOG.md`: `WebContent/index.html`
asks for `defaultjs-expression-language.js`, which no build emits — the request answers 404,
so the demo page loads nothing. Pre-existing, unrelated to this stage.

#### Stage E — update the test toolchain

**Status:** **dropped, 2026-08-21** — decided by Frank after the stage D handover.

The stage would have installed `puppeteer@25`, `karma-jasmine@5` and `jasmine-core@6` —
exactly three of the packages part 2 step 6 uninstalls again, plus a Chrome-for-Testing
download that Vitest or Web Test Runner replaces with their own browser. Nothing it produces
outlives part 2.

Skipping it does not break the guard rails: guard rail 1 asked for a current and green
webpack chain before the test infrastructure is touched, and stage D delivered that. The test
gate stays the installed Karma 6.4.4 with `puppeteer@16` and `karma-jasmine@4` until the new
runner reaches parity — which is what part 2 step 1 ("set up side by side") intends anyway.
It runs green: 122 of 122, verified repeatedly across stages 0 to D.

Price: `npm audit` stays at **29** until part 2 removes the Karma chain, instead of dropping
in between. That is an intermediate state nobody ships.

The same reasoning applies to the `karma.conf.js` half of stage F — see there.

#### Stage F — modernize the configuration

**Status:** open, **reduced to the `webpack.config.js` half** (2026-08-21).

In `webpack.config.js`:
- `target: ["web", "es2022"]` instead of `target: "web"` — without a browserslist, webpack
  otherwise emits conservative, ES5-capable runtime helpers even though the sources ship
  untranspiled.
- `cache: { type: "filesystem" }` for faster dev builds.
- `CopyPlugin`: `src/css` does not exist; `noErrorOnMissing` swallows that. Keep it or drop it
  outright — but decide deliberately.
- Review `optimization.usedExports: false`. A `sideEffects` field in `package.json` (as in
  `defaultjs-common-utils`) would be cleaner than disabling tree shaking globally.

In `karma.conf.js` — **dropped for the same reason as stage E**: the file is deleted in part 2
step 6. The dead `test/data/**` and `test/templates/**` entries, their `proxies` and the
`karma-safari-launcher` plugin entry cost nothing while they sit there; cleaning a file that is
about to be removed buys nothing.

- **Do not repair coverage here** — part 2 takes care of it. Until then it is deliberately
  documented as known-broken.


#### Closing out part 1

**Status:** not started.

- Re-check `npm audit` (expectation: a clear drop, the remainder attributable to Karma).
- Regenerate `package-lock.json`.
- Run `npm run build:third-party-licence`.
- Diff the `dist/` artifacts against the stage 0 baseline.
- Document the Node requirement: from here on the toolchain needs **Node ≥ 22.15**. Do not put 22.15 into `engines` — `engines` applies to consumers as well. Use a README note and an `.nvmrc` instead.

---

## Part 2 — Replace Karma

**Status:** not started.

Starts only once part 1 is fully green.

### Why

Karma is deprecated by its own maintainers. The wording in the installed package
(`node_modules/karma/README.md`, 6.4.4): *"Karma is deprecated and is not accepting new
features or general bug fixes."* Critical security issues are still triaged, until 12 months
after Web Test Runner support in the Angular CLI is marked stable. Note what that does **not**
mean: npm carries no deprecation flag on the package, the last publish is 2024-11-06, and the
suite runs green on it today. Karma is abandoned, not broken — there is no emergency here.

Two things do push: the Karma chain accounts for the bulk of the remaining dev vulnerabilities
(29 after stage D, 0 of them in `dependencies`), and coverage is structurally broken in this
setup, which is goal 3 of the v3 cycle.

### Candidates — evaluated 2026-08-21

The earlier recommendation rested on migration cost ("the test files need no rewriting").
That is an effort argument, not a selection criterion, and Frank rejected it as a basis. What
follows are the properties that outlive the migration. **Decided 2026-08-21 in favour of
Vitest** — the entry with the reasoning is in `DECISIONS.md`; the measurements stay here until
this plan is retired.

**Measured footprint** — one scratch project per candidate, `npm i --ignore-scripts`,
browser driver counted separately (`playwright` alone: 3 packages, 19 MB):

| | packages | size | `npm audit` |
|---|---|---|---|
| `vitest` 4.1.11 + `@vitest/browser` + `@vitest/coverage-v8` | **71** | ~49 MB | 0 |
| `@web/test-runner` 1.0.0 + `-playwright` | **293** | ~58 MB | 0 |
| `jasmine-browser-runner` 5.0.0 (drags `selenium-webdriver`) | **48** | ~29 MB | 0 |

**1. Coverage — the criterion that eliminates.** Goal 3 asks the new runner to repair a
coverage setup that never worked.
- *Vitest*: first-party `@vitest/coverage-v8` and `@vitest/coverage-istanbul`, configured in
  the same file as the rest. V8 needs a Chromium-based browser.
- *Web Test Runner*: built in behind `--coverage`, native V8 instrumentation via Chromium,
  converted with `v8-to-istanbul`. Non-Chromium browsers need `babel-plugin-istanbul` — the
  detour this plan wanted to avoid.
- *jasmine-browser-runner*: nothing built in — the string `coverage` does not occur anywhere
  in the 5.0.0 package. **It is buildable, though** (corrected 2026-08-21, see the section on
  Jasmine plus nyc below); it costs glue we own rather than a dependency we install. Not a
  knock-out, but the sharpest difference to Vitest.

**2. Supply-chain surface — the axis this whole cycle is about.** Replacing a deprecated
runner with a **293-package** tree is a poor trade when the alternative costs 71. Both are
clean today; four times the packages is four times the future exposure and four times the
upgrade work. This is the strongest argument for Vitest and it has nothing to do with
assertions.

**3. Coupling.** Vitest *is* Vite — Vite majors drag it along, and Vite is at 8.2.2 today.
That is the same treadmill part 1 just spent its stages climbing off. Web Test Runner has no
bundler in the request path and rewrites only bare specifiers. A real point for WTR, and the
only one that survives scrutiny.

**4. Fidelity to the published shape — weaker than claimed.** The earlier note that WTR
"fits a pure ESM browser package conceptually" does not hold up: both runners rewrite bare
specifiers, so neither reproduces what a browser does with the raw sources. The real gap is
that no test loads `browser.js`, `browser-all-executers.js` or `index.js` at all — a hole in
the suite, fixable under any runner, and not a reason to pick one.

**Chosen: Vitest, for different reasons than first written.** It is the only candidate with
first-party coverage in the same configuration, and it costs a quarter of WTR's dependency
tree. The Vite coupling is the price, and it is real. That the 122 tests need no rewriting is
a footnote, not a reason.

### Pro and contra per candidate — including what webpack means here

Added 2026-08-21 after the question whether the webpack build constrains the choice.

**It does not, and the reason is measurable.** The loaded config has **no `module` key and no
`resolve` key** — no loaders, no aliases, no babel, no TypeScript; after stage C the plugin
array holds `CopyPlugin` alone. The build concatenates modules and minifies in production.
There is no transformation a test runner would have to reproduce. What "Jest fits webpack"
means in practice is Jest's `moduleNameMapper`, i.e. re-implementing webpack *resolution* —
aliases, CSS and asset imports, `resolve.extensions`. This project uses none of it. And the
only runner in the field that actually executes webpack is the one being replaced,
`karma-webpack`.

Two consequences worth stating plainly:

- After part 2 webpack leaves the test path entirely and does what it is for: producing
  `dist/`. That is a simplification, not a loss.
- What *is* lost is nothing, because it was never there: the current test bundle uses
  `test/index.js` as its entry, never `browser.js`, `browser-all-executers.js` or `index.js`.
  The published artifacts are not covered by a single test today. The fix is the same under
  every candidate — a smoke test that loads the built `dist/browser-…js` in a browser and
  checks `GLOBAL.defaultjs.el.VERSION`. That would, for the first time, test the webpack
  output rather than the sources.

**Footprint, measured the same way for all five** (scratch project, `npm i --ignore-scripts`,
total packages incl. transitive; `playwright` alone is 3 packages / 19 MB and is listed
separately where it is needed):

| Candidate | packages | size | `npm audit` | real browser |
|---|---|---|---|---|
| `jasmine-browser-runner` 5.0.0 | 48 | ~29 MB | 0 | yes, via selenium |
| `vitest` 4.1.11 + `@vitest/browser` + `coverage-v8` | 71 + 3 | ~49 MB | 0 | yes, via playwright |
| `@web/test-runner` 1.0.0 + `-playwright` | 293 + 3 | ~58 MB | 0 | yes, via playwright |
| `jest` 30.4.2 + `jest-environment-jsdom` | 336 | ~59 MB | 0 | **no**, jsdom |

#### Jest 30 + jsdom

*Pro:* the best-known runner, largest body of documentation and answers. Snapshot testing and
a mature mocking story, neither of which this suite uses. No browser binary to install, which
makes CI setup trivial.

*Contra:* **runs in Node against jsdom, not in a browser** — for a package whose stated target
environment is the browser, the subject under test would be a simulation. **ESM support is
still experimental**: the docs say "Jest ships with *experimental* support for ECMAScript
Modules" and require `--experimental-vm-modules`, on Node APIs Node itself marks experimental.
This package is pure untranspiled ESM — that is the single worst fit in the field. Largest
dependency tree of all five at **336 packages**. And it has no webpack relationship to trade
on: what would connect the two is `moduleNameMapper`, which only pays off for a webpack config
that resolves something special. Ours resolves nothing special.

#### Vitest 4, browser mode

*Pro:* only candidate with first-party coverage (`@vitest/coverage-v8`, `-istanbul`) in the
same configuration — goal 3 is the reason this migration exists. Second smallest tree at 71
packages, a quarter of Web Test Runner's. Runs the suite in a real Chromium via Playwright,
and keeps a jsdom mode available should a test ever not need a browser. `describe` / `it` /
`beforeAll` and `toBe` / `toBeDefined` / `toBeUndefined` exist unchanged — a footnote, not a
reason.

*Contra:* Vitest *is* Vite. Vite majors drag it along (8.2.2 today) — the same treadmill part 1
just climbed off, now in the test path. Tests then run through Vite's transform while
production runs through webpack; with zero loaders on either side that difference is small,
but it is not zero. Needs a Playwright browser download.

#### Web Test Runner 1.0

*Pro:* no bundler in the request path — serves files and rewrites bare specifiers, closest to
how a browser loads the raw published sources. Coverage built in behind `--coverage`, native
V8 via Chromium, converted with `v8-to-istanbul`. Reached 1.0 on 2026-07-07 after years at
0.x, which is a stability signal. Seven browser launchers, including the Puppeteer one already
installed here.

*Contra:* **293 packages** — four times Vitest, on the very axis that triggered this whole
cycle. Mocha + Chai means `beforeAll` becomes `before` and all three matchers get rewritten
across 12 files and 122 tests; not expensive, but mechanical edits to assertions are exactly
where a suite silently loses its teeth. Coverage on non-Chromium browsers needs
`babel-plugin-istanbul`, the detour this plan set out to avoid.

#### jasmine-browser-runner 5

*Pro:* smallest tree at 48 packages. Not one line of the suite changes — same Jasmine, same
matchers. Runs in a real browser, has an `--esm` mode that loads specs as native ES modules,
the highest fidelity in the field. Named first in Karma's own deprecation notice.

*Contra:* no coverage out of the box — instrumentation, extraction and reporting are ours to
build and maintain (the pipeline is sketched below; it works, it is just code we own forever).
Drags `selenium-webdriver`, so a browser and a matching driver have to be present, where
Playwright manages its own binaries. No watch mode that reruns on change, no parallelism,
thinner reporter and IDE tooling.

#### Staying on Karma

*Pro:* zero work, runs green today, is the only setup that executes the actual webpack config
in the test path. Security fixes still triaged.

*Contra:* deprecated by its maintainers, no features and no general bug fixes, and the source
of most of the 29 remaining dev vulnerabilities. Coverage is structurally broken here and will
not be repaired — the preprocessor never applies, because `files` loads `test/index.js` only.

**Ranking against the goals of this cycle** — real browser, ESM without ceremony, working
coverage, small surface: Vitest, then Web Test Runner, then jasmine-browser-runner. Jest comes
last, and webpack does not change that, because the build has nothing for a runner to match.

### If Vitest is chosen: what Vite has to do with it, and what it does not

Recorded 2026-08-21, from the question whether picking Vitest forces a move off webpack.

**Vite comes along, unavoidably.** `vite` is a direct dependency of `vitest`
(`^6.0.0 || ^7.0.0 || ^8.0.0`), not an optional peer — 8.2.2 lands in `node_modules` the
moment Vitest is installed. Worth knowing what that is today: Vite 8 no longer bundles with
Rollup or esbuild, its only bundler dependency is **`rolldown` ~1.2.4**, a Rust rewrite with a
Rollup-compatible API.

**No `vite.config.js` is required.** A standalone `vitest.config` using `defineConfig` from
`vitest/config` is the documented path for projects that do not otherwise use Vite. Vite acts
as the transform and serving engine underneath the test run; it does not become the project's
build tool by being present. Note the file will need to be `.mjs`, or the `"type": "module"`
question from `BACKLOG.md` has to be settled first — the same knot as `scripts/generate-version.js`.

Concretely, adopting Vitest means: `vitest`, `@vitest/browser`, `@vitest/browser-playwright`
(providers are separate packages as of Vitest 4), `@vitest/coverage-v8` and `playwright` as
devDependencies; one `vitest.config.mjs` with `test.browser.enabled`, `.provider`,
`.instances` and `.headless`; `test/setup.js` wired in as `setupFiles`; `test/index.js` and
its chain of folder `index.js` files dropped in favour of file discovery; `npm test` pointing
at `vitest run` and `test:live` at `vitest`.

**Should the build move to Vite as well? Not as part of this plan.** The arguments both ways:

*For, later:* two bundlers in one repo is real duplication, and it is the source of the one
honest contra against Vitest — tests transformed by Vite, production bundled by webpack. Vite's
library mode covers what is needed here in principle: several entries, minified and
unminified, source maps, controllable file names.

*Against, now:* nothing about webpack is broken. Part 1 just brought it current — 5.109.2,
zero vulnerabilities, both builds green, artifacts compared byte for byte across four stages.
Swapping the bundler changes every file in `dist/`, and `dist/` is published and committed, so
it is a consumer-visible change needing its own verification, not a side effect of a test
migration. The replacement bundler would be rolldown at 1.x. And webpack is not in the test
path any more once part 2 is done, so the duplication costs upgrade attention, not
correctness.

**Settled 2026-08-21:** keep webpack for now; the move to Vite is a separate undertaking to be
opened only after part 2 is green. Tracked as an open question in `BACKLOG.md`, with its own
plan and its own `DECISIONS.md` entry when the time comes.

### Can Jasmine do coverage with nyc/istanbul? Yes — and here is the price

Checked 2026-08-21 by reading `jasmine-browser-runner` 5.0.0 itself, after the earlier claim
that missing coverage rules it out. That claim was too strong.

Two documented hooks make it work:

- **`middleware`** (`lib/server.js:158`, documented in `lib/types.js:162`) — a map from path to
  Connect-style middleware, mounted on the runner's own server. An endpoint like
  `/__coverage__` can receive the coverage object from the browser.
- **`runSpecs(options, deps)`** (`index.js:73`) takes the webdriver as a dependency, and the
  runner already uses `driver.executeScript` internally (`lib/runner.js:4`). Supplying your own
  driver lets you read `window.__coverage__` after the run instead of posting it.

Together with `srcDir` / `srcFiles` (`lib/types.js:84`, `:91`), which decide what the server
serves, the pipeline is:

1. `nyc instrument src <instrumented>` — istanbul instrumentation, directory layout preserved,
   because the sources are pure ESM with relative `.js` imports. The generated `src/version.js`
   has to be in the copy too.
2. Point `srcDir` at the instrumented copy instead of `src`.
3. Extract `window.__coverage__` — either a spec helper that posts it in an `afterAll` to a
   `middleware` endpoint, or your own webdriver plus `executeScript` after `runSpecs`.
4. Write it to `.nyc_output/out.json`, then `nyc report --reporter=html --reporter=lcov`.

`nyc` is at 18.0.0 (2026-02-25) and maintained, so the tooling is not the problem.

**The price** is that steps 1, 3 and 4 are ours: two devDependencies, a config file, a spec
helper and a script, in the order of 50 to 80 lines. It has to keep working across Jasmine,
nyc and selenium upgrades, and it is the same shape of detour `defaultjs-common-utils` already
took with `babel-plugin-istanbul`. Against that, Vitest is one devDependency and
`coverage: { provider: "v8" }` in a config that already exists, with no instrumentation step
between the source and the browser.

**So the choice is narrower than the earlier write-up suggested:** do we want coverage as a
feature we install, or as glue we own? Everything else favours Jasmine slightly — 48 packages
against 74, not one test line changed, an `--esm` mode that serves specs as native ES modules,
and no bundler in the test path at all, which is the closest any candidate gets to how this
package actually ships. Vitest buys coverage, a watch mode, parallelism and the larger
ecosystem, and pays for it with Vite in the tree.

### Two findings from the evaluation

- **`test/sites/browser-setup.html` is dead.** Its content is `<div></div>`, it is referenced
  only by `karma.conf.js` (`files` and the `html2js` preprocessor), and no test reads
  `window.__html__`. Step 3 below is struck — there is nothing to sort out, for any candidate.
- **`test/setup.js:1` imports `Context` from `../index.js`, which does not export it.** Same
  defect as in `browser.js`, tracked in `BACKLOG.md`. webpack swallows it; a runner that links
  real ES modules will not. Whichever runner wins, this is the first thing that breaks on
  migration — fix it before, not during.

### Stages

**Status: steps 1 to 5 done, 2026-08-21. Step 6 is open and blocking — see below.**

1. **Set up side by side** — done. `vitest` 4.1.11, `@vitest/browser`,
   `@vitest/browser-playwright`, `@vitest/coverage-v8` and `playwright` 1.62.1 as
   devDependencies, Chromium downloaded into the Playwright cache outside the repository.
   New `vitest.config.mjs`, new scripts `test:vitest`, `test:vitest:live`,
   `test:vitest:coverage`.
2. **Adapt the test entry** — done. `test/setup.js` is wired in through `setupFiles`, file
   discovery runs off `test/**/*Test.js`, which finds exactly the 12 files the `index.js`
   chain used to import. `test/index.js` and the folder `index.js` files are obsolete but
   still present; they go with step 6.
3. ~~Sort out `test/sites/**/*.html`~~ — struck, the fixture is dead.
4. **Verify parity** — **122 of 122 passing under Vitest**, the same number Karma reports.
   By name as well: the diff over `test/` adds one import line per file and replaces one
   `jasmine.*` call; not a single test or suite name changes. Runtime 9.2 s against Karma's
   16.2 s.
5. **Enable coverage** — done, and this is the first time it measures anything in this
   repository: statements 78.21 % (316/404), branches 64.70 % (132/204), functions 75.26 %
   (70/93), lines 82.87 % (300/362). `@vitest/coverage-v8`, html and lcov into `coverage/`.
   Goal 3 of the v3 cycle is unblocked.
6. **Remove Karma** — open. `karma`, the seven `karma-*` packages, `jasmine-core`,
   `puppeteer`, `karma.conf.js`, `test/index.js` with its folder `index.js` chain, and
   `test/sites/`. `test` points at `vitest run`, `test:live` at `vitest`.
7. **Final `npm audit`** — open, follows step 6.

### Two corrections to the analysis, found while doing the work

**`globals: true` is not usable here, and that ends the side-by-side phase early.** The suite
uses the bare identifier `test` as its example of an *undefined* variable
(`resolve("${test}", {})` is expected to yield `undefined`), and one `afterAll` calls
`delete global.test`. With Vitest's globals switched on, `test` on `window` is Vitest's own
test function: six tests failed, and the `delete` would have removed the runner's API
mid-run. The fix is `globals: false` plus one explicit
`import { describe, it, expect, beforeAll, afterAll } from "vitest"` per test file — all 12
use exactly those five.

That import is also what breaks Karma: webpack resolves `vitest` and the bundle throws before
a single spec registers, so `npm test` is **red** right now. Steps 1 to 4 assumed both runners
could share the files, which only holds if `globals: true` works. It does not. There is no way
back to side by side, so step 6 is not optional polish any more — it is what makes the test
gate green again.

**The suite does use `jasmine.*` after all.** The analysis at the top of this plan claims it
does not; `test/ExecuterTests/WithScopedExecuterTests/ResolverChainTest.js:5` set
`jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000`, which made the whole file fail to collect under
Vitest and cost 10 tests. Replaced by the suite option `describe("Resolver chain",
{ timeout: 120000 }, ...)`. The suite also uses `afterAll`, which the analysis and `AGENTS.md`
both omit. Neither changed the outcome of the runner choice, but `AGENTS.md` needs its Tests
section rewritten once step 6 lands.

After this step `karma-webpack` is gone too; Vitest bundles on its own. That reduces webpack to its actual job: producing the `dist/` artifacts.
