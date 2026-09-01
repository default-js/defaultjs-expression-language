import ExpressionResolver from "../src/ExpressionResolver.js";

// The helpers that are not the catalogue. Which executer can what, and the list of executers
// itself, live in `ExecuterCapabilities.js`.

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
