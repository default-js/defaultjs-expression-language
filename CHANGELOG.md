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

- **`browser.js` and `browser-all-executers.js` were published with an unresolved version
  placeholder.** Both files are part of the `files` array, so anyone importing the raw source
  instead of a bundle got `GLOBAL.defaultjs.el.VERSION === "${version}"`. The version now comes
  from the generated module `src/version.js`, which ships with the package, so the raw sources
  and the bundles report the same value.

- **The dependency on `@default-js/defaultjs-common-utils` was declared as `latest`.**
  It resolved to whatever happened to be published at install time and would have pulled
  a future major without any warning. The range is now `^1`.
