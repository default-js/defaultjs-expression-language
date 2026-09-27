import { describe, it, expect, afterAll } from "vitest";
import { ExpressionResolver } from "../../index.js";
import TestExecuter from "../TestExecuter.js";

/**
 * ExpressionResolver - both entry points answer a promise, and a promise value is awaited.
 * SPECIFICATION.md 4.6.
 *
 * Where a case needs a promise as the value of a statement, the `TestExecuter` answers one rather
 * than computing it: awaiting it is the resolver's work, producing it would be an executer's. The
 * static entry points take no executer, so a case sets `ExpressionResolver.defaultExecuter` itself
 * and the file puts the previous one back.
 */

const previousDefault = ExpressionResolver.defaultExecuter;
afterAll(() => {
	ExpressionResolver.defaultExecuter = previousDefault;
});

describe("ExpressionResolver - both entry points answer a promise", () => {

	it("static resolve answers a promise", async () => {
		ExpressionResolver.defaultExecuter = new TestExecuter();
		const answer = ExpressionResolver.resolve("${ 1 }", {});
		expect(answer instanceof Promise).toBe(true);
		await answer;
	});

	it("static resolveText answers a promise", async () => {
		ExpressionResolver.defaultExecuter = new TestExecuter();
		const answer = ExpressionResolver.resolveText("${ 1 }", {});
		expect(answer instanceof Promise).toBe(true);
		await answer;
	});

	it("instance resolve answers a promise", async () => {
		const resolver = new ExpressionResolver({ context: {}, executer: new TestExecuter() });
		const answer = resolver.resolve("${ 1 }");
		expect(answer instanceof Promise).toBe(true);
		await answer;
	});

	// A text without an expression is where a synchronous shortcut would be tempting, and the static
	// resolveText, being async itself, would wrap it and hide it.
	it("instance resolveText answers a promise for a text without an expression", async () => {
		const resolver = new ExpressionResolver({ context: {}, executer: new TestExecuter() });
		const answer = resolver.resolveText("no expression");
		expect(answer instanceof Promise).toBe(true);
		await answer;
	});

	it("awaits a promise value before answering it", async () => {
		ExpressionResolver.defaultExecuter = new TestExecuter(() => Promise.resolve("awaited"));
		expect(await ExpressionResolver.resolve("${ promised }", {})).toBe("awaited");
	});

	it("awaits a promise value before inserting it into a text", async () => {
		ExpressionResolver.defaultExecuter = new TestExecuter(() => Promise.resolve("awaited"));
		expect(await ExpressionResolver.resolveText("a ${ promised } b", {})).toBe("a awaited b");
	});
});
