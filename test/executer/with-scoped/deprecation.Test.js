import { describe, it, expect } from "vitest";
import executer from "../../../src/executer/WithScopedExecuter.js";

/**
 * WithScopedExecuter - the announcement of its deprecation. SPECIFICATION.md 9.2.
 *
 * The executer warns once, on the first statement it executes, and the flag that says so is module
 * state. The case therefore has to be the first execution in this file, and it relies on Vitest
 * isolating each test file with its own module graph: no other file's execution reaches it. A second
 * case executing before it would take the warning away.
 */

describe("WithScopedExecuter - the deprecation", () => {

	// console.warn is replaced by hand rather than through a spy helper: the suite keeps its vitest
	// surface narrow (TESTING.md), and a plain function does the job.
	it("announces its deprecation on the first statement it executes, and only there", async () => {
		const warnings = [];
		const original = console.warn;
		console.warn = (...args) => warnings.push(args.map((arg) => String(arg)).join(" "));
		try {
			await executer.execute("1", {});
			const afterFirst = warnings.length;
			await executer.execute("2", {});
			expect(afterFirst).toBe(1);
			expect(warnings.length).toBe(1);
			expect(warnings[0].includes("deprecated")).toBe(true);
		} finally {
			console.warn = original;
		}
	});
});
