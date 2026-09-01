import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";

/**
 * SPECIFICATION.md 5.1 - name and parent of a resolver.
 *
 * Never executes a statement, so it runs once. The lookup itself - 5.2 to 5.4 - is asked of every
 * executer in test/executer/rules/.
 */

describe("Specification 5.1 - structure", () => {

	it("keeps the name the caller passed", async () => {
		const resolver = new ExpressionResolver({ context: {}, name: "root" });
		expect(resolver.name).toBe("root");
	});

	// The shape of a generated name is not specified - only that it is unique and obeys the
	// character rule of 3.3, so that it can appear in a chain path and be addressed like any
	// other. Uniqueness is the test below.
	it("generates a name where the caller passed none", async () => {
		const resolver = new ExpressionResolver({ context: {} });
		expect(typeof resolver.name).toBe("string");
		expect(/^[a-zA-Z0-9\-_\s]+$/.test(resolver.name)).toBe(true);
	});

	it("generates a different name for every unnamed resolver", async () => {
		const first = new ExpressionResolver({ context: {} });
		const second = new ExpressionResolver({ context: {} });
		expect(first.name !== second.name).toBe(true);
	});

	it("answers null as the parent of a resolver that has none", async () => {
		const root = new ExpressionResolver({ context: {}, name: "root" });
		expect(root.parent).toBe(null);
	});

	it("points a link at its parent", async () => {
		const root = new ExpressionResolver({ context: {}, name: "root" });
		const leaf = new ExpressionResolver({ context: {}, name: "leaf", parent: root });
		expect(leaf.parent === root).toBe(true);
	});
});
