import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { useTestExecuter, answersFromContext, answerWith } from "../TestExecuter.js";

/**
 * SPECIFICATION.md 4.1 - the static entry points, in both call forms, and the rejection of a first
 * argument that is neither.
 */

useTestExecuter();
// the answer is the value the context carries under the statement - a lookup, so what a case
// reads is which context the resolver handed over, not what anybody computed
answersFromContext();

describe("Specification 4.1 - the static entry points, positional form", () => {

	it("resolve takes expression and context positionally", async () => {
		const result = await ExpressionResolver.resolve("${ value }", { value: "resolved" });
		expect(result).toBe("resolved");
	});

	it("resolveText takes text and context positionally", async () => {
		const result = await ExpressionResolver.resolveText("a ${ value } b", { value: "resolved" });
		expect(result).toBe("a resolved b");
	});

	it("decides the call form by the first argument alone, so a context may carry a key named context", async () => {
		answerWith((aStatement, aContext) => aContext.context.value);
		const result = await ExpressionResolver.resolve("${ context.value }", { context: { value: "resolved" } });
		expect(result).toBe("resolved");
	});
});

describe("Specification 4.1 - the static entry points, configuration form", () => {

	it("resolve takes a configuration object", async () => {
		const result = await ExpressionResolver.resolve({ expression: "${ value }", context: { value: "resolved" } });
		expect(result).toBe("resolved");
	});

	it("resolveText takes a configuration object carrying the text", async () => {
		const result = await ExpressionResolver.resolveText({ text: "a ${ value } b", context: { value: "resolved" } });
		expect(result).toBe("a resolved b");
	});

	it("carries the default value under the key defaultValue", async () => {
		const result = await ExpressionResolver.resolve({ expression: "${ missing }", context: {}, defaultValue: "fallback" });
		expect(result).toBe("fallback");
	});

	it("carries the timeout under the key timeout", async () => {
		const start = Date.now();
		const result = await ExpressionResolver.resolve({ expression: "${ value }", context: { value: "resolved" }, timeout: 100 });
		expect(result).toBe("resolved");
		expect(Date.now() - start >= 90).toBe(true);
	});

	// The form is taken only where the configuration is the sole argument, so a trailing argument
	// turns it into a rejection. Open in BACKLOG.md: "A configuration object followed by another
	// argument is rejected instead of taken".
	it.fails("decides the call form by the first argument alone, even where another argument follows", async () => {
		const result = await ExpressionResolver.resolve({ expression: "${ value }", context: { value: "resolved" } }, undefined);
		expect(result).toBe("resolved");
	});

	// "a default value was passed" is the presence of the key defaultValue, independent of what it
	// holds. That the key is honoured is shown above; that defaultValue: undefined counts as passed
	// cannot be told from the outside - the answer is undefined either way. No test claims it.
});

describe("Specification 4.1 - the static entry points, a first argument of neither form", () => {

	// the rejection is told apart from an accidental TypeError by its message: resolve(123) raised a
	// TypeError before, thrown by a string method called on a number
	const rejectionOf = (aPromise) => aPromise.then(() => null, (anError) => anError);

	it("resolve rejects a first argument that is neither a string nor an object", async () => {
		const error = await rejectionOf(ExpressionResolver.resolve(123, {}, "fallback"));
		expect(error instanceof TypeError).toBe(true);
		expect(error.message.includes("configuration object")).toBe(true);
	});

	it("resolveText rejects a first argument that is neither a string nor an object", async () => {
		const error = await rejectionOf(ExpressionResolver.resolveText(123, {}, "fallback"));
		expect(error instanceof TypeError).toBe(true);
		expect(error.message.includes("configuration object")).toBe(true);
	});

	it("does not take null for a configuration object", async () => {
		const error = await rejectionOf(ExpressionResolver.resolve(null, {}));
		expect(error instanceof TypeError).toBe(true);
		expect(error.message.includes("configuration object")).toBe(true);
	});
});
