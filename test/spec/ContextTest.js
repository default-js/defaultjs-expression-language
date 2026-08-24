import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { EXECUTERS } from "../TestUtils.js";
import { EXECUTERNAME as WithScopedExecuterName } from "../../src/executer/WithScopedExecuter.js";
import { EXECUTERNAME as ContextDeconstructorExecuterName } from "../../src/executer/ContextDeconstructorExecuter.js";

/**
 * Conformance tests for SPECIFICATION.md section 6 - the context.
 *
 * Split the same way as the chain suite. A rule that is only observable through a statement runs
 * once per registered executer, because 8.3 grants an executer three freedoms and none of them is
 * a rule of 6.2, 6.3 or the negative guarantee of 6.5. The rest - the proxy itself, the global
 * object as a context object, the four data methods, buildSecure - is resolver API and runs once.
 *
 * Two things of section 6 are deliberately not pinned here, and both belong to section 8:
 * how a name that no link carries reaches the global object (6.4, second half), and where an
 * assignment inside an expression lands when it can be intercepted (6.5) - the specification
 * calls that "the executer's business" in as many words.
 */

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
});

for (const { name: executer, variableName } of EXECUTERS) {

	describe(`Specification 6.2 - names are a snapshot, values are live [${executer}]`, () => {

		it("does not see a key added to the handed-in object after the resolver was built", async () => {
			const variableNameAdded = variableName("added");
			const handed = { known: 1 };
			const resolver = new ExpressionResolver({ context: handed, name: "root", executer });
			handed.added = 2;
			const result = await resolver.resolve(`\${typeof ${variableNameAdded}}`);
			expect(result).toBe("undefined");
		});

		it("sees that key after resetCache", async () => {
			const variableNameAdded = variableName("added");
			const handed = { known: 1 };
			const resolver = new ExpressionResolver({ context: handed, name: "root", executer });
			handed.added = 2;
			resolver.contextHandle.resetCache();
			const result = await resolver.resolve(`\${${variableNameAdded}}`, "fallback");
			expect(result).toBe(2);
		});

		it("reads a value at the moment of the lookup, so a mutation is visible immediately", async () => {
			const variableNameHolder = variableName("holder");
			const handed = { holder: { name: "before" } };
			const resolver = new ExpressionResolver({ context: handed, name: "root", executer });
			handed.holder.name = "after";
			const result = await resolver.resolve(`\${${variableNameHolder}.name}`, "fallback");
			expect(result).toBe("after");
		});

		it("keeps the set of names in step when a value is written through the resolver", async () => {
			const variableNameFresh = variableName("fresh");
			const resolver = new ExpressionResolver({ context: { known: 1 }, name: "root", executer });
			resolver.updateData("fresh", 2);
			const result = await resolver.resolve(`\${${variableNameFresh}}`, "fallback");
			expect(result).toBe(2);
		});
	});

	describe(`Specification 6.3 - a link without a context [${executer}]`, () => {

		it("contributes nothing to a lookup and is passed through", async () => {
			const variableNameValue = variableName("value");
			const root = new ExpressionResolver({ context: { value: "from root" }, name: "root", executer });
			const middle = new ExpressionResolver({ context: null, name: "middle", parent: root, executer });
			const leaf = new ExpressionResolver({ context: { leafOnly: 1 }, name: "leaf", parent: middle, executer });
			const result = await leaf.resolve(`\${${variableNameValue}}`, "fallback");
			expect(result).toBe("from root");
		});

		it("gains content like any other link", async () => {
			const variableNameValue = variableName("value");
			const root = new ExpressionResolver({ context: { value: "from root" }, name: "root", executer });
			const middle = new ExpressionResolver({ context: null, name: "middle", parent: root, executer });
			const leaf = new ExpressionResolver({ context: { leafOnly: 1 }, name: "leaf", parent: middle, executer });
			middle.mergeContext({ value: "from middle" });
			const result = await leaf.resolve(`\${${variableNameValue}}`, "fallback");
			expect(result).toBe("from middle");
		});
	});

	describe(`Specification 6.5 - no write from an expression reaches the global object [${executer}]`, () => {

		// The rule holds under every executer, but only two of them break it today, so only those
		// two carry the marker: with-scoped lets an assignment to an unknown name fall out of the
		// `with` block into global scope, and the deconstructor executer generates a sloppy-mode
		// body where an undeclared assignment does the same. The other two keep the guarantee
		// already - context-object writes through the proxy, esprima rewrites the identifier onto
		// the context object - and a test marked fails would fail there for passing.
		const leaksToday = executer === WithScopedExecuterName || executer === ContextDeconstructorExecuterName;
		const pin = leaksToday ? it.fails : it;

		// The switch is off by default, so this is the guarantee as it stands out of the box. The
		// leak is read and cleaned up before the assertion, because a test marked fails stops at
		// the assertion and would otherwise leave the name on globalThis for every later test.
		pin("does not create a global for a name no link carries", async () => {
			const leakName = `leaked_${executer.replace(/-/g, "_")}`;
			const variableNameLeak = variableName(leakName);
			const resolver = new ExpressionResolver({ context: { known: 1 }, name: "root", executer });
			await resolver.resolve(`\${${variableNameLeak} = 1}`);
			const leaked = leakName in globalThis;
			delete globalThis[leakName];
			expect(leaked).toBe(false);
		});
	});
}

describe("Specification 6.4 - the global object as a context object", () => {

	// not implemented, waits for BACKLOG.md "A resolver built on the global object throws on every lookup"
	it.fails("takes the global object as an ordinary link of the chain", async () => {
		const resolver = new ExpressionResolver({ context: globalThis, name: "global" });
		const result = await resolver.resolve("${ Math.round(1.5) }", "fallback");
		expect(result).toBe(2);
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

	// not implemented, waits for BACKLOG.md "`getData` and `deleteData` are broken on the filter path"
	it.fails("getData with a filter reads from the addressed link", async () => {
		const { leaf } = buildChain();
		expect(leaf.getData("value", "root")).toBe("from root");
	});

	it("getData with a filter naming the calling link reads from it", async () => {
		const { leaf } = buildChain();
		expect(leaf.getData("leafOnly", "leaf")).toBe("l");
	});

	// not implemented, waits for BACKLOG.md "The data methods have no rules along the chain"
	it.fails("getData throws on a filter that matches no link", async () => {
		const { leaf } = buildChain();
		let error = null;
		try {
			leaf.getData("value", "nowhere");
		} catch (e) {
			error = e;
		}
		expect(error != null).toBe(true);
	});

	// not implemented, waits for BACKLOG.md "The data methods have no rules along the chain"
	it.fails("updateData without a filter changes the value where the key lives", async () => {
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

	// not implemented, waits for BACKLOG.md "The data methods have no rules along the chain"
	it.fails("updateData throws on a filter that matches no link", async () => {
		const { leaf } = buildChain();
		let error = null;
		try {
			leaf.updateData("value", "changed", "nowhere");
		} catch (e) {
			error = e;
		}
		expect(error != null).toBe(true);
	});

	// not implemented, waits for BACKLOG.md "`getData` and `deleteData` are broken on the filter path"
	it.fails("deleteData with a filter removes the key from the addressed link", async () => {
		const { root, leaf } = buildChain();
		leaf.deleteData("rootOnly", "root");
		expect(root.getData("rootOnly")).toBeUndefined();
	});

	// not implemented, waits for BACKLOG.md "The data methods have no rules along the chain"
	it.fails("deleteData without a filter removes the key from the first link carrying it", async () => {
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

	// This one passes today, but not for the reason it states: the walk to the parent calls
	// `deleteDataData`, a method that does not exist, so a TypeError comes out of the typo rather
	// than a deliberate error about an unknown scope. It carries no marker, because it does pass -
	// but it proves the rule only once that typo is gone. Noted in BACKLOG.md with the fix.
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

	// not implemented, waits for BACKLOG.md "The data methods have no rules along the chain"
	it.fails("mergeContext throws on a filter that matches no link", async () => {
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

	// not implemented, waits for BACKLOG.md "`buildSecure` drops the options a secure context needs most"
	it.fails("builds a resolver over the filtered context", async () => {
		const secure = ExpressionResolver.buildSecure({ context: { open: "ok", secret: "hidden" }, propFilter });
		const result = await secure.resolve("${ open }", "fallback");
		expect(result).toBe("ok");
	});

	// not implemented, waits for BACKLOG.md "`buildSecure` drops the options a secure context needs most"
	it.fails("does not carry a property the filter rejected", async () => {
		const secure = ExpressionResolver.buildSecure({ context: { open: "ok", secret: "hidden" }, propFilter });
		const result = await secure.resolve("${ typeof secret }");
		expect(result).toBe("undefined");
	});

	// not implemented, waits for BACKLOG.md "`buildSecure` drops the options a secure context needs most"
	it.fails("filters the context, not the globals - it is not a sandbox", async () => {
		const secure = ExpressionResolver.buildSecure({ context: { open: "ok", secret: "hidden" }, propFilter });
		const result = await secure.resolve("${ typeof Math }", "fallback");
		expect(result).toBe("object");
	});

	// not implemented, waits for BACKLOG.md "`buildSecure` drops the options a secure context needs most"
	it.fails("forwards name and parent to the constructor", async () => {
		const root = new ExpressionResolver({ context: { rootOnly: "from root" }, name: "root" });
		const secure = ExpressionResolver.buildSecure({ context: { open: "ok" }, propFilter, name: "secure", parent: root });
		expect(secure.name).toBe("secure");
		expect(secure.parent === root).toBe(true);
	});

	// not implemented, waits for BACKLOG.md "`buildSecure` drops the options a secure context needs most"
	it.fails("forwards the executer to the constructor", async () => {
		const secure = ExpressionResolver.buildSecure({
			context: { open: "ok" },
			propFilter,
			name: "secure",
			executer: EXECUTERS[1].name
		});
		const result = await secure.resolve("${ ctx.open }", "fallback");
		expect(result).toBe("ok");
	});
});
