import { describe, it, expect } from "vitest";
import ResolverContextHandle from "../../src/ResolverContextHandle.js";

/**
 * ResolverContextHandle - names are a snapshot, values are live. SPECIFICATION.md 6.2.
 *
 * The snapshot is the name cache a handle builds on construction; the live half is that the proxy
 * reads a value at the moment it is asked. That a write through a resolver's data methods keeps the
 * names in step is `test/expressionresolver/wiring.Test.js`.
 */

describe("ResolverContextHandle - names are a snapshot, values are live", () => {

	it("does not see a key added to the handed-in object after the handle was built", () => {
		const handed = { known: 1 };
		const handle = new ResolverContextHandle(handed);
		handed.added = 2;
		expect("added" in handle.context).toBe(false);
	});

	it("sees that key after resetCache", () => {
		const handed = { known: 1 };
		const handle = new ResolverContextHandle(handed);
		handed.added = 2;
		handle.resetCache();
		expect(handle.context.added).toBe(2);
	});

	it("reads a value at the moment of the lookup, so a mutation is visible immediately", () => {
		const handed = { holder: { name: "before" } };
		const handle = new ResolverContextHandle(handed);
		handed.holder.name = "after";
		expect(handle.context.holder.name).toBe("after");
	});

	it("keeps the set of names in step when a value is written through the proxy", () => {
		const proxy = new ResolverContextHandle({ known: 1 }).context;
		proxy.fresh = "written";
		expect("fresh" in proxy).toBe(true);
	});
});
