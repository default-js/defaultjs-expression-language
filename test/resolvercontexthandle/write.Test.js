import { describe, it, expect } from "vitest";
import ResolverContextHandle from "../../src/ResolverContextHandle.js";
import { catchError } from "../TestUtils.js";

/**
 * ResolverContextHandle - where a write lands. SPECIFICATION.md 6.1, 6.5, 6.6.
 *
 * A handle keeps the object it was handed rather than a copy, so a write through the proxy or
 * through `mergeData` changes that object and code outside sees the change. Which handle of a chain
 * a resolver's data method addresses is the resolver's, and tested there.
 */

describe("ResolverContextHandle - writing into the object the caller handed over", () => {

	// Written down on 2026-09-05 after the code said one thing and AGENTS.md another; one case per
	// way of writing, because a caller who shares a context has to be able to rely on all of them.
	it("a write through the proxy lands in the object the caller handed over", () => {
		const handed = { value: "before" };
		new ResolverContextHandle(handed).proxy.value = "after";
		expect(handed.value).toBe("after");
	});

	it("a delete through the proxy removes the key from the object the caller handed over", () => {
		const handed = { value: "before" };
		delete new ResolverContextHandle(handed).proxy.value;
		expect("value" in handed).toBe(false);
	});

	it("mergeData writes into the object the caller handed over", () => {
		const handed = { value: "before" };
		new ResolverContextHandle(handed).mergeData({ added: "a" });
		expect(handed.added).toBe("a");
	});

	it("mergeData is shallow - a merged object replaces rather than merges", () => {
		const handle = new ResolverContextHandle({ holder: { keep: 1 } });
		handle.mergeData({ holder: { fresh: 2 } });
		expect(handle.proxy.holder.keep).toBeUndefined();
		expect(handle.proxy.holder.fresh).toBe(2);
	});
});

describe("ResolverContextHandle - writing into a frozen object", () => {

	// SPECIFICATION.md 6.1, 6.5: the write fails as it would on the object itself. The frozen object
	// cannot change whatever the handle does, so each case asks the handle instead: it must not keep
	// the refused value anywhere else and answer it. Whether the failure is raised or swallowed is not
	// asserted - that is the open decision of B-05. One case per way of writing, as above; the data
	// methods of a resolver reach the handle through exactly these three.
	it("a write through the proxy is refused by a frozen object", async () => {
		const handle = new ResolverContextHandle(Object.freeze({ value: "before" }));
		await catchError(() => {
			handle.proxy.value = "after";
		});
		expect(handle.proxy.value).toBe("before");
	});

	it("a delete through the proxy is refused by a frozen object", async () => {
		const handle = new ResolverContextHandle(Object.freeze({ value: "before" }));
		await catchError(() => {
			delete handle.proxy.value;
		});
		expect(handle.proxy.value).toBe("before");
	});

	it("mergeData is refused by a frozen object", async () => {
		const handle = new ResolverContextHandle(Object.freeze({ value: "before" }));
		await catchError(() => handle.mergeData({ value: "after" }));
		expect(handle.proxy.value).toBe("before");
	});
});
