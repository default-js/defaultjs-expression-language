import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";

/**
 * ExpressionResolver - chain, effectiveChain and contextChain. SPECIFICATION.md 5.5.
 *
 * These read off the resolver without executing anything, so they run once. effectiveChain and
 * contextChain describe a state that changes over a resolver's lifetime, chain is structural.
 */

// 5.5 sets no depth limit. chain and effectiveChain used to recurse once per link and overflowed
// the stack somewhere between 10,000 and 100,000 links.
const DEEP = 100000;

// a chain of the given depth, "/root/r1/…", every link handed a context; answers its leaf
const deepChain = (aDepth) => {
	let resolver = new ExpressionResolver({ name: "root", context: {} });
	for (let i = 1; i < aDepth; i++) resolver = new ExpressionResolver({ name: `r${i}`, context: {}, parent: resolver });

	return resolver;
};

// the path deepChain builds
const deepPath = (aDepth) => {
	let path = "/root";
	for (let i = 1; i < aDepth; i++) path += `/r${i}`;

	return path;
};

describe("ExpressionResolver - inspecting the chain", () => {

	it("chain names every link from the root down", async () => {
		const root = new ExpressionResolver({ context: { value: 1 }, name: "root" });
		const middle = new ExpressionResolver({ context: {}, name: "middle", parent: root });
		const leaf = new ExpressionResolver({ context: { value: 1 }, name: "leaf", parent: middle });
		expect(leaf.chain).toBe("/root/middle/leaf");
	});

	// The expectation coincides with what the code answers today, so this one cannot tell the two
	// apart. It is here because it is the half of 5.5 that is easiest to get wrong when the rule
	// is implemented: an empty object is a context - what the context holds does not decide anything.
	it("effectiveChain names a link built with an empty object", async () => {
		const root = new ExpressionResolver({ context: { value: 1 }, name: "root" });
		const middle = new ExpressionResolver({ context: {}, name: "middle", parent: root });
		const leaf = new ExpressionResolver({ context: { value: 1 }, name: "leaf", parent: middle });
		expect(leaf.effectiveChain).toBe("/root/middle/leaf");
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

	it("chain names every link however deep the chain is", async () => {
		expect(deepChain(DEEP).chain).toBe(deepPath(DEEP));
	});

	it("effectiveChain names every link providing a context however deep the chain is", async () => {
		expect(deepChain(DEEP).effectiveChain).toBe(deepPath(DEEP));
	});
});
