import { describe, it, expect, afterAll } from "vitest";
import { ExpressionResolver } from "../../index.js";
import TestExecuter from "../TestExecuter.js";

/**
 * ExpressionResolver - what the default value replaces and what it does not. SPECIFICATION.md 4.4.
 *
 * Every case here is about what the resolver does **with a result**, so the result is set by the
 * `TestExecuter` rather than computed: the rule is "a default replaces `null` and `undefined`, and
 * nothing else", and it holds whoever produced the value and however. Before 2026-09-01 each case
 * wrote a statement that happened to evaluate to what it needed, which tied a rule about the
 * resolver to an implementation being able to evaluate `${ null }`.
 *
 * The statement is `${ result }` throughout and means nothing - the executer never looks at it. The
 * static entry points take no executer, so a case sets `ExpressionResolver.defaultExecuter` itself
 * and the file puts the previous one back.
 */

const previousDefault = ExpressionResolver.defaultExecuter;
afterAll(() => {
	ExpressionResolver.defaultExecuter = previousDefault;
});

const RESULT = "${ result }";

describe("ExpressionResolver - the default value", () => {

	it("replaces a result of undefined", async () => {
		ExpressionResolver.defaultExecuter = new TestExecuter(() => undefined);
		expect(await ExpressionResolver.resolve(RESULT, {}, "fallback")).toBe("fallback");
	});

	it("replaces a result of null", async () => {
		ExpressionResolver.defaultExecuter = new TestExecuter(() => null);
		expect(await ExpressionResolver.resolve(RESULT, {}, "fallback")).toBe("fallback");
	});

	// One falsy value stands for all of them: the resolver asks for null and undefined, and a check
	// by truthiness would replace 0, "" and false alike.
	it("does not replace 0", async () => {
		ExpressionResolver.defaultExecuter = new TestExecuter(() => 0);
		expect(await ExpressionResolver.resolve(RESULT, {}, "fallback")).toBe(0);
	});

	it("honours undefined passed as the default", async () => {
		ExpressionResolver.defaultExecuter = new TestExecuter(() => null);
		expect(await ExpressionResolver.resolve(RESULT, {}, undefined)).toBeUndefined();
	});

	// "a default value was passed" is the presence of the argument, not what it holds - so passing
	// undefined replaces null with undefined, while passing nothing leaves the null standing.
	it("answers null without a default, where undefined as the default would answer undefined", async () => {
		ExpressionResolver.defaultExecuter = new TestExecuter(() => null);
		expect(await ExpressionResolver.resolve(RESULT, {})).toBe(null);
	});

	it("applies the default per expression in resolveText", async () => {
		ExpressionResolver.defaultExecuter = new TestExecuter((aStatement) => (aStatement === "a" ? null : "two"));
		expect(await ExpressionResolver.resolveText("${ a } ${ b }", {}, "fallback")).toBe("fallback two");
	});

	// A default takes the place of the value and is cast towards string with it (4.3), which is
	// `resolve-and-resolvetext.Test.js`.
	it("renders undefined and null literally in resolveText without a default", async () => {
		ExpressionResolver.defaultExecuter = new TestExecuter((aStatement) => (aStatement === "a" ? undefined : null));
		expect(await ExpressionResolver.resolveText("${ a } ${ b }", {})).toBe("undefined null");
	});
});
