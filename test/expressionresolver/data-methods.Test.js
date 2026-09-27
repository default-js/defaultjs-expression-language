import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { catchError } from "../TestUtils.js";

/**
 * ExpressionResolver - getData, updateData, deleteData and mergeContext. SPECIFICATION.md 6.6.
 *
 * None of it executes a statement. Which resolver of the chain each of them addresses is the rule
 * they share - see DECISIONS.md, 2026-08-22. That a write lands in the object the caller handed
 * over is the handle's, and tested in `test/resolvercontexthandle/write.Test.js`; that a statement is
 * handed a context which follows a write is `wiring.Test.js`.
 */

describe("ExpressionResolver - reading and writing from outside", () => {

	const buildChain = () => {
		const root = new ExpressionResolver({ context: { value: "from root", rootOnly: "r" }, name: "root" });
		const leaf = new ExpressionResolver({ context: { leafOnly: "l" }, name: "leaf", parent: root });
		return { root, leaf };
	};

	it("getData answers the whole context of the addressed link when no key is given", async () => {
		const { leaf } = buildChain();
		expect(leaf.getData() === leaf.context).toBe(true);
	});

	// The key is handed to the context unchanged, so which keys a context carries is the handle's -
	// `test/resolvercontexthandle/context-shape.Test.js`.
	it("getData reads along the chain by the rule of 5.2", async () => {
		const { leaf } = buildChain();
		expect(leaf.getData("value")).toBe("from root");
	});

	it("getData with a filter reads from the addressed link", async () => {
		const { leaf } = buildChain();
		expect(leaf.getData("value", "root")).toBe("from root");
	});

	it("getData with a filter naming the calling link reads from it", async () => {
		const { leaf } = buildChain();
		expect(leaf.getData("leafOnly", "leaf")).toBe("l");
	});

	// SPECIFICATION.md 6.6: a filter is read like a scope prefix (3.3).
	it("getData trims the filter", async () => {
		const { leaf } = buildChain();
		expect(leaf.getData("leafOnly", " leaf ")).toBe("l");
	});

	it("getData throws a TypeError on a filter that is not a string", async () => {
		const { leaf } = buildChain();
		const error = await catchError(() => leaf.getData("value", 42));
		expect(error instanceof TypeError).toBe(true);
	});

	it("getData throws on a filter that matches no link", async () => {
		const { leaf } = buildChain();
		let error = null;
		try {
			leaf.getData("value", "nowhere");
		} catch (e) {
			error = e;
		}
		expect(error != null).toBe(true);
	});

	it("updateData without a filter changes the value where the key lives", async () => {
		const { root, leaf } = buildChain();
		leaf.updateData("value", "changed");
		expect(root.getData("value")).toBe("changed");
	});

	it("updateData without a filter creates the key on the calling resolver when no link carries it", async () => {
		const { root, leaf } = buildChain();
		leaf.updateData("fresh", "new");
		expect(leaf.getData("fresh")).toBe("new");
		expect(root.getData("fresh")).toBeUndefined();
	});

	it("updateData with a filter writes to the addressed link outright", async () => {
		const { root, leaf } = buildChain();
		leaf.updateData("value", "changed", "root");
		expect(root.getData("value")).toBe("changed");
	});

	// A filter that is whitespace only is no filter, so the value changes where the key lives - not on
	// the resolver the call was made on, as a filter naming it would.
	it("updateData takes a filter that is whitespace only as no filter", async () => {
		const { root, leaf } = buildChain();
		leaf.updateData("value", "changed", "  ");
		expect(root.getData("value")).toBe("changed");
	});

	it("updateData throws on a filter that matches no link", async () => {
		const { leaf } = buildChain();
		let error = null;
		try {
			leaf.updateData("value", "changed", "nowhere");
		} catch (e) {
			error = e;
		}
		expect(error != null).toBe(true);
	});

	it("deleteData with a filter removes the key from the addressed link", async () => {
		const { root, leaf } = buildChain();
		leaf.deleteData("rootOnly", "root");
		expect(root.getData("rootOnly")).toBeUndefined();
	});

	it("deleteData without a filter removes the key from the first link carrying it", async () => {
		const { root, leaf } = buildChain();
		leaf.deleteData("value");
		expect(root.getData("value")).toBeUndefined();
	});

	it("deleteData uncovers the value of the next link carrying the same key", async () => {
		const root = new ExpressionResolver({ context: { value: "from root" }, name: "root" });
		const leaf = new ExpressionResolver({ context: { value: "from leaf" }, name: "leaf", parent: root });
		leaf.deleteData("value");
		expect(leaf.getData("value")).toBe("from root");
	});

	it("deleteData takes a filter that is whitespace only as no filter", async () => {
		const { root, leaf } = buildChain();
		leaf.deleteData("rootOnly", "  ");
		expect(root.getData("rootOnly")).toBeUndefined();
	});

	it("deleteData throws on a filter that matches no link", async () => {
		const { leaf } = buildChain();
		let error = null;
		try {
			leaf.deleteData("value", "nowhere");
		} catch (e) {
			error = e;
		}
		expect(error != null).toBe(true);
	});

	it("mergeContext assigns the keys of the passed object into the addressed link", async () => {
		const { leaf } = buildChain();
		leaf.mergeContext({ added: "a", leafOnly: "replaced" });
		expect(leaf.getData("added")).toBe("a");
		expect(leaf.getData("leafOnly")).toBe("replaced");
	});

	it("mergeContext does not search the chain - it defines the key here and shadows from here on", async () => {
		const { root, leaf } = buildChain();
		leaf.mergeContext({ value: "from leaf" });
		expect(root.getData("value")).toBe("from root");
		expect(leaf.getData("value")).toBe("from leaf");
	});

	it("mergeContext with a filter merges into the addressed link", async () => {
		const { root, leaf } = buildChain();
		leaf.mergeContext({ added: "a" }, "root");
		expect(root.getData("added")).toBe("a");
	});

	it("mergeContext throws on a filter that matches no link", async () => {
		const { leaf } = buildChain();
		let error = null;
		try {
			leaf.mergeContext({ added: "a" }, "nowhere");
		} catch (e) {
			error = e;
		}
		expect(error != null).toBe(true);
	});

	// Nothing to merge changes nothing - a resolver without a context stays without one (5.5).
	it("mergeContext ignores null and undefined", async () => {
		const resolver = new ExpressionResolver({ name: "root" });
		resolver.mergeContext(null);
		resolver.mergeContext(undefined);
		expect(resolver.effectiveChain).toBe("");
	});

	it("mergeContext throws a TypeError on a primitive", async () => {
		const { leaf } = buildChain();
		const error = await catchError(() => leaf.mergeContext("abc"));
		expect(error instanceof TypeError).toBe(true);
	});
});

// SPECIFICATION.md 6.6: a key is what JavaScript takes as a property key, and only null and undefined
// mean there is none.
describe("ExpressionResolver - the key of a data method", () => {

	it("getData reads 0 as the first element of an array", async () => {
		const resolver = new ExpressionResolver({ context: ["first"], name: "root" });
		expect(resolver.getData(0)).toBe("first");
	});

	it("getData reads the key \"\"", async () => {
		const resolver = new ExpressionResolver({ context: { "": "empty" }, name: "root" });
		expect(resolver.getData("")).toBe("empty");
	});

	it("getData throws a TypeError on a key of another type", async () => {
		const resolver = new ExpressionResolver({ context: {}, name: "root" });
		const error = await catchError(() => resolver.getData({}));
		expect(error instanceof TypeError).toBe(true);
	});

	it("updateData writes to the key 0", async () => {
		const resolver = new ExpressionResolver({ context: ["first"], name: "root" });
		resolver.updateData(0, "changed");
		expect(resolver.getData(0)).toBe("changed");
	});

	it("updateData writes to the key \"\"", async () => {
		const resolver = new ExpressionResolver({ context: {}, name: "root" });
		resolver.updateData("", "empty");
		expect(resolver.getData("")).toBe("empty");
	});

	it("updateData writes to a symbol key", async () => {
		const marker = Symbol("marker");
		const resolver = new ExpressionResolver({ context: {}, name: "root" });
		resolver.updateData(marker, "from symbol");
		expect(resolver.getData(marker)).toBe("from symbol");
	});

	it("updateData throws a TypeError without a key", async () => {
		const resolver = new ExpressionResolver({ context: {}, name: "root" });
		for (const key of [null, undefined]) {
			const error = await catchError(() => resolver.updateData(key, "value"));
			expect(error instanceof TypeError).toBe(true);
		}
	});

	it("updateData throws a TypeError on a key of another type", async () => {
		const resolver = new ExpressionResolver({ context: {}, name: "root" });
		const error = await catchError(() => resolver.updateData({}, "value"));
		expect(error instanceof TypeError).toBe(true);
	});

	// A number names the same property as its string, so the resolver carrying "0" is found by 0.
	it("updateData changes the key 0 where it lives", async () => {
		const root = new ExpressionResolver({ context: ["first"], name: "root" });
		const leaf = new ExpressionResolver({ context: {}, name: "leaf", parent: root });
		leaf.updateData(0, "changed");
		expect(root.getData(0)).toBe("changed");
	});

	it("deleteData removes the key 0", async () => {
		const resolver = new ExpressionResolver({ context: { 0: "first" }, name: "root" });
		resolver.deleteData(0);
		expect(resolver.getData(0)).toBeUndefined();
	});

	it("deleteData removes the key \"\"", async () => {
		const resolver = new ExpressionResolver({ context: { "": "empty" }, name: "root" });
		resolver.deleteData("");
		expect(resolver.getData("")).toBeUndefined();
	});

	it("deleteData throws a TypeError without a key", async () => {
		const resolver = new ExpressionResolver({ context: {}, name: "root" });
		for (const key of [null, undefined]) {
			const error = await catchError(() => resolver.deleteData(key));
			expect(error instanceof TypeError).toBe(true);
		}
	});

	it("deleteData throws a TypeError on a key of another type", async () => {
		const resolver = new ExpressionResolver({ context: {}, name: "root" });
		const error = await catchError(() => resolver.deleteData({}));
		expect(error instanceof TypeError).toBe(true);
	});
});
