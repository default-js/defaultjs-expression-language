import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { EXECUTERNAME } from "../../src/executer/ContextDeconstructorExecuter.js";
import { catchError } from "../TestUtils.js";

/**
 * What `ContextDeconstructorExecuter` says when it cannot run a statement over a context.
 *
 * Pins no rule of SPECIFICATION.md: what an executer does with a name it cannot bind is its own
 * business. It binds every name the context carries and filters nothing (DECISIONS.md, 2026-09-22),
 * so a name that is no identifier makes the generated function fail to compile - and the message has
 * to say which statement it was and which name did it, because the statement itself may not mention
 * that name at all.
 */

describe("ContextDeconstructorExecuter - a name it cannot bind", () => {

	const resolverOver = (aContext) => new ExpressionResolver({ context: aContext, executer: EXECUTERNAME });

	it("names the statement and the key that is no identifier", async () => {
		const error = await catchError(() => resolverOver({ "test-test": 1 }).resolve("${ 1 + 1 }"));
		expect(error.message.includes("test-test")).toBe(true);
		expect(error.message.includes("1 + 1")).toBe(true);
	});

	it("names a symbol key the context carries", async () => {
		const error = await catchError(() => resolverOver({ [Symbol("marker")]: 1 }).resolve("${ 1 + 1 }"));
		expect(error.message.includes("Symbol(marker)")).toBe(true);
		expect(error.message.includes("1 + 1")).toBe(true);
	});

	it("names a key that is a reserved word", async () => {
		const error = await catchError(() => resolverOver({ class: 1 }).resolve("${ 1 + 1 }"));
		expect(error.message.includes("class")).toBe(true);
		expect(error.message.includes("1 + 1")).toBe(true);
	});
});

describe("ContextDeconstructorExecuter - the warning about a large context", () => {

	// It used to warn on every execution, which cost a factor of four to twenty-five in a browser:
	// a console write is more expensive than the resolution. It now warns while it compiles, so a
	// consumer still learns of the cost once per context shape and statement. `vi` is not used - the
	// suite keeps a narrow surface (TESTING.md), and swapping console.warn by hand says the same.
	it("warns while it compiles, not on every execution", async () => {
		const context = {};
		for (let i = 0; i < 30; i++) context[`key${i}`] = i;
		const resolver = new ExpressionResolver({ context, executer: EXECUTERNAME });
		const statement = `\${ ${Date.now()} + 1 }`;   // never compiled before, so the first call is a cache miss
		const warn = console.warn;
		let warnings = 0;
		console.warn = () => warnings++;
		try {
			await resolver.resolve(statement);
			const afterFirst = warnings;
			await resolver.resolve(statement);
			await resolver.resolve(statement);
			expect(afterFirst).toBe(1);
			expect(warnings).toBe(1);
		} finally {
			console.warn = warn;
		}
	});
});
