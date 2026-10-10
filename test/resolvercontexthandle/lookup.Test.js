import { describe, it, expect } from "vitest";
import ResolverContextHandle from "../../src/ResolverContextHandle.js";

/**
 * ResolverContextHandle - which handle of the chain answers a name. SPECIFICATION.md 5.2.
 *
 * The walk lives in the traps of the proxy a handle hands out, so it is asked of that proxy through
 * the three questions an executer can put to it: reading a name (`get`), asking whether one exists
 * (`has`), and listing them all (`ownKeys`). Every case builds handles directly over plain data, a
 * parent handle where the chain matters.
 */

describe("ResolverContextHandle - lookup without a prefix", () => {

	it("answers from the nearest handle and shadows the ones above", () => {
		const root = new ResolverContextHandle({ value: "from root" });
		const leaf = new ResolverContextHandle({ value: "from leaf" }, root);
		expect(leaf.context.value).toBe("from leaf");
	});

	it("reaches a value carried by an ancestor", () => {
		const root = new ResolverContextHandle({ rootOnly: "from root" });
		const leaf = new ResolverContextHandle({ leafOnly: "from leaf" }, root);
		expect(leaf.context.rootOnly).toBe("from root");
	});

	it("never sees the context of a handle below", () => {
		const root = new ResolverContextHandle({ rootOnly: "from root" });
		new ResolverContextHandle({ leafOnly: "from leaf" }, root);
		expect(root.context.leafOnly).toBeUndefined();
	});

	it("stops the walk at a key that holds undefined", () => {
		const root = new ResolverContextHandle({ value: "from root" });
		const leaf = new ResolverContextHandle({ value: undefined }, root);
		expect(leaf.context.value).toBeUndefined();
	});

	// A method is found by the same walk; the getter is the case that also shows it is called.
	it("reaches a getter inherited through the prototype chain", () => {
		class Data {
			get value() {
				return "from getter";
			}
		}
		expect(new ResolverContextHandle(new Data()).context.value).toBe("from getter");
	});
});

describe("ResolverContextHandle - which names the proxy says it carries", () => {

	// `has` is what a `with` block asks before it reads, so a name the chain carries has to be
	// present on the proxy of every handle below the one carrying it.
	it("says it carries a name only an ancestor carries", () => {
		const root = new ResolverContextHandle({ rootOnly: "from root" });
		const leaf = new ResolverContextHandle({ leafOnly: "from leaf" }, root);
		expect("rootOnly" in leaf.context).toBe(true);
	});

	it("says it does not carry a name no handle of the chain carries", () => {
		const root = new ResolverContextHandle({ rootOnly: "from root" });
		const leaf = new ResolverContextHandle({ leafOnly: "from leaf" }, root);
		expect("nowhere" in leaf.context).toBe(false);
	});

	it("says it carries a key that holds undefined", () => {
		expect("value" in new ResolverContextHandle({ value: undefined }).context).toBe(true);
	});

	it("lists the names of every handle up to the root, each once", () => {
		const root = new ResolverContextHandle({ rootOnly: 1, value: 1 });
		const leaf = new ResolverContextHandle({ leafOnly: 1, value: 2 }, root);
		expect(Object.keys(leaf.context).sort().join()).toBe("leafOnly,rootOnly,value");
	});

	it("lists no name of a handle below", () => {
		const root = new ResolverContextHandle({ rootOnly: 1 });
		new ResolverContextHandle({ leafOnly: 1 }, root);
		expect(Object.keys(root.context).sort().join()).toBe("rootOnly");
	});
});
