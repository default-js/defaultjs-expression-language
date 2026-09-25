import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { useTestExecuter, answersFromContext } from "../TestExecuter.js";

/**
 * SPECIFICATION.md 5.4 - a scope prefix that names no resolver of the chain.
 *
 * The resolver does not exist, so there is nothing to hand a statement to; the answer is the
 * resolver's alone.
 */

useTestExecuter();
// were a statement handed over after all, the lookup would answer "from leaf" and give it away
answersFromContext();

describe("Specification 5.4 - a prefix no resolver carries", () => {

	it("answers undefined", async () => {
		const root = new ExpressionResolver({ context: { value: "from root" }, name: "root" });
		const leaf = new ExpressionResolver({ context: { value: "from leaf" }, name: "leaf", parent: root });
		expect(await leaf.resolveText("${nowhere::value}")).toBe("undefined");
	});

	it("lets the default value apply", async () => {
		const root = new ExpressionResolver({ context: { value: "from root" }, name: "root" });
		const leaf = new ExpressionResolver({ context: { value: "from leaf" }, name: "leaf", parent: root });
		expect(await leaf.resolveText("${nowhere::value}", "fallback")).toBe("fallback");
	});
});
