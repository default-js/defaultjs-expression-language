import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../../index.js";
import { EXECUTERS } from "../../ExecuterCapabilities.js";

/**
 * SPECIFICATION.md 6.3 - a resolver built without a context, asked of every executer.
 *
 * **Not a capability, so no row and no state** (2026-09-05): what is asked here is the resolver's
 * work, not the executer's. It needs a real implementation to be seen at all, which is why it runs
 * under all four as a plain `it` - a failure is a red gate the ordinary way, and there is nothing
 * an executer may decline.
 */

for (const { name: executer, variableName } of EXECUTERS) {

	describe(`Specification 6.3 - a link without a context [${executer}]`, () => {

		it("contributes nothing to a lookup and is passed through", async () => {
			const variableNameValue = variableName("value");
			const root = new ExpressionResolver({ context: { value: "from root" }, name: "root", executer });
			const middle = new ExpressionResolver({ context: null, name: "middle", parent: root, executer });
			const leaf = new ExpressionResolver({ context: { leafOnly: 1 }, name: "leaf", parent: middle, executer });
			const result = await leaf.resolve(`\${${variableNameValue}}`, "fallback");
			expect(result).toBe("from root");
		});

		it("gains content like any other link", async () => {
			const variableNameValue = variableName("value");
			const root = new ExpressionResolver({ context: { value: "from root" }, name: "root", executer });
			const middle = new ExpressionResolver({ context: null, name: "middle", parent: root, executer });
			const leaf = new ExpressionResolver({ context: { leafOnly: 1 }, name: "leaf", parent: middle, executer });
			middle.mergeContext({ value: "from middle" });
			const result = await leaf.resolve(`\${${variableNameValue}}`, "fallback");
			expect(result).toBe("from middle");
		});
	});
}
