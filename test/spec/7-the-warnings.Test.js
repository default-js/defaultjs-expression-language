import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { catchError } from "../TestUtils.js";
import { defaultExecuterEntry } from "../ExecuterCapabilities.js";

/**
 * Conformance tests for SPECIFICATION.md section 7 - errors.
 *
 * What is left here is what happens above the executer: the warnings, and the statement each of
 * them names. It runs once.
 *
 * The two entry points answer an error differently and that is the rest of section 7: a text keeps
 * rendering and leaves the expression that failed standing as written, while `resolve` logs the
 * error and lets it through. Neither answers the default value for an error. The error arrives
 * from the executer, so both halves are asked of every one of them in
 * `test/executer/shared/ErrorRules.js`.
 *
 * Where a statement reaches a context value, the name is spelled the way the default executer
 * spells it, taken from the catalogue - the dialect is the executer's own (8.3).
 */
const { variableName } = defaultExecuterEntry();

describe("Specification 7 - what the warnings say", () => {

	// console.warn is replaced by hand rather than through a spy helper: the suite keeps its
	// vitest surface to describe/it/expect and the three matchers, and a plain function does the
	// job. It is restored in a finally, so a failing assertion cannot leave the console patched.
	const collectWarnings = async (fn) => {
		const warnings = [];
		const original = console.warn;
		console.warn = (...args) => warnings.push(args.map((arg) => String(arg)).join(" "));
		try {
			await fn();
		} finally {
			console.warn = original;
		}
		return warnings;
	};

	it("names the statement that failed in a text", async () => {
		const resolver = new ExpressionResolver({ context: {}, name: "root" });
		const statement = `${variableName("missingProbe")}.deep`;
		const warnings = await collectWarnings(() => resolver.resolveText(`\${ ${statement} }`));
		expect(warnings.some((warning) => warning.includes(statement))).toBe(true);
	});

	// resolve logs before it throws, so the console names the statement even though the caller is
	// handed the error as well.
	it("names the statement that failed before resolve raises it", async () => {
		const resolver = new ExpressionResolver({ context: {}, name: "root" });
		const statement = `${variableName("missingProbe")}.deep`;
		let error = null;
		const warnings = await collectWarnings(async () => {
			error = await catchError(() => resolver.resolve(`\${ ${statement} }`));
		});
		expect(error instanceof Error).toBe(true);
		expect(warnings.some((warning) => warning.includes(statement))).toBe(true);
	});

	// A statement that does not compile is an error like any other. The input reaches the executer
	// as a statement because 3.2 does not apply to resolve at all: the backslashes are part of the
	// statement, and that statement is not valid JavaScript.
	it("names a statement that does not compile before resolve raises it", async () => {
		const resolver = new ExpressionResolver({ context: { test: "resolved" }, name: "root" });
		const expression = `\${${variableName("test")}}`;
		let error = null;
		const warnings = await collectWarnings(async () => {
			error = await catchError(() => resolver.resolve(`\\${expression}`, "fallback"));
		});
		expect(error instanceof SyntaxError).toBe(true);
		expect(warnings.some((warning) => warning.includes(expression))).toBe(true);
	});

	// The threshold is one second, so this test cannot be quicker than that.
	it("names a statement that runs longer than a second, without affecting the resolution", async () => {
		const context = {
			slow: () => new Promise((resolve) => setTimeout(() => resolve("late"), 1200))
		};
		const resolver = new ExpressionResolver({ context, name: "root" });
		let result = null;
		const warnings = await collectWarnings(async () => {
			result = await resolver.resolve(`\${ ${variableName("slow")}() }`, "fallback");
		});
		expect(result).toBe("late");
		expect(warnings.some((warning) => warning.includes(`${variableName("slow")}()`))).toBe(true);
	});
});
