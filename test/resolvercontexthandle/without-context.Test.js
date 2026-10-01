import { describe, it, expect } from "vitest";
import ResolverContextHandle from "../../src/ResolverContextHandle.js";

/**
 * ResolverContextHandle - a handle built without a context. SPECIFICATION.md 6.3.
 *
 * It holds no object at all, carries no name, and is passed through by the walk until something is
 * written to it.
 */

describe("ResolverContextHandle - a handle without a context", () => {

	// It holds no object at all, so it carries no name - not even one every object inherits. With
	// `{}` it answered the names of Object.prototype itself instead of passing them on.
	it("passes a name of Object.prototype through to the handle above", () => {
		const root = new ResolverContextHandle({ valueOf: "from root" });
		const leaf = new ResolverContextHandle(undefined, root);
		expect(leaf.context.valueOf).toBe("from root");
	});

	it("contributes nothing to a lookup and is passed through", () => {
		const root = new ResolverContextHandle({ value: "from root" });
		const middle = new ResolverContextHandle(null, root);
		const leaf = new ResolverContextHandle({ leafOnly: 1 }, middle);
		expect(leaf.context.value).toBe("from root");
	});

	it("gains content like any other handle", () => {
		const root = new ResolverContextHandle({ value: "from root" });
		const middle = new ResolverContextHandle(null, root);
		const leaf = new ResolverContextHandle({ leafOnly: 1 }, middle);
		middle.mergeData({ value: "from middle" });
		expect(leaf.context.value).toBe("from middle");
	});
});
