import { it } from "vitest";
import { EXECUTERNAME as WithScopedExecuterName, setupExecuter as setupWithScopedExecuter } from "../src/executer/WithScopedExecuter.js";
import { EXECUTERNAME as ContextObjectExecuterName, setupExecuter as setupContextObjectExecuter } from "../src/executer/ContextObjectExecuter.js";
import { EXECUTERNAME as ContextDeconstructorExecuterName, setupExecuter as setupContextDeconstructorExecuter } from "../src/executer/ContextDeconstructorExecuter.js";
import { EXECUTERNAME as EsprimaExecuterName, setupExecuter as setupEsprimaExecuter } from "../src/executer/EsprimaExecuter.js";

/**
 * What each executer answers to every case that is asked of all of them - the conformance overview
 * of the package, in one table.
 *
 * Every case under `test/executer/` has a row here, not a selected few: the row is the only place
 * that says whether an implementation has to pass it. The case itself stays an ordinary test in the
 * file of its section; this file carries **no test logic**, only the table and the lookup that reads
 * it.
 *
 * Three states, and the difference between the last two is the reason the table is worth having:
 *
 * - `yes`    - the case passes. It runs as `it`.
 * - `no`     - the case fails, and that is **a freedom the specification grants** (8.3): the
 *              implementations may differ here and neither answer is wrong. It runs as `it.fails`.
 * - `defect` - the case fails although the specification demands it. It runs as `it.fails` as well,
 *              but it is not a freedom: `BACKLOG.md` carries the fix and the comment names it.
 *
 * A row of nothing but `yes` is a rule every implementation keeps. A row carrying `no` is a
 * capability. A row carrying `defect` is a rule that is broken today - visible at a glance instead
 * of buried in a marker somewhere in the suite.
 *
 * Both directions are guarded: a case that stops working turns the gate red the ordinary way, one
 * that starts working turns it red with `Expect test to fail`. The table cannot claim a state the
 * code does not have. Whether a missing capability is meant to arrive is **not** written here - that
 * belongs in `BACKLOG.md` (decided by Frank, 2026-08-30).
 *
 * The dialect is no row: it is not a yes or no but a spelling, and it is carried as `variableName`
 * on the executer entry below.
 */

export const YES = "yes";
export const NO = "no";
export const DEFECT = "defect";

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
 * Section → case name → one state per executer, in the order of `COLUMNS`.
 *
 * The case name is the key, so it is the same string the test carries: a case whose name is not in
 * the table throws instead of quietly running, and a row without a case is found by counting
 * (`test/executer/MatrixTest.js`). Renaming a test therefore means renaming its row - deliberately.
 */
export const MATRIX = {
	//                                                                                with-scoped  context-object  deconstruction  esprima
	"3.4": {
		"evaluates an operator expression over the context":                        [ YES,         YES,            YES,            YES ],
		"evaluates a call on a context member":                                    [ YES,         YES,            YES,            YES ],
		"evaluates an object literal":                                             [ YES,         YES,            YES,            YES ],
		"evaluates an arrow function body":                                        [ YES,         YES,            YES,            YES ],
		"evaluates a template literal":                                            [ YES,         YES,            YES,            YES ],
		"evaluates a regular expression literal":                                  [ YES,         YES,            YES,            YES ],
		"evaluates an await inside the statement":                                 [ YES,         YES,            YES,            YES ]
	},
	"5.2": {
		"answers from the nearest link and shadows the links above":                [ YES,         YES,            YES,            YES ],
		"reaches a value carried by an ancestor":                                   [ YES,         YES,            YES,            YES ],
		"never sees the context of a link below":                                   [ YES,         YES,            YES,            YES ],
		"stops the walk at a key that holds undefined":                             [ YES,         YES,            YES,            YES ],
		"reaches a getter inherited through the prototype chain":                   [ YES,         YES,            YES,            YES ],
		"reaches a method inherited through the prototype chain":                   [ YES,         YES,            YES,            YES ]
	},
	"5.3": {
		"addresses the link the call is made on":                                   [ YES,         YES,            YES,            YES ],
		"climbs to the ancestor the prefix names":                                  [ YES,         YES,            YES,            YES ],
		"evaluates against the addressed link and the contexts above it":           [ YES,         YES,            YES,            YES ],
		"answers from the first link carrying the name, climbing towards the root": [ YES,         YES,            YES,            YES ],
		"does not see a link below the one the prefix names":                       [ YES,         YES,            YES,            YES ]
	},
	"5.4": {
		"answers undefined":                                                        [ YES,         YES,            YES,            YES ],
		"lets the default value apply":                                             [ YES,         YES,            YES,            YES ]
	},
	"6.1": {
		"resolves over a context the caller froze":                                 [ YES,         YES,            YES,            YES ],
		"resolves over a context carrying a key that is not a variable name":       [ YES,         YES,            YES,            YES ],
		"runs a statement over an array context":                                  [ YES,         YES,            YES,            YES ],
		"runs a statement over a Map context":                                     [ YES,         YES,            YES,            YES ],
		"runs a statement over a Set context":                                     [ YES,         YES,            YES,            YES ],
		"runs a statement over a NodeList context":                                [ YES,         YES,            YES,            YES ],
		// the deconstructor reads every name of a context before it runs anything, and `callee` on an
		// arguments object is a poisoned accessor. The specification says nothing about what a context
		// may be, so this is a difference and not a broken rule - BACKLOG.md keeps the question open.
		"runs a statement over an arguments object as context":                     [ YES,         YES,            NO,             YES ],
		"reads through an element context":                                        [ YES,         YES,            YES,            YES ],
		"reads the length of an array context and ignores its indices":            [ YES,         YES,            YES,            YES ],
		"reads a named key of a context that also carries a numeric one":          [ YES,         YES,            YES,            YES ],
		"reads an accessor of the prototype of a Map context":                     [ YES,         YES,            YES,            YES ]
	},
	"6.2": {
		"does not see a key added to the handed-in object after the resolver was built": [ YES,    YES,            YES,            YES ],
		"sees that key after resetCache":                                           [ YES,         YES,            YES,            YES ],
		"reads a value at the moment of the lookup, so a mutation is visible immediately": [ YES,  YES,            YES,            YES ],
		"keeps the set of names in step when a value is written through the resolver": [ YES,      YES,            YES,            YES ]
	},
	"6.3": {
		"contributes nothing to a lookup and is passed through":                    [ YES,         YES,            YES,            YES ],
		"gains content like any other link":                                        [ YES,         YES,            YES,            YES ]
	},
	"6.5": {
		// A rule, and two implementations break it: with-scoped lets an assignment to an unknown name
		// fall out of the `with` block into global scope, the deconstructor generates a sloppy-mode
		// body where an undeclared assignment does the same. BACKLOG.md, "A write to an unknown name
		// inside an expression lands on globalThis".
		"keeps a write to a name no resolver carries out of the global object":     [ DEFECT,      YES,            DEFECT,         YES ],
		// A freedom: 6.5 promises nothing about a written value being readable afterwards. BACKLOG.md
		// carries the write-back that would close it for the deconstructor.
		"makes a write to a name the context carries readable afterwards":          [ YES,         YES,            NO,             NO ]
	},
	"6.6": {
		"shadows a value of the parent until the shadowing key is deleted":         [ YES,         YES,            YES,            YES ]
	},
	"7": {
		"leaves the expression standing as written":                                [ YES,         YES,            YES,            YES ],
		"leaves it standing even where a default value was passed":                 [ YES,         YES,            YES,            YES ],
		"never stops the rest of a text from rendering":                            [ YES,         YES,            YES,            YES ],
		"raises the error the statement raised":                                    [ YES,         YES,            YES,            YES ],
		"raises it even where a default value was passed":                          [ YES,         YES,            YES,            YES ]
	},
	"8.2": {
		// `x = 5` is rewritten to `ctx?.x = 5` by the esprima executer, which is a syntax error, so it
		// cannot run an assignment at all - independent of where the value would land.
		"registers itself on import of its module":                                 [ YES,         YES,            YES,            YES ],
		"executes a statement carrying an assignment":                              [ YES,         YES,            YES,            NO ]
	},
	"8.3": {
		"addresses a context value the way its own dialect spells it":              [ YES,         YES,            YES,            YES ],
		"answers a bare context name only where that is its dialect":               [ YES,         YES,            YES,            YES ],
		"answers from the context where the global object carries the same name":   [ YES,         YES,            YES,            YES ],
		"reaches a global through window":                                          [ YES,         YES,            YES,            YES ],
		"reads a context value from inside a template literal":                     [ YES,         YES,            YES,            YES ],
		// A freedom of 8.3: the esprima rewrite leaves only the identifiers of RESERVED_NAMES alone,
		// so `Math` becomes `ctx?.Math` and the call raises.
		"reaches a global that no resolver carries":                                [ YES,         YES,            YES,            NO ],
		// 8.3 lets an executer decide how a statement reaches a context value, not to lose it halfway
		// through the statement. BACKLOG.md, "EsprimaExecuter cannot reach a context value from inside
		// a nested function".
		"reaches a context value from inside a nested function":                    [ YES,         YES,            YES,            DEFECT ]
	},
	"8.4": {
		"keeps resolving with the cache switched off":                              [ YES,         YES,            YES,            YES ],
		"caches again after being switched back on":                                [ YES,         YES,            YES,            YES ],
		"serves a cached expression to a different context":                        [ YES,         YES,            YES,            YES ]
	}
};

const EXECUTER_OF = new Map(EXECUTERS.map((executer) => [executer.name, executer]));

/**
 * The state of one case under one executer. Throws on a section, a case or an executer the table
 * does not carry, and on a row that is not as wide as the table - a silent answer would let a case
 * pass or fail for a reason nobody wrote down.
 *
 * @param {string} aSection
 * @param {string} aCaseName
 * @param {string} anExecuterName
 * @returns {string} YES, NO or DEFECT
 */
export const matrixState = (aSection, aCaseName, anExecuterName) => {
	const section = MATRIX[aSection];
	if (!section) throw new Error(`The matrix holds no section "${aSection}".`);

	const row = section[aCaseName];
	if (!row) throw new Error(`The matrix holds no case "${aCaseName}" in section ${aSection}.`);
	if (row.length !== COLUMNS.length) throw new Error(`The row "${aCaseName}" has ${row.length} cells where the table has ${COLUMNS.length} columns.`);

	const column = COLUMNS.indexOf(anExecuterName);
	if (column < 0) throw new Error(`The matrix has no column for the executer "${anExecuterName}".`);

	return row[column];
};

/**
 * The `it` of one section under one executer: it looks a case up by name and answers the ordinary
 * `it` where the table says `yes`, the failing one otherwise.
 *
 * Used as `const matrixIt = casesOf("5.2", executer);` at the top of a section's loop, so that a
 * case reads like an ordinary test and names itself once.
 *
 * @param {string} aSection
 * @param {string} anExecuterName
 * @returns {Function} (aCaseName, aFunction) => void
 */
export const casesOf = (aSection, anExecuterName) => (aCaseName, aFunction) =>
	(matrixState(aSection, aCaseName, anExecuterName) === YES ? it : it.fails)(aCaseName, aFunction);

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
