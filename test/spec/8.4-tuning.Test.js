import { describe, it, expect, afterAll } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { EXECUTERS } from "../ExecuterCapabilities.js";
import * as WithScopedModule from "../../src/executer/WithScopedExecuter.js";
import * as ContextObjectModule from "../../src/executer/ContextObjectExecuter.js";
import * as ContextDeconstructorModule from "../../src/executer/ContextDeconstructorExecuter.js";
import * as EsprimaModule from "../../src/executer/EsprimaExecuter.js";

/**
 * SPECIFICATION.md 8.4 - setupExecuter and the code cache of each implementation.
 *
 * Only that the option is accepted and that resolution survives it: whether an expression was
 * served from the cache or compiled again cannot be told apart from the outside. Loops over the
 * executers although it runs in the general suite - see BACKLOG.md.
 */

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
