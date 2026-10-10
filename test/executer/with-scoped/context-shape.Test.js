import { describe, it, expect } from "vitest";
import executer from "../../../src/executer/WithScopedExecuter.js";

/**
 * WithScopedExecuter - what a context may be.
 *
 * Which structures this executer runs a statement over. A statement that only has to survive the
 * context is `1 + 1`, which touches no name: where it fails, the context broke the execution.
 *
 * Every case hands the executer a statement and a plain data context, and nothing else - no
 * resolver, so neither the chain nor a scope prefix nor a default value takes part. Only what this
 * executer guarantees is tested; what it does not do is documented in README.md rather than pinned.
 */

describe("WithScopedExecuter - what a context may be", () => {

	it("runs a statement over a NodeList context", async () => {
		expect(await executer.execute("1 + 1", document.querySelectorAll("body"))).toBe(2);
	});

	it("leaves a getter of the context unread when the statement does not touch it", async () => {
		let reads = 0;
		const context = { known: "from context" };
		Object.defineProperty(context, "counted", {
			get: () => {
				reads++;
				return "read";
			},
			enumerable: true,
			configurable: true
		});
		await executer.execute("1 + 1", context);
		expect(reads).toBe(0);
	});
});
