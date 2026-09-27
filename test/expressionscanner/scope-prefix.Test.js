import { describe, it, expect } from "vitest";
import { scan, parseExpression } from "../../src/ExpressionScanner.js";

/**
 * ExpressionScanner - the syntax of the scope prefix. SPECIFICATION.md 3.3.
 *
 * The scanner separates the name from the statement; which resolver of the chain the name
 * addresses is ExpressionResolver's. A text and the single expression of `resolve` read the prefix
 * by two implementations of the one rule - a text forwards from the start, `parseExpression` from
 * the first "::" backwards (DECISIONS.md, 2026-09-27) - so every case is asked of both.
 */

// the only occurrence of a text
const only = (aText) => scan(aText)[0];

describe("ExpressionScanner - the scope prefix in a text", () => {

	it("trims whitespace around the name", () => {
		expect(only("${  scope  ::value}").scope).toBe("scope");
	});

	it("accepts letters, digits, whitespace, - and _ in a name", () => {
		expect(only("${a-b_1 2::value}").scope).toBe("a-b_1 2");
	});

	// Whitespace is any whitespace, not only the space. Written before the prefix was read without a
	// regular expression, and passing on the version with it: it guards the rewrite, it pins no fix.
	it("accepts a tab and a line break inside a name", () => {
		expect(only("${a\tb\nc::value}").scope).toBe("a\tb\nc");
	});

	// "nothing else" of 3.3 - the same guard as above.
	it("takes no prefix where the name carries a character outside the set", () => {
		expect(only("${a.b::value}").scope).toBe(null);
	});

	it("separates the statement from the prefix", () => {
		expect(only("${scope::value}").statement).toBe("value");
	});

	// The statement stays whole, quotes and all, and no name is taken off it.
	it("does not mistake a quoted :: inside a statement for a prefix", () => {
		expect(only('${ "a::b" }').scope).toBe(null);
	});

	// Follows from the trim rule of 3.3: a name that is whitespace only is an empty name, and an
	// empty name is no name.
	it("treats a name that is whitespace only as no prefix at all", () => {
		expect(only("${  ::value}").scope).toBe(null);
	});
});

describe("ExpressionScanner - the scope prefix of the single expression", () => {

	it("trims whitespace around the name", () => {
		expect(parseExpression("${  scope  ::value}").scope).toBe("scope");
	});

	it("accepts letters, digits, whitespace, - and _ in a name", () => {
		expect(parseExpression("${a-b_1 2::value}").scope).toBe("a-b_1 2");
	});

	it("accepts a tab and a line break inside a name", () => {
		expect(parseExpression("${a\tb\nc::value}").scope).toBe("a\tb\nc");
	});

	it("takes no prefix where the name carries a character outside the set", () => {
		expect(parseExpression("${a.b::value}").scope).toBe(null);
	});

	it("separates the statement from the prefix", () => {
		expect(parseExpression("${scope::value}").statement).toBe("value");
	});

	it("does not mistake a quoted :: inside a statement for a prefix", () => {
		expect(parseExpression('${ "a::b" }').scope).toBe(null);
	});

	it("treats a name that is whitespace only as no prefix at all", () => {
		expect(parseExpression("${  ::value}").scope).toBe(null);
	});
});
