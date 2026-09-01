import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { defaultExecuterEntry } from "../ExecuterCapabilities.js";

/**
 * SPECIFICATION.md 3.4 - a statement is arbitrary JavaScript.
 * Where a statement reaches a context value, the name is spelled the way the default executer
 * spells it, taken from the catalogue - the dialect is the executer's own (8.3) and no rule here.
 */

const { variableName } = defaultExecuterEntry();

describe("Specification 3.4 - a statement is arbitrary JavaScript", () => {

	it("evaluates an operator expression over the context", async () => {
		const result = await ExpressionResolver.resolve(`\${ ${variableName("a")} * ${variableName("b")} }`, { a: 6, b: 7 });
		expect(result).toBe(42);
	});

	it("evaluates a call on a context member", async () => {
		const result = await ExpressionResolver.resolve(`\${ ${variableName("value")}.toUpperCase() }`, { value: "text" });
		expect(result).toBe("TEXT");
	});

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

	it("evaluates an await inside the statement", async () => {
		const result = await ExpressionResolver.resolve("${ await Promise.resolve(20) + 1 }", {});
		expect(result).toBe(21);
	});
});
