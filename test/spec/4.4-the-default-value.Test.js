import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { defaultExecuterEntry } from "../ExecuterCapabilities.js";

/**
 * SPECIFICATION.md 4.4 - what the default value replaces and what it does not.
 * Where a statement reaches a context value, the name is spelled the way the default executer
 * spells it, taken from the catalogue - the dialect is the executer's own (8.3) and no rule here.
 */

const { variableName } = defaultExecuterEntry();

describe("Specification 4.4 - the default value", () => {

	it("replaces a result of undefined", async () => {
		const result = await ExpressionResolver.resolve("${ undefined }", {}, "fallback");
		expect(result).toBe("fallback");
	});

	it("replaces a result of null", async () => {
		const result = await ExpressionResolver.resolve("${ null }", {}, "fallback");
		expect(result).toBe("fallback");
	});

	it("does not replace 0", async () => {
		const result = await ExpressionResolver.resolve("${ 0 }", {}, "fallback");
		expect(result).toBe(0);
	});

	it("does not replace an empty string", async () => {
		const result = await ExpressionResolver.resolve("${ \"\" }", {}, "fallback");
		expect(result).toBe("");
	});

	it("honours undefined passed as the default", async () => {
		const result = await ExpressionResolver.resolve("${ null }", {}, undefined);
		expect(result).toBeUndefined();
	});

	it("answers null without a default, where undefined as the default would answer undefined", async () => {
		const result = await ExpressionResolver.resolve("${ null }", {});
		expect(result).toBe(null);
	});

	it("applies the default per expression in resolveText", async () => {
		const result = await ExpressionResolver.resolveText(`\${ ${variableName("a")} } \${ ${variableName("b")} }`, { a: null, b: "two" }, "fallback");
		expect(result).toBe("fallback two");
	});

	it("renders undefined and null literally in resolveText without a default", async () => {
		const result = await ExpressionResolver.resolveText(`\${ ${variableName("a")} } \${ ${variableName("b")} }`, { a: undefined, b: null });
		expect(result).toBe("undefined null");
	});

	// 4.3 casts towards string, and 4.4 puts the default where the value would have stood, so a
	// default that is an object is cast like any other value.
	// The key exists and holds undefined, so the lookup answers and the default takes its place. A
	// key no link carries would raise instead, and per 7 the expression would stand.
	it("casts a default that is an object towards string in resolveText", async () => {
		const result = await ExpressionResolver.resolveText(`\${ ${variableName("missing")} }`, { missing: undefined }, { a: 1 });
		expect(result).toBe("[object Object]");
	});
});
