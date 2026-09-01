import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { catchError } from "../TestUtils.js";
import { defaultExecuterEntry } from "../ExecuterCapabilities.js";

/**
 * SPECIFICATION.md 3.2 - a backslash before the $ escapes the expression.
 *
 * Runs once, above the executer.
 * Where a statement reaches a context value, the name is spelled the way the default executer
 * spells it, taken from the catalogue - the dialect is the executer's own (8.3) and no rule here. Every case here writes the name through the dialect
 * on purpose: what is asserted is that an expression which *would* resolve does not.
 */

const { variableName } = defaultExecuterEntry();

describe("Specification 3.2 - a backslash before the $ escapes the expression", () => {

	// Every case here writes the name through the dialect on purpose: what is asserted is that an
	// expression which *would* resolve does not, so it has to be one the executer could execute.
	const expression = `\${${variableName("value")}}`;

	it("resolveText leaves an escaped expression standing, without the backslash", async () => {
		const result = await ExpressionResolver.resolveText(`\\${expression}`, { value: "resolved" });
		expect(result).toBe(expression);
	});

	it("resolveText escapes only the occurrence that carries the backslash", async () => {
		const result = await ExpressionResolver.resolveText(`\\${expression} ${expression}`, { value: "resolved" });
		expect(result).toBe(`${expression} resolved`);
	});

	it("escapes the occurrence carrying the backslash even when an unescaped one comes first", async () => {
		const result = await ExpressionResolver.resolveText(`${expression} \\${expression}`, { value: "resolved" });
		expect(result).toBe(`resolved ${expression}`);
	});

	// What escapes is an odd number of backslashes before the "$", and exactly one of them is
	// consumed - there is no general unescaping of the text around an expression.
	it("evaluates the expression where an even number of backslashes stands before it", async () => {
		const result = await ExpressionResolver.resolveText(`\\\\${expression}`, { value: "resolved" });
		expect(result).toBe("\\\\resolved");
	});

	// Also passes on the source from before the scanner, verified 2026-08-29: it captured a single
	// backslash and replaced the occurrence as text, which happens to leave the other two standing.
	// Here to state the rule, not to prove a fix.
	it("consumes exactly one backslash of an odd run and leaves the rest standing", async () => {
		const result = await ExpressionResolver.resolveText(`\\\\\\${expression}`, { value: "resolved" });
		expect(result).toBe(`\\\\${expression}`);
	});

	// What carries the escape is the delimiter, not a region: the escaped "${" opens nothing, so
	// the text behind it is scanned like any other and the delimiter inside what would have been
	// its statement is an expression of its own.
	it("escapes the delimiter alone, so an expression behind it still resolves", async () => {
		const inner = `\${${variableName("test")}}`;
		const result = await ExpressionResolver.resolveText(`Test \\\${"${inner}"} Test`, { test: "resolved" });
		expect(result).toBe("Test ${\"resolved\"} Test");
	});

	// 3.2 is a rule of the text form alone. It exists so that an expression can stand in
	// surrounding text without being evaluated, and `resolve` has no surrounding text - its input
	// is one expression. A backslash there is part of the statement, and that statement does not
	// compile, so the error reaches the caller (7).
	it("does not hold in resolve, where a backslash belongs to the statement", async () => {
		const error = await catchError(() => ExpressionResolver.resolve(`\\${expression}`, { value: "resolved" }));
		expect(error instanceof SyntaxError).toBe(true);
	});
});
