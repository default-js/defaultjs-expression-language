import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";

/**
 * SPECIFICATION.md 4.6 - both entry points answer a promise, and a promise value is awaited.
 */

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
		const result = await ExpressionResolver.resolve("${ Promise.resolve(\"awaited\") }", {});
		expect(result).toBe("awaited");
	});

	it("awaits a promise value before inserting it into a text", async () => {
		const result = await ExpressionResolver.resolveText("a ${ Promise.resolve(\"awaited\") } b", {});
		expect(result).toBe("a awaited b");
	});
});
