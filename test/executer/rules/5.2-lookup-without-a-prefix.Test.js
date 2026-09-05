import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../../index.js";
import { EXECUTERS } from "../../ExecuterCapabilities.js";

/**
 * SPECIFICATION.md 5.2 - which resolver of the chain answers a name, asked of every executer.
 *
 * A lookup runs a statement, so every implementation has to answer these. None of them is a
 * capability: 8.3 lets an executer decide how a statement reaches a context value, never which
 * resolver answers it. The spelling comes from the catalogue through `variableName`, so what is
 * measured is the chain and not the dialect.
 *
 * **Not a capability, so no row and no state** (2026-09-05): what is asked here is the resolver's
 * work, not the executer's. It needs a real implementation to be seen at all, which is why it runs
 * under all four as a plain `it` - a failure is a red gate the ordinary way, and there is nothing
 * an executer may decline.
 */

for (const { name: executer, variableName } of EXECUTERS) {

	describe(`Specification 5.2 - lookup without a prefix [${executer}]`, () => {

		it("answers from the nearest link and shadows the links above", async () => {
			const variableNameValue = variableName("value");
			const root = new ExpressionResolver({ context: { value: "from root" }, name: "root", executer });
			const leaf = new ExpressionResolver({ context: { value: "from leaf" }, name: "leaf", parent: root, executer });
			const result = await leaf.resolve(`\${${variableNameValue}}`, "fallback");
			expect(result).toBe("from leaf");
		});

		it("reaches a value carried by an ancestor", async () => {
			const variableNameRootOnly = variableName("rootOnly");
			const root = new ExpressionResolver({ context: { rootOnly: "from root" }, name: "root", executer });
			const leaf = new ExpressionResolver({ context: { leafOnly: "from leaf" }, name: "leaf", parent: root, executer });
			const result = await leaf.resolve(`\${${variableNameRootOnly}}`, "fallback");
			expect(result).toBe("from root");
		});

		// Asked through resolveText, not resolve: under two of the four executers a name no link
		// carries raises a ReferenceError, and resolve lets that through since 2026-08-29 (7). What
		// the text then answers still differs per executer - the expression stands where the
		// statement raised, the default applies where it merely answered undefined - so what is
		// asserted is the rule itself: the value of the link below is not reachable.
		it("never sees the context of a link below", async () => {
			const variableNameLeafOnly = variableName("leafOnly");
			const root = new ExpressionResolver({ context: { rootOnly: "from root" }, name: "root", executer });
			new ExpressionResolver({ context: { leafOnly: "from leaf" }, name: "leaf", parent: root, executer });
			const result = await root.resolveText(`\${${variableNameLeafOnly}}`, "fallback");
			expect(result.includes("from leaf")).toBe(false);
		});

		it("stops the walk at a key that holds undefined", async () => {
			const variableNameValue = variableName("value");
			const root = new ExpressionResolver({ context: { value: "from root" }, name: "root", executer });
			const leaf = new ExpressionResolver({ context: { value: undefined }, name: "leaf", parent: root, executer });
			const result = await leaf.resolve(`\${${variableNameValue}}`);
			expect(result).toBeUndefined();
		});

		it("reaches a getter inherited through the prototype chain", async () => {
			class Data {
				get value() {
					return "from getter";
				}
			}
			const variableNameValue = variableName("value");
			const resolver = new ExpressionResolver({ context: new Data(), name: "root", executer });
			const result = await resolver.resolve(`\${${variableNameValue}}`, "fallback");
			expect(result).toBe("from getter");
		});

		it("reaches a method inherited through the prototype chain", async () => {
			class Data {
				greet() {
					return "from method";
				}
			}
			const variableNameGreet = variableName("greet");
			const resolver = new ExpressionResolver({ context: new Data(), name: "root", executer });
			const result = await resolver.resolve(`\${${variableNameGreet}()}`, "fallback");
			expect(result).toBe("from method");
		});
	});
}
