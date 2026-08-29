import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { EXECUTERS, catchError } from "../TestUtils.js";

/**
 * Conformance tests for SPECIFICATION.md section 7 - errors.
 *
 * The two entry points answer an error differently and that is the whole of section 7: a text keeps
 * rendering and leaves the expression that failed standing as written, while `resolve` logs the
 * error and lets it through. Neither of them answers the default value for an error - a default
 * covers a missing result, never a failing statement. Both halves run once per executer, because
 * the error arrives from the executer and every one of them has to keep the rule. What the warnings
 * say happens above the executer and is checked once.
 */

for (const { name: executer, variableName } of EXECUTERS) {

	describe(`Specification 7 - a failing statement is caught in a text [${executer}]`, () => {

		it("leaves the expression standing as written", async () => {
			const variableNameMissing = variableName("missing");
			const failing = `\${${variableNameMissing}.deep}`;
			const resolver = new ExpressionResolver({ context: { known: 1 }, name: "root", executer });
			const result = await resolver.resolveText(failing);
			expect(result).toBe(failing);
		});

		it("leaves it standing even where a default value was passed", async () => {
			const variableNameMissing = variableName("missing");
			const failing = `\${${variableNameMissing}.deep}`;
			const resolver = new ExpressionResolver({ context: { known: 1 }, name: "root", executer });
			const result = await resolver.resolveText(failing, "fallback");
			expect(result).toBe(failing);
		});

		it("never stops the rest of a text from rendering", async () => {
			const variableNameKnown = variableName("known");
			const variableNameMissing = variableName("missing");
			const failing = `\${${variableNameMissing}.deep}`;
			const resolver = new ExpressionResolver({ context: { known: "ok" }, name: "root", executer });
			const result = await resolver.resolveText(`\${${variableNameKnown}} ${failing} \${${variableNameKnown}}`);
			expect(result).toBe(`ok ${failing} ok`);
		});
	});

	describe(`Specification 7 - resolve lets the error through [${executer}]`, () => {

		it("raises the error the statement raised", async () => {
			const variableNameMissing = variableName("missing");
			const resolver = new ExpressionResolver({ context: { known: 1 }, name: "root", executer });
			const error = await catchError(() => resolver.resolve(`\${${variableNameMissing}.deep}`));
			expect(error instanceof Error).toBe(true);
		});

		it("raises it even where a default value was passed", async () => {
			const variableNameMissing = variableName("missing");
			const resolver = new ExpressionResolver({ context: { known: 1 }, name: "root", executer });
			const error = await catchError(() => resolver.resolve(`\${${variableNameMissing}.deep}`, "fallback"));
			expect(error instanceof Error).toBe(true);
		});
	});
}

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
		const warnings = await collectWarnings(() => resolver.resolveText("${ missingProbe.deep }"));
		expect(warnings.some((warning) => warning.includes("missingProbe.deep"))).toBe(true);
	});

	// resolve logs before it throws, so the console names the statement even though the caller is
	// handed the error as well.
	it("names the statement that failed before resolve raises it", async () => {
		const resolver = new ExpressionResolver({ context: {}, name: "root" });
		let error = null;
		const warnings = await collectWarnings(async () => {
			error = await catchError(() => resolver.resolve("${ missingProbe.deep }"));
		});
		expect(error instanceof Error).toBe(true);
		expect(warnings.some((warning) => warning.includes("missingProbe.deep"))).toBe(true);
	});

	// A statement that does not compile is an error like any other. The input reaches the executer
	// as a statement because 3.2 does not apply to resolve at all: the backslashes are part of the
	// statement, and that statement is not valid JavaScript.
	it("names a statement that does not compile before resolve raises it", async () => {
		const resolver = new ExpressionResolver({ context: { test: "resolved" }, name: "root" });
		let error = null;
		const warnings = await collectWarnings(async () => {
			error = await catchError(() => resolver.resolve("\\${test}", "fallback"));
		});
		expect(error instanceof SyntaxError).toBe(true);
		expect(warnings.some((warning) => warning.includes("${test}"))).toBe(true);
	});

	// The threshold is one second, so this test cannot be quicker than that.
	it("names a statement that runs longer than a second, without affecting the resolution", async () => {
		const context = {
			slow: () => new Promise((resolve) => setTimeout(() => resolve("late"), 1200))
		};
		const resolver = new ExpressionResolver({ context, name: "root" });
		let result = null;
		const warnings = await collectWarnings(async () => {
			result = await resolver.resolve("${ slow() }", "fallback");
		});
		expect(result).toBe("late");
		expect(warnings.some((warning) => warning.includes("slow()"))).toBe(true);
	});
});
