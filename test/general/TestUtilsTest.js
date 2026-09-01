import { describe, it, expect } from "vitest";
import { EXECUTERS } from "../ExecuterCapabilities.js";
import { createResolveWithExecuterFunction, createResolveTextWithExecuterFunction } from "../TestUtils.js";

/**
 * The two helpers had no consumer, which is how they came to pass the context where the instance
 * API expects a default value - see BACKLOG.md, closed 2026-08-30. This file is that consumer, so
 * the shape they hand out is proven rather than assumed. Seen failing against the old helpers on
 * 2026-08-30: 14 of these 16 cases. The two that pass either way are "without a default answers
 * undefined" under the two executers that answer `undefined` for an unknown name instead of
 * raising - there a missing context and an empty one look the same from outside.
 */
describe("general: the executer-bound helpers of TestUtils", () => {

	for (const { name: executer, variableName } of EXECUTERS) {
		const expression = `\${${variableName("value")}}`;

		it(`${executer}: resolve reads from the context it was handed`, async () => {
			const resolve = createResolveWithExecuterFunction(executer);
			expect(await resolve(expression, { value: "from context" })).toBe("from context");
		});

		it(`${executer}: resolve answers the default value where the statement has none`, async () => {
			const resolve = createResolveWithExecuterFunction(executer);
			expect(await resolve(expression, { value: undefined }, "fallback")).toBe("fallback");
		});

		it(`${executer}: resolve without a default answers undefined`, async () => {
			const resolve = createResolveWithExecuterFunction(executer);
			expect(await resolve(expression, { value: undefined })).toBeUndefined();
		});

		it(`${executer}: resolveText replaces the expression inside the text`, async () => {
			const resolveText = createResolveTextWithExecuterFunction(executer);
			expect(await resolveText(`a ${expression} b`, { value: 1 })).toBe("a 1 b");
		});
	}
});
