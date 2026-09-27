import { describe, it, expect } from "vitest";
import { scan } from "../../src/ExpressionScanner.js";

/**
 * ExpressionScanner - where an expression of a text begins and ends. SPECIFICATION.md 3.1.
 *
 * Every case hands `scan` a text and reads what it cut out: the part of the text an occurrence
 * covers, or the statement it found in there. Nothing is resolved and nothing is evaluated - that
 * the text stands where the scanner found no expression, and what a statement answers, is the work
 * of ExpressionResolver and of an executer.
 *
 * The two limits of 3.1 - a brace inside a comment counts, a regular expression literal after `)` is
 * read as division - are not pinned yet (B-38).
 */

// the parts of the text the occurrences cover, in order
const cut = (aText) => scan(aText).map((occurrence) => aText.substring(occurrence.start, occurrence.end)).join("|");

// the statements of the occurrences, in order
const statementsOf = (aText) => scan(aText).map((occurrence) => occurrence.statement).join("|");

describe("ExpressionScanner - an expression ends at the matching closing brace", () => {

	it("takes an object literal inside the expression as part of the statement", () => {
		expect(statementsOf("${ {a: 1}.a }")).toBe("{a: 1}.a");
	});

	it("ends the expression at the matching brace, not at the last one", () => {
		expect(cut("a ${ {v: 2}.v } b")).toBe("${ {v: 2}.v }");
	});

	it("carries the braces of an arrow function body across", () => {
		expect(statementsOf("${ (() => { return 3; })() }")).toBe("(() => { return 3; })()");
	});

	it("does not end at the brace of a nested template literal", () => {
		expect(statementsOf("${ `a${1 + 1}b` }")).toBe("`a${1 + 1}b`");
	});

	it("does not count a closing brace inside a double quoted string", () => {
		expect(statementsOf('a ${ "}" } b')).toBe('"}"');
	});

	it("does not count an opening brace inside a single quoted string", () => {
		expect(statementsOf("a ${ '{' } b")).toBe("'{'");
	});

	// There is no expression here at all: the scanner answers none, rather than an occurrence that
	// runs to the end of the text.
	it("finds no expression where the delimiter has no matching brace", () => {
		expect(scan("a ${ value b")).toBe(null);
	});

	// A "${" met while a statement is open is the start of a new expression, not part of the open
	// one - so the abandoned start is not covered by any occurrence.
	//
	// Carried over from the resolver suite, where it could not tell the implementations apart,
	// verified 2026-08-29 against the source from before the scanner: the old regular expression
	// could not cross the inner brace either and advanced to the second delimiter by itself. It
	// states the rule and guards the scanner against a regression; it does not prove the rule was
	// broken before.
	it("starts a new expression where a delimiter opens inside an open statement", () => {
		expect(cut("a ${ x b ${value}")).toBe("${value}");
	});

	it("finds only the expression that opened second", () => {
		expect(statementsOf("a ${ x b ${value}")).toBe("value");
	});

	it("does not count a brace inside a regular expression literal", () => {
		expect(statementsOf("a ${ /}/.source } b")).toBe("/}/.source");
	});

	// A character class hides a slash, so the literal does not end inside it - and the brace in
	// there does not count either. Without that state the expression would end at the brace and the
	// statement would be cut in the middle of the literal.
	it("does not end a regular expression literal at a slash inside a character class", () => {
		expect(statementsOf("a ${ /[/}]/.source } b")).toBe("/[/}]/.source");
	});

	// The counterpart of the test above: a slash is only a literal where one can stand. Getting
	// this wrong would swallow the rest of the statement into a literal that never ends. Nothing
	// in the implementation before the scanner read literals at all, so this passed there as well
	// - it guards the division-or-regex heuristic, it does not pin a fix.
	it("reads a slash between two operands as division", () => {
		expect(statementsOf("${ a / b }")).toBe("a / b");
	});
});
