import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { useTestExecuter, answersFromContext } from "../TestExecuter.js";

/**
 * SPECIFICATION.md 6.3 - a resolver built without a context, seen without executing a statement.
 *
 * That it is passed through is resolver API. It shows through `getData`, which walks the chain by
 * the rule of 5.2, and through the context a statement is handed, which is asked by a lookup.
 */

useTestExecuter();
// the answer is the value the context carries under the statement - a lookup, so what a case
// reads is which resolver answered, not what anybody computed
answersFromContext();

describe("Specification 6.3 - a resolver without a context", () => {

	// It holds no object at all, so it carries no name - not even one every object inherits. With
	// `{}` it answered the names of Object.prototype itself instead of passing them on.
	it("passes a name of Object.prototype through to the resolver above", async () => {
		const root = new ExpressionResolver({ context: { valueOf: "from root" }, name: "root" });
		const leaf = new ExpressionResolver({ name: "leaf", parent: root });
		expect(leaf.getData("valueOf")).toBe("from root");
	});

	it("contributes nothing to a lookup and is passed through", async () => {
		const root = new ExpressionResolver({ context: { value: "from root" }, name: "root" });
		const middle = new ExpressionResolver({ context: null, name: "middle", parent: root });
		const leaf = new ExpressionResolver({ context: { leafOnly: 1 }, name: "leaf", parent: middle });
		expect(await leaf.resolve("${value}", "fallback")).toBe("from root");
	});

	it("gains content like any other resolver", async () => {
		const root = new ExpressionResolver({ context: { value: "from root" }, name: "root" });
		const middle = new ExpressionResolver({ context: null, name: "middle", parent: root });
		const leaf = new ExpressionResolver({ context: { leafOnly: 1 }, name: "leaf", parent: middle });
		middle.mergeContext({ value: "from middle" });
		expect(await leaf.resolve("${value}", "fallback")).toBe("from middle");
	});
});
