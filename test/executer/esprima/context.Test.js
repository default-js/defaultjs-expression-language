import { describe, it, expect } from "vitest";
import executer from "../../../src/executer/EsprimaExecuter.js";

/**
 * EsprimaExecuter - reaching a context value.
 *
 * Whether a construct carrying a context name still reaches that value. A statement addresses a
 * context value by its bare name here: the executer puts the properties of the context into scope.
 *
 * Its rewrite reaches a name only where the traversal walks, so every position is a case.
 *
 * Every case hands the executer a statement and a plain data context, and nothing else - no
 * resolver, so neither the chain nor a scope prefix nor a default value takes part. Only what this
 * executer guarantees is tested; what it does not do is documented in README.md rather than pinned.
 */

describe("EsprimaExecuter - reaching a context value", () => {

	it("evaluates an operator expression over the context", async () => {
		expect(await executer.execute("a * b", { a: 6, b: 7 })).toBe(42);
	});

	it("evaluates a call on a context member", async () => {
		expect(await executer.execute("value.toUpperCase()", { value: "text" })).toBe("TEXT");
	});

	it("evaluates an await inside the statement", async () => {
		// the promise comes from the context, so no global is needed
		expect(await executer.execute("await promised + 1", { promised: Promise.resolve(20) })).toBe(21);
	});

	it("addresses a context value by its bare name", async () => {
		expect(await executer.execute("value", { value: "from context" })).toBe("from context");
	});

	it("reads a context value from inside a template literal", async () => {
		expect(await executer.execute("`a${value}b`", { value: "from context" })).toBe("afrom contextb");
	});

	it("answers from the context where the global object carries the same name", async () => {
		globalThis.probe_shadowed = "from global";
		try {
			expect(await executer.execute("probe_shadowed", { probe_shadowed: "from context" })).toBe("from context");
		} finally {
			delete globalThis.probe_shadowed;
		}
	});

	it("reaches a context value on both sides of a nullish coalescing operator", async () => {
		const context = { nothing: null, value: "from context" };
		expect(await executer.execute("nothing ?? value", context)).toBe("from context");
	});

	it("reaches a context value through a deep member access", async () => {
		const context = { deep: { middle: { leaf: "from context" } } };
		expect(await executer.execute("deep.middle.leaf", context)).toBe("from context");
	});

	it("reaches a context value through an optional chain", async () => {
		const context = { deep: { middle: { leaf: "from context" } } };
		expect(await executer.execute("deep?.middle?.leaf", context)).toBe("from context");
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

	it("reads the same context value twice within one statement", async () => {
		expect(await executer.execute("count + count", { count: 21 })).toBe(42);
	});
});
