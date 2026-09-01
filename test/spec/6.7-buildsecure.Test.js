import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { EXECUTERS } from "../ExecuterCapabilities.js";
import { useTestExecuter, answersFromContext } from "../TestExecuter.js";

/**
 * SPECIFICATION.md 6.7 - buildSecure and its property filter.
 */

useTestExecuter();
// the answer is the value the context carries under the statement - a lookup, so what a case
// reads is which context the resolver handed over, not what anybody computed
answersFromContext();

describe("Specification 6.7 - buildSecure", () => {

	const propFilter = (name) => name !== "secret";

	it("builds a resolver over the filtered context", async () => {
		const secure = ExpressionResolver.buildSecure({ context: { open: "ok", secret: "hidden" }, propFilter });
		const result = await secure.resolve("${ open }", "fallback");
		expect(result).toBe("ok");
	});

	it("does not carry a property the filter rejected", async () => {
		const secure = ExpressionResolver.buildSecure({ context: { open: "ok", secret: "hidden" }, propFilter });
		expect(await secure.resolve("${ secret }")).toBeUndefined();
	});

	// That a statement can still reach a global - buildSecure is no sandbox - is not a rule of 6.7
	// but a freedom of 8.3, and it is in the matrix as `reaches a global that no resolver carries`.
	// It cannot be asserted here without evaluating something, and it would say nothing about
	// buildSecure if it were.

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
