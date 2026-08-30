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

/**
 * A `resolve` bound to one executer: `(expression, context, defaultValue)`. The context builds the
 * resolver instead of travelling as an argument, because the instance `resolve` takes the
 * expression and a default value and nothing else (SPECIFICATION.md 4.2). Whether a default value
 * was passed is forwarded through the argument count, which is what the `DefaultValue`
 * distinction rests on, so `undefined` as a default stays different from no default at all. No
 * timeout: that one exists on the static entry points only (4.5).
 */
export const createResolveWithExecuterFunction = (executer) => {
	return async function (expression, context, defaultValue) {
		const resolver = new ExpressionResolver({ context, executer });
		return arguments.length > 2 ? resolver.resolve(expression, defaultValue) : resolver.resolve(expression);
	}
};

/**
 * The same for `resolveText`, and by the same rules.
 */
export const createResolveTextWithExecuterFunction = (executer) => {
	return async function (text, context, defaultValue) {
		const resolver = new ExpressionResolver({ context, executer });
		return arguments.length > 2 ? resolver.resolveText(text, defaultValue) : resolver.resolveText(text);
	}
};
