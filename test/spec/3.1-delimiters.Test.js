import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { defaultExecuterEntry } from "../ExecuterCapabilities.js";

/**
 * SPECIFICATION.md 3.1 - an expression ends at the matching closing brace.
 *
 * Parsing happens in ExpressionResolver, above the executer, so this runs once against whatever
 * ExpressionResolver.defaultExecuter is.
 * Where a statement reaches a context value, the name is spelled the way the default executer
 * spells it, taken from the catalogue - the dialect is the executer's own (8.3) and no rule here.
 */

const { variableName } = defaultExecuterEntry();

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

	// Carried over from test/ExecuterTests/, which pinned it per executer: a statement may span
	// lines, and the scanner has to carry the braces of a function body across them.
	it("ends the expression at the matching brace across several lines", async () => {
		const expression = `\${
			await (async (value) => {
				return value;
			})(${variableName("value")})
		}`;
		const result = await ExpressionResolver.resolve(expression, { value: "resolved" });
		expect(result).toBe("resolved");
	});

	it("does not count a closing brace inside a double quoted string", async () => {
		const result = await ExpressionResolver.resolveText("a ${ \"}\" } b", {});
		expect(result).toBe("a } b");
	});

	it("does not count an opening brace inside a single quoted string", async () => {
		const result = await ExpressionResolver.resolveText("a ${ '{' } b", {});
		expect(result).toBe("a { b");
	});

	// Nothing is executed here - there is no expression at all - so the statement is written as it
	// stands rather than through the dialect.
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
		const expression = `\${${variableName("value")}}`;
		const result = await ExpressionResolver.resolveText(`a \${ x b ${expression}`, { value: "resolved" });
		expect(result).toBe("a ${ x b resolved");
	});

	it("does not count a brace inside a regular expression literal", async () => {
		const result = await ExpressionResolver.resolveText("a ${ /}/.source } b", {});
		expect(result).toBe("a } b");
	});

	// A character class hides a slash, so the literal does not end inside it - and the brace in
	// there does not count either. Without that state the expression would end at the brace and the
	// statement would be cut in the middle of the literal.
	it("does not end a regular expression literal at a slash inside a character class", async () => {
		const result = await ExpressionResolver.resolveText("a ${ /[/}]/.source } b", {});
		expect(result).toBe("a [/}] b");
	});

	// The counterpart of the test above: a slash is only a literal where one can stand. Getting
	// this wrong would swallow the rest of the statement into a literal that never ends. Nothing
	// in the implementation before the scanner read literals at all, so this passed there as well
	// - it guards the division-or-regex heuristic, it does not pin a fix.
	it("reads a slash between two operands as division", async () => {
		const result = await ExpressionResolver.resolveText(`\${ ${variableName("a")} / ${variableName("b")} }`, { a: 6, b: 3 });
		expect(result).toBe("2");
	});
});
