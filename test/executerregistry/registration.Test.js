import { describe, it, expect } from "vitest";
import Executer from "../../src/Executer.js";
import getExecuter, { register, getExecuter as namedGetExecuter } from "../../src/ExecuterRegistry.js";

/**
 * ExecuterRegistry - keeping an implementation under a name. SPECIFICATION.md 9.1.
 *
 * That each executer module registers itself on import is `test/executer/interface.Test.js`.
 */

describe("ExecuterRegistry - registration", () => {

	it("keeps an implementation under a name and answers it again", async () => {
		const own = new Executer({ execution: () => "from own executer" });
		register("conformance-probe-executer", own);
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
