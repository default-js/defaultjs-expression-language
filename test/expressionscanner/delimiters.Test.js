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
 * A comment hides what it holds like a literal does. The one limit of 3.1 - a regular expression
 * literal after `)` is read as division - is a fixed limit and pinned as such, by an ordinary case.
 */

// the parts of the text the occurrences cover, in order
const cut = (aText) => scan(aText).map((occurrence) => aText.substring(occurrence.start, occurrence.end)).join("|");

// the statements of the occurrences, in order
const statementsOf = (aText) => scan(aText).map((occurrence) => occurrence.statement).join("|");

describe("ExpressionScanner - an expression ends at the matching closing brace", () => {

	// The scanner does not tell an object literal from a block, so this one case stands for every
	// construct that nests braces.
	it("ends the expression at the matching brace, not at the last one", () => {
		expect(cut("a ${ {v: 2}.v } b }")).toBe("${ {v: 2}.v }");
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

describe("ExpressionScanner - a comment hides what it holds", () => {

	// The division-or-regex rule once read the slashes of a comment and decided per position whether a
	// brace counted (DECISIONS.md, 2026-09-27, "Does the expression scanner recognize comments?"), so
	// each kind is asked where a slash would be division. A line comment is asked where a literal could
	// stand as well: read as a literal, its two slashes close at once and the brace counts. A block
	// comment there has no such case - read as a literal it hides the brace too, so the case stayed
	// green whichever way the scanner read it.
	it("does not count a brace inside a block comment that follows an operand", () => {
		expect(cut("a ${ 1 /* } */ } b")).toBe("${ 1 /* } */ }");
	});

	it("does not count a brace behind a line comment that follows an operand", () => {
		expect(cut("a ${ 1 // }\n } b")).toBe("${ 1 // }\n }");
	});

	it("does not count a brace behind a line comment that opens the statement", () => {
		expect(cut("a ${ // }\n 1 } b")).toBe("${ // }\n 1 }");
	});

	const TERMINATORS = [["a carriage return", "\r"], ["a line separator", "\u2028"], ["a paragraph separator", "\u2029"]];
	for (const [name, terminator] of TERMINATORS) {
		it(`ends a line comment at ${name}`, () => {
			expect(cut(`a \${ 1 // }${terminator} } b`)).toBe(`\${ 1 // }${terminator} }`);
		});
	}

	// As in JavaScript, a line comment ends at the end of the line and not at a brace - one on the same
	// line is part of the comment, so the expression never closes. This held before the fix as well,
	// for another reason: the second slash opened a literal that never ended.
	it("finds no expression where a line comment holds the closing brace", () => {
		expect(scan("a ${ 1 // note } b")).toBe(null);
	});

	it("does not start a new expression at a delimiter inside a block comment", () => {
		expect(statementsOf("a ${ x /* ${y} */ } b")).toBe("x /* ${y} */");
	});

	it("does not start a new expression at a delimiter behind a line comment", () => {
		expect(statementsOf("a ${ x // ${y}\n } b")).toBe("x // ${y}");
	});

	// The division-or-regex rule decides on the character before the comment, not on the comment's
	// closing slash. Before the fix this passed by accident - the comment's own closing slash opened a
	// literal that the division slash closed - so it guards the look past the comment and proves
	// nothing about the version before it.
	it("reads a slash after a block comment by the character before the comment", () => {
		expect(statementsOf("a ${ a /* c */ / 2 } b")).toBe("a /* c */ / 2");
	});

	// The comment ends in an operator followed by whitespace, so a walk that stopped at the first
	// character that is not whitespace would land on the `+` inside the comment and read a literal.
	// Like the case above it passed before the fix by accident.
	it("reads a slash after a line comment by the character before the comment", () => {
		expect(statementsOf("a ${ a // c+ \n / 2 } b")).toBe("a // c+ \n / 2");
	});
});

describe("ExpressionScanner - the limit of the brace counting", () => {

	// Whether a slash opens a literal is decided by the character before it, and after `)` it is
	// division - so the brace inside the literal counts and ends the expression.
	it("reads a regular expression literal after a closing parenthesis as division", () => {
		expect(cut("a ${ (a) /}/.test(b) } b")).toBe("${ (a) /}");
	});
});
