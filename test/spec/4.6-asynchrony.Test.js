import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { useTestExecuter, answerWith } from "../TestExecuter.js";

/**
 * SPECIFICATION.md 4.6 - both entry points answer a promise, and a promise value is awaited.
 *
 * Where a case needs a promise as the value of a statement, it is set with `answerWith` rather than
 * computed: awaiting it is the resolver's work, producing it would be an executer's.
 */

useTestExecuter();

describe("Specification 4.6 - both entry points answer a promise", () => {

	it("static resolve answers a promise", async () => {
		const answer = ExpressionResolver.resolve("${ 1 }", {});
		expect(answer instanceof Promise).toBe(true);
		await answer;
	});

	it("static resolveText answers a promise", async () => {
		const answer = ExpressionResolver.resolveText("${ 1 }", {});
		expect(answer instanceof Promise).toBe(true);
		await answer;
	});

	it("instance resolve answers a promise", async () => {
		const resolver = new ExpressionResolver({ context: {} });
		const answer = resolver.resolve("${ 1 }");
		expect(answer instanceof Promise).toBe(true);
		await answer;
	});

	it("awaits a promise value before answering it", async () => {
		answerWith(() => Promise.resolve("awaited"));
		expect(await ExpressionResolver.resolve("${ promised }", {})).toBe("awaited");
	});

	it("awaits a promise value before inserting it into a text", async () => {
		answerWith(() => Promise.resolve("awaited"));
		expect(await ExpressionResolver.resolveText("a ${ promised } b", {})).toBe("a awaited b");
	});
});
