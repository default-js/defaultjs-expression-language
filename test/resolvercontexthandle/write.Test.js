import { describe, it, expect } from "vitest";
import ResolverContextHandle from "../../src/ResolverContextHandle.js";
import { catchError } from "../TestUtils.js";

/**
 * ResolverContextHandle - where a write lands. SPECIFICATION.md 5.2, 6.1, 6.5, 6.6.
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
		new ResolverContextHandle(handed).context.value = "after";
		expect(handed.value).toBe("after");
	});

	it("a delete through the proxy removes the key from the object the caller handed over", () => {
		const handed = { value: "before" };
		delete new ResolverContextHandle(handed).context.value;
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
		expect(handle.context.holder.keep).toBeUndefined();
		expect(handle.context.holder.fresh).toBe(2);
	});
});

// SPECIFICATION.md 5.2, 6.6 - a delete cannot take a key off an object that only inherits it, and
// the handle stops providing the name anyway, until the names are rebuilt. Decided on 2026-10-03 and
// written after the behaviour - these cases pin the exception, they prove no fix.
describe("ResolverContextHandle - deleting a key the object only inherits", () => {

	it("leaves the key on the object", () => {
		const handed = Object.create({ inherited: "from the prototype" });
		delete new ResolverContextHandle(handed).context.inherited;
		expect("inherited" in handed).toBe(true);
	});

	it("no longer provides the name", () => {
		const handle = new ResolverContextHandle(Object.create({ inherited: "from the prototype" }));
		delete handle.context.inherited;
		expect("inherited" in handle.context).toBe(false);
	});
});

describe("ResolverContextHandle - writing into a frozen object", () => {

	// SPECIFICATION.md 6.1, 6.5: the write fails as it would on the object itself. The frozen object
	// cannot change whatever the handle does, so each case asks the handle instead: it must not keep
	// the refused value anywhere else and answer it. That the failure is raised is the describe below.
	// One case per way of writing, as above; the data methods of a resolver reach the handle through
	// exactly these three.
	it("a write through the proxy is refused by a frozen object", async () => {
		const handle = new ResolverContextHandle(Object.freeze({ value: "before" }));
		await catchError(() => {
			handle.context.value = "after";
		});
		expect(handle.context.value).toBe("before");
	});

	it("a delete through the proxy is refused by a frozen object", async () => {
		const handle = new ResolverContextHandle(Object.freeze({ value: "before" }));
		await catchError(() => {
			delete handle.context.value;
		});
		expect(handle.context.value).toBe("before");
	});

	it("mergeData is refused by a frozen object", async () => {
		const handle = new ResolverContextHandle(Object.freeze({ value: "before" }));
		await catchError(() => handle.mergeData({ value: "after" }));
		expect(handle.context.value).toBe("before");
	});
});

describe("ResolverContextHandle - a refused change raises what the object raises", () => {

	// SPECIFICATION.md 6.6, B-05. The handle writes in strict-mode module code, so a change the object
	// refuses raises the object's own TypeError; these cases pin that it is handed on, not swallowed.
	// Written after the behaviour, which was measured on 2026-09-07 - they guard it, they prove no fix.
	it("a write through the proxy raises over a frozen object", async () => {
		const handle = new ResolverContextHandle(Object.freeze({ value: "before" }));
		const error = await catchError(() => {
			handle.context.value = "after";
		});
		expect(error instanceof TypeError).toBe(true);
	});

	it("a delete through the proxy raises over a frozen object", async () => {
		const handle = new ResolverContextHandle(Object.freeze({ value: "before" }));
		const error = await catchError(() => {
			delete handle.context.value;
		});
		expect(error instanceof TypeError).toBe(true);
	});

	it("mergeData raises over a frozen object", async () => {
		const handle = new ResolverContextHandle(Object.freeze({ value: "before" }));
		const error = await catchError(() => handle.mergeData({ value: "after" }));
		expect(error instanceof TypeError).toBe(true);
	});

	it("a write of a new key through the proxy raises over a sealed object", async () => {
		const handle = new ResolverContextHandle(Object.seal({ value: "before" }));
		const error = await catchError(() => {
			handle.context.fresh = "new";
		});
		expect(error instanceof TypeError).toBe(true);
	});

	it("a delete through the proxy raises over a sealed object", async () => {
		const handle = new ResolverContextHandle(Object.seal({ value: "before" }));
		const error = await catchError(() => {
			delete handle.context.value;
		});
		expect(error instanceof TypeError).toBe(true);
	});

	it("mergeData of a new key raises over a sealed object", async () => {
		const handle = new ResolverContextHandle(Object.seal({ value: "before" }));
		const error = await catchError(() => handle.mergeData({ fresh: "new" }));
		expect(error instanceof TypeError).toBe(true);
	});

	// mergeData assigns key by key, so what stands before the refused key is written.
	it("mergeData keeps the keys written before the one the object refused", async () => {
		const handed = Object.seal({ value: "before" });
		const handle = new ResolverContextHandle(handed);
		await catchError(() => handle.mergeData({ value: "after", fresh: "new" }));
		expect(handed.value).toBe("after");
	});
});
