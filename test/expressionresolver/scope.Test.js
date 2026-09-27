import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";
import TestExecuter from "../TestExecuter.js";

/**
 * ExpressionResolver - which resolver a scope prefix addresses, and what it sees from there.
 * SPECIFICATION.md 3.3, 4.3, 5.3, 5.4.
 *
 * How the prefix is read is the scanner's, and tested in `test/expressionscanner/`. This file asks
 * where the walk to the named resolver ends and which context the statement is then handed - the
 * resolver's work, so no statement is evaluated: the answer is a lookup in the context that arrived.
 * The root of each chain carries the executer, and every resolver below takes it from there.
 */

// answers the value the context carries under the statement - a lookup, not an evaluation
const lookup = () => new TestExecuter((aStatement, aContext) => aContext[aStatement]);

// 5.3 sets no depth limit. The walk to a named resolver used to recurse once per resolver climbed
// and overflowed the stack somewhere between 1,000 and 10,000 resolvers; this depth is well past it.
const DEEP = 100000;

// a chain of the given depth under a root named "root", answering its leaf
const deepChain = (aDepth) => {
	let resolver = new ExpressionResolver({ name: "root", context: { value: "from root" }, executer: lookup() });
	for (let i = 1; i < aDepth; i++) resolver = new ExpressionResolver({ name: `r${i}`, parent: resolver });

	return resolver;
};

describe("ExpressionResolver - lookup with a prefix", () => {

	it("addresses the resolver carrying the name", async () => {
		const resolver = new ExpressionResolver({ name: "scope", context: { value: "from scope" }, executer: lookup() });
		const result = await resolver.resolveText("${scope::value}");
		expect(result).toBe("from scope");
	});

	it("addresses the resolver the call is made on", async () => {
		const root = new ExpressionResolver({ context: { value: "from root" }, name: "root", executer: lookup() });
		const leaf = new ExpressionResolver({ context: { value: "from leaf" }, name: "leaf", parent: root });
		expect(await leaf.resolveText("${leaf::value}")).toBe("from leaf");
	});

	it("climbs to the ancestor the prefix names", async () => {
		const root = new ExpressionResolver({ context: { value: "from root" }, name: "root", executer: lookup() });
		const leaf = new ExpressionResolver({ context: { value: "from leaf" }, name: "leaf", parent: root });
		expect(await leaf.resolveText("${root::value}")).toBe("from root");
	});

	it("resolve reaches an ancestor through the scope prefix", async () => {
		const root = new ExpressionResolver({ name: "root", context: { value: "from root" }, executer: lookup() });
		const leaf = new ExpressionResolver({ name: "leaf", context: { value: "from leaf" }, parent: root });
		const result = await leaf.resolve("${root::value}");
		expect(result).toBe("from root");
	});

	it("evaluates against the addressed resolver and the contexts above it", async () => {
		const root = new ExpressionResolver({ context: { rootOnly: "from root" }, name: "root", executer: lookup() });
		const middle = new ExpressionResolver({ context: { middleOnly: "from middle" }, name: "middle", parent: root });
		const leaf = new ExpressionResolver({ context: { leafOnly: "from leaf" }, name: "leaf", parent: middle });
		expect(await leaf.resolveText("${middle::rootOnly}")).toBe("from root");
	});

	it("answers from the first resolver carrying the name, climbing towards the root", async () => {
		const outer = new ExpressionResolver({ context: { value: "from outer" }, name: "dup", executer: lookup() });
		const inner = new ExpressionResolver({ context: { value: "from inner" }, name: "dup", parent: outer });
		const leaf = new ExpressionResolver({ context: { value: "from leaf" }, name: "leaf", parent: inner });
		expect(await leaf.resolveText("${dup::value}")).toBe("from inner");
	});

	it("does not see a resolver below the one the prefix names", async () => {
		const root = new ExpressionResolver({ context: { rootOnly: "from root" }, name: "root", executer: lookup() });
		const leaf = new ExpressionResolver({ context: { leafOnly: "from leaf" }, name: "leaf", parent: root });
		expect(await leaf.resolveText("${root::leafOnly}", "fallback")).toBe("fallback");
	});

	it("climbs to the ancestor the prefix names however deep the chain is", async () => {
		expect(await deepChain(DEEP).resolve("${root::value}")).toBe("from root");
	});
});

// The resolver does not exist, so there is nothing to hand a statement to; the answer is the
// resolver's alone. Were a statement handed over after all, the lookup would answer "from leaf" and
// give it away.
describe("ExpressionResolver - a prefix no resolver carries", () => {

	it("answers undefined", async () => {
		const root = new ExpressionResolver({ context: { value: "from root" }, name: "root", executer: lookup() });
		const leaf = new ExpressionResolver({ context: { value: "from leaf" }, name: "leaf", parent: root });
		expect(await leaf.resolveText("${nowhere::value}")).toBe("undefined");
	});

	it("lets the default value apply", async () => {
		const root = new ExpressionResolver({ context: { value: "from root" }, name: "root", executer: lookup() });
		const leaf = new ExpressionResolver({ context: { value: "from leaf" }, name: "leaf", parent: root });
		expect(await leaf.resolveText("${nowhere::value}", "fallback")).toBe("fallback");
	});

	// Cannot tell the implementations apart, verified 2026-08-29: before the prefix was parsed at
	// all, "nowhere::value" reached the executer as a statement, failed to compile and the default
	// applied through the error path instead of through 5.4. Same answer, different reason.
	it("resolve answers the default value where no resolver carries the prefix", async () => {
		const resolver = new ExpressionResolver({ name: "scope", context: { value: "from scope" }, executer: lookup() });
		const result = await resolver.resolve("${nowhere::value}", "fallback");
		expect(result).toBe("fallback");
	});

	// The walk passes every resolver up to the root before it gives up, so a deep chain takes it
	// further than any prefix that is found.
	it("answers the default value however deep the chain is", async () => {
		expect(await deepChain(DEEP).resolve("${nowhere::value}", "fallback")).toBe("fallback");
	});
});
