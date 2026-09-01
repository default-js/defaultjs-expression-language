import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { useTestExecuter, statements } from "../TestExecuter.js";

/**
 * SPECIFICATION.md 3.1 - an expression ends at the matching closing brace.
 *
 * This is a rule about **where an expression begins and ends**, and nothing else. It runs against
 * `TestExecuter`, which answers the statement it was handed, so what a case reads out of the result
 * is exactly the text the resolver cut out - no evaluation is involved, and none is asserted.
 *
 * That those statements also *evaluate* to something is 3.4 and a rule of the implementations; it is
 * asked of all four in `test/executer/rules/3.4-…`. Before 2026-09-01 both were pinned in one case
 * here, which meant a broken scanner and a broken executer looked the same.
 */

useTestExecuter();

describe("Specification 3.1 - an expression ends at the matching closing brace", () => {

	it("takes an object literal inside the expression as part of the statement", async () => {
		const result = await ExpressionResolver.resolveText("${ {a: 1}.a }", {});
		expect(result).toBe("{a: 1}.a");
	});

	it("ends the expression at the matching brace, not at the last one", async () => {
		const result = await ExpressionResolver.resolveText("a ${ {v: 2}.v } b", {});
		expect(result).toBe("a {v: 2}.v b");
	});

	it("carries the braces of an arrow function body across", async () => {
		const result = await ExpressionResolver.resolveText("${ (() => { return 3; })() }", {});
		expect(result).toBe("(() => { return 3; })()");
	});

	it("does not end at the brace of a nested template literal", async () => {
		const result = await ExpressionResolver.resolveText("${ `a${1 + 1}b` }", {});
		expect(result).toBe("`a${1 + 1}b`");
	});

	it("delimits the same way in resolve", async () => {
		const result = await ExpressionResolver.resolve("${ {a: 4}.a }", {});
		expect(result).toBe("{a: 4}.a");
	});

	// Carried over from test/ExecuterTests/, which pinned it per executer: a statement may span
	// lines, and the scanner has to carry the braces of a function body across them.
	it("ends the expression at the matching brace across several lines", async () => {
		const statement = `await (async (value) => {
				return value;
			})(url)`;
		const result = await ExpressionResolver.resolve(`\${\n\t\t\t${statement}\n\t\t}`, { url: 1 });
		expect(result.trim()).toBe(statement);
	});

	it("does not count a closing brace inside a double quoted string", async () => {
		const result = await ExpressionResolver.resolveText('a ${ "}" } b', {});
		expect(result).toBe('a "}" b');
	});

	it("does not count an opening brace inside a single quoted string", async () => {
		const result = await ExpressionResolver.resolveText("a ${ '{' } b", {});
		expect(result).toBe("a '{' b");
	});

	// There is no expression here at all, so the text stands and nothing is handed over. The second
	// half is what the rule actually says; the first alone could also mean "handed over and answered
	// itself".
	it("leaves the text standing where an opening delimiter has no matching brace", async () => {
		const result = await ExpressionResolver.resolveText("a ${ value b", { value: "resolved" });
		expect(result).toBe("a ${ value b");
	});

	it("hands nothing to an executer where the delimiter has no matching brace", async () => {
		await ExpressionResolver.resolveText("a ${ value b", { value: "resolved" });
		expect(statements().length).toBe(0);
	});

	// A "${" met while a statement is open is the start of a new expression, not part of the open
	// one - so the abandoned start stays text and the second expression is the one that resolves.
	//
	// This one cannot tell the implementations apart, verified 2026-08-29 against the source from
	// before the scanner: the old regular expression could not cross the inner brace either and
	// advanced to the second delimiter by itself, answering the same text. It states the rule and
	// guards the scanner against a regression; it does not prove the rule was broken before.
	it("starts a new expression where a delimiter opens inside an open statement", async () => {
		const result = await ExpressionResolver.resolveText("a ${ x b ${value}", { value: "resolved" });
		expect(result).toBe("a ${ x b value");
	});

	it("hands over only the expression that opened second", async () => {
		await ExpressionResolver.resolveText("a ${ x b ${value}", { value: "resolved" });
		expect(statements().join("|")).toBe("value");
	});

	it("does not count a brace inside a regular expression literal", async () => {
		const result = await ExpressionResolver.resolveText("a ${ /}/.source } b", {});
		expect(result).toBe("a /}/.source b");
	});

	// A character class hides a slash, so the literal does not end inside it - and the brace in
	// there does not count either. Without that state the expression would end at the brace and the
	// statement would be cut in the middle of the literal.
	it("does not end a regular expression literal at a slash inside a character class", async () => {
		const result = await ExpressionResolver.resolveText("a ${ /[/}]/.source } b", {});
		expect(result).toBe("a /[/}]/.source b");
	});

	// The counterpart of the test above: a slash is only a literal where one can stand. Getting
	// this wrong would swallow the rest of the statement into a literal that never ends. Nothing
	// in the implementation before the scanner read literals at all, so this passed there as well
	// - it guards the division-or-regex heuristic, it does not pin a fix.
	it("reads a slash between two operands as division", async () => {
		const result = await ExpressionResolver.resolveText("${ a / b }", { a: 6, b: 3 });
		expect(result).toBe("a / b");
	});
});
