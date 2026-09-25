import { describe, it, expect } from "vitest";
import executer, { setupExecuter } from "../../../src/executer/ContextDeconstructorExecuter.js";
import { catchError } from "../../TestUtils.js";

/**
 * ContextDeconstructorExecuter - the compiled code cache.
 *
 * That the executer keeps answering in every state of its code cache, reached through
 * `setupExecuter`. A cache hit and a fresh compilation answer the same value, so no case proves
 * caching; what is pinned is that every state a consumer can put the executer into keeps executing.
 *
 * Every case hands the executer a statement and a plain data context, and nothing else - no
 * resolver, so neither the chain nor a scope prefix nor a default value takes part. Only what this
 * executer guarantees is tested; what it does not do is documented in README.md rather than pinned.
 */

/** the size the executer module builds its cache with; restored, because it is module state */
const DEFAULT_SIZE = 5000;

const STATEMENT = "test";

describe("ContextDeconstructorExecuter - the compiled code cache", () => {

	it("keeps executing with the cache switched off", async () => {
		expect(await executer.execute(STATEMENT, { test: "cached" })).toBe("cached");

		setupExecuter({ size: 0 });
		try {
			expect(await executer.execute(STATEMENT, { test: "uncached" })).toBe("uncached");
			expect(await executer.execute(STATEMENT, { test: "uncached again" })).toBe("uncached again");
		} finally {
			setupExecuter({ size: DEFAULT_SIZE });
		}
	});

	it("serves a statement to a context that did not carry its name before", async () => {
		// What the first call answers is not asserted; the second must not be served code compiled
		// without the name.
		setupExecuter({ size: DEFAULT_SIZE });

		await catchError(() => executer.execute("carried", { other: 1 }));

		expect(await executer.execute("carried", { carried: "hit" })).toBe("hit");
	});
});
