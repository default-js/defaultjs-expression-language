import { describe, it, expect, afterAll } from "vitest";
import { ExpressionResolver } from "../../index.js";
import TestExecuter from "../TestExecuter.js";

/**
 * ExpressionResolver - resolve answers a value, resolveText answers a text. SPECIFICATION.md 4.3,
 * and what resolveText makes of the occurrences the scanner found: 3.1, 3.2.
 *
 * Where an expression begins and ends and which one is escaped is the scanner's, and tested in
 * `test/expressionscanner/`. The static entry points take no executer, so a case sets
 * `ExpressionResolver.defaultExecuter` itself and the file puts the previous one back.
 */

// answers the value the context carries under the statement - a lookup, not an evaluation
const lookup = () => new TestExecuter((aStatement, aContext) => aContext[aStatement]);

const previousDefault = ExpressionResolver.defaultExecuter;
afterAll(() => {
	ExpressionResolver.defaultExecuter = previousDefault;
});

describe("ExpressionResolver - resolve answers a value, resolveText answers a text", () => {

	// What the resolver has to keep is the type of the answer, whoever produced it - so the answer
	// is set rather than computed. The resolver never looks at the type of a result, so one type
	// stands for every other.
	it("resolve keeps the type of the result", async () => {
		ExpressionResolver.defaultExecuter = new TestExecuter(() => 2);
		expect(await ExpressionResolver.resolve("${ result }", {})).toBe(2);
	});

	it("resolveText casts the value towards string", async () => {
		ExpressionResolver.defaultExecuter = new TestExecuter(() => 2);
		expect(await ExpressionResolver.resolveText("${ result }", {})).toBe("2");
	});

	it("resolveText replaces every expression of the text", async () => {
		ExpressionResolver.defaultExecuter = lookup();
		const result = await ExpressionResolver.resolveText("${ a } and ${ b }", { a: "one", b: "two" });
		expect(result).toBe("one and two");
	});

	// Every occurrence is evaluated on its own (4.3): the same expression standing twice is handed
	// over twice, not resolved once and substituted - which is what makes `${counter++}` twice
	// increment twice, without the case needing a side effect to see it.
	it("hands over every occurrence, not every distinct expression", async () => {
		const handed = [];
		ExpressionResolver.defaultExecuter = new TestExecuter((aStatement) => handed.push(aStatement));
		await ExpressionResolver.resolveText("${value} ${value}", { value: "resolved" });
		expect(handed.join("|")).toBe("value|value");
	});
});

describe("ExpressionResolver - what resolveText leaves standing", () => {

	// There is no expression here at all, so the text stands. That the scanner found none is
	// `test/expressionscanner/delimiters.Test.js`.
	it("leaves the text standing where an opening delimiter has no matching brace", async () => {
		ExpressionResolver.defaultExecuter = new TestExecuter();
		const result = await ExpressionResolver.resolveText("a ${ value b", { value: "resolved" });
		expect(result).toBe("a ${ value b");
	});

	// An expression the executer could resolve, so that "it did not" means the escape did it.
	const expression = "${value}";

	it("leaves an escaped expression standing, without the backslash", async () => {
		ExpressionResolver.defaultExecuter = new TestExecuter();
		const result = await ExpressionResolver.resolveText(`\\${expression}`, { value: "resolved" });
		expect(result).toBe(expression);
	});

	it("escapes only the occurrence that carries the backslash", async () => {
		ExpressionResolver.defaultExecuter = new TestExecuter();
		const result = await ExpressionResolver.resolveText(`\\${expression} ${expression}`, { value: "resolved" });
		expect(result).toBe(`${expression} value`);
	});

	// What escapes is an odd number of backslashes before the "$", and exactly one of them is
	// consumed - there is no general unescaping of the text around an expression.
	//
	// Also passes on the source from before the scanner, verified 2026-08-29: it captured a single
	// backslash and replaced the occurrence as text, which happens to leave the other two standing.
	// Here to state the rule, not to prove a fix.
	it("consumes exactly one backslash of an odd run and leaves the rest standing", async () => {
		ExpressionResolver.defaultExecuter = new TestExecuter();
		const result = await ExpressionResolver.resolveText(`\\\\\\${expression}`, { value: "resolved" });
		expect(result).toBe(`\\\\${expression}`);
	});
});
