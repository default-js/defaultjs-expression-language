import { describe, it, expect } from "vitest";
import executer from "../../../src/executer/ContextDeconstructorExecuter.js";
import { catchError } from "../../TestUtils.js";

/**
 * ContextDeconstructorExecuter - what it says when it cannot run a statement over a context.
 *
 * It binds every name the context carries and filters nothing (DECISIONS.md, 2026-09-22), so a name
 * that is no identifier makes the generated function fail to compile - and the message has to say
 * which statement it was and which name did it, because the statement itself may not mention that
 * name at all.
 *
 * Every case hands the executer a statement and a plain data context, and nothing else.
 */

describe("ContextDeconstructorExecuter - a name it cannot bind", () => {

	it("names the statement and the key that is no identifier", async () => {
		const error = await catchError(() => executer.execute("1 + 1", { "test-test": 1 }));
		expect(error.message.includes("test-test")).toBe(true);
		expect(error.message.includes("1 + 1")).toBe(true);
	});

	it("names every key that is no identifier", async () => {
		const error = await catchError(() => executer.execute("1 + 1", { "first-key": 1, "second-key": 2 }));
		expect(error.message.includes("first-key")).toBe(true);
		expect(error.message.includes("second-key")).toBe(true);
	});

	it("names a symbol key the context carries", async () => {
		const error = await catchError(() => executer.execute("1 + 1", { [Symbol("marker")]: 1 }));
		expect(error.message.includes("Symbol(marker)")).toBe(true);
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
		const statement = `${Date.now()} + 1`;   // never compiled before, so the first call is a cache miss
		const warn = console.warn;
		let warnings = 0;
		console.warn = () => warnings++;
		try {
			await executer.execute(statement, context);
			const afterFirst = warnings;
			await executer.execute(statement, context);
			await executer.execute(statement, context);
			expect(afterFirst).toBe(1);
			expect(warnings).toBe(1);
		} finally {
			console.warn = warn;
		}
	});
});
