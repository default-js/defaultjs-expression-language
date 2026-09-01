import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../../index.js";

/**
 * The sections of SPECIFICATION.md this suite opens. Held against the catalogue by
 * test/general/RuleGroupTest.js: a rule that moves group has to be moved there too.
 */
export const SECTIONS = ["5.2","5.3","5.4"];

/**
 * SPECIFICATION.md 5.2, 5.3 and 5.4 - the rules of the lookup, for one executer.
 *
 * A lookup runs a statement, so every executer has to answer these. None of them is a capability:
 * 8.3 lets an executer decide how a statement reaches a context value, never which resolver of the
 * chain answers it. The spelling comes from the catalogue through `variableName`, so what is
 * measured is the chain and not the dialect.
 *
 * 5.1 and 5.5 never execute a statement - they read `name`, `parent` and the chain getters off the
 * resolver - and stay in the general suite.
 *
 * @param {{name: string, variableName: Function}} anExecuterEntry an entry of EXECUTERS
 */
export const chainRules = ({ name: executer, variableName }) => {

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

	describe(`Specification 5.3 - lookup with a prefix [${executer}]`, () => {

		it("addresses the link the call is made on", async () => {
			const variableNameValue = variableName("value");
			const root = new ExpressionResolver({ context: { value: "from root" }, name: "root", executer });
			const leaf = new ExpressionResolver({ context: { value: "from leaf" }, name: "leaf", parent: root, executer });
			const result = await leaf.resolveText(`\${leaf::${variableNameValue}}`);
			expect(result).toBe("from leaf");
		});

		it("climbs to the ancestor the prefix names", async () => {
			const variableNameValue = variableName("value");
			const root = new ExpressionResolver({ context: { value: "from root" }, name: "root", executer });
			const leaf = new ExpressionResolver({ context: { value: "from leaf" }, name: "leaf", parent: root, executer });
			const result = await leaf.resolveText(`\${root::${variableNameValue}}`);
			expect(result).toBe("from root");
		});

		it("evaluates against the addressed link and the contexts above it", async () => {
			const variableNameRootOnly = variableName("rootOnly");
			const root = new ExpressionResolver({ context: { rootOnly: "from root" }, name: "root", executer });
			const middle = new ExpressionResolver({ context: { middleOnly: "from middle" }, name: "middle", parent: root, executer });
			const leaf = new ExpressionResolver({ context: { leafOnly: "from leaf" }, name: "leaf", parent: middle, executer });
			const result = await leaf.resolveText(`\${middle::${variableNameRootOnly}}`);
			expect(result).toBe("from root");
		});

		it("answers from the first link carrying the name, climbing towards the root", async () => {
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
		it("does not see a link below the one the prefix names", async () => {
			const variableNameLeafOnly = variableName("leafOnly");
			const root = new ExpressionResolver({ context: { rootOnly: "from root" }, name: "root", executer });
			const leaf = new ExpressionResolver({ context: { leafOnly: "from leaf" }, name: "leaf", parent: root, executer });
			const result = await leaf.resolveText(`\${root::${variableNameLeafOnly}}`, "fallback");
			expect(result.includes("from leaf")).toBe(false);
		});
	});

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
};
