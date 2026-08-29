import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { catchError } from "../TestUtils.js";

/**
 * Conformance tests for SPECIFICATION.md section 3 - expression syntax.
 *
 * Parsing happens in ExpressionResolver, above the executer, and section 8.3 names the only two
 * things an executer may decide for itself - neither of them is syntax. These tests therefore run
 * against whatever ExpressionResolver.defaultExecuter is, instead of once per executer.
 */

describe("Specification 3.1 - an expression ends at the matching closing brace", () => {

	it("resolveText evaluates an object literal inside the expression", async () => {
		const result = await ExpressionResolver.resolveText("${ {a: 1}.a }", {});
		expect(result).toBe("1");
	});

	it("resolveText ends the expression at the matching brace, not at the last one", async () => {
		const result = await ExpressionResolver.resolveText("a ${ {v: 2}.v } b", {});
		expect(result).toBe("a 2 b");
	});

	it("resolveText evaluates an arrow function body inside the expression", async () => {
		const result = await ExpressionResolver.resolveText("${ (() => { return 3; })() }", {});
		expect(result).toBe("3");
	});

	it("resolveText evaluates a nested template literal", async () => {
		const result = await ExpressionResolver.resolveText("${ `a${1 + 1}b` }", {});
		expect(result).toBe("a2b");
	});

	it("resolve evaluates an object literal inside the expression", async () => {
		const result = await ExpressionResolver.resolve("${ {a: 4}.a }", {});
		expect(result).toBe(4);
	});

	it("does not count a closing brace inside a double quoted string", async () => {
		const result = await ExpressionResolver.resolveText("a ${ \"}\" } b", {});
		expect(result).toBe("a } b");
	});

	it("does not count an opening brace inside a single quoted string", async () => {
		const result = await ExpressionResolver.resolveText("a ${ '{' } b", {});
		expect(result).toBe("a { b");
	});

	it("leaves the text standing where an opening delimiter has no matching brace", async () => {
		const result = await ExpressionResolver.resolveText("a ${ value b", { value: "resolved" });
		expect(result).toBe("a ${ value b");
	});

	// A "${" met while a statement is open is the start of a new expression, not part of the open
	// one - so the abandoned start stays text and the second expression resolves.
	//
	// This one cannot tell the implementations apart, verified 2026-08-29 against the source from
	// before the scanner: the old regular expression could not cross the inner brace either and
	// advanced to the second delimiter by itself, answering the same text. It states the rule and
	// guards the scanner against a regression; it does not prove the rule was broken before.
	it("starts a new expression where a delimiter opens inside an open statement", async () => {
		const result = await ExpressionResolver.resolveText("a ${ x b ${value}", { value: "resolved" });
		expect(result).toBe("a ${ x b resolved");
	});

	it("does not count a brace inside a regular expression literal", async () => {
		const result = await ExpressionResolver.resolveText("a ${ /}/.source } b", {});
		expect(result).toBe("a } b");
	});

	// The counterpart of the test above: a slash is only a literal where one can stand. Getting
	// this wrong would swallow the rest of the statement into a literal that never ends. Nothing
	// in the implementation before the scanner read literals at all, so this passed there as well
	// - it guards the division-or-regex heuristic, it does not pin a fix.
	it("reads a slash between two operands as division", async () => {
		const result = await ExpressionResolver.resolveText("${ a / b }", { a: 6, b: 3 });
		expect(result).toBe("2");
	});
});

describe("Specification 3.2 - a backslash before the $ escapes the expression", () => {

	it("resolveText leaves an escaped expression standing, without the backslash", async () => {
		const result = await ExpressionResolver.resolveText("\\${value}", { value: "resolved" });
		expect(result).toBe("${value}");
	});

	it("resolveText escapes only the occurrence that carries the backslash", async () => {
		const result = await ExpressionResolver.resolveText("\\${value} ${value}", { value: "resolved" });
		expect(result).toBe("${value} resolved");
	});

	it("escapes the occurrence carrying the backslash even when an unescaped one comes first", async () => {
		const result = await ExpressionResolver.resolveText("${value} \\${value}", { value: "resolved" });
		expect(result).toBe("resolved ${value}");
	});

	// What escapes is an odd number of backslashes before the "$", and exactly one of them is
	// consumed - there is no general unescaping of the text around an expression.
	it("evaluates the expression where an even number of backslashes stands before it", async () => {
		const result = await ExpressionResolver.resolveText("\\\\${value}", { value: "resolved" });
		expect(result).toBe("\\\\resolved");
	});

	// Also passes on the source from before the scanner, verified 2026-08-29: it captured a single
	// backslash and replaced the occurrence as text, which happens to leave the other two standing.
	// Here to state the rule, not to prove a fix.
	it("consumes exactly one backslash of an odd run and leaves the rest standing", async () => {
		const result = await ExpressionResolver.resolveText("\\\\\\${value}", { value: "resolved" });
		expect(result).toBe("\\\\${value}");
	});

	// What carries the escape is the delimiter, not a region: the escaped "${" opens nothing, so
	// the text behind it is scanned like any other and the delimiter inside what would have been
	// its statement is an expression of its own.
	it("escapes the delimiter alone, so an expression behind it still resolves", async () => {
		const result = await ExpressionResolver.resolveText("Test \\${\"${test}\"} Test", { test: "resolved" });
		expect(result).toBe("Test ${\"resolved\"} Test");
	});

	// 3.2 is a rule of the text form alone. It exists so that an expression can stand in
	// surrounding text without being evaluated, and `resolve` has no surrounding text - its input
	// is one expression. A backslash there is part of the statement, and that statement does not
	// compile, so the error reaches the caller (7).
	it("does not hold in resolve, where a backslash belongs to the statement", async () => {
		const error = await catchError(() => ExpressionResolver.resolve("\\${value}", { value: "resolved" }));
		expect(error instanceof SyntaxError).toBe(true);
	});
});

describe("Specification 3.3 - the scope prefix", () => {

	// The walk to an ancestor is 5.3 and belongs to stage 2 of the plan. Every test here stays on
	// the link the call is made on, so it pins the syntax of the prefix and nothing else.

	it("addresses the link carrying the name", async () => {
		const resolver = new ExpressionResolver({ name: "scope", context: { value: "from scope" } });
		const result = await resolver.resolveText("${scope::value}");
		expect(result).toBe("from scope");
	});

	it("trims whitespace around the name", async () => {
		const resolver = new ExpressionResolver({ name: "scope", context: { value: "from scope" } });
		const result = await resolver.resolveText("${  scope  ::value}");
		expect(result).toBe("from scope");
	});

	it("accepts letters, digits, whitespace, - and _ in a name", async () => {
		const resolver = new ExpressionResolver({ name: "a-b_1 2", context: { value: "from scope" } });
		const result = await resolver.resolveText("${a-b_1 2::value}");
		expect(result).toBe("from scope");
	});

	it("does not mistake a quoted :: inside a statement for a prefix", async () => {
		const result = await ExpressionResolver.resolveText("${ \"a::b\" }", {});
		expect(result).toBe("a::b");
	});

	// Follows from the trim rule of 3.3: a name that is whitespace only is an empty name, and an
	// empty name is no name, so the resolver the call was made on applies.
	it("treats a name that is whitespace only as no prefix at all", async () => {
		const resolver = new ExpressionResolver({ name: "scope", context: { value: "from scope" } });
		const result = await resolver.resolveText("${  ::value}");
		expect(result).toBe("from scope");
	});
});

describe("Specification 3.4 - a statement is arbitrary JavaScript", () => {

	it("evaluates an operator expression over the context", async () => {
		const result = await ExpressionResolver.resolve("${ a * b }", { a: 6, b: 7 });
		expect(result).toBe(42);
	});

	it("evaluates a call on a context member", async () => {
		const result = await ExpressionResolver.resolve("${ value.toUpperCase() }", { value: "text" });
		expect(result).toBe("TEXT");
	});

	// 3.4 by way of JavaScript: an empty statement is what `return;` answers.
	it("answers undefined for an empty statement", async () => {
		const result = await ExpressionResolver.resolve("${}", {});
		expect(result).toBeUndefined();
	});

	// Also green before the rule, where an empty statement answered null: the default applies to
	// null and to undefined alike (4.4), so this one states the rule rather than pinning the fix.
	it("lets the default value apply to an empty statement", async () => {
		const result = await ExpressionResolver.resolve("${}", {}, "fallback");
		expect(result).toBe("fallback");
	});

	it("renders an empty statement in a text as undefined", async () => {
		const result = await ExpressionResolver.resolveText("a ${} b", {});
		expect(result).toBe("a undefined b");
	});

	it("evaluates an await inside the statement", async () => {
		const result = await ExpressionResolver.resolve("${ await Promise.resolve(20) + 1 }", {});
		expect(result).toBe(21);
	});
});
