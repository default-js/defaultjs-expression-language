import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { catchError } from "../TestUtils.js";
import { useTestExecuter, answerWith } from "../TestExecuter.js";

/**
 * SPECIFICATION.md 7 - what the two entry points do with an error a statement raised.
 *
 * A text keeps rendering and leaves the expression that failed standing as written, while `resolve`
 * lets the error through. Neither answers the default value for an error. All of it happens above
 * the executer, so the failure is produced rather than provoked: `answerWith` throws for the
 * statement that is meant to fail. That the error arrives unchanged, and what the warnings say, is
 * `7-the-warnings.Test.js`.
 */

useTestExecuter();

const FAILING = "missing.deep";

// fails for the one statement, answers every other one with itself
const failOn = (aStatement) =>
	answerWith((aStatementGiven) => {
		if (aStatementGiven.trim() === aStatement) throw new ReferenceError("missing is not defined");
		return aStatementGiven.trim();
	});

describe("Specification 7 - a failing statement is caught in a text", () => {

	it("leaves the expression standing as written", async () => {
		failOn(FAILING);
		const resolver = new ExpressionResolver({ context: {}, name: "root" });
		expect(await resolver.resolveText(`\${${FAILING}}`)).toBe(`\${${FAILING}}`);
	});

	it("leaves it standing even where a default value was passed", async () => {
		failOn(FAILING);
		const resolver = new ExpressionResolver({ context: {}, name: "root" });
		expect(await resolver.resolveText(`\${${FAILING}}`, "fallback")).toBe(`\${${FAILING}}`);
	});

	it("never stops the rest of a text from rendering", async () => {
		failOn(FAILING);
		const resolver = new ExpressionResolver({ context: {}, name: "root" });
		expect(await resolver.resolveText(`\${ok} \${${FAILING}} \${ok}`)).toBe(`ok \${${FAILING}} ok`);
	});
});

describe("Specification 7 - resolve lets the error through", () => {

	// Which error it is - the one raised, unchanged - is pinned in 7-the-warnings.Test.js. What is
	// left here is that a default value does not swallow it.
	it("raises it even where a default value was passed", async () => {
		failOn(FAILING);
		const resolver = new ExpressionResolver({ context: {}, name: "root" });
		const error = await catchError(() => resolver.resolve(`\${${FAILING}}`, "fallback"));
		expect(error instanceof ReferenceError).toBe(true);
	});
});
