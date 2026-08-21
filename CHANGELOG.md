# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Only what reaches a consumer of the package belongs here: the public api, the published
files, runtime dependencies, the supported environment. Build and test work stays out.
`DECISIONS.md` carries the reasoning, this file carries the effect.

Versions up to 2.0.4 predate this file — the git history is the record for those.

## [Unreleased]

### Removed

- **`esprima` is no longer a declared runtime dependency.** It was never imported — the two
  references in `src/executer/EsprimaExecuter.js` are commented out, the executer parses with
  `espree`. Nothing changes in an install: `escodegen` depends on `esprima` and still pulls
  it in.

### Fixed

- **The raw published sources could not be loaded as native ES modules.** `src/**`,
  `index.js`, `browser.js` and `browser-all-executers.js` all ship raw through the `files`
  array, and none of the three entries loaded without a bundler in front of them. Two
  independent reasons: `browser.js` and `browser-all-executers.js` imported a binding
  `Context` that `index.js` does not export, which a browser rejects with `SyntaxError: The
  requested module './index.js' does not provide an export named 'Context'`; and four imports
  carried no file extension — `./ExpressionResolver` and
  `@default-js/defaultjs-common-utils/src/ObjectUtils` in `src/ResolverContextHandle.js`,
  `@default-js/defaultjs-common-utils/src/Global` in both browser entries — which the browser
  and Node answer with `ERR_MODULE_NOT_FOUND`, because neither guesses the extension and the
  dependency's `exports` map takes the subpath literally. The second reason reached `index.js`
  as well, the entry `main` points at. The unused import is gone and the four extensions are
  in place; nothing else about any of the files changed, and the bundles are unaffected.

- **`browser.js` and `browser-all-executers.js` were published with an unresolved version
  placeholder.** Both files are part of the `files` array, so anyone importing the raw source
  instead of a bundle got `GLOBAL.defaultjs.el.VERSION === "${version}"`. The version now comes
  from the generated module `src/version.js`, which ships with the package, so the raw sources
  and the bundles report the same value.

- **The dependency on `@default-js/defaultjs-common-utils` was declared as `latest`.**
  It resolved to whatever happened to be published at install time and would have pulled
  a future major without any warning. The range is now `^1`.

- **The expression cache ran at a fifth of its configured size in three of four executers.**
  `WithScopedExecuter`, `ContextObjectExecuter` and `EsprimaExecuter` passed the cache option
  as `aSize` instead of `size`, so the intended 5000 entries never applied and all three fell
  back to the default of 1000 — trimming, and therefore recompiling, five times as often as
  designed. `ContextDeconstructorExecuter` was already correct. Expression-heavy pages hold
  more compiled expressions in memory now and recompile less.

- **The published `dist/` bundles did not match the bytes webpack produced.** `.gitattributes`
  applied `text=auto eol=lf` to the generated directory as well, so git normalized the CRLF
  pairs the bundled `@default-js/defaultjs-common-utils` sources bring with them — 771, 886 and
  771 bytes in the three development bundles. The published files therefore differed from every
  local build. `dist/**` is now excluded from line-ending conversion and ships exactly as built.
  The minified bundles and source maps were never affected.
