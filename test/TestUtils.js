import ExpressionResolver from "../src/ExpressionResolver.js";
import { EXECUTERNAME as WithScopedExecuterName } from "../src/executer/WithScopedExecuter.js";
import { EXECUTERNAME as ContextObjectExecuterName } from "../src/executer/ContextObjectExecuter.js";
import { EXECUTERNAME as ContextDeconstructorExecuterName } from "../src/executer/ContextDeconstructorExecuter.js";
import { EXECUTERNAME as EsprimaExecuterName } from "../src/executer/EsprimaExecuter.js";

/**
 * Every registered executer, each with the name a statement has to use to reach a given property
 * of the context under it. Three of them put the context properties into scope, so the property
 * `value` is the variable `value`; ContextObjectExecuter hands the context to the statement as
 * the object `ctx`, so the same property is `ctx.value`. SPECIFICATION.md 8.3 grants an executer
 * that freedom - see DECISIONS.md, 2026-08-24.
 *
 * A conformance suite whose rule has to hold under every executer loops over this and asks for a
 * name through `variableName`, so what it measures is the rule and not the spelling.
 */
export const EXECUTERS = [
	{ name: WithScopedExecuterName, variableName: (property) => property },
	{ name: ContextObjectExecuterName, variableName: (property) => `ctx.${property}` },
	{ name: ContextDeconstructorExecuterName, variableName: (property) => property },
	{ name: EsprimaExecuterName, variableName: (property) => property }
];

/**
 * Runs the function and answers the error it raised, or null where it raised none.
 *
 * Since 2026-08-29 `resolve` lets an error through instead of answering the default value
 * (SPECIFICATION.md 7), and a suite that keeps to toBe/toBeDefined/toBeUndefined asserts that by
 * hand rather than by widening its matchers.
 */
export const catchError = async (aFunction) => {
	try {
		await aFunction();
	} catch (e) {
		return e;
	}

	return null;
};

export const createResolverWithExecuterFactory = (executer) => {
	return (option) => {
		return new ExpressionResolver(Object.assign({}, option, { executer }));
	}
};

export const createResolveWithExecuterFunction = (executer) => {
	return async (expression, data, defaultValue, timeout) => {
		const resolver =  new ExpressionResolver({ executer });
		return resolver.resolve(expression, data, defaultValue, timeout);
	}
};

export const createResolveTextWithExecuterFunction = (executer) => {
	return async (expression, data, defaultValue, timeout) => {
		const resolver = new ExpressionResolver({ executer });
		return resolver.resolveText(expression, data, defaultValue, timeout);
	}
};
