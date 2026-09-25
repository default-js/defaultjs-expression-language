import { describe, it, expect } from "vitest";
import executer from "../../../src/executer/WithScopedExecuter.js";

/**
 * WithScopedExecuter - what a write leaves behind.
 *
 * What an assignment inside a statement leaves behind in the context it was handed.
 *
 * Every case hands the executer a statement and a plain data context, and nothing else - no
 * resolver, so neither the chain nor a scope prefix nor a default value takes part. Only what this
 * executer guarantees is tested; what it does not do is documented in README.md rather than pinned.
 */

describe("WithScopedExecuter - what a write leaves behind", () => {

	it("makes a write to a name the context carries visible in the context", async () => {
		const context = { known: "before" };
		await executer.execute('known = "after"', context);
		expect(context.known).toBe("after");
	});
});
