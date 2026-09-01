import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { useTestExecuter, answerWith } from "../TestExecuter.js";

/**
 * SPECIFICATION.md 4.4 - what the default value replaces and what it does not.
 *
 * Every case here is about what the resolver does **with a result**, so the result is set through
 * `answerWith` rather than computed: the rule is "a default replaces `null` and `undefined`, and
 * nothing else", and it holds whoever produced the value and however. Before 2026-09-01 each case
 * wrote a statement that happened to evaluate to what it needed, which tied a rule about the
 * resolver to an implementation being able to evaluate `${ null }`.
 *
 * The statement is `${ result }` throughout and means nothing - the executer never looks at it.
 */

useTestExecuter();

const RESULT = "${ result }";

describe("Specification 4.4 - the default value", () => {

	it("replaces a result of undefined", async () => {
		answerWith(() => undefined);
		expect(await ExpressionResolver.resolve(RESULT, {}, "fallback")).toBe("fallback");
	});

	it("replaces a result of null", async () => {
		answerWith(() => null);
		expect(await ExpressionResolver.resolve(RESULT, {}, "fallback")).toBe("fallback");
	});

	it("does not replace 0", async () => {
		answerWith(() => 0);
		expect(await ExpressionResolver.resolve(RESULT, {}, "fallback")).toBe(0);
	});

	it("does not replace an empty string", async () => {
		answerWith(() => "");
		expect(await ExpressionResolver.resolve(RESULT, {}, "fallback")).toBe("");
	});

	it("does not replace false", async () => {
		answerWith(() => false);
		expect(await ExpressionResolver.resolve(RESULT, {}, "fallback")).toBe(false);
	});

	it("honours undefined passed as the default", async () => {
		answerWith(() => null);
		expect(await ExpressionResolver.resolve(RESULT, {}, undefined)).toBeUndefined();
	});

	// "a default value was passed" is the presence of the argument, not what it holds - so passing
	// undefined replaces null with undefined, while passing nothing leaves the null standing.
	it("answers null without a default, where undefined as the default would answer undefined", async () => {
		answerWith(() => null);
		expect(await ExpressionResolver.resolve(RESULT, {})).toBe(null);
	});

	it("applies the default per expression in resolveText", async () => {
		answerWith((aStatement) => (aStatement === "a" ? null : "two"));
		expect(await ExpressionResolver.resolveText("${ a } ${ b }", {}, "fallback")).toBe("fallback two");
	});

	it("renders undefined and null literally in resolveText without a default", async () => {
		answerWith((aStatement) => (aStatement === "a" ? undefined : null));
		expect(await ExpressionResolver.resolveText("${ a } ${ b }", {})).toBe("undefined null");
	});

	// 4.3 casts towards string, and 4.4 puts the default where the value would have stood, so a
	// default that is an object is cast like any other value.
	it("casts a default that is an object towards string in resolveText", async () => {
		answerWith(() => undefined);
		expect(await ExpressionResolver.resolveText(RESULT, {}, { a: 1 })).toBe("[object Object]");
	});
});
