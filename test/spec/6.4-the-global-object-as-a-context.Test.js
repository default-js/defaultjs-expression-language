import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { useTestExecuter, answersFromContext, answerWith } from "../TestExecuter.js";

/**
 * SPECIFICATION.md 6.4 - the global object handed in as a context.
 *
 * How a statement reaches a global otherwise is the executer's own. What is here is the resolver's
 * share: a resolver over the global object is an ordinary one of the chain, it carries every name,
 * and it contributes none to the enumeration of a resolver below it. Asked of the context a statement
 * is handed, so nothing is evaluated.
 */

useTestExecuter();
// the answer is the value the context carries under the statement - a lookup, so what a case
// reads is which resolver answered, not what anybody computed
answersFromContext();

describe("Specification 6.4 - the global object as a context", () => {

	it("answers a global name from a resolver over the global object", async () => {
		const resolver = new ExpressionResolver({ context: globalThis, name: "global" });
		expect((await resolver.resolve("${Math}")) === Math).toBe(true);
	});

	it("answers a global name from a resolver below a global one", async () => {
		const root = new ExpressionResolver({ context: globalThis, name: "global" });
		const leaf = new ExpressionResolver({ context: { own: "from leaf" }, name: "leaf", parent: root });
		expect((await leaf.resolve("${Math}")) === Math).toBe(true);
	});

	// Everything the global object holds is reachable through the ordinary scope chain of a statement
	// anyway, so listing it would only hand an executer that turns names into code names it never
	// needed - the index "0" of a frame, a symbol another library planted on `window`.
	it("contributes no name to the enumeration of a resolver below it", async () => {
		answerWith((aStatement, aContext) => Object.keys(aContext).join());
		const root = new ExpressionResolver({ context: globalThis, name: "global" });
		const leaf = new ExpressionResolver({ context: { own: "from leaf" }, name: "leaf", parent: root });
		expect(await leaf.resolve("${names}")).toBe("own");
	});
});
