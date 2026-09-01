import { describe, expect } from "vitest";
import { ExpressionResolver } from "../../../index.js";
import { EXECUTERS, casesOf } from "../../ExecuterCapabilities.js";

/**
 * SPECIFICATION.md 5.3 - the resolver a scope prefix addresses, asked of every executer.
 *
 * Written against `resolveText`: what a text answers where a statement raises is the expression
 * itself, which differs from executer to executer only in whether it raises at all. That the
 * instance `resolve` parses a prefix as well is 4.3 and pinned in the general suite.
 */

for (const { name: executer, variableName } of EXECUTERS) {

	// every case below is a row of the matrix, and the matrix decides whether it has to pass
	const matrixIt = casesOf("5.3", executer);

	describe(`Specification 5.3 - lookup with a prefix [${executer}]`, () => {

		matrixIt("addresses the link the call is made on", async () => {
			const variableNameValue = variableName("value");
			const root = new ExpressionResolver({ context: { value: "from root" }, name: "root", executer });
			const leaf = new ExpressionResolver({ context: { value: "from leaf" }, name: "leaf", parent: root, executer });
			const result = await leaf.resolveText(`\${leaf::${variableNameValue}}`);
			expect(result).toBe("from leaf");
		});

		matrixIt("climbs to the ancestor the prefix names", async () => {
			const variableNameValue = variableName("value");
			const root = new ExpressionResolver({ context: { value: "from root" }, name: "root", executer });
			const leaf = new ExpressionResolver({ context: { value: "from leaf" }, name: "leaf", parent: root, executer });
			const result = await leaf.resolveText(`\${root::${variableNameValue}}`);
			expect(result).toBe("from root");
		});

		matrixIt("evaluates against the addressed link and the contexts above it", async () => {
			const variableNameRootOnly = variableName("rootOnly");
			const root = new ExpressionResolver({ context: { rootOnly: "from root" }, name: "root", executer });
			const middle = new ExpressionResolver({ context: { middleOnly: "from middle" }, name: "middle", parent: root, executer });
			const leaf = new ExpressionResolver({ context: { leafOnly: "from leaf" }, name: "leaf", parent: middle, executer });
			const result = await leaf.resolveText(`\${middle::${variableNameRootOnly}}`);
			expect(result).toBe("from root");
		});

		matrixIt("answers from the first link carrying the name, climbing towards the root", async () => {
			const variableNameValue = variableName("value");
			const outer = new ExpressionResolver({ context: { value: "from outer" }, name: "dup", executer });
			const inner = new ExpressionResolver({ context: { value: "from inner" }, name: "dup", parent: outer, executer });
			const leaf = new ExpressionResolver({ context: { value: "from leaf" }, name: "leaf", parent: inner, executer });
			const result = await leaf.resolveText(`\${dup::${variableNameValue}}`);
			expect(result).toBe("from inner");
		});

		// What the text answers differs per executer - the expression stands where the statement
		// raised, the default applies where it merely answered undefined (7) - so what is asserted
		// is the rule itself: the value of the link below is not reachable from the addressed one.
		matrixIt("does not see a link below the one the prefix names", async () => {
			const variableNameLeafOnly = variableName("leafOnly");
			const root = new ExpressionResolver({ context: { rootOnly: "from root" }, name: "root", executer });
			const leaf = new ExpressionResolver({ context: { leafOnly: "from leaf" }, name: "leaf", parent: root, executer });
			const result = await leaf.resolveText(`\${root::${variableNameLeafOnly}}`, "fallback");
			expect(result.includes("from leaf")).toBe(false);
		});
	});
}
