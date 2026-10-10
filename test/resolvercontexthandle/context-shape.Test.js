import { describe, it, expect } from "vitest";
import ResolverContextHandle from "../../src/ResolverContextHandle.js";

/**
 * ResolverContextHandle - what the proxy answers for the object it was handed. SPECIFICATION.md 6.1.
 *
 * Which shapes of context an executer can work with is that executer's own; this is about what the
 * handle makes of what it was handed. A primitive is never handed to it: the resolver's constructor
 * rejects one (4.2, `test/expressionresolver/construction.Test.js`), and the handle checks nothing.
 */

describe("ResolverContextHandle - every access goes through the proxy", () => {

	it("answers a proxy rather than the object it was handed", () => {
		const handed = { value: "handed in" };
		expect(new ResolverContextHandle(handed).context === handed).toBe(false);
	});

	// The proxy answers the names of the whole chain, which is more than the object it was built
	// over carries. A frozen object cannot be spoken for that way - a proxy over one may report
	// nothing but its own keys - so the proxy is not built over the context at all. Reading needs no
	// case of its own: a proxy over the frozen object would answer the same value.
	it("enumerates the chain over a context the caller froze", () => {
		const root = new ResolverContextHandle({ rootOnly: "from root" });
		const leaf = new ResolverContextHandle(Object.freeze({ leafOnly: "from leaf" }), root);
		const names = Object.keys(leaf.context);
		expect(names.includes("leafOnly")).toBe(true);
		expect(names.includes("rootOnly")).toBe(true);
	});

	// A context carries every key JavaScript says it carries, whether or not it could stand for a
	// variable - DECISIONS.md, 2026-09-22.
	it("enumerates a key that is not a variable name", () => {
		expect(Object.keys(new ResolverContextHandle({ "test-test": "dashed" }).context).includes("test-test")).toBe(true);
	});

	it("answers no descriptor for a name no handle of the chain carries", () => {
		const root = new ResolverContextHandle({ rootOnly: "from root" });
		const leaf = new ResolverContextHandle({ leafOnly: "from leaf" }, root);
		expect(Object.getOwnPropertyDescriptor(leaf.context, "nowhere")).toBeUndefined();
	});

	it("answers a symbol key the context carries", () => {
		const marker = Symbol("marker");
		expect(new ResolverContextHandle({ [marker]: "from symbol" }).context[marker]).toBe("from symbol");
	});

	// A context carries what `in` says it carries, inherited members included (5.2) - an object
	// handed over as a context answers the members of Object.prototype itself.
	it("answers a member of Object.prototype for a plain object as context", () => {
		expect(new ResolverContextHandle({}).context.valueOf === Object.prototype.valueOf).toBe(true);
	});

});
