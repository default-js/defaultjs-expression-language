import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { useTestExecuter, statements } from "../TestExecuter.js";

/**
 * SPECIFICATION.md 3.2 - a backslash before the $ escapes the expression.
 *
 * Escaping happens in ExpressionResolver, above the executer, and what the rule says is not that an
 * escaped expression answers itself - it is that the expression is **never handed to an executer**.
 * That is asserted here directly, through the record of `TestExecuter`, and the answers are asserted
 * beside it. Before 2026-09-01 both were inferred from what a registered implementation replied,
 * which is a detour through something this section has nothing to do with.
 *
 * The name is written bare because that is the dialect of the TestExecuter. No case here depends on
 * anything 8.3 leaves to an implementation.
 */

useTestExecuter();

describe("Specification 3.2 - a backslash before the $ escapes the expression", () => {

	// An expression the executer could resolve, so that "it did not" means the escape did it.
	const expression = "${value}";

	it("resolveText leaves an escaped expression standing, without the backslash", async () => {
		const result = await ExpressionResolver.resolveText(`\\${expression}`, { value: "resolved" });
		expect(result).toBe(expression);
	});

	// The rule itself: not "it answers itself" but "it never reaches an executer".
	it("hands an escaped expression to no executer at all", async () => {
		await ExpressionResolver.resolveText(`\\${expression}`, { value: "resolved" });
		expect(statements().length).toBe(0);
	});

	it("resolveText escapes only the occurrence that carries the backslash", async () => {
		const result = await ExpressionResolver.resolveText(`\\${expression} ${expression}`, { value: "resolved" });
		expect(result).toBe(`${expression} value`);
	});

	// The same text seen from the executer's side: one of the two occurrences is handed over, and it
	// is handed over once.
	it("hands over the unescaped occurrence beside an escaped one, and only that", async () => {
		await ExpressionResolver.resolveText(`\\${expression} ${expression}`, { value: "resolved" });
		expect(statements().join("|")).toBe("value");
	});

	it("escapes the occurrence carrying the backslash even when an unescaped one comes first", async () => {
		const result = await ExpressionResolver.resolveText(`${expression} \\${expression}`, { value: "resolved" });
		expect(result).toBe(`value ${expression}`);
	});

	// What escapes is an odd number of backslashes before the "$", and exactly one of them is
	// consumed - there is no general unescaping of the text around an expression.
	it("evaluates the expression where an even number of backslashes stands before it", async () => {
		const result = await ExpressionResolver.resolveText(`\\\\${expression}`, { value: "resolved" });
		expect(result).toBe("\\\\value");
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
		const result = await ExpressionResolver.resolveText('Test \\${"${test}"} Test', { test: "resolved" });
		expect(result).toBe('Test ${"test"} Test');
	});

	// 3.2 is a rule of the text form alone. It exists so that an expression can stand in
	// surrounding text without being evaluated, and `resolve` has no surrounding text - its input is
	// one expression. The backslash is therefore part of the statement and is handed over with it.
	// That such a statement does not compile is the executer's answer; what the resolver does with
	// the error is section 7.
	it("does not hold in resolve, where a backslash belongs to the statement", async () => {
		await ExpressionResolver.resolve(`\\${expression}`, { value: "resolved" });
		expect(statements().join("|")).toBe(`\\${expression}`);
	});
});
