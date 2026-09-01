import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { catchError } from "../TestUtils.js";
import { useTestExecuter, answerWith } from "../TestExecuter.js";

/**
 * SPECIFICATION.md 7 - what the resolver says and does when a statement fails.
 *
 * What is left here is what happens **above** the executer: the warning, and the statement it names.
 * That an error arrives at all is the executer's part, and what each entry point makes of one is
 * asked of every implementation in `test/executer/rules/7-errors.Test.js`.
 *
 * The failure is therefore produced rather than provoked: `answerWith` throws, and what is asserted
 * is that the resolver names the statement and hands the error on. Before 2026-09-01 each case wrote
 * a statement that happened to fail under whichever implementation was the default - which meant a
 * changed executer could silently take the failure away and leave the case green for nothing.
 */

useTestExecuter();

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

	const STATEMENT = "missingProbe.deep";

	it("names the statement that failed in a text", async () => {
		answerWith(() => {
			throw new Error("from the executer");
		});
		const resolver = new ExpressionResolver({ context: {}, name: "root" });
		const warnings = await collectWarnings(() => resolver.resolveText(`\${ ${STATEMENT} }`));
		expect(warnings.some((warning) => warning.includes(STATEMENT))).toBe(true);
	});

	// resolve logs before it throws, so the console names the statement even though the caller is
	// handed the error as well.
	it("names the statement that failed before resolve raises it", async () => {
		answerWith(() => {
			throw new Error("from the executer");
		});
		const resolver = new ExpressionResolver({ context: {}, name: "root" });
		let error = null;
		const warnings = await collectWarnings(async () => {
			error = await catchError(() => resolver.resolve(`\${ ${STATEMENT} }`));
		});
		expect(error instanceof Error).toBe(true);
		expect(warnings.some((warning) => warning.includes(STATEMENT))).toBe(true);
	});

	// The error the executer raised is the error the caller gets - not one the resolver wrapped or
	// replaced. A SyntaxError is the case a consumer meets most often, because a statement that does
	// not compile is how most failures start.
	it("hands the caller the error the executer raised, unchanged", async () => {
		const raised = new SyntaxError("does not compile");
		answerWith(() => {
			throw raised;
		});
		const resolver = new ExpressionResolver({ context: {}, name: "root" });
		const error = await catchError(() => resolver.resolve(`\${ ${STATEMENT} }`));
		expect(error === raised).toBe(true);
	});

	// The threshold is one second, so this test cannot be quicker than that.
	it("names a statement that runs longer than a second, without affecting the resolution", async () => {
		answerWith(() => new Promise((resolve) => setTimeout(() => resolve("late"), 1200)));
		const resolver = new ExpressionResolver({ context: {}, name: "root" });
		let result = null;
		const warnings = await collectWarnings(async () => {
			result = await resolver.resolve(`\${ ${STATEMENT} }`, "fallback");
		});
		expect(result).toBe("late");
		expect(warnings.some((warning) => warning.includes(STATEMENT))).toBe(true);
	});
});
