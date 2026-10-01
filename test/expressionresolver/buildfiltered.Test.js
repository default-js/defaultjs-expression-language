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

	// Which value `deep` takes when it is left out is not a rule of 6.7, so both cases pass it.
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
