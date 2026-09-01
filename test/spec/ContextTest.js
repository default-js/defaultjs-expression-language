import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { EXECUTERS, defaultExecuterEntry } from "../ExecuterCapabilities.js";
import { EXECUTERNAME as ContextDeconstructorExecuterName } from "../../src/executer/ContextDeconstructorExecuter.js";

/**
 * Conformance tests for SPECIFICATION.md section 6 - the context.
 *
 * What is left here is resolver API: the proxy without a statement in play, the global object as a
 * context object, the switch of 6.5, the four data methods and buildSecure. All of it is
 * observable without executing anything and runs once.
 *
 * The rules that need a statement - 6.1 through the executer, 6.2, 6.3 and the negative guarantee
 * of 6.5 - are asked of every executer in `test/executer/shared/ContextRules.js`.
 *
 * Two things of section 6 are deliberately not pinned here, and both belong to section 8:
 * how a name that no link carries reaches the global object (6.4, second half), and where an
 * assignment inside an expression lands when it can be intercepted (6.5) - the specification
 * calls that "the executer's business" in as many words.
 *
 * Where a statement reaches a context value, the name is spelled the way the default executer
 * spells it, taken from the catalogue - the dialect is the executer's own (8.3), so a suite that
 * wrote a bare name by hand would fail everywhere the day the default moves to the one that
 * demands a prefix.
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

describe("Specification 6.4 - the global object as a context object", () => {

	it("takes the global object as an ordinary link of the chain", async () => {
		const resolver = new ExpressionResolver({ context: globalThis, name: "global" });
		const result = await resolver.resolve("${ Math.round(1.5) }", "fallback");
		expect(result).toBe(2);
	});

	// This executer gets its own case because it is the one that reads the names of the context
	// before it runs a statement, so a global context reaches it differently than the other three.
	it("takes the global object as an ordinary link under the deconstruction executer", async () => {
		const resolver = new ExpressionResolver({ context: globalThis, name: "global", executer: ContextDeconstructorExecuterName });
		const result = await resolver.resolve("${ Math.round(1.5) }", "fallback");
		expect(result).toBe(2);
	});

	// A link below a global one asks the global link for its names, which is where an indexed name
	// of the global object reaches an executer that turns names into code. A page carrying a frame
	// has one: window[0] is frames[0], so the own name "0" appears for as long as the frame does.
	it("carries a link below a global one while the page has a frame", async () => {
		const frame = document.createElement("iframe");
		document.body.appendChild(frame);
		try {
			const root = new ExpressionResolver({ context: globalThis, name: "global", executer: ContextDeconstructorExecuterName });
			const leaf = new ExpressionResolver({ context: { own: "from leaf" }, name: "leaf", parent: root, executer: ContextDeconstructorExecuterName });
			expect(await leaf.resolve("${ own }")).toBe("from leaf");
		} finally {
			frame.remove();
		}
	});
});

describe("Specification 6.5 - the switch that allows writing to the global object", () => {

	// Only the existence and the default are pinned here. That the switch, once on, lets a write
	// through cannot be told apart from today's behaviour - today every write reaches the global
	// object - so no test claims it. It belongs to the fix, together with the executer half of
	// 6.5 which section 8 covers.
	// not implemented, waits for BACKLOG.md "A write to an unknown name inside an expression lands on `globalThis`"
	it.fails("carries an application level switch that is off by default", async () => {
		expect(ExpressionResolver.allowGlobalWrite).toBe(false);
	});
});

describe("Specification 6.6 - reading and writing from outside", () => {

	const buildChain = () => {
		const root = new ExpressionResolver({ context: { value: "from root", rootOnly: "r" }, name: "root" });
		const leaf = new ExpressionResolver({ context: { leafOnly: "l" }, name: "leaf", parent: root });
		return { root, leaf };
	};

	it("getData answers the whole context of the addressed link when no key is given", async () => {
		const { leaf } = buildChain();
		expect(leaf.getData() === leaf.context).toBe(true);
	});

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

	it("mergeContext is shallow - a merged object replaces rather than merges", async () => {
		const resolver = new ExpressionResolver({ context: { holder: { keep: 1 } }, name: "root" });
		resolver.mergeContext({ holder: { fresh: 2 } });
		expect(resolver.getData("holder").keep).toBeUndefined();
		expect(resolver.getData("holder").fresh).toBe(2);
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

describe("Specification 6.7 - buildSecure", () => {

	const propFilter = (name) => name !== "secret";

	it("builds a resolver over the filtered context", async () => {
		const secure = ExpressionResolver.buildSecure({ context: { open: "ok", secret: "hidden" }, propFilter });
		const result = await secure.resolve(`\${ ${variableName("open")} }`, "fallback");
		expect(result).toBe("ok");
	});

	it("does not carry a property the filter rejected", async () => {
		const secure = ExpressionResolver.buildSecure({ context: { open: "ok", secret: "hidden" }, propFilter });
		const result = await secure.resolve(`\${ typeof ${variableName("secret")} }`);
		expect(result).toBe("undefined");
	});

	it("filters the context, not the globals - it is not a sandbox", async () => {
		const secure = ExpressionResolver.buildSecure({ context: { open: "ok", secret: "hidden" }, propFilter });
		const result = await secure.resolve("${ typeof Math }", "fallback");
		expect(result).toBe("object");
	});

	it("forwards name and parent to the constructor", async () => {
		const root = new ExpressionResolver({ context: { rootOnly: "from root" }, name: "root" });
		const secure = ExpressionResolver.buildSecure({ context: { open: "ok" }, propFilter, option: { name: "secure", parent: root } });
		expect(secure.name).toBe("secure");
		expect(secure.parent === root).toBe(true);
	});

	it("forwards the executer to the constructor", async () => {
		const secure = ExpressionResolver.buildSecure({
			context: { open: "ok" },
			propFilter,
			option: { name: "secure", executer: EXECUTERS[1].name }
		});
		const result = await secure.resolve("${ ctx.open }", "fallback");
		expect(result).toBe("ok");
	});
});
