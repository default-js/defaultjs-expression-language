import ExpressionResolver from "../src/ExpressionResolver.js";
import getExecuter from "../src/ExecuterRegistry.js";
import { EXECUTERNAME as WithScopedExecuterName, setupExecuter as setupWithScopedExecuter } from "../src/executer/WithScopedExecuter.js";
import { EXECUTERNAME as ContextObjectExecuterName, setupExecuter as setupContextObjectExecuter } from "../src/executer/ContextObjectExecuter.js";
import { EXECUTERNAME as ContextDeconstructorExecuterName, setupExecuter as setupContextDeconstructorExecuter } from "../src/executer/ContextDeconstructorExecuter.js";
import { EXECUTERNAME as EsprimaExecuterName, setupExecuter as setupEsprimaExecuter } from "../src/executer/EsprimaExecuter.js";

/**
 * The capability catalogue - the single place that says which executer can what, and what each of
 * those points actually is.
 *
 * Every executer implements one function: execute an expression against a dynamic context. They
 * are deliberately not developed at the same speed, so they do not answer identically. A
 * **capability** is a point where they may legitimately differ. A **rule** of SPECIFICATION.md is
 * not that: a rule holds under every executer, and an implementation may not decline it.
 *
 * Three things are written down here and nowhere else:
 *
 * 1. **which points are capabilities at all** — the entries of `CAPABILITIES`. A rule that has no
 *    entry here holds everywhere, and its test says nothing about executers.
 * 2. **what each of them does** — every entry carries its own case: the context to build, the
 *    statement to run, and the value an executer that has the capability answers.
 * 3. **who has it** — `CAPABILITY_MATRIX`, one row per capability, one column per executer.
 *
 * A case is unambiguous: `yes` means it has to pass, `no` means it has to fail. There is no second
 * expectation for the `no` state and no counter-test beside it — the day an executer gains a
 * capability, one cell of the matrix changes and nothing else does. Both directions are guarded: a
 * capability that stops working fails the ordinary way, one that starts working fails with
 * `Expect test to fail`. The table cannot claim a state the code does not have.
 *
 * `test/executer/CapabilityTest.js` generates every case from what stands here, so no test file
 * decides for itself whether something is a capability.
 *
 * Whether a missing capability is meant to arrive is **not** written here — that belongs in
 * `BACKLOG.md` (decided by Frank, 2026-08-30). This file records what is, not what is planned.
 *
 * The dialect is not a capability: it is not a yes or no, and it is carried as `variableName` on
 * the executer entry below.
 */

/** the executers may differ here — neither answer is wrong */
export const CAPABILITY = "capability";

/**
 * the specification demands it and an implementation does not keep it yet. Such a case runs like a
 * missing capability, but it is a defect rather than a freedom, and `BACKLOG.md` carries its fix.
 */
export const UNIMPLEMENTED_RULE = "unimplemented-rule";

export const YES = "yes";
export const NO = "no";

/**
 * Every registered executer, each with the name a statement has to use to reach a given property
 * of the context under it. Three of them put the context properties into scope, so the property
 * `value` is the variable `value`; ContextObjectExecuter hands the context to the statement as
 * the object `ctx`, so the same property is `ctx.value`. SPECIFICATION.md 8.3 grants an executer
 * that freedom - see DECISIONS.md, 2026-08-24.
 *
 * A rule that has to hold under every executer loops over this and asks for a name through
 * `variableName`, so what it measures is the rule and not the spelling. The benchmarks loop over
 * the same list, which is why each entry also carries its `setupExecuter`: every executer keeps a
 * code cache of its own, and a benchmark that wants a cold cache has to switch off all four.
 */
export const EXECUTERS = [
	{ name: WithScopedExecuterName, variableName: (property) => property, setupExecuter: setupWithScopedExecuter },
	{ name: ContextObjectExecuterName, variableName: (property) => `ctx.${property}`, setupExecuter: setupContextObjectExecuter },
	{ name: ContextDeconstructorExecuterName, variableName: (property) => property, setupExecuter: setupContextDeconstructorExecuter },
	{ name: EsprimaExecuterName, variableName: (property) => property, setupExecuter: setupEsprimaExecuter }
];

/**
 * One entry per capability, each carrying the case that decides it.
 *
 * `context` is a factory, not an object: the same case runs under four executers and a write from
 * one of them must not reach the next. That is not hypothetical - it was measured on 2026-09-01,
 * where a shared context let `context/write-back` pass under the two executers that do not have it.
 *
 * `run` is handed the resolver, the `variableName` of the executer under test and its name, and
 * answers **one** value, compared against `expected`. One value, because a case has to be
 * unambiguous: where an executer has the capability it answers that value, where it has not the
 * case fails, and there is nothing in between worth describing.
 */
export const CAPABILITIES = [
	{
		id: "global/reachable",
		spec: "8.3",
		kind: CAPABILITY,
		description: "a name no resolver of the chain carries resolves against the global object",
		context: () => ({ known: 1 }),
		// through resolveText: where the executer does not reach the global, the statement raises and
		// the expression stands as written (7) - a different value rather than an error
		run: (resolver) => resolver.resolveText("${ Math.round(1.5) }"),
		expected: "2"
	},
	{
		id: "context/write-back",
		spec: "6.5",
		kind: CAPABILITY,
		description: "a write to a name the context carries is readable from the context afterwards",
		context: () => ({ known: "before" }),
		run: async (resolver, variableName) => {
			await resolver.resolveText(`\${${variableName("known")} = "after"}`);

			return resolver.getData("known");
		},
		expected: "after"
	},
	{
		id: "context/no-global-write",
		spec: "6.5",
		kind: UNIMPLEMENTED_RULE,
		description: "a write to a name no resolver of the chain carries stays out of the global object",
		context: () => ({ known: 1 }),
		// the leak is read and cleaned up before the value is answered, because a failing case stops
		// at the assertion and would otherwise leave the name on globalThis for every later test
		run: async (resolver, variableName, executer) => {
			const leakName = `leaked_${executer.replace(/-/g, "_")}`;
			await resolver.resolveText(`\${${variableName(leakName)} = 1}`);
			const leaked = leakName in globalThis;
			delete globalThis[leakName];

			return leaked;
		},
		expected: false
	},
	{
		id: "context/nested-function",
		spec: "8.3",
		kind: CAPABILITY,
		description: "a context value is reachable from inside a function written in the statement",
		context: () => ({ count: 3 }),
		run: (resolver, variableName) => resolver.resolve(`\${ [1, 2].map((value) => value + ${variableName("count")}).join() }`),
		expected: "4,5"
	},
	{
		id: "statement/assignment",
		spec: "8.2",
		kind: CAPABILITY,
		description: "a statement carrying an assignment executes rather than raising",
		context: () => ({ known: "before" }),
		run: (resolver, variableName) => resolver.resolveText(`\${${variableName("known")} = "after"}`),
		expected: "after"
	}
];

/**
 * The order of the columns of the matrix below. It is written out rather than taken from
 * `EXECUTERS`, so that reordering that list cannot silently move a column.
 */
const COLUMNS = [WithScopedExecuterName, ContextObjectExecuterName, ContextDeconstructorExecuterName, EsprimaExecuterName];

/**
 * Who has what. One row per capability, one column per executer, in the order of `COLUMNS` - so it
 * reads as the table it is and a change is one cell.
 */
export const CAPABILITY_MATRIX = {
	//                            with-scoped  context-object  context-deconstruction  esprima
	"global/reachable":         [ YES,         YES,            YES,                    NO ],
	"context/write-back":       [ YES,         YES,            NO,                     NO ],
	"context/no-global-write":  [ NO,          YES,            NO,                     YES ],
	"context/nested-function":  [ YES,         YES,            YES,                    NO ],
	"statement/assignment":     [ YES,         YES,            YES,                    NO ]
};

const CAPABILITY_OF = new Map(CAPABILITIES.map((capability) => [capability.id, capability]));
const EXECUTER_OF = new Map(EXECUTERS.map((executer) => [executer.name, executer]));

/**
 * The state of one capability under one executer. Throws on an unknown capability, on an executer
 * the matrix has no column for, and on a row that is not as wide as the table - a silent answer
 * would let a case pass or fail for a reason nobody wrote down.
 *
 * @param {string} aCapabilityId
 * @param {string} anExecuterName
 * @returns {string} YES or NO
 */
export const capabilityState = (aCapabilityId, anExecuterName) => {
	if (!CAPABILITY_OF.has(aCapabilityId)) throw new Error(`The catalogue holds no capability "${aCapabilityId}".`);

	const row = CAPABILITY_MATRIX[aCapabilityId];
	if (!row) throw new Error(`The matrix holds no row for "${aCapabilityId}".`);
	if (row.length !== COLUMNS.length) throw new Error(`The row "${aCapabilityId}" has ${row.length} cells where the table has ${COLUMNS.length} columns.`);

	const column = COLUMNS.indexOf(anExecuterName);
	if (column < 0) throw new Error(`The matrix has no column for the executer "${anExecuterName}".`);

	return row[column];
};

/**
 * @param {string} aCapabilityId
 * @param {string} anExecuterName
 * @returns {boolean}
 */
export const supports = (aCapabilityId, anExecuterName) => capabilityState(aCapabilityId, anExecuterName) === YES;

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

/**
 * The catalogue entry of whatever `ExpressionResolver.defaultExecuter` is at the moment of the
 * call. The general suite reads its `variableName` from here rather than writing a bare name,
 * because a bare name is the dialect of three of the four executers and not a rule - the day the
 * default moves to the fourth, a suite that assumed it would fail everywhere at once.
 *
 * Answered by identity against the registry, since a resolver knows its executer as an object and
 * not by name.
 *
 * @returns {{name: string, variableName: Function, setupExecuter: Function}}
 */
export const defaultExecuterEntry = () => {
	const executer = ExpressionResolver.defaultExecuter;
	const entry = EXECUTERS.find(({ name }) => getExecuter(name) === executer);
	if (!entry) throw new Error("The catalogue holds no entry for the current default executer.");

	return entry;
};
