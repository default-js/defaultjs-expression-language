import { describe, it, expect } from "vitest";
import getExecuter from "../../src/ExecuterRegistry.js";
import * as WithScopedModule from "../../src/executer/WithScopedExecuter.js";
import * as ContextObjectModule from "../../src/executer/ContextObjectExecuter.js";
import * as ContextDeconstructorModule from "../../src/executer/ContextDeconstructorExecuter.js";
import * as EsprimaModule from "../../src/executer/EsprimaExecuter.js";

/**
 * The one thing every executer shares: the interface (SPECIFICATION.md 9.1, 9.2).
 *
 * Nothing else is asked of all four. Every executer is a solution of its own, and what it can do is
 * tested in its own directory beside this file, against its own guarantees. What its module exports
 * is part of the public surface and pinned in `test/spec/8-the-public-surface.Test.js`, that it is an
 * `Executer` among it; what is left here is that importing the module registers the executer it
 * exports, under the name it exports.
 */

const MODULES = [WithScopedModule, ContextObjectModule, ContextDeconstructorModule, EsprimaModule];

for (const module of MODULES) {

	describe(`The executer interface [${module.EXECUTERNAME}]`, () => {

		it("registers the executer it exports under its name on import", async () => {
			expect(getExecuter(module.EXECUTERNAME) === module.default).toBe(true);
		});
	});
}
