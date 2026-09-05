import { it } from "vitest";
import { EXECUTERNAME as WithScopedExecuterName, setupExecuter as setupWithScopedExecuter } from "../src/executer/WithScopedExecuter.js";
import { EXECUTERNAME as ContextObjectExecuterName, setupExecuter as setupContextObjectExecuter } from "../src/executer/ContextObjectExecuter.js";
import { EXECUTERNAME as ContextDeconstructorExecuterName, setupExecuter as setupContextDeconstructorExecuter } from "../src/executer/ContextDeconstructorExecuter.js";
import { EXECUTERNAME as EsprimaExecuterName, setupExecuter as setupEsprimaExecuter } from "../src/executer/EsprimaExecuter.js";

/**
 * What each executer supports - the capability catalogue of the package, in one table.
 *
 * **An executer has capabilities and nothing else** (decided by Frank, 2026-09-05). Beyond the
 * interface it implements and the promise to execute an expression, nothing is demanded of it. What
 * a capability measures is **how far an executer supports JavaScript over a dynamic context**: which
 * constructs run, how much of the language's scoping survives, which values stay reachable, whether
 * a write behaves the way an assignment does.
 *
 * Two states, and both directions are guarded:
 *
 * - `yes` - the executer supports it. The case runs as `it` and has to pass.
 * - `no`  - it does not. The case runs as `it.fails` and has to fail.
 *
 * A case that stops working turns the gate red the ordinary way, one that starts working turns it
 * red with `Expect test to fail`, so the table cannot claim a state the code does not have. Whether
 * a missing capability is **meant** to arrive is not written here - that belongs in `BACKLOG.md`
 * (decided by Frank, 2026-08-30).
 *
 * **There is no third state.** `defect` was dropped on 2026-09-05 together with the idea that an
 * executer can break a rule: nothing an executer does can break a rule it was never given. What used
 * to carry that label - the containment of a global write, the context value lost inside a nested
 * function - is a capability two implementations lack, with a `BACKLOG.md` entry each.
 *
 * **Three things are deliberately not in this table**, because they are not capabilities:
 *
 * - **Rules of the resolver that only show through a statement** - the chain walk (5.2, 5.3, 5.4),
 *   the name snapshot (6.2), a link without a context (6.3), the data methods from outside (6.6) and
 *   the error policy (7). None of them is the executer's work: the walk lives in the proxy traps of
 *   `ResolverContextHandle`, and every executer gets it for free. They stay in `test/executer/rules/`
 *   as plain `it`, asked of every implementation because `TestExecuter` evaluates nothing and they
 *   cannot be seen without a real one.
 * - **The interface contract** - `defaultContext` and `execution` (8.1), registering on import and
 *   being reachable by name (8.2). An implementation that fails it is not an executer, so it is no
 *   yes/no axis.
 * - **The dialect** - a spelling is not a yes or no. It is carried as `variableName` on the executer
 *   entry below.
 *
 * `SPECIFICATION.md` 8.3 carries the same table for a human reader and is written from this one by
 * hand: the suite runs in a browser and cannot read a document, so a change has to go into both.
 */

export const YES = "yes";
export const NO = "no";

/**
 * Every registered executer, each with the name a statement has to use to reach a given property
 * of the context under it. Three of them put the context properties into scope, so the property
 * `value` is the variable `value`; ContextObjectExecuter hands the context to the statement as
 * the object `ctx`, so the same property is `ctx.value`. SPECIFICATION.md 8.3 grants an executer
 * that freedom - see DECISIONS.md, 2026-08-24.
 *
 * The benchmarks loop over the same list, which is why each entry also carries its `setupExecuter`:
 * every executer keeps a code cache of its own, and a benchmark that wants a cold cache has to
 * switch off all four.
 */
export const EXECUTERS = [
	{ name: WithScopedExecuterName, variableName: (property) => property, setupExecuter: setupWithScopedExecuter },
	{ name: ContextObjectExecuterName, variableName: (property) => `ctx.${property}`, setupExecuter: setupContextObjectExecuter },
	{ name: ContextDeconstructorExecuterName, variableName: (property) => property, setupExecuter: setupContextDeconstructorExecuter },
	{ name: EsprimaExecuterName, variableName: (property) => property, setupExecuter: setupEsprimaExecuter }
];

/**
 * The column order of the table. Written out rather than taken from `EXECUTERS`, so that reordering
 * that list cannot silently move a column.
 */
const COLUMNS = [WithScopedExecuterName, ContextObjectExecuterName, ContextDeconstructorExecuterName, EsprimaExecuterName];

/**
 * Capability → case name → one state per executer, in the order of `COLUMNS`.
 *
 * The case name is the key, so it is the same string the test carries: a case whose name is not in
 * the table throws instead of quietly running, and a row without a case is found by counting
 * (`test/executer/CapabilityTableTest.js`). Renaming a test therefore means renaming its row -
 * deliberately.
 *
 * `specification` names the section a capability is read against, for a reader who wants the rule
 * behind a row; the file that holds the cases is named after the capability, not after the section.
 */
export const CAPABILITIES = {

	/**
	 * Which JavaScript constructs run at all. **Constants only** - a context name never appears in a
	 * case of this capability, because a construct that carries one asks two questions at once (does
	 * it run, and does it still see the context) and a failure would not say which.
	 */
	syntax: {
		specification: "3.4, 8.2",
		description: "Which JavaScript constructs the executer can run, with constants inside them.",
		cases: {
			//                                                                          with-scoped  context-object  deconstruction  esprima
			"evaluates an object literal":                                            [ YES,         YES,            YES,            YES ],
			"evaluates an arrow function body":                                       [ YES,         YES,            YES,            YES ],
			"evaluates a template literal":                                           [ YES,         YES,            YES,            YES ],
			"evaluates a regular expression literal":                                 [ YES,         YES,            YES,            YES ],
			// `x = 5` is rewritten to `ctx?.x = 5` by the esprima executer, which is not a legal
			// assignment target, so it cannot run an assignment at all - independent of where the
			// value would land, which is `context-write`.
			"executes a statement carrying an assignment":                            [ YES,         YES,            YES,            NO ],
			// The assignment forms are the exception to "constants only" - an assignment needs a
			// target, and a target is a binding. Three of the four fail under esprima for one cause,
			// `ctx?.name` as a target; the two that pass do so because the rewrite never reaches their
			// target at all - a member of a literal, and the elements of an array pattern.
			"executes a compound assignment":                                         [ YES,         YES,            YES,            NO ],
			"executes an increment":                                                  [ YES,         YES,            YES,            NO ],
			"executes a member assignment on an object literal":                      [ YES,         YES,            YES,            YES ],
			"executes a destructuring assignment":                                    [ YES,         YES,            YES,            YES ],
			"evaluates a function expression":                                        [ YES,         YES,            YES,            YES ],
			"evaluates a class expression":                                           [ YES,         YES,            YES,            YES ],
			// Not the rewrite this time but the code generator: escodegen 2.1.0 has no generator for
			// a class field and raises before anything runs. Verified against the library directly on
			// 2026-09-05, which is why the class expression above is a separate row and `yes`.
			"evaluates a class field":                                                [ YES,         YES,            YES,            NO ],
			"evaluates a new expression":                                             [ YES,         YES,            YES,            YES ],
			"evaluates an array spread":                                              [ YES,         YES,            YES,            YES ],
			"evaluates an object spread":                                             [ YES,         YES,            YES,            YES ],
			"evaluates an optional chain":                                            [ YES,         YES,            YES,            YES ],
			"evaluates a nullish coalescing operator":                                [ YES,         YES,            YES,            YES ],
			"evaluates a logical operator":                                           [ YES,         YES,            YES,            YES ],
			"evaluates a ternary":                                                    [ YES,         YES,            YES,            YES ],
			"evaluates a comma sequence":                                             [ YES,         YES,            YES,            YES ],
			"evaluates typeof":                                                       [ YES,         YES,            YES,            YES ],
			"evaluates instanceof against a class expression":                        [ YES,         YES,            YES,            YES ],
			"evaluates the in operator":                                              [ YES,         YES,            YES,            YES ],
			"evaluates delete":                                                       [ YES,         YES,            YES,            YES ],
			"evaluates an exponentiation":                                            [ YES,         YES,            YES,            YES ],
			// **Two rows nobody keeps**, and both are worth having. A statement stands in expression
			// position, so two of them are not one statement - and note that three of the four do not
			// raise: their body is `return <statement>`, where `1; 2` parses as a return of 1 followed
			// by a second statement, so the answer is 1 rather than an error.
			"executes two statements separated by a semicolon":                       [ NO,          NO,             NO,             NO ],
			// Every generated body is sloppy - `new Function` produces one, and the `with`-based
			// executer could not be strict at all. This is the row the containment of a global write
			// hangs on (6.5): in sloppy mode an undeclared assignment creates a global and a bare call
			// has `globalThis` as its receiver. Measured 2026-09-05.
			"runs the statement in strict mode":                                      [ NO,          NO,             NO,             NO ]
		}
	},

	/**
	 * How much of JavaScript's scoping survives: the same constructs, carrying a context name. This
	 * is where the four differ most, and where the dialect applies without being a row.
	 */
	"context-scope": {
		specification: "8.3",
		description: "Whether a construct carrying a context name still reaches that value.",
		cases: {
			//                                                                          with-scoped  context-object  deconstruction  esprima
			"evaluates an operator expression over the context":                       [ YES,         YES,            YES,            YES ],
			"evaluates a call on a context member":                                    [ YES,         YES,            YES,            YES ],
			"evaluates an await inside the statement":                                 [ YES,         YES,            YES,            YES ],
			"addresses a context value the way its own dialect spells it":             [ YES,         YES,            YES,            YES ],
			"answers a bare context name only where that is its dialect":              [ YES,         YES,            YES,            YES ],
			"reads a context value from inside a template literal":                    [ YES,         YES,            YES,            YES ],
			"answers from the context where the global object carries the same name":  [ YES,         YES,            YES,            YES ],
			// The esprima rewrite skips function bodies whole (`IGNORED_TYPES`), so an identifier
			// inside one is never rewritten onto the context. BACKLOG.md, "EsprimaExecuter cannot
			// reach a context value from inside a nested function", which carries the six further
			// shapes the same rewrite misses.
			"reaches a context value from inside a nested function":                   [ YES,         YES,            YES,            NO ],
			// **Five function shapes, one answer**: the esprima rewrite skips every function body
			// (`IGNORED_TYPES` holds FunctionExpression and ArrowFunctionExpression), so no identifier
			// inside one is ever put onto the context. Measured 2026-09-05.
			"reaches a context value from inside an arrow with an expression body":    [ YES,         YES,            YES,            NO ],
			"reaches a context value from inside an arrow with a block body":          [ YES,         YES,            YES,            NO ],
			"reaches a context value from inside a function expression":               [ YES,         YES,            YES,            NO ],
			"reaches a context value from a default parameter":                        [ YES,         YES,            YES,            NO ],
			"awaits a context promise from inside a nested async function":            [ YES,         YES,            YES,            NO ],
			// **Seven positions the rewrite does not walk into**, and the reason each of them is a row
			// of its own: `TRAVERSABLE_PROPERTIES` (EsprimaExecuter.js:31) lists neither `properties`
			// nor `elements` nor `test`/`consequent`/`alternate` nor `tag`/`quasi`, and the
			// MemberExpression handler walks `object` only, never `property`. `new Cls()` fails for a
			// second reason: the callee becomes `ctx?.Cls` and `new ctx?.Cls()` is a syntax error.
			// All measured 2026-09-05, all predicted from the code first - BACKLOG.md carries them.
			"reaches a context value inside an object literal":                        [ YES,         YES,            YES,            NO ],
			"reaches a context value inside an array literal":                         [ YES,         YES,            YES,            NO ],
			"reaches a context value as a computed key of an object literal":          [ YES,         YES,            YES,            NO ],
			"spreads a context object into an object literal":                         [ YES,         YES,            YES,            NO ],
			"reaches a context value from both branches of a ternary":                 [ YES,         YES,            YES,            NO ],
			"reaches a context value as the key of a computed member access":          [ YES,         YES,            YES,            NO ],
			"reaches a context value inside a tagged template":                        [ YES,         YES,            YES,            NO ],
			"constructs an instance of a class the context carries":                   [ YES,         YES,            YES,            NO ],
			// The positions the rewrite *does* walk into, kept as rows because that is not obvious
			// from the outside: a logical operator has `left` and `right`, a member access has
			// `object`, and both are on its list.
			"reaches a context value on both sides of a nullish coalescing operator":  [ YES,         YES,            YES,            YES ],
			"reaches a context value through a deep member access":                    [ YES,         YES,            YES,            YES ],
			"reaches a context value through an optional chain":                       [ YES,         YES,            YES,            YES ],
			"reads the same context value twice within one statement":                 [ YES,         YES,            YES,            YES ],
			// The one row of this capability the deconstructor misses, and the esprima executer keeps:
			// a `with` block and a member access both leave the context as the receiver, a destructured
			// local binding carries none, so `this` is undefined inside the method. Measured 2026-09-05.
			"keeps this bound to the context when a method is called bare":            [ YES,         YES,            NO,             YES ]
		}
	},

	/**
	 * Which structures can be put into scope as a context. `SPECIFICATION.md` says nothing about what
	 * a context may be, so this table is what answers it - by writing down what each implementation
	 * accepts rather than by a rule nobody wrote.
	 */
	"context-shape": {
		specification: "6.1",
		description: "Which context structures the executer can run a statement over.",
		cases: {
			//                                                                          with-scoped  context-object  deconstruction  esprima
			"resolves over a context the caller froze":                                [ YES,         YES,            YES,            YES ],
			"resolves over a context carrying a key that is not a variable name":      [ YES,         YES,            YES,            YES ],
			"runs a statement over an array context":                                  [ YES,         YES,            YES,            YES ],
			"runs a statement over a Map context":                                     [ YES,         YES,            YES,            YES ],
			"runs a statement over a Set context":                                     [ YES,         YES,            YES,            YES ],
			"runs a statement over a NodeList context":                                [ YES,         YES,            YES,            YES ],
			// the deconstructor reads every name of a context before it runs anything, and `callee` on
			// an arguments object is a poisoned accessor. BACKLOG.md keeps open whether it should cope.
			"runs a statement over an arguments object as context":                    [ YES,         YES,            NO,             YES ],
			"reads through an element context":                                        [ YES,         YES,            YES,            YES ],
			"reads the length of an array context and ignores its indices":            [ YES,         YES,            YES,            YES ],
			"reads a named key of a context that also carries a numeric one":          [ YES,         YES,            YES,            YES ],
			"reads an accessor of the prototype of a Map context":                     [ YES,         YES,            YES,            YES ],
			"runs a statement over a context without a prototype":                     [ YES,         YES,            YES,            YES ],
			"runs a statement over a context carrying a symbol key":                   [ YES,         YES,            YES,            YES ],
			// **A context key called `ctx` breaks the deconstructor entirely** - every statement, not
			// only one that touches the key: its generated prologue emits `let ctx = ctx.ctx;`, which
			// reads the binding it is declaring. A key called `context` is harmless, because the
			// shadowing happens inside the generated arrow while the argument is evaluated outside it.
			// Read off the code and measured 2026-09-05; BACKLOG.md carries it.
			"runs a statement over a context carrying a key named ctx":                [ YES,         YES,            NO,             YES ],
			"runs a statement over a context carrying a key named context":            [ YES,         YES,            YES,            YES ],
			"runs a statement over a context carrying a key named like a reserved word": [ YES,       YES,            YES,            YES ],
			"runs a statement over a context carrying many keys":                      [ YES,         YES,            YES,            YES ],
			// Both are the same property from two sides: the deconstructor reads every name of a
			// context before it runs anything. Where an accessor throws, no statement runs at all; where
			// one merely costs, it is paid on every execution. The `arguments` row above is the shape
			// found in the wild.
			"reads a context value beside a getter that throws":                       [ YES,         YES,            NO,             YES ],
			"leaves a getter of the context unread when the statement does not touch it": [ YES,      YES,            NO,             YES ]
		}
	},

	/**
	 * Whether an assignment inside a statement behaves the way JavaScript's does - whether what was
	 * written is there afterwards.
	 */
	"context-write": {
		specification: "6.5",
		description: "Whether a write from inside a statement is readable afterwards.",
		cases: {
			//                                                                          with-scoped  context-object  deconstruction  esprima
			// The deconstructor writes into a destructured local binding and nothing carries it back;
			// the esprima executer cannot run an assignment at all. BACKLOG.md carries the write-back
			// that would close the first of the two.
			"makes a write to a name the context carries readable afterwards":         [ YES,         YES,            NO,             NO ],
			"counts across two occurrences of a counting write in one text":           [ YES,         YES,            NO,             NO ],
			"makes a write to a name only an ancestor carries readable afterwards":    [ YES,         YES,            NO,             NO ],
			// all four, and two of them for the reason that they wrote nothing at all - see the
			// comment on the case, which is why this row is only read together with the one above
			"leaves the ancestor untouched when writing a name it carries":            [ YES,         YES,            YES,            YES ],
			"makes a write from inside a nested function readable afterwards":         [ YES,         YES,            NO,             NO ],
			"makes a write readable after the statement threw":                        [ YES,         YES,            NO,             NO ],
			"leaves a non-writable key of the context unchanged":                      [ YES,         YES,            YES,            YES ],
			"leaves a key of a frozen context unchanged":                              [ YES,         YES,            YES,            YES ],
			// the only row of this capability the deconstructor keeps: a mutation needs nothing
			// carried back, because the statement and the context hold the same object. The esprima
			// rewrite turns the target into `ctx?.holder.name`, which is not a legal one.
			"makes a mutation of a context object visible afterwards":                 [ YES,         YES,            YES,            NO ],
			"makes a rebinding of a context name readable afterwards":                 [ YES,         YES,            NO,             NO ],
			// `with-scoped` is `no` here and `no` on containment as well: the name is unknown to the
			// chain, so the `has` trap answers false, the assignment leaves the `with` block and
			// lands on the global object - neither contained nor readable. `context-object` is the
			// only one that puts it in the context, because its dialect writes through the proxy.
			"makes a write to a name no resolver carries readable afterwards":         [ NO,          YES,            NO,             NO ]
		}
	},

	/**
	 * Which globals stay reachable from a statement, and whether a write to a name no resolver
	 * carries can be caught before it reaches the global object.
	 */
	"global-scope": {
		specification: "6.4, 6.5, 8.3",
		description: "Which globals a statement reaches, and whether a write can be contained.",
		cases: {
			//                                                                          with-scoped  context-object  deconstruction  esprima
			"reaches a global through window":                                         [ YES,         YES,            YES,            YES ],
			// **One row per global, decided by Frank on 2026-09-05.** For three executers a global is
			// just a free identifier and the whole group answers alike; for the esprima executer the
			// answer is decided name by name, because its rewrite leaves alone only what
			// `RESERVED_NAMES` lists and turns everything else into `ctx?.name`. A single row saying
			// "reaches a global" hid that it reaches some and not others - which is what the list is
			// really worth to a consumer of that executer. `Math` is the case that was that single
			// row until this stage.
			// **The list, read out one name at a time.** The esprima column below *is*
			// `RESERVED_NAMES` (EsprimaExecuter.js:27): what it names is reachable, everything else
			// becomes `ctx?.name` and answers undefined. Measured 2026-09-05, and this is the reach a
			// consumer of that executer actually gets.
			"reaches the global Math":                                                 [ YES,         YES,            YES,            NO ],
			"reaches the global JSON":                                                 [ YES,         YES,            YES,            NO ],
			"reaches the global Date":                                                 [ YES,         YES,            YES,            NO ],
			"reaches the global Promise":                                              [ YES,         YES,            YES,            NO ],
			"reaches the global Object":                                               [ YES,         YES,            YES,            YES ],
			"reaches the global Array":                                                [ YES,         YES,            YES,            YES ],
			"reaches the global Map":                                                  [ YES,         YES,            YES,            YES ],
			"reaches the global Set":                                                  [ YES,         YES,            YES,            YES ],
			"reaches the global console":                                              [ YES,         YES,            YES,            YES ],
			"reaches the global fetch":                                                [ YES,         YES,            YES,            YES ],
			"reaches the global document":                                             [ YES,         YES,            YES,            NO ],
			// The shape a consumer actually meets, and the one a hand-written list can never carry.
			"reaches a global the caller planted":                                     [ YES,         YES,            YES,            NO ],
			// A capability since 2026-09-05, not a broken rule: with-scoped lets an assignment to an
			// unknown name fall out of the `with` block into global scope, the deconstructor generates
			// a sloppy-mode body where an undeclared assignment does the same. `SPECIFICATION.md` 6.5
			// promised the containment and is being rewritten, because a promise the package cannot
			// keep is corrected in the document. BACKLOG.md, "A write to an unknown name inside an
			// expression lands on globalThis".
			"keeps a write to a name no resolver carries out of the global object":    [ NO,          YES,            NO,             YES ],
			// **esprima flips between this row and the one above**, which is the whole reason the two
			// exist apart: at the top level its rewrite turns the name into `ctx?.name`, an illegal
			// assignment target, so the statement raises before anything is created - it contains the
			// write by accident. Inside a function body the rewrite does not go, the identifier stays
			// bare, and the sloppy-mode assignment creates a global. Measured 2026-09-05.
			"keeps a write from inside a nested function out of the global object":    [ NO,          YES,            NO,             NO ],
			// A compound assignment reads before it writes, so an unknown name raises on the read and
			// never creates anything - under every executer, including the two that leak `x = 1`.
			"keeps a compound assignment to an unknown name out of the global object": [ YES,         YES,            YES,            YES ],
			// Nothing here is a sandbox: a statement that asks for the global object by name gets it.
			// The one that says `yes` does so by accident again - `globalThis` is not in the esprima
			// rewrite's list of names to leave alone, so the target becomes `ctx?.globalThis.name` and
			// the statement raises. Measured 2026-09-05.
			"keeps an explicit write through globalThis out of the global object":     [ NO,          NO,             NO,             YES ]
		}
	},

	/**
	 * What `setupExecuter` does to the compiled code cache. No case here proves caching - a cache hit
	 * and a fresh compilation answer the same value by definition - what is pinned is that every
	 * state a consumer can put an executer into keeps resolving.
	 */
	cache: {
		specification: "8.4",
		description: "Whether the executer keeps answering in every state of its code cache.",
		cases: {
			//                                                                          with-scoped  context-object  deconstruction  esprima
			"keeps resolving with the cache switched off":                             [ YES,         YES,            YES,            YES ],
			"caches again after being switched back on":                               [ YES,         YES,            YES,            YES ],
			"serves a cached expression to a different context":                        [ YES,         YES,            YES,            YES ],
			"serves a statement to a context that did not carry its name before":      [ YES,         YES,            YES,            YES ],
			"keeps answering while its cache evicts":                                  [ YES,         YES,            YES,            YES ]
		}
	}
};

const EXECUTER_OF = new Map(EXECUTERS.map((executer) => [executer.name, executer]));

/**
 * The state of one case under one executer. Throws on a capability, a case or an executer the table
 * does not carry, and on a row that is not as wide as the table - a silent answer would let a case
 * pass or fail for a reason nobody wrote down.
 *
 * @param {string} aCapability
 * @param {string} aCaseName
 * @param {string} anExecuterName
 * @returns {string} YES or NO
 */
export const capabilityState = (aCapability, aCaseName, anExecuterName) => {
	const capability = CAPABILITIES[aCapability];
	if (!capability) throw new Error(`The catalogue holds no capability "${aCapability}".`);

	const row = capability.cases[aCaseName];
	if (!row) throw new Error(`The capability "${aCapability}" holds no case "${aCaseName}".`);
	if (row.length !== COLUMNS.length) throw new Error(`The row "${aCaseName}" has ${row.length} cells where the table has ${COLUMNS.length} columns.`);

	const column = COLUMNS.indexOf(anExecuterName);
	if (column < 0) throw new Error(`The catalogue has no column for the executer "${anExecuterName}".`);

	return row[column];
};

/**
 * The `it` of one capability under one executer: it looks a case up by name and answers the ordinary
 * `it` where the table says `yes`, the failing one otherwise.
 *
 * Used as `const capabilityIt = casesOf("context-scope", executer);` at the top of a capability's
 * loop, so that a case reads like an ordinary test and names itself once.
 *
 * @param {string} aCapability
 * @param {string} anExecuterName
 * @returns {Function} (aCaseName, aFunction) => void
 */
export const casesOf = (aCapability, anExecuterName) => (aCaseName, aFunction) =>
	(capabilityState(aCapability, aCaseName, anExecuterName) === YES ? it : it.fails)(aCaseName, aFunction);

/**
 * The catalogue entry of one executer, by its registered name. Throws on a name the catalogue
 * does not carry - a per-executer suite that silently got nothing would report no cases at all
 * and look like a clean run.
 *
 * @param {string} anExecuterName
 * @returns {{name: string, variableName: Function, setupExecuter: Function}}
 */
export const executerEntry = (anExecuterName) => {
	const entry = EXECUTER_OF.get(anExecuterName);
	if (!entry) throw new Error(`The catalogue holds no executer "${anExecuterName}".`);

	return entry;
};
