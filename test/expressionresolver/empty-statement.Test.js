import { describe, it, expect, afterAll } from "vitest";
import { ExpressionResolver } from "../../index.js";
import TestExecuter from "../TestExecuter.js";

/**
 * ExpressionResolver - the empty statement. SPECIFICATION.md 3.4.
 *
 * What a statement may *contain* is the executer's own. What is here is the one half of 3.4 that
 * never reaches an executer at all: the empty statement, which the resolver answers by itself. The
 * static entry points take no executer, so a case sets `ExpressionResolver.defaultExecuter` itself
 * and the file puts the previous one back.
 */

const previousDefault = ExpressionResolver.defaultExecuter;
afterAll(() => {
	ExpressionResolver.defaultExecuter = previousDefault;
});

describe("ExpressionResolver - the empty statement", () => {

	// 3.4 by way of JavaScript: an empty statement is what `return;` answers.
	it("answers undefined for an empty statement", async () => {
		ExpressionResolver.defaultExecuter = new TestExecuter();
		const result = await ExpressionResolver.resolve("${}", {});
		expect(result).toBeUndefined();
	});

	// Also green before the rule, where an empty statement answered null: the default applies to
	// null and to undefined alike (4.4), so this one states the rule rather than pinning the fix.
	it("lets the default value apply to an empty statement", async () => {
		ExpressionResolver.defaultExecuter = new TestExecuter();
		const result = await ExpressionResolver.resolve("${}", {}, "fallback");
		expect(result).toBe("fallback");
	});

	it("renders an empty statement in a text as undefined", async () => {
		ExpressionResolver.defaultExecuter = new TestExecuter();
		const result = await ExpressionResolver.resolveText("a ${} b", {});
		expect(result).toBe("a undefined b");
	});
});
