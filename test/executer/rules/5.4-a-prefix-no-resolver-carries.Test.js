import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../../index.js";
import { EXECUTERS } from "../../ExecuterCapabilities.js";

/**
 * SPECIFICATION.md 5.4 - a scope prefix no resolver of the chain carries, asked of every executer.
 *
 * **Not a capability, so no row and no state** (2026-09-05): what is asked here is the resolver's
 * work, not the executer's. It needs a real implementation to be seen at all, which is why it runs
 * under all four as a plain `it` - a failure is a red gate the ordinary way, and there is nothing
 * an executer may decline.
 */

for (const { name: executer, variableName } of EXECUTERS) {

	describe(`Specification 5.4 - a prefix no link carries [${executer}]`, () => {

		it("answers undefined", async () => {
			const variableNameValue = variableName("value");
			const root = new ExpressionResolver({ context: { value: "from root" }, name: "root", executer });
			const leaf = new ExpressionResolver({ context: { value: "from leaf" }, name: "leaf", parent: root, executer });
			const result = await leaf.resolveText(`\${nowhere::${variableNameValue}}`);
			expect(result).toBe("undefined");
		});

		it("lets the default value apply", async () => {
			const variableNameValue = variableName("value");
			const root = new ExpressionResolver({ context: { value: "from root" }, name: "root", executer });
			const leaf = new ExpressionResolver({ context: { value: "from leaf" }, name: "leaf", parent: root, executer });
			const result = await leaf.resolveText(`\${nowhere::${variableNameValue}}`, "fallback");
			expect(result).toBe("fallback");
		});
	});
}
