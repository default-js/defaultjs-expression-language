import { describe, it, expect, afterAll } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { EXECUTERS } from "../ExecuterCapabilities.js";
import Executer from "../../src/Executer.js";
import getExecuter, { registrate, getExecuter as namedGetExecuter } from "../../src/ExecuterRegistry.js";
import * as ContextDeconstructorModule from "../../src/executer/ContextDeconstructorExecuter.js";

/**
 * SPECIFICATION.md 8.2 - that every implementation registers itself on import, and which one is the
 * default.
 *
 * What an implementation can execute is the other half of 8.2 and a row of the capability
 * catalogue. This half loops over the executers although it runs in the general suite - see
 * BACKLOG.md, "Two rules run per executer but sit in the general suite".
 */

const ContextDeconstructorExecuterName = ContextDeconstructorModule.EXECUTERNAME;

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
