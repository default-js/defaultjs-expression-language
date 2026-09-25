import { describe, it, expect } from "vitest";
import executer from "../../../src/executer/ContextDeconstructorExecuter.js";

/**
 * ContextDeconstructorExecuter - the global object from a statement.
 *
 * Which globals a statement reaches, and which writes stay off the global object. A case that could
 * leave a name on the global object reads it and cleans up before it asserts.
 *
 * Every case hands the executer a statement and a plain data context, and nothing else - no
 * resolver, so neither the chain nor a scope prefix nor a default value takes part. Only what this
 * executer guarantees is tested; what it does not do is documented in README.md rather than pinned.
 */

describe("ContextDeconstructorExecuter - the global object from a statement", () => {

	it("reaches a global the caller planted", async () => {
		globalThis.planted_global = "from global";
		try {
			expect(await executer.execute("planted_global", { known: 1 })).toBe("from global");
		} finally {
			delete globalThis.planted_global;
		}
	});
});
