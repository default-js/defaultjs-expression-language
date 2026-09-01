import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { defaultExecuterEntry } from "../ExecuterCapabilities.js";

/**
 * SPECIFICATION.md 4.5 - the timeout delays the start of the resolution.
 * Where a statement reaches a context value, the name is spelled the way the default executer
 * spells it, taken from the catalogue - the dialect is the executer's own (8.3) and no rule here.
 */

const { variableName } = defaultExecuterEntry();

describe("Specification 4.5 - the timeout delays the start", () => {

	it("delays resolve by the given amount", async () => {
		const start = Date.now();
		const result = await ExpressionResolver.resolve(`\${ ${variableName("value")} }`, { value: "resolved" }, undefined, 100);
		expect(result).toBe("resolved");
		expect(Date.now() - start >= 90).toBe(true);
	});

	it("delays resolveText by the given amount", async () => {
		const start = Date.now();
		const result = await ExpressionResolver.resolveText(`a \${ ${variableName("value")} } b`, { value: "resolved" }, undefined, 100);
		expect(result).toBe("a resolved b");
		expect(Date.now() - start >= 90).toBe(true);
	});

	// "delays the start by that amount" leaves nothing to delay by for 0, and a negative delay is
	// not a delay either. Neither may swallow the resolution.
	it("treats a timeout of zero and a negative timeout as no delay", async () => {
		const expression = `\${ ${variableName("value")} }`;
		const zero = await ExpressionResolver.resolve(expression, { value: "resolved" }, undefined, 0);
		const negative = await ExpressionResolver.resolve(expression, { value: "resolved" }, undefined, -100);
		expect(zero).toBe("resolved");
		expect(negative).toBe("resolved");
	});

	it("is not a deadline - a statement that runs longer is not aborted", async () => {
		const context = {
			slow: () => new Promise((resolve) => setTimeout(() => resolve("late"), 150))
		};
		const result = await ExpressionResolver.resolve(`\${ ${variableName("slow")}() }`, context, undefined, 10);
		expect(result).toBe("late");
	});
});
