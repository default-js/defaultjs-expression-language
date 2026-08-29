import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { EXECUTERS } from "../TestUtils.js";

/**
 * Conformance tests for SPECIFICATION.md section 5 - the chain.
 *
 * Split by what an executer can influence, following 8.3. A lookup runs a statement, so 5.2, 5.3
 * and 5.4 are written once per registered executer and every one of them has to keep the rule.
 * 5.1 and 5.5 never execute a statement - they read name, parent and the three chain getters off
 * ExpressionResolver - so they run once.
 *
 * Section 5.3 and 5.4 are written against resolveText here. Since 2026-08-29 the instance
 * resolve() parses a scope prefix as well - that it does, and that the walk carries through it,
 * is pinned in EntryPointTest.js where the rule belongs (4.3).
 *
 * The `variableName` function of the EXECUTERS table (test/TestUtils.js) is what makes the loop
 * honest: it answers the name a statement has to use to reach a given property of the context
 * under the executer at hand. Every test names that variable in a constant of its own and inserts
 * it into the expression, so what the test measures is the chain and not the spelling.
 */

describe("Specification 5.1 - structure", () => {

	it("keeps the name the caller passed", async () => {
		const resolver = new ExpressionResolver({ context: {}, name: "root" });
		expect(resolver.name).toBe("root");
	});

	// not implemented, waits for BACKLOG.md "`effectiveChain` is a copy of `chain`, and a resolver without a name"
	// The shape of a generated name is not specified - only that it is unique and obeys the
	// character rule of 3.3, so that it can appear in a chain path and be addressed like any
	// other. Uniqueness is the test below.
	it.fails("generates a name where the caller passed none", async () => {
		const resolver = new ExpressionResolver({ context: {} });
		expect(typeof resolver.name).toBe("string");
		expect(/^[a-zA-Z0-9\-_\s]+$/.test(resolver.name)).toBe(true);
	});

	// not implemented, waits for BACKLOG.md "`effectiveChain` is a copy of `chain`, and a resolver without a name"
	it.fails("generates a different name for every unnamed resolver", async () => {
		const first = new ExpressionResolver({ context: {} });
		const second = new ExpressionResolver({ context: {} });
		expect(first.name !== second.name).toBe(true);
	});

	it("answers null as the parent of a resolver that has none", async () => {
		const root = new ExpressionResolver({ context: {}, name: "root" });
		expect(root.parent).toBe(null);
	});

	it("points a link at its parent", async () => {
		const root = new ExpressionResolver({ context: {}, name: "root" });
		const leaf = new ExpressionResolver({ context: {}, name: "leaf", parent: root });
		expect(leaf.parent === root).toBe(true);
	});
});

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
}

describe("Specification 5.5 - inspecting the chain", () => {

	it("chain names every link from the root down", async () => {
		const root = new ExpressionResolver({ context: { value: 1 }, name: "root" });
		const middle = new ExpressionResolver({ context: {}, name: "middle", parent: root });
		const leaf = new ExpressionResolver({ context: { value: 1 }, name: "leaf", parent: middle });
		expect(leaf.chain).toBe("/root/middle/leaf");
	});

	// not implemented, waits for BACKLOG.md "`effectiveChain` is a copy of `chain`, and a resolver without a name"
	it.fails("chain carries the generated name of an unnamed link, never null", async () => {
		const root = new ExpressionResolver({ context: { value: 1 } });
		const leaf = new ExpressionResolver({ context: { value: 1 }, name: "leaf", parent: root });
		expect(leaf.chain.includes("null")).toBe(false);
		expect(leaf.chain.endsWith("/leaf")).toBe(true);
	});

	// The expectation coincides with what the code answers today, so this one cannot tell the two
	// apart. It is here because it is the half of 5.5 that is easiest to get wrong when the rule
	// is implemented: an empty object is a context.
	it("effectiveChain names a link built with an empty object", async () => {
		const root = new ExpressionResolver({ context: { value: 1 }, name: "root" });
		const middle = new ExpressionResolver({ context: {}, name: "middle", parent: root });
		const leaf = new ExpressionResolver({ context: { value: 1 }, name: "leaf", parent: middle });
		expect(leaf.effectiveChain).toBe("/root/middle/leaf");
	});

	// same, and for the same reason: what the context holds does not decide anything.
	it("effectiveChain names a link whose context holds only a name no expression can reach", async () => {
		const root = new ExpressionResolver({ context: { class: 1 }, name: "root" });
		expect(root.effectiveChain).toBe("/root");
	});

	// not implemented, waits for BACKLOG.md "`effectiveChain` is a copy of `chain`, and a resolver without a name"
	it.fails("effectiveChain skips a link built with context null", async () => {
		const root = new ExpressionResolver({ context: { value: 1 }, name: "root" });
		const middle = new ExpressionResolver({ context: null, name: "middle", parent: root });
		const leaf = new ExpressionResolver({ context: { value: 1 }, name: "leaf", parent: middle });
		expect(leaf.effectiveChain).toBe("/root/leaf");
	});

	// not implemented, waits for BACKLOG.md "`effectiveChain` is a copy of `chain`, and a resolver without a name"
	it.fails("effectiveChain skips a link built without the context option", async () => {
		const root = new ExpressionResolver({ context: { value: 1 }, name: "root" });
		const middle = new ExpressionResolver({ name: "middle", parent: root });
		const leaf = new ExpressionResolver({ context: { value: 1 }, name: "leaf", parent: middle });
		expect(leaf.effectiveChain).toBe("/root/leaf");
	});

	// not implemented, waits for BACKLOG.md "`effectiveChain` is a copy of `chain`, and a resolver without a name"
	it.fails("effectiveChain is the empty string when no link provides a context, while chain stays full", async () => {
		const root = new ExpressionResolver({ context: null, name: "root" });
		const leaf = new ExpressionResolver({ context: null, name: "leaf", parent: root });
		expect(leaf.effectiveChain).toBe("");
		expect(leaf.chain).toBe("/root/leaf");
	});

	// not implemented, waits for BACKLOG.md "`effectiveChain` is a copy of `chain`, and a resolver without a name"
	it.fails("effectiveChain describes a state - a link joins when a value is written to it", async () => {
		const root = new ExpressionResolver({ context: null, name: "root" });
		const leaf = new ExpressionResolver({ context: null, name: "leaf", parent: root });
		expect(leaf.effectiveChain).toBe("");
		leaf.mergeContext({ value: 1 });
		expect(leaf.effectiveChain).toBe("/leaf");
	});

	// not implemented, waits for BACKLOG.md "`effectiveChain` is a copy of `chain`, and a resolver without a name"
	it.fails("contextChain collects the contexts of exactly the links that provide one", async () => {
		const root = new ExpressionResolver({ context: { value: 1 }, name: "root" });
		const middle = new ExpressionResolver({ context: null, name: "middle", parent: root });
		const leaf = new ExpressionResolver({ context: { value: 1 }, name: "leaf", parent: middle });
		expect(leaf.contextChain.length).toBe(2);
	});

	it("contextChain answers this resolver first and the root last", async () => {
		const root = new ExpressionResolver({ context: { value: 1 }, name: "root" });
		const leaf = new ExpressionResolver({ context: { value: 1 }, name: "leaf", parent: root });
		const contexts = leaf.contextChain;
		expect(contexts[0] === leaf.context).toBe(true);
		expect(contexts[contexts.length - 1] === root.context).toBe(true);
	});

	// not implemented, waits for BACKLOG.md "`effectiveChain` is a copy of `chain`, and a resolver without a name"
	it.fails("contextChain is empty when no link provides a context", async () => {
		const root = new ExpressionResolver({ context: null, name: "root" });
		const leaf = new ExpressionResolver({ context: null, name: "leaf", parent: root });
		expect(leaf.contextChain.length).toBe(0);
	});
});
