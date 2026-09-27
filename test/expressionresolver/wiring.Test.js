import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";
import TestExecuter from "../TestExecuter.js";

/**
 * ExpressionResolver - the wiring between a resolver and its ResolverContextHandle.
 *
 * The rules of the context - the walk of 5.2, the snapshot of 6.2, what a context answers in 6.1 -
 * are the handle's and tested in `test/resolvercontexthandle/`. What is here is one case per place
 * where the resolver connects to its handle, so that a broken connection turns something red.
 */

// answers the value the context carries under the statement - a lookup, not an evaluation
const lookup = () => new TestExecuter((aStatement, aContext) => aContext[aStatement]);

describe("ExpressionResolver - wiring to the context handle", () => {

	// The constructor builds the handle over the handle of the parent (5.1, 6.1).
	it("sees the chain through the context of a single resolver", () => {
		const root = new ExpressionResolver({ context: { rootOnly: "from root" }, name: "root" });
		const leaf = new ExpressionResolver({ context: { leafOnly: "from leaf" }, name: "leaf", parent: root });
		expect(leaf.context.rootOnly).toBe("from root");
	});

	// updateData writes through the handle, so the set of names follows and a statement is handed
	// a context that carries the new name (6.2).
	it("keeps the set of names in step when a value is written through the resolver", async () => {
		const resolver = new ExpressionResolver({ context: { known: 1 }, name: "root", executer: lookup() });
		resolver.updateData("fresh", 2);
		expect(await resolver.resolve("${fresh}", "fallback")).toBe(2);
	});
});
