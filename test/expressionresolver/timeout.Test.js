import { describe, it, expect, afterAll } from "vitest";
import { ExpressionResolver } from "../../index.js";
import TestExecuter from "../TestExecuter.js";

/**
 * ExpressionResolver - the timeout delays the start of the resolution. SPECIFICATION.md 4.5.
 *
 * The static entry points take no executer, so a case sets `ExpressionResolver.defaultExecuter`
 * itself and the file puts the previous one back.
 */

// answers the value the context carries under the statement - a lookup, not an evaluation
const lookup = () => new TestExecuter((aStatement, aContext) => aContext[aStatement]);

const previousDefault = ExpressionResolver.defaultExecuter;
afterAll(() => {
	ExpressionResolver.defaultExecuter = previousDefault;
});

describe("ExpressionResolver - the timeout delays the start", () => {

	it("delays resolve by the given amount", async () => {
		ExpressionResolver.defaultExecuter = lookup();
		const start = Date.now();
		const result = await ExpressionResolver.resolve("${ value }", { value: "resolved" }, undefined, 100);
		expect(result).toBe("resolved");
		expect(Date.now() - start >= 90).toBe(true);
	});

	it("delays resolveText by the given amount", async () => {
		ExpressionResolver.defaultExecuter = lookup();
		const start = Date.now();
		const result = await ExpressionResolver.resolveText("a ${ value } b", { value: "resolved" }, undefined, 100);
		expect(result).toBe("a resolved b");
		expect(Date.now() - start >= 90).toBe(true);
	});

	// "delays the start by that amount" leaves nothing to delay by for 0, and a negative delay is
	// not a delay either. Neither may swallow the resolution.
	it("treats a timeout of zero and a negative timeout as no delay", async () => {
		ExpressionResolver.defaultExecuter = lookup();
		const expression = "${ value }";
		const zero = await ExpressionResolver.resolve(expression, { value: "resolved" }, undefined, 0);
		const negative = await ExpressionResolver.resolve(expression, { value: "resolved" }, undefined, -100);
		expect(zero).toBe("resolved");
		expect(negative).toBe("resolved");
	});

	// The timeout delays the start; what the statement then takes is its own business. The answer is
	// a promise that settles well after the delay, so nothing but a deadline could cut it short.
	it("is not a deadline - a statement that runs longer is not aborted", async () => {
		ExpressionResolver.defaultExecuter = new TestExecuter(() => new Promise((resolve) => setTimeout(() => resolve("late"), 150)));
		const result = await ExpressionResolver.resolve("${ slow }", {}, undefined, 10);
		expect(result).toBe("late");
	});
});
