import { describe, expect } from "vitest";
import { ExpressionResolver } from "../../../index.js";
import { EXECUTERS, casesOf } from "../../ExecuterCapabilities.js";

/**
 * SPECIFICATION.md 6.3 - a resolver built without a context, asked of every executer.
 */

for (const { name: executer, variableName } of EXECUTERS) {

	// every case below is a row of the matrix, and the matrix decides whether it has to pass
	const matrixIt = casesOf("6.3", executer);

	describe(`Specification 6.3 - a link without a context [${executer}]`, () => {

		matrixIt("contributes nothing to a lookup and is passed through", async () => {
			const variableNameValue = variableName("value");
			const root = new ExpressionResolver({ context: { value: "from root" }, name: "root", executer });
			const middle = new ExpressionResolver({ context: null, name: "middle", parent: root, executer });
			const leaf = new ExpressionResolver({ context: { leafOnly: 1 }, name: "leaf", parent: middle, executer });
			const result = await leaf.resolve(`\${${variableNameValue}}`, "fallback");
			expect(result).toBe("from root");
		});

		matrixIt("gains content like any other link", async () => {
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
