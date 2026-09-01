import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../../index.js";
import { EXECUTERS } from "../../ExecuterCapabilities.js";

/**
 * SPECIFICATION.md 6.1 - the proxy seen through a statement, asked of every executer.
 *
 * What the proxy does without a statement in play - that it is not the object handed in, that it
 * enumerates the chain - is resolver API and runs once, in the general suite. Here is what reaches
 * an executer: every one of them reads the context in its own way, and the deconstruction one reads
 * all its names before it runs anything.
 */

for (const { name: executer, variableName } of EXECUTERS) {

	describe(`Specification 6.1 - every access goes through the proxy [${executer}]`, () => {

		it("resolves over a context the caller froze", async () => {
			const resolver = new ExpressionResolver({ context: Object.freeze({ own: "frozen" }), name: "solo", executer });
			expect(await resolver.resolve(`\${ ${variableName("own")} }`)).toBe("frozen");
		});

		// A context may carry any key. The resolver filters none of them since 2026-08-30, so an
		// executer that turns names into code has to skip what it cannot express instead of
		// failing over it - see DECISIONS.md. Carried over from test/ExecuterTests/, where three
		// of the four executers pinned this separately as "illegal object member".
		it("resolves over a context carrying a key that is not a variable name", async () => {
			const context = { known: "from context" };
			context["not-a-name"] = true;
			const resolver = new ExpressionResolver({ context, name: "root", executer });
			expect(await resolver.resolve(`\${${variableName("known")}}`)).toBe("from context");
		});
	});
}
