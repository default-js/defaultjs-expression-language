# Backlog

Open items and findings for `@default-js/defaultjs-expression-language`.

Three kinds of entry live here: defects noticed while working on something else, open questions that need a decision, and work that was agreed but not implemented yet.

One paragraph each — where it is, what is wrong or undecided, what it costs. Enough to act on months later without asking anyone. Entries are written the moment they come up, not at the end of a session, because a session can end at any point. They are deleted once done; git history is the archive.

Anything that affects consumers of the package additionally belongs in the [issue tracker](https://github.com/default-js/defaultjs-expression-language/issues); that call is Frank's.

Entries here are independent of each other. The one undertaking with a forced order — the toolchain modernization — is tracked in `plans/toolchain-modernization.md` instead, and that file is deleted once it is finished.

---

- [ ] **The `CodeCache` size option is silently ignored in three of four executers.**
  `src/executer/WithScopedExecuter.js:6`, `src/executer/ContextObjectExecuter.js:6` and
  `src/executer/EsprimaExecuter.js:16` construct `new CodeCache({ aSize: 5000 })`, but the
  option is named `size` (`src/CodeCache.js:32`). The intended 5000 never applies; those
  caches run at the default of 1000 and trim five times as often as designed.
  `src/executer/ContextDeconstructorExecuter.js:16` gets it right — which is what confirms
  the intended name. Found 2026-08-20.

- [ ] **Decide on `"type": "module"` plus an `exports` field — and what it does to the executer import path.**
  `defaultjs-common-utils` already went this way, so the two packages diverge today. The
  catch: reaching a non-default executer — and with it `setupExecuter(options)` — is done by
  importing its module directly, e.g.
  `@default-js/defaultjs-expression-language/src/executer/EsprimaExecuter.js`. That is the
  intended usage (see `DECISIONS.md`, 2026-08-20) and works only because there is no
  `exports` field. An `exports` field must therefore whitelist `./src/executer/*`, or every
  consumer following the intended pattern breaks. Open alongside it: tuning the *default*
  executer needs the same deep import even though the consumer never imported that module —
  decide whether that stays as is or gets a documented entry point. Not to be mixed into the
  toolchain work; the outcome belongs in `DECISIONS.md`. Found 2026-08-20.

- [ ] **Decide whether to move `espree` 10 → 11.**
  Version 11 raises the **runtime** Node floor for consumers of this package to
  `^20.19 || ^22.13 || >=24`. That is a compatibility decision about the published package,
  not a toolchain bump, so it stays out of the modernization stages. `espree` is only pulled
  in by `EsprimaExecuter`, which is not registered by default — weigh the reach of the change
  against that. The outcome belongs in `DECISIONS.md`. Found 2026-08-20.

- [ ] **`webpack.config.js` refers to `./webcontent`, the directory is `WebContent`.**
  `devServer.static` and `devServer.watchFiles` both use the lowercase spelling
  (`webpack.config.js:57`, `:59`). Windows resolves it, a case-sensitive filesystem will
  not — `npm run dev` would serve nothing on Linux or macOS. Found 2026-08-20.

- [ ] **Decide what happens to Dependabot while the v3 cycle runs.**
  Four branches sit on origin — `engine.io-6.2.1`, `json5-2.2.3`, `ua-parser-js-0.7.33`,
  `webpack-5.76.0` — the newest from 2023-03-15, all opened against `master`, all for
  devDependencies of the old toolchain. `plans/toolchain-modernization.md` sets the target
  versions itself, so the pull requests contradict the plan rather than help it. They no
  longer reach the documentation app now that its version selector runs off tags, so this
  is only about noise: close them and pause Dependabot until after the 3.0.0 release, or
  leave them. Found 2026-08-21.

- [ ] **Every code example in `README.md` uses a default import that does not exist.**
  All examples read `import ExpressionResolver from "@default-js/defaultjs-expression-language"`,
  but `index.js:5` exports only named bindings — `export { ExpressionResolver, ExecuterRegistry }`.
  The default import resolves to `undefined`, so every example in the readme fails at the first
  call. Present since 1.0.0, so not a v3 regression. Two of the examples are additionally
  unbalanced (`README.md:70-78`: the object literal and the argument list are never closed).
  This is goal 4 territory — the readme is what an AI system reads to learn the package, and
  right now it teaches a broken call. Alongside the fix: the readme documents none of v3
  (`ExecuterRegistry`, executers, `setupExecuter`, resolver chains, scopes). Found 2026-08-21.

- [ ] **`.gitattributes` normalizes line endings inside the generated bundles.**
  `* text=auto eol=lf` (`.gitattributes:3`) applies to `dist/**` as well. The development
  bundles contain 771 CRLF pairs — measured in
  `dist/browser-defaultjs-expression-language.js` — that come from the bundled
  `@default-js/defaultjs-common-utils` sources, whose own files ship with CRLF
  (`ObjectUtils.js` alone contributes 619). Committing a fresh build therefore stores
  different bytes than webpack produced, and the published `dist/` differs from the local
  build for every consumer. The occurrences seen so far sit in comments, so nothing breaks
  today; a CRLF inside a template literal of a future dependency version would.
  `dist/** -text` next to the existing `linguist-generated=true` settles it — the directory
  is already declared generated. Costs nothing beyond one line, but it changes tracked
  bytes, so it should not be mixed into a toolchain stage. Found 2026-08-21 during stage 0.

- [ ] **`browser.js` and `browser-all-executers.js` import a binding that does not exist.**
  Both start with `import { ExpressionResolver, Context, ExecuterRegistry } from "./index.js"`
  (`browser.js:1`, `browser-all-executers.js:1`), but `index.js:5` exports only
  `ExpressionResolver` and `ExecuterRegistry`. `Context` is never used in either file, so
  webpack drops it without even a warning — but both files are published raw through the
  `files` array, and native ESM refuses the module outright: `SyntaxError: The requested
  module './index.js' does not provide an export named 'Context'`, verified against Node 24.
  A consumer loading `browser.js` with a plain `<script type="module">` therefore gets
  nothing. Deleting the word `Context` fixes it; the open question is whether a `Context`
  export was meant to exist — `src/ResolverContextHandle.js` is not exported anywhere today.
  Found 2026-08-21 during stage C.

- [ ] **`WebContent/index.html` loads a bundle that no build produces.**
  The page — the only thing `npm run dev` has to show — contains
  `<script type="text/javascript" src="defaultjs-expression-language.js">`
  (`WebContent/index.html:6`), but the three emitted assets are `browser-…`,
  `browser-all-executers-…` and `module-…`, all prefixed by their entry name. Requested
  against the running dev server the path answers **404**, verified 2026-08-21; the page
  loads nothing at all. The classic `<script>` tag itself is right — webpack emits an IIFE,
  no `output.library` and no `outputModule`, so `browser-…js` is a plain script that sets
  `GLOBAL.defaultjs.el`. Only the filename is wrong. Whoever fixes this should decide what
  the page is meant to demonstrate — right now it has no content beyond the script tag.
  Found during stage D.
