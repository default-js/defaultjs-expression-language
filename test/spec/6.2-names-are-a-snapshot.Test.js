import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { useTestExecuter, answersFromContext, answerWith } from "../TestExecuter.js";

/**
 * SPECIFICATION.md 6.2 - names are a snapshot, values are live.
 *
 * Both halves are kept by the context the resolver hands to the executer, so they are asked of that
 * context: whether it says it carries a name, and what it reads under one. No statement is
 * evaluated.
 */

useTestExecuter();
// the answer is the value the context carries under the statement - a lookup, so what a case
// reads is what the context answers at that moment
answersFromContext();

// whether the context says it carries the name - the snapshot half of the rule
const answerPresence = () => answerWith((aStatement, aContext) => aStatement in aContext);

describe("Specification 6.2 - names are a snapshot, values are live", () => {

	it("does not see a key added to the handed-in object after the resolver was built", async () => {
		answerPresence();
		const handed = { known: 1 };
		const resolver = new ExpressionResolver({ context: handed, name: "root" });
		handed.added = 2;
		expect(await resolver.resolve("${added}")).toBe(false);
	});

	it("sees that key after resetCache", async () => {
		const handed = { known: 1 };
		const resolver = new ExpressionResolver({ context: handed, name: "root" });
		handed.added = 2;
		resolver.contextHandle.resetCache();
		expect(await resolver.resolve("${added}", "fallback")).toBe(2);
	});

	it("reads a value at the moment of the lookup, so a mutation is visible immediately", async () => {
		const handed = { holder: { name: "before" } };
		const resolver = new ExpressionResolver({ context: handed, name: "root" });
		handed.holder.name = "after";
		expect((await resolver.resolve("${holder}")).name).toBe("after");
	});

	it("keeps the set of names in step when a value is written through the resolver", async () => {
		const resolver = new ExpressionResolver({ context: { known: 1 }, name: "root" });
		resolver.updateData("fresh", 2);
		expect(await resolver.resolve("${fresh}", "fallback")).toBe(2);
	});

	it("keeps the set of names in step when a value is written through the context", async () => {
		answerWith((aStatement, aContext) => {
			aContext[aStatement] = "written";
			return aStatement in aContext;
		});
		const resolver = new ExpressionResolver({ context: { known: 1 }, name: "root" });
		expect(await resolver.resolve("${fresh}")).toBe(true);
	});
});
