import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { EXECUTERS, defaultExecuterEntry } from "../ExecuterCapabilities.js";

/**
 * SPECIFICATION.md 6.1 - the proxy, seen without executing a statement.
 *
 * That it is not the object the caller handed in, and that it enumerates the whole chain, is
 * resolver API. What a statement reads through it is asked of every executer in
 * test/executer/rules/6.1-the-proxy.Test.js.
 * Where a statement reaches a context value, the name is spelled the way the default executer
 * spells it, taken from the catalogue - the dialect is the executer's own (8.3) and no rule here.
 */

const { variableName } = defaultExecuterEntry();

describe("Specification 6.1 - every access goes through the proxy", () => {

	it("answers a proxy rather than the object the caller handed in", async () => {
		const handed = { value: "handed in" };
		const resolver = new ExpressionResolver({ context: handed, name: "root" });
		expect(resolver.context === handed).toBe(false);
	});

	it("sees the chain through the context of a single link", async () => {
		const root = new ExpressionResolver({ context: { rootOnly: "from root" }, name: "root" });
		const leaf = new ExpressionResolver({ context: { leafOnly: "from leaf" }, name: "leaf", parent: root });
		expect(leaf.context.rootOnly).toBe("from root");
	});

	// The proxy answers the names of the whole chain, which is more than the object it was built
	// over carries. A frozen object cannot be spoken for that way - a proxy over one may report
	// nothing but its own keys - so the proxy is not built over the context at all.
	it("enumerates the chain over a context the caller froze", async () => {
		const root = new ExpressionResolver({ context: { rootOnly: "from root" }, name: "root" });
		const leaf = new ExpressionResolver({ context: Object.freeze({ leafOnly: "from leaf" }), name: "leaf", parent: root });
		const names = Object.keys(leaf.context);
		expect(names.includes("leafOnly")).toBe(true);
		expect(names.includes("rootOnly")).toBe(true);
	});

	it("resolves over a context the caller froze", async () => {
		const resolver = new ExpressionResolver({ context: Object.freeze({ own: "frozen" }), name: "root" });
		expect(await resolver.resolve(`\${ ${variableName("own")} }`)).toBe("frozen");
	});

	// A single frozen link is enough: the property cache walks the prototype chain, so the names of
	// Object.prototype are reported for an object that has no own key beside its own.
	it("enumerates a frozen context that stands alone", async () => {
		const resolver = new ExpressionResolver({ context: Object.freeze({ own: "frozen" }), name: "solo" });
		expect(Object.keys(resolver.context).includes("own")).toBe(true);
		expect(JSON.stringify(resolver.context).includes("frozen")).toBe(true);
	});
});
