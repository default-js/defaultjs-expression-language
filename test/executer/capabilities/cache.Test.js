import { describe, expect } from "vitest";
import { ExpressionResolver } from "../../../index.js";
import { EXECUTERS, casesOf } from "../../ExecuterCapabilities.js";

/**
 * Capability `cache` - whether the executer keeps answering in every state of its code cache.
 * Read against SPECIFICATION.md 8.4.
 *
 * `setupExecuter` is the only way a consumer reaches the code cache of an executer, and it is the
 * path both cache defects of 2026-08-21 sat behind. What it cannot do is change a result: a cache
 * hit and a fresh compilation produce the same value by definition, so **no case here proves
 * caching**. What is pinned is that the three states a consumer can put an executer into all keep
 * resolving - cached, switched off, and switched back on - of which the middle and the last are code
 * paths nothing else in the suite runs.
 */

/** the size the executer modules build their cache with; restored, because it is module state */
const DEFAULT_SIZE = 5000;

for (const { name: executer, variableName, setupExecuter } of EXECUTERS) {

	// every case below is a row of the catalogue, and the catalogue decides whether it has to pass
	const capabilityIt = casesOf("cache", executer);

	describe(`Capability cache - tuning the compiled code cache [${executer}]`, () => {

		const expression = `\${${variableName("test")}}`;
		// the constructor takes the executer by name, and only by name - see the open TestUtils entry
		// in BACKLOG.md before reaching for a helper here
		const resolve = async (aContext) => new ExpressionResolver({ context: aContext, executer }).resolve(expression);

		capabilityIt("keeps resolving with the cache switched off", async () => {
			expect(await resolve({ test: "cached" })).toBe("cached");

			setupExecuter({ size: 0 });
			try {
				expect(await resolve({ test: "uncached" })).toBe("uncached");
				expect(await resolve({ test: "uncached again" })).toBe("uncached again");
			} finally {
				setupExecuter({ size: DEFAULT_SIZE });
			}
		});

		capabilityIt("caches again after being switched back on", async () => {
			setupExecuter({ size: 0 });
			setupExecuter({ size: DEFAULT_SIZE });

			expect(await resolve({ test: "first" })).toBe("first");
			expect(await resolve({ test: "second" })).toBe("second");
		});

		capabilityIt("serves a cached expression to a different context", async () => {
			setupExecuter({ size: DEFAULT_SIZE });

			expect(await resolve({ test: "first" })).toBe("first");
			// same statement, wider context: the compiled code must not be bound to the context it was
			// first generated for
			expect(await resolve({ test: "second", other: true })).toBe("second");
		});

		// The sharper half of the row above, and the one that says what a cache key has to carry: the
		// **first** context does not have the name the statement reads, the second does. An executer
		// that compiles the names of a context into the code - the deconstructor does - has to key its
		// cache on them, or the second call is served code that never looks the name up. What the
		// first call answers is that executer's business and is not asserted (7).
		capabilityIt("serves a statement to a context that did not carry its name before", async () => {
			setupExecuter({ size: DEFAULT_SIZE });
			const statement = `\${${variableName("carried")}}`;

			await new ExpressionResolver({ context: { other: 1 }, executer }).resolveText(statement);

			const resolver = new ExpressionResolver({ context: { carried: "hit" }, executer });
			expect(await resolver.resolve(statement)).toBe("hit");
		});

		// `test/general/CodeCacheTest.js` pins the eviction itself, on the cache alone. What is asked
		// here is the other side of it: that an executer whose entry was evicted compiles again and
		// answers the same, rather than serving something stale or nothing.
		capabilityIt("keeps answering while its cache evicts", async () => {
			setupExecuter({ size: 1 });
			try {
				expect(await resolve({ test: "first" })).toBe("first");

				// a second statement, enough to push the first out of a cache that holds one entry
				const other = new ExpressionResolver({ context: { test: "unused" }, executer });
				expect(await other.resolve("${ 1 + 1 }")).toBe(2);

				expect(await resolve({ test: "third" })).toBe("third");
			} finally {
				setupExecuter({ size: DEFAULT_SIZE });
			}
		});
	});
}
