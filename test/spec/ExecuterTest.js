import { describe, it, expect, afterAll } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { EXECUTERS } from "../ExecuterCapabilities.js";
import Executer from "../../src/Executer.js";
import getExecuter, { registrate, getExecuter as namedGetExecuter } from "../../src/ExecuterRegistry.js";
import * as WithScopedModule from "../../src/executer/WithScopedExecuter.js";
import * as ContextObjectModule from "../../src/executer/ContextObjectExecuter.js";
import * as ContextDeconstructorModule from "../../src/executer/ContextDeconstructorExecuter.js";
import * as EsprimaModule from "../../src/executer/EsprimaExecuter.js";

const WithScopedExecuterName = WithScopedModule.EXECUTERNAME;
const ContextObjectExecuterName = ContextObjectModule.EXECUTERNAME;
const ContextDeconstructorExecuterName = ContextDeconstructorModule.EXECUTERNAME;
const EsprimaExecuterName = EsprimaModule.EXECUTERNAME;

const MODULE_OF = {
	[WithScopedExecuterName]: WithScopedModule,
	[ContextObjectExecuterName]: ContextObjectModule,
	[ContextDeconstructorExecuterName]: ContextDeconstructorModule,
	[EsprimaExecuterName]: EsprimaModule
};

/**
 * Conformance tests for SPECIFICATION.md section 8 - the executers.
 *
 * What is left here is what does not belong to one executer: the interface and the registry of
 * 8.1, which implementation is the default, that every implementation registers itself on import
 * (8.2), and that each one accepts a cache size (8.4).
 *
 * 8.3 - what an executer decides for itself - is per executer by definition and lives in
 * `test/executer/shared/ExecuterRules.js`, written against the capability catalogue. What an
 * executer answers where a capability is unsupported sits in that executer's own directory.
 */

describe("Specification 8.1 - the interface", () => {

	it("answers the default context it was built with", async () => {
		const context = { marker: 1 };
		const executer = new Executer({ defaultContext: context, execution: () => null });
		expect(executer.defaultContext === context).toBe(true);
	});

	it("runs the execution it was built with", async () => {
		const executer = new Executer({ defaultContext: {}, execution: (aStatement, aContext) => `${aStatement}|${aContext.marker}` });
		expect(executer.execute("statement", { marker: "context" })).toBe("statement|context");
	});

	it("falls back to an empty default context", async () => {
		const executer = new Executer();
		expect(typeof executer.defaultContext).toBe("object");
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
		const own = new Executer({ defaultContext: {}, execution: () => "from own executer" });
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

describe("Specification 8.1 - the default executer", () => {

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
		const own = new Executer({ defaultContext: {}, execution: () => "from own executer" });
		ExpressionResolver.defaultExecuter = own;
		expect(ExpressionResolver.defaultExecuter === own).toBe(true);
		ExpressionResolver.defaultExecuter = reset;
	});
});

describe("Specification 8.2 - the implementations", () => {

	for (const { name } of EXECUTERS) {
		it(`registers ${name} on import of its module`, async () => {
			expect(getExecuter(name) instanceof Executer).toBe(true);
		});
	}

	it("uses context-deconstruction-executer as the default", async () => {
		expect(ExpressionResolver.defaultExecuter === getExecuter(ContextDeconstructorExecuterName)).toBe(true);
	});
});

describe("Specification 8.4 - tuning", () => {

	// Only that the option is accepted and that resolution survives it. Whether an expression was
	// served from the cache or compiled again cannot be told apart from the outside - both answer
	// the same value - so no test here claims to prove caching.
	for (const { name, variableName } of EXECUTERS) {
		it(`accepts a cache size and keeps resolving under ${name}`, async () => {
			const module = MODULE_OF[name];
			const variableNameValue = variableName("value");
			const resolver = new ExpressionResolver({ context: { value: "from context" }, name: "root", executer: name });

			module.setupExecuter({ size: 0 });
			const disabled = await resolver.resolve(`\${${variableNameValue}}`, "fallback");
			module.setupExecuter({ size: 5000 });
			const enabled = await resolver.resolve(`\${${variableNameValue}}`, "fallback");

			expect(disabled).toBe("from context");
			expect(enabled).toBe("from context");
		});
	}

	it("exports setDebug where it exists", async () => {
		expect(typeof EsprimaModule.setDebug).toBe("function");
	});
});
