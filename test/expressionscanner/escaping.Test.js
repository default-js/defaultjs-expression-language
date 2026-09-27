import { describe, it, expect } from "vitest";
import { scan } from "../../src/ExpressionScanner.js";

/**
 * ExpressionScanner - which occurrences of a text are escaped. SPECIFICATION.md 3.2.
 *
 * What the scanner decides is whether an occurrence is escaped, and how much of the text it covers.
 * That the escaping backslash is consumed and an escaped occurrence reaches no executer is what
 * ExpressionResolver does with an occurrence marked `escaped`. 3.2 is a rule of the text form alone;
 * that it does not hold in `resolve` is `single-expression.Test.js`.
 */

// whether each occurrence is escaped, in order
const escapedOf = (aText) => scan(aText).map((occurrence) => occurrence.escaped).join("|");

// the parts of the text the occurrences cover, in order
const cut = (aText) => scan(aText).map((occurrence) => aText.substring(occurrence.start, occurrence.end)).join("|");

describe("ExpressionScanner - a backslash before the $ escapes the expression", () => {

	const expression = "${value}";

	// The rule itself: an escaped occurrence is marked, so that nothing hands it to an executer.
	it("marks an expression behind one backslash as escaped", () => {
		expect(escapedOf(`\\${expression}`)).toBe("true");
	});

	it("escapes only the occurrence that carries the backslash", () => {
		expect(escapedOf(`\\${expression} ${expression}`)).toBe("true|false");
	});

	it("escapes the occurrence carrying the backslash even when an unescaped one comes first", () => {
		expect(escapedOf(`${expression} \\${expression}`)).toBe("false|true");
	});

	// What escapes is an odd number of backslashes before the "$".
	it("does not escape an expression behind an even number of backslashes", () => {
		expect(escapedOf(`\\\\${expression}`)).toBe("false");
	});

	// What carries the escape is the delimiter, not a region: the escaped "${" opens nothing and
	// covers only itself, so the text behind it is scanned like any other and the delimiter inside
	// what would have been its statement is an expression of its own.
	it("escapes the delimiter alone, so an expression behind it is found", () => {
		expect(cut('Test \\${"${test}"} Test')).toBe("${|${test}");
	});
});
