import { it } from "vitest";
import ExpressionResolver from "../src/ExpressionResolver.js";
import getExecuter from "../src/ExecuterRegistry.js";
import { EXECUTERNAME as WithScopedExecuterName, setupExecuter as setupWithScopedExecuter } from "../src/executer/WithScopedExecuter.js";
import { EXECUTERNAME as ContextObjectExecuterName, setupExecuter as setupContextObjectExecuter } from "../src/executer/ContextObjectExecuter.js";
import { EXECUTERNAME as ContextDeconstructorExecuterName, setupExecuter as setupContextDeconstructorExecuter } from "../src/executer/ContextDeconstructorExecuter.js";
import { EXECUTERNAME as EsprimaExecuterName, setupExecuter as setupEsprimaExecuter } from "../src/executer/EsprimaExecuter.js";

/**
 * The capability catalogue - the single place that says which executer can what.
 *
 * Every executer implements one function: execute an expression against a dynamic context. They
 * are deliberately not developed at the same speed, so they do not answer identically. A
 * **capability** is a point where they may legitimately differ - whether a write persists, whether
 * a global is reachable. A **rule** of SPECIFICATION.md is not that: a rule holds under every
 * executer, and an implementation may not decline it.
 *
 * A capability has two states per executer, and a test asks the catalogue which one to use:
 * `supported` runs as `it`, `unsupported` as `it.fails`. Both directions are guarded. A capability
 * that stops working turns the gate red the ordinary way, and one that starts working turns it red
 * with `Expect test to fail` - which is how the switch of the default executer announced itself on
 * 2026-08-30. The table therefore cannot claim a state the code does not have.
 *
 * Whether an unsupported capability is meant to arrive is **not** written here - that belongs in
 * `BACKLOG.md` (decided by Frank, 2026-08-30). This file records what is, not what is planned.
 *
 * The dialect is not a capability: it is not a yes or no, and it is carried as `variableName` on
 * the executer entry below.
 *
 * A row is only listed once a test actually asks for it under every executer, because a row nothing
 * reads is a claim without cover. Every row below is read by `test/executer/shared/`, which runs
 * once per executer.
 */

export const SUPPORTED = "supported";
export const UNSUPPORTED = "unsupported";

export const GENERAL = "general";
export const PER_EXECUTER = "per-executer";
export const BOTH = "both";

/**
 * Which group each rule of SPECIFICATION.md is tested in, declared here rather than left to the
 * directory a test happens to sit in.
 *
 * `general` - the rule can be observed without executing a statement, or the executer cannot
 * influence it. It runs once, in `test/spec/`, against `ExpressionResolver.defaultExecuter`.
 * `per-executer` - observing the rule means running a statement, so it is asked of every
 * implementation, in `test/executer/shared/`. `both` - the rule has halves in each group.
 *
 * The reason this is a declaration and not a convention: `ChainTest.js:229` counted as
 * executer-independent until the constructor started reading `defaultContext` off the executer,
 * and nothing but luck made that visible. `test/general/RuleGroupTest.js` holds the two halves
 * of this table against what the shared suites actually open, so a rule that changes group has
 * to be moved here as well.
 *
 * Sections 1, 2 and 10 of the specification carry no rule and are not listed. The list is
 * maintained by hand - the suite runs in a browser and cannot read the document.
 */
export const RULE_GROUPS = {
	"3.1": GENERAL,
	"3.2": GENERAL,
	"3.3": GENERAL,
	"3.4": GENERAL,
	"4.1": GENERAL,
	"4.2": GENERAL,
	"4.3": GENERAL,
	"4.4": GENERAL,
	"4.5": GENERAL,
	"4.6": GENERAL,
	"5.1": GENERAL,
	"5.2": PER_EXECUTER,
	"5.3": PER_EXECUTER,
	"5.4": PER_EXECUTER,
	"5.5": GENERAL,
	// the proxy itself is resolver API, what a statement reads through it is not
	"6.1": BOTH,
	"6.2": PER_EXECUTER,
	"6.3": PER_EXECUTER,
	"6.4": GENERAL,
	// the negative guarantee needs a statement, the switch that lifts it does not
	"6.5": BOTH,
	"6.6": GENERAL,
	"6.7": GENERAL,
	"7": BOTH,
	"8.1": GENERAL,
	// that an implementation registers itself is general, what it can execute is not
	"8.2": BOTH,
	"8.3": PER_EXECUTER,
	// declared general because that is where it runs, although it loops over the executers inside
	// test/spec/ExecuterTest.js - a candidate for the move, see BACKLOG.md
	"8.4": GENERAL,
	"9": GENERAL
};

/**
 * The sections declared for one group. `both` answers for either side.
 *
 * @param {string} aGroup GENERAL or PER_EXECUTER
 * @returns {string[]}
 */
export const sectionsOf = (aGroup) => {
	if (aGroup !== GENERAL && aGroup !== PER_EXECUTER) throw new Error(`No such rule group "${aGroup}".`);

	return Object.entries(RULE_GROUPS)
		.filter(([, group]) => group === aGroup || group === BOTH)
		.map(([section]) => section);
};

/**
 * Every registered executer, each with the name a statement has to use to reach a given property
 * of the context under it. Three of them put the context properties into scope, so the property
 * `value` is the variable `value`; ContextObjectExecuter hands the context to the statement as
 * the object `ctx`, so the same property is `ctx.value`. SPECIFICATION.md 8.3 grants an executer
 * that freedom - see DECISIONS.md, 2026-08-24.
 *
 * A conformance suite whose rule has to hold under every executer loops over this and asks for a
 * name through `variableName`, so what it measures is the rule and not the spelling. The
 * benchmarks loop over the same list, which is why each entry also carries its `setupExecuter`:
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
 * One row per capability, one state per executer. `spec` names the section of SPECIFICATION.md the
 * capability sits under, `description` says what `supported` means - so a row reads the same way
 * for every executer and the negative state is simply its absence.
 */
export const CAPABILITIES = [
	{
		id: "global/reachable",
		spec: "8.3",
		description: "a name that no resolver of the chain carries resolves against the global object",
		state: {
			[WithScopedExecuterName]: SUPPORTED,
			[ContextObjectExecuterName]: SUPPORTED,
			[ContextDeconstructorExecuterName]: SUPPORTED,
			[EsprimaExecuterName]: UNSUPPORTED
		}
	},
	{
		id: "context/write-back",
		spec: "6.5",
		description: "a write from an expression to a name the context carries is readable from the context afterwards",
		state: {
			[WithScopedExecuterName]: SUPPORTED,
			[ContextObjectExecuterName]: SUPPORTED,
			[ContextDeconstructorExecuterName]: UNSUPPORTED,
			[EsprimaExecuterName]: UNSUPPORTED
		}
	},
	{
		// The negative guarantee of 6.5 is a rule, not a capability - every executer has to keep it.
		// Two of them do not today, and until they do, the catalogue is where the suite reads that
		// from; the fix is carried in BACKLOG.md. Kept as a row rather than as a switch inside a
		// test file so that both directions stay guarded: the day one of the two stops leaking, the
		// gate says so.
		id: "context/no-global-write",
		spec: "6.5",
		description: "a write to a name no resolver of the chain carries stays out of the global object",
		state: {
			[WithScopedExecuterName]: UNSUPPORTED,
			[ContextObjectExecuterName]: SUPPORTED,
			[ContextDeconstructorExecuterName]: UNSUPPORTED,
			[EsprimaExecuterName]: SUPPORTED
		}
	},
	{
		// 8.3 lets an executer decide how a statement reaches a context value, but a callback is an
		// ordinary thing to write in an expression - so losing the context halfway through the
		// statement is a capability the esprima rewrite lacks, not a dialect. See BACKLOG.md.
		id: "context/nested-function",
		spec: "8.3",
		description: "a context value is reachable from inside a function written in the statement",
		state: {
			[WithScopedExecuterName]: SUPPORTED,
			[ContextObjectExecuterName]: SUPPORTED,
			[ContextDeconstructorExecuterName]: SUPPORTED,
			[EsprimaExecuterName]: UNSUPPORTED
		}
	},
	{
		// `x = 5` is rewritten to `ctx?.x = 5` by the esprima executer, which is a syntax error, so
		// that executer cannot run an assignment at all - independent of where the value would land,
		// which is what context/write-back is about.
		id: "statement/assignment",
		spec: "8.2",
		description: "a statement carrying an assignment executes rather than raising",
		state: {
			[WithScopedExecuterName]: SUPPORTED,
			[ContextObjectExecuterName]: SUPPORTED,
			[ContextDeconstructorExecuterName]: SUPPORTED,
			[EsprimaExecuterName]: UNSUPPORTED
		}
	}
];

const CAPABILITY_OF = new Map(CAPABILITIES.map((capability) => [capability.id, capability]));
const EXECUTER_OF = new Map(EXECUTERS.map((executer) => [executer.name, executer]));

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

/**
 * The state of one capability under one executer. Throws on an unknown capability and on an
 * executer the row says nothing about - a silent answer would let a test pass or fail for a reason
 * nobody wrote down.
 *
 * @param {string} aCapabilityId
 * @param {string} anExecuterName
 * @returns {string} SUPPORTED or UNSUPPORTED
 */
export const capabilityState = (aCapabilityId, anExecuterName) => {
	const capability = CAPABILITY_OF.get(aCapabilityId);
	if (!capability) throw new Error(`The catalogue holds no capability "${aCapabilityId}".`);

	const state = capability.state[anExecuterName];
	if (!state) throw new Error(`The capability "${aCapabilityId}" says nothing about the executer "${anExecuterName}".`);

	return state;
};

/**
 * @param {string} aCapabilityId
 * @param {string} anExecuterName
 * @returns {boolean}
 */
export const supports = (aCapabilityId, anExecuterName) => capabilityState(aCapabilityId, anExecuterName) === SUPPORTED;

/**
 * The `it` a case has to run under: the ordinary one where the executer has the capability, the
 * failing one where it has not.
 *
 * @param {string} aCapabilityId
 * @param {string} anExecuterName
 * @returns {Function}
 */
export const capabilityIt = (aCapabilityId, anExecuterName) => (supports(aCapabilityId, anExecuterName) ? it : it.fails);
