import { describe, it, expect } from "vitest";
import Executer from "../../../src/Executer.js";
import getExecuter from "../../../src/ExecuterRegistry.js";
import executer, { EXECUTERNAME, setupExecuter } from "../../../src/executer/ContextDeconstructorExecuter.js";

/**
 * ContextDeconstructorExecuter - the interface. SPECIFICATION.md 8, 9.1, 9.2.
 *
 * What the module exports, and that importing it registers the executer it exports under the name
 * it exports. Asked here rather than in a list of every executer, so a new executer brings the
 * question along with its own directory instead of having to be entered somewhere else.
 */

describe("ContextDeconstructorExecuter - the interface", () => {

	it("registers the executer it exports under its name on import", async () => {
		expect(getExecuter(EXECUTERNAME) === executer).toBe(true);
	});

	it("exports EXECUTERNAME", async () => {
		expect(typeof EXECUTERNAME).toBe("string");
	});

	it("exports setupExecuter", async () => {
		expect(typeof setupExecuter).toBe("function");
	});

	it("exports the executer as its default export", async () => {
		expect(executer instanceof Executer).toBe(true);
	});
});
