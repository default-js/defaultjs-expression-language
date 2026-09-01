import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";
import getExecuter from "../../src/ExecuterRegistry.js";
import * as ContextDeconstructorModule from "../../src/executer/ContextDeconstructorExecuter.js";

/**
 * SPECIFICATION.md 8.2 - which implementation the resolver uses when the caller names none.
 *
 * The two halves of 8.2 that belong to the implementations - that each registers itself on
 * import, and what each can execute - are asked of all four in `test/executer/rules/`, against
 * the matrix. What is left here is a property of the resolver: which one it defaults to.
 */

const ContextDeconstructorExecuterName = ContextDeconstructorModule.EXECUTERNAME;

describe("Specification 8.2 - the implementations", () => {

	it("uses context-deconstruction-executer as the default", async () => {
		expect(ExpressionResolver.defaultExecuter === getExecuter(ContextDeconstructorExecuterName)).toBe(true);
	});
});
