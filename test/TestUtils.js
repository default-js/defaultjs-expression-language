import ExpressionResolver from "../src/ExpressionResolver.js";
import { EXECUTERNAME as WithScopedExecuterName, setupExecuter as setupWithScopedExecuter } from "../src/executer/WithScopedExecuter.js";
import { EXECUTERNAME as ContextObjectExecuterName, setupExecuter as setupContextObjectExecuter } from "../src/executer/ContextObjectExecuter.js";
import { EXECUTERNAME as ContextDeconstructorExecuterName, setupExecuter as setupContextDeconstructorExecuter } from "../src/executer/ContextDeconstructorExecuter.js";
import { EXECUTERNAME as EsprimaExecuterName, setupExecuter as setupEsprimaExecuter } from "../src/executer/EsprimaExecuter.js";

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
