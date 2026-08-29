import { describe, it, expect, afterAll } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { EXECUTERS } from "../TestUtils.js";
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
 * This is the file 8.3 points at: the three things an executer decides for itself are pinned here,
 * per executer and with the answer each one gives, instead of being skipped in the suites whose
 * rules have to hold everywhere. The other files rely on that - they loop over the executers and
 * ask for a context value through `variableName`, which only makes sense because the table below
 * says what each executer's answer is.
 */

/**
 * What each executer answers to the three freedoms of 8.3.
 *
 * `reachesGlobals` - whether a name that no link carries resolves against the global object.
 * `assignmentLandsInContext` - whether an assignment to a key the context carries is readable
 * from the context afterwards. 6.5 promises nothing here beyond the negative guarantee, so this
 * is a description of the implementation, not a rule other executers have to follow.
 */
const FREEDOMS = {
	[WithScopedExecuterName]: { reachesGlobals: true, assignmentLandsInContext: true },
	[ContextObjectExecuterName]: { reachesGlobals: true, assignmentLandsInContext: true },
	[ContextDeconstructorExecuterName]: { reachesGlobals: true, assignmentLandsInContext: false },
	[EsprimaExecuterName]: { reachesGlobals: false, assignmentLandsInContext: false }
};

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

	// not implemented, waits for BACKLOG.md "The default executer announces itself as deprecated"
	it.fails("uses context-deconstruction-executer as the default", async () => {
		expect(ExpressionResolver.defaultExecuter === getExecuter(ContextDeconstructorExecuterName)).toBe(true);
	});

	it("cannot execute an assignment under esprima-executer", async () => {
		const resolver = new ExpressionResolver({ context: { known: 1 }, name: "root", executer: EsprimaExecuterName });
		// the assignment raises, so per 7 the expression stands as written and the default does not
		// cover it
		const result = await resolver.resolveText("${ x = 5 }", "fallback");
		expect(result).toBe("${ x = 5 }");
	});
});

for (const { name: executer, variableName } of EXECUTERS) {

	describe(`Specification 8.3 - what this executer decides for itself [${executer}]`, () => {

		const { reachesGlobals, assignmentLandsInContext } = FREEDOMS[executer];

		it("addresses a context value the way its own dialect spells it", async () => {
			const variableNameValue = variableName("value");
			const resolver = new ExpressionResolver({ context: { value: "from context" }, name: "root", executer });
			const result = await resolver.resolve(`\${${variableNameValue}}`, "fallback");
			expect(result).toBe("from context");
		});

		it(`${reachesGlobals ? "reaches" : "does not reach"} a global that no link carries`, async () => {
			const resolver = new ExpressionResolver({ context: { known: 1 }, name: "root", executer });
			// where the executer does not reach the global, the statement raises on it and per 7 the
			// expression stands as written - the default does not cover an error
			const result = await resolver.resolveText("${ Math.round(1.5) }", "no global");
			expect(result).toBe(reachesGlobals ? "2" : "${ Math.round(1.5) }");
		});

		it(`an assignment to a key the context carries ${assignmentLandsInContext ? "lands there" : "does not land there"}`, async () => {
			const variableNameKnown = variableName("known");
			const resolver = new ExpressionResolver({ context: { known: "before" }, name: "root", executer });
			await resolver.resolveText(`\${${variableNameKnown} = "after"}`);
			expect(resolver.getData("known")).toBe(assignmentLandsInContext ? "after" : "before");
		});
	});
}

describe("Specification 8.3 - only context-object-executer demands the ctx prefix", () => {

	it("does not answer a bare context name under context-object-executer", async () => {
		const resolver = new ExpressionResolver({ context: { value: "from context" }, name: "root", executer: ContextObjectExecuterName });
		// through resolveText, because a bare name is a ReferenceError under this executer and
		// resolve lets that through (7) - what is pinned here is the dialect, not the error policy.
		// The expression stands as written, which is what a failing statement does in a text.
		const result = await resolver.resolveText("${ value }", "fallback");
		expect(result).toBe("${ value }");
	});

	for (const name of [WithScopedExecuterName, ContextDeconstructorExecuterName, EsprimaExecuterName]) {
		it(`answers a bare context name under ${name}`, async () => {
			const resolver = new ExpressionResolver({ context: { value: "from context" }, name: "root", executer: name });
			const result = await resolver.resolve("${ value }", "fallback");
			expect(result).toBe("from context");
		});
	}
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
