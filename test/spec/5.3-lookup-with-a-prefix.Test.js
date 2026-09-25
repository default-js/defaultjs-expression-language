import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { useTestExecuter, answersFromContext } from "../TestExecuter.js";

/**
 * SPECIFICATION.md 5.3 - which resolver a scope prefix addresses, and what it sees from there.
 *
 * How the prefix is read is 3.3. This file asks where the walk to the named resolver ends and which
 * context the statement is then handed - the resolver's work, so no statement is evaluated: the
 * answer is a lookup in the context that arrived.
 */

useTestExecuter();
// the answer is the value the context carries under the statement - a lookup, so what a case
// reads is which resolver answered, not what anybody computed
answersFromContext();

describe("Specification 5.3 - lookup with a prefix", () => {

	it("addresses the resolver the call is made on", async () => {
		const root = new ExpressionResolver({ context: { value: "from root" }, name: "root" });
		const leaf = new ExpressionResolver({ context: { value: "from leaf" }, name: "leaf", parent: root });
		expect(await leaf.resolveText("${leaf::value}")).toBe("from leaf");
	});

	it("climbs to the ancestor the prefix names", async () => {
		const root = new ExpressionResolver({ context: { value: "from root" }, name: "root" });
		const leaf = new ExpressionResolver({ context: { value: "from leaf" }, name: "leaf", parent: root });
		expect(await leaf.resolveText("${root::value}")).toBe("from root");
	});

	it("evaluates against the addressed resolver and the contexts above it", async () => {
		const root = new ExpressionResolver({ context: { rootOnly: "from root" }, name: "root" });
		const middle = new ExpressionResolver({ context: { middleOnly: "from middle" }, name: "middle", parent: root });
		const leaf = new ExpressionResolver({ context: { leafOnly: "from leaf" }, name: "leaf", parent: middle });
		expect(await leaf.resolveText("${middle::rootOnly}")).toBe("from root");
	});

	it("answers from the first resolver carrying the name, climbing towards the root", async () => {
		const outer = new ExpressionResolver({ context: { value: "from outer" }, name: "dup" });
		const inner = new ExpressionResolver({ context: { value: "from inner" }, name: "dup", parent: outer });
		const leaf = new ExpressionResolver({ context: { value: "from leaf" }, name: "leaf", parent: inner });
		expect(await leaf.resolveText("${dup::value}")).toBe("from inner");
	});

	it("does not see a resolver below the one the prefix names", async () => {
		const root = new ExpressionResolver({ context: { rootOnly: "from root" }, name: "root" });
		const leaf = new ExpressionResolver({ context: { leafOnly: "from leaf" }, name: "leaf", parent: root });
		expect(await leaf.resolveText("${root::leafOnly}", "fallback")).toBe("fallback");
	});
});
