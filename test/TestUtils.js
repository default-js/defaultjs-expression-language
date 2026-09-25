// Helpers the test files share.

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
