import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";

/**
 * Conformance tests for SPECIFICATION.md section 5 - the chain.
 *
 * What is left here is the half that never executes a statement: 5.1 and 5.5 read `name`, `parent`
 * and the three chain getters off ExpressionResolver, so they run once, against whatever
 * ExpressionResolver.defaultExecuter is.
 *
 * A lookup cannot be observed without executing a statement, so 5.2, 5.3 and 5.4 are asked of
 * every executer instead - `test/executer/shared/ChainRules.js`, run once per executer. That they
 * are not capabilities is the point: 8.3 lets an executer decide how a statement reaches a context
 * value, never which resolver of the chain answers it.
 */

describe("Specification 5.1 - structure", () => {

	it("keeps the name the caller passed", async () => {
		const resolver = new ExpressionResolver({ context: {}, name: "root" });
		expect(resolver.name).toBe("root");
	});

	// The shape of a generated name is not specified - only that it is unique and obeys the
	// character rule of 3.3, so that it can appear in a chain path and be addressed like any
	// other. Uniqueness is the test below.
	it("generates a name where the caller passed none", async () => {
		const resolver = new ExpressionResolver({ context: {} });
		expect(typeof resolver.name).toBe("string");
		expect(/^[a-zA-Z0-9\-_\s]+$/.test(resolver.name)).toBe(true);
	});

	it("generates a different name for every unnamed resolver", async () => {
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

describe("Specification 5.5 - inspecting the chain", () => {

	it("chain names every link from the root down", async () => {
		const root = new ExpressionResolver({ context: { value: 1 }, name: "root" });
		const middle = new ExpressionResolver({ context: {}, name: "middle", parent: root });
		const leaf = new ExpressionResolver({ context: { value: 1 }, name: "leaf", parent: middle });
		expect(leaf.chain).toBe("/root/middle/leaf");
	});

	it("chain carries the generated name of an unnamed link, never null", async () => {
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

	it("effectiveChain skips a link built with context null", async () => {
		const root = new ExpressionResolver({ context: { value: 1 }, name: "root" });
		const middle = new ExpressionResolver({ context: null, name: "middle", parent: root });
		const leaf = new ExpressionResolver({ context: { value: 1 }, name: "leaf", parent: middle });
		expect(leaf.effectiveChain).toBe("/root/leaf");
	});

	it("effectiveChain skips a link built without the context option", async () => {
		const root = new ExpressionResolver({ context: { value: 1 }, name: "root" });
		const middle = new ExpressionResolver({ name: "middle", parent: root });
		const leaf = new ExpressionResolver({ context: { value: 1 }, name: "leaf", parent: middle });
		expect(leaf.effectiveChain).toBe("/root/leaf");
	});

	it("effectiveChain is the empty string when no link provides a context, while chain stays full", async () => {
		const root = new ExpressionResolver({ context: null, name: "root" });
		const leaf = new ExpressionResolver({ context: null, name: "leaf", parent: root });
		expect(leaf.effectiveChain).toBe("");
		expect(leaf.chain).toBe("/root/leaf");
	});

	it("effectiveChain describes a state - a link joins when a value is written to it", async () => {
		const root = new ExpressionResolver({ context: null, name: "root" });
		const leaf = new ExpressionResolver({ context: null, name: "leaf", parent: root });
		expect(leaf.effectiveChain).toBe("");
		leaf.mergeContext({ value: 1 });
		expect(leaf.effectiveChain).toBe("/leaf");
	});

	it("contextChain collects the contexts of exactly the links that provide one", async () => {
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

	it("contextChain is empty when no link provides a context", async () => {
		const root = new ExpressionResolver({ context: null, name: "root" });
		const leaf = new ExpressionResolver({ context: null, name: "leaf", parent: root });
		expect(leaf.contextChain.length).toBe(0);
	});
});
