import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { catchError } from "../TestUtils.js";
import { useTestExecuter, answersFromContext, answerWith, statements } from "../TestExecuter.js";

/**
 * SPECIFICATION.md 4.3 - resolve answers a value, resolveText answers a text.
 * Where a statement reaches a context value, the name is spelled the way the default executer
 * spells it, taken from the catalogue - the dialect is the executer's own (8.3) and no rule here.
 */

useTestExecuter();
// the answer is the value the context carries under the statement - a lookup, so what a case
// reads is which context the resolver handed over, not what anybody computed
answersFromContext();

describe("Specification 4.3 - resolve answers a value, resolveText answers a text", () => {

	// What the resolver has to keep is the type of the answer, whoever produced it - so the answer
	// is set rather than computed.
	it("resolve keeps the type of the result", async () => {
		answerWith(() => 2);
		expect(await ExpressionResolver.resolve("${ result }", {})).toBe(2);
	});

	it("resolve answers an object as an object", async () => {
		const result = await ExpressionResolver.resolve("${ values }", { values: [1, 2] });
		expect(result instanceof Array).toBe(true);
	});

	// Carried over from test/ExecuterTests/: a function is a value like any other, and what the
	// caller gets back is the function itself rather than a copy, a binding or its result.
	it("resolve answers a function as a function", async () => {
		const result = await ExpressionResolver.resolve("${ fn }", { fn: () => "from function" });
		expect(typeof result).toBe("function");
		expect(result()).toBe("from function");
	});

	it("resolveText casts the value towards string", async () => {
		answerWith(() => 2);
		expect(await ExpressionResolver.resolveText("${ result }", {})).toBe("2");
	});

	it("resolveText replaces every expression of the text", async () => {
		const result = await ExpressionResolver.resolveText("${ a } and ${ b }", { a: "one", b: "two" });
		expect(result).toBe("one and two");
	});

	// Counted through a getter rather than through "${counter++} ${counter++}": whether a write
	// from an expression persists is the executer's own (8.3), so a counting write would pin this
	// rule to the executers that keep one. Reading does not. Verified 2026-09-01 against all four:
	// each answers "0 1" and reads the getter exactly twice.
	// The rule from the executer side: the same expression standing twice is handed over twice, not
	// resolved once and substituted. The counting getter below shows what a caller notices; this
	// one states the rule without needing a side effect to see it.
	it("hands over every occurrence, not every distinct expression", async () => {
		await ExpressionResolver.resolveText("${value} ${value}", { value: "resolved" });
		expect(statements().join("|")).toBe("value|value");
	});

	it("resolveText evaluates every occurrence on its own", async () => {
		let reads = 0;
		const context = { get counter() { return reads++; } };
		const expression = "${counter}";
		const result = await ExpressionResolver.resolveText(`${expression} ${expression}`, context);
		expect(result).toBe("0 1");
	});

	// The whole input is the statement where the delimiters are missing - which the answer shows,
	// since the executer answers the statement it was handed.
	it("resolve accepts a bare statement without the delimiters", async () => {
		answerWith((aStatement) => aStatement);
		expect(await ExpressionResolver.resolve(`a + b`, { a: 1, b: 2 })).toBe("a + b");
	});

	it("resolve recognizes the scope prefix in the delimited form", async () => {
		const resolver = new ExpressionResolver({ name: "scope", context: { value: "from scope" } });
		const result = await resolver.resolve("${scope::value}");
		expect(result).toBe("from scope");
	});

	it("resolve reaches an ancestor through the scope prefix", async () => {
		const root = new ExpressionResolver({ name: "root", context: { value: "from root" } });
		const leaf = new ExpressionResolver({ name: "leaf", context: { value: "from leaf" }, parent: root });
		const result = await leaf.resolve("${root::value}");
		expect(result).toBe("from root");
	});

	// Cannot tell the implementations apart, verified 2026-08-29: before the prefix was parsed at
	// all, "nowhere::value" reached the executer as a statement, failed to compile and the default
	// applied through the error path instead of through 5.4. Same answer, different reason.
	it("resolve answers the default value where no link carries the prefix", async () => {
		const resolver = new ExpressionResolver({ name: "scope", context: { value: "from scope" } });
		const result = await resolver.resolve("${nowhere::value}", "fallback");
		expect(result).toBe("fallback");
	});

	// A form the method rejects itself is not an execution error: it is thrown rather than answered
	// with the default value. The narrow matcher surface of this suite is kept by catching by hand.
	it("resolve throws where a delimited expression does not end with a closing brace", async () => {
		const resolver = new ExpressionResolver({ context: { value: "resolved" } });
		let error = null;
		try {
			await resolver.resolve("${ value", "fallback");
		} catch (e) {
			error = e;
		}
		expect(error instanceof SyntaxError).toBe(true);
	});

	// "scope::value" is handed to the executer as a statement, which is what the rule says. That it
	// is not valid JavaScript is the executer's problem and section 7; here it only has to arrive
	// whole, prefix and all.
	it("resolve does not recognize a scope prefix without the delimiters", async () => {
		answerWith((aStatement) => aStatement);
		const resolver = new ExpressionResolver({ name: "scope", context: { value: "from scope" } });
		expect(await resolver.resolve(`scope::value`)).toBe("scope::value");
	});
});
