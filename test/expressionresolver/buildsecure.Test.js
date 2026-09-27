import { describe, it, expect, afterAll } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { EXECUTERNAME as ContextObjectExecuterName } from "../../src/executer/ContextObjectExecuter.js";
import getExecuter from "../../src/ExecuterRegistry.js";
import TestExecuter from "../TestExecuter.js";

/**
 * ExpressionResolver - buildSecure and its property filter. SPECIFICATION.md 6.7.
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

describe("ExpressionResolver - buildSecure", () => {

	const propFilter = (name) => name !== "secret";

	it("builds a resolver over the filtered context", async () => {
		ExpressionResolver.defaultExecuter = lookup();
		const secure = ExpressionResolver.buildSecure({ context: { open: "ok", secret: "hidden" }, propFilter });
		const result = await secure.resolve("${ open }", "fallback");
		expect(result).toBe("ok");
	});

	it("does not carry a property the filter rejected", async () => {
		ExpressionResolver.defaultExecuter = lookup();
		const secure = ExpressionResolver.buildSecure({ context: { open: "ok", secret: "hidden" }, propFilter });
		expect(await secure.resolve("${ secret }")).toBeUndefined();
	});

	// That a statement can still reach a global - buildSecure is no sandbox - is not a rule of 6.7
	// but the executer's own, and is tested with each executer.

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
			option: { name: "secure", executer: ContextObjectExecuterName }
		});
		expect(secure.executer === getExecuter(ContextObjectExecuterName)).toBe(true);
	});
});
