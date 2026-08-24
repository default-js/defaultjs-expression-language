import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";

/**
 * Conformance tests for SPECIFICATION.md section 3 - expression syntax.
 *
 * Parsing happens in ExpressionResolver, above the executer, and section 8.3 names the only two
 * things an executer may decide for itself - neither of them is syntax. These tests therefore run
 * against whatever ExpressionResolver.defaultExecuter is, instead of once per executer.
 */

describe("Specification 3.1 - an expression ends at the matching closing brace", () => {

	// not implemented, waits for BACKLOG.md "An expression that contains braces is not recognized"
	it.fails("resolveText evaluates an object literal inside the expression", async () => {
		const result = await ExpressionResolver.resolveText("${ {a: 1}.a }", {});
		expect(result).toBe("1");
	});

	// not implemented, waits for BACKLOG.md "An expression that contains braces is not recognized"
	it.fails("resolveText ends the expression at the matching brace, not at the last one", async () => {
		const result = await ExpressionResolver.resolveText("a ${ {v: 2}.v } b", {});
		expect(result).toBe("a 2 b");
	});

	// not implemented, waits for BACKLOG.md "An expression that contains braces is not recognized"
	it.fails("resolveText evaluates an arrow function body inside the expression", async () => {
		const result = await ExpressionResolver.resolveText("${ (() => { return 3; })() }", {});
		expect(result).toBe("3");
	});

	// not implemented, waits for BACKLOG.md "An expression that contains braces is not recognized"
	it.fails("resolveText evaluates a nested template literal", async () => {
		const result = await ExpressionResolver.resolveText("${ `a${1 + 1}b` }", {});
		expect(result).toBe("a2b");
	});

	it("resolve evaluates an object literal inside the expression", async () => {
		const result = await ExpressionResolver.resolve("${ {a: 4}.a }", {});
		expect(result).toBe(4);
	});

	// not implemented, waits for BACKLOG.md "An expression that contains braces is not recognized"
	it.fails("does not count a closing brace inside a double quoted string", async () => {
		const result = await ExpressionResolver.resolveText("a ${ \"}\" } b", {});
		expect(result).toBe("a } b");
	});

	// not implemented, waits for BACKLOG.md "An expression that contains braces is not recognized"
	it.fails("does not count an opening brace inside a single quoted string", async () => {
		const result = await ExpressionResolver.resolveText("a ${ '{' } b", {});
		expect(result).toBe("a { b");
	});

	it("leaves the text standing where an opening delimiter has no matching brace", async () => {
		const result = await ExpressionResolver.resolveText("a ${ value b", { value: "resolved" });
		expect(result).toBe("a ${ value b");
	});
});

describe("Specification 3.2 - a backslash before the $ escapes the expression", () => {

	it("resolveText leaves an escaped expression standing, without the backslash", async () => {
		const result = await ExpressionResolver.resolveText("\\${value}", { value: "resolved" });
		expect(result).toBe("${value}");
	});

	// not implemented, waits for BACKLOG.md "An escaped expression is resolved anyway"
	it.fails("resolveText escapes only the occurrence that carries the backslash", async () => {
		const result = await ExpressionResolver.resolveText("\\${value} ${value}", { value: "resolved" });
		expect(result).toBe("${value} resolved");
	});

	// not implemented, waits for BACKLOG.md "An escaped expression is resolved anyway"
	it.fails("escapes the occurrence carrying the backslash even when an unescaped one comes first", async () => {
		const result = await ExpressionResolver.resolveText("${value} \\${value}", { value: "resolved" });
		expect(result).toBe("resolved ${value}");
	});

	it("resolve leaves an escaped expression standing, without the backslash", async () => {
		const result = await ExpressionResolver.resolve("\\${value}", { value: "resolved" });
		expect(result).toBe("${value}");
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

	it("evaluates an await inside the statement", async () => {
		const result = await ExpressionResolver.resolve("${ await Promise.resolve(20) + 1 }", {});
		expect(result).toBe(21);
	});
});
