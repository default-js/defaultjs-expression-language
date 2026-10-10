import { describe, it, expect } from "vitest";
import Executer from "../../src/Executer.js";

/**
 * The executer interface: the class `Executer` every implementation builds on (SPECIFICATION.md
 * 9.1).
 *
 * Whether an implementation keeps the interface - its module registers it on import, exports it and
 * its name - is asked in that implementation's own directory beside this file, never in a list of
 * all of them: a new executer brings the question along with its own suite.
 */

describe("The executer interface - Executer", () => {

	// a resolver without a context has none (4.2), so an executer has no context to offer
	it("carries no default context", async () => {
		const executer = new Executer({ execution: () => null });
		expect("defaultContext" in executer).toBe(false);
	});

	it("runs the execution it was built with", async () => {
		const executer = new Executer({ execution: (aStatement, aContext) => `${aStatement}|${aContext.marker}` });
		expect(executer.execute("statement", { marker: "context" })).toBe("statement|context");
	});

	it("throws when an executer without an execution is asked to execute", async () => {
		const executer = new Executer();
		let error = null;
		try {
			executer.execute("statement", {});
		} catch (e) {
			error = e;
		}
		expect(error != null).toBe(true);
	});
});
