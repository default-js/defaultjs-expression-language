import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";

/**
 * SPECIFICATION.md 5.5 - chain, effectiveChain and contextChain.
 *
 * These read off the resolver without executing anything, so they run once. effectiveChain and
 * contextChain describe a state that changes over a resolver's lifetime, chain is structural.
 */

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
