import { describe, it, expect, afterAll } from "vitest";
import { ExpressionResolver } from "../../index.js";
import Executer from "../../src/Executer.js";
import getExecuter, { registrate, getExecuter as namedGetExecuter } from "../../src/ExecuterRegistry.js";
import * as ContextObjectModule from "../../src/executer/ContextObjectExecuter.js";

/**
 * SPECIFICATION.md 9.1 - the Executer interface and the registry, plus which implementation is the
 * default. None of it runs an expression through an executer of its own choosing.
 */

const ContextObjectExecuterName = ContextObjectModule.EXECUTERNAME;

describe("Specification 9.1 - the interface", () => {

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

	it("keeps an implementation under a name and answers it again", async () => {
		const own = new Executer({ execution: () => "from own executer" });
		registrate("conformance-probe-executer", own);
		expect(getExecuter("conformance-probe-executer") === own).toBe(true);
	});

	it("answers getExecuter as the default export of the registry module", async () => {
		expect(getExecuter === namedGetExecuter).toBe(true);
	});

	it("throws on a name that was never registered", async () => {
		let error = null;
		try {
			getExecuter("no-such-executer");
		} catch (e) {
			error = e;
		}
		expect(error != null).toBe(true);
	});
});

describe("Specification 9.1 - the default executer", () => {

	const reset = ExpressionResolver.defaultExecuter;
	afterAll(() => {
		ExpressionResolver.defaultExecuter = reset;
	});

	it("takes a registered name", async () => {
		ExpressionResolver.defaultExecuter = ContextObjectExecuterName;
		expect(ExpressionResolver.defaultExecuter === getExecuter(ContextObjectExecuterName)).toBe(true);
		ExpressionResolver.defaultExecuter = reset;
	});

	it("takes an Executer instance", async () => {
		const own = new Executer({ execution: () => "from own executer" });
		ExpressionResolver.defaultExecuter = own;
		expect(ExpressionResolver.defaultExecuter === own).toBe(true);
		ExpressionResolver.defaultExecuter = reset;
	});
});
