import { describe, it, expectTypeOf } from "vitest";
import Executer from "../../../src/Executer.js";
import executer, { EXECUTERNAME, setupExecuter, getContextVar } from "../../../src/executer/ContextObjectExecuter.js";

/**
 * ContextObjectExecuter - the interface, as declared. SPECIFICATION.md 8, 9.3.
 *
 * The type declarations of what the module exports, beside its runtime interface in
 * interface.Test.js. Checked by tsc, never run; test/package/declarations.Test-d.ts says how.
 */

describe("ContextObjectExecuter - the interface, as declared", () => {

	it("declares EXECUTERNAME as its name", () => {
		expectTypeOf<typeof EXECUTERNAME>().toEqualTypeOf<"context-object-executer">();
	});

	it("setupExecuter takes no options", () => {
		expectTypeOf(setupExecuter).toBeCallableWith();
	});

	it("setupExecuter takes the size and the name of the context", () => {
		expectTypeOf(setupExecuter).toBeCallableWith({ size: 10, contextVar: "data" });
	});

	it("setupExecuter takes null for the name of the context", () => {
		expectTypeOf(setupExecuter).toBeCallableWith({ contextVar: null });
	});

	it("getContextVar answers a string", () => {
		expectTypeOf(getContextVar()).toEqualTypeOf<string>();
	});

	it("declares the executer as its default export", () => {
		expectTypeOf(executer).toEqualTypeOf<Executer>();
	});
});
