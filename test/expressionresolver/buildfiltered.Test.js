import { describe, it, expect, afterAll } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { EXECUTERNAME as ContextObjectExecuterName } from "../../src/executer/ContextObjectExecuter.js";
import getExecuter from "../../src/ExecuterRegistry.js";
import TestExecuter from "../TestExecuter.js";

/**
 * ExpressionResolver - buildFiltered and its property filter. SPECIFICATION.md 6.7.
 *
 * A resolver built without the executer option takes the default, so a case that resolves sets
 * `ExpressionResolver.defaultExecuter` itself and the file puts the previous one back.
 */

// answers the value the context carries under the statement - a lookup, not an evaluation
const lookup = () => new TestExecuter((aStatement, aContext) => aContext[aStatement]);

const previousDefault = ExpressionResolver.defaultExecuter;
afterAll(() => {
	ExpressionResolver.defaultExecuter = previousDefault;
});

describe("ExpressionResolver - buildFiltered", () => {

	const propFilter = (name) => name !== "secret";

	it("builds a resolver over the filtered context", async () => {
		ExpressionResolver.defaultExecuter = lookup();
		const filtered = ExpressionResolver.buildFiltered({ context: { open: "ok", secret: "hidden" }, propFilter });
		const result = await filtered.resolve("${ open }", "fallback");
		expect(result).toBe("ok");
	});

	it("does not carry a property the filter rejected", async () => {
		ExpressionResolver.defaultExecuter = lookup();
		const filtered = ExpressionResolver.buildFiltered({ context: { open: "ok", secret: "hidden" }, propFilter });
		expect(await filtered.resolve("${ secret }")).toBeUndefined();
	});

	// Both cases pass `deep`, so each says what one value does; the value it takes when left out is
	// the case after them.
	it("filters a sub object as well with deep", async () => {
		ExpressionResolver.defaultExecuter = lookup();
		const filtered = ExpressionResolver.buildFiltered({ context: { sub: { open: "ok", secret: "hidden" } }, propFilter, option: { deep: true } });
		const sub = await filtered.resolve("${ sub }");
		expect(sub.secret).toBeUndefined();
	});

	it("takes a sub object over unfiltered without deep", async () => {
		ExpressionResolver.defaultExecuter = lookup();
		const filtered = ExpressionResolver.buildFiltered({ context: { sub: { open: "ok", secret: "hidden" } }, propFilter, option: { deep: false } });
		const sub = await filtered.resolve("${ sub }");
		expect(sub.secret).toBe("hidden");
	});

	// The cases from here to the next comment pin what 6.7 took over from README.md on 2026-10-03.
	// Written after the behaviour - they guard it, they prove no fix.
	it("filters a sub object as well where deep is left out", async () => {
		ExpressionResolver.defaultExecuter = lookup();
		const filtered = ExpressionResolver.buildFiltered({ context: { sub: { open: "ok", secret: "hidden" } }, propFilter, option: { name: "filtered" } });
		const sub = await filtered.resolve("${ sub }");
		expect(sub.secret).toBeUndefined();
	});

	// What arrived is recorded by the filter itself.
	it("calls the filter with the name, the value and the object the property is read from", async () => {
		const context = { open: "ok" };
		const calls = [];
		ExpressionResolver.buildFiltered({ context, propFilter: (aName, aValue, aHolder) => calls.push([aName, aValue, aHolder]) });
		expect(calls.length === 1 && calls[0][0] === "open" && calls[0][1] === "ok" && calls[0][2] === context).toBe(true);
	});

	it("offers an inherited enumerable property to the filter", async () => {
		const names = [];
		ExpressionResolver.buildFiltered({ context: Object.create({ inherited: "from the prototype" }), propFilter: (aName) => names.push(aName) });
		expect(names.includes("inherited")).toBe(true);
	});

	// That a statement can still reach a global - buildFiltered is no sandbox - is not a rule of 6.7
	// but the executer's own, and is tested with each executer.

	it("forwards name and parent to the constructor", async () => {
		const root = new ExpressionResolver({ context: { rootOnly: "from root" }, name: "root" });
		const filtered = ExpressionResolver.buildFiltered({ context: { open: "ok" }, propFilter, option: { name: "filtered", parent: root } });
		expect(filtered.name).toBe("filtered");
		expect(filtered.parent === root).toBe(true);
	});

	it("forwards the executer to the constructor", async () => {
		const filtered = ExpressionResolver.buildFiltered({
			context: { open: "ok" },
			propFilter,
			option: { name: "filtered", executer: ContextObjectExecuterName }
		});
		expect(filtered.executer === getExecuter(ContextObjectExecuterName)).toBe(true);
	});
});

describe("ExpressionResolver - buildSecure, the deprecated name of buildFiltered", () => {

	it("builds a resolver over the filtered context", async () => {
		ExpressionResolver.defaultExecuter = lookup();
		const filtered = ExpressionResolver.buildSecure({ context: { open: "ok", secret: "hidden" }, propFilter: (name) => name !== "secret" });
		expect(await filtered.resolve("${ secret }")).toBeUndefined();
	});
});
