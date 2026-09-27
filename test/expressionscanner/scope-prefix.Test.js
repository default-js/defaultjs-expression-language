import { describe, it, expect } from "vitest";
import { scan } from "../../src/ExpressionScanner.js";

/**
 * ExpressionScanner - the syntax of the scope prefix. SPECIFICATION.md 3.3.
 *
 * The scanner separates the name from the statement; which resolver of the chain the name
 * addresses is ExpressionResolver's. The same split applies to `resolve`, through
 * `parseExpression` - `single-expression.Test.js`.
 */

// the only occurrence of a text
const only = (aText) => scan(aText)[0];

describe("ExpressionScanner - the scope prefix", () => {

	it("trims whitespace around the name", () => {
		expect(only("${  scope  ::value}").scope).toBe("scope");
	});

	it("accepts letters, digits, whitespace, - and _ in a name", () => {
		expect(only("${a-b_1 2::value}").scope).toBe("a-b_1 2");
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
