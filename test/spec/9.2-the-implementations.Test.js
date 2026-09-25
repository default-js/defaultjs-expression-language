import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";
import getExecuter from "../../src/ExecuterRegistry.js";
import * as ContextDeconstructorModule from "../../src/executer/ContextDeconstructorExecuter.js";

/**
 * SPECIFICATION.md 9.2 - which implementation the resolver uses when the caller names none.
 *
 * That each implementation registers itself on import is `test/executer/interface.Test.js`, what
 * each can execute is tested with that executer. What is here is a property of the resolver: which
 * one it defaults to.
 */

const ContextDeconstructorExecuterName = ContextDeconstructorModule.EXECUTERNAME;

describe("Specification 9.2 - the implementations", () => {

	it("uses context-deconstruction-executer as the default", async () => {
		expect(ExpressionResolver.defaultExecuter === getExecuter(ContextDeconstructorExecuterName)).toBe(true);
	});
});
