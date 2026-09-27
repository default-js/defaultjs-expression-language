import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { catchError } from "../TestUtils.js";
import TestExecuter from "../TestExecuter.js";

/**
 * ExpressionResolver - what the two entry points do with an error a statement raised, and what the
 * warnings say. SPECIFICATION.md 7.
 *
 * A text keeps rendering and leaves the expression that failed standing as written, while `resolve`
 * lets the error through. Neither answers the default value for an error. All of it happens above
 * the executer, so the failure is produced rather than provoked: the `TestExecuter` throws for the
 * statement that is meant to fail. Before 2026-09-01 each case wrote a statement that happened to
 * fail under whichever implementation was the default - which meant a changed executer could
 * silently take the failure away and leave the case green for nothing.
 */

const FAILING = "missing.deep";

// fails for the one statement, answers every other one with itself
const failOn = (aStatement) =>
	new TestExecuter((aStatementGiven) => {
		if (aStatementGiven.trim() === aStatement) throw new ReferenceError("missing is not defined");
		return aStatementGiven.trim();
	});

// throws the given error for every statement
const throwing = (anError) =>
	new TestExecuter(() => {
		throw anError;
	});

describe("ExpressionResolver - a failing statement is caught in a text", () => {

	it("leaves the expression standing as written", async () => {
		const resolver = new ExpressionResolver({ context: {}, name: "root", executer: failOn(FAILING) });
		expect(await resolver.resolveText(`\${${FAILING}}`)).toBe(`\${${FAILING}}`);
	});

	it("leaves it standing even where a default value was passed", async () => {
		const resolver = new ExpressionResolver({ context: {}, name: "root", executer: failOn(FAILING) });
		expect(await resolver.resolveText(`\${${FAILING}}`, "fallback")).toBe(`\${${FAILING}}`);
	});

	it("never stops the rest of a text from rendering", async () => {
		const resolver = new ExpressionResolver({ context: {}, name: "root", executer: failOn(FAILING) });
		expect(await resolver.resolveText(`\${ok} \${${FAILING}} \${ok}`)).toBe(`ok \${${FAILING}} ok`);
	});
});

describe("ExpressionResolver - resolve lets the error through", () => {

	// Which error it is - the one raised, unchanged - is pinned below. What is left here is that a
	// default value does not swallow it.
	it("raises it even where a default value was passed", async () => {
		const resolver = new ExpressionResolver({ context: {}, name: "root", executer: failOn(FAILING) });
		const error = await catchError(() => resolver.resolve(`\${${FAILING}}`, "fallback"));
		expect(error instanceof ReferenceError).toBe(true);
	});
});

describe("ExpressionResolver - what the warnings say", () => {

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
		const resolver = new ExpressionResolver({ context: {}, name: "root", executer: throwing(new Error("from the executer")) });
		const warnings = await collectWarnings(() => resolver.resolveText(`\${ ${STATEMENT} }`));
		expect(warnings.some((warning) => warning.includes(STATEMENT))).toBe(true);
	});

	// resolve logs before it throws, so the console names the statement even though the caller is
	// handed the error as well.
	it("names the statement that failed before resolve raises it", async () => {
		const resolver = new ExpressionResolver({ context: {}, name: "root", executer: throwing(new Error("from the executer")) });
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
		const resolver = new ExpressionResolver({ context: {}, name: "root", executer: throwing(raised) });
		const error = await catchError(() => resolver.resolve(`\${ ${STATEMENT} }`));
		expect(error === raised).toBe(true);
	});
});
