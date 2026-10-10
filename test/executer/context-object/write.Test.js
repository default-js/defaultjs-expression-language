import { describe, it, expect } from "vitest";
import executer from "../../../src/executer/ContextObjectExecuter.js";

/**
 * ContextObjectExecuter - what a write leaves behind.
 *
 * What an assignment inside a statement leaves behind in the context it was handed.
 *
 * Every case hands the executer a statement and a plain data context, and nothing else - no
 * resolver, so neither the chain nor a scope prefix nor a default value takes part. Only what this
 * executer guarantees is tested; what it does not do is documented in README.md rather than pinned.
 */

describe("ContextObjectExecuter - what a write leaves behind", () => {

	it("creates a name the context does not carry in the context", async () => {
		const context = { known: 1 };
		await executer.execute('ctx.created = "created"', context);
		expect(context.created).toBe("created");
	});
});
