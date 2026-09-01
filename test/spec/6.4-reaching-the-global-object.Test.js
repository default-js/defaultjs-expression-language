import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { EXECUTERNAME as ContextDeconstructorExecuterName } from "../../src/executer/ContextDeconstructorExecuter.js";

/**
 * SPECIFICATION.md 6.4 - the global object as an ordinary context object.
 *
 * How a name that no resolver carries reaches the global object is the executer's own (8.3) and is
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

	// A link below a global one asks the global link for its names, which is where an indexed name
	// of the global object reaches an executer that turns names into code. A page carrying a frame
	// has one: window[0] is frames[0], so the own name "0" appears for as long as the frame does.
	it("carries a link below a global one while the page has a frame", async () => {
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
});
