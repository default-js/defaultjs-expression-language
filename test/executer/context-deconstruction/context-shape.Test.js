import { describe, it, expect } from "vitest";
import executer from "../../../src/executer/ContextDeconstructorExecuter.js";

/**
 * ContextDeconstructorExecuter - what a context may be.
 *
 * Which structures this executer runs a statement over. A statement that only has to survive the
 * context is `1 + 1`, which touches no name: where it fails, the context broke the execution.
 *
 * Every case hands the executer a statement and a plain data context, and nothing else - no
 * resolver, so neither the chain nor a scope prefix nor a default value takes part. Only what this
 * executer guarantees is tested; what it does not do is documented in README.md rather than pinned.
 */

describe("ContextDeconstructorExecuter - what a context may be", () => {

	it("runs a statement over a context carrying a key named context", async () => {
		expect(await executer.execute("known", { context: "own context", known: "from context" })).toBe("from context");
	});

	it("runs a statement over the global object as context", async () => {
		// The global object carries names no variable can have, and this executer binds every name of a
		// context - except for the global object, whose names a statement reaches through the ordinary scope
		// chain anyway.
		expect(await executer.execute("Math.round(1.5)", globalThis)).toBe(2);
	});
});
