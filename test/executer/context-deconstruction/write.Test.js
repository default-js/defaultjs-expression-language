import { describe, it, expect } from "vitest";
import executer from "../../../src/executer/ContextDeconstructorExecuter.js";

/**
 * ContextDeconstructorExecuter - what a write leaves behind.
 *
 * What an assignment inside a statement leaves behind in the context it was handed.
 *
 * Every case hands the executer a statement and a plain data context, and nothing else - no
 * resolver, so neither the chain nor a scope prefix nor a default value takes part. Only what this
 * executer guarantees is tested; what it does not do is documented in README.md rather than pinned.
 */

describe("ContextDeconstructorExecuter - what a write leaves behind", () => {

	it("makes a mutation of a context object visible in the context", async () => {
		// the statement and the context hold the same object, so nothing has to be carried back
		const context = { holder: { name: "before" } };
		await executer.execute('holder.name = "after"', context);
		expect(context.holder.name).toBe("after");
	});
});
