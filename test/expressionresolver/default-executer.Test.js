import { describe, it, expect, afterAll } from "vitest";
import { ExpressionResolver } from "../../index.js";
import Executer from "../../src/Executer.js";
import getExecuter from "../../src/ExecuterRegistry.js";
import * as ContextObjectModule from "../../src/executer/ContextObjectExecuter.js";
import * as ContextDeconstructorModule from "../../src/executer/ContextDeconstructorExecuter.js";

/**
 * ExpressionResolver - the default executer. SPECIFICATION.md 9.1, 9.2.
 *
 * Which implementation the resolver uses when the caller names none, and what the switch
 * `ExpressionResolver.defaultExecuter` takes.
 */

const ContextObjectExecuterName = ContextObjectModule.EXECUTERNAME;
const ContextDeconstructorExecuterName = ContextDeconstructorModule.EXECUTERNAME;

describe("ExpressionResolver - which implementation is the default", () => {

	it("uses context-deconstruction-executer as the default", async () => {
		expect(ExpressionResolver.defaultExecuter === getExecuter(ContextDeconstructorExecuterName)).toBe(true);
	});
});

describe("ExpressionResolver - the default executer switch", () => {

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
		const own = new Executer({ execution: () => "from own executer" });
		ExpressionResolver.defaultExecuter = own;
		expect(ExpressionResolver.defaultExecuter === own).toBe(true);
		ExpressionResolver.defaultExecuter = reset;
	});
});
