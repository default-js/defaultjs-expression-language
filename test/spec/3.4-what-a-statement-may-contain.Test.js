import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { useTestExecuter } from "../TestExecuter.js";

/**
 * SPECIFICATION.md 3.4 - the empty statement.
 *
 * What a statement may *contain* is a demand on the implementations and is asked of all four in
 * `test/executer/rules/3.4-…`. What is left here is the one half of 3.4 that never reaches an
 * executer at all: the empty statement, which the resolver answers by itself.
 * Where a statement reaches a context value, the name is spelled the way the default executer
 * spells it, taken from the catalogue - the dialect is the executer's own (8.3) and no rule here.
 */

useTestExecuter();

describe("Specification 3.4 - a statement is arbitrary JavaScript", () => {

	// 3.4 by way of JavaScript: an empty statement is what `return;` answers.
	it("answers undefined for an empty statement", async () => {
		const result = await ExpressionResolver.resolve("${}", {});
		expect(result).toBeUndefined();
	});

	// Also green before the rule, where an empty statement answered null: the default applies to
	// null and to undefined alike (4.4), so this one states the rule rather than pinning the fix.
	it("lets the default value apply to an empty statement", async () => {
		const result = await ExpressionResolver.resolve("${}", {}, "fallback");
		expect(result).toBe("fallback");
	});

	it("renders an empty statement in a text as undefined", async () => {
		const result = await ExpressionResolver.resolveText("a ${} b", {});
		expect(result).toBe("a undefined b");
	});

});
