import { describe, expect } from "vitest";
import { ExpressionResolver } from "../../../index.js";
import { EXECUTERS, casesOf } from "../../ExecuterCapabilities.js";

/**
 * SPECIFICATION.md 8.4 - `setupExecuter` and the code cache of each implementation.
 *
 * `setupExecuter` is the only way a consumer reaches the code cache of an executer, and it is the
 * path both cache defects of 2026-08-21 sat behind. What it cannot do is change a result: a cache
 * hit and a fresh compilation produce the same value by definition, so **no case here proves
 * caching**. What is pinned is that the three states a consumer can put an executer into all keep
 * resolving - cached, switched off, and switched back on - of which the middle and the last are
 * code paths nothing else in the suite runs.
 *
 * Until 2026-09-01 this was asked twice: once here per executer and once more in the general suite,
 * where the same three states were compressed into one case. The general one is gone.
 */

/** the size the executer modules build their cache with; restored, because it is module state */
const DEFAULT_SIZE = 5000;

for (const { name: executer, variableName, setupExecuter } of EXECUTERS) {

	// every case below is a row of the matrix, and the matrix decides whether it has to pass
	const matrixIt = casesOf("8.4", executer);

	describe(`Specification 8.4 - tuning [${executer}]`, () => {

		const expression = `\${${variableName("test")}}`;
		// the constructor takes the executer by name, and only by name - see the open TestUtils entry
		// in BACKLOG.md before reaching for a helper here
		const resolve = async (aContext) => new ExpressionResolver({ context: aContext, executer }).resolve(expression);

		matrixIt("keeps resolving with the cache switched off", async () => {
			expect(await resolve({ test: "cached" })).toBe("cached");

			setupExecuter({ size: 0 });
			try {
				expect(await resolve({ test: "uncached" })).toBe("uncached");
				expect(await resolve({ test: "uncached again" })).toBe("uncached again");
			} finally {
				setupExecuter({ size: DEFAULT_SIZE });
			}
		});

		matrixIt("caches again after being switched back on", async () => {
			setupExecuter({ size: 0 });
			setupExecuter({ size: DEFAULT_SIZE });

			expect(await resolve({ test: "first" })).toBe("first");
			expect(await resolve({ test: "second" })).toBe("second");
		});

		matrixIt("serves a cached expression to a different context", async () => {
			setupExecuter({ size: DEFAULT_SIZE });

			expect(await resolve({ test: "first" })).toBe("first");
			// same statement, wider context: the compiled code must not be bound to the context it was
			// first generated for
			expect(await resolve({ test: "second", other: true })).toBe("second");
		});
	});
}
