import { describe, it, expect } from "vitest";
import ResolverContextHandle from "../../src/ResolverContextHandle.js";

/**
 * ResolverContextHandle - where a write lands. SPECIFICATION.md 6.5, 6.6.
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
