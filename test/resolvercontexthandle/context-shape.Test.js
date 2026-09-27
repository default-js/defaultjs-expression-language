import { describe, it, expect } from "vitest";
import ResolverContextHandle from "../../src/ResolverContextHandle.js";
import { catchError } from "../TestUtils.js";

/**
 * ResolverContextHandle - what the proxy answers for the object it was handed. SPECIFICATION.md 6.1.
 *
 * Which shapes of context an executer can work with is that executer's own; this is about what the
 * handle makes of what it was handed.
 */

describe("ResolverContextHandle - every access goes through the proxy", () => {

	it("answers a proxy rather than the object it was handed", () => {
		const handed = { value: "handed in" };
		expect(new ResolverContextHandle(handed).proxy === handed).toBe(false);
	});

	// The proxy answers the names of the whole chain, which is more than the object it was built
	// over carries. A frozen object cannot be spoken for that way - a proxy over one may report
	// nothing but its own keys - so the proxy is not built over the context at all.
	it("enumerates the chain over a context the caller froze", () => {
		const root = new ResolverContextHandle({ rootOnly: "from root" });
		const leaf = new ResolverContextHandle(Object.freeze({ leafOnly: "from leaf" }), root);
		const names = Object.keys(leaf.proxy);
		expect(names.includes("leafOnly")).toBe(true);
		expect(names.includes("rootOnly")).toBe(true);
	});

	it("reads from a context the caller froze", () => {
		expect(new ResolverContextHandle(Object.freeze({ own: "frozen" })).proxy.own).toBe("frozen");
	});

	// A single frozen handle is enough: the property cache walks the prototype chain, so the names
	// of Object.prototype are reported for an object that has no own key beside its own.
	it("enumerates a frozen context that stands alone", () => {
		const proxy = new ResolverContextHandle(Object.freeze({ own: "frozen" })).proxy;
		expect(Object.keys(proxy).includes("own")).toBe(true);
		expect(JSON.stringify(proxy).includes("frozen")).toBe(true);
	});

	// A context carries every key JavaScript says it carries, whether or not it could stand for a
	// variable - DECISIONS.md, 2026-09-22.
	it("enumerates a key that is not a variable name", () => {
		expect(Object.keys(new ResolverContextHandle({ "test-test": "dashed" }).proxy).includes("test-test")).toBe(true);
	});

	it("answers a symbol key the context carries", () => {
		const marker = Symbol("marker");
		expect(new ResolverContextHandle({ [marker]: "from symbol" }).proxy[marker]).toBe("from symbol");
	});

	// A context carries what `in` says it carries, inherited members included (5.2) - an object
	// handed over as a context answers the members of Object.prototype itself.
	it("answers a member of Object.prototype for a plain object as context", () => {
		expect(new ResolverContextHandle({}).proxy.valueOf === Object.prototype.valueOf).toBe(true);
	});

	// `data || {}` in the constructor turns a falsy context into an empty one, so 0, "" and false
	// build a handle that carries no name of its own.
	it("takes a falsy primitive as an empty context", () => {
		for (const context of [0, "", false]) {
			expect(new ResolverContextHandle(context).proxy.anything).toBeUndefined();
		}
	});

	// ...while a truthy one reaches `Reflect.ownKeys`, which only takes objects. The handle therefore
	// throws at construction, with an error from inside the property cache rather than one that names
	// the mistake. Only that it throws is pinned; the message is not, so a decision to reject a
	// primitive properly keeps this green. Open in BACKLOG.md: reject, coerce, or ignore.
	it("throws on a truthy primitive as context", async () => {
		for (const context of ["abc", 42, true]) {
			const error = await catchError(() => new ResolverContextHandle(context));
			expect(error instanceof Error).toBe(true);
		}
	});
});
