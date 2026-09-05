import { describe, it, expect } from "vitest";
import { EXECUTERS } from "../../ExecuterCapabilities.js";
import Executer from "../../../src/Executer.js";
import getExecuter from "../../../src/ExecuterRegistry.js";

/**
 * SPECIFICATION.md 8.2 - that each implementation registers itself on import, asked of every
 * executer.
 *
 * Which implementation is the default is a property of the resolver and is pinned once, in
 * `test/spec/`. That each one registers itself is a property of the implementation, and it needs no
 * statement to see.
 *
 * **Not a capability, so no row and no state** (2026-09-05): registering is part of the interface
 * contract, and an implementation that fails it is not an executer. That is not a yes/no axis, so it
 * runs as a plain `it`. What an implementation can *execute* moved to the capability catalogue -
 * `syntax` for the assignment this file used to carry.
 */

for (const { name: executer } of EXECUTERS) {

	describe(`Specification 8.2 - the implementation registers itself [${executer}]`, () => {

		it("registers itself on import of its module", async () => {
			expect(getExecuter(executer) instanceof Executer).toBe(true);
		});
	});
}
