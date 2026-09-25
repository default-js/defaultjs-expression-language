import { describe, it, expect } from "vitest";
import executer from "../../../src/executer/WithScopedExecuter.js";

/**
 * WithScopedExecuter - reaching a context value.
 *
 * Whether a construct carrying a context name still reaches that value. A statement addresses a
 * context value by its bare name here: the executer puts the properties of the context into scope.
 *
 * The statement is pasted unchanged, so the position of a name inside it changes nothing; the
 * cases here are the ones the executer's own strategy decides.
 *
 * Every case hands the executer a statement and a plain data context, and nothing else - no
 * resolver, so neither the chain nor a scope prefix nor a default value takes part. Only what this
 * executer guarantees is tested; what it does not do is documented in README.md rather than pinned.
 */

describe("WithScopedExecuter - reaching a context value", () => {

	it("evaluates an await inside the statement", async () => {
		// the promise comes from the context, so no global is needed
		expect(await executer.execute("await promised + 1", { promised: Promise.resolve(20) })).toBe(21);
	});

	it("addresses a context value by its bare name", async () => {
		expect(await executer.execute("value", { value: "from context" })).toBe("from context");
	});

	it("answers from the context where the global object carries the same name", async () => {
		globalThis.probe_shadowed = "from global";
		try {
			expect(await executer.execute("probe_shadowed", { probe_shadowed: "from context" })).toBe("from context");
		} finally {
			delete globalThis.probe_shadowed;
		}
	});

	it("keeps this bound to the context when a method is called", async () => {
		class Data {
			constructor() {
				this.value = "from this";
			}
			greet() {
				return this.value;
			}
		}
		expect(await executer.execute("greet()", new Data())).toBe("from this");
	});
});
