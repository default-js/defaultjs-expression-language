# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Only what reaches a consumer of the package belongs here: the public api, the published
files, runtime dependencies, the supported environment. Build and test work stays out.
`DECISIONS.md` carries the reasoning, this file carries the effect.

Versions up to 2.0.4 predate this file — the git history is the record for those.

## [Unreleased]

### Added

- **`SPECIFICATION.md` ships with the package.** It states what the resolver does, rule by
  rule — expression syntax, the resolver chain and its scopes, the context and what it
  guarantees, error handling, the executers, and the whole public surface. Where the code does
  not keep a rule yet, the specification says so and section 10 lists every such place, so the
  document is usable as a reference before those fixes land.

  Revised on 2026-08-24, while every rule was being written out as a test. Six rules changed or
  were added, none of them describing behaviour that exists yet — they say what the pending fixes
  have to produce. **3.1**: a brace inside a string literal does not count towards the matching
  closing brace, and an opening `${` without a matching brace is not an expression, so the text
  stands unchanged. **3.2**: escaping holds per occurrence, even where the same expression also
  appears unescaped. **5.1**: a generated name only has to be unique — the `ER1` shape is what the
  implementation does, not a promise. **5.3**: where two links carry the same name, the first one
  found climbing towards the root answers. **5.5**: a link provides a context when the caller
  handed one to the constructor or a value has been written to it since; what the context holds
  no longer decides anything, so an empty object counts. **8.3**: how a statement addresses a
  context value is the executer's own — `ContextObjectExecuter` requires `ctx.value` where the
  other three take `value`, so switching executer can mean rewriting expressions.

### Changed

- **An empty statement answers `undefined`.** `${}` used to answer `null`, and before the parser
  landed it was not recognized as an expression at all. It is one now, and it answers what
  `return;` answers in JavaScript. A default value applies to it like to any other result, and in
  a text it renders as `undefined`. See `SPECIFICATION.md` 3.4.

- **`resolve` rejects a delimited expression that does not end with `}`.** It throws a
  `SyntaxError` instead of answering the default value: nothing has been executed at that point,
  so it is a rejection of the form rather than an execution error, and section 7 does not cover
  it. Whether the statement between the delimiters is valid JavaScript is still the executer's
  business and an error there is caught as before. See `SPECIFICATION.md` 4.3 and 7.

- **Every occurrence of an expression in a text is evaluated on its own.** `resolveText` used to
  scan a text once per *distinct* expression and replace all identical occurrences with that one
  result, so a statement with a side effect ran once however often it stood in the text. Each
  occurrence is now parsed, evaluated and replaced by position. Visible where a statement is not
  pure: a text carrying `${counter++}` twice now increments twice. See `SPECIFICATION.md` 4.3.

- **What escapes is the delimiter, and the parity of the backslash run decides.** An odd number of
  backslashes before the `$` escapes the `${` and exactly one backslash is consumed; an even number
  does not escape, and no backslash is consumed. Before, a single backslash was recognized and
  nothing else was defined. No backslash is removed except the one that does the escaping.

  An escaped `${` **opens nothing**, so the text behind it is scanned like any other: a delimiter
  that would have stood inside its statement is an expression of its own and resolves. See
  `SPECIFICATION.md` 3.2.

### Removed

- **`esprima` is no longer a declared runtime dependency.** It was never imported — the two
  references in `src/executer/EsprimaExecuter.js` are commented out, the executer parses with
  `espree`. Nothing changes in an install: `escodegen` depends on `esprima` and still pulls
  it in.

### Fixed

- **The instance `resolve` did not understand the scope syntax.** It stripped the delimiters and
  passed everything between them to the executer with the scope filter hardcoded to `null`, so
  `resolver.resolve("${scope::statement}")` handed `scope::statement` to the executer, which could
  not compile it: the error was swallowed and the caller got `undefined`. The two entry points
  answered differently for one syntax. Both parse the prefix by the same rule now, and `resolve`
  reaches a named link of the chain like `resolveText` does. See `SPECIFICATION.md` 4.3.

- **An expression carrying a brace of its own was not recognized.** The delimiters were matched by
  a regular expression that could not see past an inner brace, so an object literal, an arrow
  function body or a nested template literal inside a statement either left the text untouched or
  cut the expression at the first inner brace. The worst of the three was the nested template
  literal: the inner placeholder was matched and substituted while the expression around it stood,
  which corrupted the text instead of leaving it alone. An expression now ends at its **matching**
  closing brace, counted by a scanner that knows string, template and regular expression literals;
  a brace inside one of them does not count. Comments are not examined — a documented limit. An
  opening delimiter that never finds its matching brace is not an expression, and the text stands
  as written. See `SPECIFICATION.md` 3.1.

- **An escaped expression was resolved anyway where the same expression also stood unescaped.**
  Replacement went through `split`/`join` over the whole text, which cannot tell one occurrence
  from another: an escaped occurrence was replaced by the plain expression and evaluated on the
  next round, and an unescaped one left its backslash standing in front of the result. Escaping is
  decided per occurrence now. See `SPECIFICATION.md` 3.2.

- **`${scope::statement}` never reached an ancestor of the chain.** The internal walk was
  declared as `(aExecuter, aResolver, aExpression, aFilter, aDefault)` but recursed with its five
  arguments rotated by one, so the parent resolver arrived where the executer was expected and the
  walk died on the first step. Addressing a named link other than the one the call was made on has
  therefore never worked: `resolveText("${root::value}")` answered the text `null` where the root
  holds a value. It is a regression, not an original defect — the call site was not adjusted when
  `aExecuter` was prepended to the parameter list in 2025-07. Where two links carry the same name,
  the first one found climbing towards the root now answers, the same shadowing rule as an
  unprefixed lookup. See `SPECIFICATION.md` 5.3.

- **A scope prefix that no link carries answered `null` and skipped the default value.** It now
  answers `undefined`, and a default value passed to `resolve` or `resolveText` applies to it as
  it does to every other result. See `SPECIFICATION.md` 5.4.

- **`ExpressionResolver.buildSecure` threw a `TypeError` on every call.** It passed
  `ObjectUtils.filter` a single object where that helper takes three positional arguments, so
  the wrapper object arrived as the data to be filtered and `propFilter` arrived as
  `undefined` — every call died inside the filter before a resolver was built, whatever was
  handed in. The method therefore had no working consumer. The three arguments are now passed
  in the places `filter` expects, which also makes the documented default `deep: true` take
  effect. The constructor options travel inside `option` together with `deep` —
  `buildSecure({ context, propFilter, option : { deep, name, parent, executer } })` — and
  `executer` is among them, which was missing by oversight, so a secure resolver could not be
  pinned to an execution strategy. See `SPECIFICATION.md` 6.7.

- **The expression cache evicted the entries it should have kept.** `CodeCache` refreshed a
  marker on every read but ordered the eviction by write time, so it dropped the least
  recently *written* entry instead of the least recently used one. For this workload that is
  the wrong way round: an expression is compiled once and then resolved for the rest of the
  page's life, which makes the hottest entries the oldest writes and therefore the first to
  go, while an expression resolved once and never again survived. Eviction now follows the
  last use. Only reachable above the configured cache size — 5000 distinct expressions per
  executer by default.

- **A cache disabled through `setupExecuter({ size: 0 })` neither released anything nor could
  be switched back on.** `clear()` returned early on the very flag that disabling had just
  set, so the compiled expressions stayed in memory, and re-enabling never cleared the flag,
  which left that executer recompiling every expression for the rest of the page's life.
  `setupExecuter({ size: 0 })` now releases the entries, and a later positive size caches
  again, starting empty. Affects all four executers.

- **`CodeCache` wrote a `console.debug` line into the consumer's console** every time it
  trimmed. The line is gone; nothing about the trim itself changed.

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
