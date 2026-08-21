# Modernizing the build and test toolchain

**Project:** `@default-js/defaultjs-expression-language` v3.0.0
**Analysis as of:** 2026-08-14
**Status:** stage 0 green (2026-08-21). Stages A–F of part 1 open, part 2 not started.

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

**Status:** not started.

`webpack` 5.109.2, all `karma*` ranges, `karma-sourcemap-loader` 0.4, `generate-license-file` 4.2.1.
→ `npm i`, build and tests.

#### Stage B — clean up

**Status:** not started.

- Remove `clean-webpack-plugin`, `terser-webpack-plugin`, `http-server` from `devDependencies`.
- Remove `esprima` from `dependencies`.
- Add `output.clean: true` to `webpack.config.js`.
→ Build and tests.

#### Stage C — rework versioning

**Status:** not started.

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

**Verification:** `VERSION` is correct in `dist/*.js`, in `dist/*.min.js` **and** in `browser.js`.

#### Stage D — webpack majors

**Status:** not started.

Install `webpack-cli@7`, `webpack-dev-server@6` and `copy-webpack-plugin@14` **together** (peer chain).
Verification: `npm run build:dev`, `npm run build:prod`, and one interactive `npm run dev` against `WebContent/` (overlay, reload, static serving).

#### Stage E — update the test toolchain

**Status:** not started.

`puppeteer@25`, `karma-jasmine@5`, `jasmine-core@6` (new).
Verification: check the Chrome cache path, `npm test` headless, one interactive `npm run test:live`.

#### Stage F — modernize the configuration

**Status:** not started.

In `webpack.config.js`:
- `target: ["web", "es2022"]` instead of `target: "web"` — without a browserslist, webpack otherwise emits conservative, ES5-capable runtime helpers even though the sources ship untranspiled.
- `cache: { type: "filesystem" }` for faster dev builds.
- `CopyPlugin`: `src/css` does not exist; `noErrorOnMissing` swallows that. Keep it or drop it outright — but decide deliberately.
- Review `optimization.usedExports: false`. A `sideEffects` field in `package.json` (as in `defaultjs-common-utils`) would be cleaner than disabling tree shaking globally.

In `karma.conf.js`:
- Remove `test/data/**` and `test/templates/**` from `files`, delete the matching `proxies`.
- Drop `karma-safari-launcher` from `plugins` if the package goes.
- **Do not repair coverage here** — part 2 takes care of it. Until then it is deliberately documented as known-broken.

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

Karma is officially deprecated and accounts for the bulk of the remaining dev vulns (`socket.io`, `engine.io`, `ws`, `websocket-driver`). On top of that, coverage is structurally broken in this setup.

### Recommendation: Vitest 4 in browser mode

The reason comes from the test suite itself: it uses only `describe` / `it` / `beforeAll` and the matchers `toBe`, `toBeDefined`, `toBeUndefined` — all of which exist identically in Vitest. The test files therefore **need no rewriting**.

The contender, `@web/test-runner`, fits a pure ESM browser package conceptually well, but uses Mocha + Chai (`before` instead of `beforeAll`, `expect(x).to.equal(...)`), which forces a rewrite of every assertion for no discernible gain.

The tests touch `document` and `document.location`, so they need a real browser → Vitest browser mode with Playwright/Chromium, not the Node/jsdom variant.

### Stages

1. **Set up side by side:** add Vitest next to Karma, browser provider Playwright, Chromium headless. New script `test:vitest`; `test` stays on Karma for now.
2. **Adapt the test entry:** wire `test/setup.js` in as a Vitest setup file; `test/index.js` as a collecting import is replaced by Vitest's file discovery (`test/**/*Test.js`).
3. **Sort out `test/sites/**/*.html`:** on the Vitest side this replaces the `html2js` preprocessor — either as a fixture import or via the equivalent of `page.setContent`, depending on how it is used.
4. **Verify parity:** identical count and names of passing tests in both runners.
5. **Enable coverage:** `@vitest/coverage-istanbul` or `-v8` — this settles the finding above for good, without the `babel-plugin-istanbul` detour `defaultjs-common-utils` had to take.
6. **Remove Karma:** `karma`, `karma-*` (7 packages), `jasmine-core`, `puppeteer`, `karma.conf.js`. Point `test` at Vitest, `test:live` at `vitest --watch`.
7. **Final `npm audit`** — expectation: no dev vulns left, or close to none.

After this step `karma-webpack` is gone too; Vitest bundles on its own. That reduces webpack to its actual job: producing the `dist/` artifacts.
