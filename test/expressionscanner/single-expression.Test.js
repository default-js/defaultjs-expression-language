import { describe, it, expect } from "vitest";
import { parseExpression } from "../../src/ExpressionScanner.js";

/**
 * ExpressionScanner - the single expression `resolve` takes. SPECIFICATION.md 4.3, with 3.1, 3.2
 * and 3.3 as they apply to it.
 *
 * `parseExpression` decides which of the two forms is in hand by the two ends of the trimmed input:
 * the delimited form, which opens with "${", ends with "}" and may carry a scope prefix, or a bare
 * statement taken as it stands. What `resolve` then does with scope and statement is
 * ExpressionResolver's.
 */

describe("ExpressionScanner - the single expression of resolve", () => {

	it("delimits an expression that carries braces of its own", () => {
		expect(parseExpression("${ {a: 4}.a }").statement).toBe("{a: 4}.a");
	});

	// Carried over from test/ExecuterTests/, which pinned it per executer: a statement may span
	// lines.
	it("takes a statement across several lines", () => {
		const statement = `await (async (value) => {
				return value;
			})(url)`;
		expect(parseExpression(`\${\n\t\t\t${statement}\n\t\t}`).statement).toBe(statement);
	});

	// 3.2 is a rule of the text form alone. `resolve` has no surrounding text, so the backslash is
	// part of the statement - that such a statement does not compile is the executer's answer.
	it("does not escape - a leading backslash belongs to the statement", () => {
		expect(parseExpression("\\${value}").statement).toBe("\\${value}");
	});

	it("takes a bare statement without the delimiters as it stands", () => {
		expect(parseExpression("a + b").statement).toBe("a + b");
	});

	// That the delimited form carries a prefix is scope-prefix.Test.js, which asks every rule of 3.3
	// of parseExpression.
	it("does not recognize a scope prefix without the delimiters", () => {
		expect(parseExpression("scope::value").statement).toBe("scope::value");
	});

	// The delimited form needs both delimiters. An input that opens with "${" and does not end with
	// "}" is a bare statement like any other and is handed on as it stands - that it does not
	// compile is the executer's answer.
	it("takes an input that opens with the delimiter and does not end with a closing brace as a bare statement", () => {
		expect(parseExpression("${ value")).toEqual({ scope: null, statement: "${ value" });
	});

	it("does not recognize a scope prefix where the closing brace is missing", () => {
		expect(parseExpression("${scope::value")).toEqual({ scope: null, statement: "${scope::value" });
	});
});
