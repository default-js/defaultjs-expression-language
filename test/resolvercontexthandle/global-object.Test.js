import { describe, it, expect } from "vitest";
import ResolverContextHandle from "../../src/ResolverContextHandle.js";

/**
 * ResolverContextHandle - the global object handed in as a context. SPECIFICATION.md 6.4.
 *
 * How a statement reaches a global otherwise is the executer's own. What is here is the handle's
 * share: a handle over the global object is an ordinary one of the chain, it carries every name, and
 * it contributes none to the enumeration of a handle below it.
 */

describe("ResolverContextHandle - the global object as a context", () => {

	it("answers a global name from a handle below a global one", () => {
		const root = new ResolverContextHandle(globalThis);
		const leaf = new ResolverContextHandle({ own: "from leaf" }, root);
		expect(leaf.context.Math === Math).toBe(true);
	});

	// Everything the global object holds is reachable through the ordinary scope chain of a statement
	// anyway, so listing it would only hand an executer that turns names into code names it never
	// needed - the index "0" of a frame, a symbol another library planted on `window`.
	it("contributes no name to the enumeration of a handle below it", () => {
		const root = new ResolverContextHandle(globalThis);
		const leaf = new ResolverContextHandle({ own: "from leaf" }, root);
		expect(Object.keys(leaf.context).join()).toBe("own");
	});

	// Not wrapped: what a resolver answers for `getData()` is this context, so it answers the global
	// object itself. Reading a global name from it and writing through it are ordinary global
	// accesses, which follow from the identity and need no case of their own.
	it("answers the global object itself as its context", () => {
		expect(new ResolverContextHandle(globalThis).context === globalThis).toBe(true);
	});
});
