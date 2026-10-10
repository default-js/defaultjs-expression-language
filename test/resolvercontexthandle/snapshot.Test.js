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

	// mergeData rebuilds the whole set rather than adding the merged keys, so it takes up a key added
	// directly as well - written into 6.2 on 2026-10-03, after the behaviour; it proves no fix.
	it("sees that key after mergeData of another one", () => {
		const handed = { known: 1 };
		const handle = new ResolverContextHandle(handed);
		handed.added = 2;
		handle.mergeData({ merged: 3 });
		expect(handle.context.added).toBe(2);
	});

	// The other half of the snapshot, written after the behaviour: a key taken off the handed-in object
	// directly stays among the names until they are rebuilt, and reads as undefined meanwhile.
	it("keeps listing a key removed from the handed-in object after the handle was built", () => {
		const handed = { known: 1, removed: 2 };
		const handle = new ResolverContextHandle(handed);
		delete handed.removed;
		expect(Object.keys(handle.context).includes("removed")).toBe(true);
	});

	// A descriptor of the context reads through a getter rather than carrying the value it had.
	it("reads a value through a descriptor at the moment its getter is called", () => {
		const handed = { value: "before" };
		const descriptor = Object.getOwnPropertyDescriptor(new ResolverContextHandle(handed).context, "value");
		handed.value = "after";
		expect(descriptor.get()).toBe("after");
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
