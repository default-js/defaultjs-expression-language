import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { EXECUTERS } from "../TestUtils.js";

/**
 * Conformance tests for SPECIFICATION.md section 7 - errors.
 *
 * A statement that fails is caught by ExpressionResolver, above the executer, so the rule has to
 * hold under every one of them and the loop covers all four. What the two tests at the bottom
 * pin - the wording of the warnings - happens in the same place and is checked once.
 */

for (const { name: executer, variableName } of EXECUTERS) {

	describe(`Specification 7 - a failing statement is caught [${executer}]`, () => {

		it("answers undefined", async () => {
			const variableNameMissing = variableName("missing");
			const resolver = new ExpressionResolver({ context: { known: 1 }, name: "root", executer });
			const result = await resolver.resolve(`\${${variableNameMissing}.deep}`);
			expect(result).toBeUndefined();
		});

		it("answers the default value where one was passed", async () => {
			const variableNameMissing = variableName("missing");
			const resolver = new ExpressionResolver({ context: { known: 1 }, name: "root", executer });
			const result = await resolver.resolve(`\${${variableNameMissing}.deep}`, "fallback");
			expect(result).toBe("fallback");
		});

		it("never stops the rest of a text from rendering", async () => {
			const variableNameKnown = variableName("known");
			const variableNameMissing = variableName("missing");
			const resolver = new ExpressionResolver({ context: { known: "ok" }, name: "root", executer });
			const result = await resolver.resolveText(`\${${variableNameKnown}} \${${variableNameMissing}.deep} \${${variableNameKnown}}`);
			expect(result).toBe("ok undefined ok");
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

	it("names the statement that failed", async () => {
		const resolver = new ExpressionResolver({ context: {}, name: "root" });
		const warnings = await collectWarnings(() => resolver.resolve("${ missingProbe.deep }"));
		expect(warnings.some((warning) => warning.includes("missingProbe.deep"))).toBe(true);
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
