import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";

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
});
