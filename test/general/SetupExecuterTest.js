import { describe, it, expect, afterAll } from "vitest";
import { EXECUTERNAME as WithScopedName, setupExecuter as setupWithScoped } from "../../src/executer/WithScopedExecuter.js";
import { EXECUTERNAME as ContextObjectName, setupExecuter as setupContextObject } from "../../src/executer/ContextObjectExecuter.js";
import { EXECUTERNAME as ContextDeconstructorName, setupExecuter as setupContextDeconstructor } from "../../src/executer/ContextDeconstructorExecuter.js";
import { EXECUTERNAME as EsprimaName, setupExecuter as setupEsprima } from "../../src/executer/EsprimaExecuter.js";
import { ExpressionResolver } from "../../index.js";

/**
 * `setupExecuter` is the only way a consumer reaches the code cache of an executer, and it is
 * the path both cache defects of 2026-08-21 sat behind. What it cannot do is change a result:
 * a cache hit and a fresh compilation produce the same value by definition, so no assertion
 * here can tell a cached expression from a recompiled one. What is pinned instead is that the
 * three states a consumer can put an executer into all keep resolving - cached, switched off
 * through `size: 0`, and switched back on afterwards. The middle and the last of those are
 * code paths nothing else in the suite executes.
 */

/**
 * Cache size the executer modules build their cache with; the tests restore it, because the
 * cache is module state shared with every other test file.
 */
const DEFAULT_SIZE = 5000;

// the context object executer addresses the context through `ctx`, the other three take the
// bare name - see test/ExecuterTests/DirectExecuterTests/ResolveTest.js
const EXECUTERS = [
	[WithScopedName, setupWithScoped, "${test}"],
	[ContextObjectName, setupContextObject, "${ctx.test}"],
	[ContextDeconstructorName, setupContextDeconstructor, "${test}"],
	[EsprimaName, setupEsprima, "${test}"]
];

describe(`general: executer setup: `, () => {

	afterAll(() => {
		for (const [, setupExecuter] of EXECUTERS) setupExecuter({ size: DEFAULT_SIZE });
	});

	for (const [executerName, setupExecuter, expression] of EXECUTERS) {
		// the constructor picks the executer up under `executer`, and only as a name - see
		// the open TestUtils entry in BACKLOG.md before reaching for a helper here
		const resolve = async (aContext) => new ExpressionResolver({ context: aContext, executer: executerName }).resolve(expression);

		it(`${executerName}: keeps resolving with the cache switched off`, async () => {
			expect(await resolve({ test: "cached" })).toBe("cached");

			setupExecuter({ size: 0 });

			expect(await resolve({ test: "uncached" })).toBe("uncached");
			expect(await resolve({ test: "uncached again" })).toBe("uncached again");
		});

		it(`${executerName}: caches again after being switched back on`, async () => {
			setupExecuter({ size: 0 });
			setupExecuter({ size: DEFAULT_SIZE });

			expect(await resolve({ test: "first" })).toBe("first");
			expect(await resolve({ test: "second" })).toBe("second");
		});

		it(`${executerName}: serves a cached expression to a different context`, async () => {
			setupExecuter({ size: DEFAULT_SIZE });

			expect(await resolve({ test: "first" })).toBe("first");
			// same statement, wider context: the compiled code must not be bound to the
			// context it was first generated for
			expect(await resolve({ test: "second", other: true })).toBe("second");
		});
	}
});
