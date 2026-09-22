import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { EXECUTERNAME as ContextDeconstructorExecuterName } from "../../src/executer/ContextDeconstructorExecuter.js";
import { EXECUTERNAME as ContextObjectExecuterName } from "../../src/executer/ContextObjectExecuter.js";

/**
 * SPECIFICATION.md 6.4 - the global object as an ordinary context object.
 *
 * How a name that no resolver carries reaches the global object is the executer's own (9.8) and is
 * a row of the capability catalogue. What is here is the global object handed in as a context.
 */

describe("Specification 6.4 - the global object as a context object", () => {

	it("takes the global object as an ordinary link of the chain", async () => {
		const resolver = new ExpressionResolver({ context: globalThis, name: "global" });
		const result = await resolver.resolve("${ Math.round(1.5) }", "fallback");
		expect(result).toBe(2);
	});

	// This executer gets its own case because it is the one that reads the names of the context
	// before it runs a statement, so a global context reaches it differently than the other three.
	it("takes the global object as an ordinary link under the deconstruction executer", async () => {
		const resolver = new ExpressionResolver({ context: globalThis, name: "global", executer: ContextDeconstructorExecuterName });
		const result = await resolver.resolve("${ Math.round(1.5) }", "fallback");
		expect(result).toBe(2);
	});

	// A resolver over the global object contributes no name to the enumeration of a resolver below
	// it: everything it holds is reachable through the ordinary scope chain of the statement anyway,
	// so handing those names on would only make an executer that turns a name into code fail over
	// names it never needed - the index "0" of a frame, a symbol another library planted on `window`.
	// A lookup still finds them (6.4), it is the name list that stays out.
	it("carries a resolver below a global one while the page has a frame", async () => {
		const frame = document.createElement("iframe");
		document.body.appendChild(frame);
		try {
			const root = new ExpressionResolver({ context: globalThis, name: "global", executer: ContextDeconstructorExecuterName });
			const leaf = new ExpressionResolver({ context: { own: "from leaf" }, name: "leaf", parent: root, executer: ContextDeconstructorExecuterName });
			expect(await leaf.resolve("${ own }")).toBe("from leaf");
		} finally {
			frame.remove();
		}
	});

	// ...and the global name is still found from below, which is what makes the list above needless.
	it("reaches a global name from a resolver below a global one", async () => {
		const root = new ExpressionResolver({ context: globalThis, name: "global", executer: ContextDeconstructorExecuterName });
		const leaf = new ExpressionResolver({ context: { own: "from leaf" }, name: "leaf", parent: root, executer: ContextDeconstructorExecuterName });
		expect(await leaf.resolve("${ Math.round(1.5) }")).toBe(2);
	});
});
