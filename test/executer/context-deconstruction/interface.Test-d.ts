import { describe, it, expectTypeOf } from "vitest";
import Executer from "../../../src/Executer.js";
import executer, { EXECUTERNAME, setupExecuter, setDebug } from "../../../src/executer/ContextDeconstructorExecuter.js";

/**
 * ContextDeconstructorExecuter - the interface, as declared. SPECIFICATION.md 8, 9.3.
 *
 * The type declarations of what the module exports, beside its runtime interface in
 * interface.Test.js. Checked by tsc, never run; test/package/declarations.Test-d.ts says how.
 */

describe("ContextDeconstructorExecuter - the interface, as declared", () => {

	it("declares EXECUTERNAME as its name", () => {
		expectTypeOf<typeof EXECUTERNAME>().toEqualTypeOf<"context-deconstruction-executer">();
	});

	it("setupExecuter takes no options", () => {
		expectTypeOf(setupExecuter).toBeCallableWith();
	});

	it("setupExecuter takes the size", () => {
		expectTypeOf(setupExecuter).toBeCallableWith({ size: 10 });
	});

	it("setDebug takes a boolean", () => {
		expectTypeOf(setDebug).toEqualTypeOf<(value: boolean) => void>();
	});

	it("declares the executer as its default export", () => {
		expectTypeOf(executer).toEqualTypeOf<Executer>();
	});
});
