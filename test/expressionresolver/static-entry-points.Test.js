import { describe, it, expect, afterAll } from "vitest";
import { ExpressionResolver } from "../../index.js";
import TestExecuter from "../TestExecuter.js";

/**
 * ExpressionResolver - the static entry points, in both call forms, and the rejection of a first
 * argument that is neither and of a configuration without a string. SPECIFICATION.md 4.1.
 *
 * The static entry points take no executer, so a case sets `ExpressionResolver.defaultExecuter`
 * itself and the file puts the previous one back.
 */

// answers the value the context carries under the statement - a lookup, not an evaluation
const lookup = () => new TestExecuter((aStatement, aContext) => aContext[aStatement]);

// a rejection answered as a value, so a case can inspect it
const rejectionOf = (aPromise) => aPromise.then(() => null, (anError) => anError);

const previousDefault = ExpressionResolver.defaultExecuter;
afterAll(() => {
	ExpressionResolver.defaultExecuter = previousDefault;
});

describe("ExpressionResolver - the static entry points, positional form", () => {

	it("resolve takes expression and context positionally", async () => {
		ExpressionResolver.defaultExecuter = lookup();
		const result = await ExpressionResolver.resolve("${ value }", { value: "resolved" });
		expect(result).toBe("resolved");
	});

	it("resolveText takes text and context positionally", async () => {
		ExpressionResolver.defaultExecuter = lookup();
		const result = await ExpressionResolver.resolveText("a ${ value } b", { value: "resolved" });
		expect(result).toBe("a resolved b");
	});

	it("decides the call form by the first argument alone, so a context may carry a key named context", async () => {
		ExpressionResolver.defaultExecuter = new TestExecuter((aStatement, aContext) => aContext.context.value);
		const result = await ExpressionResolver.resolve("${ context.value }", { context: { value: "resolved" } });
		expect(result).toBe("resolved");
	});
});

describe("ExpressionResolver - the static entry points, configuration form", () => {

	it("resolve takes a configuration object", async () => {
		ExpressionResolver.defaultExecuter = lookup();
		const result = await ExpressionResolver.resolve({ expression: "${ value }", context: { value: "resolved" } });
		expect(result).toBe("resolved");
	});

	it("resolveText takes a configuration object carrying the text", async () => {
		ExpressionResolver.defaultExecuter = lookup();
		const result = await ExpressionResolver.resolveText({ text: "a ${ value } b", context: { value: "resolved" } });
		expect(result).toBe("a resolved b");
	});

	it("carries the default value under the key defaultValue", async () => {
		ExpressionResolver.defaultExecuter = lookup();
		const result = await ExpressionResolver.resolve({ expression: "${ missing }", context: {}, defaultValue: "fallback" });
		expect(result).toBe("fallback");
	});

	it("carries the timeout under the key timeout", async () => {
		ExpressionResolver.defaultExecuter = lookup();
		const start = Date.now();
		const result = await ExpressionResolver.resolve({ expression: "${ value }", context: { value: "resolved" }, timeout: 100 });
		expect(result).toBe("resolved");
		expect(Date.now() - start >= 90).toBe(true);
	});

	// The arguments behind the configuration would each change the answer if taken: the context
	// would answer "other", the default "fallback", and the timeout would outlast the case.
	it("resolve ignores every argument behind a configuration", async () => {
		ExpressionResolver.defaultExecuter = lookup();
		const result = await ExpressionResolver.resolve({ expression: "${ missing }", context: {} }, { missing: "other" }, "fallback", 60000);
		expect(result).toBe(undefined);
	});

	it("resolveText ignores every argument behind a configuration", async () => {
		ExpressionResolver.defaultExecuter = lookup();
		const result = await ExpressionResolver.resolveText({ text: "a ${ missing } b", context: {} }, { missing: "other" }, "fallback", 60000);
		expect(result).toBe("a undefined b");
	});

	// "a default value was passed" is the presence of the key defaultValue, independent of what it
	// holds. That the key is honoured is shown above; that defaultValue: undefined counts as passed
	// cannot be told from the outside - the answer is undefined either way. No test claims it.
});

describe("ExpressionResolver - the static entry points, a first argument of neither form", () => {

	// the rejection is told apart from an accidental TypeError by its message: resolve(123) raised a
	// TypeError before, thrown by a string method called on a number

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

describe("ExpressionResolver - the static entry points, a configuration without a string", () => {

	// the rejection is told apart from the one of a first argument by its message, which names the
	// key; that one says "configuration object"

	it("resolve rejects a configuration without an expression, whatever default it carries", async () => {
		ExpressionResolver.defaultExecuter = lookup();
		const error = await rejectionOf(ExpressionResolver.resolve({ context: {}, defaultValue: "fallback" }));
		expect(error instanceof TypeError).toBe(true);
		expect(error.message.includes("under the key expression")).toBe(true);
	});

	it("resolve rejects a configuration whose expression is not a string", async () => {
		ExpressionResolver.defaultExecuter = lookup();
		const error = await rejectionOf(ExpressionResolver.resolve({ expression: 42, context: {} }));
		expect(error instanceof TypeError).toBe(true);
		expect(error.message.includes("under the key expression")).toBe(true);
	});

	it("resolve does not take a configuration nested under the key expression", async () => {
		ExpressionResolver.defaultExecuter = lookup();
		const error = await rejectionOf(ExpressionResolver.resolve({ expression: { expression: "${ value }", context: { value: "resolved" } } }));
		expect(error instanceof TypeError).toBe(true);
		expect(error.message.includes("under the key expression")).toBe(true);
	});

	it("resolveText rejects a configuration without a text, whatever default it carries", async () => {
		ExpressionResolver.defaultExecuter = lookup();
		const error = await rejectionOf(ExpressionResolver.resolveText({ context: {}, defaultValue: "fallback" }));
		expect(error instanceof TypeError).toBe(true);
		expect(error.message.includes("under the key text")).toBe(true);
	});

	it("resolveText rejects a configuration whose text is not a string", async () => {
		ExpressionResolver.defaultExecuter = lookup();
		const error = await rejectionOf(ExpressionResolver.resolveText({ text: 42, context: {} }));
		expect(error instanceof TypeError).toBe(true);
		expect(error.message.includes("under the key text")).toBe(true);
	});

	it("resolveText does not take a configuration nested under the key text", async () => {
		ExpressionResolver.defaultExecuter = lookup();
		const error = await rejectionOf(ExpressionResolver.resolveText({ text: { text: "a ${ value } b", context: { value: "resolved" } } }));
		expect(error instanceof TypeError).toBe(true);
		expect(error.message.includes("under the key text")).toBe(true);
	});
});
