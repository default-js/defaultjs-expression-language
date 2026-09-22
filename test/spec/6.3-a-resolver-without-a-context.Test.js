import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";

/**
 * SPECIFICATION.md 6.3 - a resolver built without a context, seen without executing a statement.
 *
 * That it is passed through is resolver API and shows through `getData`, which walks the chain by
 * the rule of 5.2. What a statement reads through such a resolver is asked of every executer in
 * test/executer/rules/6.3-a-resolver-without-a-context.Test.js; that file uses a name no object
 * inherits, so it cannot see the case pinned here.
 */

describe("Specification 6.3 - a resolver without a context", () => {

	// It holds no object at all, so it carries no name - not even one every object inherits. With
	// `{}` it answered the names of Object.prototype itself instead of passing them on.
	it("passes a name of Object.prototype through to the resolver above", async () => {
		const root = new ExpressionResolver({ context: { valueOf: "from root" }, name: "root" });
		const leaf = new ExpressionResolver({ name: "leaf", parent: root });
		expect(leaf.getData("valueOf")).toBe("from root");
	});
});
